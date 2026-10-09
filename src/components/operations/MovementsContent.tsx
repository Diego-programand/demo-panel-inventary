"use client";

import React, { useState, useMemo, useCallback } from "react";
import styles from "./MovementsContent.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { useInventoryStore } from "@/core/store/inventory-store";
import { MovementType } from "@/core/types/inventory";
import {
  SearchIcon,
  CloseIcon,
  PlusIcon,
  ExportIcon,
  MovementsIcon,
} from "@/components/icons";
import { MovementModal } from "./MovementModal";

type MovementCategoryFilter = "all" | "purchases" | "sales" | "transfers" | "adjustments";

const TYPE_CONFIG: Record<
  MovementType,
  { label: string; color: string; bg: string; sign: "+" | "-" }
> = {
  purchase_reception: {
    label: "Entrada / Compra",
    color: "var(--apple-success)",
    bg: "var(--apple-success-subtle)",
    sign: "+",
  },
  sales_dispatch: {
    label: "Salida / Venta",
    color: "var(--apple-warning)",
    bg: "var(--apple-warning-subtle)",
    sign: "-",
  },
  transfer_out: {
    label: "Traslado Enviado",
    color: "var(--apple-indigo)",
    bg: "rgba(88, 86, 214, 0.14)",
    sign: "-",
  },
  transfer_in: {
    label: "Traslado Recibido",
    color: "var(--apple-indigo)",
    bg: "rgba(88, 86, 214, 0.14)",
    sign: "+",
  },
  audit_adjustment: {
    label: "Ajuste Conteo",
    color: "var(--apple-accent)",
    bg: "var(--apple-accent-subtle)",
    sign: "+",
  },
  adjustment_loss: {
    label: "Merma / Pérdida",
    color: "var(--apple-danger)",
    bg: "var(--apple-danger-subtle)",
    sign: "-",
  },
};

