"use client";

import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { getTasks } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import styles from "./Topbar.module.css";
import clsx from "clsx";

export default function Topbar() {
  const { user, userData } = useAuth();
  const [theme, setTheme] = useState("light");
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Fetch tasks to count overdue
    if (user && userData) {
      getTasks(user.uid, userData.role).then((tasks) => {
        const now = new Date();
        const count = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now).length;
        setOverdueCount(count);
      }).catch(console.error);
    }
  }, [user, userData]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className={styles.topbar}>
      <div className={styles.searchContainer}>
        {/* Can add search input here later */}
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle Theme">
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <div className={styles.notificationWrapper}>
          <button className={styles.iconBtn} title="Notifications">
            <Bell size={20} />
          </button>
          {overdueCount > 0 && (
            <span className={styles.badge}>{overdueCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
