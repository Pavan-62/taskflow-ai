"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsers } from "@/lib/db";
import { useToast } from "@/context/ToastContext";
import { Loader2, Users, Mail, Shield, User } from "lucide-react";
import styles from "./Team.module.css";
import clsx from "clsx";

export default function TeamPage() {
  const { userData } = useAuth();
  const { addToast } = useToast();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.role === "Admin") {
      fetchTeam();
    } else {
      setLoading(false); // If not admin, ProtectedRoute will redirect anyway
    }
  }, [userData]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setTeam(data);
    } catch (error) {
      console.error(error);
      addToast("Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  // Not allowed view handled by ProtectedRoute, but just in case
  if (userData?.role !== "Admin") {
    return <div>Unauthorized access.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Team Directory</h1>
          <p>Manage users and their roles across the organization.</p>
        </div>
      </header>

      <div className={styles.teamGrid}>
        {team.map((member) => (
          <div key={member.id} className={styles.teamCard}>
            <div className={styles.avatarLarge}>
              {member.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className={styles.memberInfo}>
              <h3>{member.name}</h3>
              
              <div className={styles.metaRow}>
                <Mail size={14} />
                <span>{member.email}</span>
              </div>
              
              <div className={styles.roleBadgeContainer}>
                {member.role === "Admin" ? (
                  <div className={clsx(styles.roleBadge, styles.adminBadge)}>
                    <Shield size={12} />
                    <span>Admin</span>
                  </div>
                ) : (
                  <div className={clsx(styles.roleBadge, styles.memberBadge)}>
                    <User size={12} />
                    <span>Member</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
