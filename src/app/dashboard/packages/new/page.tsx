'use client';

import { useEffect, useState } from 'react';
import PackageFlowManager from '@/features/packages/PackageFlowManager';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function NewPackagePage() {
    const router = useRouter();
    const [vendorType, setVendorType] = useState<string | null>(null);
    const [showStepsOverview, setShowStepsOverview] = useState(true);
    const [hoveredStep1, setHoveredStep1] = useState(false);
    const [clickAttemptedStep2, setClickAttemptedStep2] = useState(false);
    const [completedStepsCount, setCompletedStepsCount] = useState(0);
    const [activeStepNum, setActiveStepNum] = useState(1);

    const fetchProgress = async () => {
        const vendorId = localStorage.getItem('vendor_id');
        const serviceId = localStorage.getItem('service_id');
        if (!vendorId) return;

        let targetVendorType = '';
        if (serviceId) {
            const prefix = serviceId.substring(0, 3).toUpperCase();
            switch (prefix) {
                case 'CAT': targetVendorType = 'Caterer'; break;
                case 'MAK': targetVendorType = 'Makeup Artist'; break;
                case 'DEC': targetVendorType = 'Decorator'; break;
                case 'DJA': targetVendorType = 'DJ Artist'; break;
                case 'PAV': targetVendorType = 'Photographer/Videographer'; break;
                case 'VEN': targetVendorType = 'Venue'; break;
            }
        }

        try {
            const res = await fetch(apiUrl(`/packages/vendor/${vendorId}?status=Draft`), { cache: 'no-store' });
            const data = await res.json();
            if (data.status === 'SUCCESS' && data.packages && data.packages.length > 0) {
                let pkg = targetVendorType 
                    ? data.packages.find((p: any) => p.vendorType === targetVendorType) 
                    : data.packages[0];

                if (!pkg) pkg = data.packages[0];

                if (pkg && pkg.completedSteps) {
                    const completed = pkg.completedSteps;
                    setCompletedStepsCount(completed.length);

                    // Determine active step from localStorage or completed steps
                    let currentStep = completed.length > 0 ? Math.min(4, Math.max(...completed) + 1) : 1;
                    if (pkg._id) {
                        const localStep = localStorage.getItem(`decorator_active_step_${pkg._id}`)
                            || localStorage.getItem(`caterer_active_step_${pkg._id}`)
                            || localStorage.getItem(`makeup_active_step_${pkg._id}`)
                            || localStorage.getItem(`dj_active_step_${pkg._id}`)
                            || localStorage.getItem(`pav_active_step_${pkg._id}`)
                            || localStorage.getItem(`venue_active_step_${pkg._id}`);
                        if (localStep) {
                            currentStep = parseInt(localStep, 10);
                        }
                    }
                    setActiveStepNum(currentStep);
                }
            }
        } catch (err) {
            console.error("Failed to fetch package draft progress:", err);
        }
    };

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

        // Fetch draft package progress
        fetchProgress();
    }, []);

    const handleExitFlow = () => {
        setShowStepsOverview(true);
        fetchProgress();
    };

    // Show a loading/fallback state until vendor type is resolved
    if (!vendorType) {
        return (
            <div className="flex items-center justify-center p-6 h-[50vh]">
                <p className="text-gray-500 animate-pulse font-medium">Resolving vendor details...</p>
            </div>
        );
    }

    if (showStepsOverview) {
        return (
            <div style={{ backgroundColor: '#F9FAF9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '448px', backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '0 0 20px rgba(0,0,0,0.02)' }}>
                    
                    {/* Header */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        padding: '16px 20px', 
                        backgroundColor: '#FFFFFF', 
                        borderBottom: '1.5px solid #F4F4F5' 
                    }}>
                        <button 
                            onClick={() => router.push('/dashboard/inventory')} 
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ArrowLeft size={24} color="#04222D" />
                        </button>
                        <h1 style={{ 
                            fontSize: '20px', 
                            fontWeight: 800, 
                            color: '#04222D', 
                            fontFamily: 'Figtree, sans-serif',
                            letterSpacing: '-0.3px',
                            margin: 0
                        }}>
                            Create a Package
                        </h1>
                    </div>

                    {/* Hero Banner */}
                    <div style={{ 
                        background: 'linear-gradient(180deg, #E0F2FE 0%, #F0F9FF 100%)', 
                        height: '180px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderBottomLeftRadius: '32px', 
                        borderBottomRightRadius: '32px',
                        position: 'relative'
                    }}>
                        <img 
                            src="https://dkuacgndftndz.cloudfront.net/inventory-page/create%20package%20pop%20up%20/package.png" 
                            alt="Package Box" 
                            style={{ width: '110px', height: '110px', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Steps Content Area */}
                    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, backgroundColor: '#FAFBFD' }}>
                        
                        {/* Step 1 Card */}
                        <div 
                            onClick={() => setShowStepsOverview(false)}
                            onMouseEnter={() => setHoveredStep1(true)}
                            onMouseLeave={() => setHoveredStep1(false)}
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '20px',
                                border: hoveredStep1 ? '1px solid #000000' : '1px solid #E4E4E7',
                                padding: '24px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                transform: hoveredStep1 ? 'translateY(-2px)' : 'translateY(0)',
                                boxShadow: hoveredStep1 ? '0 8px 24px rgba(0, 0, 0, 0.04)' : '0 4px 12px rgba(0, 0, 0, 0.01)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '12px' }}>
                                    <span style={{ 
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#EAECEF', 
                                        color: '#3F3F46', 
                                        fontSize: '12px', 
                                        fontWeight: 700, 
                                        padding: '4px 12px', 
                                        borderRadius: '100px',
                                        fontFamily: 'Figtree, sans-serif'
                                    }}>
                                        Part 1
                                    </span>
                                    <h2 style={{ 
                                        fontSize: '18px', 
                                        fontWeight: 800, 
                                        color: '#000000', 
                                        fontFamily: 'Figtree, sans-serif', 
                                        letterSpacing: '-0.3px',
                                        margin: 0 
                                    }}>
                                        Package Setup
                                    </h2>
                                    <p style={{ 
                                        fontSize: '13.5px', 
                                        color: '#71717B', 
                                        lineHeight: 1.45, 
                                        fontFamily: 'Figtree, sans-serif',
                                        margin: 0 
                                    }}>
                                        Add your service details, items, pricing, and sample media.
                                    </p>
                                </div>
                                <img 
                                    src="https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/step_1.png" 
                                    alt="Package Setup Illustration" 
                                    style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        objectFit: 'contain',
                                        transition: 'transform 0.2s ease',
                                        transform: hoveredStep1 ? 'scale(1.05)' : 'scale(1)'
                                    }} 
                                />
                            </div>

                            {/* Progress Track */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ height: '6px', backgroundColor: '#EAECEF', borderRadius: '100px', width: '100%' }}>
                                    <div style={{ height: '100%', backgroundColor: '#04222D', borderRadius: '100px', width: `${completedStepsCount > 0 ? (activeStepNum / 4) * 100 : 0}%` }}></div>
                                </div>
                                <span style={{ 
                                    fontSize: '11.5px', 
                                    color: '#71717B', 
                                    fontWeight: 600, 
                                    alignSelf: 'flex-end', 
                                    fontFamily: 'Figtree, sans-serif' 
                                }}>
                                    {completedStepsCount > 0 ? `Currently on Step ${activeStepNum} of 4` : '0 of 4 steps done'}
                                </span>
                            </div>

                            <div style={{ height: '0.5px', backgroundColor: '#E4E4E7' }}></div>

                            {/* Bottom CTA */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ 
                                    fontSize: '15px', 
                                    fontWeight: 700, 
                                    color: '#04222D', 
                                    fontFamily: 'Figtree, sans-serif' 
                                }}>
                                    {completedStepsCount > 0 ? 'Resume' : 'Start Now'}
                                </span>
                                <ArrowRight size={18} color="#04222D" />
                            </div>
                        </div>

                        {/* Step 2 Card (Disabled) */}
                        <div 
                            onClick={() => {
                                setClickAttemptedStep2(true);
                                setTimeout(() => setClickAttemptedStep2(false), 3000);
                            }}
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '20px',
                                border: '1px solid #EAECEF',
                                padding: '24px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                opacity: 0.55,
                                cursor: 'not-allowed',
                                position: 'relative',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '12px' }}>
                                    <span style={{ 
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#EAECEF', 
                                        color: '#71717B', 
                                        fontSize: '12px', 
                                        fontWeight: 700, 
                                        padding: '4px 12px', 
                                        borderRadius: '100px',
                                        fontFamily: 'Figtree, sans-serif'
                                    }}>
                                        Part 2
                                    </span>
                                    <h2 style={{ 
                                        fontSize: '18px', 
                                        fontWeight: 800, 
                                        color: '#71717B', 
                                        fontFamily: 'Figtree, sans-serif', 
                                        letterSpacing: '-0.3px',
                                        margin: 0 
                                    }}>
                                        Booking Settings
                                    </h2>
                                    <p style={{ 
                                        fontSize: '13.5px', 
                                        color: '#8E8E93', 
                                        lineHeight: 1.45, 
                                        fontFamily: 'Figtree, sans-serif',
                                        margin: 0 
                                    }}>
                                        Set your availability, advance booking window, and cancellation terms.
                                    </p>
                                </div>
                                <img 
                                    src="https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/step_2.png" 
                                    alt="Booking Settings Illustration" 
                                    style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'grayscale(30%)' }} 
                                />
                            </div>

                            {/* Progress Track */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ height: '6px', backgroundColor: '#EAECEF', borderRadius: '100px', width: '100%' }}>
                                    <div style={{ height: '100%', backgroundColor: '#04222D', borderRadius: '100px', width: '0%' }}></div>
                                </div>
                                <span style={{ 
                                    fontSize: '11.5px', 
                                    color: '#8E8E93', 
                                    fontWeight: 600, 
                                    alignSelf: 'flex-end', 
                                    fontFamily: 'Figtree, sans-serif' 
                                }}>
                                    0 of 4 steps done
                                </span>
                            </div>

                            <div style={{ height: '0.5px', backgroundColor: '#EAECEF' }}></div>

                            {/* Bottom CTA */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ 
                                    fontSize: '15px', 
                                    fontWeight: 700, 
                                    color: '#8E8E93', 
                                    fontFamily: 'Figtree, sans-serif' 
                                }}>
                                    Start Now
                                </span>
                                <ArrowRight size={18} color="#8E8E93" />
                            </div>

                            {/* Tooltip Overlay */}
                            {clickAttemptedStep2 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-48px',
                                    left: '20px',
                                    right: '20px',
                                    backgroundColor: '#04222D',
                                    color: '#FFFFFF',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 10,
                                    fontFamily: 'Figtree, sans-serif'
                                }}>
                                    Complete Step 1 (Package Setup) first to activate booking settings.
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col relative w-full min-h-screen">
            {/* Mount the scalable dynamic feature */}
            <PackageFlowManager vendorType={vendorType} onExitFlow={handleExitFlow} />
        </div>
    );
}