export function MovementsContent() {
  const { nicheProfile, warehouses } = useDashboard();
  const { movements, getItemById } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MovementCategoryFilter>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchContent = `${m.itemSku} ${m.itemName} ${m.referenceDocument || ""} ${m.performedBy} ${m.notes || ""}`.toLowerCase();
        if (!searchContent.includes(q)) return false;
      }

      // 2. Type Filter
      if (selectedCategory === "purchases" && m.type !== "purchase_reception") return false;
      if (selectedCategory === "sales" && m.type !== "sales_dispatch") return false;
      if (selectedCategory === "transfers" && m.type !== "transfer_in" && m.type !== "transfer_out") return false;
      if (selectedCategory === "adjustments" && m.type !== "audit_adjustment" && m.type !== "adjustment_loss") return false;

      // 3. Warehouse Filter
      if (selectedWarehouse !== "all") {
        if (m.sourceLocationId !== selectedWarehouse && m.targetLocationId !== selectedWarehouse) {
          return false;
        }
      }

      return true;
    });
  }, [movements, searchQuery, selectedCategory, selectedWarehouse]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = movements.length;
    const purchases = movements.filter((m) => m.type === "purchase_reception").length;
    const sales = movements.filter((m) => m.type === "sales_dispatch").length;
    const transfers = movements.filter((m) => m.type === "transfer_in" || m.type === "transfer_out").length;
    return { total, purchases, sales, transfers };
  }, [movements]);

  // Export to CSV
  const handleExportKardexCSV = useCallback(() => {
    if (filteredMovements.length === 0) return;

    const headers = [
      "Fecha",
      "Documento",
      "Tipo Movimiento",
      "SKU",
      "Artículo",
      "Almacén Origen",
      "Almacén Destino",
      "Cantidad",
      "Responsable",
      "Notas",
    ];

    const rows = filteredMovements.map((m) => {
      const orig = warehouses.find((w) => w.id === m.sourceLocationId)?.name || m.sourceLocationId || "-";
      const dest = warehouses.find((w) => w.id === m.targetLocationId)?.name || m.targetLocationId || "-";
      const typeLabel = TYPE_CONFIG[m.type]?.label || m.type;

      return [
        `"${m.timestamp}"`,
        `"${m.referenceDocument || m.id}"`,
        `"${typeLabel}"`,
        `"${m.itemSku}"`,
        `"${m.itemName.replace(/"/g, '""')}"`,
        `"${orig}"`,
        `"${dest}"`,
        m.quantity,
        `"${m.performedBy}"`,
        `"${(m.notes || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kardex_${nicheProfile.name.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredMovements, warehouses, nicheProfile.name]);

  return (
    <div className={styles.kardexContainer}>
      {/* 1. Header with Breadcrumbs & Actions */}
      <header className={styles.kardexHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.nicheBreadcrumb}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: nicheProfile.accentColor,
              }}
            />
            <span>Sector: {nicheProfile.name}</span>
            <span>/</span>
            <span>Kardex Central</span>
          </div>
          <h1 className={styles.title}>Libro Mayor de Movimientos & Kardex</h1>
          <p className={styles.subtitle}>
            Auditoría inmutable de todas las recepciones, salidas, transferencias y ajustes de inventario.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.exportBtn}
            onClick={handleExportKardexCSV}
            title="Exportar libro Kardex a formato CSV"
          >
            <ExportIcon size={14} />
            <span>Exportar Libro Kardex</span>
          </button>

          <button
            className={styles.newMovementBtn}
            onClick={() => setIsModalOpen(true)}
            title="Registrar una nueva transacción"
          >
            <PlusIcon size={15} />
            <span>+ Nuevo Movimiento</span>
          </button>
        </div>
      </header>

      {/* 2. Quick Metrics Row */}
      <div className={styles.headerStats}>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Total Transacciones</span>
          <span className={`tabular-nums ${styles.statValue}`}>{stats.total}</span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Entradas / Compras</span>
          <span className={`tabular-nums ${styles.statValue}`} style={{ color: "var(--apple-success)" }}>
            {stats.purchases}
          </span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Salidas / Ventas</span>
          <span className={`tabular-nums ${styles.statValue}`} style={{ color: "var(--apple-warning)" }}>
            {stats.sales}
          </span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Traslados & Ajustes</span>
          <span className={`tabular-nums ${styles.statValue}`} style={{ color: "var(--apple-indigo)" }}>
            {stats.transfers}
          </span>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchAndControlsRow}>
          {/* Search Field */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchIconWrapper}>
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por SKU, documento, artículo, operador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* Warehouse Selector */}
          <select
            style={{
              padding: "8px 14px",
              fontSize: "13px",
              borderRadius: "var(--apple-radius-md)",
              border: "1px solid var(--apple-border-subtle)",
              background: "var(--apple-bg-elevated)",
              color: "var(--apple-text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
          >
            <option value="all">Todos los Almacenes</option>
            {warehouses.filter((w) => w.id !== "all").map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter Pills */}
        <div className={styles.typePills}>
          <button
            className={`${styles.pillBtn} ${selectedCategory === "all" ? styles.pillBtnActive : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            <span>Todos los Tipos</span>
            <span style={{ fontSize: "11px", opacity: 0.8 }}>({movements.length})</span>
          </button>
          <button
            className={`${styles.pillBtn} ${selectedCategory === "purchases" ? styles.pillBtnActive : ""}`}
            onClick={() => setSelectedCategory("purchases")}
          >
            <span>Entradas / Compras</span>
          </button>
          <button
            className={`${styles.pillBtn} ${selectedCategory === "sales" ? styles.pillBtnActive : ""}`}
            onClick={() => setSelectedCategory("sales")}
          >
            <span>Salidas / Ventas</span>
          </button>
          <button
            className={`${styles.pillBtn} ${selectedCategory === "transfers" ? styles.pillBtnActive : ""}`}
            onClick={() => setSelectedCategory("transfers")}
          >
            <span>Traslados Inter-Almacén</span>
          </button>
          <button
            className={`${styles.pillBtn} ${selectedCategory === "adjustments" ? styles.pillBtnActive : ""}`}
            onClick={() => setSelectedCategory("adjustments")}
          >
            <span>Ajustes & Mermas</span>
          </button>
        </div>
      </div>

      {/* 4. Kardex Table */}
      <div className={styles.tableCard}>
        {filteredMovements.length === 0 ? (
          <div className={styles.emptyState}>
            <MovementsIcon size={36} color="var(--apple-text-tertiary)" />
            <h3 className={styles.emptyTitle}>Sin movimientos encontrados</h3>
            <p className={styles.emptyDesc}>
              No hay transacciones registradas con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.kardexTable}>
              <thead>
                <tr className={styles.tableHeadRow}>
                  <th className={styles.th}>Hora / Fecha</th>
                  <th className={styles.th}>Tipo de Operación</th>
                  <th className={styles.th}>Artículo & SKU</th>
                  <th className={styles.th}>Documento</th>
                  <th className={styles.th}>Ubicación</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Cantidad</th>
                  <th className={styles.th}>Responsable</th>
                  <th className={styles.th}>Notas</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((mov) => {
                  const cfg = TYPE_CONFIG[mov.type] || TYPE_CONFIG.purchase_reception;
                  const item = getItemById(mov.itemId);
                  const unit = item?.unitOfMeasure || "ud";

                  const timeStr = mov.timestamp.includes("T")
                    ? mov.timestamp.split("T")[1].slice(0, 5)
                    : "12:00";

                  const dateStr = mov.timestamp.includes("T")
                    ? mov.timestamp.split("T")[0]
                    : "Hoy";

                  const origWh = warehouses.find((w) => w.id === mov.sourceLocationId);
                  const destWh = warehouses.find((w) => w.id === mov.targetLocationId);

                  return (
                    <tr key={mov.id} className={styles.tr}>
                      {/* Timestamp */}
                      <td className={styles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span className="tabular-nums" style={{ fontWeight: 600 }}>
                            {timeStr}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
                            {dateStr}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className={styles.td}>
                        <span
                          className={styles.typeBadge}
                          style={{ color: cfg.color, backgroundColor: cfg.bg }}
                        >
                          <span className={styles.typeDot} style={{ backgroundColor: cfg.color }} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* Item & SKU */}
                      <td className={styles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 600 }}>{mov.itemName}</span>
                          <span style={{ fontFamily: "var(--apple-font-mono, monospace)", fontSize: "11.5px", color: "var(--apple-text-tertiary)" }}>
                            {mov.itemSku}
                          </span>
                        </div>
                      </td>

                      {/* Document Code */}
                      <td className={styles.td}>
                        <span className={styles.docCode}>{mov.referenceDocument || mov.id}</span>
                      </td>

                      {/* Location details */}
                      <td className={styles.td}>
                        {mov.type === "transfer_out" || mov.type === "transfer_in" ? (
                          <span className={styles.locationChip}>
                            {origWh?.code || "ORIG"} → {destWh?.code || "DEST"}
                          </span>
                        ) : mov.type === "sales_dispatch" ? (
                          <span className={styles.locationChip}>
                            Desde: {origWh?.code || "WH"}
                          </span>
                        ) : (
                          <span className={styles.locationChip}>
                            Hacia: {destWh?.code || "WH"}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <span className={`tabular-nums ${styles.qtyCell}`} style={{ color: cfg.color }}>
                          {cfg.sign}{mov.quantity} {unit}
                        </span>
                      </td>

                      {/* Performed By */}
                      <td className={styles.td}>
                        <span style={{ fontSize: "12.5px", color: "var(--apple-text-secondary)" }}>
                          {mov.performedBy}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className={styles.td}>
                        <span className={styles.notesText} title={mov.notes}>
                          {mov.notes || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movement Modal */}
      <MovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
