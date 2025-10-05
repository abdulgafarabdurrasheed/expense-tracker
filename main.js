const CATEGORIES = {
  food: { name: 'Food & Dining', color: 'food', icon: '🍽️' },
  transport: { name: 'Transportation', color: 'transport', icon: '🚗' },
  utilities: { name: 'Utilities', color: 'utilities', icon: '💡' },
  entertainment: { name: 'Entertainment', color: 'entertainment', icon: '🎬' },
  healthcare: { name: 'Healthcare', color: 'healthcare', icon: '⚕️' },
  shopping: { name: 'Shopping', color: 'shopping', icon: '🛍️' },
  other: { name: 'Other', color: 'other', icon: '📝' }
};

let expenses = [];
let currentFilter = 'all';

const getFromLocalStorage = () => {
  const stored = localStorage.getItem('expenses');
  return stored ? JSON.parse(stored) : [];
};

const saveToLocalStorage = () => {
  localStorage.setItem('expenses', JSON.stringify(expenses));
};

const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const addExpense = (description, amount, category) => {
  const newExpense = {
    id: generateId(),
    description,
    amount: parseFloat(amount),
    category,
    date: new Date().toISOString()
  };

  expenses = [...expenses, newExpense];
  saveToLocalStorage();
  return newExpense;
};

const deleteExpense = (id) => {
  expenses = expenses.filter(expense => expense.id !== id);
  saveToLocalStorage();
};

const updateExpense = (id, updates) => {
  expenses = expenses.map(expense =>
    expense.id === id ? { ...expense, ...updates } : expense
  );
  saveToLocalStorage();
};

const filterExpenses = (category) => {
  return category === 'all'
    ? expenses
    : expenses.filter(expense => expense.category === category);
};

const calculateTotal = (expenseList) => {
  return expenseList.reduce((total, expense) => total + expense.amount, 0);
};

const getCategoryStats = () => {
  const stats = {};

  Object.keys(CATEGORIES).forEach(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const total = calculateTotal(categoryExpenses);

    if (total > 0) {
      stats[category] = {
        count: categoryExpenses.length,
        total,
        ...CATEGORIES[category]
      };
    }
  });

  return stats;
};

const renderExpenseItem = (expense) => {
  const { id, description, amount, category, date } = expense;
  const categoryInfo = CATEGORIES[category];

  return `
    <div class="expense-item" data-id="${id}">
      <div class="expense-content">
        <div class="expense-details">
          <div class="expense-header">
            <span class="expense-icon">${categoryInfo.icon}</span>
            <div class="expense-info">
              <h3 class="expense-description">${description}</h3>
              <p class="expense-date">${formatDate(date)}</p>
            </div>
          </div>
          <span class="category-badge ${categoryInfo.color}">
            ${categoryInfo.name}
          </span>
        </div>

        <div class="expense-right">
          <span class="expense-amount">${formatCurrency(amount)}</span>
          <div class="expense-actions">
            <button
              class="icon-btn edit"
              data-id="${id}"
              title="Edit expense"
            >
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              class="icon-btn delete"
              data-id="${id}"
              title="Delete expense"
            >
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderExpenseList = () => {
  const expenseList = document.getElementById('expense-list');
  const filteredExpenses = filterExpenses(currentFilter);

  if (filteredExpenses.length === 0) {
    const message = currentFilter === 'all'
      ? 'No expenses yet. Add your first expense above!'
      : `No expenses found in the ${CATEGORIES[currentFilter]?.name || 'selected'} category.`;

    expenseList.innerHTML = `<p class="empty-text">${message}</p>`;
    return;
  }

  const sortedExpenses = [...filteredExpenses].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  expenseList.innerHTML = sortedExpenses.map(renderExpenseItem).join('');

  expenseList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });

  expenseList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEdit);
  });
};

const updateTotals = () => {
  const totalElement = document.getElementById('total-amount');
  const filteredTotalElement = document.getElementById('filtered-total');
  const expenseCountElement = document.getElementById('expense-count');

  const allTotal = calculateTotal(expenses);
  const filteredExpenses = filterExpenses(currentFilter);
  const filteredTotal = calculateTotal(filteredExpenses);

  totalElement.textContent = formatCurrency(allTotal);
  filteredTotalElement.textContent = formatCurrency(filteredTotal);

  const count = expenses.length;
  expenseCountElement.textContent = `${count} ${count === 1 ? 'expense' : 'expenses'}`;
};

const renderCategoryStats = () => {
  const statsContainer = document.getElementById('category-stats');
  const stats = getCategoryStats();
  const statsArray = Object.entries(stats);

  if (statsArray.length === 0) {
    statsContainer.innerHTML = '<p class="empty-text stats-empty">No data available</p>';
    return;
  }

  const sortedStats = statsArray.sort((a, b) => b[1].total - a[1].total);

  statsContainer.innerHTML = sortedStats.map(([category, data]) => `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-icon">${data.icon}</span>
        <h3 class="stat-name">${data.name}</h3>
      </div>
      <p class="stat-total">${formatCurrency(data.total)}</p>
      <p class="stat-count">${data.count} ${data.count === 1 ? 'expense' : 'expenses'}</p>
    </div>
  `).join('');
};

const renderAll = () => {
  renderExpenseList();
  updateTotals();
  renderCategoryStats();
};

const handleSubmit = (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const description = formData.get('description');
  const amount = formData.get('amount');
  const category = formData.get('category');

  addExpense(description, amount, category);

  e.target.reset();

  renderAll();
};

const handleDelete = (e) => {
  const button = e.currentTarget;
  const id = button.dataset.id;

  if (confirm('Are you sure you want to delete this expense?')) {
    deleteExpense(id);
    renderAll();
  }
};

const handleEdit = (e) => {
  const button = e.currentTarget;
  const id = button.dataset.id;
  const expense = expenses.find(exp => exp.id === id);

  if (!expense) return;

  const newDescription = prompt('Enter new description:', expense.description);
  if (newDescription === null) return;

  const newAmount = prompt('Enter new amount:', expense.amount);
  if (newAmount === null) return;

  const newCategory = prompt(
    `Enter new category (${Object.keys(CATEGORIES).join(', ')}):`,
    expense.category
  );
  if (newCategory === null) return;

  if (!CATEGORIES[newCategory]) {
    alert('Invalid category');
    return;
  }

  const updates = {
    description: newDescription.trim() || expense.description,
    amount: parseFloat(newAmount) || expense.amount,
    category: newCategory.trim() || expense.category
  };

  updateExpense(id, updates);
  renderAll();
};

const handleFilterChange = (e) => {
  currentFilter = e.target.value;
  renderAll();
};

const init = () => {
  expenses = getFromLocalStorage();

  const form = document.getElementById('expense-form');
  const filterSelect = document.getElementById('filter-category');

  form.addEventListener('submit', handleSubmit);
  filterSelect.addEventListener('change', handleFilterChange);

  renderAll();
};

document.addEventListener('DOMContentLoaded', init);
