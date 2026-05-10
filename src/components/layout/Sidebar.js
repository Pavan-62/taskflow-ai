"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import clsx from "clsx";
import styles from "./Sidebar.module.css";
import { useToast } from "@/context/ToastContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { userData } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast("Logged out successfully", "success");
    } catch (error) {
      addToast("Failed to log out", "error");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "My Tasks", href: "/tasks", icon: CheckSquare },
    // Only admins see the Team members tab
    ...(userData?.role === "Admin" ? [{ name: "Team", href: "/team", icon: Users }] : []),
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h2>TaskFlow AI</h2>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(styles.navItem, isActive && styles.active)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {userData?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userData?.name}</span>
            <span className={styles.userRole}>{userData?.role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
