const userStatus = document.getElementById("userStatus");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {
  window.location.href = "login.html";
}

if (loggedUser) {
  if (userStatus) {
    userStatus.textContent = `Welcome, ${loggedUser.fullName}`;
  }

  if (loginLink) {
    loginLink.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.style.display = "inline-block";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
  });
}

// ====================================
// TRANSACTIONS
// ====================================

const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const filterTypeInput = document.getElementById("filterType");
const filterCategoryInput = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");
const filterMonthInput = document.getElementById("filterMonth");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionsCounterEl = document.getElementById("transactionsCounter");

const monthlyIncomeEl = document.getElementById("monthlyIncome");
const monthlyExpenseEl = document.getElementById("monthlyExpense");
const monthlyBalanceEl = document.getElementById("monthlyBalance");

const transactionsKey = `transactions_${loggedUser.email}`;

let transactions = JSON.parse(localStorage.getItem(transactionsKey)) || [];

function saveTransactions() {
  localStorage.setItem(transactionsKey, JSON.stringify(transactions));
}

function setTodayDate() {
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-AR");
}

function updateBalanceStyle(balance) {
  if (balance < 0) {
    balanceEl.classList.add("negative");
  } else {
    balanceEl.classList.remove("negative");
  }
}

function updateMonthlyBalanceStyle(balance) {
  if (balance < 0) {
    monthlyBalanceEl.classList.add("negative");
  } else {
    monthlyBalanceEl.classList.remove("negative");
  }
}

function updateTransactionsCounter() {
  const count = transactions.length;
  transactionsCounterEl.textContent =
    count === 1
      ? "1 transacción registrada"
      : `${count} transacciones registradas`;
}

function getFilteredTransactions() {
  const selectedType = filterTypeInput.value;
  const selectedCategory = filterCategoryInput.value;
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedMonth = filterMonthInput.value;

  return transactions.filter((transaction) => {
    const matchesType =
      selectedType === "all" || transaction.type === selectedType;

    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;

    const matchesSearch =
      transaction.description.toLowerCase().includes(searchText);

    const matchesMonth =
      !selectedMonth || transaction.date.startsWith(selectedMonth);

    return matchesType && matchesCategory && matchesSearch && matchesMonth;
  });
}

function getMonthlyTransactions() {
  const selectedMonth = filterMonthInput.value;

  if (!selectedMonth) {
    return transactions;
  }

  return transactions.filter((transaction) =>
    transaction.date.startsWith(selectedMonth)
  );
}

function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  balanceEl.textContent = `$${balance.toFixed(2)}`;
  incomeEl.textContent = `$${totalIncome.toFixed(2)}`;
  expenseEl.textContent = `$${totalExpense.toFixed(2)}`;

  updateBalanceStyle(balance);
  updateTransactionsCounter();
}

function updateMonthlySummary() {
  const monthlyTransactions = getMonthlyTransactions();

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  monthlyTransactions.forEach((transaction) => {
    if (transaction.type === "income") {
      monthlyIncome += transaction.amount;
    } else {
      monthlyExpense += transaction.amount;
    }
  });

  const monthlyBalance = monthlyIncome - monthlyExpense;

  monthlyIncomeEl.textContent = `$${monthlyIncome.toFixed(2)}`;
  monthlyExpenseEl.textContent = `$${monthlyExpense.toFixed(2)}`;
  monthlyBalanceEl.textContent = `$${monthlyBalance.toFixed(2)}`;

  updateMonthlyBalanceStyle(monthlyBalance);
}

