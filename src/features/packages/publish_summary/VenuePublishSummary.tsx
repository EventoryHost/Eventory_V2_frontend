import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldAlert, BadgeCheck, MapPin, Users, Clock, MinusCircle, ChevronDown } from 'lucide-react';
import { AddonModal } from '../components/AddonModal';
import { EditableTotal } from '../components/EditableTotal';
import { apiUrl } from '@/lib/api';

interface Props {
    packageId: string | null;
    packageData: any;
    allVariants: any[];
    onBack: () => void;
}

const FF = { fontFamily: 'Figtree, sans-serif' };

// Map amenity keys to display labels
const AMENITY_LABELS: Record<string, string> = {
    power: 'Power',
    ac: 'AC',
    stage: 'Stage',
    lighting: 'Lighting',
    security: 'Security',
};

const IHS_LABELS: Record<string, string> = {
    caterer: 'Caterer',
    pav: 'PAV',
    djArtist: 'DJ Artist',
    makeupArtist: 'Makeup Artist',
    decorator: 'Decorator',
};

function AmenityList({ amenities }: { amenities: Record<string, boolean> | undefined }) {
    const [showAll, setShowAll] = useState(false);
    if (!amenities) return null;
    const active = Object.entries(amenities).filter(([, v]) => v === true).map(([k]) => AMENITY_LABELS[k] || k);
    if (active.length === 0) return <span style={FF} className="text-[13px] font-bold text-[#04222D]">—</span>;
    const visible = showAll ? active : active.slice(0, 1);
    return (
        <span style={FF} className="text-[13px] font-bold text-[#04222D]">
            {visible.join(', ')}
            {active.length > 1 && !showAll && (
                <button onClick={() => setShowAll(true)} className="text-[#04222D] font-bold ml-1">
                    +show all
                </button>
            )}
        </span>
    );
}

function ActivityList({ activities }: { activities: string[] | undefined }) {
    const [showAll, setShowAll] = useState(false);
    if (!activities || activities.length === 0) return <span style={FF} className="text-[13px] font-bold text-[#04222D]">—</span>;
    const visible = showAll ? activities : activities.slice(0, 1);
    return (
        <span style={FF} className="text-[13px] font-bold text-[#04222D]">
            {visible.join(', ')}
            {activities.length > 1 && !showAll && (
                <button onClick={() => setShowAll(true)} className="text-[#04222D] font-bold ml-1">
                    +show all
                </button>
            )}
        </span>
    );
}

