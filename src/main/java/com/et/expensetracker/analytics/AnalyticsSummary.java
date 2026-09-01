package com.et.expensetracker.analytics;

import java.math.BigDecimal;

public class AnalyticsSummary {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private long transactionCount;
    private BigDecimal previousSavings;
    private BigDecimal totalSavings;

    public AnalyticsSummary() {
    }

    public AnalyticsSummary(
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal balance,
            long transactionCount,
            BigDecimal previousSavings,
            BigDecimal totalSavings) {

        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.balance = balance;
        this.transactionCount = transactionCount;
        this.previousSavings = previousSavings;
        this.totalSavings = totalSavings;
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

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }

    public BigDecimal getPreviousSavings() {
        return previousSavings;
    }

    public void setPreviousSavings(BigDecimal previousSavings) {
        this.previousSavings = previousSavings;
    }

    public BigDecimal getTotalSavings() {
        return totalSavings;
    }

    public void setTotalSavings(BigDecimal totalSavings) {
        this.totalSavings = totalSavings;
    }
}