'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';

export default function LandingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleStartOnboarding = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate loading/splash screen
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            {isLoading && <SplashScreen />}
            
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-6">
                Eventory V2
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                The ultimate platform for event vendors to manage bookings, inventory, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleStartOnboarding}
                    className="px-8 py-4 bg-[#0D2531] text-white rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all active:scale-95 min-w-[200px]"
                >
                    Become a Vendor
                </button>
                <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-white border-2 border-[#0D2531] text-[#0D2531] rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 min-w-[200px]"
                >
                    Vendor Dashboard
                </Link>
            </div>
        </div>
    );
}
