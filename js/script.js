// 1. Variables
const form = document.getElementById("transaction-form");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const tableBody = document.getElementById("transaction-table");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

let transactions = [];


// 2. Evento submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const newTransaction = {
    id: Date.now(),
    description: description.value,
    amount: parseFloat(amount.value),
    type: type.value
  };

  transactions.push(newTransaction);

  updateUI();
  form.reset();
});


// 3. Función actualizar UI
function updateUI() {
  tableBody.innerHTML = "";

  let totalBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${tx.description}</td>
      <td>$${tx.amount}</td>
      <td class="${tx.type === "income" ? "text-success" : "text-danger"}">
        ${tx.type}
      </td>
    `;

    tableBody.appendChild(row);

    if (tx.type === "income") {
      totalIncome += tx.amount;
      totalBalance += tx.amount;
    } else {
      totalExpense += tx.amount;
      totalBalance -= tx.amount;
    }
  });

  balance.innerText = `$${totalBalance}`;
  income.innerText = `$${totalIncome}`;
  expense.innerText = `$${totalExpense}`;

  // 4. Guardar en localStorage
  localStorage.setItem("transactions", JSON.stringify(transactions));
}


// 5. Cargar datos al iniciar
function loadTransactions() {
  const data = localStorage.getItem("transactions");

  if (data) {
    transactions = JSON.parse(data);
    updateUI();
  }
}

loadTransactions();