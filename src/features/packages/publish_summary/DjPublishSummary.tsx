import React, { useState } from 'react';
import { Check, ShieldAlert, ChevronLeft, MapPin, CheckCircle2, Clock, Users, User, Music, Disc, MinusCircle, Minus, Plus, Map } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { EditableTotal } from '../components/EditableTotal';

interface DjPublishSummaryProps {
    packageId: string | null;
    packageData: any;
    allVariants: any[];
    onBack: () => void;
}

export default function DjPublishSummary({ packageId, packageData: initialPackageData, allVariants, onBack }: DjPublishSummaryProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const variants = allVariants && allVariants.length > 0 ? allVariants : [initialPackageData];
    const hasVariants = variants.length > 0;

    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]._id || initialPackageData._id);

    const packageData = variants.find(v => v._id === selectedVariantId) || initialPackageData;

    const isVariantIncomplete = (v: any) => {
        const hasName = !!(v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName);
        const hasPrice = v.step3_pricing?.price > 0 || v.step3_policiesAndCharges?.packagePricing?.price > 0 || v.step3_policiesAndCharges?.overallPriceOfPackage?.price > 0;
        const hasDeliverables = v.step2_productsAndPricing?.items?.length > 0 || v.step2_productsAndPricing?.playlists?.length > 0 || v.step2_productsAndPricing?.equipment?.length > 0;
        return !(hasName && hasPrice && hasDeliverables);
    };

    const pkgName = packageData.step1_eventAndCrew?.packageName || '';
    const eventCategories = packageData.step1_eventAndCrew?.eventCategories || [];
    
    // Media
    const media = packageData.step4_sampleMedia?.media || [];
    const mainImage = media.length > 0 ? media[0].url : 'https://dkuacgndftndz.cloudfront.net/inventory-page/dj-placeholder.png'; // fallback

    // Stats
    const minHours = packageData.step1_eventAndCrew?.duration?.minHours;
    const maxHours = packageData.step1_eventAndCrew?.duration?.maxHours;
    const minGuests = packageData.step1_eventAndCrew?.capacity?.minGuests;
    const maxGuests = packageData.step1_eventAndCrew?.capacity?.maxGuests;
    const teamSize = packageData.step1_eventAndCrew?.crewSize?.minPeople;

    // Pricing
    const actualPrice = packageData.step3_pricing?.price || 0;
    const basePrice = actualPrice;

    const cities = packageData.step1_eventAndCrew?.cities?.join(', ') || '';

    // Deliverables Data
    const items = packageData.step2_productsAndPricing?.items || [];
    const playlists = packageData.step2_productsAndPricing?.playlists || [];
    const equipments = packageData.step2_productsAndPricing?.equipment || [];
    const addons = packageData.step2_productsAndPricing?.addOns || [];
    
    // Venue Needs
    const requirements: string[] = [];
    const venueNeedsObj = packageData.step1_eventAndCrew?.venueNeeds;
    let venueDescription = '';
    
    if (venueNeedsObj) {
        if (venueNeedsObj.power) requirements.push('Power Supply');
        if (venueNeedsObj.ac) requirements.push('AC');
        if (venueNeedsObj.stage) requirements.push('Stage');
        if (venueNeedsObj.lighting) requirements.push('Lighting');
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
    const numImages = media.length;
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
            const token = localStorage.getItem('vendor_token');
            const res = await fetch(apiUrl(`/packages/${packageId}/submit`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to submit package');
            }

            const activePackages = JSON.parse(localStorage.getItem('active_packages') || '{}');
            delete activePackages['DJ'];
            localStorage.setItem('active_packages', JSON.stringify(activePackages));

            router.push('/dashboard/inventory');
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F9FAF9] max-w-[448px] mx-auto w-full shadow-[0_0_20px_rgba(0,0,0,0.02)] relative">
            
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-white border-b-2 border-[#F4F4F5] sticky top-0 z-40 shadow-sm">
                <button 
                    onClick={onBack} 
                    className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={isSubmitting}
                >
                    <ChevronLeft size={24} color="#04222D" />
                </button>
                <h1 className="text-[20px] font-extrabold text-[#04222D] tracking-tight m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
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
                <div className="px-5 py-4">
                    <div className="bg-white rounded-[20px] border border-[#E4E4E7] shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="relative h-[180px] w-full bg-gray-100">
                            <img src={mainImage} alt={pkgName} className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-black/80 transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                <span className="text-white text-[10px] font-bold tracking-wide uppercase" style={{ fontFamily: 'Figtree, sans-serif' }}>View as customer</span>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center gap-1 bg-[#F5F3FF] text-[#6D28D9] px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#EDE9FE]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    <Disc size={10} strokeWidth={3} />
                                    DJ ARTIST
                                </span>
                                <span className="text-[#E4E4E7]">|</span>
                                <span className="text-[12px] font-medium text-[#71717B] truncate" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {eventCategories.slice(0,2).join(' • ')} {eventCategories.length > 2 && `+${eventCategories.length-2} more`}
                                </span>
                            </div>

                            <h2 className="text-[18px] font-bold text-[#04222D] leading-snug mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {pkgName} {hasVariants ? `- ${packageData?.variantType || 'Premium'} Package` : ''}
                            </h2>

                            <div className="grid grid-cols-2 gap-y-3 mb-5">
                                {(minHours || maxHours) && (
                                    <div className="flex items-center gap-2 text-[#71717B]">
                                        <Clock size={14} />
                                        <span className="text-[13px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{minHours}-{maxHours}hrs performance</span>
                                    </div>
                                )}
                                {(minGuests || maxGuests) && (
                                    <div className="flex items-center gap-2 text-[#71717B]">
                                        <Users size={14} />
                                        <span className="text-[13px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{minGuests}-{maxGuests} Guest</span>
                                    </div>
                                )}
                                {teamSize && (
                                    <div className="flex items-center gap-2 text-[#71717B]">
                                        <div className="w-[14px] h-[14px] rounded-full border border-[#71717B] flex items-center justify-center text-[9px] font-bold">{teamSize}</div>
                                        <span className="text-[13px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Team size: {teamSize}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[#F4F4F5] pt-5 mt-5 mb-4">
                                <p className="text-[10px] text-[#A1A1AA] font-bold tracking-widest uppercase mb-0.5">STARTING FROM</p>
                                <div className="flex items-baseline gap-1">
                                    <EditableTotal packageId={selectedVariantId} vendorType="DJ" initialPrice={basePrice || 0} />
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
                </div>

                <div className="px-5 py-2 flex items-center justify-between cursor-pointer group">
                    <span className="text-[13px] font-bold text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>View full customer preview</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#04222D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>

                <div className="h-2 bg-[#F4F4F5] w-full my-3" />

                {/* Flat Sections as designed */}
                
                {/* Deliverable Items */}
                <div className="px-5 py-4">
                    <h3 className="text-[14px] font-bold text-[#000000] mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>Deliverable Items</h3>
                    
                    <div className="border border-[#E4E4E7] rounded-[16px] p-4 relative">
                        {items.length > 0 ? items.map((item: any, idx: number) => {
                            const pType = item.performanceType || '';
                            const genres = item.contentDetails?.genreOfMusic || [];
                            const langs = item.contentDetails?.language || [];

                            const genreValue = genres[0] || 'Any';
                            const genreMore = genres.length > 1 ? `+${genres.length - 1}more` : '';
                            
                            const langValue = langs[0] || 'Any';
                            const langMore = langs.length > 1 ? `+${langs.length - 1}more` : '';

                            return (
                                <div key={idx} className={`${idx !== items.length - 1 ? 'border-b border-dashed border-[#E4E4E7] mb-4 pb-4' : ''}`}>
                                    <div className="flex flex-col items-center justify-center mb-4">
                                        <User size={24} color="#6D28D9" className="mb-1" />
                                        <span className="text-[10px] text-[#71717B] font-bold tracking-wider uppercase">DJ ARTIST</span>
                                        <span className="text-[13px] font-extrabold text-[#04222D] mt-0.5">{item.name || 'ITEM NAME'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div>
                                            <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>Performance Type</p>
                                            <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                                {pType} {item.contentDetails?.genreOfMusic?.length > 1 && <span className="text-[#3B82F6] text-[11px] font-bold ml-1">+4more</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>Music Genre</p>
                                            <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                                {genreValue} {genreMore && <span className="text-[#3B82F6] text-[11px] font-bold ml-1">{genreMore}</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase mb-1" style={{ fontFamily: 'Figtree, sans-serif' }}>Music Language</p>
                                            <p className="text-[13px] font-medium text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                                {langValue} {langMore && <span className="text-[#3B82F6] text-[11px] font-bold ml-1">{langMore}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-[13px] text-[#71717B] text-center italic py-2">No items added.</p>
                        )}
                    </div>
                </div>

                {/* Playlists */}
                {playlists.length > 0 && (
                    <div className="px-5 py-4">
                        <h3 className="text-[14px] font-bold text-[#000000] mb-4 flex items-center gap-1" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Playlist <span className="text-red-500">*</span>
                        </h3>
                        <div className="space-y-3">
                            {playlists.map((pl: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
                                        <Music size={20} color="#EA580C" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-bold text-[#04222D] leading-tight" style={{ fontFamily: 'Figtree, sans-serif' }}>{pl.name || 'Curated Playlist'}</p>
                                        <p className="text-[11px] text-[#71717B] mt-0.5" style={{ fontFamily: 'Figtree, sans-serif' }}>{pl.songs?.length || 0} songs • {pl.type || 'Curated'}</p>
                                    </div>
                                    <MinusCircle size={20} color="#D4D4D8" className="shrink-0 cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Equipment */}
                {equipments.length > 0 && (
                    <div className="px-5 py-4">
                        <h3 className="text-[14px] font-bold text-[#000000] mb-4 flex items-center gap-1" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Equipment <span className="text-red-500">*</span>
                        </h3>
                        <div className="space-y-3">
                            {equipments.map((eq: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] flex items-center justify-center shrink-0 overflow-hidden border border-[#F1F5F9]">
                                            <Disc size={20} color="#64748B" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-[#04222D] leading-tight" style={{ fontFamily: 'Figtree, sans-serif' }}>{eq.name || 'Equipment'}</p>
                                            <p className="text-[11px] text-[#71717B] mt-0.5" style={{ fontFamily: 'Figtree, sans-serif' }}>{eq.category || 'Mechanical'}</p>
                                            <p className="text-[12px] font-bold text-[#04222D] mt-1" style={{ fontFamily: 'Figtree, sans-serif' }}>Quantity: {eq.quantity || 1}</p>
                                        </div>
                                    </div>
                                    <MinusCircle size={20} color="#D4D4D8" className="shrink-0 cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add-ons */}
                {addons.length > 0 && (
                    <div className="px-5 py-4">
                        <h3 className="text-[14px] font-bold text-[#000000] mb-4 flex items-center gap-1" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Add-ons <span className="text-red-500">*</span>
                        </h3>
                        <div className="space-y-3">
                            {addons.map((addon: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {addon.images?.[0] ? (
                                                <img src={addon.images[0].url} alt="addon" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 bg-gray-300 rounded-full" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-[#04222D] leading-tight" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.name || ''}</p>
                                            <p className="text-[11px] text-[#71717B] mt-0.5" style={{ fontFamily: 'Figtree, sans-serif' }}>Product/Category</p>
                                            <p className="text-[13px] font-extrabold text-[#000000] mt-1" style={{ fontFamily: 'Figtree, sans-serif' }}>₹ {Number(addon.price).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <MinusCircle size={20} color="#D4D4D8" className="shrink-0 cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Needs from Venue */}
                {(allRequirements.length > 0 || venueDescription) && (
                    <div className="px-5 py-4">
                        <h3 className="text-[14px] font-bold text-[#000000] mb-4 flex items-center gap-1" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Needs from Venue <span className="text-red-500">*</span>
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {allRequirements.map((req: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-[#04222D] text-white text-[12px] font-medium rounded-full shadow-sm" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {req}
                                </span>
                            ))}
                        </div>
                        {venueDescription && (
                            <div className="bg-[#F4F4F5] p-4 rounded-[12px] border border-[#E4E4E7]">
                                <p className="text-[13px] text-[#3F3F46] leading-relaxed m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {venueDescription}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="h-2 bg-[#F4F4F5] w-full my-2" />

                {/* Package Strength */}
                <div className="px-5 py-6">
                    <h3 className="text-[14px] font-bold text-[#000000] mb-4 flex items-center gap-1" style={{ fontFamily: 'Figtree, sans-serif' }}>
                        Improve your Package <span className="text-red-500">*</span>
                    </h3>
                    
                    <ul className="pl-4 m-0 space-y-2 mb-6">
                        <li className="text-[12px] text-[#71717B] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Adding at least 5 high-quality images increases booking chances by 40%.
                        </li>
                        <li className="text-[12px] text-[#71717B] list-disc" style={{ fontFamily: 'Figtree, sans-serif' }}>
                            Packages with optional add-ons see higher average order values.
                        </li>
                    </ul>

                    <div className="bg-[#F4F4F5] rounded-[24px] p-5">
                        <div className="mb-5">
                            <h4 className="text-[16px] font-extrabold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Your package strength</h4>
                            <p className="text-[12px] font-bold text-[#71717B] mt-1" style={{ fontFamily: 'Figtree, sans-serif' }}>{strengthScore}/10 — {strengthScore >= 8 ? 'Strong' : 'Average'}</p>
                            <div className="w-full h-1.5 bg-[#E4E4E7] rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-[#000000] rounded-full transition-all duration-1000" style={{ width: `${(strengthScore / 10) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-2 mb-5">
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
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="w-full bg-[#04222D] hover:bg-[#063344] text-white py-[16px] rounded-2xl font-bold text-[15px] flex justify-center items-center gap-2 transition-all shadow-[0_8px_20px_rgba(4,34,45,0.15)] disabled:opacity-70"
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
