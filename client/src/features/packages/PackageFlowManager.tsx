'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, ArrowLeft, Menu, Trash2, MoreHorizontal, ChevronUp, Check, PlusCircle, Pencil, Upload, X, FileText } from 'lucide-react';

interface MenuData {
    id: string;
    name: string;
    type: string;
    serviceStyles: string[];
    inventory: Record<string, string[]>;
    priceModel: string;
    billingUnit: string;
    isExpanded: boolean;
}

interface Props {
    vendorType: string;
}

const FlowConfigs: Record<string, any> = {
    CAT: {
        vendorName: "Caterer",
        steps: ['Event and Crew', 'Products and Pricing', 'Pricing & Details', 'Review'],
    },
    MAK: {
        vendorName: "Makeup Artist",
        steps: ['Basic Details', 'Services & Pricing', 'Work Portfolio', 'Review'],
    }
};

export default function PackageFlowManager({ vendorType }: Props) {
    const router = useRouter();
    const [step, setStep] = React.useState(1);
    const [variants, setVariants] = React.useState(['Premium', 'Standard']);
    const [selectedVariant, setSelectedVariant] = React.useState('Premium');
    const [isAddingVariant, setIsAddingVariant] = React.useState(false);
    const [newVariantName, setNewVariantName] = React.useState('');

    // Menu Builder State
    const [menus, setMenus] = React.useState<MenuData[]>([]);
    const [activeTabs, setActiveTabs] = React.useState<Record<string, string>>({});
    const [foodInputs, setFoodInputs] = React.useState<Record<string, string>>({});
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);

    const deleteMenu = (menuId: string) => {
        setMenus(prev => prev.filter(m => m.id !== menuId));
        setActiveMenuDropdown(null);
    };

    // Step 1 State
    const [tastingSession, setTastingSession] = React.useState('Yes');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');
    const venueNeedsOptions = ['Power', 'AC', 'Stage', 'Lighting', 'Security'];

    // Step 2 State
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const fileInputAddonsRef = React.useRef<HTMLInputElement>(null);
    const [crockeryEnabled, setCrockeryEnabled] = React.useState(true);
    const [dynamicCrockeryOptions, setDynamicCrockeryOptions] = React.useState<string[]>(['Disposable', 'Bone china']);
    const [selectedCrockery, setSelectedCrockery] = React.useState<string[]>(['Disposable']);
    const [crockeryType, setCrockeryType] = React.useState('');

    // Step 3 State
    const [teamEquipmentPrice, setTeamEquipmentPrice] = React.useState('');
    const [teamEquipmentUnit, setTeamEquipmentUnit] = React.useState('Per hour');
    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    interface GuestTier {
        range: string;
        price: string;
    }
    const [guestTiers, setGuestTiers] = React.useState<GuestTier[]>([
        { range: 'Upto 50', price: '2000' },
        { range: 'Upto 100', price: '4000' },
        { range: 'Upto 200', price: '8000' }
    ]);

    const addGuestTierOption = () => {
        setGuestTiers(prev => [...prev, { range: 'Upto X', price: '' }]);
    };

    const updateGuestTier = (index: number, field: 'range' | 'price', value: string) => {
        setGuestTiers(prev => prev.map((tier, i) => i === index ? { ...tier, [field]: value } : tier));
    };

    // Step 3 - Dynamic Pricing State
    const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = React.useState(false);

    const [weekendPricing, setWeekendPricing] = React.useState(true);
    const [weekendIncreaseType, setWeekendIncreaseType] = React.useState('Fixed Price');
    const [weekendValue, setWeekendValue] = React.useState('');
    const [weekendDays, setWeekendDays] = React.useState<string[]>(['Saturday', 'Sunday']);

    const [weekendSeason, setWeekendSeason] = React.useState(true);
    const [seasonIncreaseType, setSeasonIncreaseType] = React.useState('Fixed Price');
    const [seasonValue, setSeasonValue] = React.useState('');

    const [festivalPricing, setFestivalPricing] = React.useState(true);
    const [festivalIncreaseType, setFestivalIncreaseType] = React.useState('Fixed Price');
    const [festivalValue, setFestivalValue] = React.useState('');
    const [selectedFestivals, setSelectedFestivals] = React.useState<string[]>(['Diwali', 'New Year']);
    const [isAddingFestival, setIsAddingFestival] = React.useState(false);
    const [newFestivalName, setNewFestivalName] = React.useState('');
    const [availableFestivals, setAvailableFestivals] = React.useState<string[]>(['Diwali', 'New Year']);

    const handleAddFestival = () => {
        if (newFestivalName.trim() && !availableFestivals.includes(newFestivalName.trim())) {
            setAvailableFestivals(prev => [...prev, newFestivalName.trim()]);
            setSelectedFestivals(prev => [...prev, newFestivalName.trim()]);
        } else if (newFestivalName.trim() && !selectedFestivals.includes(newFestivalName.trim())) {
            setSelectedFestivals(prev => [...prev, newFestivalName.trim()]);
        }
        setNewFestivalName('');
        setIsAddingFestival(false);
    };

    const handleFestivalEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddFestival();
        }
    };

    const [lastMinuteBooking, setLastMinuteBooking] = React.useState(true);
    const [lastMinuteDays, setLastMinuteDays] = React.useState('');
    const [lastMinuteIncreaseType, setLastMinuteIncreaseType] = React.useState('Fixed Price');
    const [lastMinuteValue, setLastMinuteValue] = React.useState('');

    interface PolicyFile {
        name: string;
        size: number;
    }
    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const policyInputRef = React.useRef<HTMLInputElement>(null);

    const handlePolicyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size
            }));
            setPolicyFiles(prev => [...prev, ...filesArray]);
        }
        if (policyInputRef.current) policyInputRef.current.value = '';
    };

    const removePolicyFile = (indexToRemove: number) => {
        setPolicyFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    interface SampleMediaFile {
        file: File;
        name: string;
        size: number;
        preview: string;
    }
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);

    const handleSampleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                file,
                name: file.name,
                size: file.size,
                preview: URL.createObjectURL(file)
            }));
            setSampleMediaFiles(prev => [...prev, ...filesArray]);
        }
        if (sampleMediaInputRef.current) sampleMediaInputRef.current.value = '';
    };

    const removeSampleMediaFile = (indexToRemove: number) => {
        setSampleMediaFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[indexToRemove].preview);
            newFiles.splice(indexToRemove, 1);
            return newFiles;
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatPriceValue = (value: string, type: string) => {
        if (!value) return '';
        return type === 'Percentage' ? `${value} %` : `₹ ${value}`;
    };

    const formatPricePlaceholder = (type: string) => {
        return type === 'Percentage' ? '0 %' : '₹ 0.00';
    };

    const toggleVenueNeed = (need: string) => {
        setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);
    };

    const toggleCrockeryOption = (opt: string) => {
        setSelectedCrockery(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
    };

    const handleCrockeryEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && crockeryType.trim()) {
            const newValue = crockeryType.trim();
            if (!dynamicCrockeryOptions.includes(newValue)) {
                setDynamicCrockeryOptions(prev => [...prev, newValue]);
            }
            if (!selectedCrockery.includes(newValue)) {
                setSelectedCrockery(prev => [...prev, newValue]);
            }
            setCrockeryType('');
        }
    };

    const handleAddMenu = () => {
        const newId = Math.random().toString(36).substring(7);
        const newMenu: MenuData = {
            id: newId,
            name: `Menu ${menus.length + 1}`,
            type: 'Breakfast',
            serviceStyles: ['Buffet'],
            inventory: {
                Starters: [],
                'Main Course': [],
                Dessert: [],
                Drinks: []
            },
            priceModel: '',
            billingUnit: 'Per Plate',
            isExpanded: true
        };
        setMenus(prev => [...prev, newMenu]);
        setActiveTabs(prev => ({ ...prev, [newId]: 'Starters' }));
    };

    const updateMenu = (menuId: string, field: keyof MenuData, value: any) => {
        setMenus(menus.map(menu => menu.id === menuId ? { ...menu, [field]: value } : menu));
    };

    const toggleMenuServiceStyle = (menuId: string, style: string) => {
        setMenus(menus.map(menu => {
            if (menu.id !== menuId) return menu;
            const hasStyle = menu.serviceStyles.includes(style);
            return {
                ...menu,
                serviceStyles: hasStyle ? menu.serviceStyles.filter(s => s !== style) : [...menu.serviceStyles, style]
            };
        }));
    };

    const addFoodItem = (menuId: string, tab: string) => {
        const inputKey = `${menuId}-${tab}`;
        const item = foodInputs[inputKey]?.trim();
        if (!item) return;

        setMenus(menus.map(menu => {
            if (menu.id !== menuId) return menu;
            return {
                ...menu,
                inventory: {
                    ...menu.inventory,
                    [tab]: [...(menu.inventory[tab] || []), item]
                }
            };
        }));
        setFoodInputs({ ...foodInputs, [inputKey]: '' });
    };

    const removeFoodItem = (menuId: string, tab: string, itemIdx: number) => {
        setMenus(menus.map(menu => {
            if (menu.id !== menuId) return menu;
            const newTabItems = [...menu.inventory[tab]];
            newTabItems.splice(itemIdx, 1);
            return {
                ...menu,
                inventory: {
                    ...menu.inventory,
                    [tab]: newTabItems
                }
            };
        }));
    };

    const config = FlowConfigs[vendorType] || FlowConfigs.CAT;

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.push('/dashboard/inventory');
    };

    const handleAddVariant = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (newVariantName.trim()) {
            setVariants([...variants, newVariantName.trim()]);
            setSelectedVariant(newVariantName.trim());
            setNewVariantName('');
            setIsAddingVariant(false);
        } else {
            setIsAddingVariant(false);
        }
    };

    const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-gray-900">New Event Package</h1>
                </div>
                <button style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-gray-900">Save</button>
            </div>

            <div className="px-6 py-6 overflow-y-auto pb-24">
                {/* Variants Section */}
                <div className="mb-8">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Variants</p>
                    <div className="flex items-center gap-3 flex-wrap">
                        {variants.map((variant) => (
                            <button
                                key={variant}
                                onClick={() => setSelectedVariant(variant)}
                                style={{
                                    fontFamily: 'Figtree, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    lineHeight: '20px',
                                    letterSpacing: '0px',
                                    padding: selectedVariant === variant ? '8px 16px 8px 20px' : '8px 20px',
                                    minHeight: '36px'
                                }}
                                className={`flex items-center justify-center gap-2 rounded-full border transition-all text-center
                                    ${selectedVariant === variant
                                        ? 'bg-transparent border-[#030303] text-[#030303]'
                                        : 'border-[#71717B] text-[#71717B] bg-transparent'
                                    }
                                `}
                            >
                                {variant} {variant === 'Premium' && <ChevronDown size={14} strokeWidth={selectedVariant === 'Premium' ? 3 : 2} />}
                            </button>
                        ))}

                        {isAddingVariant ? (
                            <input
                                autoFocus
                                type="text"
                                value={newVariantName}
                                onChange={(e) => setNewVariantName(e.target.value)}
                                onKeyDown={handleAddVariant}
                                onBlur={() => handleAddVariant()}
                                placeholder="Variant Name"
                                className="h-8 px-4 rounded-full border border-gray-900 text-black text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-gray-900 w-32 placeholder:text-gray-400"
                            />
                        ) : (
                            <button
                                onClick={() => setIsAddingVariant(true)}
                                className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress & Title */}
                <div className="mb-8">
                    <p
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="text-[11px] font-semibold text-[#9F9FA9] uppercase mb-1 leading-4"
                    >
                        STEP {step} OF 4
                    </p>
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[22px] font-bold text-gray-900">{config.steps[step - 1]}</h2>
                    <div className="mt-4 w-full max-w-[358px] h-[6px] bg-[#E6E9EA] rounded-full overflow-hidden relative flex items-center">
                        <div
                            className="h-full bg-[#031B24] transition-all duration-300 rounded-full"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                    {/* Basic Information */}
                    {step === 1 && (
                        <div className="flex flex-col items-start gap-4 p-4 pb-6 self-stretch bg-[#FAFAFA] rounded-[8px] border border-[#D4D4D8]">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-semibold text-[#030303] leading-[28px]">Basic Information*</h3>

                            <div className="space-y-4 w-full">
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Name of the package</label>
                                    <input
                                        type="text"
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Select Categories of Events</label>
                                    <input
                                        type="text"
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-2">Helper Text according to Input field.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Technical Setup */}
                    {step === 1 && (
                        <div className="flex flex-col items-start gap-4 p-4 pb-6 self-stretch bg-[#FAFAFA] rounded-[8px] border border-[#D4D4D8]">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-semibold text-[#030303] leading-[28px]">Technical Setup</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Min Duration</label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={handleNumberKeyDown}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Max Duration</label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={handleNumberKeyDown}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Min Crew Size</label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={handleNumberKeyDown}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Max Crew Size</label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={handleNumberKeyDown}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Min Capacity(Guests)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={handleNumberKeyDown}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-2 text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Max Capacity(Guests)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={handleNumberKeyDown}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requirement-Focused */}
                    {step === 1 && (
                        <div className="flex flex-col items-start gap-4 p-4 pb-6 self-stretch bg-[#FAFAFA] rounded-[8px] border border-[#D4D4D8]">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-semibold text-[#030303] leading-[28px]">Requirement-Focused*</h3>

                            <div className="space-y-6 w-full">
                                {/* Tasting session */}
                                <div>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-3">Tasting session</p>
                                    <div className="flex items-center gap-10">
                                        <label className="flex items-center gap-[12px] cursor-pointer" onClick={() => setTastingSession('Yes')}>
                                            <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${tastingSession === 'Yes' ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                                {tastingSession === 'Yes' && <div className="w-3.5 h-3.5 rounded-full bg-[#030303]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '18px', fontWeight: 400, lineHeight: '24px', letterSpacing: '0', color: '#27272A' }}>Yes</span>
                                        </label>
                                        <label className="flex items-center gap-[12px] cursor-pointer" onClick={() => setTastingSession('No')}>
                                            <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${tastingSession === 'No' ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                                {tastingSession === 'No' && <div className="w-3.5 h-3.5 rounded-full bg-[#030303]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '18px', fontWeight: 400, lineHeight: '24px', letterSpacing: '0', color: '#27272A' }}>No</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Needs from the Venue */}
                                <div>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-3">Needs from the Venue</p>
                                    <div className="flex flex-wrap gap-3">
                                        {venueNeedsOptions.map(need => {
                                            const isSelected = venueNeeds.includes(need);
                                            return (
                                                <button
                                                    key={need}
                                                    onClick={() => toggleVenueNeed(need)}
                                                    style={{ minHeight: '32px' }}
                                                    className={`flex items-center justify-center gap-2 py-[10px] pl-[12px] pr-[16px] rounded-full border transition-all flex-[1_0_0%] ${isSelected
                                                        ? 'bg-[#04222D] border-[#04222D] text-white'
                                                        : 'bg-[#F4F4F5] border-[#E4E4E7] text-[#3F3F47]'
                                                        }`}
                                                >
                                                    {isSelected ? <Menu size={14} className="text-white" /> : <div className="w-[14px] h-[14px] rounded-full border border-[#3F3F47] flex items-center justify-center"><Plus size={10} className="text-[#3F3F47]" /></div>}
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-normal leading-tight">{need}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Request Textarea */}
                                <div className="w-full">
                                    <textarea
                                        value={venueRequest}
                                        onChange={(e) => setVenueRequest(e.target.value)}
                                        placeholder="Ask for your request here..."
                                        rows={3}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400 resize-none"
                                    />
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-2">Helper Text according to Input field.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 Content */}
                    {step === 2 && (
                        <div className="flex flex-col gap-6 w-full pb-8">
                            {/* Crockery Container */}
                            <div className="flex flex-col p-4 bg-[#FAFAFA] rounded-[8px] border border-[#D4D4D8]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-6">Crockery</h3>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9]">Include specific Crockery</p>
                                    </div>
                                    {/* Pill Toggle */}
                                    <div className="flex items-center bg-[#D4D4D8] rounded-full p-[4px] w-[104px] relative cursor-pointer" onClick={() => setCrockeryEnabled(!crockeryEnabled)}>
                                        <div className="w-[48px] text-center py-1 z-10"><span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[14px] font-semibold leading-[20px] ${!crockeryEnabled ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}>No</span></div>
                                        <div className="w-[48px] text-center py-1 z-10"><span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[14px] font-semibold leading-[20px] ${crockeryEnabled ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}>Yes</span></div>
                                        <div className={`absolute top-[4px] bottom-[4px] w-[48px] bg-white rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-200 ${crockeryEnabled ? 'translate-x-[48px]' : 'translate-x-0'}`} />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex flex-col gap-3 mb-6">
                                    {dynamicCrockeryOptions.map(opt => (
                                        <label key={opt} className="flex items-center gap-3 p-4 rounded-[8px] border border-[#E4E4E7] bg-white cursor-pointer hover:border-gray-300 transition-colors">
                                            <div className={`w-5 h-5 rounded-[4px] border-[2px] flex items-center justify-center transition-colors ${selectedCrockery.includes(opt) ? 'border-[#030303] bg-[#030303]' : 'border-gray-400 bg-white'}`}>
                                                {selectedCrockery.includes(opt) && (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span onClick={() => toggleCrockeryOption(opt)} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303]">{opt}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Crockery Type Input */}
                                <div>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#3F3F47] uppercase mb-2 leading-tight tracking-wide">Crockery Type</p>
                                    <input
                                        type="text"
                                        placeholder="Placeholder"
                                        value={crockeryType}
                                        onChange={(e) => setCrockeryType(e.target.value)}
                                        onKeyDown={handleCrockeryEnter}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                    />
                                </div>
                            </div>

                            {/* Menu Options */}
                            <div className="flex items-center justify-between w-full mt-4">
                                <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '18px', letterSpacing: '0', color: '#9F9FA9' }}>Menu Options</p>
                                <button onClick={handleAddMenu} className="flex items-center gap-2 text-[#04222D] hover:opacity-80 transition-opacity">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold">Add Menu</span>
                                    <PlusCircle size={18} className="text-[#04222D]" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Dynamic Menus List */}
                            <div className="flex flex-col gap-4">
                                {menus.map((menu, index) => (
                                    <div key={menu.id} className="w-full bg-white rounded-[16px] p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <input
                                                value={menu.name}
                                                onChange={(e) => updateMenu(menu.id, 'name', e.target.value)}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="text-[16px] font-bold text-[#030303] bg-transparent outline-none border-b border-transparent focus:border-gray-300 w-full me-4 px-1"
                                                placeholder="Menu Name"
                                            />
                                            <div className="flex items-center gap-3 text-[#3F3F47] relative">
                                                <button onClick={() => setActiveMenuDropdown(activeMenuDropdown === menu.id ? null : menu.id)} className="hover:bg-gray-200 p-1 rounded-full"><MoreHorizontal size={20} /></button>
                                                {activeMenuDropdown === menu.id && (
                                                    <div className="absolute right-8 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                        <button onClick={() => deleteMenu(menu.id)} className="w-full text-left px-4 py-2 text-[14px] text-red-600 font-semibold hover:bg-gray-50 flex items-center gap-2">
                                                            <Trash2 size={16} /> Delete Menu
                                                        </button>
                                                    </div>
                                                )}
                                                <button className="hover:bg-gray-200 p-1 rounded-full" onClick={() => updateMenu(menu.id, 'isExpanded', !menu.isExpanded)}>
                                                    {menu.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {menu.isExpanded && (
                                            <div className="flex flex-col gap-8">
                                                {/* Menu Type */}
                                                <div>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '18px', letterSpacing: '0', color: '#9F9FA9', marginBottom: '12px' }}>Menu Type</p>
                                                    <div className="flex gap-2">
                                                        {['Breakfast', 'Lunch', 'Dinner'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => updateMenu(menu.id, 'type', type)}
                                                                style={{
                                                                    fontFamily: 'Figtree, sans-serif',
                                                                    fontSize: '14px',
                                                                    fontWeight: 400,
                                                                    lineHeight: '20px',
                                                                    letterSpacing: '0px',
                                                                    textAlign: 'center'
                                                                }}
                                                                className={`px-6 py-2 rounded-full transition-colors ${menu.type === type ? 'bg-[#030303] text-[#FAFAFA]' : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-200'}`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Service Style */}
                                                <div>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '18px', letterSpacing: '0', color: '#9F9FA9', marginBottom: '12px', marginTop: '8px' }}>Service Style</p>
                                                    <div className="flex flex-col gap-2">
                                                        {['Buffet', 'Table', 'Live Counter', 'Family'].map(style => (
                                                            <button
                                                                key={style}
                                                                onClick={() => toggleMenuServiceStyle(menu.id, style)}
                                                                className={`flex items-center gap-3 p-4 rounded-[12px] border transition-all cursor-pointer ${menu.serviceStyles.includes(style) ? 'border-[#030303] bg-white' : 'border-transparent bg-[#F4F4F5]'}`}
                                                            >
                                                                <div className={`w-5 h-5 rounded-[4px] border-[2.5px] flex items-center justify-center transition-colors ${menu.serviceStyles.includes(style) ? 'border-[#030303] bg-[#030303]' : 'border-[#D4D4D8] bg-white'}`}>
                                                                    {menu.serviceStyles.includes(style) && <Check size={14} className="text-white" strokeWidth={3} />}
                                                                </div>
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{style}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Food Inventory */}
                                                <div>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '18px', letterSpacing: '0', color: '#9F9FA9', marginBottom: '12px', marginTop: '8px' }}>Food Inventory</p>

                                                    {/* Tabs */}
                                                    <div className="flex overflow-x-auto gap-4 border-b border-gray-200 mb-4 pb-0 no-scrollbar">
                                                        {['Starters', 'Main Course', 'Dessert', 'Drinks'].map(tab => {
                                                            const isActive = activeTabs[menu.id] === tab;
                                                            return (
                                                                <button
                                                                    key={tab}
                                                                    onClick={() => setActiveTabs({ ...activeTabs, [menu.id]: tab })}
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                    className={`px-1 py-2 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-[#030303] text-[#030303]' : 'border-transparent text-[#9F9FA9] hover:text-gray-700'}`}
                                                                >
                                                                    {tab}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Add Input */}
                                                    <div className="flex gap-2 mb-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Type the food"
                                                            value={foodInputs[`${menu.id}-${activeTabs[menu.id]}`] || ''}
                                                            onChange={(e) => setFoodInputs({ ...foodInputs, [`${menu.id}-${activeTabs[menu.id]}`]: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') addFoodItem(menu.id, activeTabs[menu.id] || 'Starters');
                                                            }}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="flex-1 p-3 bg-[#F4F4F5] border-none rounded-[8px] text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                                        />
                                                        <button
                                                            onClick={() => addFoodItem(menu.id, activeTabs[menu.id] || 'Starters')}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="px-6 bg-[#D4D4D8] text-[#3F3F47] font-bold text-[14px] rounded-[8px] hover:bg-gray-300 transition-colors"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="flex flex-col gap-2">
                                                        {(menu.inventory[activeTabs[menu.id] || 'Starters'] || []).map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-4 bg-white border border-[#E4E4E7] rounded-[8px]">
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">{item}</span>
                                                                <button onClick={() => removeFoodItem(menu.id, activeTabs[menu.id] || 'Starters', idx)} className="text-[#EF4444] hover:bg-red-50 p-1 rounded-md transition-colors">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pricing */}
                                                <div>
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Price Model</label>
                                                    <input
                                                        type="text"
                                                        placeholder="₹ 0.0"
                                                        value={menu.priceModel}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                                            updateMenu(menu.id, 'priceModel', value);
                                                        }}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Billing Unit</label>
                                                    <div className="relative">
                                                        <select
                                                            value={menu.billingUnit}
                                                            onChange={(e) => updateMenu(menu.id, 'billingUnit', e.target.value)}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                        >
                                                            <option>Per Plate</option>
                                                            <option>Per Package</option>
                                                        </select>
                                                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>

                                                {(() => {
                                                    const isMenuValid = menu.name.trim() !== '' && menu.serviceStyles.length > 0 && Object.values(menu.inventory).some(items => items.length > 0) && menu.priceModel.trim() !== '';
                                                    return (
                                                        <button
                                                            onClick={() => updateMenu(menu.id, 'isExpanded', false)}
                                                            disabled={!isMenuValid}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className={`w-full py-4 px-8 border border-transparent font-bold text-[16px] rounded-[52px] flex justify-center items-center gap-4 transition-colors ${isMenuValid ? 'bg-[#030303] text-white cursor-pointer active:scale-[0.98]' : 'bg-[#D4D4D8] text-[#71717B] pointer-events-none'}`}
                                                        >
                                                            Save Menu
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Extra Add-ons */}
                            <div className="w-full mt-4">
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Extra Add-ons</p>
                                <button onClick={() => fileInputAddonsRef.current?.click()} className="w-full p-4 rounded-[8px] border border-[#E4E4E7] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                                    <div className="w-full py-4 rounded-[8px] border-[1.5px] border-dashed border-[#D4D4D8] flex items-center justify-center">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9]">Entre Add-on +</span>
                                    </div>
                                </button>
                                <input type="file" ref={fileInputAddonsRef} className="hidden" accept="image/*,.pdf" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-8 w-full mt-6 pb-32">
                            {/* Team + Equipment */}
                            <div className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex flex-col gap-4">
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Team + Equipment</label>
                                    <input
                                        type="text"
                                        placeholder="₹ 0.0"
                                        value={teamEquipmentPrice}
                                        onChange={(e) => setTeamEquipmentPrice(e.target.value.replace(/[^0-9]/g, ''))}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Billing Unit</label>
                                    <div className="relative">
                                        <select
                                            value={teamEquipmentUnit}
                                            onChange={(e) => setTeamEquipmentUnit(e.target.value)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        >
                                            <option>Per hour</option>
                                            <option>Per day</option>
                                            <option>Per package</option>
                                        </select>
                                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Last Minute Charges */}
                            <div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Last Minute Charges</p>
                                <button onClick={() => lastMinuteInputRef.current?.click()} className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                        <Upload size={24} className="text-[#3F3F47] stroke-2" />
                                    </div>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Last Minute charges douments</p>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                                </button>
                                <input type="file" ref={lastMinuteInputRef} className="hidden" accept=".pdf,.doc,.docx" />
                            </div>

                            {/* Guest Range Tiers */}
                            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Guest Range Tiers</h3>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide">Guest Range</p>
                                    <button className="text-[#3F3F47] hover:text-[#030303] transition-colors"><Pencil size={16} className="stroke-2" /></button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {guestTiers.map((tier, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <select
                                                    value={tier.range}
                                                    onChange={(e) => updateGuestTier(index, 'range', e.target.value)}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-bold text-[#3F3F47] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                >
                                                    <option>Upto 50</option>
                                                    <option>Upto 100</option>
                                                    <option>Upto 200</option>
                                                    <option>Upto 500</option>
                                                    <option>Upto 1000</option>
                                                    <option>Upto X</option>
                                                </select>
                                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" />
                                            </div>
                                            <div className="h-[2px] w-4 bg-[#E4E4E7]"></div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="₹ 0"
                                                    value={tier.price ? `₹ ${tier.price}` : ''}
                                                    onChange={(e) => updateGuestTier(index, 'price', e.target.value.replace(/[^0-9]/g, ''))}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-bold text-[#3F3F47] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addGuestTierOption}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full py-4 mt-2 bg-white border border-[#030303] text-[#030303] font-bold text-[16px] rounded-[12px] hover:bg-gray-50 transition-colors"
                                >
                                    Add Option
                                </button>
                            </div>

                            {/* Dynamic Pricing (Optional) */}
                            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">Dynamic Pricing (Optional)</h3>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9]">Adjust Pricing for Busy Dates.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsDynamicPricingEnabled(!isDynamicPricingEnabled)}
                                        className={`w-12 h-6 flex items-center rounded-full transition-colors px-1 ${isDynamicPricingEnabled ? 'bg-[#030303]' : 'bg-[#E4E4E7]'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                {isDynamicPricingEnabled && (
                                    <div className="mt-8 flex flex-col gap-10">
                                        {/* Weekend Pricing */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div
                                                    onClick={() => setWeekendPricing(!weekendPricing)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${weekendPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}
                                                >
                                                    {weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                                </div>
                                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Weekend Pricing</h4>
                                            </div>

                                            {weekendPricing && (
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Increase Price By</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={weekendIncreaseType}
                                                                    onChange={(e) => setWeekendIncreaseType(e.target.value)}
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                                >
                                                                    <option>Fixed Price</option>
                                                                    <option>Percentage</option>
                                                                </select>
                                                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Value</label>
                                                            <input
                                                                type="text"
                                                                placeholder={formatPricePlaceholder(weekendIncreaseType)}
                                                                value={formatPriceValue(weekendValue, weekendIncreaseType)}
                                                                onChange={(e) => {
                                                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                                                    if (weekendIncreaseType === 'Percentage' && val !== '' && parseInt(val, 10) > 100) val = '100';
                                                                    setWeekendValue(val);
                                                                }}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {['Saturday', 'Sunday'].map(day => (
                                                            <button
                                                                key={day}
                                                                onClick={() => setWeekendDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${weekendDays.includes(day) ? 'bg-[#030303] text-white' : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-[#E4E4E7]'}`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Weekend Season */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div
                                                    onClick={() => setWeekendSeason(!weekendSeason)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${weekendSeason ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}
                                                >
                                                    {weekendSeason && <Check size={14} className="text-white stroke-[3]" />}
                                                </div>
                                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Weekend Season <span className="text-[#3F3F47] font-semibold">( Nov - Feb )</span></h4>
                                            </div>

                                            {weekendSeason && (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Increase Price By</label>
                                                        <div className="relative">
                                                            <select
                                                                value={seasonIncreaseType}
                                                                onChange={(e) => setSeasonIncreaseType(e.target.value)}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                            >
                                                                <option>Fixed Price</option>
                                                                <option>Percentage</option>
                                                            </select>
                                                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Value</label>
                                                        <input
                                                            type="text"
                                                            placeholder={formatPricePlaceholder(seasonIncreaseType)}
                                                            value={formatPriceValue(seasonValue, seasonIncreaseType)}
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/[^0-9]/g, '');
                                                                if (seasonIncreaseType === 'Percentage' && val !== '' && parseInt(val, 10) > 100) val = '100';
                                                                setSeasonValue(val);
                                                            }}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Festival Pricing */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div
                                                    onClick={() => setFestivalPricing(!festivalPricing)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${festivalPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}
                                                >
                                                    {festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                                </div>
                                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Festival Pricing</h4>
                                            </div>

                                            {festivalPricing && (
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {availableFestivals.map(fest => (
                                                            <button
                                                                key={fest}
                                                                onClick={() => setSelectedFestivals(prev => prev.includes(fest) ? prev.filter(f => f !== fest) : [...prev, fest])}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className={`px-4 py-2 flex items-center justify-center rounded-full text-[13px] font-semibold transition-colors border ${selectedFestivals.includes(fest) ? 'border-[#030303] text-[#030303]' : 'border-[#E4E4E7] text-[#3F3F47] hover:border-[#030303]'}`}
                                                            >
                                                                {fest}
                                                            </button>
                                                        ))}

                                                        {isAddingFestival ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Add festival"
                                                                    value={newFestivalName}
                                                                    onChange={(e) => setNewFestivalName(e.target.value)}
                                                                    onKeyDown={handleFestivalEnter}
                                                                    autoFocus
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                    className="w-32 py-2 px-3 bg-white border border-[#E4E4E7] rounded-full text-[13px] font-semibold text-[#030303] focus:outline-none"
                                                                />
                                                                <button onClick={handleAddFestival} className="p-2 bg-[#030303] text-white rounded-full hover:bg-gray-800 transition-colors">
                                                                    <Check size={14} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setIsAddingFestival(true)} style={{ fontFamily: 'Figtree, sans-serif' }} className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-[#E4E4E7] hover:border-[#030303] transition-colors">
                                                                <PlusCircle size={14} /> Add New
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Increase Price By</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={festivalIncreaseType}
                                                                    onChange={(e) => setFestivalIncreaseType(e.target.value)}
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                                >
                                                                    <option>Fixed Price</option>
                                                                    <option>Percentage</option>
                                                                </select>
                                                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Value</label>
                                                            <input
                                                                type="text"
                                                                placeholder={formatPricePlaceholder(festivalIncreaseType)}
                                                                value={formatPriceValue(festivalValue, festivalIncreaseType)}
                                                                onChange={(e) => {
                                                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                                                    if (festivalIncreaseType === 'Percentage' && val !== '' && parseInt(val, 10) > 100) val = '100';
                                                                    setFestivalValue(val);
                                                                }}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Last-minute Bookings */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div
                                                    onClick={() => setLastMinuteBooking(!lastMinuteBooking)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${lastMinuteBooking ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}
                                                >
                                                    {lastMinuteBooking && <Check size={14} className="text-white stroke-[3]" />}
                                                </div>
                                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Last-minute Bookings</h4>
                                            </div>

                                            {lastMinuteBooking && (
                                                <div className="flex flex-col gap-6">
                                                    <div>
                                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">If Booking Within (Number) Days</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. 7"
                                                            value={lastMinuteDays}
                                                            onChange={(e) => setLastMinuteDays(e.target.value.replace(/[^0-9]/g, ''))}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Increase Price By</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={lastMinuteIncreaseType}
                                                                    onChange={(e) => setLastMinuteIncreaseType(e.target.value)}
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                                >
                                                                    <option>Fixed Price</option>
                                                                    <option>Percentage</option>
                                                                </select>
                                                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Value</label>
                                                            <input
                                                                type="text"
                                                                placeholder={formatPricePlaceholder(lastMinuteIncreaseType)}
                                                                value={formatPriceValue(lastMinuteValue, lastMinuteIncreaseType)}
                                                                onChange={(e) => {
                                                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                                                    if (lastMinuteIncreaseType === 'Percentage' && val !== '' && parseInt(val, 10) > 100) val = '100';
                                                                    setLastMinuteValue(val);
                                                                }}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Policies & Rules Upload */}
                            <div className="mt-8">
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Policies & Rules</p>
                                <button onClick={() => policyInputRef.current?.click()} className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                        <Upload size={24} className="text-[#3F3F47] stroke-2" />
                                    </div>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                                </button>
                                <input
                                    type="file"
                                    ref={policyInputRef}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    multiple
                                    onChange={handlePolicyFileUpload}
                                />

                                {/* Uploaded Files */}
                                {policyFiles.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        {policyFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white">
                                                        <FileText size={16} className="text-[#3F3F47] stroke-2" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} _ Uploaded</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removePolicyFile(idx)} className="text-[#3F3F47] hover:text-[#030303]">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="flex flex-col gap-6">
                            <div className="border-b-4 border-gray-100 pb-4">
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Step 4 of 4</p>
                                <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303]">Sample and Media</h2>
                            </div>

                            <div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Sample Media</p>

                                <div className="bg-[#F4F4F5] p-4 rounded-[12px]">
                                    <button onClick={() => sampleMediaInputRef.current?.click()} className="w-full py-10 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                            <Upload size={24} className="text-[#3F3F47] stroke-2" />
                                        </div>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Browse or Drop media</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">High-res images and videos ( max 50 MB )</p>
                                    </button>
                                    <input
                                        type="file"
                                        ref={sampleMediaInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleSampleMediaUpload}
                                    />

                                    {sampleMediaFiles.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            {sampleMediaFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[8px]">
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeSampleMediaFile(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Nav Placeholder for Flow */}
            <div className="fixed bottom-[72px] left-0 right-0 p-6 bg-white border-t border-gray-50 z-10 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4 w-full">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            style={{ fontFamily: 'Figtree, sans-serif', padding: '16px 32px' }}
                            className="flex-1 flex justify-center items-center bg-white border border-[#E4E4E7] text-gray-900 rounded-[12px] font-semibold text-[16px] active:scale-[0.98] transition-transform"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => step < 4 && setStep(step + 1)}
                        style={{ fontFamily: 'Figtree, sans-serif', padding: '16px 32px' }}
                        className="flex-1 flex justify-center items-center gap-4 bg-[#04222D] text-white rounded-[12px] font-semibold text-[16px] active:scale-[0.98] transition-transform"
                    >
                        Save & Next
                    </button>
                </div>
            </div>
        </div>
    );
}
