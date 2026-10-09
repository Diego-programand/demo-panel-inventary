"use client";

import React, { useMemo } from "react";
import styles from "./CategoryDistribution.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { useInventoryStore } from "@/core/store/inventory-store";

const CATEGORY_COLORS = [
  "var(--apple-accent)",
  "var(--apple-indigo)",
  "var(--apple-teal)",
  "var(--apple-purple)",
  "var(--apple-warning)",
];

export function CategoryDistribution() {
  const { nicheId, warehouseId, nicheProfile } = useDashboard();
  const { getItemsByNiche } = useInventoryStore();

  const items = useMemo(
    () => getItemsByNiche(nicheId, warehouseId),
    [getItemsByNiche, nicheId, warehouseId]
  );

  const distribution = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const item of items) {
      catMap[item.category] = (catMap[item.category] || 0) + item.totalStock;
    }

    const totalStockSum = Object.values(catMap).reduce((a, b) => a + b, 0);

    const sorted = Object.entries(catMap)
      .map(([name, stock], idx) => ({
        name,
        stock,
        percentage: totalStockSum > 0 ? Math.round((stock / totalStockSum) * 100) : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.stock - a.stock);

    return { categories: sorted, totalStockSum };
  }, [items]);

  // Donut SVG parameters
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDashoffset for each segment purely and immutably
  const segments = useMemo(() => {
    return distribution.categories.map((c, index) => {
      const strokeDasharray = `${(c.percentage / 100) * circumference} ${circumference}`;
      const previousOffset = distribution.categories
        .slice(0, index)
        .reduce((acc, cat) => acc + (cat.percentage / 100) * circumference, 0);

      return {
        ...c,
        strokeDasharray,
        strokeDashoffset: -previousOffset,
      };
    });
  }, [distribution, circumference]);

  return (
    <div className={styles.distributionCard}>
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.title}>Distribución por Categorías</h3>
          <p className={styles.subtitle}>
            Composición de existencias en {nicheProfile.name}
          </p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* SVG Donut */}
        <div className={styles.donutWrapper}>
          <svg viewBox="0 0 140 140" className={styles.donutSvg}>
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="var(--apple-bg-secondary)"
              strokeWidth="14"
            />
            {/* Category segments */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
              />
            ))}
          </svg>

          <div className={styles.centerLabel}>
            <span className={`${styles.centerCount} tabular-nums`}>
              {distribution.totalStockSum}
            </span>
            <span className={styles.centerSubtext}>
              {nicheProfile.vocabulary.unitDefault}s
            </span>
          </div>
        </div>

        {/* Legend & Progress Bars */}
        <div className={styles.categoriesList}>
          {distribution.categories.map((cat, idx) => (
            <div key={idx} className={styles.categoryRow}>
              <div className={styles.categoryMeta}>
                <span className={styles.categoryName}>
                  <span className={styles.categoryDot} style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </span>
                <span className={`${styles.categoryPercent} tabular-nums`}>
                  {cat.percentage}% ({cat.stock})
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
