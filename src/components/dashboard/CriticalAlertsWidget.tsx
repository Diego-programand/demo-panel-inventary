"use client";

import React, { useState } from "react";
import styles from "./CriticalAlertsWidget.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { useInventoryStore } from "@/core/store/inventory-store";
import { AlertIcon, PlusIcon } from "@/components/icons";

export function CriticalAlertsWidget() {
  const { nicheId, warehouseId } = useDashboard();
  const { getItemsByNiche, recordMovement } = useInventoryStore();
  const [successItemIds, setSuccessItemIds] = useState<Record<string, boolean>>({});

  const items = getItemsByNiche(nicheId, warehouseId);
  const alertItems = items.filter(
    (i) => i.status === "critical" || i.status === "low_stock"
  );

  const handleQuickReorder = (itemId: string, itemName: string, suggestedQty: number) => {
    const docSuffix = itemId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const res = recordMovement({
      itemId,
      type: "purchase_reception",
      quantity: suggestedQty,
      targetLocationId: warehouseId !== "all" ? warehouseId : "wh-main",
      referenceDocument: `ORD-EXP-${docSuffix}`,
      performedBy: "Módulo Automático de Reorden",
      notes: `Reabastecimiento de emergencia activado para ${itemName}.`,
    });

    if (res.success) {
      setSuccessItemIds((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setSuccessItemIds((prev) => ({ ...prev, [itemId]: false }));
      }, 2500);
    }
  };

  return (
    <div className={styles.alertsCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <AlertIcon size={18} color="var(--apple-danger)" />
          <h3 className={styles.title}>Atención de Reabastecimiento</h3>
          {alertItems.length > 0 && (
            <span className={styles.alertCountBadge}>{alertItems.length}</span>
          )}
        </div>
      </div>

      {alertItems.length === 0 ? (
        <div className={styles.emptyState}>
          ✓ Todos los artículos de este sector se encuentran en niveles de stock óptimos.
        </div>
      ) : (
        <div className={styles.alertsList}>
          {alertItems.map((item) => {
            const isCritical = item.status === "critical";
            const suggestedQty = item.reorderPoint || 25;
            const isReordered = successItemIds[item.id];

            return (
              <div
                key={item.id}
                className={`${styles.alertItem} ${
                  isCritical ? styles.alertItemCritical : styles.alertItemLow
                }`}
              >
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <div className={styles.itemSub}>
                    <span>{item.sku}</span>
                    <span>•</span>
                    <span>Mínimo requerido: {item.minThreshold} {item.unitOfMeasure}</span>
                  </div>
                </div>

                <div className={styles.stockNumbers}>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className={`${styles.stockCurrent} tabular-nums`}
                      style={{ color: isCritical ? "var(--apple-danger)" : "var(--apple-warning)" }}
                    >
                      {item.totalStock} {item.unitOfMeasure}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
                      {isCritical ? "Crítico" : "Bajo"}
                    </div>
                  </div>

                  <button
                    className={`${styles.reorderButton} ${isReordered ? styles.reorderSuccess : ""}`}
                    onClick={() => handleQuickReorder(item.id, item.name, suggestedQty)}
                    type="button"
                    disabled={isReordered}
                  >
                    {isReordered ? (
                      <span>✓ Pedido (+{suggestedQty})</span>
                    ) : (
                      <>
                        <PlusIcon size={12} />
                        <span>Reorden (+{suggestedQty})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
