'use client';

import React from 'react';
import { Plus, PlusCircle, ChevronDown, ChevronUp, Trash2, ShieldAlert, Camera, Video, BookOpen, Aperture, X, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddonModal, Addon } from '../../components/AddonModal';
import { VariantManager } from '../../components/VariantManager';

export interface PAVItem {
    id: string;
    itemType: string;
    name: string;
    isExpanded: boolean;
    categories: string[];
    style: string;
    quantity: string;
    description: string;
    coverType: string;
    pageCount: string;
    bindingType: string;
    pageFinish: string;
    deliveryFormat: string;
    deliveryMedium: string;
    deliveryTimeline: string;
    isVisitingIncluded: boolean;
    resolution: string;
    duration: string;
}

interface Props {
    packageId?: string | null;
    packageGroupId?: string | null;
    pavItems: PAVItem[];
    setPavItems: React.Dispatch<React.SetStateAction<PAVItem[]>>;
    addons: Addon[];
    handleOpenAddonForm: () => void;
    handleEditAddon: (addon: Addon) => void;
    deleteAddon: (id: string) => void;
    providedDetails: string; setProvidedDetails: (v: string) => void;
    notProvidedDetails: string; setNotProvidedDetails: (v: string) => void;
    activeMenuDropdown: string | null;
    setActiveMenuDropdown: (id: string | null) => void;
}

