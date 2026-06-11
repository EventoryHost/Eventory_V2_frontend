'use client';

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
    const isDocumentPage = pathname.includes('/documents');

    useEffect(() => {
        // Protect dashboard routes
        const token = localStorage.getItem('vendor_token');
        const vendorId = localStorage.getItem('vendor_id');
        
        if (!token || !vendorId) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router, pathname]);

    // Show nothing or a loader while checking authentication to prevent flash of content
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

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
