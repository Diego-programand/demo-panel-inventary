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
      referenceDocument: `Entrada #${Math.floor(100 + Math.random() * 900)}`,
      performedBy: "Administrador",
      notes: `Reabastecimiento directo (${reorderQty} ${item.unitOfMeasure})`,
    });

    if (result.success) {
      setReorderedFeedback(true);
      setTimeout(() => setReorderedFeedback(false), 2000);
    }
  }, [item, recordMovement]);

  // Movements specifically for this item
  const itemMovements = useMemo(() => {
    if (!item) return [];
    return movements.filter((m) => m.itemId === item.id).slice(0, 4);
  }, [item, movements]);

  if (!item) return null;

  const statusLabelMap: Record<string, { label: string; color: string; bg: string }> = {
    optimal: { label: "En Stock", color: "var(--apple-success)", bg: "var(--apple-success-subtle)" },
    low_stock: { label: "Poco Stock", color: "var(--apple-warning)", bg: "var(--apple-warning-subtle)" },
    critical: { label: "Agotado / Crítico", color: "var(--apple-danger)", bg: "var(--apple-danger-subtle)" },
    overstock: { label: "Excedente", color: "var(--apple-indigo)", bg: "rgba(88, 86, 214, 0.14)" },
    discontinued: { label: "Descontinuado", color: "var(--apple-text-tertiary)", bg: "var(--apple-bg-secondary)" },
  };

  const statusInfo = statusLabelMap[item.status] || statusLabelMap.optimal;
  const totalValuation = item.totalStock * item.costPrice;

  return (
    <>
      <div className={styles.sheetOverlay} onClick={onClose} aria-label="Cerrar panel de detalles" />
      <aside className={styles.sheetContainer} role="dialog" aria-modal="true" aria-label={`Detalles de ${item.name}`}>
        {/* Header */}
        <header className={styles.sheetHeader}>
          <div className={styles.headerMeta}>
            <div className={styles.topBadgesRow}>
              <button
                className={styles.skuBadge}
                onClick={handleCopySku}
                title="Copiar código al portapapeles"
                aria-label={`Código: ${item.sku}. Clic para copiar`}
              >
                <span>{item.sku}</span>
                {copied ? <CheckIcon size={12} color="var(--apple-success)" /> : <CopyIcon size={12} />}
              </button>

              <span className={styles.categoryBadge}>{item.category}</span>

              <span
                className={styles.statusBadge}
                style={{
                  color: statusInfo.color,
                  backgroundColor: statusInfo.bg,
                }}
              >
                {statusInfo.label}
              </span>
            </div>

            <h2 className={styles.sheetTitle}>{item.name}</h2>
            <p className={styles.sheetDesc}>{item.description}</p>
          </div>

          <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar ventana de detalles">
            <CloseIcon size={16} />
          </button>
        </header>

        {/* Body */}
        <div className={styles.sheetBody}>
          {/* Card 1: Stock & Ubicaciones */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Existencias Disponibles</span>
              <span className="tabular-nums" style={{ color: "var(--apple-text-secondary)", fontSize: "12px" }}>
                Mínimo sugerido: {item.minThreshold} {item.unitOfMeasure}
              </span>
            </div>

            <div className={styles.stockHero}>
              <div>
                <span className={`tabular-nums ${styles.stockBigNumber}`}>{item.totalStock}</span>
                <span className={styles.stockUnit}>{item.unitOfMeasure}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "var(--apple-text-secondary)", display: "block" }}>
                  Valor en costo
                </span>
                <span className="tabular-nums" style={{ fontSize: "16px", fontWeight: 600, color: "var(--apple-text-primary)" }}>
                  ${totalValuation.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className={styles.warehouseDivider}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--apple-text-secondary)" }}>
                Distribución por Sedes:
              </span>
            </div>

            <div className={styles.warehouseList}>
              {Object.entries(item.stockByLocation).map(([whId, qty]) => {
                const whInfo = SAMPLE_WAREHOUSES.find((w) => w.id === whId);
                return (
                  <div key={whId} className={styles.whRow}>
                    <div className={styles.whInfo}>
                      <span className={styles.whName}>{whInfo?.name || whId}</span>
                      <span className={styles.whCity}>{whInfo?.city || "Sede"}</span>
                    </div>
                    <span className={`tabular-nums ${styles.whStock}`}>
                      {qty} {item.unitOfMeasure}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Card 2: Precios y Características */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Precios & Márgenes</span>
            </div>
            <div className={styles.attributesGrid}>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Precio de Venta</span>
                <span className={`tabular-nums ${styles.attrValue}`} style={{ color: "var(--apple-accent)", fontWeight: 700 }}>
                  ${item.salePrice.toLocaleString("es-CO")}
                </span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Costo de Compra</span>
                <span className={`tabular-nums ${styles.attrValue}`}>
                  ${item.costPrice.toLocaleString("es-CO")}
                </span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Margen Estimado</span>
                <span className={`tabular-nums ${styles.attrValue}`} style={{ color: "var(--apple-success)", fontWeight: 600 }}>
                  {item.salePrice > 0
                    ? `${Math.round(((item.salePrice - item.costPrice) / item.salePrice) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attrLabel}>Unidad</span>
                <span className={styles.attrValue}>{item.unitOfMeasure}</span>
              </div>
            </div>

            {/* Atributos específicos del producto */}
            {Object.keys(item.nicheSpecific || {}).length > 0 && (
              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--apple-border-subtle)" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--apple-text-secondary)", display: "block", marginBottom: "8px" }}>
                  Características:
                </span>
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
              </div>
            )}
          </section>

          {/* Card 3: Actividad Reciente del Producto */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <span>Últimos Movimientos</span>
              <span style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>
                Recientes
              </span>
            </div>
            {itemMovements.length === 0 ? (
              <span style={{ fontSize: "13px", color: "var(--apple-text-secondary)", fontStyle: "italic" }}>
                Sin movimientos recientes registrados.
              </span>
            ) : (
              <div className={styles.kardexList}>
                {itemMovements.map((m) => {
                  const isPositive = m.type === "purchase_reception" || m.type === "transfer_in";
                  const color = isPositive ? "var(--apple-success)" : "var(--apple-danger)";
                  const sign = isPositive ? "+" : "-";

                  const typeTitles: Record<string, string> = {
                    purchase_reception: "Entrada",
                    sales_dispatch: "Venta / Salida",
                    transfer_out: "Traslado Enviado",
                    transfer_in: "Traslado Recibido",
                    audit_adjustment: "Ajuste",
                    adjustment_loss: "Merma",
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
                          {m.referenceDocument || m.id} • {m.performedBy || "Administrador"}
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
                <span>¡Entrada de {Math.max(10, item.minThreshold * 2)} {item.unitOfMeasure} Registrada!</span>
              </>
            ) : (
              <>
                <PlusIcon size={16} />
                <span>+ Añadir Unidades (+{Math.max(10, item.minThreshold * 2)} {item.unitOfMeasure})</span>
              </>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}
