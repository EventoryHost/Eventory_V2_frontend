'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info, ExternalLink, Image as ImageIcon, MapPin, Clock, Users, ShieldAlert, Sparkles, Plus, Check, Map } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { EditableTotal } from '../components/EditableTotal';

interface MakeupPublishSummaryProps {
    packageId: string | null;
    packageData: any;
    allVariants: any[];
    onBack: () => void;
}

export default function MakeupPublishSummary({ packageId, packageData: initialPackageData, allVariants, onBack }: MakeupPublishSummaryProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Accordion states
    const [deliverablesExpanded, setDeliverablesExpanded] = useState(false);
    const [addonsExpanded, setAddonsExpanded] = useState(false);
    const [venueNeedsExpanded, setVenueNeedsExpanded] = useState(false);

    const variants = allVariants && allVariants.length > 0 ? allVariants : [initialPackageData];
    const hasVariants = variants.length > 0;

    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]._id || initialPackageData._id);

    const packageData = variants.find(v => v._id === selectedVariantId) || initialPackageData;

    const isVariantIncomplete = (v: any) => {
        const hasName = !!(v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName);
        const hasPrice = v.step3_policiesAndCharges?.packagePricing?.price > 0 || v.step3_policiesAndCharges?.overallPriceOfPackage?.price > 0;
        const hasDeliverables = v.step2_productsAndPricing?.items?.length > 0 || v.step2_productsAndPricing?.makeupItems?.length > 0;
        return !(hasName && hasPrice && hasDeliverables);
    };

    const heroImage = packageData.step4_sampleMedia?.media?.[0]?.url || '';
    
    const pkgName = packageData.step1_eventAndCrew?.packageName || '';
    const categories = packageData.step1_eventAndCrew?.eventCategories || [];
    const duration = packageData.step1_eventAndCrew?.durationPerPerson || '';
    const minPpl = packageData.step1_eventAndCrew?.minPeople || '';
    const maxPpl = packageData.step1_eventAndCrew?.maxPeople || '';
    const teamSize = packageData.step1_eventAndCrew?.teamSize || '';
    
    const actualPrice = packageData.step3_policiesAndCharges?.packagePricing?.price || 0;
    const basePrice = actualPrice;

    const cities = packageData.step1_eventAndCrew?.cities?.join(', ') || '';

    // Deliverables Data
    const items = packageData.step2_productsAndPricing?.items || [];
    const addons = packageData.step2_productsAndPricing?.addOns || [];
    const requirements: string[] = [];
    const venueNeedsObj = packageData.step1_eventAndCrew?.venueNeeds;
    let venueDescription = '';
    
    if (venueNeedsObj) {
        if (venueNeedsObj.power) requirements.push('Power');
        if (venueNeedsObj.ac) requirements.push('AC');
        if (venueNeedsObj.stage) requirements.push('Stage');
        if (venueNeedsObj.lighting) requirements.push('Lighting');
        if (venueNeedsObj.security) requirements.push('Security');
        
        if (venueNeedsObj.customText) {
            // customText might be just custom tags, or it might contain a paragraph.
            // For now, if it's long, we treat it as a description, else we split it into tags.
            // But since MakeupFlow joins custom tags AND venueRequest by comma, we just split it.
            const customParts = venueNeedsObj.customText.split(',').map((s: string) => s.trim()).filter(Boolean);
            
            // Check if there is a long paragraph among the parts
            const longParts = customParts.filter((p: string) => p.length > 30);
            const shortParts = customParts.filter((p: string) => p.length <= 30);
            
            requirements.push(...shortParts);
            if (longParts.length > 0) {
                venueDescription = longParts.join('. ');
            }
        }
    }

    const allRequirements = requirements;

    // Package Strength Calculation
    const hasPricing = (basePrice > 0);
    const hasDeliverables = (items.length > 0);
    const numImages = packageData.step4_sampleMedia?.media?.length || 0;
    const hasAddons = (addons.length > 0);
    
    let strengthScore = 0;
    if (hasPricing) strengthScore += 3;
    if (hasDeliverables) strengthScore += 3;
    if (numImages >= 5) strengthScore += 2;
    else if (numImages > 0) strengthScore += 1;
    if (hasAddons) strengthScore += 2;

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

    const renderItemOptions = (item: any) => {
        // Mocking the specific labels based on UI, mapping to the backend 'options' and 'brands'
        const typeLabel = item.itemType === 'Hair' ? 'Hair Service Type' :
                          item.itemType === 'Skin & Spa' ? 'Skin Service Type' :
                          item.itemType === 'Mehendi' ? 'Mehendi Style' :
                          item.itemType === 'Nail' ? 'Nail Service Style' : 'Makeup Type';
                          
        const brandLabel = item.itemType === 'Hair' ? 'Colour' : 
                           item.itemType === 'Mehendi' ? 'Coverage' :
                           item.itemType === 'Nail' ? 'Design Complexity' : 'Brand';
                           
        const extraLabel1 = item.itemType === 'Hair' ? 'Styling' :
                            item.itemType === 'Skin & Spa' ? 'Wax Type' : 'Brand Origin';
                            
        const extraLabel2 = item.itemType === 'Skin & Spa' || item.itemType === 'Makeup' ? 'Longevity' : '';

        const typeValue = item.options?.[0]?.name || '';
        const typeMore = item.options?.length > 1 ? `+${item.options.length - 1}more` : '';
        
        const brandValue = item.brands?.[0]?.name || '';
        const brandMore = item.brands?.length > 1 ? `+${item.brands.length - 1}more` : '';

        return (
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4">
                <div>
                    <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{typeLabel}</p>
                    <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                        {typeValue} {typeMore && <span className="text-[#3B82F6]">{typeMore}</span>}
                    </p>
                </div>
                
                <div>
                    <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{extraLabel1}</p>
                    <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                        {item.itemType === 'Hair' ? 'Buns' : 'International & Indian'} {item.itemType === 'Hair' && <span className="text-[#3B82F6]">+4more</span>}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{brandLabel}</p>
                    <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                        {brandValue} {brandMore && <span className="text-[#3B82F6]">{brandMore}</span>}
                    </p>
                </div>
                
                {extraLabel2 && (
                    <div>
                        <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{extraLabel2}</p>
                        <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>Upto 4 hours</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F9FAF9] max-w-[448px] mx-auto w-full shadow-[0_0_20px_rgba(0,0,0,0.02)]">
            
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-white border-b border-[#F4F4F5] sticky top-0 z-20">
                <button onClick={onBack} disabled={isSubmitting} className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} color="#04222D" />
                </button>
                <h1 className="text-[18px] font-extrabold text-[#04222D] tracking-tight m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    Publish your package
                </h1>
            </div>

            <div className="flex-1 bg-white pb-48">
                {/* Variants Header */}
                {hasVariants && (
                    <div className="px-5 pt-4">
                        <p className="text-[13px] font-bold text-[#04222D] mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>Variants</p>
                        <div className="inline-flex max-w-full bg-[#F9FAF9] p-1 rounded-xl border border-[#F4F4F5] overflow-x-auto gap-1">
                            {variants.map((v: any) => {
                                const variantName = v.variantType || v.step1_eventAndCrew?.packageName || 'Untitled Variant';
                                const incomplete = isVariantIncomplete(v);
                                return (
                                    <button
                                        key={v._id}
                                        onClick={() => setSelectedVariantId(v._id)}
                                        className={`flex-none min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                                            selectedVariantId === v._id 
                                            ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#04222D] border border-[#E4E4E7]' 
                                            : 'text-[#71717B] hover:text-[#04222D] border border-transparent'
                                        }`}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                    >
                                        {incomplete && (
                                            <div className="w-4 h-4 rounded-full bg-[#F97316] flex items-center justify-center">
                                                <span className="text-white text-[10px] font-bold">!</span>
                                            </div>
                                        )}
                                        {variantName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Hero Card */}
                <div className="px-5 pt-3">
                    <div className="relative rounded-[16px] overflow-hidden mb-4 border border-[#E4E4E7] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="relative h-[180px] w-full bg-gray-100">
                            <img src={heroImage} alt="Package" className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                                <ExternalLink size={12} color="#FFFFFF" />
                                <span className="text-white text-[11px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>View as customer</span>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-[#FFF1F2] text-[#BE123C] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-[#FECDD3]">
                                    💄 MAKEUP ARTIST
                                </span>
                                <span className="text-[#E4E4E7]">|</span>
                                <span className="text-[11px] font-semibold text-[#71717B]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {categories.slice(0,2).join(' • ')} {categories.length > 2 ? `+${categories.length-2} more` : ''}
                                </span>
                            </div>

                            <h2 className="text-[16px] font-extrabold text-[#04222D] leading-tight mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {pkgName} {hasVariants ? `- ${packageData?.variantType || 'Premium'} Package` : ''}
                            </h2>

                            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                                <div className="flex items-center gap-1.5 text-[#71717B]">
                                    <Clock size={14} />
                                    <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{duration}hrs/person</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#71717B]">
                                    <Users size={14} />
                                    <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{minPpl}-{maxPpl} people/event</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#71717B] w-full mt-1">
                                    <span className="w-3.5 h-3.5 border border-current rounded-full flex items-center justify-center text-[8px] font-bold">3</span>
                                    <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Team size: {teamSize}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#F4F4F5] pt-5 mt-5 mb-4">
                                <p className="text-[10px] text-[#A1A1AA] font-bold tracking-widest uppercase mb-0.5">STARTING FROM</p>
                                <div className="flex items-baseline gap-1">
                                    <EditableTotal packageId={selectedVariantId} vendorType="Makeup" initialPrice={basePrice || 0} />
                                    <span className="text-[14px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>/event</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <Map size={16} color="#04222D" className="shrink-0" />
                                <span className="text-[13px] font-medium text-[#04222D] truncate" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {cities}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[13px] font-bold text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>View full customer preview</span>
                        <ArrowLeft size={16} color="#04222D" className="rotate-180" />
                    </div>
                </div>

                {/* Deliverable Items Section */}
                <div className="px-5 mt-6">
                    <div className="border border-[#E4E4E7] rounded-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4">
                        {items.map((item: any, idx: number) => (
                            <div key={idx} className={`${idx !== items.length - 1 ? 'border-b border-dashed border-[#E4E4E7] pb-5 mb-5' : ''}`}>
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[12px]">
                                            {item.itemType === 'Makeup' ? '💄' : item.itemType === 'Hair' ? '💇‍♀️' : item.itemType === 'Skin & Spa' ? '💆‍♀️' : item.itemType === 'Mehendi' ? '🌺' : '💅'}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#71717B] uppercase tracking-wider">{item.itemType}</span>
                                    </div>
                                    <h4 className="text-[13px] font-extrabold text-[#04222D] uppercase tracking-wide m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                        {item.name || `${item.itemType} Service`}
                                    </h4>
                                </div>
                                {renderItemOptions(item)}
                            </div>
                        ))}
                        {items.length === 0 && (
                            <p className="text-[13px] text-[#71717B] text-center italic py-4">No items added to this package.</p>
                        )}
                    </div>
                </div>

                {/* Add-ons Section */}
                <div className="px-5 mt-6">
                    <div className="flex items-center gap-1 mb-3">
                        <p className="text-[14px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Add-ons</p>
                        <span className="text-red-500 font-bold">*</span>
                    </div>
                    
                    <div className="space-y-3">
                        {addons.map((addon: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between border border-[#E4E4E7] rounded-xl p-3 bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {addon.mediaUrls?.[0] ? (
                                            <img src={addon.mediaUrls[0]} alt={addon.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#04222D] leading-tight m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.name}</p>
                                        <p className="text-[11px] text-[#A1A1AA] font-medium m-0 mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.category || ''}</p>
                                        <p className="text-[13px] font-extrabold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>₹ {addon.price}</p>
                                    </div>
                                </div>
                                <div className="w-6 h-6 rounded-full border border-[#D4D4D8] flex items-center justify-center cursor-not-allowed">
                                    <div className="w-2.5 h-[1.5px] bg-[#04222D]"></div>
                                </div>
                            </div>
                        ))}
                        {addons.length === 0 && (
                            <div className="border border-[#E4E4E7] border-dashed rounded-xl p-4 text-center bg-[#FAFAFA]">
                                <p className="text-[13px] text-[#71717B] font-medium m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>No add-ons included.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Needs from Venue Section */}
                <div className="px-5 mt-6">
                    <div className="flex items-center gap-1 mb-3">
                        <p className="text-[14px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Needs from Venue</p>
                        <span className="text-red-500 font-bold">*</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {allRequirements.map((req: string, idx: number) => (
                            <div key={idx} className="bg-[#04222D] text-white px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {req}
                            </div>
                        ))}
                        {allRequirements.length === 0 && (
                            <p className="text-[13px] text-[#71717B] italic">No specific requirements added.</p>
                        )}
                    </div>
                    
                    {venueDescription && (
                        <div className="bg-[#F4F4F5] p-3.5 rounded-xl">
                            <p className="text-[12.5px] text-[#3F3F46] leading-relaxed m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {venueDescription}
                            </p>
                        </div>
                    )}
                </div>

                {/* Improve your Package */}
                <div className="px-5 mt-8">
                    <div className="flex items-center gap-1 mb-3">
                        <p className="text-[14px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Improve your Package</p>
                        <span className="text-red-500 font-bold">*</span>
                    </div>
                    
                    <ul className="pl-4 m-0 mb-6 space-y-2">
                        <li className="text-[12px] text-[#71717B] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Adding at least 5 high-quality images increases booking chances by 40%.
                        </li>
                        <li className="text-[12px] text-[#71717B] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Packages with optional add-ons (like 'Hair Styling') see higher average order values.
                        </li>
                    </ul>

                    {/* Package Strength Card */}
                    <div className="bg-[#F9FAF9] border border-[#E4E4E7] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <h3 className="text-[16px] font-bold text-[#000000] mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>Your package strength</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[13px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>{strengthScore}/10</span>
                            <span className="text-[13px] text-[#71717B] font-medium">— {strengthScore >= 8 ? 'Very Strong' : strengthScore >= 6 ? 'Strong' : 'Average'}</span>
                        </div>
                        
                        <div className="w-full bg-[#E4E4E7] h-1.5 rounded-full mb-6">
                            <div className="bg-[#000000] h-full rounded-full" style={{ width: `${(strengthScore / 10) * 100}%` }}></div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[#F4F4F5] shadow-sm">
                                <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                </div>
                                <span className="text-[13px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>Pricing completed</span>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[#F4F4F5] shadow-sm">
                                <div className={`w-5 h-5 rounded-full ${hasDeliverables ? 'bg-[#22C55E]' : 'bg-[#F97316]'} flex items-center justify-center shrink-0`}>
                                    {hasDeliverables ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : <span className="text-white font-bold text-[12px]">!</span>}
                                </div>
                                <span className="text-[13px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {hasDeliverables ? 'Deliverables added' : 'No deliverables added'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[#F4F4F5] shadow-sm">
                                <div className={`w-5 h-5 rounded-full ${numImages >= 5 ? 'bg-[#22C55E]' : 'bg-[#F97316]'} flex items-center justify-center shrink-0`}>
                                    {numImages >= 5 ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : <span className="text-white font-bold text-[12px]">!</span>}
                                </div>
                                <span className="text-[13px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {numImages >= 5 ? `${numImages} images added` : `Only ${numImages} images added`}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[#F4F4F5] shadow-sm">
                                <div className={`w-5 h-5 rounded-full ${hasAddons ? 'bg-[#22C55E]' : 'bg-[#F97316]'} flex items-center justify-center shrink-0`}>
                                    {hasAddons ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : <span className="text-white font-bold text-[12px]">!</span>}
                                </div>
                                <span className="text-[13px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {hasAddons ? 'Add-ons included' : 'No add-ons included'}
                                </span>
                            </div>
                        </div>

                        {strengthScore < 10 && (
                            <>
                                <p className="text-[11px] font-bold text-[#71717B] tracking-wider mb-3">IMPROVE YOUR PACKAGE</p>
                                <ul className="pl-4 m-0 space-y-2">
                                    {numImages < 5 && (
                                        <li className="text-[12px] text-[#3F3F46] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            Adding at least 5 high-quality images increases booking chances by 40%.
                                        </li>
                                    )}
                                    {!hasAddons && (
                                        <li className="text-[12px] text-[#3F3F46] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            Packages with optional add-ons (like 'Hair Styling') see higher average order values.
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-3 bg-[#F4F4F5] p-4 rounded-[12px] border border-[#E4E4E7]">
                        <ShieldAlert size={20} color="#71717B" className="shrink-0" />
                        <p className="text-[11px] text-[#71717B] font-medium leading-relaxed m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Reviewed by Event Manager before going live. Takes ~2–4 business hours
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mx-5 mt-5 bg-red-50 text-red-600 p-3 rounded-lg text-[13px] font-medium border border-red-100 text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Bottom CTA Fixed */}
            <div className="fixed bottom-[72px] left-0 right-0 p-5 bg-white border-t border-[#E4E4E7] flex items-center gap-3 z-30 mx-auto max-w-[448px] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex-1 bg-white border border-[#D4D4D8] text-[#04222D] py-[16px] rounded-2xl font-bold text-[15px] flex justify-center items-center transition-all disabled:opacity-50"
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                >
                    Back
                </button>
                <button
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="flex-[1.5] bg-[#04222D] hover:bg-[#063344] text-white py-[16px] rounded-2xl font-bold text-[15px] flex justify-center items-center gap-2 transition-all shadow-[0_8px_20px_rgba(4,34,45,0.15)] disabled:opacity-70"
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                >
                    {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>Submit for Review</>
                    )}
                </button>
            </div>
        </div>
    );
}
