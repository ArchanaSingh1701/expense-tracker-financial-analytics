package com.et.expensetracker.analytics;

import com.et.expensetracker.entity.Transaction;
import com.et.expensetracker.entity.TransactionType;
import com.et.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public AnalyticsService(
            TransactionRepository transactionRepository) {

        this.transactionRepository = transactionRepository;
    }


    // =========================================================
    // OVERALL SUMMARY
    // =========================================================

    public AnalyticsSummary getSummary() {

        List<Transaction> transactions =
                transactionRepository.findAll();

        BigDecimal totalIncome =
                calculateIncome(transactions);

        BigDecimal totalExpenses =
                calculateExpenses(transactions);

        BigDecimal balance =
                totalIncome.subtract(totalExpenses);

        BigDecimal totalSavings =
                calculateTotalSavings(transactions);

        return new AnalyticsSummary(
                totalIncome,
                totalExpenses,
                balance,
                transactions.size(),
                BigDecimal.ZERO,
                totalSavings
        );
    }


    // =========================================================
    // MONTHLY SUMMARY
    // =========================================================

    public AnalyticsSummary getSummary(String month) {

        YearMonth selectedMonth =
                parseMonth(month);

        List<Transaction> allTransactions =
                transactionRepository.findAll();

        List<Transaction> selectedMonthTransactions =
                allTransactions.stream()
                        .filter(transaction ->
                                transaction.getTransactionDate() != null)
                        .filter(transaction ->
                                YearMonth.from(
                                        transaction.getTransactionDate())
                                        .equals(selectedMonth))
                        .toList();


        // -----------------------------------------------------
        // INCOME FOR SELECTED MONTH
        // -----------------------------------------------------

        BigDecimal totalIncome =
                calculateIncome(
                        selectedMonthTransactions
                );


        // -----------------------------------------------------
        // EXPENSES FOR SELECTED MONTH
        // -----------------------------------------------------

        BigDecimal totalExpenses =
                calculateExpenses(
                        selectedMonthTransactions
                );


        // -----------------------------------------------------
        // BALANCE FOR SELECTED MONTH
        //
        // IMPORTANT:
        // Balance means:
        //
        // Current Month Income
        // - Current Month Expenses
        //
        // Previous savings are NOT added to monthly balance.
        // -----------------------------------------------------

        BigDecimal balance =
                totalIncome.subtract(totalExpenses);


        // -----------------------------------------------------
        // SAVINGS FROM PREVIOUS MONTHS
        //
        // We calculate accumulated savings from all months
        // BEFORE the selected month.
        // -----------------------------------------------------

        BigDecimal previousSavings =
                calculateSavingsBeforeMonth(
                        allTransactions,
                        selectedMonth
                );


        // -----------------------------------------------------
        // CURRENT MONTH SAVING
        //
        // If income is 0, no new saving is created.
        //
        // If income > expenses:
        //
        // saving = income - expenses
        // -----------------------------------------------------

        BigDecimal currentMonthSaving =
                balance.compareTo(BigDecimal.ZERO) > 0
                        ? balance
                        : BigDecimal.ZERO;


        // -----------------------------------------------------
        // TOTAL SAVINGS
        //
        // Previous savings + current month's remaining money
        // -----------------------------------------------------

        BigDecimal totalSavings =
                previousSavings.add(
                        currentMonthSaving
                );


        return new AnalyticsSummary(
                totalIncome,
                totalExpenses,
                balance,
                selectedMonthTransactions.size(),
                previousSavings,
                totalSavings
        );
    }


    // =========================================================
    // EXPENSES BY CATEGORY - ALL DATA
    // =========================================================

    public List<CategoryAnalytics> getExpensesByCategory() {

        List<Transaction> expenses =
                transactionRepository.findAll()
                        .stream()
                        .filter(transaction ->
                                transaction.getType()
                                        == TransactionType.EXPENSE)
                        .toList();

        return buildCategoryAnalytics(expenses);
    }


    // =========================================================
    // EXPENSES BY CATEGORY - SELECTED MONTH
    // =========================================================

    public List<CategoryAnalytics>
    getExpensesByCategoryForMonth(String month) {

        YearMonth selectedMonth =
                parseMonth(month);

        List<Transaction> expenses =
                transactionRepository.findAll()
                        .stream()
                        .filter(transaction ->
                                transaction.getType()
                                        == TransactionType.EXPENSE)
                        .filter(transaction ->
                                transaction.getTransactionDate() != null)
                        .filter(transaction ->
                                YearMonth.from(
                                        transaction.getTransactionDate())
                                        .equals(selectedMonth))
                        .toList();

        return buildCategoryAnalytics(expenses);
    }


    // =========================================================
    // BUILD CATEGORY ANALYTICS
    // =========================================================

    private List<CategoryAnalytics>
    buildCategoryAnalytics(
            List<Transaction> expenses) {

        Map<String, BigDecimal> categoryTotals =
                expenses.stream()
                        .filter(transaction ->
                                transaction.getCategory() != null)
                        .collect(
                                Collectors.groupingBy(
                                        transaction ->
                                                transaction.getCategory()
                                                        .getName(),

                                        Collectors.reducing(
                                                BigDecimal.ZERO,
                                                Transaction::getAmount,
                                                BigDecimal::add
                                        )
                                )
                        );


        return categoryTotals.entrySet()
                .stream()
                .sorted(
                        Map.Entry
                                .<String, BigDecimal>comparingByValue()
                                .reversed()
                )
                .map(entry ->
                        new CategoryAnalytics(
                                entry.getKey(),
                                entry.getValue()
                        )
                )
                .toList();
    }


    // =========================================================
    // MONTHLY ANALYTICS
    // =========================================================

    public List<MonthlyAnalytics>
    getMonthlyAnalytics() {

        List<Transaction> transactions =
                transactionRepository.findAll();

        Map<YearMonth, List<Transaction>>
                monthlyTransactions =
                transactions.stream()
                        .filter(transaction ->
                                transaction.getTransactionDate() != null)
                        .collect(
                                Collectors.groupingBy(
                                        transaction ->
                                                YearMonth.from(
                                                        transaction
                                                                .getTransactionDate()
                                                )
                                )
                        );


        return monthlyTransactions.entrySet()
                .stream()
                .sorted(
                        Map.Entry.comparingByKey()
                )
                .map(entry -> {

                    YearMonth yearMonth =
                            entry.getKey();

                    List<Transaction> monthTransactions =
                            entry.getValue();


                    BigDecimal totalIncome =
                            calculateIncome(
                                    monthTransactions
                            );


                    BigDecimal totalExpenses =
                            calculateExpenses(
                                    monthTransactions
                            );


                    return new MonthlyAnalytics(
                            yearMonth.toString(),
                            totalIncome,
                            totalExpenses
                    );
                })
                .toList();
    }


    // =========================================================
    // CALCULATE INCOME
    // =========================================================

    private BigDecimal calculateIncome(
            List<Transaction> transactions) {

        return transactions.stream()
                .filter(transaction ->
                        transaction.getType()
                                == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .filter(amount -> amount != null)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }


    // =========================================================
    // CALCULATE EXPENSES
    // =========================================================

    private BigDecimal calculateExpenses(
            List<Transaction> transactions) {

        return transactions.stream()
                .filter(transaction ->
                        transaction.getType()
                                == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .filter(amount -> amount != null)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }


    // =========================================================
    // CALCULATE SAVINGS BEFORE SELECTED MONTH
    // =========================================================

    private BigDecimal calculateSavingsBeforeMonth(
            List<Transaction> transactions,
            YearMonth selectedMonth) {

        Map<YearMonth, List<Transaction>>
                monthlyTransactions =
                transactions.stream()
                        .filter(transaction ->
                                transaction.getTransactionDate() != null)
                        .filter(transaction ->
                                YearMonth.from(
                                        transaction.getTransactionDate())
                                        .isBefore(selectedMonth))
                        .collect(
                                Collectors.groupingBy(
                                        transaction ->
                                                YearMonth.from(
                                                        transaction
                                                                .getTransactionDate()
                                                )
                                )
                        );


        BigDecimal savings =
                BigDecimal.ZERO;


        List<YearMonth> months =
                new ArrayList<>(
                        monthlyTransactions.keySet()
                );


        months.sort(
                Comparator.naturalOrder()
        );


        for (YearMonth month : months) {

            List<Transaction> monthTransactions =
                    monthlyTransactions.get(month);


            BigDecimal income =
                    calculateIncome(
                            monthTransactions
                    );


            BigDecimal expenses =
                    calculateExpenses(
                            monthTransactions
                    );


            BigDecimal remaining =
                    income.subtract(expenses);


            if (remaining.compareTo(
                    BigDecimal.ZERO) > 0) {

                savings =
                        savings.add(
                                remaining
                        );
            }
        }


        return savings;
    }


    // =========================================================
    // CALCULATE TOTAL SAVINGS
    // =========================================================

    private BigDecimal calculateTotalSavings(
            List<Transaction> transactions) {

        Map<YearMonth, List<Transaction>>
                monthlyTransactions =
                transactions.stream()
                        .filter(transaction ->
                                transaction.getTransactionDate() != null)
                        .collect(
                                Collectors.groupingBy(
                                        transaction ->
                                                YearMonth.from(
                                                        transaction
                                                                .getTransactionDate()
                                                )
                                )
                        );


        BigDecimal savings =
                BigDecimal.ZERO;


        List<YearMonth> months =
                new ArrayList<>(
                        monthlyTransactions.keySet()
                );


        months.sort(
                Comparator.naturalOrder()
        );


        for (YearMonth month : months) {

            List<Transaction> monthTransactions =
                    monthlyTransactions.get(month);


            BigDecimal income =
                    calculateIncome(
                            monthTransactions
                    );


            BigDecimal expenses =
                    calculateExpenses(
                            monthTransactions
                    );


            BigDecimal remaining =
                    income.subtract(expenses);


            if (remaining.compareTo(
                    BigDecimal.ZERO) > 0) {

                savings =
                        savings.add(
                                remaining
                        );
            }
        }


        return savings;
    }


    // =========================================================
    // PARSE MONTH
    // =========================================================

    private YearMonth parseMonth(String month) {

        if (month == null || month.isBlank()) {

            return YearMonth.now();
        }


        try {

            return YearMonth.parse(month);

        } catch (Exception exception) {

            throw new IllegalArgumentException(
                    "Invalid month format. Use YYYY-MM."
            );
        }
    }
}