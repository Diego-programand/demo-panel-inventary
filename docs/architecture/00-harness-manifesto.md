# Manifiesto de Ingeniería de Arneses (Harness Engineering)

## ¿Qué es el Arnés de Ingeniería en este Proyecto?
Un **arnés de ingeniería** no es simplemente una carpeta de pruebas; es la **estructura externa de contención, dirección y validación** que asegura que un agente inteligente y un equipo humano puedan desarrollar un software complejo y escalable sin desviarse, sin generar deuda técnica invisible y sin que el código colapse bajo su propio peso con el tiempo.

El arnés se compone de cuatro pilares:

```
┌──────────────────────────────────────────────────────────────┐
│                    ARNÉS DE INGENIERÍA                       │
├───────────────────────────────┬──────────────────────────────┤
│ 1. COMPUERTAS DE VERIFICACIÓN │ 2. CONTRATO DE DOMINIO NÚCLEO│
│    - Criterios EARS           │    - Entidades agnósticas    │
│    - Verificación con scripts │    - Adaptadores de nicho    │
├───────────────────────────────┼──────────────────────────────┤
│ 3. DESIGN SYSTEM HIG APPLE    │ 4. BITÁCORA Y BLUEPRINTS     │
│    - Tokens inmutables        │    - the-architect templates │
│    - Jerarquía de materiales  │    - Memoria viva en repo    │
└───────────────────────────────┴──────────────────────────────┘
```

---

## Pilar 1: Compuertas de Verificación (Verification Gates)
Cada paso del desarrollo se subdivide en una unidad atómica ejecutable que tiene una compuerta:
1. **Trigger / Estímulo:** Qué acción o cambio se realiza.
2. **Criterio Observable (Formato EARS):**
   * *CUANDO [evento en UI o API]*
   * *EL SISTEMA DEBE [comportamiento observable, renderizado exacto o mutación de estado]*
3. **Comando de Verificación:** Una comprobación ejecutable (por ejemplo: `npm run lint`, `tsc --noEmit`, test unitario de modelo, o auditoría de accesibilidad).

No se declara un paso "completado" hasta que el comando de verificación retorne `exit code 0`.

---

## Pilar 2: Modelo de Dominio Desacoplado y Multidominio
El sistema está diseñado para que cualquier empresa que visite la demo pueda identificarse con su nicho.
Para lograr esto:
* El **Núcleo (Core Engine)** conoce solo conceptos abstractos universales:
  * Artículos (`Item`), Identificador (`SKU / Code`), Lote/Serie (`Batch / Serial`), Unidad de Medida (`UoM`), Existencia (`StockLevel`), Ubicación/Almacén (`Location`), Movimiento (`Movement`), Punto de Reorden (`ReorderThreshold`).
* Los **Perfiles de Nicho (Niche Profiles)** inyectan metadatos, etiquetas de interfaz, categorizaciones y visualizaciones especializadas:
  * *Moda & Retail:* Variantes de talla/color, colecciones de temporada.
  * *Farmacia & Salud:* Fechas de caducidad, registro sanitario, lotes críticos, cadena de frío.
  * *Gastronomía & Restauración:* Ingredientes, mermas, almacén seco vs frío, recetas.
  * *Electrónica & Componentes:* Números de serie individuales, compatibilidades, garantías.

---

## Pilar 3: Estética Apple HIG sin Compromisos
El objetivo de la demo es impactar visualmente en los primeros 3 segundos:
* **Claridad (Clarity):** Texto nítido a cualquier tamaño, iconos precisos, espacio negativo generoso.
* **Deferencia (Deference):** La interfaz cede el protagonismo al contenido y a las métricas del negocio.
* **Profundidad (Depth):** Capas translúcidas con desenfoque de fondo (*backdrop blur*), sombras suaves multicapa y transiciones fluidas que ayudan a entender la jerarquía.

---

## Pilar 4: Registro Vivo de Decisiones (ADRs) y Trazabilidad
Cualquier decisión arquitectónica no trivial (librería de gráficos elegida, estrategia de gestión de estado cliente vs servidor, sistema de temas) se documenta en `docs/architecture/adr/`.
