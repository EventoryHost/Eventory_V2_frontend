'use client';

import { useEffect, useState } from 'react';
import PackageFlowManager from '@/features/packages/PackageFlowManager';
import Link from 'next/link';

export default function NewPackagePage() {
    const [vendorType, setVendorType] = useState<string | null>(null);

    useEffect(() => {
        // Read service id from local storage
        const serviceId = localStorage.getItem('service_id');

        if (serviceId) {
            // Extrapolate vendor type from standard ID format e.g. CAT384728943 -> CAT
            setVendorType(serviceId.substring(0, 3).toUpperCase());
        } else {
            // Provide a mockup ID to help the flow if it's missing (for local testing purposes)
            console.warn("No service_id found in localStorage. Using fallback 'MAK' locally.");
            setVendorType("MAK");
        }
    }, []);

    // Show a loading/fallback state until vendor type is resolved
    if (!vendorType) {
        return (
            <div className="flex items-center justify-center p-6 h-[50vh]">
                <p className="text-gray-500 animate-pulse font-medium">Resolving vendor details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col relative w-full min-h-screen">
            {/* Mount the scalable dynamic feature */}
            <PackageFlowManager vendorType={vendorType} />
        </div>
    );
}