const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[13px] font-semibold text-[#3F3F47] pl-1';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]';
const DROPDOWN_BTN = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300';
const HELPER = 'text-[11px] text-[#9F9FA9] mt-1 pl-1';

const ITEM_TYPES = [
    { name: 'Photography', desc: 'Physical or digital goods to sell', image: 'https://dkuacgndftndz.cloudfront.net/inventory-page/camera.png' },
    { name: 'Videography', desc: 'Physical or digital goods to sell', image: 'https://dkuacgndftndz.cloudfront.net/inventory-page/video.png' },
    { name: 'Albums/Hardcopy', desc: 'Physical or digital goods to sell', image: 'https://dkuacgndftndz.cloudfront.net/inventory-page/album.png' },
];

const PAV_SUGGESTIONS: Record<string, string[]> = {
    'Album Type': ['Lay-flat Photobook', 'Flush Mount Album', 'Coffee Table Book', 'Matted Album', 'Leather Cover Album', 'Acrylic Cover Album', 'Velvet Boxed Album', 'Mini Pocket Album'],
    'Photography Styles': ['Candid Photography', 'Traditional Photography', 'Cinematic Portrait', 'Pre-Wedding Shoot', 'Bridal Portraits', 'Drone Photography', 'Black & White', 'Editorial Fashion Style', 'Documentary Style', 'Couple Romance Shoot', 'Baby Bump Shoot'],
    'Videography Styles': ['Cinematic Wedding Film', 'Traditional Video Coverage', 'Teaser & Highlights', 'Reels & Shorts Shoot', 'Live Streaming / Broadcast', 'Drone & Aerial Videography', 'Pre-Wedding Song Shoot', 'Interview / Documentary Video', '360 Video Booth']
};

const OPTIONS = {
    coverType: ['Faux Leather', 'Acrylic Glass', 'Hardcover Image Wrap', 'Linen'],
    pageFinish: ['Lustre', 'Glossy', 'Matte', 'Silk'],
    bindingType: ['Lay-Flat Binding', 'Perfect Bound', 'Flush Mount', 'Saddle Stitch'],
    deliveryTimeline: ['2-5 Days (Rapid Delivery)', '7 - 15 Days (Quick Turnaround)', '15 - 30 Days (Standard)', '45 - 60 Days (Detailed Post-Production)', '90+ Days (Premium Long-form)'],
    photographyDeliveryFormat: ['RAW & JPEG/JPG Format', 'CIF & JPEG/JPG Format', 'JPEG Format', 'Print Ready'],
    videographyDeliveryFormat: ['MP4', 'MOV', 'Apple ProRes'],
    deliveryMedium: ['USB drive', 'Google Drive', 'WeTransfer', 'Hard Drive'],
    resolution: ['Full HD', '4K', '2K', '8K']
};

const Section = ({ title, defaultExpanded = true, children, isCompleted = false, progress = '' }: any) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-[12px] flex flex-col transition-all">
            <div className={`p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isExpanded ? 'rounded-t-[12px]' : 'rounded-[12px]'}`} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${isCompleted ? 'bg-[#030303]' : 'bg-[#E4E4E7]'}`}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L3.5 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{title}</h5>
                </div>
                <div className="flex items-center gap-3 text-[#9F9FA9]">
                    {progress && <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium">{progress}</span>}
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 flex flex-col gap-5">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function PAVStep2PackageAndItems({
    packageId,
    packageGroupId,
    pavItems, setPavItems,
    addons, handleOpenAddonForm, handleEditAddon, deleteAddon,
    providedDetails, setProvidedDetails,
    notProvidedDetails, setNotProvidedDetails,
    activeMenuDropdown, setActiveMenuDropdown
}: Props) {
    const [isItemTypeModalOpen, setIsItemTypeModalOpen] = React.useState(false);
    const [activeEditItemId, setActiveEditItemId] = React.useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ title: string, message: string } | null>(null);

    const showToast = (title: string, message: string) => {
        setToast({ title, message });
        setTimeout(() => setToast(null), 3000);
    };

    React.useEffect(() => {
        const handleClickOutside = () => {
            if (activeMenuDropdown) setActiveMenuDropdown(null);
            if (activeDropdown) setActiveDropdown(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenuDropdown, activeDropdown, setActiveMenuDropdown]);

    const handleAddItem = (type: string) => {
        const typeCount = pavItems.filter(it => it.itemType === type).length + 1;
        const displayName = type === 'Albums/Hardcopy' ? 'Album' : type;
        const newItem: PAVItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemType: type,
            name: `${displayName} type ${typeCount}`,
            isExpanded: true,
            categories: [], style: '', quantity: '', duration: '', description: '',
            coverType: '', pageCount: '', bindingType: '', pageFinish: '',
            deliveryFormat: '', deliveryMedium: '', deliveryTimeline: '', isVisitingIncluded: false, resolution: ''
        };
        setPavItems(prev => [...prev, newItem]);
        setActiveEditItemId(newItem.id);
    };

    const updateItem = (id: string, field: keyof PAVItem, value: any) => {
        setPavItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
    };



    const deleteItem = (id: string) => {
        setPavItems(prev => prev.filter(it => it.id !== id));
        showToast('Item deleted !', 'Your item has been deleted successfully');
    };

    const DropdownField = ({ label, value, options, placeholder, onChange, dropdownId }: { label: string, value: string, options: string[], placeholder: string, onChange: (v: string) => void, dropdownId: string }) => (
        <div className="flex flex-col gap-1 relative">
            <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>{label}</label>
            <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId); }}
                className={DROPDOWN_BTN}
                style={{ fontFamily: 'Figtree, sans-serif', color: value ? '#030303' : '#9F9FA9' }}
            >
                {value || placeholder}
                <ChevronDown size={20} className="text-[#9F9FA9]" />
            </button>
            {activeDropdown === dropdownId && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 max-h-[220px] overflow-y-auto py-2">
                    {options.map((opt) => (
                        <div 
                            key={opt}
                            onClick={(e) => { e.stopPropagation(); onChange(opt); setActiveDropdown(null); }}
                            className="px-4 py-3 cursor-pointer text-[14px] text-[#3F3F47] hover:bg-[#F4F4F5] transition-colors"
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const TagInput = ({ itemId, label, values, placeholder }: { itemId: string, label: string, values: string[], placeholder: string }) => {
        const [inputValue, setInputValue] = React.useState('');
        const [showSuggestions, setShowSuggestions] = React.useState(false);

        const handleAdd = (valToAdd?: string) => {
            const val = (valToAdd !== undefined ? valToAdd : inputValue).trim();
            if (val && !values.includes(val)) {
                updateItem(itemId, 'categories', [...values, val]);
                setInputValue('');
            }
            setShowSuggestions(false);
        };
        const handleRemove = (tag: string) => updateItem(itemId, 'categories', values.filter(v => v !== tag));

        const suggestions = (PAV_SUGGESTIONS[label] || []).filter(s => !values.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase()));
        const hasUnselectedCustom = inputValue.trim().length > 0 && !values.includes(inputValue.trim());

        return (
            <div className="flex flex-col gap-1 relative">
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>{label}</label>
                <div className="flex flex-col gap-2 p-3 bg-white border border-[#E4E4E7] rounded-[8px] focus-within:ring-1 focus-within:ring-gray-300 min-h-[56px] justify-center relative">
                    {values.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {values.map(tag => (
                                <div key={tag} className="flex items-center gap-1.5 bg-[#04222D] text-white px-3 py-1.5 rounded-full text-[12px]">
                                    <span>{tag}</span>
                                    <button type="button" onClick={() => handleRemove(tag)} className="hover:text-gray-300 flex items-center justify-center">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative w-full">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={inputValue}
                                onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => { setShowSuggestions(false); if (inputValue.trim()) handleAdd(); }, 200)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full text-[14px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9] bg-transparent"
                            />
                            {hasUnselectedCustom && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleAdd();
                                    }}
                                    onClick={() => handleAdd()}
                                    className="px-3 py-1 bg-[#04222D] text-white rounded-full text-[13px] font-medium transition-colors hover:bg-gray-800 flex items-center gap-1 shrink-0"
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                        {showSuggestions && inputValue.trim().length > 0 && (suggestions.length > 0 || hasUnselectedCustom) && (
                            <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg max-h-48 overflow-y-auto z-50 py-1 text-left">
                                {hasUnselectedCustom && !suggestions.includes(inputValue.trim()) && (
                                    <div
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAdd(inputValue);
                                        }}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="px-4 py-2.5 cursor-pointer text-[13px] text-[#04222D] font-medium bg-[#F4F4F5]/70 hover:bg-[#F4F4F5] transition-colors border-b border-[#E4E4E7]/40 last:border-b-0"
                                    >
                                        <span>+ Add "{inputValue.trim()}"</span>
                                    </div>
                                )}
                                {suggestions.map((suggestion) => (
                                    <div
                                        key={suggestion}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAdd(suggestion);
                                        }}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="px-4 py-2.5 cursor-pointer text-[13px] text-[#3F3F47] hover:bg-[#F4F4F5] transition-colors"
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const Toggle = ({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) => (
        <button 
            type="button" 
            onClick={onToggle} 
            className={`w-[44px] h-[24px] flex items-center rounded-full p-[2px] cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${isOn ? 'bg-[#04222D]' : 'bg-[#E4E4E7]'}`}
        >
            <div className={`bg-white w-[20px] h-[20px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isOn ? 'translate-x-[20px]' : 'translate-x-0'}`} />
        </button>
    );

    const renderItemForm = (item: PAVItem) => {
        const isAlbum = item.itemType === 'Albums/Hardcopy';
        const isPhoto = item.itemType === 'Photography';
        const isVideo = item.itemType === 'Videography';

        return (
            <div className="flex flex-col gap-4">
                {/* Section 1: Item / Content Details */}
                <Section 
                    title="Item Details" 
                    isCompleted={isAlbum ? Boolean(item.categories.length > 0 && item.pageCount && item.description) : isVideo ? Boolean(item.categories.length > 0 && item.quantity && item.duration && item.resolution && item.description) : Boolean(item.categories.length > 0 && item.quantity && item.description)}
                    progress={isAlbum ? `${[item.categories.length > 0, item.pageCount, item.description].filter(Boolean).length}/3` : isVideo ? `${[item.categories.length > 0, item.quantity, item.duration, item.resolution, item.description].filter(Boolean).length}/5` : `${[item.categories.length > 0, item.quantity, item.description].filter(Boolean).length}/3`}
                >
                    {isAlbum && (
                        <>
                            <TagInput itemId={item.id} label="Album Type" values={item.categories} placeholder="Enter Album Type" />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of pages</label>
                                <input type="text" placeholder="Placeholder" value={item.pageCount} onChange={(e) => updateItem(item.id, 'pageCount', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to input field.</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Description</label>
                                <textarea placeholder="Write Description..." value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} className={`${INPUT} resize-none`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            </div>
                        </>
                    )}
                    
                    {isPhoto && (
                        <>
                            <TagInput itemId={item.id} label="Photography Styles" values={item.categories} placeholder="Enter Photography Styles" />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>No. of edited Photos</label>
                                <input type="number" placeholder="Placeholder" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} required />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>The vendor enters the number of edited photos he is going to provide</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>About this</label>
                                <textarea placeholder="Describe your photography style and what's included" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} maxLength={400} className={`${INPUT} resize-none`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Write Description...</p>
                            </div>
                        </>
                    )}

                    {isVideo && (
                        <>
                            <TagInput itemId={item.id} label="Videography Styles" values={item.categories} placeholder="Enter Videography Types" />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of videos</label>
                                <input type="text" placeholder="Enter Number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} required />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to input field.</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Duration of Video</label>
                                <input type="text" placeholder="Enter Number" value={item.duration} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} required />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to input field.</p>
                            </div>
                            <DropdownField label="Resolution" value={item.resolution} options={OPTIONS.resolution} placeholder="e.g., Full HD, 4K, 2K" onChange={(v) => updateItem(item.id, 'resolution', v)} dropdownId={`${item.id}-res`} />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>About this</label>
                                <textarea placeholder="Describe your filming style and what's included" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} maxLength={400} className={`${INPUT} resize-none`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Write Description for this item</p>
                            </div>
                        </>
                    )}
                </Section>

                {/* Section 2: Album Details (Only for Albums) */}
                {isAlbum && (
                    <Section 
                        title="Album Details"
                        defaultExpanded={false}
                        isCompleted={Boolean(item.coverType && item.pageFinish && item.bindingType)}
                        progress={`${[item.coverType, item.pageFinish, item.bindingType].filter(Boolean).length}/3`}
                    >
                        <DropdownField label="Cover Type" value={item.coverType} options={OPTIONS.coverType} placeholder="Dropdown" onChange={(v) => updateItem(item.id, 'coverType', v)} dropdownId={`${item.id}-cover`} />
                        <DropdownField label="Page Finish" value={item.pageFinish} options={OPTIONS.pageFinish} placeholder="Dropdown" onChange={(v) => updateItem(item.id, 'pageFinish', v)} dropdownId={`${item.id}-finish`} />
                        <DropdownField label="Binding Type" value={item.bindingType} options={OPTIONS.bindingType} placeholder="Dropdown" onChange={(v) => updateItem(item.id, 'bindingType', v)} dropdownId={`${item.id}-binding`} />
                    </Section>
                )}

                {/* Section 3: Logistics & Handover */}
                <Section 
                    title="Logistics & Handover"
                    defaultExpanded={false}
                    isCompleted={isAlbum ? Boolean(item.quantity && item.deliveryTimeline) : Boolean(item.deliveryFormat && item.deliveryMedium && item.deliveryTimeline)}
                    progress={isAlbum ? `${[item.quantity, item.deliveryTimeline].filter(Boolean).length}/2` : `${[item.deliveryFormat, item.deliveryMedium, item.deliveryTimeline].filter(Boolean).length}/3`}
                >
                    {isAlbum && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Revision Included</label>
                                <input type="text" placeholder="Enter Number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            </div>
                            <DropdownField label="Delivery Timeline" value={item.deliveryTimeline} options={OPTIONS.deliveryTimeline} placeholder="Dropdown + Text" onChange={(v) => updateItem(item.id, 'deliveryTimeline', v)} dropdownId={`${item.id}-timeline`} />
                        </>
                    )}

                    {(isPhoto || isVideo) && (
                        <>
                            <DropdownField label="Delivery Format" value={item.deliveryFormat} options={isPhoto ? OPTIONS.photographyDeliveryFormat : OPTIONS.videographyDeliveryFormat} placeholder={isPhoto ? "e.g., JPEG, RAW," : "e.g., MP4, MOV"} onChange={(v) => updateItem(item.id, 'deliveryFormat', v)} dropdownId={`${item.id}-format`} />
                            <DropdownField label="Delivery Medium" value={item.deliveryMedium} options={OPTIONS.deliveryMedium} placeholder="e.g., USB drive, Google Drive" onChange={(v) => updateItem(item.id, 'deliveryMedium', v)} dropdownId={`${item.id}-medium`} />
                            <DropdownField label="Delivery Timeline" value={item.deliveryTimeline} options={OPTIONS.deliveryTimeline} placeholder="e.g., 2-3 weeks" onChange={(v) => updateItem(item.id, 'deliveryTimeline', v)} dropdownId={`${item.id}-timeline`} />
                        </>
                    )}

                    <div className="flex items-center justify-between mt-2 px-1">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#3F3F47]">Visiting Provided</span>
                        <Toggle isOn={item.isVisitingIncluded} onToggle={() => updateItem(item.id, 'isVisitingIncluded', !item.isVisitingIncluded)} />
                    </div>
                </Section>

            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-32">
            <VariantManager 
                packageId={packageId || ''} 
                packageGroupId={packageGroupId || ''} 
                vendorType="PAV"
                onVariantChange={(newId) => {
                    localStorage.setItem('selected_package_id', newId);
                    window.dispatchEvent(new Event('refresh_package_flow'));
                }}
            />
            {/* ── Items ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Items <span className="text-[#E11D48]">*</span></h3>
                </div>

                {pavItems.length === 0 ? (
                    <div onClick={() => setIsItemTypeModalOpen(true)} className="w-full py-10 bg-transparent border border-dashed border-[#E4E4E7] rounded-[16px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="w-[80px] h-[80px] flex items-center justify-center">
                            <img src="/images/pav/empty_camera.png" alt="No items" className="w-full h-full object-contain" style={{ mixBlendMode: 'darken', filter: 'grayscale(1) brightness(1.15) contrast(1.2)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="text-center flex flex-col gap-1">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#3F3F47]">No items</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9] leading-[18px]">To add an item click on Add Item on top<br />or in this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {pavItems.map((item) => (
                            <div key={item.id} className="bg-[#F9F9F9] border border-[#E4E4E7] rounded-[16px] flex flex-col transition-all cursor-pointer hover:border-gray-300" onClick={() => setActiveEditItemId(item.id)}>
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{item.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#3F3F47]">
                                        <div className="relative">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuDropdown(activeMenuDropdown === item.id ? null : item.id); }} className="hover:text-[#030303] transition-colors flex items-center justify-center">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            {activeMenuDropdown === item.id && (
                                                <div className="absolute right-0 top-8 w-32 bg-white border border-[#E4E4E7] rounded-[8px] shadow-lg py-1 z-10" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); setActiveMenuDropdown(null); }}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <button type="button" onClick={() => setIsItemTypeModalOpen(true)} className="w-full py-3.5 bg-[#E6E9EA] hover:bg-gray-200 rounded-[12px] flex items-center justify-center gap-1.5 text-[15px] font-bold text-[#030303] transition-colors mt-2">
                    Add <PlusCircle size={18} strokeWidth={2} />
                </button>
            </div>

            {/* ── Add-Ons ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Add-ons <span className="text-[#E11D48]">*</span></h3>
                </div>

                {addons.length === 0 ? (
                    <div onClick={handleOpenAddonForm} className="w-full py-10 bg-transparent border border-dashed border-[#E4E4E7] rounded-[16px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="w-[80px] h-[80px] flex items-center justify-center">
                            <img src="/images/pav/empty_gimbal.png" alt="No Add-ons" className="w-full h-full object-contain" style={{ mixBlendMode: 'darken', filter: 'grayscale(1) brightness(1.15) contrast(1.2)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="text-center flex flex-col gap-1">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#3F3F47]">No Add-ons</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9] leading-[18px]">To add an add-on click Add on top or in<br />this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {addons.map((addon) => (
                            <div 
                                key={addon.id} 
                                onClick={() => handleEditAddon(addon)}
                                className="p-4 bg-white border border-[#FCE8EB] rounded-[16px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-gray-50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-[60px] h-[60px] rounded-[8px] bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                         {addon.media && addon.media[0]?.preview ? (
                                             <img src={addon.media[0].preview} alt="" className="w-full h-full object-cover" />
                                         ) : (
                                             <div className="w-full h-full bg-gradient-to-br from-[#E4E4E7] to-[#D4D4D8]"></div>
                                         )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] leading-tight">{addon.name}</h4>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-1">{addon.productType || 'Product'}/{addon.category || 'Category'}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mt-1">₹ {addon.price}</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAddon(addon.id);
                                        showToast('Item deleted !', 'Your item has been deleted successfully');
                                    }} 
                                    className="w-6 h-6 rounded-full border border-[#9F9FA9] flex items-center justify-center text-[#3F3F47] hover:bg-gray-50 flex-shrink-0"
                                >
                                    <div className="w-[10px] h-[1.5px] bg-[#3F3F47]"></div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button type="button" onClick={handleOpenAddonForm} className="w-full py-3.5 bg-[#E6E9EA] hover:bg-gray-200 rounded-[12px] flex items-center justify-center gap-1.5 text-[15px] font-bold text-[#030303] transition-colors mt-2">
                    Add <PlusCircle size={18} strokeWidth={2} />
                </button>
            </div>

            {/* ── About The Package ── */}
            <div className="bg-white border border-[#E4E4E7] rounded-[16px] p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">About The Package</h3>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9]">List everything a customer gets when they book this package</p>
                </div>
                <textarea
                    placeholder="Enter details"
                    value={providedDetails}
                    onChange={(e) => setProvidedDetails(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = providedDetails || '';
                            const toAppend = val.length === 0 ? '• ' : '\n• ';
                            setProvidedDetails(val + toAppend);
                        }
                    }}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* ── What's Not Included ── */}
            <div className="bg-white border border-[#E4E4E7] rounded-[16px] p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">What's Not Included</h3>
                        <ShieldAlert size={18} className="text-white fill-[#E11D48]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9]">Help customers know what they'll need to arrange separately</p>
                </div>
                <textarea
                    placeholder="Enter details"
                    value={notProvidedDetails}
                    onChange={(e) => setNotProvidedDetails(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = notProvidedDetails || '';
                            const toAppend = val.length === 0 ? '• ' : '\n• ';
                            setNotProvidedDetails(val + toAppend);
                        }
                    }}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* Choose Item Type Modal */}
            <AnimatePresence>
                {isItemTypeModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#030303]/40 flex items-end justify-center z-[100] sm:items-center sm:p-4" onClick={() => setIsItemTypeModalOpen(false)}>
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white w-full sm:max-w-[400px] rounded-t-[24px] sm:rounded-[24px] overflow-hidden flex flex-col shadow-xl p-6 pb-12 sm:pb-6 relative" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1.5">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD ITEM</span>
                                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[22px] font-bold text-[#030303] leading-none">Choose Item Type</h3>
                                </div>
                                <button onClick={() => setIsItemTypeModalOpen(false)} className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] hover:bg-gray-200 transition-colors mt-[-4px]">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {ITEM_TYPES.map(type => (
                                    <div key={type.name} onClick={() => { handleAddItem(type.name); setIsItemTypeModalOpen(false); }} className="px-5 py-5 border border-[#E4E4E7] rounded-[20px] flex items-center gap-5 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center justify-center flex-shrink-0 w-[40px] h-[40px]">
                                            <img src={type.image} alt={type.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[17px] font-bold text-[#030303] leading-tight">{type.name}</span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9] leading-[18px] mt-1 pr-6">{type.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit / Create Item Modal */}
            <AnimatePresence>
                {activeEditItemId && (() => {
                    const item = pavItems.find(it => it.id === activeEditItemId);
                    if (!item) return null;
                    const isAlbum = item.itemType === 'Albums/Hardcopy';
                    const isPhoto = item.itemType === 'Photography';
                    const isVideo = item.itemType === 'Videography';
                    let isFilled = false;
                    if (isAlbum) isFilled = Boolean(item.categories.length > 0 && item.pageCount && item.coverType && item.pageFinish && item.bindingType && item.quantity && item.deliveryTimeline && item.description);
                    else if (isPhoto) isFilled = Boolean(item.categories.length > 0 && item.quantity && item.description && item.deliveryFormat && item.deliveryMedium && item.deliveryTimeline);
                    else if (isVideo) isFilled = Boolean(item.categories.length > 0 && item.quantity && item.duration && item.resolution && item.description && item.deliveryFormat && item.deliveryMedium && item.deliveryTimeline);
                    else isFilled = true;
                    
                    return (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center sm:bg-[#030303]/40 sm:p-4">
                            <motion.div 
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="bg-[#F9F9F9] w-full h-full sm:max-w-[480px] sm:h-auto sm:max-h-[90vh] sm:rounded-[24px] overflow-hidden flex flex-col sm:shadow-xl relative"
                            >
                                {/* Header */}
                                <div className="px-6 py-6 flex items-start justify-between shrink-0 bg-white border-b border-[#F4F4F5]">
                                    <div className="flex flex-col gap-1.5">
                                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] leading-none">{item.name}</h3>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9]">Fill out the details about the item you chose.</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { deleteItem(item.id); setActiveEditItemId(null); }}
                                        className="text-[#E11D48] hover:bg-red-50 p-2 rounded-full transition-colors mt-[-4px] mr-[-8px]"
                                    >
                                        <Trash2 size={22} strokeWidth={1.5} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4">
                                    {renderItemForm(item)}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-white border-t border-[#F4F4F5] shrink-0">
                                    <button 
                                        type="button"
                                        onClick={() => setActiveEditItemId(null)}
                                        disabled={!isFilled}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`w-full py-4 text-white rounded-full font-bold text-[16px] transition-colors ${isFilled ? 'bg-[#04222D] hover:bg-[#031820]' : 'bg-[#8B9A9F] cursor-not-allowed'}`}
                                    >
                                        Save Item
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] bg-[#FCF8F1] border border-[#F3E2C7] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 flex items-start justify-between z-[110] transition-all duration-300 transform translate-y-0 opacity-100">
                    <div className="flex gap-3 items-start">
                        <div className="w-[20px] h-[20px] rounded-[4px] bg-[#D45900] flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-white text-[14px] font-bold leading-none">!</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#D45900]">{toast.title}</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47]">{toast.message}</p>
                        </div>
                    </div>
                    <button onClick={() => setToast(null)} className="text-[#3F3F47] hover:text-black transition-colors mt-0.5">
                        <X size={18} strokeWidth={1.5} />
                    </button>
                </div>
            )}
        </div>
    );
}
