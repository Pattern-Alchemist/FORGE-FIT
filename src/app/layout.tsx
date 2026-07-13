import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Use Inter for display too (tighter tracking for headings via CSS)
const interDisplay = Inter({
  variable: "--font-display-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Forge — Coaching, refined.",
  description:
    "The operating system for serious coaches. Manage clients, build workouts, review check-ins, and grow your coaching business from one premium console.",
  keywords: [
    "fitness coaching",
    "personal trainer software",
    "coach platform",
    "workout builder",
    "client management",
  ],
  authors: [{ name: "Forge" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Forge — Coaching, refined.",
    description: "The operating system for serious coaches.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body
        className={`${inter.variable} ${interDisplay.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProviderWrapper>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
