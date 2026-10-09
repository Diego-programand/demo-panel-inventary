# AGENTS.md — Contrato Operativo y Arnés de Ingeniería

## 1. Identidad y Misión del Proyecto
* **Nombre:** DemoPanel Inventory OS (Enterprise Multi-Niche Inventory Showcase)
* **Objetivo:** Panel demostrativo de gestión de inventario de altísimo impacto visual y funcional para presentar a empresas de diferentes industrias (Retail, Salud/Farmacia, Alimentos, Hardware/Tecnología).
* **Enfoque Principal:** **UX/UI de grado Apple** (Human Interface Guidelines), diseño minimalista, interacción fluida, métricas en tiempo real, formularios dinámicos y arquitectura escalable basada en **Ingeniería de Arneses**.
* **Stack Tecnológico Objetivo:** Next.js (App Router), React 19, TypeScript, Vanilla CSS / CSS Modules optimizados con tokens de diseño Apple HIG, despliegue optimizado en Vercel.

---

## 2. Principios de la Ingeniería de Arneses (Harness Engineering)
Para evitar la entropía, el desenfoque del agente y la degradación del código a medida que el proyecto crezca:

1. **Especificación Antes de Código (Spec-First):**
   - No se escribe código sin un paso previo de especificación y diseño técnico documentado.
   - Cada módulo debe tener su contrato de tipos e interfaz de dominio desacoplada de la UI.
2. **Compuertas de Validación (Verification Gates):**
   - Cada fase y paso tiene criterios de aceptación observables: `CUANDO <evento> ENTONCES EL SISTEMA DEBE <resultado observable>`.
   - Cada paso cuenta con un comando de verificación ejecutable (`npm run lint`, `tsc --noEmit`, tests de contrato).
3. **Desacoplamiento Multidominio (Multi-Niche Architecture):**
   - El núcleo (`core`) de inventario gestiona entidades universales: Artículos/SKUs, Almacenes/Ubicaciones, Existencias, Movimientos (entradas, salidas, transferencias) y Alertas de Reabastecimiento.
   - Los nichos de industria se implementan como adaptadores/perfiles configurables (`niche profiles`), permitiendo cambiar la demo a Retail (tallas/colores), Farmacéutica (lotes/caducidad/trazabilidad), o Restaurantes (pesos/mermas).
4. **Patrones de Composición React Limpios:**
   - Evitar la proliferación de props booleanas (`isOpen`, `isEdit`, `isPrimary`). Usar componentes compuestos y patrones de slots/children.

---

## 3. Skills del Proyecto (Instaladas en `.agents/skills/`)
Estas habilidades son exclusivas de este proyecto y deben ser consultadas activamente:

| Skill | Ubicación | Cuándo Consultar |
|---|---|---|
| **the-architect** | `.agents/skills/the-architect/` | Para diseño de arquitectura, blueprints de módulos, definición de fases y validación de decisiones técnicas. |
| **apple-design** | `.agents/skills/apple-design/` | Para la estética HIG: Liquid Glass, materiales, barras laterales, tipografía SF, formularios, modales y contraste. |
| **react-best-practices** | `.agents/skills/react-best-practices/` | 70 reglas de rendimiento de Vercel: eliminación de cascadas (waterfalls), memoización, optimización de bundles. |
| **composition-patterns** | `.agents/skills/composition-patterns/` | Arquitectura de componentes compuestos, decoupling de estado y APIs limpias. |
| **web-design-guidelines** | `.agents/skills/web-design-guidelines/` | Auditoría de lineamientos web y coherencia de interfaz. |
| **deploy-to-vercel** & **vercel-optimize** | `.agents/skills/deploy-to-vercel/`, `.agents/skills/vercel-optimize/` | Preparación para producción, velocidad de carga y deployment en Vercel. |

---

## 4. Filosofía de Diseño: Apple Human Interface Guidelines (HIG)
* **Materiales y Fondos:** Superficies con `backdrop-filter: blur()`, bordes sutiles ultra-delgados (`1px solid rgba(255, 255, 255, 0.08)` en dark mode o `rgba(0,0,0,0.06)` en light mode), sombras difusas de varias capas.
* **Tipografía:** Jerarquía tipográfica impecable, pesos equilibrados (Regular, Medium, Semibold), espaciado numérico tabular en tablas financieras y de stock (`font-variant-numeric: tabular-nums`).
* **Iconografía e Interacción:** Iconos precisos estilo SF Symbols, transiciones suaves (200ms–300ms ease-out), microinteracciones hápticas visuales en botones y selectores.
* **Paneles de Control:** Navegación por barra lateral translúcida (Sidebar), barra superior de herramientas (Toolbar), vistas divididas (Split Views) y tarjetas de métricas tipo iOS/macOS widgets.

---

## 5. Estructura Documental del Arnés (`docs/`)
* `docs/architecture/`: Blueprints técnicos y decisiones estructurales (ADRs).
* `docs/design-system/`: Catálogo de tokens (colores, sombras, blur, tipografía) y especificaciones de componentes Apple.
* `docs/specs/`: Especificación funcional de módulos (Dashboard, Catálogo, Movimientos, Almacenes, Reportes).
* `docs/niches/`: Configuraciones de los diferentes sectores comerciales demostrables.
* `docs/roadmap/`: Plan de ejecución por fases con compuertas de verificación.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
