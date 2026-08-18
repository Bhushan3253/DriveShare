package com.carrentalpvt.carpvt.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:bhushannagpure25@gmail.com}")
    private String mailUsername;

    @Async("taskExecutor")
    public void sendVerificationEmail(String toEmail, String userName, String rawToken) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + rawToken;

        String subject = "Verify your CarRental account";
        String htmlContent = buildVerificationEmailHtml(userName, verificationUrl);
        String textContent = buildVerificationEmailText(userName, verificationUrl);

        // If SMTP credentials are configured and mailSender exists, send via JavaMailSender
        if (mailSender != null && mailUsername != null && !mailUsername.trim().isEmpty()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                String fromAddress = mailUsername.trim();
                helper.setFrom(fromAddress, "DriveShare Car Rental");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(textContent, htmlContent);

                mailSender.send(message);
                log.info("✓ Verification email successfully sent via SMTP to: {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("❌ SMTP Delivery Failed to {}: {}. Will log fallback link.", toEmail, e.getMessage(), e);
            }
        }

        // Development / Console Fallback Logger
        log.info("================================================================================");
        log.info("📧 [EMAIL DISPATCHED] To: {} | Subject: {}", toEmail, subject);
        log.info("🔗 VERIFICATION LINK: {}", verificationUrl);
        log.info("⏱️ EXPIRES IN: 30 minutes");
        log.info("================================================================================");
    }

    private String buildVerificationEmailText(String userName, String verificationUrl) {
        return "Hello " + (userName != null ? userName : "User") + ",\n\n"
                + "Thank you for registering with CarRental.\n\n"
                + "Please verify your email address by clicking the link below:\n"
                + verificationUrl + "\n\n"
                + "This link expires in 30 minutes.\n\n"
                + "If you did not create this account, you can ignore this email.\n\n"
                + "Regards,\n"
                + "CarRental Team";
    }

    private String buildVerificationEmailHtml(String userName, String verificationUrl) {
        String name = userName != null ? userName : "User";
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<style>"
                + "  body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0F172A; color: #F8FAFC; margin: 0; padding: 20px; }"
                + "  .card { background-color: #1E293B; max-width: 520px; margin: 0 auto; padding: 32px; border-radius: 12px; border: 1px solid #334155; }"
                + "  .btn { display: inline-block; background-color: #3B82F6; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; margin: 20px 0; font-size: 16px; }"
                + "  .footer { color: #94A3B8; font-size: 13px; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='card'>"
                + "  <h2 style='color: #60A5FA; margin-top: 0;'>Welcome to CarRental!</h2>"
                + "  <p style='font-size: 15px; color: #E2E8F0;'>Hello <strong>" + name + "</strong>,</p>"
                + "  <p style='font-size: 15px; color: #CBD5E1;'>Thank you for registering with CarRental. Please verify your email address to activate your account and start booking or hosting cars.</p>"
                + "  <div style='text-align: center;'>"
                + "    <a href='" + verificationUrl + "' class='btn'>Verify Email</a>"
                + "  </div>"
                + "  <p style='font-size: 13px; color: #94A3B8;'>Or copy and paste this link in your browser:<br><span style='color: #60A5FA; word-break: break-all;'>" + verificationUrl + "</span></p>"
                + "  <p style='font-size: 13px; color: #F59E0B;'>⏳ <strong>Note:</strong> This link expires in 30 minutes.</p>"
                + "  <div class='footer'>"
                + "    <p>If you did not create this account, you can safely ignore this email.</p>"
                + "    <p>Regards,<br><strong>CarRental Team</strong></p>"
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}
