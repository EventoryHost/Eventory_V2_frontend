'use client';

import BottomNav from "@/components/BottomNav";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isDocumentPage = pathname.includes('/documents');

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <main className={`min-h-screen ${isDocumentPage ? 'pb-0' : 'pb-24'} max-w-md mx-auto bg-white shadow-xl min-[450px]:border-x border-gray-100 relative`}>
                    {children}
                </main>
            </div>
            {/* BottomNav is outside the main stacking context to prevent mobile touch issues */}
            <BottomNav />
        </>
    );
}
