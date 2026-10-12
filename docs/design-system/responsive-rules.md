# Reglas Inmutables de Frontend y Diseño Responsivo
### DemoPanel Inventory OS — Arquitectura de Interfaz y Apple HIG

Este documento establece los **principios arquitectónicos y reglas inmutables de desarrollo frontend**. El cumplimiento de estas normas es estricto y garantiza que cualquier nueva vista, widget o componente crezca sin desajustar el diseño existente ni requerir revisiones reiteradas.

---

## 1. Escala Canónica de Breakpoints

Cualquier componente que requiera adaptación condicional debe ceñirse a los siguientes umbrales estándar:

| Breakpoint | Consulta CSS | Dispositivos y Contexto | Comportamiento Esperado |
|---|---|---|---|
| **Mobile Compact** | `@media (max-width: 640px)` | Teléfonos en vertical (360px – 430px) | Layouts a 1 columna; controles en ancho completo; botones de acción compactos; padding de canvas reducido (`16px`). |
| **Tablet / Split View** | `@media (max-width: 900px)` | Tablets portrait, iPad Mini, ventanas divididas | Sidebar colapsado en Drawer translúcido; grids de métricas en 2 columnas; buscador colapsado a trigger. |
| **Desktop Standard** | `@media (min-width: 901px)` y `(max-width: 1440px)` | Laptops, pantallas de escritorio estándar | Sidebar fijo de 270px; grids en 4 columnas; barra de herramientas completa con selectores visibles. |
| **Wide Display** | `@media (min-width: 1441px)` | Monitores ultrawide, Apple Studio Display | Contenedor de contenido centralizado con `max-width: 1440px; margin: 0 auto;`. |

---

## 2. Regla Inmutable: Zero-Pill Badges (Squircles Continuos)

* **Prohibición Total:** Queda terminantemente prohibido el uso de badges, chips, tags, contadores o botones con esquinas ovaladas o de cápsula (`border-radius: 9999px`, `border-radius: 50%`).
* **Geometría Obligatoria:** 
  - Todo badge de estado, tag de categoría, contador numérico y chip de nicho debe ser un **cuadrado redondeado (*squircle*)** continuo con:
    ```css
    border-radius: var(--apple-radius-badge); /* 6px */
    /* o para tarjetas pequeñas */
    border-radius: var(--apple-radius-sm);    /* 8px */
    ```
  - Contadores de notificación y badges numéricos: Proporción cuadrada redondeada (`min-width: 20px`, `height: 20px`), centrados con `display: flex; align-items: center; justify-content: center;`.
  - Botones principales e inputs: Emplear `border-radius: var(--apple-radius-sm)` (8px) o `var(--apple-radius-md)` (12px), armonizando con las ventanas de macOS.

---

## 3. Principio de Intervención Quirúrgica y No Destructiva

1. **Nunca reconstruir el diseño de escritorio existente:** Las adaptaciones responsivas deben enriquecer progresivamente mediante reglas complementarias (`@media`, `@container`, `clamp()`), preservando la exactitud pixel-perfect de la vista de escritorio.
2. **Layouts Intrínsecos Primero:** Antes de recurrir a media queries rígidos, estructurar las cuadrículas mediante patrones intrínsecos de CSS Grid:
   ```css
   /* Grid que se adapta fluidamente sin romper columnas */
   grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
   gap: 12px;
   ```
3. **Espaciados y Tipografía Fluida:** Usar los tokens con `clamp()` para transiciones orgánicas entre factores de forma:
   ```css
   padding: var(--apple-space-canvas); /* clamp(16px, 2.5vw, 32px) */
   font-size: var(--apple-header-title); /* clamp(20px, 2.2vw, 26px) */
   ```

---

## 4. Estándar de Touch Targets (Apple HIG Móvil)

En pantallas táctiles (`< 768px`):
* Cualquier elemento interactivo (botones, selectores de almacén, checkboxes, botones de paginación) debe proporcionar un área de toque efectiva mínima de:
  ```css
  min-height: 40px; /* Óptimo 44px según Apple HIG */
  min-width: 40px;
  ```
* En botones compactos de barra de herramientas (como iconos de tema o menú), mantener un contenedor visual estilizado de 36px con márgenes interactivos o padding que cumpla el estándar táctil.

---

## 5. Tablas de Inventario y Kardex de Datos Financieros

1. **Scroll Horizontal Protegido:** Toda tabla debe residir dentro de un contenedor `.tableWrapper` con:
   ```css
   .tableWrapper {
     width: 100%;
     overflow-x: auto;
     -webkit-overflow-scrolling: touch;
   }
   ```
2. **Números Tabulares Obligatorios:** Toda columna de existencias, stock mínimo, precio unitario, costo total o porcentaje debe aplicar:
   ```css
   font-variant-numeric: tabular-nums;
   letter-spacing: -0.01em;
   ```
   para evitar el temblor o desalineación vertical de cifras al actualizar datos en tiempo real.
3. **Ancho Mínimo Obligatorio de Tabla (`min-width`):** Para evitar que las columnas colapsen aplastando los encabezados y cifras en pantallas móviles antes de disparar el scroll horizontal, toda tabla dentro de `.tableWrapper` debe contar con un `min-width` estructural:
   ```css
   .appleTable { width: 100%; min-width: 580px; }
   .catalogTable { width: 100%; min-width: 760px; }
   .kardexTable { width: 100%; min-width: 760px; }
   ```

---

## 6. Safe Area Insets y Entornos Móviles Dinámicos (iOS / iPadOS)

Para evitar que los modales, drawers laterales y barras de acción flotantes colisionen con el Notch, la Dynamic Island, la barra de navegación del navegador o el Home Indicator:
* **Viewport Dinámico (`100dvh`):** En lugar de `100vh` rígido, emplear `height: 100vh; height: 100dvh;` para ajustarse en tiempo real a las barras de herramientas de Safari y Chrome en iOS/Android.
* **Drawers y Modales:** Aplicar padding inferior dinámico:
  ```css
  padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
  ```
* **Barras de Acción Flotantes (`BatchActionBar`):**
  ```css
  bottom: max(16px, env(safe-area-inset-bottom, 16px));
  width: calc(100vw - 32px);
  max-width: 440px;
  ```

---

## 7. Checklist de Verificación para Cualquier Nuevo Cambio en Frontend

Antes de dar por finalizado un componente nuevo o modificado:
- [ ] ¿Se ve impecable en **1440px (Desktop)**, **768px (Tablet)** y **375px (iPhone)**?
- [ ] ¿Hay desbordamiento horizontal involuntario (`overflow-x`) en la ventana global? (No debe haber).
- [ ] ¿Todos los badges y tags son cuadrados redondeados (*squircles*) y NO cápsulas/píldoras?
- [ ] ¿Las cifras numéricas y financieras usan `tabular-nums`?
- [ ] ¿Los botones y campos en móvil son fáciles de presionar con el pulgar (touch targets adecuados)?
- [ ] ¿Se utilizó exclusivamente Vanilla CSS / CSS Modules con tokens `var(--apple-*)` sin Tailwind?
