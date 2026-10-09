# Especificación Funcional: Módulo de Catálogo & Tabla Avanzada (Fase 4)

Este documento define la arquitectura, diseño de interfaz y compuertas de validación para el módulo de **Catálogo de Artículos** de DemoPanel Inventory OS, respetando los principios de la **Ingeniería de Arneses** y las directrices **Apple HIG**.

---

## 1. Misión del Módulo
Permitir a los operadores ejecutivos y directores de logística explorar, filtrar, auditar e inspeccionar todo el inventario de la empresa con una experiencia de usuario ultra-fluida, inspirada en macOS Finder / Numbers / Apple Music, soportando adaptabilidad dinámica multi-nicho (Retail, Farmacia, Tecnología, Alimentos).

---

## 2. Criterios de Aceptación y Comportamiento Observable (Harness Gates)

| Código | Disparador (CUANDO) | Comportamiento Esperado (ENTONCES EL SISTEMA DEBE) |
|---|---|---|
| **GATE-CAT-01** | El usuario selecciona la sección "Catálogo" en la Sidebar o presiona `⌘K` > Ir a Catálogo. | Cambiar la vista principal a la interfaz del catálogo en <100ms, actualizando el vocabulario (`Prendas`, `Medicamentos`, `Dispositivos`, `Insumos`) según el nicho activo. |
| **GATE-CAT-02** | El usuario ingresa un término en el campo de búsqueda rápida. | Filtrar instantáneamente la lista de artículos (<50ms) evaluando coincidencias en Nombre, SKU, Categoría, Tags y atributos dinámicos del nicho (Lote, Serie, Talla). |
| **GATE-CAT-03** | El usuario selecciona una píldora de filtro por Estado (`Óptimo`, `Stock Bajo`, `Crítico`, `Excedente`). | Filtrar la tabla mostrando únicamente los artículos que coincidan con dicho estado, recalculando el contador de resultados activos. |
| **GATE-CAT-04** | El usuario selecciona una categoría de nicho o almacén logístico. | Aplicar filtrado facetado multidimensional conservando el estado de los filtros anteriores. |
| **GATE-CAT-05** | El usuario hace clic sobre cualquier fila de la tabla o en el botón de inspección rápida. | Abrir con animación fluida el **Slide-Over Inspector Sheet** (Liquid Glass con backdrop blur) mostrando desglose 360° del SKU (almacenes, atributos de nicho y kardex reciente). |
| **GATE-CAT-06** | El usuario presiona la tecla `Escape` o hace clic en el botón de cierre del Sheet. | Replegar el panel de inspección de manera fluida y devolver el foco a la tabla. |
| **GATE-CAT-07** | El usuario marca checkboxes de uno o varios artículos. | Desplegar la **Barra de Acciones por Lote (Batch Action Bar)** flotante en la parte inferior, permitiendo "Reordenar Seleccionados" o "Exportar CSV". |
| **GATE-CAT-08** | El usuario pulsa "+ Reorden" en una fila o en el Sheet de detalle. | Disparar una transacción en el `InventoryStore` que registre la entrada de reabastecimiento e incremente el stock en tiempo real. |

---

## 3. Especificación Visual y de Interacción (Apple HIG)

1. **Toolbar de Filtros Superiores (Segmented Controls & Filter Pills):**
   - Campo de búsqueda predictivo con icono lupa SF Symbol y atajo visible (`/` para enfocar).
   - Selector segmentado de estado de stock con contadores numéricos tabulares.
   - Píldoras deslizables por categoría con color acentuado del nicho seleccionado.
   - Selector de ordenamiento (Nombre A-Z, Menor Stock, Mayor Stock, Mayor Valoración).

2. **Tabla de Datos de Alto Desempeño:**
   - Cabecera fija (`position: sticky`) con borde inferior translúcido de 1px.
   - Filas con altura ergonómica (54px), microinteracción hover sutil (`--apple-bg-surface-hover`).
   - Tipografía con alineación adecuada: Texto a la izquierda, Estados centrados, Cantidades y Precios a la derecha con `font-variant-numeric: tabular-nums`.
   - Columna dinámica según nicho:
     - **Retail:** Talla y Color en chips sutiles.
     - **Farmacéutica:** Número de lote y Fecha de caducidad con advertencia visual si está próximo a vencer.
     - **Tecnología:** Número de serie único y Estado de garantía en meses.
     - **Alimentos:** Temperatura de almacenamiento y Días restantes de vida útil.

3. **Slide-Over Sheet (Inspector Lateral macOS):**
   - Ancho: 440px en desktop, 100% en pantallas móviles (<640px).
   - Material: `var(--apple-bg-elevated)` con `backdrop-filter: var(--apple-blur-thick)`.
   - Sombra: `var(--apple-shadow-modal)`.
   - Secciones internas:
     - Cabecera con SKU copiable de 1 clic y badge de estado con punto de luz.
     - Tarjetas de métricas: Stock consolidado, Umbral mínimo de seguridad, Capacidad máxima.
     - Barra de densidad de stock con marcas de umbral.
     - Distribución por almacén (Medellín HUB-01, Bogotá CLN-02, Cali DRO-03).
     - Atributos específicos del sector (Metadatos formateados).
     - Historial de movimientos recientes para este SKU con enlaces visuales al Kardex.
     - Acciones rápidas ("Reordenar +N", "Registrar Ajuste").

4. **Barra Flotante de Acciones en Lote:**
   - Posicionada fija en el centro inferior de la pantalla (`bottom: 24px`).
   - Estilo cápsula flotante Liquid Glass con borde de 1px y sombra elevada.
   - Indicador: "N artículos seleccionados".
   - Botón secundario: "Exportar Datos (CSV / JSON)".
   - Botón primario: "+ Reorden de Lote".
