import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./dashboard/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
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
      <body className={`${inter.variable} ${figtree.variable} font-sans antialiased text-gray-900 bg-white`}>
        {children}
      </body>
    </html>
  );
}
