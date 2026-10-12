# Sistema de Diseño y Tokens Apple HIG

Basado en las pautas oficiales de **Apple Human Interface Guidelines (HIG)** y la skill instalada [apple-design](file:///.agents/skills/apple-design/SKILL.md).

---

## 1. Principios Visuales Apple HIG
1. **Materiales Traslúcidos (Vibrancy & Liquid Glass):**
   Las capas de la interfaz no son opacas ni planas; transmiten la sensación de vidrio pulido o acrílico mediante `backdrop-filter: blur(24px) saturate(180%)`.
2. **Jerarquía Visual Milimétrica:**
   Bordes ultra-finos de `1px` con opacidades sutiles que delimitan las áreas sin añadir peso visual.
3. **Tipografía San Francisco (SF Pro):**
   Uso de fuentes del sistema (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif`), números tabulares en métricas financieras y stock (`font-variant-numeric: tabular-nums`).
4. **Espaciado y Radios Curvos Suaves (Continuous Curves / Squircle):**
   Radios de esquina generosos pero controlados (12px, 16px, 20px, 24px) con efecto de curvatura continua estilo iOS/macOS.

---

## 2. Tokens de Color y Superficie (Dark & Light Mode)

```css
:root {
  /* Paleta Base Light Mode */
  --apple-bg-base: #f5f5f7;
  --apple-bg-surface: rgba(255, 255, 255, 0.75);
  --apple-bg-elevated: rgba(255, 255, 255, 0.9);
  --apple-bg-secondary: #e8e8ed;
  
  --apple-text-primary: #1d1d1f;
  --apple-text-secondary: #86868b;
  --apple-text-tertiary: #a1a1a6;
  
  --apple-border-subtle: rgba(0, 0, 0, 0.08);
  --apple-border-strong: rgba(0, 0, 0, 0.16);
  
  /* Acentos de Sistema Apple */
  --apple-blue: #0071e3;
  --apple-blue-hover: #0077ed;
  --apple-green: #34c759;
  --apple-orange: #ff9500;
  --apple-red: #ff3b30;
  --apple-purple: #af52de;
  --apple-teal: #30b0c7;
  --apple-indigo: #5856d6;
  
  /* Sombras Apple HIG (difusas y multicapa) */
  --apple-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --apple-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.03);
  --apple-shadow-lg: 0 12px 36px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  --apple-shadow-modal: 0 24px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08);
  
  /* Desenfoques de Material */
  --apple-blur-subtle: blur(12px);
  --apple-blur-medium: blur(24px) saturate(180%);
  --apple-blur-thick: blur(40px) saturate(190%);
}

/* Dark Mode Tokens (Default en paneles profesionales pro) */
[data-theme="dark"] {
  --apple-bg-base: #000000;
  --apple-bg-surface: rgba(28, 28, 30, 0.72);
  --apple-bg-elevated: rgba(44, 44, 46, 0.85);
  --apple-bg-secondary: #1c1c1e;
  
  --apple-text-primary: #f5f5f7;
  --apple-text-secondary: #98989d;
  --apple-text-tertiary: #636366;
  
  --apple-border-subtle: rgba(255, 255, 255, 0.09);
  --apple-border-strong: rgba(255, 255, 255, 0.18);
  
  --apple-blue: #2997ff;
  --apple-blue-hover: #3ea3ff;
  --apple-green: #30d158;
  --apple-orange: #ff9f0a;
  --apple-red: #ff453a;
  --apple-purple: #bf5af2;
  --apple-teal: #40c8e0;
  --apple-indigo: #5e5ce6;
  
  --apple-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --apple-shadow-md: 0 6px 24px rgba(0, 0, 0, 0.5);
  --apple-shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.6);
  --apple-shadow-modal: 0 30px 80px rgba(0, 0, 0, 0.75);
}
```

---

## 3. Componentes Visuales del Panel (Apple UI Shell)
1. **macOS-Style Sidebar:** Barra lateral con iconos sutiles, agrupaciones por sección (Vista General, Catálogo, Movimientos, Almacenes, Auditoría, Analíticas), badge de alertas con conteo de stocks críticos y selector interactivo de Nicho de Empresa.
2. **Dynamic Top Toolbar:**
   * Breadcrumb de ruta limpia.
   * Barra de búsqueda global con atajo visual `⌘K` / `Ctrl+K`.
   * Selector rápido de almacén / sucursal.
   * Indicador de sincronización en vivo ("Actualizado hace 2m").
3. **Metric Summary Widgets (KPI Cards):**
   * Tarjetas con elevación sutil, números tabulares grandes, micrográficos de tendencia de chispa (*sparklines*), e indicadores de variación porcentual (+14.2% vs mes anterior).
4. **Interactive Data Tables:**
   * Columnas ordenables con indicadores visuales claros.
   * Estados de stock representados con badges cuadrados redondeados de color semántico suave (*squircle card badges* con `var(--apple-radius-badge): 6px`, en armonía con las tarjetas del resumen general).
   * Menú contextual de acciones rápidas (Ajustar Stock, Transferir, Ver Historial).
5. **Modales & Sheets (Liquid Glass Sheets):**
   * Paneles deslizantes laterales o modales centrados con desenfoque de fondo dinámico para el registro rápido de entradas, salidas o nuevos productos.

---

## 4. Regla Mandatoria del Sistema de Diseño: Zero-Pill Badges (Badges Cuadrados Redondeados)

> [!IMPORTANT]
> **Norma Estricta del Sistema:** Queda terminantemente prohibido el uso de bordes de píldora extrema (`border-radius: 9999px` o `border-radius: 50%` en cápsula) para badges, tags, chips o contadores numéricos.

### Directrices de Geometría y Estilo:
1. **Concepción como Micro-Tarjetas (*Squircle Card Badges*):**
   - Todo badge debe compartir la misma familia geométrica de las tarjetas de métricas del Resumen General (`.kpiCard`, `.nicheTabCard`).
   - Se debe utilizar obligatoriamente el token `--apple-radius-badge: 6px` (o `--apple-radius-sm: 8px` en elementos de mayor padding).
2. **Contadores Numéricos (Sidebar, Notificaciones, Selección por Lote):**
   - Proporción cuadrada redondeada: `min-width: 19px–20px`, `height: 19px–20px`.
   - `display: inline-flex; align-items: center; justify-content: center;`
   - `border-radius: var(--apple-radius-badge);`
3. **Badges de Estado, Operación y Chips de Nicho:**
   - Tipografía tabular/semi-bold (`font-size: 11.5px–12px; font-weight: 600;`).
   - Borde delimitador sutil de 1px (`border: 1px solid var(--apple-border-subtle)` o tinte semántico al 20%).
   - Fondo semitraslúcido armónico con el color semántico de estado.

