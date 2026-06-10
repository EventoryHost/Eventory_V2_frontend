'use client';

import React from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Info, Camera, Video, BookOpen, Aperture, X, MoreHorizontal } from 'lucide-react';
import { AddonModal, Addon } from '../../components/AddonModal';

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
}

interface Props {
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
    { name: 'Photography', desc: 'Physical or digital goods to sell', icon: Camera },
    { name: 'Videography', desc: 'Physical or digital goods to sell', icon: Video },
    { name: 'Albums/Hardcopy', desc: 'Physical or digital goods to sell', icon: BookOpen },
    { name: 'Others', desc: 'Physical or digital goods to sell', icon: Aperture },
];

const OPTIONS = {
    coverType: ['Faux Leather', 'Acrylic Glass', 'Hardcover Image Wrap', 'Linen'],
    pageFinish: ['Lustre', 'Glossy', 'Matte', 'Silk'],
    bindingType: ['Lay-Flat Binding', 'Perfect Bound', 'Flush Mount', 'Saddle Stitch'],
    deliveryTimeline: ['7 - 15 Days (Quick Turnaround)', '15 - 30 Days (Standard)', '45 - 60 Days (Detailed Post-Production)', '90+ Days (Premium Long-form)'],
    photographyDeliveryFormat: ['JPEG', 'RAW', 'JPEG + RAW', 'TIFF'],
    videographyDeliveryFormat: ['MP4', 'MOV', 'Apple ProRes'],
    deliveryMedium: ['USB drive', 'Google Drive', 'WeTransfer', 'Hard Drive'],
    resolution: ['Full HD', '4K', '2K', '8K']
};

