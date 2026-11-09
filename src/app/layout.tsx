import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Toaster } from "@/components/ui/sonner";
import { LaunchSplash } from "@/components/LaunchSplash";
import startupImages from "@/lib/startupImages.json";

// Runs before first paint: skip the splash after the first launch in a session,
// and tell the splash which hour is "now" so the ring fills up to it.
const splashScript = `try{var d=document.documentElement;d.style.setProperty('--los-now',String(new Date().getHours()));if(sessionStorage.getItem('los-splash')){d.classList.add('no-splash')}else{sessionStorage.setItem('los-splash','1')}}catch(e){}`;

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LifeOS — Your Personal Productivity System",
  description:
    "A minimal, mobile-first productivity app combining Time Tracking and Focus.",
  manifest: "/manifest.json",
  // favicon.ico, icon.svg and apple-icon.png live in src/app (file conventions).
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeOS",
    startupImage: startupImages,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#070707" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body className="h-full w-full overflow-hidden bg-background text-foreground">
        <ThemeProvider>
          <LaunchSplash />
          <ServiceWorkerRegister />
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
