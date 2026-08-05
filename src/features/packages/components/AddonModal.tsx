import React from 'react';
import { ArrowLeft, Upload, FileText, X, ChevronDown, Check, Plus, PlusCircle, Info, RefreshCw } from 'lucide-react';
import PolicyBottomSheet from '../flows/pav/PolicyBottomSheet';
import { createPortal } from 'react-dom';

import { PolicyFile, SampleMediaFile, formatFileSize } from '../shared/types';
import { FilePreviewModal } from './FilePreviewModal';

export interface Addon {
    id: string;
    type: 'Service' | 'Product' | 'Space' | 'Assets';
    name: string;
    category: string;
    subCategory: string;
    quantity: string;
    description: string;
    price: string;
    billingUnit: string;
    policies: PolicyFile[];
    media: SampleMediaFile[];
    productType?: string;
    
    // PAV Addon Specific
    contentType?: string;
    duration?: string;
    pageCount?: string;
    coverType?: string;
    albumColors?: string[];
    pageFinish?: string;
    bindingType?: string;
    revisions?: string;
    noOfEditedPhotos?: string;
    fileFormat?: string;
    resolution?: string;
    videoType?: string;
    
    // Venue Addon Specific
    spaceType?: string;
    layout?: string;
    capacityStanding?: string;
    capacitySitting?: string;
    capacityDining?: string;
    environment?: 'Indoor' | 'Outdoor';
    activities?: string[];
    amenities?: string[];
    colors?: string[];
    dimensions?: string;
}

interface AddonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addon: Addon) => void;
    vendorType: string;
    addon?: Addon | null;
}