function SpaceCard({ space, idx }: { space: any; idx: number }) {
    const areaStr = space.area?.value ? `${space.area.value} ${space.area.unit || 'sq ft'}` : null;
    const heightStr = space.height?.value ? `${space.height.value} ${space.height.unit || 'M'}` : null;
    const roomsIncluded = space.capacity?.sitting > 0 || space.capacity?.dining > 0 || space.capacity?.standing > 0;
    const numRooms = space.numberOfRooms || space.noOfRooms || null;

    return (
        <div className="mb-6 last:mb-0">
            <p style={FF} className="text-[11px] font-extrabold text-[#04222D] uppercase tracking-widest text-center mb-4">
                {space.name || `Space ${idx + 1}`}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {space.spaceType && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Space Type</p>
                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{space.spaceType}</p>
                    </div>
                )}
                {areaStr && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Area of Venue</p>
                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{areaStr}</p>
                    </div>
                )}
                {heightStr && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Height of Venue</p>
                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{heightStr}</p>
                    </div>
                )}
                {space.environment && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Space Environment</p>
                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{space.environment}</p>
                    </div>
                )}
                {space.layout && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Layout</p>
                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{space.layout}</p>
                    </div>
                )}
                <div>
                    <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Rooms Included</p>
                    <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{roomsIncluded ? 'Yes' : 'No'}</p>
                </div>
                {numRooms && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">No. of Rooms</p>
                        <p style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{numRooms}</p>
                    </div>
                )}
                {space.amenities && Object.values(space.amenities).some((v: any) => v === true) && (
                    <div>
                        <p style={FF} className="text-[11px] text-[#71717B] mb-0.5 m-0">Amenities</p>
                        <AmenityList amenities={space.amenities} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VenuePublishSummary({ packageId, packageData: initialPackageData, allVariants, onBack }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const variants = allVariants && allVariants.length > 0 ? allVariants : [initialPackageData];
    const hasVariants = variants.length > 0;

    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]._id || initialPackageData._id);

    const packageData = variants.find(v => v._id === selectedVariantId) || initialPackageData;

    const isVariantIncomplete = (v: any) => {
        const hasName = !!(v.step1_eventAndCrew?.packageName || v.step1_basicDetails?.packageName);
        const hasPrice = v.step3_policiesAndCharges?.overallPriceOfPackage?.price > 0;
        const hasDeliverables = v.step2_productsAndPricing?.spaces?.length > 0;
        return !(hasName && hasPrice && hasDeliverables);
    };

    // ── Data extraction — all from DB schema, no invented values ──
    const pkgName = packageData.step1_eventAndCrew?.packageName || '';
    const allCategories: string[] = packageData.step1_eventAndCrew?.eventCategories || [];
    const cities: string[] = packageData.step1_eventAndCrew?.cities || [];
    const poc = packageData.step1_eventAndCrew?.poc || '';

    // Pricing — from step3_policiesAndCharges.overallPriceOfPackage
    const basePrice: number = packageData.step3_policiesAndCharges?.overallPriceOfPackage?.price || 0;

    // Deliverables
    const spaces: any[] = packageData.step2_productsAndPricing?.spaces || [];
    const addOns: any[] = packageData.step2_productsAndPricing?.addOns || [];

    // IHS (In-House Services)
    const ihs = packageData.step2_productsAndPricing?.inHouseServices || {};
    const ihsEntries: { type: string; label: string; items: any[] }[] = [];
    Object.entries(IHS_LABELS).forEach(([key, label]) => {
        const arr: any[] = (ihs as any)[key] || [];
        if (arr.length > 0) ihsEntries.push({ type: key, label, items: arr });
    });

    // Hero image — first media from spaceMedia
    const spaceMedia: any[] = packageData.step4_sampleMedia?.spaceMedia || [];
    const heroImage: string | null = spaceMedia.length > 0 && spaceMedia[0]?.media?.length > 0
        ? spaceMedia[0].media[0]?.url || null
        : null;

    // Package strength
    const hasPricing = basePrice > 0;
    const hasDeliverables = spaces.length > 0;
    const totalMediaCount = spaceMedia.reduce((acc: number, s: any) => acc + (s.media?.length || 0), 0);
    const hasAddons = addOns.length > 0 || ihsEntries.length > 0;

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

            {/* Header */}
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
                        <div className="flex bg-[#F9FAF9] p-1 rounded-xl border border-[#F4F4F5] overflow-x-auto gap-1">
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

                {/* Hero Image + Package Card */}
                <div className="px-5 pb-4">
                    <div className="bg-white rounded-3xl border border-[#F4F4F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
                        {heroImage && (
                            <div className="relative h-[160px] w-full overflow-hidden">
                                <img src={heroImage} alt="Venue cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-[#F0FDF4] px-2 py-1 rounded-md">
                                    <span className="text-[12px]">🏛️</span>
                                    <span style={FF} className="text-[10px] font-extrabold text-[#166534] uppercase tracking-wider">VENUE PROVIDER</span>
                                </div>
                                {allCategories.length > 0 && (
                                    <>
                                        <div className="h-3 w-px bg-[#E4E4E7]"></div>
                                        <span style={FF} className="text-[11px] font-semibold text-[#04222D]">
                                            {allCategories.slice(0, 2).join(' • ')}
                                            {allCategories.length > 2 && <span>{` +${allCategories.length - 2}...`}</span>}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h2 style={FF} className="text-[15px] font-bold text-[#04222D] m-0">{pkgName}</h2>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-4 flex-wrap">
                                    {(packageData.step1_eventAndCrew?.duration?.minHours || packageData.step1_eventAndCrew?.duration?.maxHours) && (
                                        <div className="flex items-center gap-1.5 text-[#71717B]">
                                            <Clock size={14} />
                                            <span style={FF} className="text-[12px] font-medium">
                                                {packageData.step1_eventAndCrew.duration.minHours}-{packageData.step1_eventAndCrew.duration.maxHours}hrs Event Duration
                                            </span>
                                        </div>
                                    )}
                                    {poc && (
                                        <div className="flex items-center gap-1.5 text-[#71717B]">
                                            <Users size={14} />
                                            <span style={FF} className="text-[12px] font-medium">Poc - {poc}</span>
                                        </div>
                                    )}
                                </div>
                                {packageData.step1_eventAndCrew?.crewSize?.minPeople && (
                                    <div className="flex items-center gap-1.5 text-[#71717B]">
                                        <Clock size={14} />
                                        <span style={FF} className="text-[12px] font-medium">
                                            Team size: {packageData.step1_eventAndCrew.crewSize.minPeople}
                                            {packageData.step1_eventAndCrew.crewSize.maxPeople ? `–${packageData.step1_eventAndCrew.crewSize.maxPeople}` : ''}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {basePrice > 0 && (
                                <>
                                    <div className="h-px bg-[#F4F4F5] my-1 w-full"></div>
                                    <div className="flex flex-col">
                                        <span style={FF} className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-0.5">STARTING FROM</span>
                                        <div className="flex items-baseline gap-1">
                                            <EditableTotal packageId={selectedVariantId} vendorType="Venue" initialPrice={basePrice || 0} />
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

                    {/* Spaces */}
                    {spaces.length > 0 && (
                        <div className="bg-white border border-[#F4F4F5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4">
                            <div className="flex items-center gap-1.5 justify-center mb-1">
                                <span className="text-[12px]">🏛️</span>
                                <span style={FF} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Venue</span>
                            </div>
                            <p style={FF} className="text-[13px] font-extrabold text-[#04222D] uppercase tracking-widest text-center mb-5">
                                {pkgName}
                            </p>
                            {spaces.map((space: any, idx: number) => (
                                <div key={idx}>
                                    {idx > 0 && <div className="h-px bg-[#F4F4F5] my-5"></div>}
                                    <SpaceCard space={space} idx={idx} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* IHS Section */}
                    {ihsEntries.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-1 mb-3">
                                <p style={FF} className="text-[14px] font-bold text-[#04222D] m-0">IHS</p>
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {ihsEntries.map(({ type, label, items }) =>
                                    items.map((item: any, idx: number) => {
                                        const itemData = item.data || {};
                                        const itemMedia = item.sampleMedia?.[0]?.url || null;
                                        const itemName = itemData.setups?.[0]?.name
                                            || itemData.packageItems?.[0]?.name
                                            || 'IHS Name';
                                        const itemCount = (itemData.setups || itemData.packageItems || itemData.addOns || []).length;
                                        const itemPrice: number = itemData.totalPackagePrice || itemData.setups?.[0]?.price || 0;
                                        return (
                                            <div key={`${type}-${idx}`} className="bg-white border border-[#F4F4F5] rounded-[16px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-[#F4F4F5] shrink-0">
                                                    {itemMedia
                                                        ? <img src={itemMedia} alt={itemName} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full bg-[#E4E4E7]" />
                                                    }
                                                </div>
                                                <div className="flex-1">
                                                    <h4 style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{itemName}</h4>
                                                    <p style={FF} className="text-[11px] text-[#A1A1AA] font-medium m-0">{label} · {itemCount} Items</p>
                                                    {itemPrice > 0 && (
                                                        <p style={FF} className="text-[13px] font-bold text-[#04222D] mt-0.5 m-0">₹ {itemPrice.toLocaleString('en-IN')}</p>
                                                    )}
                                                </div>
                                                <button className="w-6 h-6 rounded-full border border-[#04222D] flex items-center justify-center shrink-0">
                                                    <MinusCircle size={14} color="#04222D" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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
                                    const isSpace = addon.addOnType === 'Space';
                                    const sd = addon.spaceDetails || {};
                                    const sdAmenities = sd.amenities || {};
                                    const sdActivities: string[] = sd.activities || [];
                                    return (
                                        <div key={idx} className="bg-white border border-[#F4F4F5] rounded-[16px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-[#F4F4F5] shrink-0">
                                                    {imgUrl
                                                        ? <img src={imgUrl} alt={addon.name} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full bg-[#E4E4E7]" />
                                                    }
                                                </div>
                                                <div className="flex-1">
                                                    <h4 style={FF} className="text-[13px] font-bold text-[#04222D] m-0">{addon.name || ''}</h4>
                                                    <p style={FF} className="text-[11px] text-[#A1A1AA] font-medium m-0">{addon.category || addon.addOnType || ''}</p>
                                                    {addon.price > 0 && (
                                                        <p style={FF} className="text-[13px] font-bold text-[#04222D] mt-0.5 m-0">
                                                            ₹ {addon.price.toLocaleString('en-IN')}/{addon.billingUnit || 'hr'}
                                                        </p>
                                                    )}
                                                </div>
                                                <button className="w-6 h-6 rounded-full border border-[#04222D] flex items-center justify-center shrink-0">
                                                    <MinusCircle size={14} color="#04222D" />
                                                </button>
                                            </div>

                                            {isSpace && (
                                                <>
                                                    <div className="h-px border-t border-dashed border-[#E4E4E7] w-full mb-3"></div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                        {sd.spaceType && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Space Type</p>
                                                                <p style={FF} className="text-[11px] font-bold text-[#04222D] m-0">{sd.spaceType}</p>
                                                            </div>
                                                        )}
                                                        {addon.quantity > 0 && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">No. of Rooms</p>
                                                                <p style={FF} className="text-[11px] font-bold text-[#04222D] m-0">{addon.quantity}</p>
                                                            </div>
                                                        )}
                                                        {sd.environment && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Space Environment</p>
                                                                <p style={FF} className="text-[11px] font-bold text-[#04222D] m-0">{sd.environment}</p>
                                                            </div>
                                                        )}
                                                        {sd.layout && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Layout</p>
                                                                <p style={FF} className="text-[11px] font-bold text-[#04222D] m-0">{sd.layout}</p>
                                                            </div>
                                                        )}
                                                        {Object.values(sdAmenities).some((v: any) => v === true) && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">Amenities</p>
                                                                <AmenityList amenities={sdAmenities} />
                                                            </div>
                                                        )}
                                                        {sdActivities.length > 0 && (
                                                            <div>
                                                                <p style={FF} className="text-[10px] text-[#A1A1AA] mb-0.5 m-0">What can be done</p>
                                                                <ActivityList activities={sdActivities} />
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
                </div>

                <div className="px-5 mt-4 mb-4">
                    {/* Package Strength Card */}
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
                            <p style={FF} className="text-[12px] text-[#71717B] mt-1 m-0">• Packages with optional add-ons (like 'Extra Spaces' or 'Projectors') see higher average order values.</p>
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
