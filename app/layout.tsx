import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "PBTI - Pet Behavior Type Indicator",
  description: "Discover your pet\'s unique personality with AI-powered behavioral analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
