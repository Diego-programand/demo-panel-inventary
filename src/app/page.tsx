import React from "react";
import { DashboardProvider } from "@/core/context/DashboardContext";
import { InventoryStoreProvider } from "@/core/store/inventory-store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { MainSectionRouter } from "@/components/layout/MainSectionRouter";

export default function Home() {
  return (
    <InventoryStoreProvider>
      <DashboardProvider>
        <DashboardShell>
          <MainSectionRouter />
        </DashboardShell>
        <CommandPalette />
      </DashboardProvider>
    </InventoryStoreProvider>
  );
}
