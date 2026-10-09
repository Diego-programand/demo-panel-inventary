# 01. Modelo de Datos Núcleo y Arquitectura Multi-Nicho

## 1. El Concepto del Inventario Agnóstico
Para que este panel de demostración sea una herramienta comercial demoledora frente a clientes de diversos sectores, la arquitectura separa el **Motor de Inventario Central** de las **Capas de Adaptación por Nicho**.

```
┌────────────────────────────────────────────────────────┐
│               CAPA DE EXPERIENCIA (UI)                 │
│  - Apple HIG Dashboard Shell                           │
│  - Selectores de Nicho Dinámico (Switch Preset)        │
│  - Gráficos y Tablas Reactivas                         │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          CAPA DE ADAPTADORES DE NICHO (PLUGINS)        │
│  - Retail & Moda: Atributos Talla/Color, Temporadas    │
│  - Farma & Salud: Lotes, Caducidad, Trazabilidad       │
│  - Alimentos: Mermas, Unidades Kg/Lt, Reabastecimiento │
│  - Tecnología: Números de Serie, Garantías             │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                NÚCLEO DE DOMINIO INVENTARIO            │
│  - Items & SKUs                                        │
│  - Almacenes & Ubicaciones                             │
│  - Niveles de Stock & Estados                          │
│  - Registro Inmutable de Movimientos                   │
│  - Alertas & Umbrales de Reorden                       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Tipos Principales del Dominio Núcleo (TypeScript Core Contract)

```typescript
export type StockStatus = 'optimal' | 'low_stock' | 'critical' | 'overstock' | 'discontinued';

export type MovementType = 
  | 'purchase_reception'  // Entrada por compra
  | 'sales_dispatch'      // Salida por venta
  | 'transfer_in'         // Entrada por traspaso entre almacenes
  | 'transfer_out'        // Salida por traspaso entre almacenes
  | 'adjustment_loss'     // Ajuste por merma, daño o robo
  | 'audit_adjustment';   // Ajuste tras conteo físico

export interface LocationWarehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  zones?: string[]; // ej: ['Pasillo A', 'Cámara Fría', 'Estante 3']
}

export interface InventoryItemCore {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  category: string;
  unitOfMeasure: string; // 'pz', 'kg', 'lt', 'caja', etc.
  costPrice: number;
  salePrice: number;
  minThreshold: number;
  reorderPoint: number;
  maxCapacity?: number;
  tags: string[];
  status: StockStatus;
  
  // Stock consolidado y por almacén
  totalStock: number;
  stockByLocation: Record<string, number>; // warehouseId -> cantidad
  
  // Datos extendidos específicos del nicho activo
  nicheSpecific: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  sourceLocationId?: string;
  targetLocationId?: string;
  referenceDocument?: string; // N° de factura, orden de compra, remisión
  performedBy: string;
  timestamp: string;
  notes?: string;
}
```

---

## 3. Especificación de Perfiles de Nicho (Niche Profiles)

### A. Nicho: Moda & Retail (`retail_fashion`)
* **Vocabulario:** Prendas, Tallas, Colores, Colección.
* **Campos Específicos (`nicheSpecific`):**
  * `size`: 'XS', 'S', 'M', 'L', 'XL'
  * `color`: 'Azul Marino', 'Negro', 'Blanco', etc.
  * `season`: 'Otoño-Invierno 2026'
  * `material`: '100% Algodón Pima'
* **Gráfica clave:** Distribución de stock por curva de tallas y rotación por colección.

### B. Nicho: Farmacéutica & Salud (`pharma_health`)
* **Vocabulario:** Medicamentos, Principio Activo, Lote, Fecha de Vencimiento.
* **Campos Específicos (`nicheSpecific`):**
  * `batchNumber`: 'LT-98234'
  * `expiryDate`: '2027-04-15'
  * `requiresColdChain`: true
  * `healthRegistry`: 'INVIMA-2024-M-0089'
* **Gráfica clave:** Matriz de riesgo por próximos vencimientos (semáforo de 30, 60, 90 días).

### C. Nicho: Tecnología & Hardware (`tech_electronics`)
* **Vocabulario:** Equipos, Número de Serie, Garantía, Especificaciones.
* **Campos Específicos (`nicheSpecific`):**
  * `serialNumbers`: string[]
  * `warrantyMonths`: 24
  * `modelNumber`: 'A2890'
* **Gráfica clave:** Valorización de inventario de alto costo y tiempo medio de permanencia en almacén.

### D. Nicho: Alimentos & Restauración (`food_beverage`)
* **Vocabulario:** Insumos, Mermas, Rotación FIFO, Perecederos.
* **Campos Específicos (`nicheSpecific`):**
  * `storageCondition`: 'Refrigerado (2°C - 5°C)'
  * `shelfLifeDays`: 7
  * `perishable`: true
* **Gráfica clave:** Reporte de mermas acumuladas y velocidad de consumo de insumos críticos.
