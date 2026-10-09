"use client";

import React from "react";
import styles from "@/app/page.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { NicheId } from "@/core/types/niche";
import {
  CatalogIcon,
  WarehouseIcon,
  AlertIcon,
  AnalyticsIcon,
} from "@/components/icons";

export function OverviewContent() {
  const {
    nicheProfile,
    nicheId,
    setNicheId,
    availableNiches,
    activeWarehouse,
  } = useDashboard();

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Banner with Dynamic Niche Context */}
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
            <span style={{ fontSize: "11px", color: "var(--apple-text-tertiary)", textTransform: "uppercase" }}>
              Capacidad Almacén
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

      {/* KPI Cards Grid */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total de {nicheProfile.vocabulary.itemPlural}</span>
            <div className={styles.kpiIconWrapper}>
              <CatalogIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`}>1,420</div>
          <div className={styles.kpiTrend}>
            <span>↑ +12.4%</span>
            <span style={{ color: "var(--apple-text-tertiary)", fontSize: "11px" }}>vs mes anterior</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Valorización de Inventario</span>
            <div className={styles.kpiIconWrapper}>
              <AnalyticsIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`}>$ 1,842,500</div>
          <div className={styles.kpiTrend}>
            <span>↑ +5.8%</span>
            <span style={{ color: "var(--apple-text-tertiary)", fontSize: "11px" }}>margen comercial</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Salud de Abastecimiento</span>
            <div className={styles.kpiIconWrapper}>
              <WarehouseIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`}>94.2%</div>
          <div className={styles.kpiTrend} style={{ color: "var(--apple-success)" }}>
            <span>✓ Cobertura óptima</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Alertas de Reabastecimiento</span>
            <div className={styles.kpiIconWrapper} style={{ color: "var(--apple-danger)" }}>
              <AlertIcon size={16} />
            </div>
          </div>
          <div className={`${styles.kpiValue} tabular-nums`} style={{ color: "var(--apple-danger)" }}>
            5
          </div>
          <div className={styles.kpiTrend} style={{ color: "var(--apple-danger)" }}>
            <span>! Requieren atención</span>
          </div>
        </div>
      </section>

      {/* Interactive Niche Selector Strip for Client Demonstrations */}
      <section className={styles.nicheTabsSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Demostrador de Adaptabilidad Multi-Industria</h2>
            <p className={styles.sectionSubtitle}>
              Selecciona una industria para ver cómo el panel adapta su vocabulario, campos y métricas al instante.
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
    </div>
  );
}
