import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "strasbourg Weather Archive - Climatologie de strasbourg, Maroc",
  description: "Archives météorologiques complètes de strasbourg, Oriental, Maroc. Températures, précipitations et statistiques climatiques.",
  keywords: ["strasbourg", "Météo", "Climatologie", "Maroc", "Archives Météo", "Oriental", "Températures", "Pluie", "Radar Météo", "Rapport Scientifique"],
  authors: [{ name: "strasbourg Weather" }],
  openGraph: {
    title: "strasbourg Weather Archive",
    description: "Climatologie et archives météo de strasbourg, Maroc.",
    url: "https://strasbourgarchiveweather.vercel.app",
    siteName: "strasbourg Weather",
    locale: "fr_FR",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> strasbourg Weather Archive. Données via{" "}
              <a 
                href="https://open-meteo.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline text-primary"
              >
                Open-Meteo
              </a>.
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

