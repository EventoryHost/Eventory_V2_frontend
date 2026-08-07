'use client';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { EditableTotal } from '../components/EditableTotal';
import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldAlert, MinusCircle, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const FF = { fontFamily: 'var(--font-inter), sans-serif' };

interface Props {
    packageId: string | null;
    packageData: any;
    allVariants: any[];
    onBack: () => void;
}

function MenuCard({ menu, idx }: { menu: any; idx: number }) {
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const type = menu.type || 'Menu';
    const serviceStyles = menu.serviceStyle?.join(', ') || 'Service';
    // Mongoose array or plain array
    const items = menu.items || {};
    
    // Group all non-empty categories
    const categories = Object.entries(items)
        .filter(([_, arr]) => Array.isArray(arr) && arr.length > 0)
        .map(([cat, arr]) => {
            const arrTyped = arr as any[];
            const formatName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, ' $1');
            return {
                key: cat,
                label: formatName,
                items: arrTyped,
            };
        });

    return (
        <div className="mb-6">
            <p style={FF} className="text-[13px] font-extrabold text-[#04222D] uppercase tracking-widest text-center mb-5">
                MENU {idx + 1}
            </p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-5">
                <div>
                    <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Menu Type</p>
                    <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{type}</p>
                </div>
                <div>
                    <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Service Type</p>
                    <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{serviceStyles}</p>
                </div>
            </div>

            {categories.length > 0 && (
                <div>
                    <p style={FF} className="text-[10px] text-[#A1A1AA] mb-2 m-0">Food Categories</p>
                    <div className="flex flex-col gap-2">
                        {categories.map(cat => (
                            <div key={cat.key} className="border border-[#F4F4F5] rounded-[12px] overflow-hidden">
                                <button 
                                    onClick={() => toggleCategory(cat.key)}
                                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-left">
                                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{cat.label} ({cat.items.length})</p>
                                        <p style={FF} className="text-[10px] text-[#A1A1AA] mt-0.5 m-0">{cat.items.length} items added</p>
                                    </div>
                                    {openCategories[cat.key] ? <ChevronUp size={16} color="#04222D" /> : <ChevronDown size={16} color="#04222D" />}
                                </button>
                                
                                {openCategories[cat.key] && (
                                    <div className="p-3 pt-0 flex flex-wrap gap-2">
                                        {cat.items.map((item: any, i: number) => (
                                            <span key={i} style={FF} className="px-3 py-1.5 bg-[#04222D] text-white text-[12px] font-medium rounded-full">
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CatererPublishSummary({ packageId, packageData: initialPackageData, allVariants, onBack }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const variants = allVariants && allVariants.length > 0 ? allVariants : [initialPackageData];
    const hasVariants = variants.length > 0;

    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]._id || initialPackageData._id);

    const packageData = variants.find(v => v._id === selectedVariantId) || initialPackageData;

    const isVariantIncomplete = (v: any) => {
        const hasName = !!(v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName);
        const hasPrice = v.step3_policiesAndCharges?.teamAndEquipment?.price > 0 || v.step3_policiesAndCharges?.overallPriceOfPackage?.price > 0 || v.step2_productsAndPricing?.totalPackagePrice > 0;
        const hasDeliverables = v.step2_productsAndPricing?.menus?.length > 0 || v.step2_productsAndPricing?.items?.length > 0;
        return !(hasName && hasPrice && hasDeliverables);
    };

    const pkgName = packageData.step1_eventAndCrew?.packageName || '';
    const allCategories: string[] = packageData.step1_eventAndCrew?.eventCategories || [];
    const cities: string[] = packageData.step1_eventAndCrew?.cities || [];
    const poc = packageData.step1_eventAndCrew?.poc || '';
    
    // Duration
    const minH = packageData.step1_eventAndCrew?.duration?.minHours || 0;
    const maxH = packageData.step1_eventAndCrew?.duration?.maxHours || 0;
    const durationStr = minH === maxH ? `${minH}hrs` : `${minH}-${maxH}hrs`;

    // Plate count (capacity)
    const minGuests = packageData.step1_eventAndCrew?.capacity?.minGuests || 0;
    const maxGuests = packageData.step1_eventAndCrew?.capacity?.maxGuests || 0;
    const plateCountStr = minGuests === maxGuests ? `${minGuests}` : `${minGuests} - ${maxGuests}`;

    // Pricing
    // Caterer uses teamAndEquipment.price. If they entered a random number in step 3, it's saved there.

    const basePrice: number = packageData.step3_policiesAndCharges?.teamAndEquipment?.price || packageData.step3_policiesAndCharges?.overallPriceOfPackage?.price || packageData.step2_productsAndPricing?.totalPackagePrice || 0;

    // Deliverables
    const menus: any[] = packageData.step2_productsAndPricing?.menus || [];
    const addOns: any[] = packageData.step2_productsAndPricing?.addOns || [];

    // Venue Needs
    const venueNeeds = packageData.step1_eventAndCrew?.venueNeeds || {};
    const venueNeedsPills = [];
    if (venueNeeds.power) venueNeedsPills.push('Power');
    if (venueNeeds.ac) venueNeedsPills.push('AC');
    if (venueNeeds.stage) venueNeedsPills.push('Stage');
    if (venueNeeds.lighting) venueNeedsPills.push('Lighting');
    if (venueNeeds.security) venueNeedsPills.push('Security');
    
    const customTextRaw = venueNeeds.customText || '';
    const customTextParts = customTextRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
    const hasLongText = customTextParts.some((p: string) => p.length > 30);
    const pillsToRender = customTextParts.filter((p: string) => p.length <= 30);
    const longTextToRender = customTextParts.filter((p: string) => p.length > 30).join('. ');
    
    const allPills = [...venueNeedsPills, ...pillsToRender];

    // Hero image 
    const sampleMedia: any[] = packageData.step4_sampleMedia?.media || [];
    const heroImage: string | null = sampleMedia.length > 0 ? sampleMedia[0]?.url || sampleMedia[0]?.preview || null : null;

    // Package strength
    const hasPricing = basePrice > 0;
    const hasDeliverables = menus.length > 0;
    const totalMediaCount = sampleMedia.length;
    const hasAddons = addOns.length > 0;

    let strengthScore = 0;
    if (hasPricing) strengthScore += 3;
    if (hasDeliverables) strengthScore += 3;
    if (totalMediaCount >= 5) strengthScore += 2;
    else if (totalMediaCount > 0) strengthScore += 1;
    if (hasAddons) strengthScore += 2;
    const strengthLabel = strengthScore >= 8 ? 'Strong' : strengthScore >= 5 ? 'Good' : 'Needs Work';

    const handleSubmitForReview = async () => {
        if (!packageId) return;
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`/packages/${packageId}/submit`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });
            if (res.ok) {
                window.location.href = '/dashboard/inventory';
            } else {
                alert('Failed to submit for review');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F9F9F9] max-w-[448px] mx-auto w-full">

            <div className="flex items-center gap-4 p-4 bg-white border-b border-[#F4F4F5] sticky top-0 z-10">
                <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} color="#04222D" />
                </button>
                <h1 style={FF} className="text-[20px] font-extrabold text-[#04222D] tracking-tight m-0">Publish your package</h1>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">

                {hasVariants && (
                    <div className="px-5 pt-4">
                        <p className="text-[13px] font-bold text-[#04222D] mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>Variants</p>
                        <div className="inline-flex max-w-full bg-[#F9FAF9] p-1 rounded-xl border border-[#F4F4F5] overflow-x-auto gap-1">
                            {variants.map((v: any) => {
                                const variantName = v.variantType || v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName || 'Untitled Variant';
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

                <div className="px-5 pb-4">
                    <div className="bg-white rounded-3xl border border-[#F4F4F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
                        {heroImage && (
                            <div className="relative h-[160px] w-full overflow-hidden">
                                <img src={heroImage} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                        
                        <div className="p-5 flex flex-col relative bg-white z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#FFF7ED] px-2.5 py-1 rounded border border-[#FFEDD5] flex items-center gap-1.5">
                                        <span className="text-[11px]">🍲</span>
                                        <span style={FF} className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider">Caterer</span>
                                    </div>
                                    {allCategories.length > 0 && (
                                        <>
                                            <div className="w-px h-3 bg-[#E4E4E7]"></div>
                                            <p style={FF} className="text-[11px] font-medium text-[#04222D] m-0">
                                                {allCategories.slice(0, 2).join(' • ')} {allCategories.length > 2 ? `+${allCategories.length - 2} more` : ''}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <h2 style={FF} className="text-[18px] font-extrabold text-[#04222D] mb-4 m-0 leading-tight">
                                {pkgName}
                            </h2>

                            <div className="flex flex-col gap-2.5 mb-5">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#71717B] text-[14px]">⏱</span>
                                        <p style={FF} className="text-[13px] text-[#71717B] m-0">{durationStr} Event Duration</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#71717B] text-[14px]">👤</span>
                                        <p style={FF} className="text-[13px] text-[#71717B] m-0">Poc - {poc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#71717B] text-[14px]">🍽</span>
                                    <p style={FF} className="text-[13px] text-[#71717B] m-0">{plateCountStr} Plate Count</p>
                                </div>
                            </div>

                            {basePrice > 0 && (
                                <>
                                    <div className="h-px bg-[#F4F4F5] my-1 w-full"></div>
                                    <div className="flex flex-col pt-3">
                                        <span style={FF} className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-0.5">STARTING FROM</span>
                                        <div className="flex items-baseline gap-1">
                                            <EditableTotal packageId={selectedVariantId} vendorType="Caterer" initialPrice={basePrice || 0} />
                                            <span style={FF} className="text-[13px] font-bold text-[#000000]">/event</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {cities.length > 0 && (
                            <div className="bg-[#FAFAFA] border-t border-[#F4F4F5] px-4 py-3 flex items-center gap-2">
                                <MapPin size={16} color="#04222D" className="shrink-0" />
                                <p style={FF} className="text-[12px] font-medium text-[#04222D] m-0 line-clamp-1">{cities.join(', ')}</p>
                            </div>
                        )}
                    </div>
                    <button className="flex items-center gap-2 mt-4 text-[13px] font-bold text-[#000000] transition-opacity hover:opacity-80">
                        <span style={FF}>View full customer preview</span>
                        <ArrowLeft size={16} className="rotate-180" />
                    </button>
                </div>

                {/* Deliverable Items */}
                <div className="px-5">
                    <p style={FF} className="text-[14px] font-bold text-[#04222D] mb-3">Deliverable Items</p>

                    {menus.length > 0 && (
                        <div className="bg-white border border-[#F4F4F5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4">
                            <div className="flex items-center gap-1.5 justify-center mb-1">
                                <span className="text-[12px]">🍲</span>
                                <span style={FF} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Caterer</span>
                            </div>
                            <p style={FF} className="text-[13px] font-extrabold text-[#04222D] uppercase tracking-widest text-center mb-5">
                                {pkgName}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Menu Count</p>
                                    <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{menus.length}</p>
                                </div>
                                <div>
                                    <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Included Menu Types</p>
                                    <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{menus.map(m => m.type).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="h-px bg-[#F4F4F5] flex-1"></div>
                                <span style={FF} className="text-[11px] font-medium text-[#F59E0B]">Menu Details</span>
                                <div className="h-px bg-[#F4F4F5] flex-1"></div>
                            </div>

                            {menus.map((menu: any, idx: number) => (
                                <div key={idx}>
                                    {idx > 0 && <div className="border-t border-dashed border-[#E4E4E7] my-6"></div>}
                                    <MenuCard menu={menu} idx={idx} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add-ons */}
                    {addOns.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-1 mb-3">
                                <p style={FF} className="text-[14px] font-bold text-[#04222D] m-0">Add-ons</p>
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {addOns.map((addon: any, idx: number) => {
                                    const imgUrl = addon.mediaUrls?.[0] || null;
                                    return (
                                        <div key={idx} className="bg-white border border-[#F4F4F5] rounded-[16px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-[#F4F4F5] shrink-0">
                                                    {imgUrl
                                                        ? <img src={imgUrl} alt={addon.name} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full bg-[#E4E4E7]" />
                                                    }
                                                </div>
                                                <div className="flex-1">
                                                    <h4 style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{addon.name || 'Add-on'}</h4>
                                                    <p style={FF} className="text-[11px] text-[#A1A1AA] font-medium m-0">{addon.category || addon.addOnType || 'Category'}</p>
                                                    {addon.price > 0 && (
                                                        <p style={FF} className="text-[13px] font-bold text-[#04222D] mt-0.5 m-0">
                                                            ₹ {addon.price.toLocaleString('en-IN')}{addon.billingUnit ? `/${addon.billingUnit}` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <button className="w-6 h-6 rounded-full border border-[#04222D] flex items-center justify-center shrink-0">
                                                    <MinusCircle size={14} color="#04222D" />
                                                </button>
                                            </div>
                                            
                                            {(addon.quantity > 0 || addon.type === 'Food') && (
                                                <>
                                                    <div className="h-px border-t border-dashed border-[#E4E4E7] w-full my-3"></div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {addon.quantity > 0 && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Quantity</p>
                                                                <p style={FF} className="text-[11px] font-bold text-[#04222D] m-0">{addon.quantity}</p>
                                                            </div>
                                                        )}
                                                        {addon.type === 'Food' && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Food Type</p>
                                                                <p style={FF} className="text-[11px] font-bold text-[#04222D] m-0">{addon.subCategory || 'Food'}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Needs from Venuw */}
                    {(allPills.length > 0 || longTextToRender) && (
                        <div className="mb-6">
                            <div className="flex items-center gap-1 mb-3">
                                <p style={FF} className="text-[14px] font-bold text-[#04222D] m-0">Needs from Venuw</p>
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                            
                            {allPills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {allPills.map((pill, idx) => (
                                        <span key={idx} style={FF} className="px-4 py-2 bg-[#04222D] text-white text-[12px] font-medium rounded-full">
                                            {pill}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {longTextToRender && (
                                <div className="bg-[#F4F4F5] rounded-[12px] p-4">
                                    <p style={FF} className="text-[13px] text-[#04222D] leading-relaxed m-0">
                                        {longTextToRender}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Package Strength Card */}
                <div className="px-5 mt-4 mb-4">
                    <div className="bg-white border border-[#F4F4F5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4">
                        <p style={FF} className="text-[14px] font-bold text-[#04222D] mb-1">Your package strength</p>
                        <p style={FF} className="text-[12px] text-[#71717B] mb-3">{strengthScore.toFixed(1)}/10 — {strengthLabel}</p>
                        <div className="w-full h-2 bg-[#F4F4F5] rounded-full mb-5">
                            <div
                                className="h-2 bg-[#04222D] rounded-full transition-all"
                                style={{ width: `${Math.min((strengthScore / 10) * 100, 100)}%` }}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            {[
                                { ok: hasPricing, label: 'Pricing completed' },
                                { ok: hasDeliverables, label: 'Deliverables added' },
                                {
                                    ok: totalMediaCount >= 5,
                                    label: totalMediaCount >= 5
                                        ? `${totalMediaCount} images added`
                                        : `Only ${totalMediaCount} image${totalMediaCount === 1 ? '' : 's'} added`
                                },
                                { ok: hasAddons, label: hasAddons ? 'Add-ons included' : 'No add-ons included' },
                            ].map(({ ok, label }) => (
                                <div key={label} className="flex items-center gap-3 bg-white border border-[#F4F4F5] rounded-[12px] p-3">
                                    {ok
                                        ? <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"><Check size={14} color="white" /></div>
                                        : <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0"><ShieldAlert size={12} color="white" /></div>
                                    }
                                    <p style={FF} className="text-[13px] font-semibold text-[#04222D] m-0">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5">
                            <p style={FF} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-2">IMPROVE YOUR PACKAGE</p>
                            <p style={FF} className="text-[12px] text-[#71717B] m-0">• Adding at least 5 high-quality images increases booking chances by 40%.</p>
                            <p style={FF} className="text-[12px] text-[#71717B] mt-1 m-0">• Packages with optional add-ons (like 'Premium Cutlery') see higher average order values.</p>
                        </div>
                    </div>

                    {/* Review notice */}
                    <div className="bg-[#FAFAFA] border border-[#F4F4F5] rounded-[16px] px-4 py-3 flex items-center gap-3">
                        <ShieldAlert size={18} color="#A1A1AA" className="shrink-0" />
                        <p style={FF} className="text-[12px] text-[#71717B] m-0">
                            Reviewed by Event Manager before going live. Takes ~2–4 business hours
                        </p>
                    </div>
                </div>
            </div>

            {/* Save & Next CTA */}
            <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white border-t border-[#F4F4F5] z-20 max-w-[448px] mx-auto">
                <button
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="w-full bg-[#04222D] text-white py-4 rounded-2xl font-bold text-[16px] flex justify-center items-center gap-2 transition-all shadow-[0_8px_20px_rgba(4,34,45,0.15)] disabled:opacity-70 active:scale-[0.98]"
                    style={FF}
                >
                    {isSubmitting
                        ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : 'Save & Next'
                    }
                </button>
            </div>
        </div>
    );
}
