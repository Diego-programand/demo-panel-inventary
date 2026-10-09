"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./MovementModal.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { useInventoryStore } from "@/core/store/inventory-store";
import { MovementType } from "@/core/types/inventory";
import { CloseIcon, CheckIcon, AlertIcon } from "@/components/icons";

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemId?: string;
}

type OperationTab = "purchase_reception" | "sales_dispatch" | "transfer" | "audit_adjustment";

export function MovementModal({ isOpen, onClose, preselectedItemId }: MovementModalProps) {
  const { nicheId, nicheProfile, warehouses } = useDashboard();
  const { getItemsByNiche, recordMovement } = useInventoryStore();

  const realWarehouses = useMemo(
    () => warehouses.filter((w) => w.id !== "all"),
    [warehouses]
  );

  const availableItems = useMemo(
    () => getItemsByNiche(nicheId),
    [getItemsByNiche, nicheId]
  );

  const [operationType, setOperationType] = useState<OperationTab>("purchase_reception");
  const [userSelectedItemId, setUserSelectedItemId] = useState<string>("");
  const selectedItemId = userSelectedItemId || preselectedItemId || availableItems[0]?.id || "";
  const [sourceLocationId, setSourceLocationId] = useState<string>("wh-main");
  const [targetLocationId, setTargetLocationId] = useState<string>("wh-north");
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceDocument, setReferenceDocument] = useState<string>("FAC-PROV-9011");
  const [performedBy, setPerformedBy] = useState<string>("Operador de Turno");
  const [notes, setNotes] = useState<string>("");
  const [adjustmentSign, setAdjustmentSign] = useState<"+" | "-">("+");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleTabChange = useCallback((type: OperationTab) => {
    setOperationType(type);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    if (type === "purchase_reception") {
      setReferenceDocument(`FAC-PROV-${randomNum}`);
    } else if (type === "sales_dispatch") {
      setReferenceDocument(`GUIA-VENTA-${randomNum}`);
    } else if (type === "transfer") {
      setReferenceDocument(`TRAS-INT-${randomNum}`);
    } else {
      setReferenceDocument(`AUD-CONTEO-${randomNum}`);
    }
    setErrorMessage("");
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentItem = useMemo(
    () => availableItems.find((i) => i.id === selectedItemId) || availableItems[0],
    [availableItems, selectedItemId]
  );

  // Live stock in source and target locations
  const sourceStock = useMemo(() => {
    if (!currentItem) return 0;
    return currentItem.stockByLocation[sourceLocationId] || 0;
  }, [currentItem, sourceLocationId]);

  const targetStock = useMemo(() => {
    if (!currentItem) return 0;
    return currentItem.stockByLocation[targetLocationId] || 0;
  }, [currentItem, targetLocationId]);

  // Projected stock balance calculations
  const projectedInfo = useMemo(() => {
    if (!currentItem) return { before: 0, after: 0, valid: true, error: "" };

    if (operationType === "purchase_reception") {
      const before = targetStock;
      const after = before + quantity;
      return { before, after, valid: quantity > 0, error: "" };
    }

    if (operationType === "sales_dispatch") {
      const before = sourceStock;
      const after = before - quantity;
      const valid = quantity > 0 && quantity <= before;
      const error = quantity > before ? `Stock insuficiente en origen (disponible: ${before} ${currentItem.unitOfMeasure})` : "";
      return { before, after, valid, error };
    }

    if (operationType === "transfer") {
      const isSameWarehouse = sourceLocationId === targetLocationId;
      const hasEnoughStock = quantity > 0 && quantity <= sourceStock;
      let error = "";
      if (isSameWarehouse) error = "El almacén de destino debe ser diferente al de origen";
      else if (!hasEnoughStock) error = `Stock insuficiente en origen para transferir (disponible: ${sourceStock} ${currentItem.unitOfMeasure})`;

      return {
        before: sourceStock,
        after: sourceStock - quantity,
        valid: !isSameWarehouse && hasEnoughStock,
        error,
      };
    }

    // audit_adjustment
    const before = targetStock;
    const after = adjustmentSign === "+" ? before + quantity : Math.max(0, before - quantity);
    return { before, after, valid: quantity > 0, error: "" };
  }, [currentItem, operationType, quantity, sourceStock, targetStock, sourceLocationId, targetLocationId, adjustmentSign]);

  // Submit Handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentItem || !projectedInfo.valid) return;

      if (operationType === "purchase_reception") {
        const res = recordMovement({
          itemId: currentItem.id,
          type: "purchase_reception",
          quantity,
          targetLocationId,
          referenceDocument,
          performedBy,
          notes,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Error al procesar movimiento");
          return;
        }
      } else if (operationType === "sales_dispatch") {
        const res = recordMovement({
          itemId: currentItem.id,
          type: "sales_dispatch",
          quantity,
          sourceLocationId,
          referenceDocument,
          performedBy,
          notes,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Error al procesar movimiento");
          return;
        }
      } else if (operationType === "transfer") {
        // Atomic transfer: transfer_out from source, transfer_in to target
        const resOut = recordMovement({
          itemId: currentItem.id,
          type: "transfer_out",
          quantity,
          sourceLocationId,
          targetLocationId,
          referenceDocument: `${referenceDocument}-OUT`,
          performedBy,
          notes: `Traslado hacia ${targetLocationId}: ${notes}`,
        });
        if (!resOut.success) {
          setErrorMessage(resOut.error || "Error en traslado de salida");
          return;
        }

        recordMovement({
          itemId: currentItem.id,
          type: "transfer_in",
          quantity,
          sourceLocationId,
          targetLocationId,
          referenceDocument: `${referenceDocument}-IN`,
          performedBy,
          notes: `Traslado recibido desde ${sourceLocationId}: ${notes}`,
        });
      } else if (operationType === "audit_adjustment") {
        const movementType: MovementType = adjustmentSign === "+" ? "audit_adjustment" : "adjustment_loss";
        const res = recordMovement({
          itemId: currentItem.id,
          type: movementType,
          quantity,
          targetLocationId,
          referenceDocument,
          performedBy,
          notes: `Ajuste (${adjustmentSign}): ${notes}`,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Error en ajuste");
          return;
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    },
    [
      currentItem,
      projectedInfo.valid,
      operationType,
      quantity,
      targetLocationId,
      sourceLocationId,
      referenceDocument,
      performedBy,
      notes,
      adjustmentSign,
      recordMovement,
      onClose,
    ]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} aria-label="Cerrar modal de movimientos">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <header className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <h2 className={styles.modalTitle}>Registrar Movimiento de Inventario</h2>
            <p className={styles.modalSubtitle}>Sector: {nicheProfile.name} • Kardex Central</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar ventana">
            <CloseIcon size={14} />
          </button>
        </header>

        {isSuccess ? (
          <div className={styles.successOverlay}>
            <div className={styles.successIconCircle}>
              <CheckIcon size={28} />
            </div>
            <h3 className={styles.successTitle}>¡Movimiento Registrado!</h3>
            <p className={styles.successDesc}>
              El saldo del artículo y el libro mayor del Kardex han sido actualizados en tiempo real.
            </p>
          </div>
        ) : (
          <>
            {/* Operation Type Tabs */}
            <div className={styles.tabsContainer}>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "purchase_reception" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("purchase_reception")}
              >
                <span>Entrada / Compra</span>
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "sales_dispatch" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("sales_dispatch")}
              >
                <span>Salida / Venta</span>
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "transfer" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("transfer")}
              >
                <span>Traslado</span>
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "audit_adjustment" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("audit_adjustment")}
              >
                <span>Ajuste Físico</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.formBody}>
              {/* Item Selector */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  <span>{nicheProfile.vocabulary.itemSingular} a Operar</span>
                  {currentItem && (
                    <span className="tabular-nums" style={{ color: "var(--apple-text-tertiary)" }}>
                      Global: {currentItem.totalStock} {currentItem.unitOfMeasure}
                    </span>
                  )}
                </label>
                <select
                  className={styles.selectInput}
                  value={selectedItemId}
                  onChange={(e) => setUserSelectedItemId(e.target.value)}
                  required
                >
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} — {item.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warehouses Selection */}
              {operationType === "transfer" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>
                      <span>Almacén Origen</span>
                      <span className="tabular-nums" style={{ color: "var(--apple-text-tertiary)" }}>
                        {sourceStock} {currentItem?.unitOfMeasure}
                      </span>
                    </label>
                    <select
                      className={styles.selectInput}
                      value={sourceLocationId}
                      onChange={(e) => setSourceLocationId(e.target.value)}
                    >
                      {realWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>
                      <span>Almacén Destino</span>
                      <span className="tabular-nums" style={{ color: "var(--apple-text-tertiary)" }}>
                        {targetStock} {currentItem?.unitOfMeasure}
                      </span>
                    </label>
                    <select
                      className={styles.selectInput}
                      value={targetLocationId}
                      onChange={(e) => setTargetLocationId(e.target.value)}
                    >
                      {realWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : operationType === "sales_dispatch" ? (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    <span>Almacén de Despacho (Origen)</span>
                    <span className="tabular-nums" style={{ color: "var(--apple-text-tertiary)" }}>
                      Disponible: {sourceStock} {currentItem?.unitOfMeasure}
                    </span>
                  </label>
                  <select
                    className={styles.selectInput}
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                  >
                    {realWarehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    <span>Almacén de Recepción / Conteo</span>
                    <span className="tabular-nums" style={{ color: "var(--apple-text-tertiary)" }}>
                      Actual: {targetStock} {currentItem?.unitOfMeasure}
                    </span>
                  </label>
                  <select
                    className={styles.selectInput}
                    value={targetLocationId}
                    onChange={(e) => setTargetLocationId(e.target.value)}
                  >
                    {realWarehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Stepper & Adjustment Sign */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  <span>Cantidad a Mover</span>
                  <span className={styles.unitBadge}>{currentItem?.unitOfMeasure}</span>
                </label>
                <div className={styles.quantityStepperGroup}>
                  {operationType === "audit_adjustment" && (
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      onClick={() => setAdjustmentSign((prev) => (prev === "+" ? "-" : "+"))}
                      title="Alternar suma / resta de ajuste"
                    >
                      {adjustmentSign}
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Restar 1"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    className={styles.quantityInput}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                  />
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Sumar 1"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Balance Preview Card */}
              <div className={styles.balancePreviewCard}>
                <span className={styles.balanceLabel}>Proyección de Saldo:</span>
                <div className={styles.balanceTransitions}>
                  <span className="tabular-nums">{projectedInfo.before} {currentItem?.unitOfMeasure}</span>
                  <span className={styles.balanceArrow}>→</span>
                  <span
                    className="tabular-nums"
                    style={{
                      color: projectedInfo.after >= projectedInfo.before
                        ? "var(--apple-success)"
                        : "var(--apple-warning)",
                    }}
                  >
                    {projectedInfo.after} {currentItem?.unitOfMeasure}
                  </span>
                </div>
              </div>

              {/* Error Warning */}
              {(projectedInfo.error || errorMessage) && (
                <div className={styles.errorBanner}>
                  <AlertIcon size={14} color="var(--apple-danger)" />
                  <span>{projectedInfo.error || errorMessage}</span>
                </div>
              )}

              {/* Document Reference & Operator */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Doc. de Referencia</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={referenceDocument}
                    onChange={(e) => setReferenceDocument(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Responsable</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Notas / Justificación</label>
                <textarea
                  className={styles.textareaInput}
                  placeholder="Detalles adicionales sobre la transacción..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Footer CTA */}
              <footer className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={!projectedInfo.valid}
                >
                  <CheckIcon size={14} />
                  <span>Confirmar Transacción</span>
                </button>
              </footer>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
