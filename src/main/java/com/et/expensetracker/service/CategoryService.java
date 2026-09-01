package com.et.expensetracker.service;

import com.et.expensetracker.entity.Category;
import com.et.expensetracker.repository.CategoryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(
            Long id,
            Category updatedCategory) {

        Category existingCategory =
                getCategoryById(id);

        existingCategory.setName(
                updatedCategory.getName());

        existingCategory.setType(
                updatedCategory.getType());

        return categoryRepository.save(
                existingCategory);
    }

    public void deleteCategory(Long id) {

        Category category =
                getCategoryById(id);

        try {

            categoryRepository.delete(category);

            categoryRepository.flush();

        } catch (DataIntegrityViolationException e) {

            throw new IllegalArgumentException(
                    "Cannot delete this category because it is being used by a transaction."
            );
        }
    }
}