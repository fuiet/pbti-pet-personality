"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type AuthUser } from "@/lib/auth";

function buildLoginRedirect() {
  if (typeof window === "undefined") {
    return "/login";
  }

  const nextPath = `${window.location.pathname}${window.location.search}`;
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function useRequireAuth(redirectTo?: string) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fallbackRedirect = redirectTo || buildLoginRedirect();

    getCurrentUser()
      .then((currentUser) => {
        if (!active) {
          return;
        }

        if (!currentUser) {
          router.replace(fallbackRedirect);
          return;
        }

        setUser(currentUser);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          router.replace(fallbackRedirect);
        }
      });

    return () => {
      active = false;
    };
  }, [redirectTo, router]);

  return { user, loading };
}
