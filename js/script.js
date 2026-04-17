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

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function setTodayDate() {
  dateInput.value = new Date().toISOString().split("T")[0];
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
    count === 1 ? "1 transacción registrada" : `${count} transacciones registradas`;
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
        <span class="badge-custom ${transaction.type === "income" ? "badge-income" : "badge-expense"}">
          ${transaction.type === "income" ? "Ingreso" : "Gasto"}
        </span>
      </td>
      <td class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">
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

function updateUI() {
  updateSummary();
  updateMonthlySummary();
  renderTransactions();
}

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
}

);

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  updateUI();
}

function clearFilters() {
  filterTypeInput.value = "all";
  filterCategoryInput.value = "all";
  searchInput.value = "";
  filterMonthInput.value = "";
  renderTransactions();
  updateMonthlySummary();
}

filterTypeInput.addEventListener("change", renderTransactions);
filterCategoryInput.addEventListener("change", renderTransactions);
searchInput.addEventListener("input", renderTransactions);
filterMonthInput.addEventListener("change", updateUI);
clearFiltersBtn.addEventListener("click", clearFilters);

setTodayDate();
updateUI();