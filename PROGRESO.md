# Proyecto mejora · Paso 1: Flow (Finanzas + FinanceFlow)

Estado al 5 de noviembre de 2026. Para retomar en otro chat: decir "continuemos proyecto mejora".

## Qué se hizo
- Se unieron **Finanzas** (repo `Finanzas`) y **FinanceFlow** (repo `Proyecto_final_2`) en una sola app: **Flow**.
- `index.html`: landing con la app en 3D que se endereza al hacer scroll (GSAP + Lenis), funciones, privacidad y CTA.
- `app.html`: dashboard local-first con modo demo (6 meses de datos de ejemplo), indicadores con variación mensual, flujo de caja y gastos por categoría (Chart.js), presupuestos editables, insights, lista agrupada por día con búsqueda, filtros y orden, alta/edición/borrado con deshacer, exportar CSV, tema claro/oscuro y EN/ES.
- Se quitó el login viejo, que guardaba contraseñas en texto plano en localStorage (Firebase nunca estuvo configurado).
- Probado en escritorio (1440×900) y iPhone 13 con Playwright: sin errores de consola.
- Vista previa privada en Claude: https://claude.ai/artifact/MtrJzzzAkNfBDKxSkGnXnT

## Archivos
- `css/tokens.css` (colores, tipografías, botones), `css/app.css`, `css/landing.css`
- `js/i18n.js` (textos ES y formatos), `js/store.js` (datos y demo), `js/app.js`, `js/landing.js`
- `data/categories.json` (categorías bilingües, se cargan con fetch)
- `img/` capturas de la app para la landing, `vendor/` GSAP, ScrollTrigger, Lenis, Chart.js 4.4.4, `fonts/` Plus Jakarta Sans y Geist Mono
- `build-preview.py`: arma la vista previa de una sola página para Claude

## Falta
1. Aprobación de Emanuel de la vista previa.
2. Publicar en el repo `Finanzas` (versión vieja a `/v1/`) y dejar `Proyecto_final_2` redirigiendo a Flow (su versión vieja también en `/v1/`).
3. Imagen para compartir `img/og.jpg`.
4. Actualizar la tarjeta "Finanzas" en el portafolio (repo `Curriculum`) y en theignisstudio.com con la captura nueva.

## Siguientes pasos del proyecto mejora
- Paso 2: Balance Performance (repo `entrega-2`) como marca deportiva premium.
- Paso 3: EVO Solutions+ (repo `evo-landing`) versión cinematográfica.
- Paso 4: publicar y actualizar portafolios.
