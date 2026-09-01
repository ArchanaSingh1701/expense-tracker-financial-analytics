// ============================================================
// EXPENSE TRACKER - APP.JS
// ============================================================

let categoryChart = null;
let monthlyChart = null;

let currentPage = 1;
const pageSize = 10;

let allTransactions = [];
let allCategories = [];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    initializeMonthSelector();

    setupEventListeners();

    loadCategories();
    loadCategoryManagement();
    loadTransactions();
    loadSummary();
    loadCharts();

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    const transactionForm =
        document.getElementById("transactionForm");

    if (transactionForm) {
        transactionForm.addEventListener(
            "submit",
            handleTransactionSubmit
        );
    }


    const categoryForm =
        document.getElementById("categoryForm");

    if (categoryForm) {
        categoryForm.addEventListener(
            "submit",
            handleCategorySubmit
        );
    }


    const typeSelect =
        document.getElementById("type");

    if (typeSelect) {
        typeSelect.addEventListener(
            "change",
            updateCategoryDropdown
        );
    }


    const monthSelector =
        document.getElementById("selectedMonth");

    if (monthSelector) {

        monthSelector.addEventListener(
            "change",
            function () {

                currentPage = 1;

                loadSummary();
                loadTransactions();
                loadCharts();

            }
        );

    }

}


// ============================================================
// MONTH SELECTOR
// ============================================================

function initializeMonthSelector() {

    const selector =
        document.getElementById("selectedMonth");

    if (!selector) {
        return;
    }


    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const currentMonth =
        `${year}-${month}`;


    selector.value =
        currentMonth;

}


// ============================================================
// GET SELECTED MONTH
// ============================================================

function getSelectedMonth() {

    const selector =
        document.getElementById(
            "selectedMonth"
        );


    if (
        selector &&
        selector.value
    ) {

        return selector.value;

    }


    const today =
        new Date();


    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;

}


// ============================================================
// LOAD SUMMARY
// ============================================================

async function loadSummary() {

    try {

        const month =
            getSelectedMonth();


        const response =
            await fetch(
                `/api/analytics/summary?month=${encodeURIComponent(month)}`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load financial summary."
            );

        }


        const data =
            await response.json();


        console.log(
            "SUMMARY DATA:",
            data
        );


        const incomeElement =
            document.getElementById(
                "totalIncome"
            );

        const expenseElement =
            document.getElementById(
                "totalExpenses"
            );

        const balanceElement =
            document.getElementById(
                "balance"
            );

        const savingsElement =
            document.getElementById(
                "savings"
            );

        const countElement =
            document.getElementById(
                "transactionCount"
            );


        if (incomeElement) {

            incomeElement.textContent =
                formatCurrency(
                    data.totalIncome
                );

        }


        if (expenseElement) {

            expenseElement.textContent =
                formatCurrency(
                    data.totalExpenses
                );

        }


        if (balanceElement) {

            balanceElement.textContent =
                formatCurrency(
                    data.balance
                );

        }


        if (savingsElement) {

            savingsElement.textContent =
                formatCurrency(
                    data.totalSavings
                );

        }


        if (countElement) {

            countElement.textContent =
                data.transactionCount ?? 0;

        }


    } catch (error) {

        console.error(
            "Error loading summary:",
            error
        );

    }

}


// ============================================================
// LOAD CATEGORIES
// ============================================================

async function loadCategories() {

    try {

        const response =
            await fetch(
                "/api/categories",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load categories."
            );

        }


        const categories =
            await response.json();


        allCategories =
            categories;


        window.allCategories =
            categories;


        updateCategoryDropdown();

        updateFilterCategoryDropdown(
            categories
        );


    } catch (error) {

        console.error(
            "Error loading categories:",
            error
        );

    }

}


// ============================================================
// UPDATE CATEGORY DROPDOWN
// ============================================================

function updateCategoryDropdown() {

    const categorySelect =
        document.getElementById(
            "category"
        );

    const typeSelect =
        document.getElementById(
            "type"
        );


    if (!categorySelect) {
        return;
    }


    const selectedType =
        typeSelect
            ? typeSelect.value
            : "";


    categorySelect.innerHTML =
        '<option value="">Select category</option>';


    allCategories
        .filter(function (category) {

            if (!selectedType) {
                return true;
            }

            return category.type === selectedType;

        })
        .forEach(function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            categorySelect.appendChild(
                option
            );

        });

}


