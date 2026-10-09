"use client";

import React from "react";
import styles from "./WarehouseCapacityWidget.module.css";
import { useDashboard } from "@/core/context/DashboardContext";

export function WarehouseCapacityWidget() {
  const { warehouses, warehouseId, setWarehouseId, nicheProfile } = useDashboard();

  // Filter out the 'all' virtual warehouse
  const physicalWarehouses = warehouses.filter((w) => w.id !== "all");

  return (
    <div className={styles.capacityCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h3 className={styles.title}>
            Ocupación y Capacidad de {nicheProfile.vocabulary.locationLabel}
          </h3>
          <p className={styles.subtitle}>
            Monitoreo de densidad de almacenamiento por centro logístico
          </p>
        </div>
      </div>

      <div className={styles.warehousesGrid}>
        {physicalWarehouses.map((wh) => {
          const isSelected = wh.id === warehouseId;
          const isHigh = wh.capacityUtilization >= 85;
          const isModerate = wh.capacityUtilization >= 60;
          const barColor = isHigh
            ? "var(--apple-warning)"
            : isModerate
            ? "var(--apple-accent)"
            : "var(--apple-success)";

          return (
            <div
              key={wh.id}
              className={`${styles.warehouseCard} ${isSelected ? styles.warehouseActive : ""}`}
              onClick={() => setWarehouseId(wh.id)}
            >
              <div className={styles.warehouseHeader}>
                <span className={styles.warehouseName}>{wh.name}</span>
                <span className={styles.warehouseCode}>{wh.code}</span>
              </div>

              <div className={styles.occupancyArea}>
                <div className={styles.occupancyLabel}>
                  <span>{wh.city}</span>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>
                    {wh.capacityUtilization}%
                  </span>
                </div>
                <div className={styles.occupancyTrack}>
                  <div
                    className={styles.occupancyBar}
                    style={{
                      width: `${wh.capacityUtilization}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>

              <div className={styles.zonesCount}>
                {wh.zones.length > 0
                  ? `${wh.zones.length} zonas activas (${wh.zones[0]})`
                  : "Zona de reserva central"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
