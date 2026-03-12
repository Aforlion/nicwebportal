import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/google-analytics";
import { MetaPixel } from "@/components/meta-pixel";
import { CookieConsent } from "@/components/cookie-consent";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIC | National Institute of Caregivers",
  description: "The professional body for caregivers in Nigeria - Training, Certification, and Regulation.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <GoogleAnalytics ga_id="G-BQTQWF4DVY" />
        <MetaPixel />
        {children}
        <CookieConsent />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

