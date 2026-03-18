import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soultrack — the music of your moment",
  description: "3 questions. One melody. Yours.",
  openGraph: {
    title: "Soultrack — the music of your moment",
    description: "3 questions. One melody. Yours.",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