// ============================================================
// UPDATE FILTER CATEGORY DROPDOWN
// ============================================================

function updateFilterCategoryDropdown(
    categories
) {

    const select =
        document.getElementById(
            "filterCategory"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">All Categories</option>';


    categories.forEach(function (category) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category.id;


        option.textContent =
            category.name;


        select.appendChild(
            option
        );

    });

}


// ============================================================
// ADD TRANSACTION
// ============================================================

async function handleTransactionSubmit(
    event
) {

    event.preventDefault();


    const amount =
        document.getElementById(
            "amount"
        ).value;


    const type =
        document.getElementById(
            "type"
        ).value;


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    const transactionDate =
        document.getElementById(
            "transactionDate"
        ).value;


    const categoryId =
        document.getElementById(
            "category"
        ).value;


    if (
        !amount ||
        !type ||
        !description ||
        !transactionDate ||
        !categoryId
    ) {

        showMessage(
            "formMessage",
            "Please fill all fields.",
            true
        );

        return;

    }


    const transaction = {

        amount:
            Number(amount),

        type:
            type,

        description:
            description,

        transactionDate:
            transactionDate,

        category: {

            id:
                Number(categoryId)

        }

    };


    try {

        const response =
            await fetch(
                "/api/transactions",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            transaction
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to add transaction."
            );

        }


        showMessage(
            "formMessage",
            "Transaction added successfully.",
            false
        );


        document
            .getElementById(
                "transactionForm"
            )
            .reset();


        updateCategoryDropdown();


        currentPage = 1;


        await loadTransactions();

        await loadSummary();

        await loadCharts();


    } catch (error) {

        console.error(
            "Error adding transaction:",
            error
        );


        showMessage(
            "formMessage",
            error.message ||
            "Failed to add transaction.",
            true
        );

    }

}


// ============================================================
// LOAD TRANSACTIONS
// ============================================================

async function loadTransactions() {

    try {

        const response =
            await fetch("/api/transactions");

        if (!response.ok) {

            throw new Error(
                "Failed to load transactions."
            );

        }

        const transactions =
            await response.json();

        // ----------------------------------------------------
        // GET SELECTED MONTH
        // ----------------------------------------------------

        const selectedMonth =
            getSelectedMonth();

        // ----------------------------------------------------
        // FILTER TRANSACTIONS BY SELECTED MONTH
        // ----------------------------------------------------

        const monthTransactions =
            transactions.filter(
                transaction => {

                    if (!transaction.transactionDate) {
                        return false;
                    }

                    return transaction.transactionDate
                        .startsWith(selectedMonth);

                }
            );

        // ----------------------------------------------------
        // SORT BY DATE - NEWEST FIRST
        // ----------------------------------------------------

        monthTransactions.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.transactionDate
                    );

                const dateB =
                    new Date(
                        b.transactionDate
                    );

                return dateB - dateA;

            }
        );

        // ----------------------------------------------------
        // STORE ONLY SELECTED MONTH TRANSACTIONS
        // ----------------------------------------------------

        allTransactions =
            monthTransactions;

        // ----------------------------------------------------
        // DISPLAY
        // ----------------------------------------------------

        renderTransactions(
            monthTransactions
        );

    } catch (error) {

        console.error(
            "Error loading transactions:",
            error
        );

    }

}

// ============================================================
// RENDER TRANSACTIONS
// ============================================================

