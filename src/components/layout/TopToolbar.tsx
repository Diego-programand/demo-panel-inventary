"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./TopToolbar.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  MenuIcon,
  ChevronDownIcon,
  WarehouseIcon,
} from "@/components/icons";
import { MovementModal } from "@/components/operations/MovementModal";

const SECTION_LABELS: Record<string, string> = {
  overview: "Resumen General",
  catalog: "Catálogo",
  movements: "Movimientos & Kardex",
  warehouses: "Almacenes",
  alerts: "Alertas",
  analytics: "Analítica",
};

export function TopToolbar() {
  const {
    section,
    nicheProfile,
    theme,
    toggleTheme,
    warehouseId,
    setWarehouseId,
    activeWarehouse,
    warehouses,
    setIsSidebarOpen,
    setIsCommandPaletteOpen,
  } = useDashboard();

  const [isWarehouseMenuOpen, setIsWarehouseMenuOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const warehouseMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (warehouseMenuRef.current && !warehouseMenuRef.current.contains(event.target as Node)) {
        setIsWarehouseMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.toolbar}>
      {/* Left: Mobile Trigger & Breadcrumbs */}
      <div className={styles.leftSection}>
        <button
          className={styles.menuButton}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir Menú"
        >
          <MenuIcon size={18} />
        </button>

        <div className={styles.breadcrumbs}>
          <span className={styles.breadcrumbRoot}>{nicheProfile.name}</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{SECTION_LABELS[section] || "Panel"}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        className={styles.searchTrigger}
        onClick={() => setIsCommandPaletteOpen(true)}
        type="button"
      >
        <SearchIcon size={15} />
        <span>Buscar {nicheProfile.vocabulary.itemPlural.toLowerCase()}, SKUs, lotes...</span>
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </button>

      {/* Right: Warehouse Switcher, Sync Indicator, Theme, Action CTA */}
      <div className={styles.rightSection}>
        {/* Warehouse Dropdown */}
        <div style={{ position: "relative" }} ref={warehouseMenuRef}>
          <div
            className={styles.warehouseSelector}
            onClick={() => setIsWarehouseMenuOpen((prev) => !prev)}
          >
            <WarehouseIcon size={14} color="var(--apple-text-secondary)" />
            <span>{activeWarehouse.code}</span>
            <ChevronDownIcon size={12} />
          </div>

          {isWarehouseMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "6px",
                width: "240px",
                background: "var(--apple-bg-elevated)",
                backdropFilter: "var(--apple-blur-thick)",
                border: "1px solid var(--apple-border-subtle)",
                borderRadius: "var(--apple-radius-md)",
                boxShadow: "var(--apple-shadow-modal)",
                padding: "6px",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--apple-text-tertiary)",
                  padding: "6px 8px",
                }}
              >
                Filtrar por Ubicación
              </div>
              {warehouses.map((w) => (
                <div
                  key={w.id}
                  onClick={() => {
                    setWarehouseId(w.id);
                    setIsWarehouseMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "var(--apple-radius-sm)",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: w.id === warehouseId ? 600 : 400,
                    backgroundColor: w.id === warehouseId ? "var(--apple-accent-subtle)" : "transparent",
                    color: w.id === warehouseId ? "var(--apple-accent)" : "var(--apple-text-primary)",
                  }}
                >
                  <div>
                    <div>{w.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
                      {w.city} • {w.code}
                    </div>
                  </div>
                  {w.id === warehouseId && <span style={{ fontSize: "12px" }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Sync Status */}
        <div className={styles.syncIndicator}>
          <span className={styles.syncDot} />
          <span>En vivo</span>
        </div>

        {/* Dark/Light Toggle */}
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label="Cambiar tema claro u oscuro"
        >
          {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>

        {/* Quick Action Button */}
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => setIsMovementModalOpen(true)}
          title="Registrar una nueva operación en el Kardex"
        >
          <PlusIcon size={14} />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* Movement Modal */}
      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
      />
    </header>
  );
}
