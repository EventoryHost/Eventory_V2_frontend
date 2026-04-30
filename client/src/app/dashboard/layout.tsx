import BottomNav from "@/components/BottomNav";
import "./globals.css";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // No `relative` here — it was creating a stacking context that
        // trapped z-index and affected fixed-position children on iOS WebKit
        <div className="bg-gray-50 min-h-screen">
            <main className="min-h-screen pb-24 max-w-md mx-auto bg-white shadow-xl min-[450px]:border-x border-gray-100">
                {children}
            </main>
            {/* BottomNav is outside <main> so it's not inside a stacking context */}
            <BottomNav />
        </div>
    );
}
