// SpendWise: a small expense tracker using plain JavaScript and browser localStorage.
const TRANSACTION_KEY = "spendwise.transactions.v1";
const BUDGET_KEY = "spendwise.monthlyBudget.v1";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

let transactions = loadTransactions();
let monthlyBudget = loadBudget();
let activeType = "all";

const transactionModal = document.getElementById("transaction-modal");
const budgetModal = document.getElementById("budget-modal");
const form = document.getElementById("transaction-form");
const toast = document.getElementById("toast");

function loadTransactions() {
  try {
    const value = localStorage.getItem(TRANSACTION_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.warn("Unable to read transactions from browser storage.", error);
    return [];
  }
}

function loadBudget() {
  try {
    const value = Number(localStorage.getItem(BUDGET_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    return 0;
  }
}

function saveData() {
  try {
    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
    localStorage.setItem(BUDGET_KEY, String(monthlyBudget));
  } catch (error) {
    showToast("Could not save data in this browser.");
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function todayString() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatMoney(amount) {
  return money.format(amount);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric"
  });
}

function isThisMonth(dateString) {
  return Boolean(dateString) && dateString.slice(0, 7) === todayString().slice(0, 7);
}

function getFilteredTransactions() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const category = document.getElementById("category-filter").value;
  return [...transactions]
    .filter(item => activeType === "all" || item.type === activeType)
    .filter(item => category === "all" || item.category === category)
    .filter(item => `${item.description} ${item.category} ${item.type}`.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function renderDashboard() {
  const monthItems = transactions.filter(item => isThisMonth(item.date));
  const income = monthItems.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = monthItems.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("balance").textContent = formatMoney(income - expenses);
  document.getElementById("income-total").textContent = formatMoney(income);
  document.getElementById("expense-total").textContent = formatMoney(expenses);
  document.getElementById("budget-spent").textContent = formatMoney(expenses);

  const used = monthlyBudget > 0 ? Math.round(expenses / monthlyBudget * 100) : 0;
  const clamped = Math.min(used, 100);
  document.getElementById("budget-fill").style.width = `${clamped}%`;
  document.getElementById("budget-used").textContent = monthlyBudget ? `${used}% used` : "No budget set";
  document.getElementById("budget-remaining").textContent = monthlyBudget
    ? `${formatMoney(Math.max(0, monthlyBudget - expenses))} remaining`
    : "Set a monthly limit";
  document.getElementById("budget-fill").style.background = used > 100
    ? "linear-gradient(90deg,#ed9b87,#d85e65)" : "linear-gradient(90deg,#9a8cff,#6d5ce8)";
  document.getElementById("budget-month").textContent = new Date().toLocaleDateString(undefined, { month: "long" });
  renderCategories(monthItems.filter(item => item.type === "expense"));
}

function renderCategories(expenses) {
  const container = document.getElementById("category-list");
  container.innerHTML = "";
  const colors = ["#8474ed", "#54b99a", "#f0ae70", "#6ea8e7", "#e57f87", "#9b9db5", "#60b9c5", "#c28be4"];
  const totals = {};
  expenses.forEach(item => { totals[item.category] = (totals[item.category] || 0) + item.amount; });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!entries.length) {
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = "Your expense categories will appear here.";
    container.append(message);
    return;
  }
  const highest = entries[0][1];
  entries.forEach(([name, amount], index) => {
    const row = document.createElement("div");
    row.className = "category-item";
    const top = document.createElement("div");
    top.className = "category-top";
    const dot = document.createElement("span");
    dot.className = "category-dot";
    dot.style.background = colors[index % colors.length];
    const label = document.createElement("span");
    label.className = "category-name";
    label.textContent = name;
    top.append(dot, label);
    const value = document.createElement("span");
    value.className = "category-value";
    value.textContent = formatMoney(amount);
    const track = document.createElement("div");
    track.className = "category-track";
    const fill = document.createElement("div");
    fill.style.width = `${amount / highest * 100}%`;
    fill.style.background = colors[index % colors.length];
    track.append(fill);
    row.append(top, value, track);
    container.append(row);
  });
}

function renderTransactions() {
  const tbody = document.getElementById("transaction-rows");
  const empty = document.getElementById("empty-state");
  const visible = getFilteredTransactions();
  tbody.innerHTML = "";
  empty.style.display = visible.length ? "none" : "block";
  document.querySelector(".table-wrap").style.display = visible.length ? "block" : "none";

  visible.forEach(item => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const nameWrap = document.createElement("div");
    nameWrap.className = "transaction-name";
    const symbol = document.createElement("span");
    symbol.className = `transaction-symbol ${item.type}`;
    symbol.textContent = item.type === "income" ? "↙" : "↗";
    const name = document.createElement("span");
    name.textContent = item.description;
    nameWrap.append(symbol, name);
    nameCell.append(nameWrap);

    const categoryCell = document.createElement("td");
    const category = document.createElement("span");
    category.className = "category-label";
    category.textContent = item.category;
    categoryCell.append(category);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(item.date);

    const typeCell = document.createElement("td");
    const type = document.createElement("span");
    type.className = `type-label ${item.type}`;
    type.textContent = item.type === "income" ? "Income" : "Expense";
    typeCell.append(type);

    const amountCell = document.createElement("td");
    amountCell.className = "amount-cell";
    amountCell.textContent = `${item.type === "income" ? "+" : "−"}${formatMoney(item.amount)}`;

    const actionCell = document.createElement("td");
    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "×";
    remove.title = "Delete transaction";
    remove.setAttribute("aria-label", `Delete ${item.description}`);
    remove.addEventListener("click", () => deleteTransaction(item.id));
    actionCell.append(remove);

    row.append(nameCell, categoryCell, dateCell, typeCell, amountCell, actionCell);
    tbody.append(row);
  });
  renderDashboard();
}

function renderAll() {
  renderTransactions();
}

function openTransactionModal() {
  form.reset();
  document.getElementById("date").value = todayString();
  document.getElementById("type").value = activeType === "income" ? "income" : "expense";
  transactionModal.hidden = false;
  document.getElementById("description").focus();
}

function closeTransactionModal() {
  transactionModal.hidden = true;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2300);
}

function deleteTransaction(id) {
  const item = transactions.find(transaction => transaction.id === id);
  if (!item || !confirm(`Delete "${item.description}"?`)) return;
  transactions = transactions.filter(transaction => transaction.id !== id);
  saveData();
  renderAll();
  showToast("Transaction deleted.");
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const amount = Number(data.get("amount"));
  const description = String(data.get("description")).trim();
  if (!description || !Number.isFinite(amount) || amount <= 0) {
    showToast("Enter a description and a valid amount.");
    return;
  }
  transactions.push({
    id: makeId(),
    description,
    type: String(data.get("type")),
    amount: Math.round(amount * 100) / 100,
    category: String(data.get("category")),
    date: String(data.get("date")),
    createdAt: Date.now()
  });
  saveData();
  closeTransactionModal();
  renderAll();
  showToast("Transaction saved.");
});

