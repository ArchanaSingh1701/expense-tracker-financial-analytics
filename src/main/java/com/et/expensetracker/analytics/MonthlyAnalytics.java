package com.et.expensetracker.analytics;

import java.math.BigDecimal;

public class MonthlyAnalytics {

    private String month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;

    public MonthlyAnalytics() {
    }

    public MonthlyAnalytics(
            String month,
            BigDecimal totalIncome,
            BigDecimal totalExpenses) {

        this.month = month;
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }
}