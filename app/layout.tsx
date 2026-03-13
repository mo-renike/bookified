import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookly",
  description:
    "Transform your books into a interactive AI conversations. Upload your book and start chatting with it using voice. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", ibmPlexSerif.variable)}>
      <body
        className={`${monaSans.variable} ${ibmPlexSerif.variable} relative font-sans antialiased`}
      >
        <ClerkProvider>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
