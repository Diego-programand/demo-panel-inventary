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

type SimpleOperationType = "purchase_reception" | "sales_dispatch" | "transfer";

export function MovementModal({ isOpen, onClose, preselectedItemId }: MovementModalProps) {
  const { nicheId, warehouses } = useDashboard();
  const { getItemsByNiche, recordMovement } = useInventoryStore();

  const realWarehouses = useMemo(
    () => warehouses.filter((w) => w.id !== "all"),
    [warehouses]
  );

  const availableItems = useMemo(
    () => getItemsByNiche(nicheId),
    [getItemsByNiche, nicheId]
  );

  const [operationType, setOperationType] = useState<SimpleOperationType>("purchase_reception");
  const [userSelectedItemId, setUserSelectedItemId] = useState<string>("");
  const selectedItemId = userSelectedItemId || preselectedItemId || availableItems[0]?.id || "";
  const [sourceLocationId, setSourceLocationId] = useState<string>("wh-main");
  const [targetLocationId, setTargetLocationId] = useState<string>("wh-north");
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceDocument, setReferenceDocument] = useState<string>("Entrada #104");
  const [performedBy, setPerformedBy] = useState<string>("Administrador");
  const [notes, setNotes] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleTabChange = useCallback((type: SimpleOperationType) => {
    setOperationType(type);
    const randomNum = Math.floor(100 + Math.random() * 900);
    if (type === "purchase_reception") {
      setReferenceDocument(`Entrada #${randomNum}`);
    } else if (type === "sales_dispatch") {
      setReferenceDocument(`Venta #${randomNum}`);
    } else {
      setReferenceDocument(`Traslado #${randomNum}`);
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
      const error = quantity > before ? `Stock insuficiente (disponible: ${before} ${currentItem.unitOfMeasure})` : "";
      return { before, after, valid, error };
    }

    if (operationType === "transfer") {
      const isSameWarehouse = sourceLocationId === targetLocationId;
      const hasEnoughStock = quantity > 0 && quantity <= sourceStock;
      let error = "";
      if (isSameWarehouse) error = "La sede de destino debe ser diferente a la de origen";
      else if (!hasEnoughStock) error = `Stock insuficiente en origen (disponible: ${sourceStock} ${currentItem.unitOfMeasure})`;

      return {
        before: sourceStock,
        after: sourceStock - quantity,
        valid: !isSameWarehouse && hasEnoughStock,
        error,
      };
    }

    return { before: 0, after: 0, valid: true, error: "" };
  }, [currentItem, operationType, quantity, sourceLocationId, sourceStock, targetLocationId, targetStock]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage("");

      if (!currentItem) {
        setErrorMessage("Por favor selecciona un artículo.");
        return;
      }

      if (quantity <= 0) {
        setErrorMessage("La cantidad debe ser mayor a 0.");
        return;
      }

      let type: MovementType = "purchase_reception";
      let srcLoc: string | undefined = undefined;
      let tgtLoc: string | undefined = undefined;

      if (operationType === "purchase_reception") {
        type = "purchase_reception";
        tgtLoc = targetLocationId;
      } else if (operationType === "sales_dispatch") {
        type = "sales_dispatch";
        srcLoc = sourceLocationId;
      } else if (operationType === "transfer") {
        type = "transfer_out";
        srcLoc = sourceLocationId;
        tgtLoc = targetLocationId;
      }

      const result = recordMovement({
        itemId: currentItem.id,
        type,
        quantity,
        sourceLocationId: srcLoc,
        targetLocationId: tgtLoc,
        referenceDocument: referenceDocument.trim() || `${operationType === "purchase_reception" ? "Entrada" : operationType === "sales_dispatch" ? "Venta" : "Traslado"} #${Math.floor(100 + Math.random() * 900)}`,
        performedBy: performedBy.trim() || "Administrador",
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Ocurrió un error al registrar el movimiento.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    },
    [
      currentItem,
      quantity,
      operationType,
      targetLocationId,
      sourceLocationId,
      recordMovement,
      referenceDocument,
      performedBy,
      notes,
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
            <h2 className={styles.modalTitle}>Registrar Movimiento</h2>
            <p className={styles.modalSubtitle}>Actualiza las existencias de tu inventario al instante</p>
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
              El inventario se ha actualizado en tiempo real.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Essential Segmented Action Selector */}
            <div className={styles.tabsContainer}>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "purchase_reception" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("purchase_reception")}
              >
                <span>+ Entrada de Stock</span>
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "sales_dispatch" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("sales_dispatch")}
              >
                <span>- Salida / Venta</span>
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${operationType === "transfer" ? styles.tabBtnActive : ""}`}
                onClick={() => handleTabChange("transfer")}
              >
                <span>⇄ Traslado</span>
              </button>
            </div>

            {/* 2. Form Body */}
            <form onSubmit={handleSubmit} className={styles.formBody}>
              {/* Product Selector */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  <span>Producto</span>
                  {currentItem && (
                    <span className="tabular-nums" style={{ color: "var(--apple-text-secondary)", fontWeight: 500 }}>
                      Total disponible: {currentItem.totalStock} {currentItem.unitOfMeasure}
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
                      {item.name} ({item.sku}) — {item.totalStock} {item.unitOfMeasure}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Selectors */}
              {operationType === "transfer" ? (
                <div className={styles.twoColumnGrid}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>
                      <span>Desde (Origen)</span>
                      <span className="tabular-nums" style={{ color: "var(--apple-text-secondary)" }}>
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
                      <span>Hacia (Destino)</span>
                      <span className="tabular-nums" style={{ color: "var(--apple-text-secondary)" }}>
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
                    <span>Sede de Despacho (Salida)</span>
                    <span className="tabular-nums" style={{ color: "var(--apple-text-secondary)" }}>
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
                        {wh.name} ({wh.code}) — {currentItem?.stockByLocation[wh.id] || 0} {currentItem?.unitOfMeasure}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    <span>Sede de Recepción (Destino)</span>
                    <span className="tabular-nums" style={{ color: "var(--apple-text-secondary)" }}>
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

              {/* Quantity Stepper */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  <span>Cantidad de Unidades</span>
                  <span className={styles.unitBadge}>{currentItem?.unitOfMeasure}</span>
                </label>
                <div className={styles.quantityStepperGroup}>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Restar 1"
                  >
                    −
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

              {/* Clean Balance Preview */}
              <div className={styles.balancePreviewCard}>
                <span className={styles.balanceLabel}>
                  {operationType === "purchase_reception"
                    ? "Stock resultante en destino:"
                    : operationType === "sales_dispatch"
                    ? "Stock restante en origen:"
                    : "Stock resultante en origen:"}
                </span>
                <div className={styles.balanceTransitions}>
                  <span className="tabular-nums">{projectedInfo.before} {currentItem?.unitOfMeasure}</span>
                  <span className={styles.balanceArrow}>→</span>
                  <span
                    className="tabular-nums"
                    style={{
                      fontWeight: 600,
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
                  <AlertIcon size={15} color="var(--apple-danger)" />
                  <span>{projectedInfo.error || errorMessage}</span>
                </div>
              )}

              {/* Progressive Disclosure: Collapsible Advanced Fields */}
              <div className={styles.advancedToggleSection}>
                <button
                  type="button"
                  className={styles.advancedToggleBtn}
                  onClick={() => setShowAdvanced((prev) => !prev)}
                >
                  <span>{showAdvanced ? "▾ Ocultar datos adicionales" : "▸ Opciones adicionales (documento, nota)"}</span>
                </button>

                {showAdvanced && (
                  <div className={styles.advancedFieldsContainer}>
                    <div className={styles.twoColumnGrid}>
                      <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Documento</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={referenceDocument}
                          onChange={(e) => setReferenceDocument(e.target.value)}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Responsable</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={performedBy}
                          onChange={(e) => setPerformedBy(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.fieldLabel}>Nota o Justificación</label>
                      <textarea
                        className={styles.textareaInput}
                        placeholder="Detalle opcional sobre este movimiento..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
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
                  <CheckIcon size={15} />
                  <span>
                    {operationType === "purchase_reception"
                      ? "Guardar Entrada"
                      : operationType === "sales_dispatch"
                      ? "Guardar Salida"
                      : "Guardar Traslado"}
                  </span>
                </button>
              </footer>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