document.getElementById("add-transaction").addEventListener("click", openTransactionModal);
document.getElementById("empty-add").addEventListener("click", openTransactionModal);
document.getElementById("close-modal").addEventListener("click", closeTransactionModal);
document.getElementById("cancel-modal").addEventListener("click", closeTransactionModal);
transactionModal.addEventListener("click", event => {
  if (event.target === transactionModal) closeTransactionModal();
});

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    button.classList.add("active");
    activeType = button.dataset.filter;
    const headings = { all: "Recent transactions", income: "Income transactions", expense: "Expense transactions" };
    document.getElementById("transactions-title").textContent = headings[activeType];
    renderTransactions();
  });
});

document.getElementById("search").addEventListener("input", renderTransactions);
document.getElementById("category-filter").addEventListener("change", renderTransactions);

function openBudgetModal() {
  document.getElementById("budget-input").value = monthlyBudget || "";
  budgetModal.hidden = false;
  document.getElementById("budget-input").focus();
}
function closeBudgetModal() { budgetModal.hidden = true; }

document.getElementById("edit-budget").addEventListener("click", openBudgetModal);
document.getElementById("close-budget").addEventListener("click", closeBudgetModal);
document.getElementById("cancel-budget").addEventListener("click", closeBudgetModal);
budgetModal.addEventListener("click", event => { if (event.target === budgetModal) closeBudgetModal(); });
document.getElementById("budget-form").addEventListener("submit", event => {
  event.preventDefault();
  const amount = Number(document.getElementById("budget-input").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Enter a budget greater than zero.");
    return;
  }
  monthlyBudget = Math.round(amount * 100) / 100;
  saveData();
  closeBudgetModal();
  renderDashboard();
  showToast("Monthly budget updated.");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeTransactionModal();
    closeBudgetModal();
  }
});

document.getElementById("date-label").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long", month: "long", day: "numeric"
}).toUpperCase();
renderAll();
