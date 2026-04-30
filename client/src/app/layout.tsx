import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./dashboard/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Eventory - Premium Event Management",
  description: "Manage your events and inventory with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-gray-900 bg-white`}>
        {children}
      </body>
    </html>
  );
}
