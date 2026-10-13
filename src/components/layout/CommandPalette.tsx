"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./CommandPalette.module.css";
import { useDashboard, DashboardSection } from "@/core/context/DashboardContext";
import { NicheId } from "@/core/types/niche";
import {
  SearchIcon,
  OverviewIcon,
  CatalogIcon,
  MovementsIcon,
  WarehouseIcon,
  AlertIcon,
  AnalyticsIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setSection,
    setNicheId,
    availableNiches,
    nicheProfile,
    theme,
    toggleTheme,
  } = useDashboard();

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setQuery("");
        setIsCommandPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  const handleClose = () => {
    setQuery("");
    setIsCommandPaletteOpen(false);
  };

  const sectionsList: { id: DashboardSection; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: "overview", label: "Ir a Resumen General", icon: <OverviewIcon size={16} /> },
      { id: "catalog", label: `Ir a Catálogo de ${nicheProfile.vocabulary.itemPlural}`, icon: <CatalogIcon size={16} /> },
      { id: "movements", label: "Ir a Movimientos", icon: <MovementsIcon size={16} /> },
      { id: "warehouses", label: `Ir a ${nicheProfile.vocabulary.locationLabel}`, icon: <WarehouseIcon size={16} /> },
      { id: "alerts", label: "Ver Alertas de Poco Stock", icon: <AlertIcon size={16} /> },
      { id: "analytics", label: "Ir a Reportes & Métricas", icon: <AnalyticsIcon size={16} /> },
    ],
    [nicheProfile]
  );

  const filteredSections = sectionsList.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNiches = availableNiches.filter((n) =>
    n.name.toLowerCase().includes(query.toLowerCase()) ||
    n.tagline.toLowerCase().includes(query.toLowerCase())
  );

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <SearchIcon size={18} color="var(--apple-text-tertiary)" />
          <input
            autoFocus
            className={styles.input}
            placeholder="Escribe un comando o busca en el panel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.resultsList}>
          {/* Navegación rápida */}
          {filteredSections.length > 0 && (
            <div>
              <div className={styles.sectionHeader}>Navegación</div>
              {filteredSections.map((item) => (
                <div
                  key={item.id}
                  className={styles.item}
                  onClick={() => {
                    setSection(item.id);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <div className={styles.itemLeft}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className={styles.itemHint}>Saltar</span>
                </div>
              ))}
            </div>
          )}

          {/* Cambiar de nicho */}
          {filteredNiches.length > 0 && (
            <div>
              <div className={styles.sectionHeader}>Cambiar Sector Industrial</div>
              {filteredNiches.map((n) => (
                <div
                  key={n.id}
                  className={styles.item}
                  onClick={() => {
                    setNicheId(n.id as NicheId);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <div className={styles.itemLeft}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: n.accentColor,
                      }}
                    />
                    <span>Demostración: {n.name}</span>
                  </div>
                  <span className={styles.itemHint}>{n.tagline.slice(0, 32)}...</span>
                </div>
              ))}
            </div>
          )}

          {/* Preferencias de interfaz */}
          <div className={styles.sectionHeader}>Preferencias</div>
          <div
            className={styles.item}
            onClick={() => {
              toggleTheme();
              setIsCommandPaletteOpen(false);
            }}
          >
            <div className={styles.itemLeft}>
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              <span>Cambiar a tema {theme === "dark" ? "claro" : "oscuro"}</span>
            </div>
            <span className={styles.itemHint}>Alternar</span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <span>Presiona <strong>ESC</strong> para salir</span>
          <span>Navega con flechas o ratón</span>
        </div>
      </div>
    </div>
  );
}
