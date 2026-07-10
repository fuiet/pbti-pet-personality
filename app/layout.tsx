import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pbti-pet-personality.pages.dev"),
  title: { default: "PBTI — Discover Your Pet's Personality", template: "%s | PBTI" },
  description: "Discover your cat or dog's unique personality with a free behavior test and personalized PBTI insights.",
  applicationName: "PBTI",
  keywords: ["pet personality test", "cat personality", "dog personality", "PBTI", "pet behavior"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PBTI",
    title: "PBTI — Discover Your Pet's Personality",
    description: "A free personality test for cats and dogs.",
    images: [{ url: "/hero-pets.png", width: 1200, height: 630, alt: "PBTI pet personality test" }],
  },
  twitter: { card: "summary_large_image", title: "PBTI Pet Personality Test", description: "Discover your pet's unique personality.", images: ["/hero-pets.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff9f2" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
