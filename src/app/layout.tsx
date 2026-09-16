import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helis — classroom signals to parent WhatsApp",
  description:
    "Teachers log lightweight student events; Helis turns them into bilingual parent digests delivered on WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
