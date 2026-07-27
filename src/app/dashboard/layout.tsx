"use client";

import BottomNav from "@/components/BottomNav";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDocumentPage =
    pathname.includes("/documents") || pathname.includes("/setup-profile");

  useEffect(() => {
    // Apply dark mode preference (moved here from root layout — vendor-only)
    try {
      if (
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    // Protect dashboard routes
    const token = localStorage.getItem("vendor_token");
    const vendorId = localStorage.getItem("vendor_id");

    if (!token || !vendorId) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#09090B] min-h-screen transition-colors duration-300">
        <main
          className={`min-h-screen ${isDocumentPage ? "pb-0" : "pb-24"} max-w-md mx-auto bg-white dark:bg-[#09090B] shadow-xl min-[450px]:border-x border-gray-100 dark:border-[#27272A] relative transition-colors duration-300`}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
