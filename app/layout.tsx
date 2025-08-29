import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { FontLoader } from "./components/fontLoader";

// Font configuration with fallbacks
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
  adjustFontFallback: true,
});

// Alternative: Use system fonts if Google Fonts fail
const systemFonts = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
};

export const metadata: Metadata = {
  title: "COA Generation Tools",
  description: "Certificate of Analysis data management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontLoader>
          {children}
        </FontLoader>
        <Toaster />
      </body>
    </html>
  );
}
