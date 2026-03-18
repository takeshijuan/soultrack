import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soultrack",
  description: "AI-powered music generation and tracking",
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