function renderTransactions(
    transactions
) {

    const tbody =
        document.getElementById(
            "transactionTableBody"
        );


    if (!tbody) {
        return;
    }


    const filteredTransactions =
        applyFiltersToTransactions(
            transactions
        );


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredTransactions.length /
                pageSize
            )
        );


    if (currentPage > totalPages) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        pageSize;


    const pageTransactions =
        filteredTransactions.slice(
            startIndex,
            startIndex + pageSize
        );


    tbody.innerHTML = "";


    if (
        pageTransactions.length === 0
    ) {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `
            <td colspan="6">
                No transactions found.
            </td>
        `;


        tbody.appendChild(
            row
        );

    } else {

        pageTransactions.forEach(
            function (transaction) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const categoryName =
                    transaction.category
                        ? transaction.category.name
                        : "-";


                const typeClass =
                    transaction.type === "INCOME"
                        ? "income"
                        : "expense";


                row.innerHTML = `

                    <td>
                        ${formatDate(
                            transaction.transactionDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            transaction.description || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            categoryName
                        )}
                    </td>

                    <td>
                        <span class="${typeClass}">
                            ${escapeHtml(
                                transaction.type || ""
                            )}
                        </span>
                    </td>

                    <td>
                        ${formatCurrency(
                            transaction.amount
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="editTransaction(${transaction.id})">
                            Edit
                        </button>

                        <button
                            type="button"
                            onclick="deleteTransaction(${transaction.id})">
                            Delete
                        </button>

                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );

    }


    updatePagination(
        filteredTransactions.length
    );

}


// ============================================================
// APPLY TRANSACTION FILTERS
// ============================================================

function applyTransactionFilters() {

    currentPage = 1;

    renderTransactions(
        allTransactions
    );

}


// ============================================================
// CLEAR TRANSACTION FILTERS
// ============================================================

function clearTransactionFilters() {

    const search =
        document.getElementById(
            "searchDescription"
        );

    const type =
        document.getElementById(
            "filterType"
        );

    const category =
        document.getElementById(
            "filterCategory"
        );

    const date =
        document.getElementById(
            "filterDate"
        );


    if (search) {
        search.value = "";
    }


    if (type) {
        type.value = "";
    }


    if (category) {
        category.value = "";
    }


    if (date) {
        date.value = "";
    }


    currentPage = 1;


    renderTransactions(
        allTransactions
    );

}


// ============================================================
// FILTER TRANSACTIONS
// ============================================================

function applyFiltersToTransactions(
    transactions
) {

    const search =
        document.getElementById(
            "searchDescription"
        )?.value
        .trim()
        .toLowerCase() || "";


    const type =
        document.getElementById(
            "filterType"
        )?.value || "";


    const category =
        document.getElementById(
            "filterCategory"
        )?.value || "";


    const date =
        document.getElementById(
            "filterDate"
        )?.value || "";


    return transactions.filter(
        function (transaction) {

            const description =
                (
                    transaction.description ||
                    ""
                ).toLowerCase();


            if (
                search &&
                !description.includes(
                    search
                )
            ) {

                return false;

            }


            if (
                type &&
                transaction.type !== type
            ) {

                return false;

            }


            if (
                category &&
                String(
                    transaction.category?.id
                ) !== String(category)
            ) {

                return false;

            }


            if (
                date &&
                transaction.transactionDate !== date
            ) {

                return false;

            }


            return true;

        }
    );

}


// ============================================================
// PAGINATION
// ============================================================

function updatePagination(
    totalItems
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalItems /
                pageSize
            )
        );


    const previousButton =
        document.getElementById(
            "previousPage"
        );


    const nextButton =
        document.getElementById(
            "nextPage"
        );


    const pageInfo =
        document.getElementById(
            "pageInfo"
        );


    if (previousButton) {

        previousButton.disabled =
            currentPage <= 1;

    }


    if (nextButton) {

        nextButton.disabled =
            currentPage >= totalPages;

    }


    if (pageInfo) {

        pageInfo.textContent =
            `Page ${currentPage} of ${totalPages}`;

    }

}


// ============================================================
// PREVIOUS PAGE
// ============================================================

function goToPreviousPage() {

    if (currentPage > 1) {

        currentPage--;

        renderTransactions(
            allTransactions
        );

    }

}


// ============================================================
// NEXT PAGE
// ============================================================

function goToNextPage() {

    const filteredTransactions =
        applyFiltersToTransactions(
            allTransactions
        );


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredTransactions.length /
                pageSize
            )
        );


    if (currentPage < totalPages) {

        currentPage++;

        renderTransactions(
            allTransactions
        );

    }

}


// ============================================================
// DELETE TRANSACTION
// ============================================================

async function deleteTransaction(
    id
) {

    if (
        !confirm(
            "Are you sure you want to delete this transaction?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/transactions/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete transaction."
            );

        }


        await loadTransactions();

        await loadSummary();

        await loadCharts();


    } catch (error) {

        console.error(
            "Error deleting transaction:",
            error
        );


        alert(
            error.message
        );

    }

}


// ============================================================
// EDIT TRANSACTION
// ============================================================

async function editTransaction(
    id
) {

    const transaction =
        allTransactions.find(
            function (t) {

                return t.id === id;

            }
        );


    if (!transaction) {
        return;
    }


    const newAmount =
        prompt(
            "Enter new amount:",
            transaction.amount
        );


    if (newAmount === null) {
        return;
    }


    const amountNumber =
        Number(newAmount);


    if (
        !Number.isFinite(amountNumber) ||
        amountNumber <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    const newDescription =
        prompt(
            "Enter new description:",
            transaction.description
        );


    if (newDescription === null) {
        return;
    }


    const newDate =
        prompt(
            "Enter date (YYYY-MM-DD):",
            transaction.transactionDate
        );


    if (newDate === null) {
        return;
    }


    const updatedTransaction = {

        amount:
            amountNumber,

        type:
            transaction.type,

        description:
            newDescription.trim(),

        transactionDate:
            newDate,

        category: {

            id:
                transaction.category.id

        }

    };


    try {

        const response =
            await fetch(
                `/api/transactions/${id}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            updatedTransaction
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to update transaction."
            );

        }


        await loadTransactions();

        await loadSummary();

        await loadCharts();


    } catch (error) {

        console.error(
            "Error updating transaction:",
            error
        );


        alert(
            error.message
        );

    }

}


