# Flow · Finanzas personales

App de finanzas personales y de emprendimientos, hecha por [Emanuel Benitez](https://fenix-emanuel.github.io/Curriculum/). Une los proyectos *Finanzas* y *FinanceFlow* en una sola app.

- **En vivo:** https://fenix-emanuel.github.io/Finanzas/
- **Demo directa:** https://fenix-emanuel.github.io/Finanzas/app.html
- **Versión anterior:** https://fenix-emanuel.github.io/Finanzas/v1/login.html

## Funciones
- Modo demo con 6 meses de datos de ejemplo, o empezar de cero.
- Balance, ingresos, gastos y tasa de ahorro del mes, con variación contra el mes anterior.
- Flujo de caja de 6 meses y gastos por categoría (Chart.js).
- Presupuestos por categoría editables, con aviso al acercarse al tope.
- Movimientos agrupados por día: búsqueda, filtros por tipo y categoría, orden por fecha o monto.
- Agregar, editar y borrar (con deshacer). Exportar a CSV.
- Tema claro y oscuro, inglés y español, responsive.
- Local-first: los datos se guardan en el navegador (localStorage), sin cuentas ni servidor.

## Tecnologías
HTML, CSS y JavaScript sin frameworks · Chart.js 4 · Fetch + JSON (`data/categories.json`) · Intl API · GSAP + Lenis en la landing.

## Archivos
- `index.html` landing · `app.html` dashboard
- `css/tokens.css`, `css/app.css`, `css/landing.css`
- `js/i18n.js` (textos y formatos), `js/store.js` (datos), `js/app.js`, `js/landing.js`
- `v1/` versión anterior
