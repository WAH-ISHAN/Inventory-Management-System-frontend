import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Internal Inventory Management System",
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
      <body className="min-h-full flex flex-col">
        
        
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b', 
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' }, 
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' }, 
            },
          }} 
        />

       
        {children}
        
      </body>
    </html>
  );
}