// ============================================================
// LOAD CATEGORY MANAGEMENT
// ============================================================

async function loadCategoryManagement() {

    try {

        const response =
            await fetch(
                "/api/categories",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load categories."
            );

        }


        const categories =
            await response.json();


        allCategories =
            categories;


        window.allCategories =
            categories;


        const tbody =
            document.getElementById(
                "categoryTableBody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML = "";


        categories.forEach(
            function (category) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${category.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            category.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            category.type
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="editCategory(${category.id})">
                            Edit
                        </button>

                        <button
                            type="button"
                            onclick="deleteCategory(${category.id})">
                            Delete
                        </button>

                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );


        updateCategoryDropdown();

        updateFilterCategoryDropdown(
            categories
        );


    } catch (error) {

        console.error(
            "Error loading category management:",
            error
        );

    }

}


// ============================================================
// ADD CATEGORY
// ============================================================

async function handleCategorySubmit(
    event
) {

    event.preventDefault();


    const name =
        document.getElementById(
            "categoryName"
        ).value.trim();


    const type =
        document.getElementById(
            "categoryType"
        ).value;


    if (!name || !type) {

        showMessage(
            "categoryMessage",
            "Please fill all fields.",
            true
        );

        return;

    }


    const category = {

        name:
            name,

        type:
            type

    };


    try {

        const response =
            await fetch(
                "/api/categories",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            category
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to add category."
            );

        }


        showMessage(
            "categoryMessage",
            "Category added successfully.",
            false
        );


        document
            .getElementById(
                "categoryForm"
            )
            .reset();


        await loadCategories();

        await loadCategoryManagement();


    } catch (error) {

        console.error(
            "Error adding category:",
            error
        );


        showMessage(
            "categoryMessage",
            error.message ||
            "Failed to add category.",
            true
        );

    }

}


// ============================================================
// EDIT CATEGORY
// ============================================================

