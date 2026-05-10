"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTasks, getProjects } from "@/lib/db";
import { Loader2, Briefcase, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import styles from "./Dashboard.module.css";
import clsx from "clsx";

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    if (user && userData) {
      async function fetchData() {
        try {
          const [projects, tasks] = await Promise.all([
            getProjects(user.uid, userData.role),
            getTasks(user.uid, userData.role)
          ]);

          const now = new Date();
          const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now);
          const completed = tasks.filter(t => t.status === "Completed");

          setStats({
            totalProjects: projects.length,
            totalTasks: tasks.length,
            completedTasks: completed.length,
            overdueTasks: overdue.length,
          });

          // Sort by creation date or due date
          setRecentTasks(tasks.slice(0, 5));
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [user, userData]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Projects", value: stats.totalProjects, icon: Briefcase, color: "primary" },
    { label: "Total Tasks", value: stats.totalTasks, icon: CheckCircle, color: "secondary" },
    { label: "Completed", value: stats.completedTasks, icon: CheckCircle, color: "success" },
    { label: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, color: "danger" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome back, {userData?.name?.split(' ')[0]}! 👋</h1>
        <p>Here is your {userData?.role === "Admin" ? "team's" : ""} productivity overview.</p>
      </header>

      <div className={styles.statsGrid}>
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={styles.statCard}>
              <div className={clsx(styles.statIcon, styles[`bg-${stat.color}`])}>
                <Icon size={24} />
              </div>
              <div className={styles.statInfo}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Tasks</h2>
          </div>
          <div className={styles.cardBody}>
            {recentTasks.length === 0 ? (
              <div className={styles.emptyState}>No tasks found.</div>
            ) : (
              <ul className={styles.taskList}>
                {recentTasks.map(task => (
                  <li key={task.id} className={styles.taskItem}>
                    <div className={styles.taskTitle}>
                      <span className={clsx(styles.statusDot, styles[task.status.replace(/\s+/g, '')])} />
                      {task.title}
                    </div>
                    <div className={styles.taskMeta}>
                      <span className={clsx(styles.badge, styles[task.priority])}>{task.priority}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Productivity</h2>
          </div>
          <div className={styles.cardBody}>
            {/* Simple Progress visualization */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Task Completion Rate</span>
                <span>
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className={styles.progressBarBg}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
