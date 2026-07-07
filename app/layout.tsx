import "./globals.css";

export const metadata = {
  title: "PBTI - Pet Behavior Type Indicator",
  description: "Discover your pet personality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