function renderTransactions() {
  transactionList.innerHTML = "";

  const filteredTransactions = getFilteredTransactions();

  if (filteredTransactions.length === 0) {
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
  }

  filteredTransactions.forEach((transaction) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${transaction.description}</td>
      <td>${transaction.category}</td>
      <td>${formatDate(transaction.date)}</td>
      <td>
        <span class="badge-custom ${
          transaction.type === "income" ? "badge-income" : "badge-expense"
        }">
          ${transaction.type === "income" ? "Ingreso" : "Gasto"}
        </span>
      </td>
      <td class="${
        transaction.type === "income" ? "amount-income" : "amount-expense"
      }">
        ${transaction.type === "income" ? "+" : "-"}$${transaction.amount.toFixed(2)}
      </td>
      <td>
        <button class="btn delete-btn" onclick="deleteTransaction(${transaction.id})">
          Eliminar
        </button>
      </td>
    `;

    transactionList.appendChild(row);
  });
}

// ====================================
// CHARTS
// ====================================

let incomeExpenseChart;
let categoryExpenseChart;
let monthlyComparisonChart;

function getIncomeExpenseData() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  return [totalIncome, totalExpense];
}

function getCategoryExpenseData() {
  const categoryTotals = {};

  transactions.forEach((transaction) => {
    if (transaction.type === "expense") {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }

      categoryTotals[transaction.category] += transaction.amount;
    }
  });

  return categoryTotals;
}

function getMonthlyComparisonData() {
  const monthlyData = {};

  transactions.forEach((transaction) => {
    const month = transaction.date.slice(0, 7);

    if (!monthlyData[month]) {
      monthlyData[month] = {
        income: 0,
        expense: 0,
        balance: 0
      };
    }

    if (transaction.type === "income") {
      monthlyData[month].income += transaction.amount;
    } else {
      monthlyData[month].expense += transaction.amount;
    }

    monthlyData[month].balance =
      monthlyData[month].income - monthlyData[month].expense;
  });

  const months = Object.keys(monthlyData).sort();

  return {
    months,
    income: months.map((month) => monthlyData[month].income),
    expense: months.map((month) => monthlyData[month].expense),
    balance: months.map((month) => monthlyData[month].balance)
  };
}

function renderCharts() {
  const incomeExpenseCanvas = document.getElementById("incomeExpenseChart");
  const categoryExpenseCanvas = document.getElementById("categoryExpenseChart");
  const monthlyComparisonCanvas = document.getElementById(
    "monthlyComparisonChart"
  );

  if (!incomeExpenseCanvas || !categoryExpenseCanvas || !monthlyComparisonCanvas) {
    return;
  }

  const [totalIncome, totalExpense] = getIncomeExpenseData();
  const categoryTotals = getCategoryExpenseData();
  const monthlyData = getMonthlyComparisonData();

  if (incomeExpenseChart) incomeExpenseChart.destroy();
  if (categoryExpenseChart) categoryExpenseChart.destroy();
  if (monthlyComparisonChart) monthlyComparisonChart.destroy();

  incomeExpenseChart = new Chart(incomeExpenseCanvas, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount",
          data: [totalIncome, totalExpense],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#cbd5e1"
          },
          grid: {
            color: "#334155"
          }
        },
        y: {
          ticks: {
            color: "#cbd5e1"
          },
          grid: {
            color: "#334155"
          }
        }
      }
    }
  });

  categoryExpenseChart = new Chart(categoryExpenseCanvas, {
    type: "doughnut",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#ef4444",
            "#f97316",
            "#eab308",
            "#22c55e",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899"
          ],
          borderColor: "#1e293b"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#cbd5e1"
          }
        }
      }
    }
  });

  monthlyComparisonChart = new Chart(monthlyComparisonCanvas, {
    type: "line",
    data: {
      labels: monthlyData.months,
      datasets: [
        {
          label: "Income",
          data: monthlyData.income,
          borderColor: "#22c55e",
          backgroundColor: "#22c55e",
          tension: 0.4
        },
        {
          label: "Expenses",
          data: monthlyData.expense,
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          tension: 0.4
        },
        {
          label: "Balance",
          data: monthlyData.balance,
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#cbd5e1"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#cbd5e1"
          },
          grid: {
            color: "#334155"
          }
        },
        y: {
          ticks: {
            color: "#cbd5e1"
          },
          grid: {
            color: "#334155"
          }
        }
      }
    }
  });
}

// ====================================
// MAIN UI
// ====================================

function updateUI() {
  updateSummary();
  updateMonthlySummary();
  renderTransactions();
  renderCharts();
}

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description || isNaN(amount) || amount <= 0 || !type || !category || !date) {
      alert("Por favor completá todos los campos correctamente.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount,
      type,
      category,
      date
    };

    transactions.push(newTransaction);
    saveTransactions();
    updateUI();
    form.reset();
    setTodayDate();
    descriptionInput.focus();
  });
}

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  updateUI();
}

window.deleteTransaction = deleteTransaction;

function clearFilters() {
  filterTypeInput.value = "all";
  filterCategoryInput.value = "all";
  searchInput.value = "";
  filterMonthInput.value = "";
  renderTransactions();
  updateMonthlySummary();
  renderCharts();
}

filterTypeInput.addEventListener("change", renderTransactions);
filterCategoryInput.addEventListener("change", renderTransactions);
searchInput.addEventListener("input", renderTransactions);
filterMonthInput.addEventListener("change", updateUI);
clearFiltersBtn.addEventListener("click", clearFilters);

setTodayDate();
updateUI();