/* ==========================================================================
   Flow · Datos
   Todo se guarda en localStorage (clave "flow.v1"). Las categorías se cargan
   con fetch desde data/categories.json, con una copia de respaldo.
   ========================================================================== */
window.Flow = window.Flow || {};
(() => {
  const KEY = 'flow.v1';
  const FALLBACK_CATEGORIES = [
    { id: 'salary', type: 'income', en: 'Salary', es: 'Salario', color: '#3DDC97' },
    { id: 'sales', type: 'income', en: 'Sales', es: 'Ventas', color: '#2DD4BF' },
    { id: 'freelance', type: 'income', en: 'Freelance', es: 'Freelance', color: '#7DD3FC' },
    { id: 'rent', type: 'expense', en: 'Rent', es: 'Alquiler', color: '#FF8A65' },
    { id: 'food', type: 'expense', en: 'Food', es: 'Comida', color: '#FBBF24' },
    { id: 'transport', type: 'expense', en: 'Transport', es: 'Transporte', color: '#60A5FA' },
    { id: 'services', type: 'expense', en: 'Bills & services', es: 'Servicios', color: '#C084FC' },
    { id: 'marketing', type: 'expense', en: 'Marketing', es: 'Marketing', color: '#F472B6' },
    { id: 'health', type: 'expense', en: 'Health', es: 'Salud', color: '#FB7185' },
    { id: 'other', type: 'expense', en: 'Other', es: 'Otros', color: '#94A3B8' }
  ];
  const DEFAULT_BUDGETS = { rent: 1400, food: 520, transport: 220, services: 260, marketing: 180, health: 120, other: 150 };

  let categories = FALLBACK_CATEGORIES;
  let state = { transactions: [], budgets: { ...DEFAULT_BUDGETS }, demo: false };

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function read() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  async function loadCategories() {
    try {
      const res = await fetch('data/categories.json');
      if (res.ok) categories = await res.json();
    } catch (e) { /* se usa la copia de respaldo */ }
    return categories;
  }

  /* Datos de ejemplo: 6 meses de movimientos creíbles hasta hoy */
  function demoData() {
    const tx = [];
    const now = new Date();
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const pick = arr => arr[Math.floor(rnd() * arr.length)];
    const add = (y, m, d, type, category, amount, en, es) => {
      const date = new Date(y, m, d);
      if (date > now) return;
      tx.push({ id: uid(), type, category, amount: Math.round(amount * 100) / 100, desc: { en, es }, date: iso(date) });
    };
    for (let back = 5; back >= 0; back--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - back, 1);
      const y = ref.getFullYear(), m = ref.getMonth();
      add(y, m, 1, 'income', 'salary', 4200, 'Monthly salary', 'Sueldo mensual');
      add(y, m, 3, 'expense', 'rent', 1350, 'Apartment rent', 'Alquiler del departamento');
      add(y, m, 5 + Math.floor(rnd() * 4), 'income', 'freelance', 600 + Math.round(rnd() * 900), 'Website for a client', 'Web para un cliente');
      if (rnd() > 0.35) add(y, m, 14 + Math.floor(rnd() * 6), 'income', 'sales', 180 + Math.round(rnd() * 420), 'Online store sales', 'Ventas de la tienda online');
      add(y, m, 8, 'expense', 'services', 89.99, 'Internet & phone', 'Internet y celular');
      add(y, m, 12, 'expense', 'services', 64 + Math.round(rnd() * 40), 'Electricity', 'Luz');
      add(y, m, 20, 'expense', 'marketing', 60 + Math.round(rnd() * 120), 'Instagram ads', 'Publicidad en Instagram');
      for (let i = 0; i < 9; i++) add(y, m, 2 + Math.floor(rnd() * 26), 'expense', 'food', 18 + rnd() * 70, pick(['Groceries', 'Coffee & pastry', 'Dinner out', 'Farmers market']), pick(['Supermercado', 'Café y medialunas', 'Cena afuera', 'Feria']));
      for (let i = 0; i < 5; i++) add(y, m, 2 + Math.floor(rnd() * 26), 'expense', 'transport', 12 + rnd() * 45, pick(['Gas', 'Uber', 'Parking']), pick(['Nafta', 'Uber', 'Estacionamiento']));
      if (rnd() > 0.5) add(y, m, 10 + Math.floor(rnd() * 15), 'expense', 'health', 35 + rnd() * 90, 'Pharmacy', 'Farmacia');
      if (rnd() > 0.4) add(y, m, 6 + Math.floor(rnd() * 20), 'expense', 'other', 25 + rnd() * 110, pick(['Gift', 'Books', 'Haircut']), pick(['Regalo', 'Libros', 'Corte de pelo']));
    }
    return tx;
  }

  function init() {
    const saved = read();
    if (saved && Array.isArray(saved.transactions)) state = { budgets: { ...DEFAULT_BUDGETS }, ...saved };
    else { state = { transactions: demoData(), budgets: { ...DEFAULT_BUDGETS }, demo: true }; save(); }
  }

  const api = {
    init, loadCategories,
    get categories() { return categories; },
    category: id => categories.find(c => c.id === id) || categories[categories.length - 1],
    get transactions() { return state.transactions; },
    get budgets() { return state.budgets; },
    get isDemo() { return state.demo; },
    add(tx) { const t = { id: uid(), ...tx }; state.transactions.push(t); save(); return t; },
    update(id, patch) { const t = state.transactions.find(x => x.id === id); if (t) Object.assign(t, patch); save(); },
    remove(id) { const i = state.transactions.findIndex(x => x.id === id); if (i < 0) return null; const [t] = state.transactions.splice(i, 1); save(); return { t, i }; },
    restore({ t, i }) { state.transactions.splice(i, 0, t); save(); },
    setBudget(cat, amount) { state.budgets[cat] = amount; save(); },
    clearAll() { state = { transactions: [], budgets: { ...DEFAULT_BUDGETS }, demo: false }; save(); },
    loadDemo() { state = { transactions: demoData(), budgets: { ...DEFAULT_BUDGETS }, demo: true }; save(); },
    iso
  };
  window.Flow.store = api;
})();
