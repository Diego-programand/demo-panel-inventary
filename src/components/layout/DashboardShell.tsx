"use client";

import React from "react";
import styles from "./DashboardShell.module.css";
import { useDashboard } from "@/core/context/DashboardContext";
import { Sidebar } from "./Sidebar";
import { TopToolbar } from "./TopToolbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setIsSidebarOpen } = useDashboard();

  return (
    <div className={styles.shellContainer}>
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}

      {/* Translucent macOS Sidebar */}
      <div
        className={
          isSidebarOpen
            ? styles.sidebarVisibleOnMobile
            : styles.sidebarHiddenOnMobile
        }
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className={styles.mainArea}>
        <TopToolbar />
        <main className={styles.contentCanvas}>{children}</main>
      </div>
    </div>
  );
}
