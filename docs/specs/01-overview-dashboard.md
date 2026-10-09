# 01. Especificación Funcional: Overview Dashboard & Analytics

## 1. Visión y Propósito
El **Overview Dashboard** es la vista de mando central del sistema. Proporciona a los directores de operaciones y gerentes de logística un resumen en tiempo real del valor del inventario, alertas de agotamiento o sobrestock, rotación de activos y distribución categórica, todo bajo un diseño Apple HIG (Liquid Glass, tipografía SF Pro y gráficos SVG vectoriales).

---

## 2. Componentes y Arquitectura

1. **Top Metric Cards (KPIs):**
   - **Valoración Total del Inventario:** Monto consolidado según precio de costo (`costPrice * totalStock`) y proyección de venta.
   - **Artículos en Catálogo:** Conteo total de SKUs activos en el nicho seleccionado.
   - **Alertas Críticas:** Conteo de productos cuyo stock está en nivel crítico (`status === 'critical'`).
   - **Tasa de Rotación Promedio:** Índice de rotación mensual proyectada.

2. **Gráfico de Rotación y Ventas (`TurnoverChart.tsx`):**
   - SVG vectorial interactivo con curva bezier suave (`stroke-width: 2.5`, degradado de relleno translúcido).
   - Selector de ventana temporal (6 Meses vs 1 Año).
   - Tooltip háptico en hover con detalles de mes, ventas y tasa de rotación.

3. **Distribución por Categorías (`CategoryDistribution.tsx`):**
   - Gráfico de dona (Donut Chart) SVG con porcentajes proporcionales.
   - Leyenda interactiva con colores contrastantes del design system.

4. **Widget de Capacidad de Almacén (`WarehouseCapacityWidget.tsx`):**
   - Barras de progreso de cristal líquido para cada instalación física (Central, Norte, Occidente).
   - Indicador visual de porcentaje de ocupación con transición dinámica.

5. **Widget de Alertas Críticas (`CriticalAlertsWidget.tsx`):**
   - Listado priorizado de SKUs con stock inferior al umbral mínimo.
   - Botón de acción rápida para iniciar reorden inmediato.

---

## 3. Comportamiento Reactivo Multidominio
- Al cambiar de nicho (Retail, Farma, Tech, Alimentos), el dashboard recalcula instantáneamente todas las métricas, categorías y unidades de medida sin realizar recargas completas de página.