export default function PAVStep2PackageAndItems({
    pavItems, setPavItems,
    addons, handleOpenAddonForm, handleEditAddon, deleteAddon,
    providedDetails, setProvidedDetails,
    notProvidedDetails, setNotProvidedDetails,
    activeMenuDropdown, setActiveMenuDropdown
}: Props) {
    const [isItemTypeModalOpen, setIsItemTypeModalOpen] = React.useState(false);
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

    React.useEffect(() => {
        const handleClickOutside = () => {
            if (activeMenuDropdown) setActiveMenuDropdown(null);
            if (activeDropdown) setActiveDropdown(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenuDropdown, activeDropdown, setActiveMenuDropdown]);

    const handleAddItem = (type: string) => {
        const newItem: PAVItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemType: type,
            name: `PAV Item ${pavItems.length + 1}`,
            isExpanded: true,
            categories: [], style: '', quantity: '', description: '',
            coverType: '', pageCount: '', bindingType: '', pageFinish: '',
            deliveryFormat: '', deliveryMedium: '', deliveryTimeline: '', isVisitingIncluded: false, resolution: ''
        };
        setPavItems(prev => [...prev, newItem]);
    };

    const updateItem = (id: string, field: keyof PAVItem, value: any) => {
        setPavItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
    };

    const toggleItemExpand = (id: string) => {
        setPavItems(prev => prev.map(it => it.id === id ? { ...it, isExpanded: !it.isExpanded } : it));
    };

    const deleteItem = (id: string) => {
        setPavItems(prev => prev.filter(it => it.id !== id));
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

    const TagInput = ({ itemId, values, placeholder }: { itemId: string, values: string[], placeholder: string }) => {
        const [inputValue, setInputValue] = React.useState('');
        const handleAdd = () => {
            if (inputValue.trim() && !values.includes(inputValue.trim())) {
                updateItem(itemId, 'categories', [...values, inputValue.trim()]);
                setInputValue('');
            }
        };
        const handleRemove = (tag: string) => updateItem(itemId, 'categories', values.filter(v => v !== tag));

        return (
            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Categories of Albums</label>
                <div className="flex flex-col gap-2 p-3 bg-white border border-[#E4E4E7] rounded-[8px] focus-within:ring-1 focus-within:ring-gray-300 min-h-[56px] justify-center">
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
                    <input
                        type="text"
                        placeholder={values.length === 0 ? placeholder : ""}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                        onBlur={handleAdd}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full text-[14px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9] bg-transparent"
                    />
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
            <div className="flex flex-col gap-4 mt-2">
                {/* Section 1: Item / Content Details */}
                <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-5 flex flex-col gap-4">
                    <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{isAlbum ? 'Content Details' : 'Item Details'}</h5>
                    
                    {isAlbum && (
                        <>
                            <TagInput itemId={item.id} values={item.categories} placeholder="e.g. Wedding, Birthday" />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of pages</label>
                                <input type="text" placeholder="e.g. 40 Pages" value={item.pageCount} onChange={(e) => updateItem(item.id, 'pageCount', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Enter total number of print pages included.</p>
                            </div>
                        </>
                    )}
                    
                    {isPhoto && (
                        <>
                            <DropdownField label="Photography Styles" value={item.style} options={['Candid', 'Traditional', 'Portrait', 'Photojournalistic', 'Fine Art']} placeholder="e.g., Candid, Traditional" onChange={(v) => updateItem(item.id, 'style', v)} dropdownId={`${item.id}-style`} />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>No. of edited Photos</label>
                                <input type="text" placeholder="Placeholder" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to input field.</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Description</label>
                                <textarea placeholder="Placeholder" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} className={`${INPUT} resize-none`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            </div>
                        </>
                    )}

                    {isVideo && (
                        <>
                            <DropdownField label="Video/Movie Type" value={item.style} options={['Cinematic', 'Traditional', 'Documentary', 'Short Story']} placeholder="e.g., Cinematic, Traditional" onChange={(v) => updateItem(item.id, 'style', v)} dropdownId={`${item.id}-style`} />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of videos</label>
                                <input type="text" placeholder="Number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to input field.</p>
                            </div>
                            <DropdownField label="Resolution" value={item.resolution} options={OPTIONS.resolution} placeholder="e.g., Full HD, 4K, 2K" onChange={(v) => updateItem(item.id, 'resolution', v)} dropdownId={`${item.id}-res`} />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>About this</label>
                                <textarea placeholder="Describe your filming style and what's included" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} className={`${INPUT} resize-none`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            </div>
                        </>
                    )}
                </div>

                {/* Section 2: Album Details (Only for Albums) */}
                {isAlbum && (
                    <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-5 flex flex-col gap-4">
                        <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Album Details</h5>
                        <DropdownField label="Cover Type" value={item.coverType} options={OPTIONS.coverType} placeholder="Select cover type" onChange={(v) => updateItem(item.id, 'coverType', v)} dropdownId={`${item.id}-cover`} />
                        <DropdownField label="Page Finish" value={item.pageFinish} options={OPTIONS.pageFinish} placeholder="Dropdown" onChange={(v) => updateItem(item.id, 'pageFinish', v)} dropdownId={`${item.id}-finish`} />
                        <DropdownField label="Binding Type" value={item.bindingType} options={OPTIONS.bindingType} placeholder="Dropdown" onChange={(v) => updateItem(item.id, 'bindingType', v)} dropdownId={`${item.id}-binding`} />
                    </div>
                )}

                {/* Section 3: Logistics & Handover */}
                <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-5 flex flex-col gap-4">
                    <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Logistics & Handover</h5>
                    
                    {isAlbum && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of Revisions</label>
                                <input type="text" placeholder="Number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>How many times a client can request changes to the final product without additional charges.</p>
                            </div>
                            <DropdownField label="Delivery Timeline" value={item.deliveryTimeline} options={OPTIONS.deliveryTimeline} placeholder="e.g., 2-3 weeks" onChange={(v) => updateItem(item.id, 'deliveryTimeline', v)} dropdownId={`${item.id}-timeline`} />
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Description</label>
                                <textarea placeholder="Write Description..." value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} className={`${INPUT} resize-none`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            </div>
                        </>
                    )}

                    {(isPhoto || isVideo) && (
                        <>
                            <DropdownField label="Delivery Format" value={item.deliveryFormat} options={isPhoto ? OPTIONS.photographyDeliveryFormat : OPTIONS.videographyDeliveryFormat} placeholder={isPhoto ? "e.g., JPEG, RAW..." : "e.g., MP4, MOV"} onChange={(v) => updateItem(item.id, 'deliveryFormat', v)} dropdownId={`${item.id}-format`} />
                            <DropdownField label="Delivery Medium" value={item.deliveryMedium} options={OPTIONS.deliveryMedium} placeholder="e.g., USB drive, Google Drive" onChange={(v) => updateItem(item.id, 'deliveryMedium', v)} dropdownId={`${item.id}-medium`} />
                            <DropdownField label="Delivery Timeline" value={item.deliveryTimeline} options={OPTIONS.deliveryTimeline} placeholder="e.g., 2-3 weeks" onChange={(v) => updateItem(item.id, 'deliveryTimeline', v)} dropdownId={`${item.id}-timeline`} />
                        </>
                    )}

                    <div className="flex items-center justify-between mt-2 px-1">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#3F3F47]">Visiting Provided</span>
                        <Toggle isOn={item.isVisitingIncluded} onToggle={() => updateItem(item.id, 'isVisitingIncluded', !item.isVisitingIncluded)} />
                    </div>
                </div>

                <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItemExpand(item.id); }} 
                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                    className={`w-full py-4 mt-2 text-white rounded-full font-semibold text-[16px] tracking-wide transition-colors shadow-sm ${
                        (() => {
                            let isFilled = false;
                            if (isAlbum) isFilled = Boolean(item.categories.length > 0 && item.pageCount && item.coverType && item.pageFinish && item.bindingType && item.quantity && item.deliveryTimeline && item.description);
                            else if (isPhoto) isFilled = Boolean(item.style && item.quantity && item.description && item.deliveryFormat && item.deliveryMedium && item.deliveryTimeline);
                            else if (isVideo) isFilled = Boolean(item.style && item.quantity && item.resolution && item.description && item.deliveryFormat && item.deliveryMedium && item.deliveryTimeline);
                            else isFilled = true;
                            return isFilled ? 'bg-[#04222D] hover:bg-[#031820]' : 'bg-[#8B9A9F]';
                        })()
                    }`}>
                    Save Item
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* ── Items ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">ITEMS</span>
                    <button type="button" onClick={() => setIsItemTypeModalOpen(true)} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add Item <Plus size={16} />
                    </button>
                </div>

                {pavItems.length === 0 ? (
                    <div onClick={() => setIsItemTypeModalOpen(true)} className="w-full h-[250px] bg-white border border-dashed border-[#E4E4E7] rounded-[24px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="w-[100px] h-[100px] flex items-center justify-center mb-[-8px]">
                            <img src="/images/pav/empty_camera.png" alt="No items" className="w-full h-full object-contain opacity-80 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="text-center flex flex-col gap-1.5">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">No items</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-[18px]">To add an item click on Add Item on top<br />or in this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {pavItems.map((item) => (
                            <div key={item.id} className="bg-[#F9F9F9] border border-[#E4E4E7] rounded-[16px] flex flex-col transition-all">
                                <div className="p-5 flex items-center justify-between cursor-pointer rounded-t-[16px]" onClick={() => toggleItemExpand(item.id)}>
                                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{item.name}</h4>
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
                                        <button type="button" className="hover:text-[#030303] transition-colors flex items-center justify-center">
                                            {item.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>
                                {item.isExpanded && (
                                    <div className="px-4 pb-5 flex flex-col gap-4">
                                        {renderItemForm(item)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add-Ons ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD-ONS</span>
                    <button type="button" onClick={handleOpenAddonForm} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add <Plus size={16} />
                    </button>
                </div>

                {addons.length === 0 ? (
                    <div onClick={handleOpenAddonForm} className="w-full h-[250px] bg-white border border-dashed border-[#E4E4E7] rounded-[24px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="w-[100px] h-[100px] flex items-center justify-center mb-[-8px]">
                            <img src="/images/pav/empty_gimbal.png" alt="No Add-ons" className="w-full h-full object-contain opacity-80 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="text-center flex flex-col gap-1.5">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">No Add-ons</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-[18px]">To add an add-on click Add on top or in<br />this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {addons.map((addon) => (
                            <div key={addon.id} className="p-4 bg-white border border-[#FCE8EB] rounded-[16px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
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
                                <button type="button" onClick={() => deleteAddon(addon.id)} className="w-6 h-6 rounded-full border border-[#9F9FA9] flex items-center justify-center text-[#3F3F47] hover:bg-gray-50 flex-shrink-0">
                                    <div className="w-[10px] h-[1.5px] bg-[#3F3F47]"></div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Whats Included ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider mb-[-12px]">WHATS INCLUDED</h3>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">List everything a customer gets when they book this package</p>
                <textarea
                    placeholder="Enter details"
                    value={providedDetails}
                    onChange={(e) => setProvidedDetails(e.target.value)}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* ── Whats Not Included ── */}
            <div className={CARD}>
                <div className="flex items-center gap-2 mb-[-12px]">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider">WHATS NOT INCLUDED</h3>
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"><Info size={12} className="text-red-600" /></div>
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">Help customers know what they'll need to arrange separately</p>
                <textarea
                    placeholder="Enter details"
                    value={notProvidedDetails}
                    onChange={(e) => setNotProvidedDetails(e.target.value)}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* Choose Item Type Modal */}
            {isItemTypeModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white w-full max-w-[400px] rounded-[24px] overflow-hidden flex flex-col shadow-xl p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD ITEM</span>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303]">Choose Item Type</h3>
                            </div>
                            <button onClick={() => setIsItemTypeModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {ITEM_TYPES.map(type => (
                                <div key={type.name} onClick={() => { handleAddItem(type.name); setIsItemTypeModalOpen(false); }} className="p-4 border border-[#E4E4E7] rounded-[16px] flex items-center gap-4 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                                    <div className="w-12 h-12 flex items-center justify-center bg-[#F4F4F5] rounded-full">
                                        <type.icon size={24} className="text-[#3F3F47]" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{type.name}</span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-tight mt-1">{type.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
