/**
 * ========================================================
 * DOMINIO NÚCLEO: GESTIÓN DE INVENTARIO UNIVERSAL
 * ========================================================
 */

import { NicheId } from "./niche";

export type StockStatus = 
  | 'optimal'      // En nivel saludable
  | 'low_stock'    // Cerca o debajo del umbral mínimo
  | 'critical'     // Agotado o en riesgo inminente de ruptura
  | 'overstock'    // Excedente significativo
  | 'discontinued'; // Fuera de catálogo / obsoleto

export type MovementType = 
  | 'purchase_reception' // Entrada por compra
  | 'sales_dispatch'     // Salida por venta
  | 'transfer_in'        // Entrada por traslado
  | 'transfer_out'       // Salida por traslado
  | 'adjustment_loss'    // Merma / Pérdida / Daño
  | 'audit_adjustment';  // Ajuste por conteo físico

export interface LocationWarehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  capacityUtilization: number; // Porcentaje 0 - 100
  zones: string[];
}

export interface InventoryItemCore {
  id: string;
  nicheId: NicheId;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  category: string;
  unitOfMeasure: string;
  costPrice: number;
  salePrice: number;
  minThreshold: number;
  reorderPoint: number;
  maxCapacity?: number;
  tags: string[];
  status: StockStatus;
  
  // Existencias
  totalStock: number;
  stockByLocation: Record<string, number>;
  
  // Datos extendidos por nicho activo
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
  referenceDocument?: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface InventorySummaryMetrics {
  totalItemsCount: number;
  totalValuationCost: number;
  totalValuationRetail: number;
  criticalStockItemsCount: number;
  optimalStockRatio: number;
  pendingTransfersCount: number;
  monthlyTurnoverRate: number;
}
