package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.AdminDashboardResponse;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarRepository;
import com.carrentalpvt.carpvt.repository.PaymentRepository;
import com.carrentalpvt.carpvt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UPIPaymentService upiPaymentService;
    private final CarService carService;

    public AdminService(
            UserRepository userRepository,
            CarRepository carRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            UPIPaymentService upiPaymentService,
            CarService carService) {

        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.upiPaymentService = upiPaymentService;
        this.carService = carService;
    }

    public AdminDashboardResponse getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalCarOwners = userRepository.countByCarOwner(true);

        List<Car> allCars = carRepository.findAll();
        long totalCars = allCars.size();
        long pendingCars = allCars.stream().filter(c -> "PENDING".equals(c.getStatus())).count();
        long approvedCars = allCars.stream().filter(c -> "APPROVED".equals(c.getStatus())).count();

        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long activeBookings = allBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus())
                        || "CHECKED_IN".equals(b.getStatus())
                        || "IN_PROGRESS".equals(b.getStatus()))
                .count();
        long completedBookings = allBookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .count();

        List<Payment> allPayments = paymentRepository.findAll();
        long pendingPayments = allPayments.stream()
                .filter(p -> "PENDING_VERIFICATION".equals(p.getStatus()))
                .count();
        long verifiedPayments = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .count();
        long rejectedPayments = allPayments.stream()
                .filter(p -> "REJECTED".equals(p.getStatus()))
                .count();

        double totalBookingValue = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double platformCommission = totalBookingValue * 0.15;
        double ownerEarnings = totalBookingValue - platformCommission;

        List<Payment> recentPendingPayments = paymentRepository.findByStatus("PENDING_VERIFICATION");

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCarOwners(totalCarOwners)
                .totalCars(totalCars)
                .pendingCars(pendingCars)
                .approvedCars(approvedCars)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .pendingPayments(pendingPayments)
                .verifiedPayments(verifiedPayments)
                .rejectedPayments(rejectedPayments)
                .totalBookingValue(totalBookingValue)
                .platformCommission(platformCommission)
                .ownerEarnings(ownerEarnings)
                .recentPendingPayments(recentPendingPayments)
                .recentBookings(allBookings)
                .build();
    }

    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatus("PENDING_VERIFICATION");
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment verifyPayment(String paymentId, String adminId) {
        return upiPaymentService.verifyPayment(paymentId, adminId);
    }

    public Payment rejectPayment(String paymentId, String adminId, String reason) {
        return upiPaymentService.rejectPayment(paymentId, adminId, reason);
    }

    public Car approveCar(String carId) {
        return carService.approveCar(carId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }
}