export function AddonModal({ isOpen, onClose, onSave, vendorType, addon }: AddonModalProps) {
    const [addonType, setAddonType] = React.useState<Addon['type']>('Service');
    const [addonName, setAddonName] = React.useState('');
    const [addonCategory, setAddonCategory] = React.useState('');
    const [addonSubCategory, setAddonSubCategory] = React.useState('');
    const [addonQuantity, setAddonQuantity] = React.useState('');
    const [addonDescription, setAddonDescription] = React.useState('');
    const [addonPrice, setAddonPrice] = React.useState('');
    const [addonBillingUnit, setAddonBillingUnit] = React.useState('Per hour');
        const [cancellationDocs, setCancellationDocs] = React.useState<PolicyFile[]>([]);
    const [lastMinuteDocs, setLastMinuteDocs] = React.useState<PolicyFile[]>([]);
    const [policyDocs, setPolicyDocs] = React.useState<PolicyFile[]>([]);
    const [activePolicySheet, setActivePolicySheet] = React.useState<'cancellation' | 'lastMinute' | 'general' | null>(null);
    const [addonMedia, setAddonMedia] = React.useState<SampleMediaFile[]>([]);
    const [addonProductType, setAddonProductType] = React.useState<string>('Food');
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);
    const [isNonVeg, setIsNonVeg] = React.useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
    const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = React.useState(false);
    const isCaterer = vendorType === 'Caterer' || vendorType === 'CAT';

    // Venue Addon Specific
    const [addonSpaceType, setAddonSpaceType] = React.useState('');
    const [addonLayout, setAddonLayout] = React.useState('');
    const [addonCapacityStanding, setAddonCapacityStanding] = React.useState('');
    const [addonCapacitySitting, setAddonCapacitySitting] = React.useState('');
    const [addonCapacityDining, setAddonCapacityDining] = React.useState('');
    const [addonEnvironment, setAddonEnvironment] = React.useState<'Indoor' | 'Outdoor'>('Indoor');
    const [addonActivities, setAddonActivities] = React.useState<string[]>([]);
    const [addonAmenities, setAddonAmenities] = React.useState<string[]>([]);
    const [customActivity, setCustomActivity] = React.useState('');
    const [customAmenity, setCustomAmenity] = React.useState('');
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

    const addonPolicyInputRef = React.useRef<HTMLInputElement>(null);
    const addonMediaInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            if (addon) {
                setAddonType(addon.type);
                setAddonName(addon.name);
                setAddonCategory(addon.category);
                setAddonSubCategory(addon.subCategory);
                setAddonQuantity(addon.quantity);
                
                // Parse isNonVeg out of description
                const isNonVegDesc = addon.description.startsWith('[Non-Veg: Yes]');
                setIsNonVeg(isNonVegDesc);
                const cleanDesc = addon.description.replace(/^\[Non-Veg: (Yes|No)\]\s*/, '');
                setAddonDescription(cleanDesc);

                setAddonPrice(addon.price);
                setAddonBillingUnit(addon.billingUnit || 'Per hour');
                if (addon.policies) {
                    setCancellationDocs(addon.policies.filter(p => p.name.includes('Cancellation')));
                    setLastMinuteDocs(addon.policies.filter(p => p.name.includes('Last Minute')));
                    setPolicyDocs(addon.policies.filter(p => !p.name.includes('Cancellation') && !p.name.includes('Last Minute')));
                } else {
                    setCancellationDocs([]);
                    setLastMinuteDocs([]);
                    setPolicyDocs([]);
                }
                setAddonMedia(addon.media || []);
                setAddonProductType(addon.productType || 'Food');
                setAddonSpaceType(addon.spaceType || '');
                setAddonLayout(addon.layout || '');
                setAddonCapacityStanding(addon.capacityStanding || '');
                setAddonCapacitySitting(addon.capacitySitting || '');
                setAddonCapacityDining(addon.capacityDining || '');
                setAddonEnvironment(addon.environment || 'Indoor');
                setAddonActivities(addon.activities || []);
                setAddonAmenities(addon.amenities || []);
            } else {
                setAddonType('Service');
                setAddonName('');
                setAddonCategory('');
                setAddonSubCategory('');
                setAddonQuantity('');
                setAddonDescription('');
                setAddonPrice('');
                setAddonBillingUnit(isCaterer ? 'Per Event' : 'Per hour');
                setCancellationDocs([]);
                setLastMinuteDocs([]);
                setPolicyDocs([]);
                setAddonMedia([]);
                setAddonProductType('Food');
                setAddonSpaceType('');
                setAddonLayout('');
                setAddonCapacityStanding('');
                setAddonCapacitySitting('');
                setAddonCapacityDining('');
                setAddonEnvironment('Indoor');
                setAddonActivities([]);
                setAddonAmenities([]);
                setIsNonVeg(false);
            }
        }
    }, [isOpen, addon, vendorType]);

    if (!isOpen || typeof document === 'undefined') return null;

    const handleSaveAddon = () => {
        const descriptionWithNonVeg = (isCaterer && addonType === 'Product')
            ? `[Non-Veg: ${isNonVeg ? 'Yes' : 'No'}] ${addonDescription}`
            : addonDescription;

        const billingUnitVal = (isCaterer && addonType === 'Product')
            ? 'Per Person'
            : addonBillingUnit;

        const newAddon: Addon = {
            id: addon ? addon.id : Math.random().toString(36).substring(7),
            type: addonType,
            name: addonName,
            category: addonCategory,
            subCategory: addonSubCategory,
            quantity: addonQuantity,
            description: descriptionWithNonVeg,
            price: addonPrice,
            billingUnit: billingUnitVal,
            policies: [
                ...cancellationDocs.map(d => ({ ...d, name: d.name.includes('Cancellation') ? d.name : `Cancellation Policy: ${d.name}` })),
                ...lastMinuteDocs.map(d => ({ ...d, name: d.name.includes('Last Minute') ? d.name : `Last Minute Charges: ${d.name}` })),
                ...policyDocs
            ],
            media: addonMedia,
            ...(addonType === 'Product' && { productType: addonProductType }),
            ...(addonType !== 'Service' && addonType !== 'Product' && {
                spaceType: addonSpaceType,
                layout: addonLayout,
                capacityStanding: addonCapacityStanding,
                capacitySitting: addonCapacitySitting,
                capacityDining: addonCapacityDining,
                environment: addonEnvironment,
                activities: addonActivities,
                amenities: addonAmenities
            })
        };
        onSave(newAddon);
    };

    

    

    const handleAddonMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                file,
                name: file.name,
                size: file.size,
                preview: URL.createObjectURL(file)
            }));
            setAddonMedia(prev => [...prev, ...filesArray]);
        }
        if (addonMediaInputRef.current) addonMediaInputRef.current.value = '';
    };

    const removeAddonMedia = (indexToRemove: number) => {
        setAddonMedia(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[indexToRemove].preview);
            newFiles.splice(indexToRemove, 1);
            return newFiles;
        });
    };

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return 'Existing Document';
        return `${formatFileSize(bytes)} _ Uploaded`;
    };

    return createPortal(
        <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-32 relative bg-white">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center p-6 border-b border-gray-100">
                    <button onClick={onClose} className="mr-4">
                        <ArrowLeft size={24} className="text-[#030303]" />
                    </button>
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Add-on</h2>
                </div>

                <div className="p-6 flex flex-col gap-8">
                    {/* ADD-ON TYPE */}
                    <div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-3">ADD-ON TYPE</p>
                        <div className="flex bg-[#F4F4F5] rounded-[12px] p-1 relative">
                            {vendorType === 'VEN' ? (
                                <>
                                    <button onClick={() => setAddonType('Service')} style={{ fontFamily: 'Figtree, sans-serif' }} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Service' ? 'text-white' : 'text-[#71717B]'}`}>Service</button>
                                    <button onClick={() => setAddonType('Space')} style={{ fontFamily: 'Figtree, sans-serif' }} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Space' ? 'text-white' : 'text-[#71717B]'}`}>Space</button>
                                    <button onClick={() => setAddonType('Assets')} style={{ fontFamily: 'Figtree, sans-serif' }} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Assets' ? 'text-white' : 'text-[#71717B]'}`}>Assets</button>
                                    <div className="absolute top-1 bottom-1 w-[calc(33.333%-2px)] bg-[#030303] rounded-[10px] transition-transform duration-300 ease-in-out" style={{ transform: addonType === 'Service' ? 'translateX(0)' : addonType === 'Space' ? 'translateX(100%)' : 'translateX(200%)' }} />
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setAddonType('Service')} style={{ fontFamily: 'Figtree, sans-serif' }} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Service' ? 'text-white' : 'text-[#71717B]'}`}>Service</button>
                                    <button onClick={() => setAddonType('Product')} style={{ fontFamily: 'Figtree, sans-serif' }} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Product' ? 'text-white' : 'text-[#71717B]'}`}>Product</button>
                                    <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#030303] rounded-[10px] transition-transform duration-300 ease-in-out" style={{ transform: addonType === 'Service' ? 'translateX(0)' : 'translateX(100%)' }} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Basic Details */}
                    <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7] flex flex-col gap-4">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-2">{addonType === 'Space' ? 'Add-on Space 1' : addonType === 'Assets' ? 'Asset Name' : 'Basic Details'}</h3>
                        
                        <div>
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">{addonType === 'Space' || addonType === 'Assets' ? 'Space Name' : addonType === 'Service' ? 'Service Name' : 'Product Name'}</label>
                            <input
                                type="text"
                                placeholder={addonType === 'Space' ? "Product Name" : addonType === 'Assets' ? "Product Name" : addonType === 'Service' ? "Package Name" : "Product Name"}
                                value={addonName}
                                onChange={(e) => setAddonName(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                            />
                        </div>

                        {(addonType === 'Space' || addonType === 'Assets') && (
                            <div className="relative">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">{addonType === 'Space' ? 'Space Type' : 'Asset Type'}</label>
                                <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'spaceType' ? null : 'spaceType')} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300" style={{ color: addonSpaceType ? '#030303' : '#9F9FA9' }}>
                                    {addonSpaceType || 'Placeholder'}
                                    <ChevronDown size={20} className="text-[#9F9FA9]" />
                                </button>
                                {activeDropdown === 'spaceType' && (
                                    <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2">
                                        {['Type 1', 'Type 2', 'Type 3'].map(opt => (
                                            <div key={opt} onClick={() => { setAddonSpaceType(opt); setActiveDropdown(null); }} className="px-4 py-3 cursor-pointer text-[14px] hover:bg-gray-50">{opt}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {addonType === 'Space' && (
                            <div className="relative mt-2">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Layout</label>
                                <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'layout' ? null : 'layout')} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300" style={{ color: addonLayout ? '#030303' : '#9F9FA9' }}>
                                    {addonLayout || 'Placeholder'}
                                    <ChevronDown size={20} className="text-[#9F9FA9]" />
                                </button>
                                {activeDropdown === 'layout' && (
                                    <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2">
                                        {['Theater', 'Classroom', 'Banquet'].map(opt => (
                                            <div key={opt} onClick={() => { setAddonLayout(opt); setActiveDropdown(null); }} className="px-4 py-3 cursor-pointer text-[14px] hover:bg-gray-50">{opt}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {addonType === 'Space' && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="flex flex-col items-center p-3 bg-white border border-[#E4E4E7] rounded-[12px]">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase mb-1">STANDING</span>
                                    <input type="text" placeholder="300" value={addonCapacityStanding} onChange={e => setAddonCapacityStanding(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-[16px] font-bold text-[#030303] focus:outline-none bg-transparent" />
                                </div>
                                <div className="flex flex-col items-center p-3 bg-white border border-[#E4E4E7] rounded-[12px]">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase mb-1">SITTING</span>
                                    <input type="text" placeholder="150" value={addonCapacitySitting} onChange={e => setAddonCapacitySitting(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-[16px] font-bold text-[#030303] focus:outline-none bg-transparent" />
                                </div>
                                <div className="flex flex-col items-center p-3 bg-white border border-[#E4E4E7] rounded-[12px]">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase mb-1">DINNING</span>
                                    <input type="text" placeholder="120" value={addonCapacityDining} onChange={e => setAddonCapacityDining(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-[16px] font-bold text-[#030303] focus:outline-none bg-transparent" />
                                </div>
                            </div>
                        )}

                        {(addonType === 'Space' || addonType === 'Assets') && (
                            <div className="flex flex-col gap-2 mt-4">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#3F3F47]">Space environment</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={addonEnvironment === 'Indoor'} onChange={() => setAddonEnvironment('Indoor')} className="w-4 h-4 accent-[#030303]" />
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#3F3F47] font-medium">Indoor</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={addonEnvironment === 'Outdoor'} onChange={() => setAddonEnvironment('Outdoor')} className="w-4 h-4 accent-[#030303]" />
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#3F3F47] font-medium">Outdoor</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {(addonType === 'Space' || addonType === 'Assets') && (
                            <div className="flex flex-col gap-2 mt-4">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#3F3F47]">What can be done in this Space</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Weddings', 'Corporate Events', 'Workshops', 'Product Launches', 'Art Gallery'].map(opt => {
                                        const isSel = addonActivities.includes(opt);
                                        return (
                                            <button key={opt} type="button" onClick={() => setAddonActivities(prev => isSel ? prev.filter(v => v !== opt) : [...prev, opt])} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors border ${isSel ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-[#F4F4F5] text-[#3F3F47] border-[#E4E4E7]'}`}>{opt}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {addonType === 'Space' && (
                            <div className="flex flex-col gap-2 mt-4">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#3F3F47]">Amenities</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Power', 'AC', 'Stage', 'Lighting', 'Security'].map(opt => {
                                        const isSel = addonAmenities.includes(opt);
                                        return (
                                            <button key={opt} type="button" onClick={() => setAddonAmenities(prev => isSel ? prev.filter(v => v !== opt) : [...prev, opt])} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors border ${isSel ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-[#F4F4F5] text-[#3F3F47] border-[#E4E4E7] flex items-center gap-1'}`}>{isSel && <Check size={14}/>}{opt}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {(addonType === 'Service' || addonType === 'Product') && (
                            isCaterer ? (
                                addonType === 'Service' ? (
                                    <div className="relative">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Category</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                                            }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            style={{ color: addonCategory ? '#030303' : '#9F9FA9' }}
                                        >
                                            {addonCategory || 'Choose'}
                                            <ChevronDown size={20} className="text-[#9F9FA9] transition-transform duration-200" style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                                        </button>
                                        {isCategoryDropdownOpen && (
                                            <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2">
                                                {['Food', 'Drinks', 'Others'].map(opt => (
                                                    <div
                                                        key={opt}
                                                        onClick={() => {
                                                            setAddonCategory(opt);
                                                            setIsCategoryDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-3 cursor-pointer text-[14px] hover:bg-gray-50 font-semibold text-[#030303]"
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Category Dropdown */}
                                        <div className="relative">
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Category</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                                                    setIsSubCategoryDropdownOpen(false);
                                                }}
                                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                style={{ color: addonCategory ? '#030303' : '#9F9FA9' }}
                                            >
                                                {addonCategory || 'Choose'}
                                                <ChevronDown size={20} className="text-[#9F9FA9] transition-transform duration-200" style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                                            </button>
                                            {isCategoryDropdownOpen && (
                                                <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2">
                                                    {['Food', 'Drinks', 'Other'].map(opt => (
                                                        <div
                                                            key={opt}
                                                            onClick={() => {
                                                                setAddonCategory(opt);
                                                                setAddonProductType(opt);
                                                                setAddonSubCategory('');
                                                                setIsCategoryDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-3 cursor-pointer text-[14px] hover:bg-gray-50 font-semibold text-[#030303]"
                                                        >
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sub-Category Dropdown */}
                                        <div className="relative">
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Sub- Category</label>
                                            <button
                                                type="button"
                                                disabled={!addonCategory || addonCategory === 'Other'}
                                                onClick={() => {
                                                    setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen);
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                className={`w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300 ${(!addonCategory || addonCategory === 'Other') ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                                style={{ color: addonSubCategory ? '#030303' : '#9F9FA9' }}
                                            >
                                                {addonSubCategory || 'Choose'}
                                                <ChevronDown size={20} className="text-[#9F9FA9] transition-transform duration-200" style={{ transform: isSubCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                                            </button>
                                            {isSubCategoryDropdownOpen && (
                                                <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2">
                                                    {(addonCategory === 'Food' 
                                                        ? ['Starter', 'Main Course', 'Dessert', 'Live Counter', 'Snacks'] 
                                                        : addonCategory === 'Drinks' 
                                                        ? ['Soft Drinks', 'Alcoholic Beverages', 'Beverages', 'Live Counter', 'Snacks'] 
                                                        : []
                                                    ).map(opt => (
                                                        <div
                                                            key={opt}
                                                            onClick={() => {
                                                                setAddonSubCategory(opt);
                                                                setIsSubCategoryDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-3 cursor-pointer text-[14px] hover:bg-gray-50 font-semibold text-[#030303]"
                                                        >
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Category</label>
                                        <input
                                            type="text"
                                            placeholder="Name Category"
                                            value={addonCategory}
                                            onChange={(e) => setAddonCategory(e.target.value)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Sub-Category</label>
                                        <input
                                            type="text"
                                            placeholder="Sub Category"
                                            value={addonSubCategory}
                                            onChange={(e) => setAddonSubCategory(e.target.value)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                        />
                                    </div>
                                </div>
                            )
                        )}

                        {addonType !== 'Space' && (
                            <div>
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Quantity</label>
                                <input
                                    type="text"
                                    placeholder={addonType === 'Assets' ? "Enter quantity" : "No. of Products"}
                                    value={addonQuantity}
                                    onChange={(e) => setAddonQuantity(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                />
                            </div>
                        )}

                        {isCaterer && addonType === 'Product' && (
                            <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4 mt-2">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#3F3F47]">Non Veg Product</span>
                                <div className="flex bg-[#F4F4F5] rounded-full p-0.5 border border-[#D4D4D8]">
                                    <button
                                        type="button"
                                        onClick={() => setIsNonVeg(false)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-colors ${!isNonVeg ? 'bg-[#030303] text-white shadow-xs' : 'text-[#71717B]'}`}
                                    >
                                        No
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsNonVeg(true)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-colors ${isNonVeg ? 'bg-[#030303] text-white shadow-xs' : 'text-[#71717B]'}`}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        )}

                        {(addonType === 'Service' || addonType === 'Product') && (
                            <div>
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Add Description"
                                    value={addonDescription}
                                    onChange={(e) => setAddonDescription(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none"
                                />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-2">Helper Text according to Input field.</p>
                            </div>
                        )}
                    </div>

                    {/* Choose Type (Product Only, non-caterer flow) */}
                    {addonType === 'Product' && !isCaterer && (
                        <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7] flex flex-col gap-4">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Choose Type</h3>
                            
                            <div className="flex flex-col gap-3">
                                {['Food', 'Drinks', 'Other'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setAddonProductType(type)}
                                        className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[8px] transition-colors hover:bg-gray-50 w-full text-left"
                                    >
                                        <div className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${addonProductType === type ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8] bg-white'}`}>
                                            {addonProductType === type && <Check size={14} strokeWidth={3} className="text-white" />}
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303]">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing Model */}
                    <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7] flex flex-col gap-4">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-2">Pricing Model</h3>
                        
                        {isCaterer ? (
                            addonType === 'Service' ? (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">How do you charge?</label>
                                        <div className="flex bg-[#F4F4F5] rounded-[12px] p-1 relative border border-[#D4D4D8]">
                                            <button 
                                                type="button" 
                                                onClick={() => setAddonBillingUnit('Per Event')} 
                                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                className={`flex-1 py-2.5 text-[13px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonBillingUnit === 'Per Event' ? 'bg-white text-[#030303] shadow-xs font-bold' : 'text-[#71717B]'}`}
                                            >
                                                Per Event
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setAddonBillingUnit('Per Hour')} 
                                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                className={`flex-1 py-2.5 text-[13px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonBillingUnit === 'Per Hour' ? 'bg-white text-[#030303] shadow-xs font-bold' : 'text-[#71717B]'}`}
                                            >
                                                Per Hour
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Add-on Price</label>
                                        <input
                                            type="text"
                                            placeholder="₹ 0.0"
                                            value={addonPrice}
                                            onChange={(e) => setAddonPrice(e.target.value)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Per Person Add-on Price</label>
                                    <input
                                        type="text"
                                        placeholder="₹ 0.0"
                                        value={addonPrice}
                                        onChange={(e) => setAddonPrice(e.target.value)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                    />
                                </div>
                            )
                        ) : (
                            <>
                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Add-on Price</label>
                                    <input
                                        type="text"
                                        placeholder="$ 0.0"
                                        value={addonPrice}
                                        onChange={(e) => setAddonPrice(e.target.value)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Billing Unit</label>
                                    <div className="relative">
                                        <select
                                            value={addonBillingUnit}
                                            onChange={(e) => setAddonBillingUnit(e.target.value)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        >
                                            <option>Per hour</option>
                                            <option>Per day</option>
                                            <option>Per piece</option>
                                        </select>
                                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>



                    {/* SAMPLE MEDIA */}
                    <div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-4">SAMPLE MEDIA</p>
                        <div className="bg-[#F4F4F5] p-4 rounded-[12px]">
                            <button onClick={() => addonMediaInputRef.current?.click()} className="w-full py-10 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                    <Upload size={24} className="text-[#3F3F47] stroke-2" />
                                </div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Browse or Drop media</p>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">High-res images and videos ( max 50 MB )</p>
                            </button>
                            <input type="file" ref={addonMediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleAddonMediaUpload} multiple />

                            {addonMedia.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {addonMedia.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[8px]">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div 
                                                    className="w-12 h-12 rounded-[4px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                                                    onClick={() => {
                                                        const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                        if (url) setPreviewFile({ url, name: file.name });
                                                    }}
                                                >
                                                    <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div 
                                                    className="flex-1 min-w-0 cursor-pointer hover:underline"
                                                    onClick={() => {
                                                        const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                        if (url) setPreviewFile({ url, name: file.name });
                                                    }}
                                                >
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSizeLocal(file.size)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeAddonMedia(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 z-20 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-4 w-full">
                        <button
                            onClick={onClose}
                            style={{ fontFamily: 'Figtree, sans-serif', padding: '16px 0' }}
                            className="flex-1 flex justify-center items-center bg-[#FAFAFA] border border-[#D4D4D8] text-[#030303] rounded-[16px] font-semibold text-[16px] active:scale-[0.98] transition-transform"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAddon}
                            style={{ fontFamily: 'Figtree, sans-serif', padding: '16px 0' }}
                            className="flex-[2_2_0%] flex justify-center items-center gap-4 bg-[#031b24] text-white rounded-[16px] font-semibold text-[16px] active:scale-[0.98] transition-transform"
                        >
                            Save Add-on
                        </button>
                    </div>
                </div>
            </div>

            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    fileUrl={previewFile.url}
                    fileName={previewFile.name}
                />
            )}
            {/* Policy Bottomsheets */}
            <PolicyBottomSheet
                isOpen={activePolicySheet === 'cancellation'}
                onClose={() => setActivePolicySheet(null)}
                title="Cancellation Policy"
                subtitle="Select or upload cancellation policy for your package"
                initialDocs={cancellationDocs}
                onSaveDocs={(docs) => setCancellationDocs(docs)}
            />
            <PolicyBottomSheet
                isOpen={activePolicySheet === 'lastMinute'}
                onClose={() => setActivePolicySheet(null)}
                title="Last Minute Charges"
                subtitle="Set your charges for last minute changes or extensions"
                initialDocs={lastMinuteDocs}
                onSaveDocs={(docs) => setLastMinuteDocs(docs)}
            />
            <PolicyBottomSheet
                isOpen={activePolicySheet === 'general'}
                onClose={() => setActivePolicySheet(null)}
                title="General Policy"
                subtitle="Upload or write general terms and conditions for customers"
                initialDocs={policyDocs}
                onSaveDocs={(docs) => setPolicyDocs(docs)}
            />
        </div>,
        document.body
    );
}
