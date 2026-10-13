"use client";

import React, { useState, useCallback } from "react";
import styles from "./BatchActionBar.module.css";
import { InventoryItemCore } from "@/core/types/inventory";
import { useInventoryStore } from "@/core/store/inventory-store";
import { ExportIcon, PlusIcon, CloseIcon, CheckIcon } from "@/components/icons";

interface BatchActionBarProps {
  selectedItems: InventoryItemCore[];
  onClearSelection: () => void;
  nichePluralName: string;
}

export function BatchActionBar({
  selectedItems,
  onClearSelection,
  nichePluralName,
}: BatchActionBarProps) {
  const { recordMovement } = useInventoryStore();
  const [reorderedDone, setReorderedDone] = useState(false);

  const count = selectedItems.length;

  const handleExportCSV = useCallback(() => {
    if (selectedItems.length === 0) return;

    const headers = [
      "SKU",
      "Nombre",
      "Categoría",
      "Stock Total",
      "Unidad",
      "Costo Unitario",
      "Precio Venta",
      "Estado",
      "Sector",
    ];

    const rows = selectedItems.map((item) => [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.totalStock,
      `"${item.unitOfMeasure}"`,
      item.costPrice,
      item.salePrice,
      `"${item.status}"`,
      `"${item.nicheId}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `catalogo_${nichePluralName.toLowerCase()}_seleccion.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedItems, nichePluralName]);

  const handleBatchReorder = useCallback(() => {
    if (selectedItems.length === 0) return;

    for (const item of selectedItems) {
      const qty = Math.max(10, item.minThreshold * 2);
      const targetLoc = Object.keys(item.stockByLocation)[0] || "wh-main";
      recordMovement({
        itemId: item.id,
        type: "purchase_reception",
        quantity: qty,
        targetLocationId: targetLoc,
        referenceDocument: `Entrada #${Math.floor(100 + Math.random() * 900)}`,
        performedBy: "Administrador",
        notes: `Entrada por lote para ${item.name} (${item.sku})`,
      });
    }

    setReorderedDone(true);
    setTimeout(() => {
      setReorderedDone(false);
      onClearSelection();
    }, 1800);
  }, [selectedItems, recordMovement, onClearSelection]);

  if (count === 0) return null;

  return (
    <div className={styles.actionBarContainer} role="toolbar" aria-label="Acciones de selección por lote">
      <div className={styles.countIndicator}>
        <span className={styles.countBadge}>{count}</span>
        <span>seleccionado{count > 1 ? "s" : ""}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.actionsGroup}>
        <button
          className={styles.secondaryBtn}
          onClick={handleExportCSV}
          title="Descargar selección en formato CSV"
        >
          <ExportIcon size={14} />
          <span>Exportar CSV</span>
        </button>

        <button
          className={styles.primaryBtn}
          onClick={handleBatchReorder}
          disabled={reorderedDone}
        >
          {reorderedDone ? (
            <>
              <CheckIcon size={14} />
              <span>¡Entrada Registrada!</span>
            </>
          ) : (
            <>
              <PlusIcon size={14} />
              <span>Pedir Más Unidades</span>
            </>
          )}
        </button>

        <button
          className={styles.clearBtn}
          onClick={onClearSelection}
          aria-label="Limpiar selección"
          title="Limpiar selección"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}
