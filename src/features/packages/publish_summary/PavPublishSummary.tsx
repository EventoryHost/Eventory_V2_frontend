'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info, ExternalLink, Image as ImageIcon, MapPin, Clock, Users, ShieldAlert, Sparkles, Plus, Check, Map, Camera, Video, BookOpen, MinusCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { EditableTotal } from '../components/EditableTotal';

interface PavPublishSummaryProps {
    packageId: string | null;
    packageData: any;
    allVariants: any[];
    onBack: () => void;
}

export default function PavPublishSummary({ packageId, packageData: initialPackageData, allVariants, onBack }: PavPublishSummaryProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const variants = allVariants && allVariants.length > 0 ? allVariants : [initialPackageData];
    const hasVariants = variants.length > 0;

    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]._id || initialPackageData._id);

    const packageData = variants.find(v => v._id === selectedVariantId) || initialPackageData;

    const isVariantIncomplete = (v: any) => {
        const hasName = !!(v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName);
        const hasPrice = v.step3_policiesAndCharges?.packagePricing?.price > 0 || v.step3_policiesAndCharges?.overallPriceOfPackage?.price > 0;
        const hasDeliverables = (v.step2_productsAndPricing?.packageItems?.length > 0) || (v.step2_productsAndPricing?.items?.length > 0) || (v.step2_productsAndPricing?.pavItems?.length > 0);
        return !(hasName && hasPrice && hasDeliverables);
    };

    const heroImage = packageData.step4_sampleMedia?.media?.[0]?.url || '';
    
    const pkgName = packageData.step1_eventAndCrew?.packageName || '';
    const categories = packageData.step1_eventAndCrew?.eventCategories || [];
    const duration = packageData.step1_eventAndCrew?.durationPerPerson || '';
    const teamSize = packageData.step1_eventAndCrew?.teamSize || '';
    
    const actualPrice = packageData.step3_policiesAndCharges?.packagePricing?.price || 0;
    const basePrice = actualPrice;

    const cities = packageData.step1_eventAndCrew?.cities?.join(', ') || '';

    // Deliverables Data
    const items = packageData.step2_productsAndPricing?.packageItems || packageData.step2_productsAndPricing?.items || [];
    const addons = packageData.step2_productsAndPricing?.addOns || [];
    const requirements: string[] = [];
    const venueNeedsObj = packageData.step1_eventAndCrew?.venueNeeds;
    let venueDescription = '';
    
    if (venueNeedsObj) {
        if (venueNeedsObj.power) requirements.push('Power points for lighting & charging');
        if (venueNeedsObj.ac) requirements.push('AC Room');
        if (venueNeedsObj.stage) requirements.push('Stage access');
        if (venueNeedsObj.lighting) requirements.push('Lighting clearance');
        if (venueNeedsObj.security) requirements.push('Security');
        
        if (venueNeedsObj.customText) {
            const customParts = venueNeedsObj.customText.split(',').map((s: string) => s.trim()).filter(Boolean);
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

    const renderItemOptions = (item: any, isPhotography: boolean, isVideography: boolean, isAlbum: boolean) => {
        const props = [];
        
        if (isPhotography || item.itemType === 'Photography' || (!isVideography && !isAlbum)) {
            props.push({ label: 'Photography Style', value: item.style || item.categories?.[0] || '-', extra: item.categories?.length > 1 ? `+${item.categories.length - 1}more` : '' });
            props.push({ label: 'No. of edited Photos', value: item.quantity || '-' });
            props.push({ label: 'Delivery Medium', value: item.deliveryMedium || '-' });
            props.push({ label: 'Delivery Timeline', value: item.deliveryTimeline || '-' });
            props.push({ label: 'Delivery Format', value: item.deliveryFormat || '-' });
        } else if (isVideography || item.itemType === 'Videography') {
            props.push({ label: 'Videography Style', value: item.style || item.categories?.[0] || '-', extra: item.categories?.length > 1 ? `+${item.categories.length - 1}more` : '' });
            props.push({ label: 'No. of Videos', value: item.quantity || '-' });
            props.push({ label: 'Duration of Videos', value: item.duration || '-' });
            props.push({ label: 'Delivery Timeline', value: item.deliveryTimeline || '-' });
            props.push({ label: 'Delivery Format', value: item.deliveryFormat || '-' });
            props.push({ label: 'Delivery Medium', value: item.deliveryMedium || '-' });
            props.push({ label: 'Resolution', value: item.resolution || '-' });
        } else if (isAlbum || item.itemType === 'Albums/Hardcopy' || item.itemType === 'Album') {
            props.push({ label: 'Album Type', value: item.style || item.categories?.[0] || '-', extra: item.categories?.length > 1 ? `+${item.categories.length - 1}more` : '' });
            props.push({ label: 'No. of Pages', value: item.pageCount || '-' });
            props.push({ label: 'Cover Type', value: item.coverType || '-' });
            props.push({ label: 'Page Finish', value: item.pageFinish || '-' });
            props.push({ label: 'Binding Type', value: item.bindingType || '-' });
            props.push({ label: 'Revision Included', value: item.revisionIncluded || '-' });
            props.push({ label: 'Delivery Timeline', value: item.deliveryTimeline || '-' });
        }

        return (
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4 text-left w-full">
                {props.map((p, i) => (
                    <div key={i}>
                        <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1 tracking-wider" style={{ fontFamily: 'Figtree, sans-serif' }}>{p.label}</p>
                        <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            {p.value} {p.extra && <span className="text-[#3B82F6]">{p.extra}</span>}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    // If no items exist, use mock data to match the screenshot
    const displayItems = items.length > 0 ? items : [];

    const displayAddons = addons.length > 0 ? addons : [];

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
                    <div className="relative rounded-[16px] mb-4 border border-[#E4E4E7] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="relative h-[180px] w-full bg-gray-100 rounded-t-[16px] overflow-hidden">
                            <img src={heroImage} alt="Package" className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                                <ExternalLink size={12} color="#FFFFFF" />
                                <span className="text-white text-[11px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>View as customer</span>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-white rounded-b-[16px]">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-[#FFFBEB] text-[#B45309] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-[#FEF3C7]">
                                    <Camera size={10} strokeWidth={3} />
                                    PHOTOGRAPHER
                                </span>
                                <span className="text-[#E4E4E7]">|</span>
                                <span className="text-[11px] font-semibold text-[#71717B]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {categories.slice(0,2).join(' • ')} {categories.length > 2 ? `+${categories.length-2} more` : 'Wedding • Mehendi +2 more'}
                                </span>
                            </div>

                            <h2 className="text-[16px] font-extrabold text-[#04222D] leading-tight mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {pkgName} {hasVariants ? `- ${packageData?.variantType || 'Premium'} Package` : ''}
                            </h2>

                            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                                <div className="flex items-center gap-1.5 text-[#71717B]">
                                    <Clock size={14} />
                                    <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{duration}hrs</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#71717B]">
                                    <Clock size={14} />
                                    <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Team size: {teamSize}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#F4F4F5] pt-5 mt-5 mb-4">
                                <p className="text-[10px] text-[#A1A1AA] font-bold tracking-widest uppercase mb-0.5">STARTING FROM</p>
                                <div className="flex items-baseline gap-1">
                                    <EditableTotal packageId={selectedVariantId} vendorType="PAV" initialPrice={basePrice || 0} />
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

                    <div className="flex items-center gap-1 mb-2 px-1">
                        <span className="text-[13px] font-bold text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>View full customer preview</span>
                        <ArrowLeft size={16} color="#04222D" className="rotate-180" />
                    </div>
                </div>

                {/* Deliverable Items Section */}
                <div className="px-5 mt-6">
                    <p className="text-[14px] font-bold text-[#04222D] m-0 mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>Deliverable Items</p>
                    <div className="border border-[#E4E4E7] rounded-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4">
                        {displayItems.length > 0 ? displayItems.map((item: any, idx: number) => {
                            const isPhoto = item.mockType === 'photo' || item.itemType === 'Photography';
                            const isVideo = item.mockType === 'video' || item.itemType === 'Videography';
                            const isAlbum = item.mockType === 'album' || item.itemType === 'Albums/Hardcopy' || item.itemType === 'Album';
                            
                            return (
                                <div key={idx} className={`${idx !== displayItems.length - 1 ? 'border-b border-dashed border-[#E4E4E7] pb-6 mb-6' : ''}`}>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {isPhoto ? <Camera size={14} color="#71717B" /> : isVideo ? <Video size={14} color="#71717B" /> : <BookOpen size={14} color="#71717B" />}
                                            <span className="text-[10px] font-medium text-[#71717B] capitalize">{item.itemType || ''}</span>
                                        </div>
                                        <h4 className="text-[13px] font-extrabold text-[#04222D] uppercase tracking-wide m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            {item.name || item.itemType || ''}
                                        </h4>
                                    </div>
                                    {renderItemOptions(item, isPhoto, isVideo, isAlbum)}
                                </div>
                            );
                        }) : (
                            <p className="text-[13px] text-[#71717B] text-center italic py-4">No deliverables added to this package.</p>
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
                        {displayAddons.length > 0 ? displayAddons.map((addon: any, idx: number) => (
                            <div key={idx} className="border border-[#E4E4E7] rounded-xl p-3 bg-white shadow-sm flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            {addon.mediaUrls?.[0] ? (
                                                <img src={addon.mediaUrls[0]} alt={addon.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#F4F4F5]">
                                                    <Camera size={16} color="#A1A1AA" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#04222D] leading-tight m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.name || ''}</p>
                                            <p className="text-[11px] text-[#A1A1AA] font-medium m-0 mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.category || ''}</p>
                                            <p className="text-[13px] font-extrabold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>₹ {addon.price}</p>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full border border-[#04222D] flex items-center justify-center cursor-not-allowed">
                                        <MinusCircle size={16} color="#04222D" strokeWidth={1.5} />
                                    </div>
                                </div>
                                {addon.extraProps && addon.extraProps.length > 0 && (
                                    <>
                                        <div className="h-[1px] border-b border-dashed border-[#E4E4E7] w-full my-3"></div>
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                            {addon.extraProps.map((ep: any, i: number) => (
                                                <div key={i}>
                                                    <p className="text-[10px] text-[#A1A1AA] font-semibold mb-0.5 tracking-wider" style={{ fontFamily: 'Figtree, sans-serif' }}>{ep.label}</p>
                                                    <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{ep.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )) : (
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
                            <div key={idx} className="bg-[#04222D] text-white px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {req}
                            </div>
                        ))}
                    </div>
                    
                    {venueDescription && (
                        <div className="bg-[#F4F4F5] p-4 rounded-[12px]">
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
                                <hr className="border-t border-[#F4F4F5] my-5" />
                                <p className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>IMPROVE YOUR PACKAGE</p>
                                <ul className="pl-4 m-0 space-y-2">
                                    {numImages < 5 && (
                                        <li className="text-[12px] text-[#71717B] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            Adding at least 5 high-quality images increases booking chances by 40%.
                                        </li>
                                    )}
                                    {!hasAddons && (
                                        <li className="text-[12px] text-[#71717B] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            Packages with optional add-ons (like 'Hair Styling') see higher average order values.
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3 bg-[#F4F4F5] p-4 rounded-[12px] border border-[#E4E4E7]">
                        <ShieldAlert size={20} color="#71717B" className="shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#71717B] font-medium leading-relaxed m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
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
            <div className="fixed bottom-[72px] left-0 right-0 p-5 bg-white border-t border-[#E4E4E7] z-30 mx-auto max-w-[448px] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                <button
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="w-full bg-[#04222D] hover:bg-[#063344] text-white py-[16px] rounded-[12px] font-medium text-[15px] flex justify-center items-center gap-2 transition-all shadow-sm disabled:opacity-70"
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                >
                    {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>Save & Next</>
                    )}
                </button>
            </div>
        </div>
    );
}
