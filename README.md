# DemoPanel Inventory OS 

> **Enterprise Multi-Niche Inventory Showcase**  
> Panel de gestión de inventario de altísimo impacto visual y funcional con experiencia de usuario de grado Apple (Human Interface Guidelines), arquitectura multi-nicho y fundamentado en **Ingeniería de Arneses (Harness Engineering)**.

---

## 🎯 Visión del Proyecto

El objetivo de este proyecto es servir como un panel demostrativo interactivo de última generación para presentar a empresas de diferentes sectores (Retail, Farmacéutica, Hardware/Tecnología, Alimentos y Restauración), permitiéndoles visualizar cómo operaría su gestión de inventario unificada en una plataforma moderna, fluida y con diseño refinado.

---

## 🛡️ Principios de Arquitectura (Ingeniería de Arneses)

Para garantizar escalabilidad, foco continuo y cero degradación de código:

1. **Especificación Antes de Código (Spec-First):** Todo desarrollo sigue especificaciones formales y compuertas de verificación observables antes de implementar.
2. **Núcleo Agnóstico + Perfiles de Nicho:** El motor central gestiona entidades universales de inventario (SKUs, existencias, almacenes, movimientos, trazabilidad) mientras que adaptadores modulares inyectan la lógica de negocio para:
   - 👗 **Retail & Moda:** Tallas, colores, temporadas y curvas de stock.
   - 💊 **Farmacia & Salud:** Lotes, fechas de caducidad, cadena de frío y registros regulatorios.
   - ⚡ **Tecnología & Hardware:** Números de serie individuales, compatibilidades y garantías.
   - 🍽️ **Alimentos & Restauración:** Perecederos, mermas y control FIFO/FEFO.
3. **UX/UI Apple HIG (Human Interface Guidelines):**
   - Materiales translúcidos con *Liquid Glass* (`backdrop-filter: blur()`).
   - Bordes milimétricos y sombras difusas multicapa.
   - Tipografía San Francisco con números tabulares para datos financieros y métricas.
   - Microinteracciones hápticas visuales y animaciones fluidas (60 FPS).
4. **Rendimiento React 19 / Next.js:** 
   - Eliminación estricta de cascadas de renderizado (*waterfalls*).
   - Componentes compuestos y APIs limpias sin prop-drilling.

---

## 📂 Estructura Documental del Arnés

* **[`AGENTS.md`](./AGENTS.md)**: Contrato operativo y directrices de ingeniería.
* **[`docs/architecture/00-harness-manifesto.md`](./docs/architecture/00-harness-manifesto.md)**: Manifiesto del arnés y compuertas EARS.
* **[`docs/architecture/01-multi-niche-data-model.md`](./docs/architecture/01-multi-niche-data-model.md)**: Modelo de datos núcleo y contratos de nicho.
* **[`docs/design-system/apple-hig-tokens.md`](./docs/design-system/apple-hig-tokens.md)**: Tokens de diseño, materiales y componentes Apple.
* **[`docs/roadmap/phased-execution-plan.md`](./docs/roadmap/phased-execution-plan.md)**: Hoja de ruta por fases y compuertas de verificación.

---

## 🧰 Skills del Proyecto (`.agents/skills/`)

* **`the-architect`**: Blueprinting y especificación arquitectónica.
* **`apple-design`**: Auditoría y lineamientos oficiales Apple HIG.
* **`react-best-practices`**: 70 reglas de optimización de Vercel.
* **`composition-patterns`**: Patrones de composición avanzada en React.
* **`web-design-guidelines`**: Estándares de interfaz y accesibilidad.
* **`deploy-to-vercel` & `vercel-optimize`**: Optimización de Edge y deployment.

---

## 🚀 Despliegue

Optimizado para su despliegue continuo en **Vercel**.
