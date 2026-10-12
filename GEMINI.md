# GEMINI.md — Reglas y Guía de Operación del Asistente

Este proyecto se rige estrictamente bajo los principios de la **Ingeniería de Arneses (Harness Engineering)** y el diseño minimalista **Apple HIG**.

Consulta obligatoria:
- Contrato principal y arquitectura: [AGENTS.md](./AGENTS.md)
- Skills locales instaladas: [Directorio de Skills](./.agents/skills)
- Documentación de arquitectura y diseño: [Directorio Docs](./docs)

### Directrices de Comportamiento:
1. **No improvisar código sin diseño ni especificación previa.**
2. **Priorizar la estética visual (WOW factor):** acabados de cristal líquido, bordes milimétricos, tipografía cuidada, paletas HSL armoniosas, animaciones sutiles.
3. **Mantener la escalabilidad multidominio:** todo modelo de datos debe admitir diferentes industrias mediante adaptadores de nicho.
4. **Verificar cada paso con comandos objetivos.**
5. **Regla Mandatoria de Badges (Zero-Pill Badges):** Prohibido el uso de badges completamente redondeados (`pill` / `border-radius: 9999px`). Todos los badges, tags y contadores numéricos deben ser obligatoriamente cuadrados redondeados (`var(--apple-radius-badge): 6px`) con esquinas continuas en estricta armonía con las tarjetas del resumen general.
6. **Reglas Inmutables de Diseño Responsivo:** Toda modificación o creación en el frontend debe cumplir estrictamente la escala canónica de breakpoints, adaptaciones quirúrgicas no destructivas y touch targets de Apple HIG definidos en [docs/design-system/responsive-rules.md](./docs/design-system/responsive-rules.md).
