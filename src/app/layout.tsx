import type { Metadata, Viewport } from "next";
import { Inter, Lora, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import { NovelProvider } from "@/context/NovelContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MANDARA - Interactive Cinematic Novel",
  description: "An elegant, mobile-first cinematic reading experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden select-none">
        <NovelProvider>
          <div className="noise-overlay" />
          {children}
        </NovelProvider>
      </body>
    </html>
  );
}
