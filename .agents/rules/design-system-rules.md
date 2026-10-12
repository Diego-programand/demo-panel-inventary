# Reglas de Diseño del Sistema: Geometría de Badges y Contenedores

## Regla de Oro: Zero-Pill Badges (Prohibición de Badges en Cápsula)

Queda **terminantemente prohibido** en todo el proyecto el uso de badges completamente redondeados (`pill`, `border-radius: 9999px` o `border-radius: 50%` en cápsula).

### Especificación de Implementación Obligatoria:
1. **Badges Cuadrados Redondeados (*Squircle Card Badges*):**
   - Todo badge (estado de stock, tipo de movimiento, sector activo, chip de nicho, tag de atributo) debe diseñarse como una micro-tarjeta que comparte la curvatura continua de las tarjetas de métricas del Resumen General.
   - Radio obligatorio: `border-radius: var(--apple-radius-badge);` (definido como `6px` en `src/styles/tokens.css`).
2. **Contadores Numéricos (Sidebar, Alertas, Batch Bar):**
   - Deben tener proporciones cuadradas redondeadas:
     ```css
     min-width: 19px;
     height: 19px;
     padding: 0 5px;
     display: inline-flex;
     align-items: center;
     justify-content: center;
     border-radius: var(--apple-radius-badge);
     ```
   - Nunca utilizar círculos (`border-radius: 50%`) ni píldoras alargadas.
3. **Bordes y Superficies:**
   - Todo badge debe llevar una delimitación sutil: `1px solid var(--apple-border-subtle)` o tinte semántico al 20% (`border-color: rgba(...)`).
   - Mantener tipografía nítida `11.5px - 12px`, peso `600` o `500`.
