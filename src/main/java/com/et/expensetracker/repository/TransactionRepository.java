package com.et.expensetracker.repository;

import com.et.expensetracker.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByTransactionDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}