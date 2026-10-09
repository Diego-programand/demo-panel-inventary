import React from "react";
import { DashboardProvider } from "@/core/context/DashboardContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { OverviewContent } from "@/components/dashboard/OverviewContent";

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardShell>
        <OverviewContent />
      </DashboardShell>
      <CommandPalette />
    </DashboardProvider>
  );
}
