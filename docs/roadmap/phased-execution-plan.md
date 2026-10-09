# Plan de Ejecución por Fases y Compuertas de Verificación (Roadmap)

Este plan sigue la disciplina de **The Architect** y el **Arnés de Ingeniería**, avanzando paso por paso con compuertas de verificación antes de pasar a la siguiente fase.

---

## 🎯 Resumen de Fases del Proyecto

| Fase | Enfoque | Entregables Principales | Compuerta de Verificación (Gate) |
|---|---|---|---|
| **Fase 0** | **Arnés y Estructura Base** | Setup Next.js 15+ / React 19, TypeScript estricto, configuración de linter, estructura de carpetas de dominio. | `npm run build && npm run lint` pasa con 0 errores y 0 warnings. |
| **Fase 1** | **Design System & Shell Apple HIG** | Layout general: Sidebar con materiales traslúcidos, Top Toolbar, Toggle Dark/Light mode, Tokens CSS globales. | Renderizado del shell responsive sin flickering y contraste accesible verificado. |
| **Fase 2** | **Dominio de Datos y Motor Multi-Nicho** | Modelos TypeScript, Data Provider con estado en memoria reactivo, datasets demostrativos para 4 nichos (Retail, Farma, Alimentos, Tech). | Tests unitarios de transiciones de stock y cambio instantáneo de nicho sin pérdida de integridad. |
| **Fase 3** | **Panel Principal (Overview Dashboard)** | Tarjetas KPI de inventario, Gráficos interactivos de rotación y valorización, listado de alertas de stock crítico. | Auditoría de Web Interface Guidelines e interactividad fluida (60 FPS en animaciones). |
| **Fase 4** | **Gestión de Catálogo y Tabla Avanzada** | Tabla estilo Apple con búsqueda predictiva, filtros facetados, vista rápida en Sheet lateral y detalles de SKU. | Búsqueda y filtrado instantáneo (<50ms) sobre 1,000+ items simulados. |
| **Fase 5** | **Formularios de Operación y Movimientos** | Formularios estilo iOS para Entrada, Salida, Traspaso entre almacenes y Ajuste de Auditoría con feedback visual. | Validación de esquema, cálculo automático de saldos y registro inmutable en historial. |
| **Fase 6** | **Optimización y Despliegue en Vercel** | Auditoría con skills `vercel-optimize` y `web-design-guidelines`, LCP < 1.2s, bundle optimization, checklist final. | Reporte Vercel Performance sin cuellos de botella y deployment funcional listo para presentar a clientes. |

---

## Detalle de Próximos Pasos Inmediatos
1. **Validación del Enfoque por el Usuario:** Revisar y alinear la visión del arnés, nichos prioritarios y stack propuesto.
2. **Inicialización de la Base del Proyecto (Fase 0):** Creación del esqueleto limpio de Next.js / TypeScript con arquitectura de carpetas por capas (`core/`, `niches/`, `components/`, `tokens/`).
