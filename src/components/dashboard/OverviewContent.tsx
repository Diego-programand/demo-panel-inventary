"use client";

import React, { useMemo } from "react";
import styles from "@/app/page.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { useInventoryStore } from "@/core/store/inventory-store";
import { NicheId } from "@/core/types/niche";
import {
  CatalogIcon,
  WarehouseIcon,
  AlertIcon,
  AnalyticsIcon,
  MovementsIcon,
} from "@/components/icons";
import { TurnoverChart } from "./TurnoverChart";
import { CategoryDistribution } from "./CategoryDistribution";
import { CriticalAlertsWidget } from "./CriticalAlertsWidget";
import { WarehouseCapacityWidget } from "./WarehouseCapacityWidget";

export function OverviewContent() {
  const {
    nicheProfile,
    nicheId,
    setNicheId,
    availableNiches,
    warehouseId,
    activeWarehouse,
  } = useDashboard();

  const { getItemsByNiche, getMetricsByNiche, movements } = useInventoryStore();

  const items = useMemo(
    () => getItemsByNiche(nicheId, warehouseId),
    [getItemsByNiche, nicheId, warehouseId]
  );

  const metrics = useMemo(
    () => getMetricsByNiche(nicheId, warehouseId),
    [getMetricsByNiche, nicheId, warehouseId]
  );

  const recentMovements = useMemo(() => {
    return movements.slice(0, 5);
  }, [movements]);

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. Welcome Banner with Dynamic Niche Context */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <div className={styles.nicheBadge}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: nicheProfile.accentColor,
              }}
            />
            <span>Sector Activo: {nicheProfile.name}</span>
          </div>

          <h1 className={styles.welcomeTitle}>
            Control Operativo de {nicheProfile.vocabulary.itemPlural}
          </h1>
          <p className={styles.welcomeDesc}>{nicheProfile.tagline}</p>
        </div>

        <div className={styles.bannerControls}>
          <div
            style={{
              padding: "10px 16px",
              background: "var(--apple-bg-elevated)",
              border: "1px solid var(--apple-border-subtle)",
              borderRadius: "var(--apple-radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--apple-text-tertiary)",
                textTransform: "uppercase",
              }}
            >
              Ubicación Actual
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="tabular-nums" style={{ fontSize: "18px", fontWeight: 600 }}>
                {activeWarehouse.capacityUtilization}%
              </span>
              <span style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>
                {activeWarehouse.code}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live KPI Cards Grid */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total de {nicheProfile.vocabulary.itemPlural}</span>
            <div className={styles.kpiIconWrapper}>
              <CatalogIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`}>
            {metrics.totalItemsCount.toLocaleString()}
          </div>
          <div className={styles.kpiTrend}>
            <span>↑ En catálogo</span>
            <span style={{ color: "var(--apple-text-tertiary)", fontSize: "11px" }}>
              {warehouseId === "all" ? "todos los centros" : activeWarehouse.code}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Valorización de Inventario</span>
            <div className={styles.kpiIconWrapper}>
              <AnalyticsIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`}>
            $ {metrics.totalValuationRetail.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <div className={styles.kpiTrend}>
            <span>Costo: ${metrics.totalValuationCost.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Salud de Abastecimiento</span>
            <div className={styles.kpiIconWrapper}>
              <WarehouseIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`}>
            {metrics.optimalStockRatio}%
          </div>
          <div className={styles.kpiTrend} style={{ color: "var(--apple-success)" }}>
            <span>✓ {metrics.totalItemsCount - metrics.criticalStockItemsCount} items saludables</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Alertas de Reabastecimiento</span>
            <div className={styles.kpiIconWrapper} style={{ color: "var(--apple-danger)" }}>
              <AlertIcon size={16} />
            </div>
          </div>
          <div
            className={`${styles.kpiValue} tabular-nums`}
            style={{ color: metrics.criticalStockItemsCount > 0 ? "var(--apple-danger)" : "var(--apple-text-primary)" }}
          >
            {metrics.criticalStockItemsCount}
          </div>
          <div
            className={styles.kpiTrend}
            style={{ color: metrics.criticalStockItemsCount > 0 ? "var(--apple-danger)" : "var(--apple-success)" }}
          >
            <span>{metrics.criticalStockItemsCount > 0 ? "! Requieren pedido" : "✓ Al día"}</span>
          </div>
        </div>
      </section>

      {/* 3. Apple-Grade Visualizations Grid: Turnover Chart & Category Donut */}
      <section className={styles.splitSection}>
        <TurnoverChart />
        <CategoryDistribution />
      </section>

      {/* 4. Action & Capacity Section: Alerts & Warehouses */}
      <section className={styles.splitSection}>
        <CriticalAlertsWidget />
        <WarehouseCapacityWidget />
      </section>

      {/* 5. Interactive Niche Selector Strip for Demonstrations */}
      <section className={styles.nicheTabsSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Demostrador de Adaptabilidad Multi-Industria</h2>
            <p className={styles.sectionSubtitle}>
              Selecciona una industria para ver cómo el modelo de datos y el panel adaptan sus atributos en tiempo real.
            </p>
          </div>
        </div>

        <div className={styles.nicheTabsGrid}>
          {availableNiches.map((n) => {
            const isSelected = n.id === nicheId;
            return (
              <div
                key={n.id}
                className={`${styles.nicheTabCard} ${isSelected ? styles.nicheTabActive : ""}`}
                onClick={() => setNicheId(n.id as NicheId)}
              >
                <div className={styles.nicheTabName}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: n.accentColor,
                      }}
                    />
                    <span>{n.name}</span>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: "11px", color: "var(--apple-accent)", fontWeight: 700 }}>
                      ACTIVO
                    </span>
                  )}
                </div>

                <p className={styles.nicheTabDesc}>{n.tagline}</p>

                <div className={styles.customFieldsList}>
                  {n.customFields.map((f) => (
                    <span key={f.key} className={styles.customFieldTag}>
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Live Table Preview & Kardex Activity Split */}
      <section className={styles.splitSection}>
        {/* Table Preview */}
        <div className={styles.tableCard}>
          <div className={styles.sectionHeaderRow} style={{ marginBottom: 0 }}>
            <div>
              <h3 className={styles.sectionTitle}>
                Existencias de {nicheProfile.vocabulary.itemPlural}
              </h3>
              <p className={styles.sectionSubtitle}>
                Mostrando {items.length} artículos en {warehouseId === "all" ? "todos los almacenes" : activeWarehouse.name}
              </p>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.appleTable}>
              <thead>
                <tr>
                  <th>Artículo / SKU</th>
                  <th>Categoría</th>
                  {nicheProfile.customFields.slice(0, 2).map((cf) => (
                    <th key={cf.key}>{cf.label}</th>
                  ))}
                  <th>Stock Total</th>
                  <th>Precio Venta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const effectiveStock =
                    warehouseId !== "all"
                      ? item.stockByLocation[warehouseId] || 0
                      : item.totalStock;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div className={styles.itemSku}>{item.sku}</div>
                      </td>
                      <td>
                        <span style={{ color: "var(--apple-text-secondary)" }}>
                          {item.category}
                        </span>
                      </td>
                      {nicheProfile.customFields.slice(0, 2).map((cf) => {
                        const val = item.nicheSpecific[cf.key];
                        return (
                          <td key={cf.key}>
                            <span style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>
                              {typeof val === "boolean"
                                ? val ? "Sí" : "No"
                                : val !== undefined && val !== null ? String(val) : "—"}
                            </span>
                          </td>
                        );
                      })}
                      <td>
                        <span className="tabular-nums" style={{ fontWeight: 600 }}>
                          {effectiveStock} {item.unitOfMeasure}
                        </span>
                      </td>
                      <td>
                        <span className="tabular-nums">
                          ${item.salePrice.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            item.status === "optimal"
                              ? styles.statusOptimal
                              : item.status === "low_stock"
                              ? styles.statusLowStock
                              : styles.statusCritical
                          }`}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              backgroundColor: "currentColor",
                            }}
                          />
                          {item.status === "optimal"
                            ? "Óptimo"
                            : item.status === "low_stock"
                            ? "Stock Bajo"
                            : "Crítico"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kardex Activity Feed */}
        <div className={styles.tableCard}>
          <div className={styles.sectionHeaderRow} style={{ marginBottom: 0 }}>
            <div>
              <h3 className={styles.sectionTitle}>Auditoría de Kardex</h3>
              <p className={styles.sectionSubtitle}>Últimos movimientos registrados</p>
            </div>
          </div>

          <div className={styles.kardexList}>
            {recentMovements.map((mov) => {
              const isEntry = mov.type === "purchase_reception" || mov.type === "transfer_in";
              const isLoss = mov.type === "adjustment_loss";

              return (
                <div key={mov.id} className={styles.kardexItem}>
                  <div
                    className={styles.kardexIconWrapper}
                    style={{
                      backgroundColor: isEntry
                        ? "var(--apple-success-subtle)"
                        : isLoss
                        ? "var(--apple-danger-subtle)"
                        : "var(--apple-accent-subtle)",
                      color: isEntry
                        ? "var(--apple-success)"
                        : isLoss
                        ? "var(--apple-danger)"
                        : "var(--apple-accent)",
                    }}
                  >
                    <MovementsIcon size={14} />
                  </div>

                  <div className={styles.kardexDetails}>
                    <div className={styles.kardexTitle}>{mov.itemName}</div>
                    <div className={styles.kardexMeta}>
                      <span>{mov.referenceDocument}</span>
                      <span>•</span>
                      <span>{new Date(mov.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <div
                    className={`${styles.kardexQty} tabular-nums`}
                    style={{
                      color: isEntry
                        ? "var(--apple-success)"
                        : isLoss
                        ? "var(--apple-danger)"
                        : "var(--apple-text-primary)",
                    }}
                  >
                    {isEntry ? `+${mov.quantity}` : `-${mov.quantity}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
