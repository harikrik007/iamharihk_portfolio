import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { profile } from "@/lib/content";
import "lenis/dist/lenis.css";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const title = `${profile.name} · ${profile.title}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl),
  title,
  description: profile.description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description: profile.description,
    type: "profile",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: profile.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} ${jetbrains.variable} antialiased`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
