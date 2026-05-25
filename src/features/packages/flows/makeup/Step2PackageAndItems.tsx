'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronUp, ChevronDown, MoreHorizontal, Pencil, Trash2, Sparkles, Scissors, Droplets, Palette, Hand, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { MakeupServiceItem } from '../../shared/types';
import { Addon } from '../../components/AddonModal';

interface Props {
    makeupItems: MakeupServiceItem[];
    isItemTypeModalOpen: boolean;
    setIsItemTypeModalOpen: (v: boolean) => void;
    selectedItemType: string | null;
    setSelectedItemType: (v: string | null) => void;
    handleAddMakeupItem: () => void;
    toggleMakeupItemExpand: (id: string) => void;
    updateMakeupItemType: (id: string, type: string) => void;
    updateMakeupItem: (id: string, field: 'options' | 'brands', index: number, sub: 'name' | 'price', value: string) => void;
    handleMakeupPriceBlur: (id: string, field: 'options' | 'brands', index: number, value: string) => void;
    addMakeupItemOptionOrBrand: (id: string, field: 'options' | 'brands') => void;
    removeMakeupItemOptionOrBrand: (id: string, field: 'options' | 'brands', index: number) => void;
    setMakeupItemCustomInput: (id: string, value: 'Yes' | 'No') => void;
    deleteMakeupItem: (id: string) => void;
    activeMenuDropdown: string | null;
    setActiveMenuDropdown: (v: string | null) => void;
    addons: Addon[];
    handleOpenAddonForm: () => void;
    handleEditAddon: (addon: Addon) => void;
    deleteAddon: (id: string) => void;
    notProvidedDetails: string;
    setNotProvidedDetails: (v: string) => void;
    providedDetails: string;
    setProvidedDetails: (v: string) => void;
}

const makeupItemTypes = [
    { name: 'Makeup', icon: Sparkles },
    { name: 'Hair', icon: Scissors },
    { name: 'Skin & Spa', icon: Droplets },
    { name: 'Mehendi', icon: Palette },
    { name: 'Nail', icon: Hand },
    { name: 'Other', icon: HelpCircle },
];

