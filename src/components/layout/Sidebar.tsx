"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { useDashboard, DashboardSection } from "@/core/context/DashboardContext";
import { NicheId } from "@/core/types/niche";
import {
  OverviewIcon,
  CatalogIcon,
  MovementsIcon,
  WarehouseIcon,
  AlertIcon,
  AnalyticsIcon,
  ChevronDownIcon,
  LayersIcon,
} from "@/components/icons";

interface NavItemConfig {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeType?: "danger" | "subtle";
}

export function Sidebar() {
  const {
    section,
    setSection,
    nicheId,
    setNicheId,
    nicheProfile,
    availableNiches,
    activeWarehouse,
    setIsSidebarOpen,
  } = useDashboard();

  const [isNicheDropdownOpen, setIsNicheDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close niche menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNicheDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: NavItemConfig[] = [
    {
      id: "overview",
      label: "Resumen General",
      icon: <OverviewIcon size={18} />,
    },
    {
      id: "catalog",
      label: `Catálogo de ${nicheProfile.vocabulary.itemPlural}`,
      icon: <CatalogIcon size={18} />,
      badge: 142,
      badgeType: "subtle",
    },
    {
      id: "movements",
      label: "Movimientos & Kardex",
      icon: <MovementsIcon size={18} />,
    },
    {
      id: "warehouses",
      label: nicheProfile.vocabulary.locationLabel,
      icon: <WarehouseIcon size={18} />,
      badge: 3,
      badgeType: "subtle",
    },
    {
      id: "alerts",
      label: "Alertas Críticas",
      icon: <AlertIcon size={18} />,
      badge: 5,
      badgeType: "danger",
    },
    {
      id: "analytics",
      label: "Analítica & Rotación",
      icon: <AnalyticsIcon size={18} />,
    },
  ];

  const handleSelectNiche = (id: NicheId) => {
    setNicheId(id);
    setIsNicheDropdownOpen(false);
  };

  const handleNavItemClick = (itemSection: DashboardSection) => {
    setSection(itemSection);
    setIsSidebarOpen(false);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.logoIconWrapper}>
          <LayersIcon size={20} color="#ffffff" />
        </div>
        <div className={styles.brandInfo}>
          <span className={styles.brandTitle}>Inventory OS</span>
          <span className={styles.brandSubtitle}>Enterprise Suite</span>
        </div>
      </div>

      {/* Dynamic Niche Selector Dropdown */}
      <div className={styles.nicheSelectorArea} ref={dropdownRef}>
        <div className={styles.nicheLabel}>
          <span>Sector Activo</span>
          <span>DEMO</span>
        </div>
        <div
          className={styles.nicheSelectDropdown}
          onClick={() => setIsNicheDropdownOpen((prev) => !prev)}
        >
          <div className={styles.nicheIndicator}>
            <span
              className={styles.nicheDot}
              style={{ backgroundColor: nicheProfile.accentColor }}
            />
            <span>{nicheProfile.name}</span>
          </div>
          <ChevronDownIcon size={14} />
        </div>

        {/* Niche Dropdown Popover */}
        {isNicheDropdownOpen && (
          <div
            style={{
              position: "absolute",
              marginTop: "6px",
              width: "238px",
              background: "var(--apple-bg-elevated)",
              backdropFilter: "var(--apple-blur-thick)",
              border: "1px solid var(--apple-border-subtle)",
              borderRadius: "var(--apple-radius-md)",
              boxShadow: "var(--apple-shadow-modal)",
              padding: "6px",
              zIndex: 100,
            }}
          >
            {availableNiches.map((n) => (
              <div
                key={n.id}
                onClick={() => handleSelectNiche(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "var(--apple-radius-sm)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: n.id === nicheId ? 600 : 400,
                  backgroundColor: n.id === nicheId ? "var(--apple-accent-subtle)" : "transparent",
                  color: n.id === nicheId ? "var(--apple-accent)" : "var(--apple-text-primary)",
                  transition: "background var(--apple-transition-fast)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: n.accentColor,
                    }}
                  />
                  <span>{n.name}</span>
                </div>
                {n.id === nicheId && <span style={{ fontSize: "12px" }}>✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className={styles.navSection}>
        <div className={styles.navSectionLabel}>Operación & Control</div>
        {navItems.map((item) => {
          const isActive = section === item.id;
          return (
            <div
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => handleNavItemClick(item.id)}
            >
              <div className={styles.navItemContent}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={
                    item.badgeType === "danger"
                      ? styles.badgePill
                      : styles.badgePillSubtle
                  }
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer with Active Warehouse */}
      <div className={styles.sidebarFooter}>
        <div className={styles.warehousePill}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <WarehouseIcon size={14} color="var(--apple-text-tertiary)" />
            <span className={styles.warehouseName}>{activeWarehouse.name}</span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--apple-text-tertiary)" }}>
            {activeWarehouse.code}
          </span>
        </div>
      </div>
    </aside>
  );
}
