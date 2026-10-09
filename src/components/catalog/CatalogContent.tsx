"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import styles from "./CatalogContent.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { useInventoryStore } from "@/core/store/inventory-store";
import { InventoryItemCore, StockStatus } from "@/core/types/inventory";
import {
  SearchIcon,
  CloseIcon,
  EyeIcon,
  PlusIcon,
  LayersIcon,
} from "@/components/icons";
import { ItemDetailSheet } from "./ItemDetailSheet";
import { BatchActionBar } from "./BatchActionBar";

type SortOption = "name_asc" | "stock_asc" | "stock_desc" | "valuation_desc";

export function CatalogContent() {
  const { nicheProfile, nicheId, warehouseId, setWarehouseId, warehouses } = useDashboard();
  const { getItemsByNiche, recordMovement } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [inspectedItem, setInspectedItem] = useState<InventoryItemCore | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Base items for active niche and warehouse
  const rawItems = useMemo(
    () => getItemsByNiche(nicheId, warehouseId),
    [getItemsByNiche, nicheId, warehouseId]
  );

  // Categories list with item counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of rawItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rawItems]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return rawItems
      .filter((item) => {
        // 1. Text Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const attrValues = Object.values(item.nicheSpecific || {}).join(" ").toLowerCase();
          const searchContent = `${item.sku} ${item.name} ${item.category} ${item.tags.join(" ")} ${attrValues}`.toLowerCase();
          if (!searchContent.includes(q)) return false;
        }

        // 2. Category Filter
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
          return false;
        }

        // 3. Stock Status Filter
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "stock_asc") return a.totalStock - b.totalStock;
        if (sortBy === "stock_desc") return b.totalStock - a.totalStock;
        if (sortBy === "valuation_desc") return (b.totalStock * b.costPrice) - (a.totalStock * a.costPrice);
        return 0;
      });
  }, [rawItems, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Summary Metrics for the filtered set
  const stats = useMemo(() => {
    const totalSKUs = filteredItems.length;
    const totalUnits = filteredItems.reduce((sum, i) => sum + i.totalStock, 0);
    const totalValuation = filteredItems.reduce((sum, i) => sum + i.totalStock * i.costPrice, 0);
    const criticalCount = filteredItems.filter((i) => i.status === "critical").length;
    return { totalSKUs, totalUnits, totalValuation, criticalCount };
  }, [filteredItems]);

  // Multi-selection handlers
  const handleToggleSelectAll = useCallback(() => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map((i) => i.id)));
    }
  }, [selectedItemIds, filteredItems]);

  const handleToggleItem = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedItemIds(new Set());
  }, []);

  const selectedItemsList = useMemo(() => {
    return rawItems.filter((i) => selectedItemIds.has(i.id));
  }, [rawItems, selectedItemIds]);

  // Inline Quick Reorder
  const handleInlineReorder = useCallback(
    (item: InventoryItemCore, e: React.MouseEvent) => {
      e.stopPropagation();
      const qty = Math.max(10, item.minThreshold * 2);
      const targetLoc = Object.keys(item.stockByLocation)[0] || "wh-main";
      recordMovement({
        itemId: item.id,
        type: "purchase_reception",
        quantity: qty,
        targetLocationId: targetLoc,
        referenceDocument: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        performedBy: "Operador de Catálogo",
        notes: `Reabastecimiento directo desde catálogo (+${qty} ${item.unitOfMeasure})`,
      });
    },
    [recordMovement]
  );

  // Status Badge Map
  const statusConfig: Record<StockStatus, { label: string; color: string; bg: string }> = {
    optimal: { label: "Óptimo", color: "var(--apple-success)", bg: "var(--apple-success-subtle)" },
    low_stock: { label: "Stock Bajo", color: "var(--apple-warning)", bg: "var(--apple-warning-subtle)" },
    critical: { label: "Crítico", color: "var(--apple-danger)", bg: "var(--apple-danger-subtle)" },
    overstock: { label: "Excedente", color: "var(--apple-indigo)", bg: "rgba(88, 86, 214, 0.14)" },
    discontinued: { label: "Descontinuado", color: "var(--apple-text-tertiary)", bg: "var(--apple-bg-secondary)" },
  };

  const isAllSelected = filteredItems.length > 0 && selectedItemIds.size === filteredItems.length;

  return (
    <div className={styles.catalogContainer}>
      {/* 1. Header with Breadcrumbs & Title */}
      <header className={styles.catalogHeader}>
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
            <span>Catálogo Activo</span>
          </div>
          <h1 className={styles.title}>Catálogo de {nicheProfile.vocabulary.itemPlural}</h1>
          <p className={styles.subtitle}>
            Control centralizado de existencias, atributos de nicho y parámetros de reposición.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className={styles.headerStats}>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>Total SKUs</span>
            <span className={`tabular-nums ${styles.statValue}`}>{stats.totalSKUs}</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>Unidades</span>
            <span className={`tabular-nums ${styles.statValue}`}>
              {stats.totalUnits.toLocaleString("es-CO")}
            </span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>Valorización</span>
            <span className={`tabular-nums ${styles.statValue}`}>
              ${stats.totalValuation.toLocaleString("es-CO")}
            </span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>En Alerta</span>
            <span
              className={`tabular-nums ${styles.statValue}`}
              style={{ color: stats.criticalCount > 0 ? "var(--apple-danger)" : "var(--apple-text-primary)" }}
            >
              {stats.criticalCount}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Toolbar & Faceted Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchAndControlsRow}>
          {/* Search Field */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchIconWrapper}>
              <SearchIcon size={16} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder={`Buscar por nombre, SKU, ${nicheProfile.customFields.map((f) => f.label).join(", ")}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon size={14} />
              </button>
            ) : (
              <span className={styles.searchShortcutHint}>/</span>
            )}
          </div>

          {/* Warehouse and Sort Dropdowns */}
          <div className={styles.controlsRight}>
            <select
              className={styles.dropdownSelect}
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              aria-label="Filtrar por almacén"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>

            <select
              className={styles.dropdownSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Criterio de ordenamiento"
            >
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="stock_asc">Existencias (Menor a Mayor)</option>
              <option value="stock_desc">Existencias (Mayor a Menor)</option>
              <option value="valuation_desc">Valoración ($ Mayor)</option>
            </select>
          </div>
        </div>

        {/* Facets: Category Pills + Status Segmented Controls */}
        <div className={styles.facetsRow}>
          {/* Category Pills */}
          <div className={styles.categoryPills}>
            <button
              className={`${styles.pillBtn} ${selectedCategory === "all" ? styles.pillBtnActive : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              <span>Todas</span>
              <span className={styles.pillCount}>({rawItems.length})</span>
            </button>
            {categoriesWithCounts.map(([cat, count]) => (
              <button
                key={cat}
                className={`${styles.pillBtn} ${selectedCategory === cat ? styles.pillBtnActive : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className={styles.pillCount}>({count})</span>
              </button>
            ))}
          </div>

          {/* Status Segmented Control */}
          <div className={styles.statusSegmented}>
            <button
              className={`${styles.segmentBtn} ${selectedStatus === "all" ? styles.segmentBtnActive : ""}`}
              onClick={() => setSelectedStatus("all")}
            >
              Todos
            </button>
            <button
              className={`${styles.segmentBtn} ${selectedStatus === "optimal" ? styles.segmentBtnActive : ""}`}
              onClick={() => setSelectedStatus("optimal")}
            >
              Óptimo
            </button>
            <button
              className={`${styles.segmentBtn} ${selectedStatus === "low_stock" ? styles.segmentBtnActive : ""}`}
              onClick={() => setSelectedStatus("low_stock")}
            >
              Stock Bajo
            </button>
            <button
              className={`${styles.segmentBtn} ${selectedStatus === "critical" ? styles.segmentBtnActive : ""}`}
              onClick={() => setSelectedStatus("critical")}
            >
              Crítico
            </button>
            <button
              className={`${styles.segmentBtn} ${selectedStatus === "overstock" ? styles.segmentBtnActive : ""}`}
              onClick={() => setSelectedStatus("overstock")}
            >
              Excedente
            </button>
          </div>
        </div>
      </div>

      {/* 3. Catalog Data Table */}
      <div className={styles.tableCard}>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <LayersIcon size={36} color="var(--apple-text-tertiary)" />
            <h3 className={styles.emptyTitle}>No se encontraron artículos</h3>
            <p className={styles.emptyDesc}>
              No hay coincidencias con los filtros aplicados. Intenta cambiar los términos de búsqueda o limpiar los filtros.
            </p>
            <button
              className={styles.resetFiltersBtn}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.catalogTable}>
              <thead>
                <tr className={styles.tableHeadRow}>
                  <th className={styles.thCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.customCheckbox}
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Seleccionar todos los artículos"
                    />
                  </th>
                  <th className={styles.th}>{nicheProfile.vocabulary.itemSingular}</th>
                  <th className={styles.th}>Categoría</th>
                  <th className={styles.th}>Atributos ({nicheProfile.name})</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Existencias</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Costo / Precio</th>
                  <th className={styles.th} style={{ textAlign: "center" }}>Estado</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  const status = statusConfig[item.status] || statusConfig.optimal;
                  const maxVal = item.maxCapacity || Math.max(item.totalStock * 1.5, item.minThreshold * 3);
                  const fillPct = Math.min(100, Math.round((item.totalStock / maxVal) * 100));

                  return (
                    <tr
                      key={item.id}
                      className={`${styles.tr} ${isSelected ? styles.trSelected : ""}`}
                      onClick={() => setInspectedItem(item)}
                    >
                      {/* Checkbox */}
                      <td className={styles.tdCheckbox} onClick={(e) => handleToggleItem(item.id, e)}>
                        <input
                          type="checkbox"
                          className={styles.customCheckbox}
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Seleccionar ${item.name}`}
                        />
                      </td>

                      {/* Item Details */}
                      <td className={styles.td}>
                        <div className={styles.itemCell}>
                          <span className={styles.itemName}>{item.name}</span>
                          <div className={styles.itemSub}>
                            <span className={styles.skuChip}>{item.sku}</span>
                            <span>{item.tags.slice(0, 2).join(", ")}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className={styles.td}>
                        <span style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                          {item.category}
                        </span>
                      </td>

                      {/* Dynamic Niche Attributes */}
                      <td className={styles.td}>
                        <div className={styles.nicheChipRow}>
                          {Object.entries(item.nicheSpecific || {})
                            .slice(0, 2)
                            .map(([key, val]) => (
                              <span key={key} className={styles.nicheChip}>
                                {String(val)}
                              </span>
                            ))}
                        </div>
                      </td>

                      {/* Stock Level with Progress Bar */}
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <div className={styles.stockCell}>
                          <div className={styles.stockNumbers}>
                            <span className={`tabular-nums ${styles.itemName}`}>
                              {item.totalStock} {item.unitOfMeasure}
                            </span>
                            <span style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
                              mín. {item.minThreshold}
                            </span>
                          </div>
                          <div className={styles.stockBarTrack}>
                            <div
                              className={styles.stockBarFill}
                              style={{ width: `${fillPct}%`, backgroundColor: status.color }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Valuation */}
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span className="tabular-nums" style={{ fontWeight: 600 }}>
                            ${item.salePrice.toLocaleString("es-CO")}
                          </span>
                          <span className="tabular-nums" style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
                            Costo: ${item.costPrice.toLocaleString("es-CO")}
                          </span>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className={styles.td} style={{ textAlign: "center" }}>
                        <span
                          className={styles.statusBadge}
                          style={{ color: status.color, backgroundColor: status.bg }}
                        >
                          <span className={styles.statusDot} style={{ backgroundColor: status.color }} />
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className={styles.td}>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.reorderBtnInline}
                            onClick={(e) => handleInlineReorder(item, e)}
                            title={`Reordenar ${item.name}`}
                          >
                            <PlusIcon size={12} />
                            <span>Reorden</span>
                          </button>
                          <button
                            className={styles.actionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedItem(item);
                            }}
                            title="Ver detalles completos"
                            aria-label={`Ver detalles de ${item.name}`}
                          >
                            <EyeIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Batch Actions Bar (Floating Capsule) */}
      <BatchActionBar
        selectedItems={selectedItemsList}
        onClearSelection={handleClearSelection}
        nichePluralName={nicheProfile.vocabulary.itemPlural}
      />

      {/* 5. Slide-Over Inspector Sheet */}
      <ItemDetailSheet
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
        nicheProfile={nicheProfile}
      />
    </div>
  );
}
