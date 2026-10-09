"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { NicheId, NicheProfile } from "@/core/types/niche";
import { getNicheProfile, NICHE_PROFILES } from "@/niches";
import { LocationWarehouse } from "@/core/types/inventory";

export type DashboardSection = 
  | "overview"
  | "catalog"
  | "movements"
  | "warehouses"
  | "alerts"
  | "analytics";

export type ThemeMode = "dark" | "light";

export const SAMPLE_WAREHOUSES: LocationWarehouse[] = [
  { id: "all", name: "Todos los Almacenes", code: "ALL", city: "Global", capacityUtilization: 78, zones: [] },
  { id: "wh-main", name: "Almacén Central / Hub", code: "HUB-01", city: "Medellín", capacityUtilization: 86, zones: ["Zona A - Racks", "Zona B - Frío", "Muelle de Despacho"] },
  { id: "wh-north", name: "Centro Logístico Norte", code: "CLN-02", city: "Bogotá", capacityUtilization: 64, zones: ["Recepción", "Cross-docking", "Bodega Alta"] },
  { id: "wh-west", name: "Depósito Regional Occidente", code: "DRO-03", city: "Cali", capacityUtilization: 42, zones: ["Zona Principal", "Reserva"] },
];

interface DashboardContextValue {
  section: DashboardSection;
  setSection: (section: DashboardSection) => void;
  nicheId: NicheId;
  setNicheId: (id: NicheId) => void;
  nicheProfile: NicheProfile;
  availableNiches: NicheProfile[];
  warehouseId: string;
  setWarehouseId: (id: string) => void;
  activeWarehouse: LocationWarehouse;
  warehouses: LocationWarehouse[];
  theme: ThemeMode;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<DashboardSection>("overview");
  const [nicheId, setNicheIdState] = useState<NicheId>(() => {
    if (typeof window !== "undefined") {
      const savedNiche = localStorage.getItem("app-niche") as NicheId;
      if (savedNiche && NICHE_PROFILES[savedNiche]) {
        return savedNiche;
      }
    }
    return "retail_fashion";
  });
  const [warehouseId, setWarehouseId] = useState<string>("all");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app-theme") as ThemeMode;
      if (savedTheme) return savedTheme;
    }
    return "dark";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Sync theme with document root attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("app-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  const setNicheId = useCallback((id: NicheId) => {
    setNicheIdState(id);
    localStorage.setItem("app-niche", id);
  }, []);

  const nicheProfile = useMemo(() => getNicheProfile(nicheId), [nicheId]);
  const availableNiches = useMemo(() => Object.values(NICHE_PROFILES), []);

  const activeWarehouse = useMemo(() => {
    return SAMPLE_WAREHOUSES.find((w) => w.id === warehouseId) || SAMPLE_WAREHOUSES[0];
  }, [warehouseId]);

  const value = useMemo(
    () => ({
      section,
      setSection,
      nicheId,
      setNicheId,
      nicheProfile,
      availableNiches,
      warehouseId,
      setWarehouseId,
      activeWarehouse,
      warehouses: SAMPLE_WAREHOUSES,
      theme,
      toggleTheme,
      isSidebarOpen,
      setIsSidebarOpen,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
    }),
    [
      section,
      nicheId,
      setNicheId,
      nicheProfile,
      availableNiches,
      warehouseId,
      activeWarehouse,
      theme,
      toggleTheme,
      isSidebarOpen,
      isCommandPaletteOpen,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard debe usarse dentro de un DashboardProvider");
  }
  return context;
}
