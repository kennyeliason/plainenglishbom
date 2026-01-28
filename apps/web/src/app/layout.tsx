import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.plainenglishbom.com"
  ),
  title: {
    default: "Plain English Book of Mormon",
    template: "%s | Plain English Book of Mormon",
  },
  description:
    "The Book of Mormon translated into clear, modern English while preserving its original meaning and spiritual power.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

// Export font classes for use in locale layout
export { cormorant, sourceSerif };
