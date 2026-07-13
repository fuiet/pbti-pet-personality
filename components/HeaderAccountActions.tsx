"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut, type AuthUser } from "@/lib/auth";

function displayName(user: AuthUser) {
  return user.email || "Account";
}

export default function HeaderAccountActions() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    setUser(null);
    router.push("/login");
  }

  return (
    <>
      {user ? (
        <>
          <Link
            href="/account"
            className="hidden max-w-[180px] truncate rounded-full border border-transparent px-2 text-sm font-bold text-[#7a6d63] transition hover:text-[#ff7a1a] md:block"
            title={displayName(user)}
          >
            {displayName(user)}
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-[#eaded2] bg-white/70 px-5 py-2.5 text-sm font-bold text-[#171514] shadow-sm transition hover:bg-white"
          >
            Sign Out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="hidden rounded-full border border-[#eaded2] bg-white/70 px-5 py-2.5 text-sm font-bold text-[#171514] shadow-sm transition hover:bg-white md:block"
        >
          Sign In
        </Link>
      )}
      <Link
        href="/create"
        className="rounded-full bg-[#ff7a1a] px-5 py-2.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
      >
        Start Free
      </Link>
    </>
  );
}