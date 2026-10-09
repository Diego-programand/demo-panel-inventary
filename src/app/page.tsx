import React from "react";
import { DashboardProvider } from "@/core/context/DashboardContext";
import { InventoryStoreProvider } from "@/core/store/inventory-store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { OverviewContent } from "@/components/dashboard/OverviewContent";

export default function Home() {
  return (
    <InventoryStoreProvider>
      <DashboardProvider>
        <DashboardShell>
          <OverviewContent />
        </DashboardShell>
        <CommandPalette />
      </DashboardProvider>
    </InventoryStoreProvider>
  );
}
