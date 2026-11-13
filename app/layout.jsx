import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import QueryProvider from "@/providers/query-provider";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import SmartsuppChat from "@/components/SmartsuppChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
|--------------------------------------------------------------------------
| Viewport
|--------------------------------------------------------------------------
| These values help mobile browsers use your dashboard theme when
| rendering browser chrome / system UI.
|
| Note:
| - You cannot completely hide Safari/Chrome browser controls from a
|   normal website.
| - themeColor allows the browser to tint its UI around your site.
| - colorScheme tells the browser that your application supports both
|   dark and light interfaces.
|--------------------------------------------------------------------------
*/
export const viewport = {
  width: "device-width",
  initialScale: 1,

  /*
   * Keep this if you intentionally want to prevent pinch zoom.
   * For accessibility, removing maximumScale/userScalable is generally
   * recommended.
   */
  maximumScale: 1,
  userScalable: false,

  colorScheme: "dark light",

  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: "#060810",
    },
    {
      media: "(prefers-color-scheme: light)",
      color: "#f4fbf7",
    },
  ],
};

/*
|--------------------------------------------------------------------------
| Metadata
|--------------------------------------------------------------------------
*/
export const metadata = {
  title: "Capitaledgehub – Smart Trading Platform",

  description:
    "Trusted by millions, delivering the fastest trade execution, with powerful trading tools and a self-custody wallet.",

  metadataBase: new URL("https://Capitaledgehub.com"),

  openGraph: {
    title: "Capitaledgehub – Smart Trading Platform",
    description:
      "Trusted by millions, delivering the fastest trade execution, with powerful trading tools and a self-custody wallet.",
    type: "website",
    url: "https://Capitaledgehub.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Capitaledgehub – Smart Trading Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Capitaledgehub – Smart Trading Platform",
    description:
      "Trusted by millions, delivering the fastest trade execution, with powerful trading tools and a self-custody wallet.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      {
        url: "/fav.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}

            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 3000,

                style: {
                  background: "#12172a",
                  color: "#e4f0e8",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                },

                success: {
                  style: {
                    background: "#0f2318",
                    color: "#86efac",
                    border: "1px solid rgba(34,197,94,0.4)",
                  },

                  iconTheme: {
                    primary: "#22c55e",
                    secondary: "#0f2318",
                  },
                },

                error: {
                  style: {
                    background: "#2a1416",
                    color: "#fca5a5",
                    border: "1px solid #4d0408",
                  },

                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#2a1416",
                  },
                },

                loading: {
                  style: {
                    background: "#141a2e",
                    color: "#86efac",
                    border: "1px solid rgba(34, 197, 94,0.4)",
                  },

                  iconTheme: {
                    primary: "#22c55e",
                    secondary: "#141a2e",
                  },
                },
              }}
            />
            <SmartsuppChat />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
