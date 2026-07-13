"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAccountActions from "@/components/HeaderAccountActions";
import LanguageSelector from "@/components/LanguageSelector";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/types", label: "Types" },
  { href: "/dashboard", label: "My Pets" },
  { href: "/account", label: "Account" },
  { href: "/premium", label: "Premium" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#33251d]">
      <header className="sticky top-0 z-50 border-b border-[#eaded2]/70 bg-[#fff9f2]/78 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="shrink-0" aria-label="PBTI Home">
            <img src="/logo.png" alt="PBTI" className="h-12 w-auto object-contain" />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-bold text-[#4f463f] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-[#ff7a1a] ${pathname === link.href ? "text-[#ff7a1a]" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector compact />
            <HeaderAccountActions />
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#eaded2] px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#7a6d63] md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PBTI" className="h-8 w-auto object-contain" />
            <span>Copyright 2026 PBTI</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[#ff7a1a]">Home</Link>
            <Link href="/dashboard" className="hover:text-[#ff7a1a]">Dashboard</Link>
            <Link href="/premium" className="hover:text-[#ff7a1a]">Premium</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}