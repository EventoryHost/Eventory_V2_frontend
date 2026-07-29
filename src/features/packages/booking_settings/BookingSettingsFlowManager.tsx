'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import Step1BookingType from './Step1BookingType';
import Step2Availability from './Step2Availability';
import Step3PaymentMilestones from './Step3PaymentMilestones';
import Step4BookingCapacity from './Step4BookingCapacity';

interface BookingSettingsFlowManagerProps {
    packageId: string | null;
    onExitFlow: () => void;
}

export default function BookingSettingsFlowManager({ packageId, onExitFlow }: BookingSettingsFlowManagerProps) {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [packageData, setPackageData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Number of steps specific to Booking Settings
    const totalSteps = 4;

    useEffect(() => {
        if (!packageId) return;

        const fetchPackage = async () => {
            setLoading(true);
            try {
                const res = await fetch(apiUrl(`/packages/${packageId}`));
                if (res.ok) {
                    const data = await res.json();
                    const pkg = data.package || data;
                    setPackageData(pkg);
                    
                    // Map backend steps (5: bookingSettings, 7: availabilitySettings, 6: paymentMilestones, 8: bookingCapacity)
                    const completed = pkg.completedSteps || [];
                    if (!completed.includes(5)) {
                        setCurrentStep(1);
                    } else if (!completed.includes(7)) {
                        setCurrentStep(2);
                    } else if (!completed.includes(6)) {
                        setCurrentStep(3);
                    } else if (!completed.includes(8)) {
                        setCurrentStep(4);
                    } else {
                        setCurrentStep(1); // All completed, open step 1 for editing
                    }
                }
            } catch (error) {
                console.error("Error loading package details for booking settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [packageId]);

    const getStepTitle = (step: number) => {
        switch (step) {
            case 1: return 'Booking Type';
            case 2: return 'Availability';
            case 3: return 'Payment Milestones';
            case 4: return 'Booking Capacity';
            default: return 'Booking Settings';
        }
    };

    // Calculate dynamic progress across the 4 steps
    const progressPercentage = (currentStep / totalSteps) * 100;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="w-8 h-8 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
            
            {/* Header matching Package Setup styling */}
            <div className="flex-none bg-white p-6 md:p-8 flex items-center justify-between sticky top-0 z-10">
                <button 
                    onClick={onExitFlow}
                    className="flex items-center gap-2 text-[#04222D] hover:text-black transition-colors"
                >
                    <ArrowLeft size={24} />
                    <span className="text-[22px] font-bold" style={{ fontFamily: 'Figtree, sans-serif' }}>
                        Booking Settings
                    </span>
                </button>
            </div>
            
            <div className="flex-none h-[1px] bg-[#E4E4E7] w-full" />

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto w-full relative">
                <div className="max-w-[800px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32">
                    
                    {/* Progress indicator matching Package Setup */}
                    <div className="w-full flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[12px] font-bold text-[#A1A1AA] tracking-wide" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                STEP {currentStep} OF {totalSteps}
                            </span>
                            <h2 className="text-[24px] font-bold text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {getStepTitle(currentStep)}
                            </h2>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full max-w-[480px]">
                            <div className="flex-1 h-2.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#04222D] rounded-full transition-all duration-300" 
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-none h-[1px] bg-[#E4E4E7] w-full max-w-[480px]" />

                    {/* Step Components */}
                    <div className="w-full">
                        {currentStep === 1 ? (
                            <Step1BookingType
                                packageId={packageId}
                                initialData={packageData?.bookingSettings}
                                onNext={() => {
                                    setCurrentStep(2);
                                }}
                                onBack={() => {
                                    if (onExitFlow) onExitFlow();
                                }}
                            />
                        ) : currentStep === 2 ? (
                            <Step2Availability
                                packageId={packageId}
                                initialData={packageData?.availabilitySettings}
                                onBack={() => setCurrentStep(1)}
                                onNext={() => {
                                    setCurrentStep(3);
                                }}
                            />
                        ) : currentStep === 3 ? (
                            <Step3PaymentMilestones
                                packageId={packageId}
                                initialData={packageData?.paymentMilestones}
                                packageData={packageData}
                                onBack={() => setCurrentStep(2)}
                                onNext={() => {
                                    setCurrentStep(4);
                                }}
                            />
                        ) : currentStep === 4 ? (
                            <Step4BookingCapacity
                                packageId={packageId}
                                initialData={packageData?.bookingCapacity}
                                onBack={() => setCurrentStep(3)}
                                onNext={() => {
                                    onExitFlow();
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
