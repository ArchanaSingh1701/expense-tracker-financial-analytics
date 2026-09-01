package com.et.expensetracker.analytics;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // =========================================================
    // OVERALL SUMMARY
    // =========================================================

    @GetMapping("/summary")
    public AnalyticsSummary getSummary(
            @RequestParam(required = false) String month) {

        if (month == null || month.isBlank()) {
            return analyticsService.getSummary();
        }

        return analyticsService.getSummary(month);
    }


    // =========================================================
    // EXPENSES BY CATEGORY
    // =========================================================

    @GetMapping("/expenses-by-category")
    public List<CategoryAnalytics> getExpensesByCategory(
            @RequestParam(required = false) String month) {

        if (month == null || month.isBlank()) {
            return analyticsService.getExpensesByCategory();
        }

        return analyticsService.getExpensesByCategoryForMonth(month);
    }


    // =========================================================
    // MONTHLY ANALYTICS
    // =========================================================

    @GetMapping("/monthly")
    public List<MonthlyAnalytics> getMonthlyAnalytics() {

        return analyticsService.getMonthlyAnalytics();
    }
}