/* ── Shared token classes ── */
const SECTION_LABEL = 'text-[12px] font-normal text-[#9F9FA9] leading-[18px] uppercase tracking-wide';
const INPUT = 'p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const SMALL_LABEL = 'text-[14px] font-normal text-[#3F3F47] leading-[20px]';

export default function MakeupStep2PackageAndItems({
    makeupItems,
    isItemTypeModalOpen,
    setIsItemTypeModalOpen,
    selectedItemType,
    setSelectedItemType,
    handleAddMakeupItem,
    toggleMakeupItemExpand,
    updateMakeupItemType,
    updateMakeupItem,
    handleMakeupPriceBlur,
    addMakeupItemOptionOrBrand,
    removeMakeupItemOptionOrBrand,
    setMakeupItemCustomInput,
    deleteMakeupItem,
    activeMenuDropdown,
    setActiveMenuDropdown,
    addons,
    handleOpenAddonForm,
    handleEditAddon,
    deleteAddon,
    notProvidedDetails,
    setNotProvidedDetails,
    providedDetails,
    setProvidedDetails,
}: Props) {
    const handleBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>, setter: (v: string) => void) => {
        let val = e.target.value;
        if (val.length > 0 && !val.startsWith('• ')) {
            val = '• ' + val.replace(/^•\s*/, '');
        }
        setter(val);
    };

    const handleBulletKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, value: string, setter: (v: string) => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const newValue = value.substring(0, start) + '\n• ' + value.substring(end);
            setter(newValue);
            requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 3;
            });
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6 pb-32">
                {/* Service Items Header */}
                <div className="flex items-center justify-between">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={SECTION_LABEL}>Service Items</p>
                    <button
                        onClick={() => setIsItemTypeModalOpen(true)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#04222D] text-white rounded-full text-[14px] font-normal leading-[20px]"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Service Item Cards */}
                <div className="flex flex-col gap-4">
                    {makeupItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-[12px] border border-[#E4E4E7] transition-all">
                            <div className="p-4 sm:p-6 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                                        <Sparkles size={20} className="text-[#3F3F47]" />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={item.type}
                                            onChange={(e) => updateMakeupItemType(item.id, e.target.value)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="text-[16px] font-medium text-[#030303] bg-transparent border-none focus:outline-none p-0 leading-[24px] w-full truncate"
                                        />
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] truncate">{item.options.length} Options • {item.brands.length} Brands</p>
                                    </div>
                                </div>
                                <div className="flex items-center flex-shrink-0">
                                    <button onClick={() => toggleMakeupItemExpand(item.id)} className="p-2 text-[#71717A] hover:bg-gray-100 rounded-full">
                                        {item.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    <div className="relative">
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuDropdown(activeMenuDropdown === item.id ? null : item.id); }} className="p-2 text-[#71717A] hover:bg-gray-100 rounded-full">
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {activeMenuDropdown === item.id && (
                                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-[12px] shadow-lg border border-[#E4E4E7] z-50 py-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => { deleteMakeupItem(item.id); setActiveMenuDropdown(null); }} className="w-full text-left px-4 py-2 text-[14px] font-normal text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                    <Trash2 size={16} /> Delete Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {item.isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-6 overflow-visible"
                                    >
                                        <div className="h-[1px] bg-[#E4E4E7] w-full mb-6" />

                                        {/* Options */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={SECTION_LABEL}>Options</p>
                                                <Pencil size={14} className="text-[#3F3F47] cursor-pointer" />
                                            </div>
                                            <div className="space-y-3">
                                                {item.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={opt.name}
                                                            onChange={(e) => updateMakeupItem(item.id, 'options', oIdx, 'name', e.target.value)}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className={`flex-1 min-w-0 ${INPUT}`}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt.price}
                                                            onChange={(e) => updateMakeupItem(item.id, 'options', oIdx, 'price', e.target.value)}
                                                            onBlur={(e) => handleMakeupPriceBlur(item.id, 'options', oIdx, e.target.value)}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className={`w-[85px] flex-shrink-0 text-center ${INPUT}`}
                                                        />
                                                        <button onClick={() => removeMakeupItemOptionOrBrand(item.id, 'options', oIdx)} className="w-[50px] flex-shrink-0 flex items-center justify-center bg-white border border-[#E4E4E7] rounded-[8px] text-[#71717A] hover:text-red-500 hover:border-red-500 transition-colors">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addMakeupItemOptionOrBrand(item.id, 'options')} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-4 rounded-[8px] border border-[#E4E4E7] bg-white text-[16px] font-normal text-[#9F9FA9] hover:bg-gray-50 transition-colors mt-2">
                                                    Add Option
                                                </button>
                                            </div>
                                        </div>

                                        {/* Brands */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className={SECTION_LABEL}>Brands</p>
                                                <Pencil size={14} className="text-[#3F3F47] cursor-pointer" />
                                            </div>
                                            <div className="space-y-3">
                                                {item.brands.map((brand, bIdx) => (
                                                    <div key={bIdx} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={brand.name}
                                                            onChange={(e) => updateMakeupItem(item.id, 'brands', bIdx, 'name', e.target.value)}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className={`flex-1 min-w-0 ${INPUT}`}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={brand.price}
                                                            onChange={(e) => updateMakeupItem(item.id, 'brands', bIdx, 'price', e.target.value)}
                                                            onBlur={(e) => handleMakeupPriceBlur(item.id, 'brands', bIdx, e.target.value)}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className={`w-[85px] flex-shrink-0 text-center ${INPUT}`}
                                                        />
                                                        <button onClick={() => removeMakeupItemOptionOrBrand(item.id, 'brands', bIdx)} className="w-[50px] flex-shrink-0 flex items-center justify-center bg-white border border-[#E4E4E7] rounded-[8px] text-[#71717A] hover:text-red-500 hover:border-red-500 transition-colors">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addMakeupItemOptionOrBrand(item.id, 'brands')} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-4 rounded-[8px] border border-[#E4E4E7] bg-white text-[16px] font-normal text-[#9F9FA9] hover:bg-gray-50 transition-colors mt-2">
                                                    Add Brand
                                                </button>
                                            </div>
                                        </div>

                                        {/* Custom Input */}
                                        <div className="mb-6">
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className={`${SMALL_LABEL} mb-3`}>Allow Custom Input from Customers ?</p>
                                            <div className="flex items-center gap-6">
                                                {(['Yes', 'No'] as const).map((opt) => (
                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => setMakeupItemCustomInput(item.id, opt)}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.allowCustomInput === opt ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                                            {item.allowCustomInput === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#030303]" />}
                                                        </div>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-normal text-[#27272A] leading-[24px]">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <button onClick={() => toggleMakeupItemExpand(item.id)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-4 rounded-full bg-[#04222D] hover:bg-[#031820] transition-colors text-white font-medium text-[16px] leading-[24px]">
                                            Save Item
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Extra Add-ons */}
                <div className="mt-2">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={`${SECTION_LABEL} mb-4`}>Extra Add-ons</p>
                    {addons.length > 0 && (
                        <div className="w-full mb-4 flex flex-col gap-3">
                            {addons.map((addon) => (
                                <div key={addon.id} className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-medium text-[#030303] leading-[24px]">{addon.name}</span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px]">{addon.type} • {addon.price ? `₹ ${addon.price}` : 'Free'} {addon.price && `• ${addon.billingUnit}`}</span>
                                    </div>
                                    <div className="relative">
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuDropdown(activeMenuDropdown === addon.id ? null : addon.id); }} className="hover:bg-gray-100 p-2 rounded-full text-[#71717A]"><MoreHorizontal size={20} /></button>
                                        {activeMenuDropdown === addon.id && (
                                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-[12px] shadow-lg border border-[#E4E4E7] z-50 py-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleEditAddon(addon)} className="w-full text-left px-4 py-2 text-[14px] font-normal text-[#3F3F47] hover:bg-gray-50 flex items-center gap-2 border-b border-[#F4F4F5]">
                                                    <Pencil size={16} /> Edit Add-on
                                                </button>
                                                <button onClick={() => { deleteAddon(addon.id); setActiveMenuDropdown(null); }} className="w-full text-left px-4 py-2 text-[14px] font-normal text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                    <Trash2 size={16} /> Delete Add-on
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="w-full bg-white rounded-[12px] border border-[#E4E4E7] p-6">
                        <button onClick={handleOpenAddonForm} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-6 rounded-[12px] border-[2px] border-dashed border-[#D4D4D8] text-[#9F9FA9] text-[16px] font-normal leading-[24px] bg-white hover:bg-gray-50 transition-colors">
                            Enter Add-on +
                        </button>
                    </div>
                </div>

                {/* Provided / Not Provided */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-[12px] border border-[#E4E4E7] p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wide">NOT PART OF THIS PACKAGE</h4>
                            {!notProvidedDetails.trim() && <ShieldAlert size={16} className="text-white fill-red-600" />}
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#71717A] mb-4 leading-[18px]">Enter the things that will not be provided by you</p>
                        <textarea
                            value={notProvidedDetails}
                            onChange={(e) => handleBulletChange(e, setNotProvidedDetails)}
                            onKeyDown={(e) => handleBulletKeyDown(e, notProvidedDetails, setNotProvidedDetails)}
                            placeholder="Enter Details.."
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} w-full h-24 resize-none`}
                        />
                    </div>

                    <div className="bg-white rounded-[12px] border border-[#E4E4E7] p-6">
                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wide mb-2">PART OF THIS PACKAGE</h4>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#71717A] mb-4 leading-[18px]">Enter the things that will be provided by you</p>
                        <textarea
                            value={providedDetails}
                            onChange={(e) => handleBulletChange(e, setProvidedDetails)}
                            onKeyDown={(e) => handleBulletKeyDown(e, providedDetails, setProvidedDetails)}
                            placeholder="Enter Details.."
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} w-full h-24 resize-none`}
                        />
                    </div>
                </div>
            </div>

            {/* Item Type Modal */}
            {isItemTypeModalOpen && typeof document !== 'undefined' && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsItemTypeModalOpen(false)} className="absolute inset-0 bg-black/40" />
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-[90%] max-w-[340px] bg-white rounded-[24px] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] uppercase tracking-wider mb-1">Add Item</p>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-medium text-[#030303] leading-[28px]">Choose Item Type</h3>
                            </div>
                            <button onClick={() => setIsItemTypeModalOpen(false)} className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16} className="text-[#3F3F47]" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {makeupItemTypes.map((type) => {
                                const isSelected = selectedItemType === type.name;
                                const Icon = type.icon;
                                return (
                                    <button key={type.name} onClick={() => setSelectedItemType(type.name)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[16px] transition-colors ${isSelected ? 'bg-white border-[1.5px] border-[#030303]' : 'bg-[#FAFAFA] border border-transparent'}`}>
                                        <Icon size={24} strokeWidth={1.5} className={isSelected ? 'text-[#030303]' : 'text-[#3F3F47]'} />
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[14px] font-normal leading-[20px] ${isSelected ? 'text-[#030303]' : 'text-[#3F3F47]'}`}>{type.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={handleAddMakeupItem} disabled={!selectedItemType} style={{ fontFamily: 'Figtree, sans-serif' }} className={`w-full py-4 rounded-full font-medium text-[16px] leading-[24px] transition-colors ${selectedItemType ? 'bg-[#04222D] text-white' : 'bg-[#E6E9EA] text-[#9F9FA9]'}`}>Continue</button>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}
