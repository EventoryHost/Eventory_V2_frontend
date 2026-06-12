'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LottieSplashScreen from '@/components/LottieSplashScreen';

export default function LandingPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('vendor_token');
            if (token) {
                // If logged in, skip splash and go straight to dashboard
                router.push('/dashboard');
            } else {
                // Not logged in -> show splash screen
                setIsChecking(false);
            }
        }
    }, [router]);

    const handleSplashComplete = () => {
        router.push('/login');
    };

    if (isChecking) {
        return null; // or a tiny spinner
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <LottieSplashScreen onComplete={handleSplashComplete} />
        </div>
    );
}
