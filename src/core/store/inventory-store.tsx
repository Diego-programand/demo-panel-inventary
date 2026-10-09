"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import {
  InventoryItemCore,
  InventoryMovement,
  InventorySummaryMetrics,
  MovementType,
  StockStatus,
} from "@/core/types/inventory";
import { NicheId } from "@/core/types/niche";
import { INITIAL_INVENTORY_ITEMS, INITIAL_MOVEMENTS } from "@/core/data/mock-datasets";

export interface MovementInput {
  itemId: string;
  type: MovementType;
  quantity: number;
  sourceLocationId?: string;
  targetLocationId?: string;
  referenceDocument?: string;
  performedBy?: string;
  notes?: string;
}

export interface InventoryStoreContextValue {
  items: InventoryItemCore[];
  movements: InventoryMovement[];
  getItemsByNiche: (nicheId: NicheId, warehouseId?: string) => InventoryItemCore[];
  getItemById: (id: string) => InventoryItemCore | undefined;
  getMetricsByNiche: (nicheId: NicheId, warehouseId?: string) => InventorySummaryMetrics;
  recordMovement: (input: MovementInput) => { success: boolean; error?: string };
  addItem: (item: Omit<InventoryItemCore, "id" | "createdAt" | "updatedAt">) => InventoryItemCore;
  updateItem: (id: string, updates: Partial<InventoryItemCore>) => void;
  resetDemoData: () => void;
}

const InventoryStoreContext = createContext<InventoryStoreContextValue | null>(null);

function calculateStatus(totalStock: number, minThreshold: number, maxCapacity?: number): StockStatus {
  if (totalStock <= 0) return "critical";
  if (totalStock <= minThreshold) {
    return totalStock <= Math.max(1, Math.floor(minThreshold / 2)) ? "critical" : "low_stock";
  }
  if (maxCapacity && totalStock >= maxCapacity * 0.95) {
    return "overstock";
  }
  return "optimal";
}

