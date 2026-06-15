const API = 'api/index.php';

const state = {
    expenses:   [],
    insights:   null,
    budgets:    [],
    categories: [],
    filters:    { category: '', month: currentMonth(), search: '' },
    editId:     null,
    chart:      null,
};

// Helpers

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function fmt(n) {
    return parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function categoryColor(cat) {
    const map = {
        Food:          '#4f8ef7',
        Transport:     '#f7a24f',
        Education:     '#7c4ff7',
        Entertainment: '#f74f9e',
        Health:        '#4fc97a',
        Rent:          '#f74f4f',
        Shopping:      '#4fd6f7',
        Other:         '#a3a3a3',
    };
    return map[cat] || '#a3a3a3';
}

async function apiFetch(resource, method = 'GET', body = null, params = {}) {
    const url = new URL(API, window.location.href);
    url.searchParams.set('resource', resource);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
            url.searchParams.set(k, v);
        }
    });

    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const raw = await res.text();
    let data;
    try {
        data = raw ? JSON.parse(raw) : {};
    } catch {
        throw new Error(`Server returned non-JSON response (${res.status}). Please check API/PHP errors.`);
    }
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast show ${type}`;
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Load & Render

async function loadAll() {
    try {
        const [expenses, insights, budgets, categories] = await Promise.all([
            apiFetch('expenses', 'GET', null, state.filters),
            apiFetch('insights', 'GET', null, { month: state.filters.month }),
            apiFetch('budgets',  'GET', null, { month: state.filters.month }),
            state.categories.length ? Promise.resolve(state.categories) : apiFetch('categories'),
        ]);

        state.expenses   = expenses;
        state.insights   = insights;
        state.budgets    = budgets;
        if (!state.categories.length) {
            state.categories = categories;
            populateCategoryDropdowns(categories);
        }

        renderInsights();
        renderExpenseList();
        renderBudgets();
        renderChart();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function populateCategoryDropdowns(cats) {
    ['expense-category', 'filter-category', 'budget-category', 'modal-category'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const isFilter = id === 'filter-category';
        el.innerHTML = isFilter ? '<option value="">All categories</option>' : '<option value="">Select category</option>';
        cats.forEach(c => el.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
    });
}

// ── Insights Panel ────────────────────────────────────────────

function renderInsights() {
    const { total, count, byCategory } = state.insights;
    const topCat = byCategory[0];

    document.getElementById('total-spent').textContent = `$${fmt(total)}`;
    document.getElementById('expense-count').textContent = count;
    document.getElementById('top-category').textContent = topCat ? topCat.category : '—';
    document.getElementById('avg-expense').textContent = count ? `$${fmt(total / count)}` : '$0.00';
}

// Expense List

function renderExpenseList() {
    const list  = document.getElementById('expense-list');
    const empty = document.getElementById('empty-state');

    if (!state.expenses.length) {
        list.innerHTML  = '';
        empty.hidden    = false;
        return;
    }
    empty.hidden = true;

    list.innerHTML = state.expenses.map(e => `
    <div class="expense-row" data-id="${e.id}">
      <div class="expense-dot" style="background:${categoryColor(e.category)}"></div>
      <div class="expense-info">
        <span class="expense-desc">${escHtml(e.description)}</span>
        <span class="expense-meta">
          <span class="badge" style="background:${categoryColor(e.category)}20;color:${categoryColor(e.category)}">${e.category}</span>
          <span>${e.date}</span>
        </span>
      </div>
      <div class="expense-amount">$${fmt(e.amount)}</div>
      <div class="expense-actions">
        <button class="btn-icon edit-btn" data-id="${e.id}" title="Edit">&#9998;</button>
        <button class="btn-icon delete-btn" data-id="${e.id}" title="Delete">&#10005;</button>
      </div>
    </div>`).join('');

    list.querySelectorAll('.delete-btn').forEach(btn =>
        btn.addEventListener('click', () => deleteExpense(+btn.dataset.id)));
    list.querySelectorAll('.edit-btn').forEach(btn =>
        btn.addEventListener('click', () => openEditModal(+btn.dataset.id)));
}

function escHtml(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Budget Panel

function renderBudgets() {
    const container = document.getElementById('budget-list');
    if (!state.budgets.length) {
        container.innerHTML = '<p class="muted-text">No budgets set. Add one below.</p>';
        return;
    }

    container.innerHTML = state.budgets.map(b => {
        const pct     = Math.min((b.spent / b.monthly_limit) * 100, 100);
        const over    = b.spent > b.monthly_limit;
        const barColor= over ? '#f74f4f' : pct > 80 ? '#f7a24f' : '#4fc97a';
        return `
        <div class="budget-item">
          <div class="budget-header">
            <span>${b.category}</span>
            <span class="${over ? 'text-danger' : ''}">$${fmt(b.spent)} / $${fmt(b.monthly_limit)}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          ${over ? '<small class="text-danger">Over budget by $' + fmt(b.spent - b.monthly_limit) + '</small>' : ''}
          <button class="btn-icon delete-budget" data-cat="${b.category}" title="Remove budget">&#10005;</button>
        </div>`;
    }).join('');

    container.querySelectorAll('.delete-budget').forEach(btn =>
        btn.addEventListener('click', () => deleteBudget(btn.dataset.cat)));
}

// Chart

function renderChart() {
    const activeTab = document.querySelector('.chart-tab.active')?.dataset.chart || 'category';
    if (activeTab === 'category') renderCategoryChart();
    else renderTrendChart();
}

function renderCategoryChart() {
    const ctx = document.getElementById('main-chart').getContext('2d');
    if (state.chart) state.chart.destroy();

    const { byCategory } = state.insights;
    state.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels:   byCategory.map(c => c.category),
            datasets: [{ data: byCategory.map(c => c.total), backgroundColor: byCategory.map(c => categoryColor(c.category)), borderWidth: 2, borderColor: '#fff' }],
        },
        options: { plugins: { legend: { position: 'right' } }, cutout: '62%', responsive: true, maintainAspectRatio: false },
    });
}

function renderTrendChart() {
    const ctx = document.getElementById('main-chart').getContext('2d');
    if (state.chart) state.chart.destroy();

    const { monthly } = state.insights;
    state.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels:   monthly.map(m => m.month),
            datasets: [{ label: 'Monthly spending', data: monthly.map(m => m.total), backgroundColor: '#4f8ef740', borderColor: '#4f8ef7', borderWidth: 2, borderRadius: 6 }],
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } } }, responsive: true, maintainAspectRatio: false },
    });
}

// Expense CRUD

document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        amount:      document.getElementById('expense-amount').value,
        category:    document.getElementById('expense-category').value,
        date:        document.getElementById('expense-date').value,
        description: document.getElementById('expense-desc').value,
    };

    try {
        if (state.editId) {
            await apiFetch('expenses', 'PUT', { ...data, id: state.editId });
            showToast('Expense updated');
            closeEditModal();
        } else {
            await apiFetch('expenses', 'POST', data);
            showToast('Expense added');
            e.target.reset();
            document.getElementById('expense-date').value = new Date().toISOString().slice(0,10);
        }
        await loadAll();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        await apiFetch('expenses', 'DELETE', { id });
        showToast('Expense deleted');
        await loadAll();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Edit Modal

function openEditModal(id) {
    const e = state.expenses.find(x => x.id === id);
    if (!e) return;
    state.editId = id;

    document.getElementById('modal-amount').value   = e.amount;
    document.getElementById('modal-category').value = e.category;
    document.getElementById('modal-date').value     = e.date;
    document.getElementById('modal-desc').value     = e.description;

    document.getElementById('edit-modal').classList.add('show');
}

function closeEditModal() {
    state.editId = null;
    document.getElementById('edit-modal').classList.remove('show');
}

document.getElementById('modal-close').addEventListener('click', closeEditModal);
document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target.id === 'edit-modal') closeEditModal();
});

document.getElementById('modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        id:          state.editId,
        amount:      document.getElementById('modal-amount').value,
        category:    document.getElementById('modal-category').value,
        date:        document.getElementById('modal-date').value,
        description: document.getElementById('modal-desc').value,
    };
    try {
        await apiFetch('expenses', 'PUT', data);
        showToast('Expense updated');
        closeEditModal();
        await loadAll();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// Filters

document.getElementById('filter-category').addEventListener('change', e => {
    state.filters.category = e.target.value;
    loadAll();
});

document.getElementById('filter-month').addEventListener('change', e => {
    state.filters.month = e.target.value;
    loadAll();
});

document.getElementById('filter-search').addEventListener('input', debounce(e => {
    state.filters.search = e.target.value;
    loadAll();
}, 350));

function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// Budget CRUD

document.getElementById('budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        category:      document.getElementById('budget-category').value,
        monthly_limit: document.getElementById('budget-limit').value,
    };
    try {
        await apiFetch('budgets', 'POST', data);
        showToast('Budget saved');
        e.target.reset();
        await loadAll();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

async function deleteBudget(category) {
    try {
        await apiFetch('budgets', 'DELETE', { category });
        showToast('Budget removed');
        await loadAll();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Chart Tabs

document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderChart();
    });
});

// Export CSV

document.getElementById('export-btn').addEventListener('click', () => {
    if (!state.expenses.length) { showToast('No expenses to export', 'error'); return; }

    const rows  = [['ID', 'Date', 'Category', 'Amount', 'Description']];
    state.expenses.forEach(e => rows.push([e.id, e.date, e.category, e.amount, `"${e.description}"`]));
    const csv   = rows.map(r => r.join(',')).join('\n');
    const blob  = new Blob([csv], { type: 'text/csv' });
    const a     = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `expenses-${state.filters.month || 'all'}.csv` });
    a.click();
});

// Tab Navigation

document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
        btn.classList.add('active');
        document.getElementById(btn.dataset.panel).hidden = false;
    });
});

// Init

document.getElementById('expense-date').value     = new Date().toISOString().slice(0, 10);
document.getElementById('filter-month').value     = currentMonth();
state.filters.month = currentMonth();

loadAll();
