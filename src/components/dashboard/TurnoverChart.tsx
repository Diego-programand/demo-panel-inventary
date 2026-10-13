"use client";

import React, { useState, useMemo } from "react";
import styles from "./TurnoverChart.module.css";
import { useDashboard } from "@/core/context/DashboardContext";

interface DataPoint {
  month: string;
  entries: number;
  exits: number;
}

const MONTHLY_DATA_6M: DataPoint[] = [
  { month: "May", entries: 420, exits: 380 },
  { month: "Jun", entries: 510, exits: 460 },
  { month: "Jul", entries: 630, exits: 590 },
  { month: "Ago", entries: 480, exits: 520 },
  { month: "Sep", entries: 710, exits: 640 },
  { month: "Oct", entries: 850, exits: 720 },
];

const MONTHLY_DATA_12M: DataPoint[] = [
  { month: "Nov", entries: 380, exits: 340 },
  { month: "Dic", entries: 890, exits: 810 },
  { month: "Ene", entries: 410, exits: 390 },
  { month: "Feb", entries: 450, exits: 420 },
  { month: "Mar", entries: 520, exits: 490 },
  { month: "Abr", entries: 470, exits: 440 },
  ...MONTHLY_DATA_6M,
];

export function TurnoverChart() {
  const { nicheProfile } = useDashboard();
  const [timeframe, setTimeframe] = useState<"6m" | "12m">("6m");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(
    () => (timeframe === "6m" ? MONTHLY_DATA_6M : MONTHLY_DATA_12M),
    [timeframe]
  );

  // Chart Dimensions & Scales
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;

  const maxVal = useMemo(
    () => Math.max(...data.map((d) => Math.max(d.entries, d.exits))) * 1.15,
    [data]
  );

  // Generate SVG path for entries (blue curve)
  const entriesPoints = useMemo(() => {
    return data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - (d.entries / maxVal) * (height - paddingY * 2);
      return { x, y, data: d };
    });
  }, [data, maxVal]);

  // Generate SVG path for exits (secondary curve)
  const exitsPoints = useMemo(() => {
    return data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - (d.exits / maxVal) * (height - paddingY * 2);
      return { x, y, data: d };
    });
  }, [data, maxVal]);

  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const entriesPath = useMemo(() => generateSmoothPath(entriesPoints), [entriesPoints]);
  const exitsPath = useMemo(() => generateSmoothPath(exitsPoints), [exitsPoints]);

  const areaGradientPath = useMemo(() => {
    if (entriesPoints.length === 0) return "";
    const first = entriesPoints[0];
    const last = entriesPoints[entriesPoints.length - 1];
    return `${entriesPath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
  }, [entriesPath, entriesPoints]);

  return (
    <div className={styles.chartCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h3 className={styles.title}>Entradas vs Salidas</h3>
          <p className={styles.subtitle}>
            Comparativa mensual de compras y ventas de {nicheProfile.vocabulary.itemPlural.toLowerCase()}
          </p>
        </div>

        <div className={styles.timeframeSelector}>
          <button
            className={`${styles.timeframeButton} ${timeframe === "6m" ? styles.timeframeActive : ""}`}
            onClick={() => setTimeframe("6m")}
            type="button"
          >
            6 Meses
          </button>
          <button
            className={`${styles.timeframeButton} ${timeframe === "12m" ? styles.timeframeActive : ""}`}
            onClick={() => setTimeframe("12m")}
            type="button"
          >
            1 Año
          </button>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <svg viewBox={`0 0 ${width} ${height}`} className={styles.svgCanvas}>
          <defs>
            <linearGradient id="appleChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--apple-accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--apple-accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Gradient fill */}
          <path d={areaGradientPath} fill="url(#appleChartGradient)" />

          {/* Lines */}
          <path
            d={entriesPath}
            fill="none"
            stroke="var(--apple-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={exitsPath}
            fill="none"
            stroke="var(--apple-text-tertiary)"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {entriesPoints.map((pt, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Invisible touch area */}
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 5 : 3.5}
                fill="var(--apple-bg-base)"
                stroke="var(--apple-accent)"
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                fontSize="11"
                fill={hoveredIndex === idx ? "var(--apple-text-primary)" : "var(--apple-text-tertiary)"}
                fontWeight={hoveredIndex === idx ? "600" : "400"}
              >
                {pt.data.month}
              </text>
            </g>
          ))}

          {/* Tooltip Overlay */}
          {hoveredIndex !== null && (
            <g
              transform={`translate(${entriesPoints[hoveredIndex].x}, ${Math.max(
                20,
                entriesPoints[hoveredIndex].y - 35
              )})`}
            >
              <rect
                x="-45"
                y="-18"
                width="90"
                height="28"
                rx="6"
                fill="var(--apple-bg-elevated)"
                stroke="var(--apple-border-medium)"
                strokeWidth="1"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
              />
              <text
                x="0"
                y="-1"
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--apple-text-primary)"
              >
                +{data[hoveredIndex].entries} / -{data[hoveredIndex].exits}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className={styles.legendRow}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "var(--apple-accent)" }} />
          <span>Ingresos / Compras</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: "var(--apple-text-tertiary)" }} />
          <span>Salidas / Ventas</span>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
          Ratio Rotación: <strong style={{ color: "var(--apple-text-primary)" }}>4.6x</strong>
        </div>
      </div>
    </div>
  );
}
