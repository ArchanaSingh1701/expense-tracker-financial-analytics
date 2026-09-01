package com.et.expensetracker.analytics;

import java.math.BigDecimal;

public class CategoryAnalytics {

    private String categoryName;
    private BigDecimal totalAmount;

    public CategoryAnalytics() {
    }

    public CategoryAnalytics(
            String categoryName,
            BigDecimal totalAmount) {

        this.categoryName = categoryName;
        this.totalAmount = totalAmount;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}