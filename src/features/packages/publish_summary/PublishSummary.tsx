'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Package as PackageIcon, CalendarDays, Wallet, BadgeCheck } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface PublishSummaryProps {
    packageId: string | null;
    onBack: () => void;
}

export default function PublishSummary({ packageId, onBack }: PublishSummaryProps) {
    const router = useRouter();
    const [packageData, setPackageData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPackageDetails = async () => {
            if (!packageId) return;
            try {
                const res = await fetch(apiUrl(`/packages/${packageId}`));
                const data = await res.json();
                if (data.status === 'SUCCESS') {
                    setPackageData(data.package);
                } else {
                    setError('Failed to load package details');
                }
            } catch (err) {
                console.error(err);
                setError('Error fetching package details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackageDetails();
    }, [packageId]);

    const handleSubmitForReview = async () => {
        if (!packageId) return;
        setIsSubmitting(true);
        setError('');
        
        try {
            const res = await fetch(apiUrl(`/packages/${packageId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageStatus: 'Under Review' })
            });

            if (!res.ok) throw new Error('Failed to submit package for review.');

            alert("Package successfully submitted for review!");
            router.push('/dashboard/inventory');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-[#F9FAF9]">
                <div className="w-10 h-10 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!packageData) {
        return (
            <div className="flex-1 p-8 text-center bg-[#F9FAF9]">
                <p className="text-red-500 font-medium">Could not load package data.</p>
                <button onClick={onBack} className="mt-4 text-[#04222D] underline font-medium">Go back</button>
            </div>
        );
    }

    const pkgName = packageData.step1_eventAndCrew?.packageName || packageData.step1_basicDetails?.packageName || packageData.step1_brandAndTheme?.packageName || 'Untitled Package';
    const pkgPrice = packageData.step3_pricing?.basePrice || 0;

    return (
        <div className="flex flex-col min-h-screen bg-[#F9FAF9] max-w-[448px] mx-auto w-full shadow-[0_0_20px_rgba(0,0,0,0.02)]">
            
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-white border-b-2 border-[#F4F4F5] sticky top-0 z-10">
                <button 
                    onClick={onBack} 
                    className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={isSubmitting}
                >
                    <ArrowLeft size={24} color="#04222D" />
                </button>
                <h1 className="text-[20px] font-extrabold text-[#04222D] tracking-tight m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    Publish Summary
                </h1>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-5 pb-32 overflow-y-auto">
                <div className="flex flex-col gap-5">
                    
                    {/* Hero Success Icon */}
                    <div className="bg-[#E0F2FE] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <BadgeCheck size={56} color="#0EA5E9" className="mb-3" />
                        <h2 className="text-[18px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>You're Almost Done!</h2>
                        <p className="text-[14px] text-[#3F3F46] mt-2 leading-relaxed" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Your package looks great. Review the high-level details below and submit it for our team's quick approval.
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white rounded-[20px] p-5 border border-[#E4E4E7] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {pkgName}
                                </h3>
                                <p className="text-[13px] font-semibold text-[#71717B] mt-1 flex items-center gap-1.5" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    <span className="bg-[#F4F4F5] px-2 py-0.5 rounded-full uppercase text-[10px] tracking-wider text-[#3F3F46]">
                                        {packageData.vendorType || 'VENDOR'}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[20px] font-extrabold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    ₹{pkgPrice.toLocaleString('en-IN')}
                                </span>
                                <p className="text-[11px] text-[#71717B] m-0 uppercase font-bold tracking-wide">Starting Price</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                                    <PackageIcon size={18} color="#04222D" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[14px] font-bold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Package Details</p>
                                    <p className="text-[13px] text-[#71717B] m-0 truncate" style={{ fontFamily: 'Figtree, sans-serif' }}>All items & pricing configured</p>
                                </div>
                                <CheckCircle2 size={18} color="#22C55E" />
                            </div>

                            <div className="h-[1px] bg-[#F4F4F5] w-full" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                                    <CalendarDays size={18} color="#04222D" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[14px] font-bold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Availability & Schedule</p>
                                    <p className="text-[13px] text-[#71717B] m-0 truncate" style={{ fontFamily: 'Figtree, sans-serif' }}>Booking window set</p>
                                </div>
                                <CheckCircle2 size={18} color="#22C55E" />
                            </div>

                            <div className="h-[1px] bg-[#F4F4F5] w-full" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                                    <Wallet size={18} color="#04222D" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[14px] font-bold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Payment & Cancellation</p>
                                    <p className="text-[13px] text-[#71717B] m-0 truncate" style={{ fontFamily: 'Figtree, sans-serif' }}>Policies actively applied</p>
                                </div>
                                <CheckCircle2 size={18} color="#22C55E" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[13px] font-medium border border-red-100">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#F4F4F5] pb-safe z-20 mx-auto max-w-[448px]">
                <button
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="w-full bg-[#04222D] hover:bg-[#063344] text-white py-[16px] rounded-2xl font-bold text-[16px] flex justify-center items-center gap-2 transition-all shadow-[0_8px_20px_rgba(4,34,45,0.15)] disabled:opacity-70"
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                >
                    {isSubmitting ? (
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>Submit Package for Review</>
                    )}
                </button>
                <p className="text-center text-[12px] text-[#71717B] mt-3 mb-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    Our quality team will review your package shortly.
                </p>
            </div>
        </div>
    );
}
