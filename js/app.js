/* ==========================================================================
   Flow · Dashboard
   1. Estado y utilidades   2. Indicadores   3. Gráficos   4. Presupuestos
   5. Lista de movimientos   6. Formulario   7. Avisos   8. Tema, mes y menú
   ========================================================================== */
(async () => {
  'use strict';
  const { store } = Flow;
  const I = Flow.i18n;
  const $ = s => document.querySelector(s);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 1. Estado y utilidades ---------------- */
  store.init();
  await store.loadCategories();
  I.init();

  const now = new Date();
  const view = { y: now.getFullYear(), m: now.getMonth() };
  const filters = { q: '', type: 'all', cat: 'all', sort: 'new' };
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const descOf = tx => (typeof tx.desc === 'object' ? tx.desc[I.lang] || tx.desc.en : tx.desc);
  const catName = id => store.category(id)[I.lang];
  const inMonth = (tx, y, m) => { const [ty, tm] = tx.date.split('-').map(Number); return ty === y && tm - 1 === m; };
  const sum = (list, type) => list.filter(t => !type || t.type === type).reduce((a, t) => a + t.amount, 0);
  const monthTx = (y, m) => store.transactions.filter(t => inMonth(t, y, m));
  const shift = (y, m, d) => { const x = new Date(y, m + d, 1); return { y: x.getFullYear(), m: x.getMonth() }; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Números que suben hasta su valor
  function countTo(el, value, format) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = value;
    if (reduced || from === value) { el.textContent = format(value); return; }
    const t0 = performance.now(), dur = 700;
    const step = t => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = format(from + (value - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------------- 2. Indicadores ---------------- */
  function renderTop() {
    const h = now.getHours();
    $('#hello').textContent = I.t(h < 12 ? 'helloMorning' : h < 19 ? 'helloAfternoon' : 'helloEvening');
    $('#monthLabel').textContent = I.monthName(view.y, view.m);
    const isNow = view.y === now.getFullYear() && view.m === now.getMonth();
    $('#nextMonth').disabled = isNow;
    $('#nextMonth').style.opacity = isNow ? .3 : 1;
    $('#demoBar').hidden = !store.isDemo;
  }

  function delta(cur, prev, goodWhenUp) {
    if (!prev) return '';
    const pct = Math.round(((cur - prev) / prev) * 100);
    const good = goodWhenUp ? pct >= 0 : pct <= 0;
    return `<span class="delta ${good ? 'delta--good' : 'delta--bad'}">${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%</span> ${esc(I.t('vsPrev'))}`;
  }

  function renderKpis() {
    const all = store.transactions;
    const cur = monthTx(view.y, view.m);
    const p = shift(view.y, view.m, -1);
    const prev = monthTx(p.y, p.m);
    const inc = sum(cur, 'income'), exp = sum(cur, 'expense');
    const balance = sum(all, 'income') - sum(all, 'expense');
    const rate = inc > 0 ? Math.max(0, Math.round(((inc - exp) / inc) * 100)) : 0;
    countTo($('#kBalance'), balance, v => I.money(v));
    countTo($('#kIncome'), inc, v => I.money(v));
    countTo($('#kExpense'), exp, v => I.money(v));
    countTo($('#kSavings'), rate, v => `${Math.round(v)}%`);
    $('#kIncomeDelta').innerHTML = delta(inc, sum(prev, 'income'), true);
    $('#kExpenseDelta').innerHTML = delta(exp, sum(prev, 'expense'), false);
    $('#kSavingsBar').style.width = `${Math.min(100, rate)}%`;
  }

  /* ---------------- 3. Gráficos (Chart.js) ---------------- */
  let flowChart, catChart;
  function chartBase() {
    Chart.defaults.font.family = cssVar('--f-sans');
    Chart.defaults.color = cssVar('--muted');
  }
  function renderCharts() {
    chartBase();
    const months = [];
    for (let i = 5; i >= 0; i--) months.push(shift(view.y, view.m, -i));
    const labels = months.map(({ y, m }) => I.monthName(y, m, 'short'));
    const incs = months.map(({ y, m }) => sum(monthTx(y, m), 'income'));
    const exps = months.map(({ y, m }) => sum(monthTx(y, m), 'expense'));
    const grid = cssVar('--line');

    const flowData = {
      labels,
      datasets: [
        { label: I.t('income'), data: incs, backgroundColor: cssVar('--accent'), borderRadius: 6, maxBarThickness: 26 },
        { label: I.t('expenses'), data: exps, backgroundColor: cssVar('--expense'), borderRadius: 6, maxBarThickness: 26 }
      ]
    };
    if (flowChart) { flowChart.data = flowData; flowChart.options.scales.y.grid.color = grid; flowChart.update(); }
    else flowChart = new Chart($('#flowChart'), {
      type: 'bar', data: flowData,
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: reduced ? 0 : 900, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${I.money(c.raw)}` } } },
        scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: grid }, border: { display: false }, ticks: { callback: v => I.shortMoney(v), maxTicksLimit: 5 } } }
      }
    });

    // Gastos del mes por categoría
    const cur = monthTx(view.y, view.m).filter(t => t.type === 'expense');
    const byCat = {};
    cur.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((a, [, v]) => a + v, 0);
    const catData = {
      labels: entries.map(([k]) => catName(k)),
      datasets: [{ data: entries.length ? entries.map(([, v]) => v) : [1], backgroundColor: entries.length ? entries.map(([k]) => store.category(k).color) : [cssVar('--surface-3')], borderWidth: 0, spacing: 2, borderRadius: 4 }]
    };
    if (catChart) { catChart.data = catData; catChart.update(); }
    else catChart = new Chart($('#catChart'), {
      type: 'doughnut', data: catData,
      options: { cutout: '72%', animation: { duration: reduced ? 0 : 900 }, plugins: { legend: { display: false }, tooltip: { enabled: entries.length > 0, callbacks: { label: c => `${c.label}: ${I.money(c.raw)}` } } } }
    });
    catChart.options.plugins.tooltip.enabled = entries.length > 0;
    $('#donutTotal').textContent = I.money(total, { cents: false });
    $('#catList').innerHTML = entries.slice(0, 6).map(([k, v]) => `<li><i style="background:${store.category(k).color}"></i><span>${esc(catName(k))}</span><b class="num">${I.money(v, { cents: false })}</b><em class="num">${Math.round((v / total) * 100)}%</em></li>`).join('');
  }

  /* ---------------- 4. Presupuestos e insights ---------------- */
  function renderBudgets() {
    const cur = monthTx(view.y, view.m).filter(t => t.type === 'expense');
    const cats = store.categories.filter(c => c.type === 'expense');
    $('#budgetList').innerHTML = cats.map(c => {
      const spent = sum(cur.filter(t => t.category === c.id));
      const limit = store.budgets[c.id] || 0;
      const pct = limit ? (spent / limit) * 100 : 0;
      const color = pct >= 100 ? cssVar('--expense') : pct >= 80 ? cssVar('--warn') : c.color;
      const stateCls = pct >= 100 ? 'budget__state--over' : pct >= 80 ? 'budget__state--warn' : '';
      const stateTxt = !limit ? I.t('noBudget') : pct >= 100 ? `${I.money(spent - limit, { cents: false })} ${I.t('over')}` : `${I.money(limit - spent, { cents: false })} ${I.t('left')}`;
      return `<li class="budget">
        <div class="budget__row"><span class="budget__name"><i style="background:${c.color}"></i>${esc(c[I.lang])}</span>
        <span class="budget__nums"><b class="num">${I.money(spent, { cents: false })}</b> / $<input class="budget__limit" type="number" min="0" step="10" value="${limit}" data-cat="${c.id}" aria-label="${esc(c[I.lang])} budget"></span></div>
        <div class="bar"><span style="width:${Math.min(100, pct)}%;background:${color}"></span></div>
        <p class="budget__state ${stateCls}">${stateTxt}</p></li>`;
    }).join('');

    const inc = sum(monthTx(view.y, view.m), 'income');
    const exp = sum(cur);
    const byCat = {};
    cur.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    const isNow = view.y === now.getFullYear() && view.m === now.getMonth();
    const days = isNow ? now.getDate() : new Date(view.y, view.m + 1, 0).getDate();
    const rate = inc > 0 ? Math.max(0, Math.round(((inc - exp) / inc) * 100)) : 0;
    $('#insightList').innerHTML = `
      <li class="insight"><p>${esc(I.t('insightTop'))}</p><strong>${top ? `${esc(catName(top[0]))} · <span class="num">${I.money(top[1], { cents: false })}</span>` : '—'}</strong></li>
      <li class="insight"><p>${esc(I.t('insightRate'))} <b class="num" style="color:var(--accent)">${rate}%</b> ${esc(I.t('insightRateB'))}</p><strong class="num">${I.money(Math.max(0, inc - exp), { cents: false })}</strong></li>
      <li class="insight"><p>${esc(I.t('insightAvg'))}</p><strong class="num">${I.money(exp / Math.max(1, days))}</strong></li>`;
  }
  $('#budgetList').addEventListener('change', e => {
    const input = e.target.closest('.budget__limit');
    if (!input) return;
    store.setBudget(input.dataset.cat, Math.max(0, Number(input.value) || 0));
    renderBudgets();
  });

  /* ---------------- 5. Lista de movimientos ---------------- */
  function fillCategorySelects() {
    const f = $('#catFilter');
    const keep = f.value;
    f.innerHTML = `<option value="all">${esc(I.t('allCategories'))}</option>` + store.categories.map(c => `<option value="${c.id}">${esc(c[I.lang])}</option>`).join('');
    f.value = keep || 'all';
  }

  let justAdded = null;
  function renderList() {
    const q = filters.q.toLowerCase();
    let list = store.transactions.filter(t =>
      (filters.type === 'all' || t.type === filters.type) &&
      (filters.cat === 'all' || t.category === filters.cat) &&
      (!q || descOf(t).toLowerCase().includes(q) || catName(t.category).toLowerCase().includes(q)));
    const pos = new Map(store.transactions.map((t, i) => [t.id, i]));
    const sorters = { new: (a, b) => b.date.localeCompare(a.date) || pos.get(b.id) - pos.get(a.id), old: (a, b) => a.date.localeCompare(b.date) || pos.get(a.id) - pos.get(b.id), high: (a, b) => b.amount - a.amount, low: (a, b) => a.amount - b.amount };
    list = list.slice().sort(sorters[filters.sort]);
    $('#txCount').textContent = list.length;
    $('#txEmpty').hidden = list.length > 0;
    $('#txEmpty').querySelector('.btn')?.remove();
    if (!store.transactions.length) {
      const b = document.createElement('button');
      b.className = 'btn btn--ghost'; b.type = 'button'; b.textContent = I.t('loadDemo');
      b.addEventListener('click', () => { store.loadDemo(); renderAll(); toast(I.t('tDemo')); });
      $('#txEmpty').append(b);
    }

    const today = store.iso(now);
    const yest = store.iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    const dayLabel = d => d === today ? I.t('today') : d === yest ? I.t('yesterday') : I.date(d, { weekday: 'short', day: 'numeric', month: 'short', year: d.slice(0, 4) === String(now.getFullYear()) ? undefined : 'numeric' });
    const row = t => {
      const c = store.category(t.category);
      const isIn = t.type === 'income';
      return `<div class="tx${t.id === justAdded ? ' is-new' : ''}" data-id="${t.id}">
        <span class="tx__icon" style="background:${c.color}22;color:${c.color}" aria-hidden="true">${esc(c[I.lang].charAt(0))}</span>
        <div class="tx__main"><p class="tx__desc">${esc(descOf(t))}</p><p class="tx__cat">${esc(c[I.lang])}${filters.sort === 'high' || filters.sort === 'low' ? ' · ' + esc(I.date(t.date)) : ''}</p></div>
        <p class="tx__amt num ${isIn ? 'tx__amt--in' : ''}">${isIn ? '+' : '−'}${I.money(t.amount)}</p>
        <div class="tx__acts"><button class="icon-btn" type="button" data-act="edit" aria-label="${esc(I.t('edit'))}: ${esc(descOf(t))}"><svg aria-hidden="true"><use href="#i-edit"/></svg></button><button class="icon-btn" type="button" data-act="del" aria-label="${esc(I.t('delete'))}: ${esc(descOf(t))}"><svg aria-hidden="true"><use href="#i-trash"/></svg></button></div>
      </div>`;
    };
    const max = 80; // se muestran los primeros 80 para que la página siga liviana
    if (filters.sort === 'new' || filters.sort === 'old') {
      const groups = [];
      list.slice(0, max).forEach(t => { const g = groups[groups.length - 1]; if (g && g.d === t.date) g.items.push(t); else groups.push({ d: t.date, items: [t] }); });
      $('#txList').innerHTML = groups.map(g => {
        const net = g.items.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);
        return `<div class="txday"><p class="txday__label"><span>${esc(dayLabel(g.d))}</span><span class="num">${net >= 0 ? '+' : '−'}${I.money(Math.abs(net))}</span></p>${g.items.map(row).join('')}</div>`;
      }).join('');
    } else $('#txList').innerHTML = list.slice(0, max).map(row).join('');
    justAdded = null;
  }

  $('#search').addEventListener('input', e => { filters.q = e.target.value; renderList(); });
  $('#catFilter').addEventListener('change', e => { filters.cat = e.target.value; renderList(); });
  $('#sort').addEventListener('change', e => { filters.sort = e.target.value; renderList(); });
  $('#typeSeg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filters.type = b.dataset.type;
    $('#typeSeg').querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    renderList();
  });
  $('#txList').addEventListener('click', e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const id = b.closest('.tx').dataset.id;
    if (b.dataset.act === 'edit') openModal(store.transactions.find(t => t.id === id));
    else {
      const removed = store.remove(id);
      renderAll();
      toast(I.t('tDeleted'), I.t('undo'), () => { store.restore(removed); renderAll(); });
    }
  });

  /* ---------------- 6. Formulario (agregar / editar) ---------------- */
  const modal = $('#txModal');
  let editing = null;
  function fillFormCategories(type, selected) {
    const opts = store.categories.filter(c => c.type === type);
    $('#fCategory').innerHTML = opts.map(c => `<option value="${c.id}">${esc(c[I.lang])}</option>`).join('');
    $('#fCategory').value = opts.some(c => c.id === selected) ? selected : opts[0].id;
  }
  function clearErrors() { ['Amount', 'Desc', 'Date'].forEach(k => { $('#err' + k).textContent = ''; $('#f' + k).removeAttribute('aria-invalid'); }); }
  function openModal(tx) {
    editing = tx || null;
    clearErrors();
    $('#modalTitle').textContent = I.t(tx ? 'mEdit' : 'mNew');
    const type = tx ? tx.type : 'expense';
    modal.querySelector(`input[name="type"][value="${type}"]`).checked = true;
    fillFormCategories(type, tx && tx.category);
    $('#fAmount').value = tx ? tx.amount : '';
    $('#fDesc').value = tx ? descOf(tx) : '';
    $('#fDate').value = tx ? tx.date : store.iso(now);
    modal.showModal();
    setTimeout(() => $('#fAmount').focus(), 50);
  }
  ['Amount', 'Desc', 'Date'].forEach(k => $('#f' + k).addEventListener('input', () => { $('#err' + k).textContent = ''; $('#f' + k).removeAttribute('aria-invalid'); }));
  modal.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', () => fillFormCategories(r.value)));
  $('#addBtn').addEventListener('click', () => openModal());
  $('#closeModal').addEventListener('click', () => modal.close());
  $('#cancelModal').addEventListener('click', () => modal.close());
  $('#txForm').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const amount = Number($('#fAmount').value);
    const desc = $('#fDesc').value.trim();
    const date = $('#fDate').value;
    let ok = true;
    const fail = (k, msg) => { $('#err' + k).textContent = I.t(msg); $('#f' + k).setAttribute('aria-invalid', 'true'); if (ok) $('#f' + k).focus(); ok = false; };
    if (!(amount > 0)) fail('Amount', 'eAmount');
    if (!desc) fail('Desc', 'eDesc');
    if (!date) fail('Date', 'eDate');
    if (!ok) return;
    const data = { type: modal.querySelector('input[name="type"]:checked').value, amount: Math.round(amount * 100) / 100, desc, category: $('#fCategory').value, date };
    if (editing) { store.update(editing.id, data); justAdded = editing.id; toast(I.t('tSaved')); }
    else { const t = store.add(data); justAdded = t.id; toast(I.t('tAdded')); }
    modal.close();
    const [y, m] = date.split('-').map(Number);
    view.y = y; view.m = m - 1;
    renderAll();
  });

  // Empezar de cero (con confirmación propia, sin alert)
  const fresh = $('#freshModal');
  $('#freshBtn').addEventListener('click', () => fresh.showModal());
  $('#freshNo').addEventListener('click', () => fresh.close());
  $('#freshYes').addEventListener('click', () => { store.clearAll(); fresh.close(); renderAll(); toast(I.t('tFresh')); });

  // Exportar a CSV
  $('#exportBtn').addEventListener('click', () => {
    const rows = [['date', 'type', 'category', 'description', 'amount']];
    store.transactions.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(t => rows.push([t.date, t.type, catName(t.category), descOf(t), (t.type === 'expense' ? -t.amount : t.amount).toFixed(2)]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `flow-${store.iso(now)}.csv`;
    document.body.append(a); a.click(); a.remove();
    toast(I.t('tExport'));
  });

  /* ---------------- 7. Avisos ---------------- */
  let toastTimer;
  function toast(msg, actionLabel, action) {
    const el = $('#toast'), btn = $('#toastAction');
    $('#toastMsg').textContent = msg;
    btn.hidden = !actionLabel;
    btn.textContent = actionLabel || '';
    btn.onclick = () => { action && action(); el.hidden = true; };
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, actionLabel ? 6000 : 2600);
  }

  /* ---------------- 8. Tema, mes y menú ---------------- */
  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('flow.theme', next); } catch (e) {}
    flowChart && flowChart.destroy(); catChart && catChart.destroy(); flowChart = catChart = null;
    renderAll();
  });
  $('#prevMonth').addEventListener('click', () => { Object.assign(view, shift(view.y, view.m, -1)); renderAll(); });
  $('#nextMonth').addEventListener('click', () => { Object.assign(view, shift(view.y, view.m, 1)); renderAll(); });
  document.addEventListener('flow:lang', () => renderAll());

  // Marca la sección visible en el menú
  const links = [...document.querySelectorAll('.side__nav a')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  ['overview', 'insights', 'budgets', 'transactions'].forEach(id => io.observe(document.getElementById(id)));

  function renderAll() {
    renderTop(); renderKpis(); renderCharts(); renderBudgets(); fillCategorySelects(); renderList();
  }
  renderAll();
})();
