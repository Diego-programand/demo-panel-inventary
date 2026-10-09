"use client";

import React from "react";
import { useDashboard } from "@/core/context/DashboardContext";
import { OverviewContent } from "@/components/dashboard/OverviewContent";
import { CatalogContent } from "@/components/catalog/CatalogContent";
import { MovementsContent } from "@/components/operations/MovementsContent";

export function MainSectionRouter() {
  const { section, nicheProfile, setSection } = useDashboard();

  switch (section) {
    case "catalog":
      return <CatalogContent />;

    case "overview":
      return <OverviewContent />;

    case "movements":
      return <MovementsContent />;

    case "warehouses":
    case "alerts":
    case "analytics":
    default:
      return (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "50%",
              background: "var(--apple-bg-surface)",
              border: "1px solid var(--apple-border-subtle)",
            }}
          >
            <span style={{ fontSize: "28px" }}>⚙️</span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--apple-text-primary)", margin: 0 }}>
            Sección en Preparación
          </h2>
          <p style={{ fontSize: "14px", color: "var(--apple-text-secondary)", maxWidth: "420px", margin: 0 }}>
            El módulo de {section.toUpperCase()} para {nicheProfile.name} se incorporará en las siguientes fases del plan de ejecución.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button
              onClick={() => setSection("overview")}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--apple-radius-pill)",
                border: "1px solid var(--apple-border-subtle)",
                background: "var(--apple-bg-elevated)",
                color: "var(--apple-text-primary)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Volver al Resumen
            </button>
            <button
              onClick={() => setSection("catalog")}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--apple-radius-pill)",
                border: "none",
                background: "var(--apple-accent)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Explorar Catálogo
            </button>
          </div>
        </div>
      );
  }
}
