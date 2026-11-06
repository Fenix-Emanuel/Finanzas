/* ==========================================================================
   Flow · Idioma (EN/ES) y formatos de moneda y fecha
   Cada texto de la página lleva data-i18n="clave". El inglés es el texto
   del HTML; el español vive acá.
   ========================================================================== */
window.Flow = window.Flow || {};
(() => {
  const ES = {
    // Comunes
    skip: 'Ir al contenido', tryDemo: 'Probar la demo', openApp: 'Abrir la app',
    langLabel: 'Switch to English', madeBy: 'Diseñada y programada por', ignisSeal: 'Hecho en',
    // Landing
    navFeatures: 'Funciones', navPrivacy: 'Privacidad', navHow: 'Cómo funciona',
    heroKicker: 'Finanzas personales y de emprendimientos',
    heroTitle: 'Tu plata, por fin en orden.',
    heroLead: 'Registrá ingresos y gastos en segundos, mirá adónde va cada dólar y mantenete dentro del presupuesto. Sin registrarte: tus datos se quedan en tu navegador.',
    seeFeatures: 'Ver funciones', heroNote: 'Gratis · Sin cuenta · Funciona en el celular',
    f1Kicker: '01 · Registrar', f1Title: 'Anotá un movimiento en cinco segundos.', f1Text: 'Monto, categoría y listo. Flow completa la fecha, recuerda tus categorías y actualiza todo al instante.',
    f2Kicker: '02 · Entender', f2Title: 'Mirá adónde se va tu plata.', f2Text: 'Flujo de caja de seis meses, gastos por categoría y tu tasa de ahorro del mes, con gráficos que se actualizan solos.',
    f3Kicker: '03 · Controlar', f3Title: 'Presupuestos que te avisan antes.', f3Text: 'Poné un tope por categoría y mirá cuánto te queda. La barra cambia de color cuando te acercás al límite.',
    privTitle: 'Privada por diseño.', privText: 'Flow no tiene servidor: todo se guarda en tu navegador. Podés exportar tus movimientos a CSV cuando quieras y borrar todo con un clic.',
    privA: 'Sin cuenta ni contraseña', privB: 'Exportá a CSV o Excel', privC: 'Funciona sin conexión',
    ctaTitle: 'Probala con datos de ejemplo.', ctaText: 'Seis meses de movimientos ya cargados para que veas todo funcionando. Cuando quieras, empezás de cero.',
    stackLabel: 'Hecha con',
    // App
    navOverview: 'Resumen', navTransactions: 'Movimientos', navBudgets: 'Presupuestos', navInsights: 'Análisis',
    hello: 'Hola', helloMorning: 'Buen día', helloAfternoon: 'Buenas tardes', helloEvening: 'Buenas noches',
    demoBanner: 'Estás viendo datos de ejemplo.', startFresh: 'Empezar de cero', loadDemo: 'Cargar ejemplo',
    addTx: 'Agregar movimiento', exportCsv: 'Exportar CSV', theme: 'Cambiar tema',
    prevMonth: 'Mes anterior', nextMonth: 'Mes siguiente',
    kBalance: 'Balance total', kIncome: 'Ingresos del mes', kExpense: 'Gastos del mes', kSavings: 'Tasa de ahorro',
    vsPrev: 'vs. mes anterior', allTime: 'Desde el inicio',
    cashflow: 'Flujo de caja', last6: 'Últimos 6 meses', byCategory: 'Gastos por categoría', thisMonth: 'Este mes',
    income: 'Ingresos', expenses: 'Gastos', budgets: 'Presupuestos', budgetHint: 'Tocá un monto para editarlo',
    left: 'disponible', over: 'excedido', noBudget: 'Sin tope',
    transactions: 'Movimientos', search: 'Buscar', searchPh: 'Buscar por descripción', allTypes: 'Todos', allCategories: 'Todas las categorías',
    sortNewest: 'Más recientes', sortOldest: 'Más antiguos', sortHigh: 'Mayor monto', sortLow: 'Menor monto', sortBy: 'Ordenar',
    clear: 'Limpiar', results: 'movimientos', emptyTitle: 'No hay movimientos acá.', emptyText: 'Agregá el primero o cambiá los filtros.',
    edit: 'Editar', delete: 'Borrar', today: 'Hoy', yesterday: 'Ayer',
    mNew: 'Nuevo movimiento', mEdit: 'Editar movimiento', fType: 'Tipo', fIncome: 'Ingreso', fExpense: 'Gasto',
    fAmount: 'Monto', fDesc: 'Descripción', fDescPh: 'Ej.: Supermercado', fCategory: 'Categoría', fDate: 'Fecha',
    save: 'Guardar', cancel: 'Cancelar',
    eAmount: 'Ingresá un monto mayor a 0.', eDesc: 'Escribí una descripción corta.', eDate: 'Elegí una fecha.',
    tAdded: 'Movimiento agregado', tSaved: 'Cambios guardados', tDeleted: 'Movimiento borrado', undo: 'Deshacer',
    tFresh: 'Listo, empezás de cero', tDemo: 'Datos de ejemplo cargados', tExport: 'CSV descargado',
    confirmFresh: '¿Borrar todos los movimientos?', confirmFreshText: 'Esto elimina los datos guardados en este navegador. No se puede deshacer.', confirmYes: 'Sí, borrar todo',
    insightTop: 'Tu categoría con más gasto', insightRate: 'Ahorraste', insightRateB: 'de tus ingresos este mes', insightAvg: 'Gasto promedio por día'
  };
  const EN = {};
  let lang = 'en';
  const nodes = () => document.querySelectorAll('[data-i18n],[data-i18n-ph],[data-i18n-aria]');

  function cacheEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(n => { if (!(n.dataset.i18n in EN)) EN[n.dataset.i18n] = n.textContent; });
    document.querySelectorAll('[data-i18n-ph]').forEach(n => { if (!(n.dataset.i18nPh in EN)) EN[n.dataset.i18nPh] = n.placeholder; });
    document.querySelectorAll('[data-i18n-aria]').forEach(n => { if (!(n.dataset.i18nAria in EN)) EN[n.dataset.i18nAria] = n.getAttribute('aria-label'); });
  }
  // Textos que solo usa el JavaScript (no están en el HTML)
  Object.assign(EN, {
    hello: 'Hello', helloMorning: 'Good morning', helloAfternoon: 'Good afternoon', helloEvening: 'Good evening',
    vsPrev: 'vs. last month', left: 'left', over: 'over', noBudget: 'No limit', results: 'transactions',
    edit: 'Edit', delete: 'Delete', today: 'Today', yesterday: 'Yesterday', mNew: 'New transaction', mEdit: 'Edit transaction',
    eAmount: 'Enter an amount greater than 0.', eDesc: 'Add a short description.', eDate: 'Pick a date.',
    tAdded: 'Transaction added', tSaved: 'Changes saved', tDeleted: 'Transaction deleted', undo: 'Undo',
    tFresh: 'Done, you are starting fresh', tDemo: 'Sample data loaded', tExport: 'CSV downloaded',
    income: 'Income', expenses: 'Expenses', langLabel: 'Cambiar a español', loadDemo: 'Load sample data', allCategories: 'All categories',
    insightTop: 'Your top spending category', insightRate: 'You saved', insightRateB: 'of your income this month', insightAvg: 'Average spend per day'
  });

  function t(key) { return (lang === 'es' ? ES[key] : EN[key]) ?? EN[key] ?? key; }

  function apply(l) {
    lang = l;
    cacheEnglish();
    document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(n => { n.placeholder = t(n.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach(n => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
    document.documentElement.lang = l;
    document.querySelectorAll('[data-lang-btn]').forEach(b => {
      b.setAttribute('aria-label', t('langLabel'));
      b.querySelectorAll('[data-l]').forEach(s => s.classList.toggle('is-on', s.dataset.l === l));
    });
    try { localStorage.setItem('flow.lang', l); } catch (e) {}
    document.dispatchEvent(new CustomEvent('flow:lang', { detail: l }));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem('flow.lang'); } catch (e) {}
    apply(saved || ((navigator.language || 'en').startsWith('es') ? 'es' : 'en'));
    document.querySelectorAll('[data-lang-btn]').forEach(b => b.addEventListener('click', () => apply(lang === 'en' ? 'es' : 'en')));
  }

  const locale = () => (lang === 'es' ? 'es-US' : 'en-US');
  const money = (n, opts = {}) => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'USD', maximumFractionDigits: opts.cents === false ? 0 : 2, minimumFractionDigits: opts.cents === false ? 0 : 2 }).format(n);
  const shortMoney = n => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
  const date = (iso, opts = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat(locale(), opts).format(new Date(iso + 'T12:00:00'));
  const monthName = (y, m, style = 'long') => new Intl.DateTimeFormat(locale(), { month: style, year: style === 'long' ? 'numeric' : undefined }).format(new Date(y, m, 15));

  Object.assign(window.Flow, { i18n: { init, apply, t, get lang() { return lang; }, money, shortMoney, date, monthName } });
})();
