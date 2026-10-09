# Especificación Funcional: Operaciones de Inventario & Kardex Inmutable (Fase 5)

Este documento define la arquitectura, diseño de interfaz y compuertas de verificación para el módulo de **Operaciones de Movimientos y Kardex** de DemoPanel Inventory OS, respetando el contrato de **Ingeniería de Arneses** y las directrices **Apple HIG**.

---

## 1. Misión del Módulo
Garantizar la trazabilidad y rigor contable de cada transacción de inventario mediante formularios de alta precisión con validación de saldos en tiempo real, prevención estricta de existencias negativas, auditoría de traslados inter-almacén y bitácora histórica inmutable.

---

## 2. Criterios de Aceptación y Comportamiento Observable (Harness Gates)

| Código | Disparador (CUANDO) | Comportamiento Esperado (ENTONCES EL SISTEMA DEBE) |
|---|---|---|
| **GATE-OPS-01** | El usuario presiona el botón `+ Nuevo Movimiento` en la TopToolbar o en el catálogo. | Abrir el modal de operación estilo macOS/iOS con desenfoque de fondo y foco automático en el selector de tipo de movimiento. |
| **GATE-OPS-02** | El usuario selecciona el tipo de movimiento (`Recepción`, `Despacho`, `Traslado`, `Ajuste`). | Adaptar dinámicamente los campos requeridos (ej. Almacén Origen y Destino para Traslado; Almacén Origen para Despacho; Motivo para Ajuste). |
| **GATE-OPS-03** | El usuario selecciona un artículo y cantidad para un Despacho o Traslado. | Mostrar en tiempo real el saldo disponible en el almacén seleccionado (`Saldo Actual → Saldo Proyectado`). Si la cantidad supera las existencias, **bloquear el envío** y mostrar advertencia en rojo. |
| **GATE-OPS-04** | El usuario intenta realizar un Traslado seleccionando el mismo almacén como origen y destino. | Invalidar la operación con mensaje "El almacén de destino debe ser diferente al de origen". |
| **GATE-OPS-05** | El usuario envía un movimiento válido. | Ejecutar la mutación atómica en `InventoryStore`, recalculando el stock consolidado, el stock por almacén y añadiendo el registro inmutable a la cabecera del Kardex con timestamp ISO. |
| **GATE-OPS-06** | La transacción se completa exitosamente. | Mostrar animación de confirmación háptica, cerrar el modal tras 1.2s y actualizar todas las vistas activas (Dashboard, Catálogo, Badges). |
| **GATE-OPS-07** | El usuario navega a la sección "Movimientos & Kardex" en la Sidebar. | Renderizar el libro mayor de movimientos con filtros facetados por Tipo, Almacén, Fecha y buscador de documento de referencia. |
| **GATE-OPS-08** | El usuario pulsa "Exportar Libro Kardex". | Generar y descargar un archivo CSV estructurado con columnas contables estandarizadas (Fecha, Tipo, SKU, Nombre, Origen, Destino, Cantidad, Saldo Resultante, Operador). |

---

## 3. Tipología de Movimientos & Reglas Matemáticas

1. **Recepción / Compra (`purchase_reception`):**
   $$\text{Stock}_{\text{dest}, t+1} = \text{Stock}_{\text{dest}, t} + Q$$
   $$\text{Stock}_{\text{global}, t+1} = \text{Stock}_{\text{global}, t} + Q$$

2. **Despacho / Venta (`sales_dispatch`):**
   - Precondición: $\text{Stock}_{\text{orig}, t} \ge Q$
   $$\text{Stock}_{\text{orig}, t+1} = \text{Stock}_{\text{orig}, t} - Q$$
   $$\text{Stock}_{\text{global}, t+1} = \text{Stock}_{\text{global}, t} - Q$$

3. **Traslado entre Almacenes (`transfer_out` / `transfer_in`):**
   - Precondición: $\text{Stock}_{\text{orig}, t} \ge Q \quad \land \quad \text{orig} \ne \text{dest}$
   $$\text{Stock}_{\text{orig}, t+1} = \text{Stock}_{\text{orig}, t} - Q$$
   $$\text{Stock}_{\text{dest}, t+1} = \text{Stock}_{\text{dest}, t} + Q$$
   $$\Delta \text{Stock}_{\text{global}} = 0 \quad (\text{Conservación estricta})$$

4. **Ajuste de Auditoría (`audit_adjustment` / `adjustment_loss`):**
   $$\text{Stock}_{\text{target}, t+1} = \text{Stock}_{\text{target}, t} \pm Q$$
   $$\text{Stock}_{\text{global}, t+1} = \text{Stock}_{\text{global}, t} \pm Q$$

---

## 4. Diseño de UI/UX (Apple HIG)

- **Modal Window:** Tarjeta de esquinas continuas (radio 20px), borde ultra-fino de 1px, `backdrop-filter: var(--apple-blur-thick)`, elevación con sombra multinivel.
- **Selector Segmentado:** 4 pestañas hápticas con iconos SF Symbols para alternar el tipo de operación sin recarga.
- **Microinteracción de Saldo Proyectado:** Indicador visual `X → Y` con badge verde para incrementos y naranja/rojo para decrementos.
- **Feedback de Error:** Bordes acentuados en rojo Apple (`#ff3b30`) con microvibración visual (shake) en caso de superar el stock disponible.
