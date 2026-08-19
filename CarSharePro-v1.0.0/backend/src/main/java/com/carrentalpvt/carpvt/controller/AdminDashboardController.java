package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.AdminDashboardResponse;
import com.carrentalpvt.carpvt.service.AdminDashboardService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public AdminDashboardResponse getDashboardAnalytics() {
        return adminDashboardService.getDashboardAnalytics();
    }
}
