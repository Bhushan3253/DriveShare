package com.carrentalpvt.carpvt.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:bhushannagpure25@gmail.com}")
    private String brevoSenderEmail;

    @Value("${brevo.sender.name:DriveShare Car Rental}")
    private String brevoSenderName;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from:DriveShare <onboarding@resend.dev>}")
    private String resendFrom;

    @Value("${spring.mail.username:bhushannagpure25@gmail.com}")
    private String mailUsername;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async("taskExecutor")
    public void sendVerificationEmail(String toEmail, String userName, String rawToken) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + rawToken;

        String subject = "Verify your CarRental account";
        String htmlContent = buildVerificationEmailHtml(userName, verificationUrl);
        String textContent = buildVerificationEmailText(userName, verificationUrl);

        // 1. First Priority: Send via Brevo HTTP REST API (Sends to ANY recipient on web, works 100% on Render Cloud)
        if (brevoApiKey != null && !brevoApiKey.trim().isEmpty()) {
            boolean sent = sendViaBrevo(toEmail, userName, subject, htmlContent, textContent);
            if (sent) {
                return;
            }
        }

        // 2. Second Priority: Send via Resend HTTP REST API
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            boolean sent = sendViaResend(toEmail, subject, htmlContent, textContent);
            if (sent) {
                return;
            }
        }

        // 2. Second Priority: Send via JavaMailSender SMTP (if local / unblocked)
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
                log.warn("⚠️ SMTP Delivery Failed to {}: {}. Falling back to console link.", toEmail, e.getMessage());
            }
        }

        // 3. Fallback: Console Logger for Diagnostics
        log.info("================================================================================");
        log.info("📧 [EMAIL DISPATCHED] To: {} | Subject: {}", toEmail, subject);
        log.info("🔗 VERIFICATION LINK: {}", verificationUrl);
        log.info("⏱️ EXPIRES IN: 30 minutes");
        log.info("================================================================================");
    }

    private boolean sendViaBrevo(String toEmail, String userName, String subject, String htmlContent, String textContent) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", brevoSenderName, "email", brevoSenderEmail),
                    "to", List.of(Map.of("email", toEmail, "name", userName != null ? userName : "User")),
                    "subject", subject,
                    "htmlContent", htmlContent,
                    "textContent", textContent
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✓ Verification email successfully delivered via Brevo HTTP API (Port 443) to: {}", toEmail);
                return true;
            } else {
                log.warn("⚠️ Brevo HTTP API responded with status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("❌ Brevo API delivery error to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendViaResend(String toEmail, String subject, String htmlContent, String textContent) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            Map<String, Object> payload = Map.of(
                    "from", resendFrom,
                    "to", List.of(toEmail),
                    "subject", subject,
                    "html", htmlContent,
                    "text", textContent
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✓ Verification email successfully delivered via Resend HTTP API to: {}", toEmail);
                return true;
            } else {
                log.warn("⚠️ Resend HTTP API responded with status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("❌ Resend API delivery error to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
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
