"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=${pathname}`);
      } else if (requireAdmin && userData?.role !== "Admin") {
        router.push("/dashboard"); // Redirect members away from admin-only routes
      }
    }
  }, [user, userData, loading, router, pathname, requireAdmin]);

  if (loading || !user || (requireAdmin && userData?.role !== "Admin")) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return children;
}