async function editCategory(
    id
) {

    const category =
        allCategories.find(
            function (c) {

                return c.id === id;

            }
        );


    if (!category) {
        return;
    }


    const newName =
        prompt(
            "Enter new category name:",
            category.name
        );


    if (newName === null) {
        return;
    }


    if (!newName.trim()) {

        alert(
            "Category name cannot be empty."
        );

        return;

    }


    const updatedCategory = {

        name:
            newName.trim(),

        type:
            category.type

    };


    try {

        const response =
            await fetch(
                `/api/categories/${id}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            updatedCategory
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to update category."
            );

        }


        await loadCategories();

        await loadCategoryManagement();


    } catch (error) {

        console.error(
            "Error updating category:",
            error
        );


        alert(
            error.message
        );

    }

}


// ============================================================
// DELETE CATEGORY
// ============================================================

async function deleteCategory(
    id
) {

    if (
        !confirm(
            "Are you sure you want to delete this category?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/categories/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to delete category."
            );

        }


        await loadCategories();

        await loadCategoryManagement();


    } catch (error) {

        console.error(
            "Error deleting category:",
            error
        );


        alert(
            error.message
        );

    }

}


// ============================================================
// LOAD CHARTS
// ============================================================

async function loadCharts() {

    await loadCategoryChart();

    await loadMonthlyChart();

}


// ============================================================
// CATEGORY CHART
// ============================================================

async function loadCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas) {
        return;
    }


    try {

        const month =
            getSelectedMonth();


        const response =
            await fetch(
                `/api/analytics/expenses-by-category?month=${encodeURIComponent(month)}`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load category analytics."
            );

        }


        const data =
            await response.json();


        console.log(
            "CATEGORY DATA:",
            data
        );


        const labels =
            data.map(
                function (item) {

                    return item.categoryName;

                }
            );


        const values =
            data.map(
                function (item) {

                    return Number(
                        item.totalAmount
                    ) || 0;

                }
            );


        if (categoryChart) {

            categoryChart.destroy();

        }


        categoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            labels,

                        datasets: [
                            {

                                data:
                                    values,

                                backgroundColor: [
                                    "#2563eb",
                                    "#16a34a",
                                    "#f59e0b",
                                    "#dc2626",
                                    "#9333ea",
                                    "#0891b2",
                                    "#ea580c",
                                    "#4f46e5"
                                ],

                                borderWidth: 2

                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"

                            }

                        }

                    }

                }
            );


    } catch (error) {

        console.error(
            "Error loading category chart:",
            error
        );

    }

}


// ============================================================
// MONTHLY CHART
// ============================================================

async function loadMonthlyChart() {

    const canvas =
        document.getElementById("monthlyChart");

    if (!canvas) {
        return;
    }

    try {

        const response =
            await fetch("/api/analytics/monthly");

        if (!response.ok) {
            throw new Error(
                "Failed to load monthly analytics."
            );
        }

        const data =
            await response.json();

        // ----------------------------------------------------
        // GET THE CURRENTLY SELECTED MONTH
        // ----------------------------------------------------

        const selectedMonth =
            getSelectedMonth();

        // ----------------------------------------------------
        // Keep the monthly chart's historical data,
        // but make sure the selected month exists.
        // If it has no transactions, show 0 / 0.
        // ----------------------------------------------------

        const existingMonth =
            data.find(
                item =>
                    item.month === selectedMonth
            );

        if (!existingMonth) {

            data.push({
                month: selectedMonth,
                totalIncome: 0,
                totalExpenses: 0
            });

        }

        // ----------------------------------------------------
        // SORT MONTHS CHRONOLOGICALLY
        // ----------------------------------------------------

        data.sort(
            (a, b) =>
                a.month.localeCompare(b.month)
        );

        // ----------------------------------------------------
        // LABELS
        // ----------------------------------------------------

        const labels =
            data.map(
                item =>
                    formatMonth(item.month)
            );

        // ----------------------------------------------------
        // INCOME
        // ----------------------------------------------------

        const incomeValues =
            data.map(
                item =>
                    Number(item.totalIncome) || 0
            );

        // ----------------------------------------------------
        // EXPENSES
        // ----------------------------------------------------

        const expenseValues =
            data.map(
                item =>
                    Number(item.totalExpenses) || 0
            );

        // ----------------------------------------------------
        // DESTROY OLD CHART
        // ----------------------------------------------------

        if (monthlyChart) {
            monthlyChart.destroy();
            monthlyChart = null;
        }

        // ----------------------------------------------------
        // CREATE NEW CHART
        // ----------------------------------------------------

        monthlyChart =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels: labels,

                        datasets: [

    {
        label: "Income",
        data: incomeValues,
        backgroundColor: "#22c55e",
        borderColor: "#16a34a",
        borderWidth: 1
    },

    {
        label: "Expenses",
        data: expenseValues,
        backgroundColor: "#ef4444",
        borderColor: "#dc2626",
        borderWidth: 1
    }

]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        scales: {

                            y: {

                                beginAtZero: true

                            }

                        },

                        plugins: {

                            legend: {
                                display: true
                            }

                        }

                    }

                }
            );

    } catch (error) {

        console.error(
            "Error loading monthly chart:",
            error
        );

    }

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(
    amount
) {

    const number =
        Number(amount) || 0;


    return new Intl.NumberFormat(
        "en-IN",
        {

            style:
                "currency",

            currency:
                "INR",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }
    ).format(number);

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {
        return dateString;
    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// ============================================================
// FORMAT MONTH
// ============================================================

function formatMonth(
    monthString
) {

    if (!monthString) {
        return "";
    }


    const parts =
        monthString.split("-");


    if (parts.length !== 2) {
        return monthString;
    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            1
        );


    return date.toLocaleDateString(
        "en-IN",
        {

            month:
                "short",

            year:
                "numeric"

        }
    );

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    elementId,
    message,
    isError
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";


    element.className =
        isError
            ? "error-message"
            : "success-message";


    setTimeout(
        function () {

            element.style.display =
                "none";

        },
        4000
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}