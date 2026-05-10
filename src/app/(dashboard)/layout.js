"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.mainContent}>
          <Topbar />
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
