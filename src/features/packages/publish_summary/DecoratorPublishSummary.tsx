import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShieldAlert, BadgeCheck, MapPin, Users, Clock, MinusCircle } from 'lucide-react';
import { AddonModal } from '../components/AddonModal';
import { EditableTotal } from '../components/EditableTotal';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { apiUrl } from '@/lib/api';

interface Props {
    packageId: string | null;
    packageData: any;
    allVariants: any[];
    onBack: () => void;
}

export default function DecoratorPublishSummary({ packageId, packageData: initialPackageData, allVariants, onBack }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>(null);

    // Filter variants safely, handling the case where `allVariants` is empty
    const variants = allVariants && allVariants.length > 0 ? allVariants : [initialPackageData];
    const hasVariants = variants.length > 0; // Only show selector if > 1 variant

    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]._id || initialPackageData._id);

    // Active package data is based on selected variant
    const packageData = variants.find(v => v._id === selectedVariantId) || initialPackageData;

    // A helper to determine if a variant is "incomplete"
    const isVariantIncomplete = (v: any) => {
        const hasName = !!(v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName);
        const hasPrice = v.step3_pricing?.basePrice > 0 || v.step2_productsAndPricing?.totalPackagePrice > 0;
        const hasDeliverables = (v.step2_productsAndPricing?.setups?.length > 0) || (v.step2_productsAndPricing?.items?.length > 0);
        return !(hasName && hasPrice && hasDeliverables);
    };

    const basePrice = packageData.step3_pricing?.basePrice || packageData.step2_productsAndPricing?.totalPackagePrice || 0;

    const pkgName = packageData.step1_eventAndCrew?.packageName || packageData.step1_basicDetails?.packageName || '';
    const cities = packageData.step1_eventAndCrew?.cities?.join(', ') || '';

    // Dynamic stats from Step 1
    const poc = packageData.step1_eventAndCrew?.poc || '';
    const durationOfSetup = packageData.step1_eventAndCrew?.durationOfSetup || 0; // hours
    const setupDurationLabel = durationOfSetup > 0 ? `Upto ${durationOfSetup}hr${durationOfSetup > 1 ? 's' : ''} Setup Duration` : '';
    const crewMin = packageData.step1_eventAndCrew?.crewSize?.minPeople;
    const crewMax = packageData.step1_eventAndCrew?.crewSize?.maxPeople;
    const teamSizeLabel = (crewMin || crewMax)
        ? `Team size: ${crewMin || ''}${crewMax && crewMax !== crewMin ? `–${crewMax}` : ''}`
        : '';
    
    // Deliverables Data
    const setups = packageData.step2_productsAndPricing?.setups || packageData.step2_productsAndPricing?.items || [];
    const addons = packageData.step2_productsAndPricing?.addOns || [];
    const VENUE_NEEDS_OPTIONS = [
        'Setup area',
        'Ceiling height & hanging/rigging points',
        'Power for lighting installations',
        'Mandap base area',
        'Entrance & pathway access',
        'Backdrop fixing permission',
        'Advance setup access (day before)',
        'Debris clearance access',
        'Lawn access',
        'Ladder / scaffolding clearance'
    ];

    const requirements: string[] = [];
    let customParagraph = '';
    const venueNeedsObj = packageData.step1_eventAndCrew?.venueNeeds || {};
    
    if (venueNeedsObj) {
        Object.entries(venueNeedsObj).forEach(([key, val]) => {
            if (key !== 'customText' && key !== 'other' && val === true) {
                requirements.push(key.charAt(0).toUpperCase() + key.slice(1));
            }
        });
        if (venueNeedsObj.customText) {
            const customs = venueNeedsObj.customText.split(',').map((s: string) => s.trim()).filter(Boolean);
            requirements.push(...customs.filter((c: string) => VENUE_NEEDS_OPTIONS.includes(c)));
            customParagraph = customs.filter((c: string) => !VENUE_NEEDS_OPTIONS.includes(c)).join(', ');
        }
        if (venueNeedsObj.other) {
            customParagraph = customParagraph ? `${customParagraph}, ${venueNeedsObj.other}` : venueNeedsObj.other;
        }
    }

    const heroImage = packageData.step4_sampleMedia?.coverImage || packageData.step4_sampleMedia?.media?.[0]?.url || '';
    const allCategories = packageData.step1_eventAndCrew?.categories || [];

    // Package Strength Calculation
    const hasPricing = (basePrice > 0);
    const hasDeliverables = (setups.length > 0);
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
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSetupItems = (setup: any) => {
        if (!setup.items || setup.items.length === 0) return null;
        
        return setup.items.map((item: any, idx: number) => (
            <div key={idx} className="mb-6 last:mb-0">
                <div className="text-center mb-3">
                    <p className="text-[10px] text-[#71717B] font-medium m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Setup Name</p>
                    <p className="text-[12px] font-bold text-[#000000] uppercase tracking-wide m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.name || `NAME OF ITEM${idx > 0 ? idx + 1 : ''}`}</p>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {item.itemType && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Item Type</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.itemType}</p>
                        </div>
                    )}
                    {item.lightingType && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Lighting Type</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.lightingType}</p>
                        </div>
                    )}
                    {item.furnitureType && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Furniture Type</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.furnitureType}</p>
                        </div>
                    )}
                    {item.flowerType && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Flower Type</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.flowerType}</p>
                        </div>
                    )}
                    {item.dimensions && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Dimensions</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.dimensions}</p>
                        </div>
                    )}
                    {item.volume && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Volume</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.volume}</p>
                        </div>
                    )}
                    {(item.qty || item.quantity) && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Quantity</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.qty || item.quantity}x</p>
                        </div>
                    )}
                    {item.colors && item.colors.length > 0 && (
                        <div>
                            <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Colors</p>
                            <p className="text-[12px] font-medium text-[#04222D] m-0 flex flex-wrap gap-1 items-center" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {item.colors.slice(0, 2).join(', ')}
                                {item.colors.length > 2 && <span className="text-[#3B82F6]">{` +${item.colors.length - 2}more`}</span>}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="flex flex-col min-h-screen bg-white max-w-[448px] mx-auto w-full shadow-[0_0_20px_rgba(0,0,0,0.02)]">
            
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-white border-b border-[#F4F4F5] sticky top-0 z-20">
                <button onClick={onBack} disabled={isSubmitting} className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} color="#04222D" />
                </button>
                <h1 className="text-[18px] font-extrabold text-[#04222D] tracking-tight m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    Publish your package
                </h1>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 pb-32 overflow-y-auto">
                
                {/* Variants Header */}
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

                {/* Hero Package Card */}
                <div className="px-5 mt-5">
                    <div className="bg-white rounded-3xl border border-[#F4F4F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
                        <div className="relative h-[160px] w-full overflow-hidden">
                            <img src={heroImage} alt="Package cover" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-[#F0FDF4] px-2 py-1 rounded-md">
                                    <span className="text-[12px]">🎈</span>
                                    <span className="text-[10px] font-extrabold text-[#166534] uppercase tracking-wider">DECORATOR</span>
                                </div>
                                <div className="h-3 w-px bg-[#E4E4E7]"></div>
                                <span className="text-[11px] font-semibold text-[#04222D]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                    {allCategories.slice(0, 2).join(' • ')} {allCategories.length > 2 && <span className="text-[#04222D]">{`+${allCategories.length - 2} more`}</span>}
                                </span>
                            </div>

                            <h2 className="text-[15px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {pkgName}
                            </h2>

                            <div className="flex flex-col gap-1.5">
                                {(setupDurationLabel || poc) && (
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {setupDurationLabel && (
                                            <div className="flex items-center gap-1.5 text-[#71717B]">
                                                <Clock size={14} />
                                                <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{setupDurationLabel}</span>
                                            </div>
                                        )}
                                        {poc && (
                                            <div className="flex items-center gap-1.5 text-[#71717B]">
                                                <Users size={14} />
                                                <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Poc - {poc}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {teamSizeLabel && (
                                    <div className="flex items-center gap-1.5 text-[#71717B]">
                                        <Users size={14} />
                                        <span className="text-[12px] font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>{teamSizeLabel}</span>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-[#F4F4F5] my-1 w-full"></div>

                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-0.5">STARTING FROM</span>
                                <div className="flex items-baseline gap-1">
                                    <EditableTotal packageId={selectedVariantId} vendorType="Decorator" initialPrice={basePrice || 0} />
                                    <span className="text-[13px] font-bold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>/event</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#FAFAFA] border-t border-[#F4F4F5] px-4 py-3 flex items-center gap-2">
                            <MapPin size={16} color="#04222D" className="shrink-0" />
                            <p className="text-[12px] font-medium text-[#04222D] m-0 line-clamp-1" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {cities}
                            </p>
                        </div>
                    </div>
                    
                    <button className="flex items-center gap-2 mt-4 text-[13px] font-bold text-[#000000] transition-opacity hover:opacity-80">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }}>View full customer preview</span>
                        <ArrowLeft size={16} className="rotate-180" />
                    </button>
                </div>

                {/* Deliverables Section */}
                <CollapsibleSection 
                    title="Deliverable Items" 
                    isOpen={openSection === 'deliverables'} 
                    onToggle={() => setOpenSection(openSection === 'deliverables' ? null : 'deliverables')}
                >
                    
                    <div className="bg-white border border-[#F4F4F5] rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-6">
                        
                        {setups.map((setup: any, idx: number) => (
                            <div key={idx} className="flex flex-col">
                                <div className="flex flex-col items-center justify-center mb-5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[12px]">📦</span>
                                        <span className="text-[10px] text-[#71717B] font-medium">Decorator</span>
                                    </div>
                                    <p className="text-[12px] font-bold text-[#000000] uppercase tracking-wide m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{setup.name || packageData?.title || 'SETUP'}</p>
                                </div>

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-px bg-[#E4E4E7] flex-1"></div>
                                    <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">Setup Detail</span>
                                    <div className="h-px bg-[#E4E4E7] flex-1"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                                    <div>
                                        <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Decorating Elements</p>
                                        <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            {setup.decoratingWhat || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Included Structures</p>
                                        <p className="text-[12px] font-medium text-[#04222D] m-0 flex flex-wrap gap-1 items-center" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            {setup.structuresIncluded?.slice(0, 2).join(', ') || 'None'}
                                            {setup.structuresIncluded?.length > 2 && <span className="text-[#3B82F6]">{`+${setup.structuresIncluded.length - 2}more`}</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Type of Setup</p>
                                        <p className="text-[12px] font-medium text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{setup.referenceStyle || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Theme</p>
                                        <p className="text-[12px] font-medium text-[#04222D] m-0 flex flex-wrap gap-1 items-center" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                            {setup.themes?.slice(0, 2).join(', ') || 'None'}
                                            {setup.themes?.length > 2 && <span className="text-[#3B82F6]">{`+${setup.themes.length - 2}more`}</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-px bg-[#E4E4E7] flex-1"></div>
                                    <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">Items Detail</span>
                                    <div className="h-px bg-[#E4E4E7] flex-1"></div>
                                </div>

                                {renderSetupItems(setup)}
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Add-ons Section */}
                <CollapsibleSection 
                    title="Add-ons" 
                    required={true} 
                    isOpen={openSection === 'addons'} 
                    onToggle={() => setOpenSection(openSection === 'addons' ? null : 'addons')}
                >
                    <div className="flex flex-col gap-3">
                        {addons.map((addon: any, idx: number) => (
                            <div key={idx} className="bg-white border border-[#F4F4F5] rounded-[16px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-[#F4F4F5] shrink-0">
                                        <img src={addon.imageUrl || heroImage} alt={addon.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[13px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.name || ''}</h4>
                                        <p className="text-[11px] text-[#A1A1AA] font-medium m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.category || ''}</p>
                                        <p className="text-[13px] font-bold text-[#04222D] mt-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>₹ {addon.price || 0}/{addon.chargeType || ''}</p>
                                    </div>
                                    <button className="w-6 h-6 rounded-full border border-[#04222D] flex items-center justify-center shrink-0">
                                        <MinusCircle size={14} color="#04222D" />
                                    </button>
                                </div>
                                {(addon.physicalSpec?.color || addon.physicalSpec?.dimensions) && (
                                    <>
                                        <div className="h-px border-t border-dashed border-[#E4E4E7] w-full mb-3"></div>
                                        <div className="grid grid-cols-2 gap-x-2">
                                            {addon.physicalSpec?.color && (
                                                <div>
                                                    <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Colour</p>
                                                    <p className="text-[11px] font-bold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{addon.physicalSpec.color}</p>
                                                </div>
                                            )}
                                            {addon.physicalSpec?.dimensions && (
                                                <div>
                                                    <p className="text-[10px] text-[#A1A1AA] mb-0.5 m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>Dimensions</p>
                                                    <p className="text-[11px] font-bold text-[#000000] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                                        {addon.physicalSpec.dimensions.length} x {addon.physicalSpec.dimensions.breadth} x {addon.physicalSpec.dimensions.height} {addon.physicalSpec.dimensions.unit}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Needs from Venue Section */}
                <CollapsibleSection 
                    title="Needs from Venue" 
                    required={true} 
                    isOpen={openSection === 'needs'} 
                    onToggle={() => setOpenSection(openSection === 'needs' ? null : 'needs')}
                >
                    <div className="flex flex-wrap gap-2 mb-4">
                        {requirements.map((req, idx) => (
                            <span key={idx} className="bg-[#04222D] text-white px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {req}
                            </span>
                        ))}
                    </div>

                    {customParagraph && (
                        <div className="bg-[#F4F4F5] rounded-xl p-4">
                            <p className="text-[13px] text-[#3F3F46] leading-relaxed m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>
                                {customParagraph}
                            </p>
                        </div>
                    )}
                </CollapsibleSection>

                {/* Improve your Package */}
                <CollapsibleSection 
                    title="Improve your Package" 
                    required={true} 
                    isOpen={openSection === 'improve'} 
                    onToggle={() => setOpenSection(openSection === 'improve' ? null : 'improve')}
                >
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
                </CollapsibleSection>

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
