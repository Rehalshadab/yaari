import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CallProvider } from "@/context/CallContext";
import { Toaster } from "react-hot-toast";
import PwaRegister from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yaari - Connect, Chat & Earn",
  description: "Connect with people, earn money on calls",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Yaari",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
        <AuthProvider>
          <CallProvider>
            {children}
            <PwaRegister />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  borderRadius: "16px",
                  background: "#1e1b4b",
                  color: "#fff",
                },
              }}
            />
          </CallProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
