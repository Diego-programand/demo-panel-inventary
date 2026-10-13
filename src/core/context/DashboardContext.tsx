"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
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
  { id: "all", name: "Todas las Sedes", code: "TODAS", city: "General", capacityUtilization: 78, zones: [] },
  { id: "wh-main", name: "Bodega Principal", code: "BOD-01", city: "Medellín", capacityUtilization: 86, zones: ["Mostrador", "Estantería Principal", "Bodega de Reserva"] },
  { id: "wh-north", name: "Tienda Centro", code: "TIENDA-01", city: "Bogotá", capacityUtilization: 64, zones: ["Área de Ventas", "Vitrina", "Depósito Interno"] },
  { id: "wh-west", name: "Sucursal Norte", code: "TIENDA-02", city: "Cali", capacityUtilization: 42, zones: ["Recepción", "Estantes"] },
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

// External store synchronization for localStorage
function getInitialNiche(): NicheId {
  if (typeof window === "undefined") return "retail_fashion";
  try {
    const val = localStorage.getItem("app-niche") as NicheId;
    if (val && NICHE_PROFILES[val]) return val;
  } catch {}
  return "retail_fashion";
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const val = localStorage.getItem("app-theme") as ThemeMode;
    if (val === "light" || val === "dark") return val;
  } catch {}
  return "dark";
}

let cachedNiche: NicheId = getInitialNiche();
let cachedTheme: ThemeMode = getInitialTheme();
const storeListeners = new Set<() => void>();

function notifyStoreChange() {
  storeListeners.forEach((listener) => listener());
}

function subscribeToStore(listener: () => void) {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<DashboardSection>("overview");
  const [warehouseId, setWarehouseId] = useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const nicheId = useSyncExternalStore<NicheId>(
    subscribeToStore,
    () => cachedNiche,
    () => "retail_fashion" as NicheId
  );

  const theme = useSyncExternalStore<ThemeMode>(
    subscribeToStore,
    () => cachedTheme,
    () => "dark" as ThemeMode
  );

  // Sync theme with document root attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = cachedTheme === "dark" ? "light" : "dark";
    cachedTheme = next;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("app-theme", next);
        document.documentElement.setAttribute("data-theme", next);
      } catch {}
    }
    notifyStoreChange();
  }, []);

  const setNicheId = useCallback((id: NicheId) => {
    cachedNiche = id;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("app-niche", id);
      } catch {}
    }
    notifyStoreChange();
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