export function InventoryStoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItemCore[]>(() => INITIAL_INVENTORY_ITEMS);
  const [movements, setMovements] = useState<InventoryMovement[]>(() => INITIAL_MOVEMENTS);

  const getItemById = useCallback(
    (id: string) => {
      return items.find((i) => i.id === id);
    },
    [items]
  );

  const getItemsByNiche = useCallback(
    (nicheId: NicheId, warehouseId?: string) => {
      return items.filter((item) => {
        if (item.nicheId !== nicheId) return false;
        if (warehouseId && warehouseId !== "all") {
          return (item.stockByLocation[warehouseId] || 0) > 0;
        }
        return true;
      });
    },
    [items]
  );

  const getMetricsByNiche = useCallback(
    (nicheId: NicheId, warehouseId?: string): InventorySummaryMetrics => {
      const nicheItems = items.filter((i) => i.nicheId === nicheId);

      let totalValuationCost = 0;
      let totalValuationRetail = 0;
      let criticalCount = 0;
      let optimalCount = 0;

      for (const item of nicheItems) {
        const effectiveStock =
          warehouseId && warehouseId !== "all"
            ? item.stockByLocation[warehouseId] || 0
            : item.totalStock;

        totalValuationCost += effectiveStock * item.costPrice;
        totalValuationRetail += effectiveStock * item.salePrice;

        if (item.status === "critical" || item.status === "low_stock") {
          criticalCount++;
        } else if (item.status === "optimal") {
          optimalCount++;
        }
      }

      const totalItemsCount = nicheItems.length;
      const optimalStockRatio =
        totalItemsCount > 0 ? Math.round((optimalCount / totalItemsCount) * 1000) / 10 : 100;

      return {
        totalItemsCount,
        totalValuationCost,
        totalValuationRetail,
        criticalStockItemsCount: criticalCount,
        optimalStockRatio,
        pendingTransfersCount: movements.filter((m) => m.type.startsWith("transfer")).length,
        monthlyTurnoverRate: 4.6,
      };
    },
    [items, movements]
  );

  const recordMovement = useCallback(
    (input: MovementInput): { success: boolean; error?: string } => {
      const targetItem = items.find((i) => i.id === input.itemId);
      if (!targetItem) {
        return { success: false, error: "Artículo no encontrado en el inventario." };
      }

      if (input.quantity <= 0) {
        return { success: false, error: "La cantidad del movimiento debe ser superior a cero." };
      }

      const updatedLocations = { ...targetItem.stockByLocation };

      // Validaciones y mutaciones según tipo de movimiento
      if (input.type === "sales_dispatch" || input.type === "adjustment_loss") {
        const sourceLoc = input.sourceLocationId || "wh-main";
        const currentLocStock = updatedLocations[sourceLoc] || 0;
        if (currentLocStock < input.quantity) {
          return {
            success: false,
            error: `Stock insuficiente en ${sourceLoc}. Disponible: ${currentLocStock}, Requerido: ${input.quantity}`,
          };
        }
        updatedLocations[sourceLoc] = currentLocStock - input.quantity;
      } else if (input.type === "purchase_reception") {
        const targetLoc = input.targetLocationId || "wh-main";
        updatedLocations[targetLoc] = (updatedLocations[targetLoc] || 0) + input.quantity;
      } else if (input.type === "transfer_in" || input.type === "transfer_out") {
        const sourceLoc = input.sourceLocationId || "wh-main";
        const targetLoc = input.targetLocationId || "wh-north";
        const currentLocStock = updatedLocations[sourceLoc] || 0;

        if (currentLocStock < input.quantity) {
          return {
            success: false,
            error: `Stock insuficiente para traslado en ${sourceLoc}. Disponible: ${currentLocStock}`,
          };
        }

        updatedLocations[sourceLoc] = currentLocStock - input.quantity;
        updatedLocations[targetLoc] = (updatedLocations[targetLoc] || 0) + input.quantity;
      } else if (input.type === "audit_adjustment") {
        const targetLoc = input.targetLocationId || input.sourceLocationId || "wh-main";
        updatedLocations[targetLoc] = input.quantity;
      }

      // Recalcular stock total consolidado
      const newTotalStock = Object.values(updatedLocations).reduce((sum, val) => sum + val, 0);
      const newStatus = calculateStatus(newTotalStock, targetItem.minThreshold, targetItem.maxCapacity);

      const now = new Date().toISOString();

      const newMovement: InventoryMovement = {
        id: `mov-${Date.now().toString(36)}`,
        itemId: targetItem.id,
        itemSku: targetItem.sku,
        itemName: targetItem.name,
        type: input.type,
        quantity: input.quantity,
        sourceLocationId: input.sourceLocationId,
        targetLocationId: input.targetLocationId,
        referenceDocument: input.referenceDocument || `MOV-${Date.now().toString().slice(-6)}`,
        performedBy: input.performedBy || "Operador Demo",
        timestamp: now,
        notes: input.notes,
      };

      setItems((prev) =>
        prev.map((item) =>
          item.id === targetItem.id
            ? {
                ...item,
                stockByLocation: updatedLocations,
                totalStock: newTotalStock,
                status: newStatus,
                updatedAt: now,
              }
            : item
        )
      );

      setMovements((prev) => [newMovement, ...prev]);

      return { success: true };
    },
    [items]
  );

  const addItem = useCallback(
    (itemInput: Omit<InventoryItemCore, "id" | "createdAt" | "updatedAt">): InventoryItemCore => {
      const now = new Date().toISOString();
      const newItem: InventoryItemCore = {
        ...itemInput,
        id: `item-${Date.now().toString(36)}`,
        createdAt: now,
        updatedAt: now,
      };

      setItems((prev) => [newItem, ...prev]);
      return newItem;
    },
    []
  );

  const updateItem = useCallback((id: string, updates: Partial<InventoryItemCore>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  const resetDemoData = useCallback(() => {
    setItems(INITIAL_INVENTORY_ITEMS);
    setMovements(INITIAL_MOVEMENTS);
  }, []);

  const value = useMemo(
    () => ({
      items,
      movements,
      getItemsByNiche,
      getItemById,
      getMetricsByNiche,
      recordMovement,
      addItem,
      updateItem,
      resetDemoData,
    }),
    [
      items,
      movements,
      getItemsByNiche,
      getItemById,
      getMetricsByNiche,
      recordMovement,
      addItem,
      updateItem,
      resetDemoData,
    ]
  );

  return (
    <InventoryStoreContext.Provider value={value}>
      {children}
    </InventoryStoreContext.Provider>
  );
}

export function useInventoryStore() {
  const context = useContext(InventoryStoreContext);
  if (!context) {
    throw new Error("useInventoryStore debe utilizarse dentro de un InventoryStoreProvider");
  }
  return context;
}
