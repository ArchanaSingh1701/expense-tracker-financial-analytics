package com.et.expensetracker.service;

import com.et.expensetracker.entity.Category;
import com.et.expensetracker.entity.Transaction;
import com.et.expensetracker.repository.CategoryRepository;
import com.et.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository) {

        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================

    public List<Transaction> getAllTransactions() {

        return transactionRepository.findAll();
    }


    // =========================================================
    // GET TRANSACTIONS BY MONTH
    // =========================================================

    public List<Transaction> getTransactionsByMonth(String month) {

        YearMonth selectedMonth;

        try {

            selectedMonth = YearMonth.parse(month);

        } catch (Exception exception) {

            throw new IllegalArgumentException(
                    "Invalid month format. Use YYYY-MM"
            );
        }

        LocalDate startDate =
                selectedMonth.atDay(1);

        LocalDate endDate =
                selectedMonth.atEndOfMonth();

        return transactionRepository
                .findByTransactionDateBetween(
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    public Transaction getTransactionById(Long id) {

        return transactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Transaction not found"
                        ));
    }


    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    public Transaction createTransaction(
            Transaction transaction) {

        validateCategory(transaction);

        return transactionRepository.save(transaction);
    }


    // =========================================================
    // UPDATE TRANSACTION
    // =========================================================

    public Transaction updateTransaction(
            Long id,
            Transaction updatedTransaction) {

        Transaction existingTransaction =
                getTransactionById(id);

        validateCategory(updatedTransaction);

        existingTransaction.setAmount(
                updatedTransaction.getAmount()
        );

        existingTransaction.setType(
                updatedTransaction.getType()
        );

        existingTransaction.setDescription(
                updatedTransaction.getDescription()
        );

        existingTransaction.setTransactionDate(
                updatedTransaction.getTransactionDate()
        );

        existingTransaction.setCategory(
                updatedTransaction.getCategory()
        );

        return transactionRepository.save(
                existingTransaction
        );
    }


    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    public void deleteTransaction(Long id) {

        Transaction transaction =
                getTransactionById(id);

        transactionRepository.delete(transaction);
    }


    // =========================================================
    // CATEGORY VALIDATION
    // =========================================================

    private void validateCategory(
            Transaction transaction) {

        if (transaction.getCategory() == null ||
                transaction.getCategory().getId() == null) {

            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        Category category =
                categoryRepository.findById(
                        transaction
                                .getCategory()
                                .getId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Category not found"
                        ));

        if (transaction.getType()
                != category.getType()) {

            throw new IllegalArgumentException(
                    "Transaction type must match category type"
            );
        }

        transaction.setCategory(category);
    }
}