"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./ItemDetailSheet.module.css";
import { InventoryItemCore } from "@/core/types/inventory";
import { NicheProfile } from "@/core/types/niche";
import { useInventoryStore } from "@/core/store/inventory-store";
import { SAMPLE_WAREHOUSES } from "@/core/context/DashboardContext";
import { CloseIcon, CopyIcon, CheckIcon, PlusIcon } from "@/components/icons";

interface ItemDetailSheetProps {
  item: InventoryItemCore | null;
  onClose: () => void;
  nicheProfile: NicheProfile;
}

export function ItemDetailSheet({ item, onClose, nicheProfile }: ItemDetailSheetProps) {
  const { recordMovement, movements } = useInventoryStore();
  const [copied, setCopied] = useState(false);
  const [reorderedFeedback, setReorderedFeedback] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopySku = useCallback(() => {
    if (!item) return;
    navigator.clipboard.writeText(item.sku).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, [item]);

  const handleQuickReorder = useCallback(() => {
    if (!item) return;
    const reorderQty = Math.max(10, item.minThreshold * 2);
    const targetLoc = Object.keys(item.stockByLocation)[0] || "wh-main";
    const result = recordMovement({
      itemId: item.id,
      type: "purchase_reception",
      quantity: reorderQty,
      targetLocationId: targetLoc,
      referenceDocument: `OC-EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      performedBy: "Inspector Rápido",
      notes: `Reabastecimiento automático desde inspector de SKU (${reorderQty} ${item.unitOfMeasure})`,
    });

    if (result.success) {
      setReorderedFeedback(true);
      setTimeout(() => setReorderedFeedback(false), 2000);
    }
  }, [item, recordMovement]);

  // Movements specifically for this item
  const itemMovements = useMemo(() => {
    if (!item) return [];
    return movements.filter((m) => m.itemId === item.id).slice(0, 5);
  }, [item, movements]);

  if (!item) return null;

  const statusLabelMap: Record<string, { label: string; color: string; bg: string }> = {
    optimal: { label: "Óptimo", color: "var(--apple-success)", bg: "var(--apple-success-subtle)" },
    low_stock: { label: "Stock Bajo", color: "var(--apple-warning)", bg: "var(--apple-warning-subtle)" },
    critical: { label: "Crítico", color: "var(--apple-danger)", bg: "var(--apple-danger-subtle)" },
    overstock: { label: "Excedente", color: "var(--apple-indigo)", bg: "rgba(88, 86, 214, 0.14)" },
    discontinued: { label: "Descontinuado", color: "var(--apple-text-tertiary)", bg: "var(--apple-bg-secondary)" },
  };

  const statusInfo = statusLabelMap[item.status] || statusLabelMap.optimal;

  const maxVal = item.maxCapacity || Math.max(item.totalStock * 1.5, item.minThreshold * 3);
  const fillPercent = Math.min(100, Math.round((item.totalStock / maxVal) * 100));

  const totalValuation = item.totalStock * item.costPrice;

  return (
    <>
      <div className={styles.sheetOverlay} onClick={onClose} aria-label="Cerrar inspector" />
      <aside className={styles.sheetContainer} role="dialog" aria-modal="true" aria-label={`Detalles de ${item.name}`}>
        {/* Header */}
        <header className={styles.sheetHeader}>
          <div className={styles.headerMeta}>
            <div className={styles.topPills}>
              <button
                className={styles.skuBadge}
                onClick={handleCopySku}
                title="Copiar SKU al portapapeles"
                aria-label={`SKU: ${item.sku}. Clic para copiar`}
              >
                <span>{item.sku}</span>
                {copied ? <CheckIcon size={12} color="var(--apple-success)" /> : <CopyIcon size={12} />}
              </button>

              <span className={styles.categoryPill}>{item.category}</span>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: "var(--apple-radius-pill)",
                  color: statusInfo.color,
                  backgroundColor: statusInfo.bg,
                }}
              >
                {statusInfo.label}
              </span>
            </div>

            <h2 className={styles.sheetTitle}>{item.name}</h2>
          </div>

          <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar panel">
            <CloseIcon size={16} />
          </button>
        </header>

        {/* Body */}
        <div className={styles.sheetBody}>
          {/* Stock Meter Hero */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Nivel de Existencias</span>
              <span className="tabular-nums" style={{ color: statusInfo.color }}>
                {fillPercent}% Capacidad
              </span>
            </div>

            <div className={styles.stockHero}>
              <div>
                <span className={`tabular-nums ${styles.stockBigNumber}`}>{item.totalStock}</span>
                <span className={styles.stockUnit}>{item.unitOfMeasure}</span>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--apple-text-tertiary)", display: "block" }}>
                  Valorización Total
                </span>
                <span className="tabular-nums" style={{ fontSize: "16px", fontWeight: 600 }}>
                  ${totalValuation.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className={styles.meterTrack}>
              <div
                className={styles.meterFill}
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: statusInfo.color,
                }}
              />
            </div>

            <div className={styles.thresholdsRow}>
              <span>Mínimo: {item.minThreshold} {item.unitOfMeasure}</span>
              <span>Capacidad: {item.maxCapacity || "Sin límite"}</span>
            </div>
          </section>

          {/* Pricing & Commercial */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Estructura de Precios & Margen</span>
            </div>
            <div className={styles.attributesGrid}>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Costo Unitario</span>
                <span className={`tabular-nums ${styles.attrValue}`}>
                  ${item.costPrice.toLocaleString("es-CO")}
                </span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Precio de Venta</span>
                <span className={`tabular-nums ${styles.attrValue}`}>
                  ${item.salePrice.toLocaleString("es-CO")}
                </span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Margen Bruto</span>
                <span className={`tabular-nums ${styles.attrValue}`} style={{ color: "var(--apple-success)" }}>
                  {item.salePrice > 0
                    ? `${Math.round(((item.salePrice - item.costPrice) / item.salePrice) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Unidad de Manejo</span>
                <span className={styles.attrValue}>{item.unitOfMeasure}</span>
              </div>
            </div>
          </section>

          {/* Niche Specific Attributes */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Atributos Sectoriales ({nicheProfile.name})</span>
            </div>
            <div className={styles.attributesGrid}>
              {Object.entries(item.nicheSpecific || {}).map(([key, value]) => {
                const schemaDef = nicheProfile.customFields.find((f) => f.key === key);
                const label = schemaDef ? schemaDef.label : key;
                return (
                  <div key={key} className={styles.attributeItem}>
                    <span className={styles.attrLabel}>{label}</span>
                    <span className={styles.attrValue} title={String(value)}>
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Warehouse Breakdown */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Distribución por Almacén</span>
            </div>
            <div className={styles.warehouseList}>
              {Object.entries(item.stockByLocation).map(([whId, qty]) => {
                const whInfo = SAMPLE_WAREHOUSES.find((w) => w.id === whId);
                return (
                  <div key={whId} className={styles.whRow}>
                    <div className={styles.whInfo}>
                      <span className={styles.whName}>{whInfo?.name || whId}</span>
                      <span className={styles.whCity}>
                        {whInfo?.city || "Sede"} • {whInfo?.code || "WH"}
                      </span>
                    </div>
                    <span className={`tabular-nums ${styles.whStock}`}>
                      {qty} {item.unitOfMeasure}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Kardex Movements for this SKU */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Historial Kardex Reciente</span>
              <span style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
                Últimos 5 registros
              </span>
            </div>
            {itemMovements.length === 0 ? (
              <span style={{ fontSize: "13px", color: "var(--apple-text-tertiary)", fontStyle: "italic" }}>
                Sin movimientos registrados aún.
              </span>
            ) : (
              <div className={styles.kardexList}>
                {itemMovements.map((m) => {
                  const isPositive = m.type === "purchase_reception" || m.type === "transfer_in";
                  const color = isPositive ? "var(--apple-success)" : "var(--apple-danger)";
                  const sign = isPositive ? "+" : "-";

                  const typeTitles: Record<string, string> = {
                    purchase_reception: "Entrada / Compra",
                    sales_dispatch: "Salida / Venta",
                    transfer_out: "Traslado Enviado",
                    transfer_in: "Traslado Recibido",
                    audit_adjustment: "Ajuste de Auditoría",
                  };

                  return (
                    <div key={m.id} className={styles.kardexItem}>
                      <div className={styles.kardexDot} style={{ backgroundColor: color }} />
                      <div className={styles.kardexContent}>
                        <div className={styles.kardexTop}>
                          <span className={styles.kardexType}>
                            {typeTitles[m.type] || m.type}
                          </span>
                          <span className={`tabular-nums ${styles.kardexQty}`} style={{ color }}>
                            {sign}{m.quantity} {item.unitOfMeasure}
                          </span>
                        </div>
                        <span className={styles.kardexMeta}>
                          {m.referenceDocument || m.id} • {m.performedBy || "Operador"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer Actions */}
        <footer className={styles.sheetFooter}>
          <button
            className={styles.reorderButton}
            onClick={handleQuickReorder}
            disabled={reorderedFeedback}
          >
            {reorderedFeedback ? (
              <>
                <CheckIcon size={16} />
                <span>¡Reorden de {Math.max(10, item.minThreshold * 2)} {item.unitOfMeasure} Registrado!</span>
              </>
            ) : (
              <>
                <PlusIcon size={16} />
                <span>Reorden Inmediato (+{Math.max(10, item.minThreshold * 2)} {item.unitOfMeasure})</span>
              </>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}
