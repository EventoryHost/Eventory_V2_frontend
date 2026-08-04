'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Plus, Check, Trash2, ArrowLeft } from 'lucide-react';
import { SetupItem } from './Step2SetupsAndPricing';

const INPUT_STYLE = { fontFamily: 'Figtree, sans-serif' };
const INPUT_CLASS = "w-full border border-[#E4E4E7] rounded-[12px] h-12 px-4 text-[14px] text-[#030303] bg-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#04222D]";
const HEADING_STYLE = { fontFamily: 'Figtree, sans-serif', fontWeight: 700 };
const SUBTEXT_STYLE = { fontFamily: 'Figtree, sans-serif', color: '#71717A' };

const CATEGORIES = ['Flowers', 'Lighting', 'Balloons', 'Carpet/Flooring Decor', 'Custom'];
const COLOR_OPTIONS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#22C55E' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Fuchsia', hex: '#D946EF' },
    { name: 'Champagne', hex: '#F7E7CE' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Mango', hex: '#FF8243' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Gold', hex: '#EAB308' },
    { name: 'Teal', hex: '#14B8A6' },
    { name: 'Peach', hex: '#FFE5B4' },
    { name: 'Cream/Ivory', hex: '#FFFDD0' },
    { name: 'Rose Gold', hex: '#B76E79' },
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Copper', hex: '#B87333' },
    { name: 'Saffron', hex: '#F4C430' },
    { name: 'Purple', hex: '#A855F7' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Royal Blue', hex: '#4169E1' },
    { name: 'Pastel Pink', hex: '#FBCFE8' },
    { name: 'Blush', hex: '#FCE7F3' },
    { name: 'Coral', hex: '#FB923C' },
    { name: 'Mustard', hex: '#FACC15' },
];

// Sample presets for tabs
const PRESETS: Record<string, {name: string, description: string, price: number}[]> = {
    'Flowers': [
        { name: 'Marigold (Yellow)', description: 'Low Volume', price: 1000 },
        { name: 'Jasmine', description: 'High Volume', price: 1500 },
        { name: 'Tuberose(Rajnigandha)', description: 'Medium Volume', price: 1200 },
        { name: 'Seasonal Local Flowers', description: 'Low Volume', price: 800 },
    ],
    'Lighting': [
        { name: 'Fairy Lights', description: 'Color', price: 500 },
        { name: 'Pixel Lights', description: 'Color', price: 800 },
        { name: 'Chandeliers (Crystal)', description: 'Color', price: 2000 },
        { name: 'Candles (Pillar)', description: 'Color', price: 300 },
        { name: 'Marquee Lights', description: 'Color', price: 1500 },
    ]
};

interface ItemManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: SetupItem) => void;
    onDelete?: () => void;
    initialItem?: SetupItem | null;
}

export function ItemManagerModal({ isOpen, onClose, onSave, onDelete, initialItem }: ItemManagerModalProps) {
    const [view, setView] = useState<'LIST' | 'EDIT' | 'COLORS'>('LIST');
    
    // List view state
    const [activeTab, setActiveTab] = useState(CATEGORIES[0]);

    // Edit view state
    const [itemData, setItemData] = useState<Partial<SetupItem>>({});
    
    useEffect(() => {
        if (isOpen) {
            if (initialItem) {
                setItemData({ ...initialItem });
                setView('EDIT');
            } else {
                setItemData({ qty: 1, unit: 'Pcs' });
                setView('LIST');
            }
        }
    }, [isOpen, initialItem]);

    if (!isOpen) return null;

    const handleSelectPreset = (cat: string, preset: any) => {
        setItemData({
            itemType: cat,
            name: preset.name,
            qty: 1,
            unit: 'Pcs',
            price: preset.price,
            colors: []
        });
        setView('EDIT');
    };

    const handleSelectCustom = () => {
        setItemData({
            itemType: 'Custom',
            name: '',
            qty: 1,
            unit: 'Pcs',
            price: 0,
            colors: []
        });
        setView('EDIT');
    };

    const handleSaveItem = () => {
        if (!itemData.name) {
            alert('Please provide an item name');
            return;
        }
        onSave(itemData as SetupItem);
    };

    const toggleColor = (col: string) => {
        const curr = itemData.colors || [];
        if (curr.includes(col)) {
            setItemData({ ...itemData, colors: curr.filter(c => c !== col) });
        } else {
            setItemData({ ...itemData, colors: [...curr, col] });
        }
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 z-[60]"
            />

            {/* Bottom Sheet */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[24px] z-[70] flex flex-col h-[85vh] shadow-2xl overflow-hidden"
            >
                {view === 'LIST' && (
                    <div className="flex flex-col h-full">
                        <div className="p-4 pt-6 flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <h2 style={HEADING_STYLE} className="text-[18px] font-bold text-[#030303]">Add an Item</h2>
                                <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717A]">Pick one to start, or build your own</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7] transition-colors rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex overflow-x-auto px-4 gap-6 hide-scrollbar border-b border-[#E4E4E7]">
                            {CATEGORIES.filter(c => c !== 'Custom').map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`py-3 whitespace-nowrap text-[12px] transition-colors border-b-2 ${
                                        activeTab === cat 
                                        ? 'border-[#030303] text-[#030303] font-bold' 
                                        : 'border-transparent text-[#71717A] font-medium hover:text-[#030303]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-24">
                            {PRESETS[activeTab]?.map((preset, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => handleSelectPreset(activeTab, preset)}
                                    className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between cursor-pointer shadow-xs hover:bg-gray-50 transition-all"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span style={HEADING_STYLE} className="text-[14px] font-bold text-[#030303]">{preset.name}</span>
                                        <span style={SUBTEXT_STYLE} className="text-[10px] text-[#71717A]">{preset.description}</span>
                                    </div>
                                    <ChevronRight size={18} className="text-[#030303]" strokeWidth={2} />
                                </div>
                            ))}
                            
                            <div 
                                onClick={handleSelectCustom}
                                className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between cursor-pointer shadow-xs hover:bg-gray-50 transition-all mt-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] flex items-center justify-center">
                                        <Plus size={20} className="text-[#030303]" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span style={HEADING_STYLE} className="text-[14px] font-bold text-[#030303]">Add an custom item</span>
                                        <span style={SUBTEXT_STYLE} className="text-[10px] text-[#71717A]">
                                            e.g. {activeTab === 'Flowers' ? 'Flowers' : activeTab === 'Lighting' ? 'lighting' : 'Drone shot, Live streaming'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-[#030303]" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                )}

                {view === 'EDIT' && (
                    <div className="flex flex-col h-full">
                        <div className="p-4 pt-6 flex items-start justify-between border-b border-[#E4E4E7]">
                            <div className="flex flex-col gap-1">
                                <h2 style={HEADING_STYLE} className="text-[18px] font-bold text-[#030303]">Item 1</h2>
                                <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717A]">Fill out the details about the item you chose.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    if (onDelete && initialItem) {
                                        onDelete();
                                    }
                                    onClose();
                                }} 
                                className="p-2 text-[#EF4444] hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-24">
                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <label style={HEADING_STYLE} className="text-[14px]">Name of the item <span className="text-[#EF4444]">*</span></label>
                                <input
                                    type="text"
                                    value={itemData.name || ''}
                                    onChange={e => setItemData({ ...itemData, name: e.target.value })}
                                    placeholder="Placeholder"
                                    className={INPUT_CLASS}
                                    style={INPUT_STYLE}
                                />
                            </div>

                            {/* Item Type */}
                            <div className="flex flex-col gap-1.5">
                                <label style={HEADING_STYLE} className="text-[14px]">Item Type <span className="text-[#EF4444]">*</span></label>
                                <select
                                    value={itemData.itemType || 'Custom'}
                                    onChange={e => setItemData({ ...itemData, itemType: e.target.value })}
                                    className={INPUT_CLASS}
                                    style={INPUT_STYLE}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Conditional Fields based on Item Type */}
                            {itemData.itemType === 'Flowers' && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE} className="text-[14px]">Flower Type <span className="text-[#EF4444]">*</span></label>
                                        <select
                                            value={itemData.flowerType || ''}
                                            onChange={e => setItemData({ ...itemData, flowerType: e.target.value })}
                                            className={INPUT_CLASS}
                                            style={INPUT_STYLE}
                                        >
                                            <option value="">Select flower type</option>
                                            <option value="Fairy lights">Fairy lights</option>
                                            <option value="Roses">Roses</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE} className="text-[14px]">Volume <span className="text-[#EF4444]">*</span></label>
                                        <div className="flex gap-2">
                                            {['Medium', 'High', 'Low'].map(vol => (
                                                <button
                                                    key={vol}
                                                    onClick={() => setItemData({ ...itemData, volume: vol })}
                                                    className={`px-4 py-2 rounded-full border text-[14px] transition-colors ${
                                                        itemData.volume === vol 
                                                        ? 'border-[#030303] text-[#030303] font-bold shadow-sm' 
                                                        : 'border-[#E4E4E7] text-[#71717A] hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {vol}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {itemData.itemType === 'Lighting' && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE} className="text-[14px]">Lighting Type <span className="text-[#EF4444]">*</span></label>
                                        <select
                                            value={itemData.lightingType || ''}
                                            onChange={e => setItemData({ ...itemData, lightingType: e.target.value })}
                                            className={INPUT_CLASS}
                                            style={INPUT_STYLE}
                                        >
                                            <option value="">Fairy lights</option>
                                            <option value="Pixel">Pixel lights</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE} className="text-[14px]">Dimensions (L) <span className="text-[#9F9FA9] text-[12px] font-normal">(optional)</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={itemData.dimensions || ''}
                                                onChange={e => setItemData({ ...itemData, dimensions: e.target.value })}
                                                placeholder="Enter length of lighting"
                                                className={`flex-1 min-w-0 ${INPUT_CLASS.replace('w-full', '')}`}
                                                style={INPUT_STYLE}
                                            />
                                            <select
                                                className={`w-[100px] shrink-0 ${INPUT_CLASS.replace('w-full', '')}`}
                                                style={INPUT_STYLE}
                                            >
                                                <option value="CM">CM</option>
                                                <option value="M">M</option>
                                                <option value="FT">FT</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {(itemData.itemType === 'Custom' || itemData.itemType === 'Furniture') && (
                                <div className="flex flex-col gap-1.5">
                                    <label style={HEADING_STYLE} className="text-[14px]">Describe about the item <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={itemData.description || ''}
                                        onChange={e => setItemData({ ...itemData, description: e.target.value })}
                                        placeholder="e.g. Furniture details..."
                                        rows={3}
                                        className={`${INPUT_CLASS} h-auto py-3 resize-none`}
                                        style={INPUT_STYLE}
                                    />
                                </div>
                            )}

                            {/* Qty & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label style={HEADING_STYLE} className="text-[14px]">Quantity <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="number"
                                        value={itemData.qty || ''}
                                        onChange={e => setItemData({ ...itemData, qty: parseInt(e.target.value) || 0 })}
                                        placeholder="number"
                                        className={INPUT_CLASS}
                                        style={INPUT_STYLE}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label style={HEADING_STYLE} className="text-[14px]">Total Price <span className="text-[#9F9FA9] text-[12px] font-normal">(optional)</span></label>
                                    <input
                                        type="number"
                                        value={itemData.price || ''}
                                        onChange={e => setItemData({ ...itemData, price: parseInt(e.target.value) || 0 })}
                                        placeholder="price"
                                        className={INPUT_CLASS}
                                        style={INPUT_STYLE}
                                    />
                                </div>
                            </div>

                            {/* Color Options */}
                            <div className="flex flex-col gap-2">
                                <label style={HEADING_STYLE} className="text-[14px]">Color Options</label>
                                <div className="flex flex-wrap gap-4 items-center mt-1">
                                    {(itemData.colors || []).map(cName => {
                                        const color = COLOR_OPTIONS.find(c => c.name === cName);
                                        if (!color) return null;
                                        return (
                                            <div key={cName} className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                                                <span style={SUBTEXT_STYLE} className="text-[10px] text-[#030303]">{cName}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setView('COLORS')}>
                                        <div className="w-8 h-8 rounded-full border border-[#030303] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                                            <Plus size={16} className="text-[#030303]" strokeWidth={2} />
                                        </div>
                                        <span style={HEADING_STYLE} className="text-[10px] font-bold text-[#030303]">Add Color</span>
                                    </div>
                                </div>
                            </div>

                            {/* Charge more toggle */}
                            <div className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[12px] mt-2">
                                <span style={HEADING_STYLE} className="text-[14px] text-[#030303]">Charge more for larger size</span>
                                <div 
                                    onClick={() => setItemData({...itemData, chargeMoreForLargerSize: !itemData.chargeMoreForLargerSize})}
                                    className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${itemData.chargeMoreForLargerSize ? 'bg-[#04222D]' : 'bg-[#D4D4D8]'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${itemData.chargeMoreForLargerSize ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white z-20">
                            <button
                                type="button"
                                onClick={handleSaveItem}
                                style={HEADING_STYLE}
                                className="w-full h-14 flex justify-center items-center bg-[#04222D] text-white rounded-[12px] text-[16px] font-bold active:scale-[0.98] transition-transform"
                            >
                                Save {itemData.colors && itemData.colors.length > 0 ? `(${itemData.colors.length} colors selected)` : 'item'}
                            </button>
                        </div>
                    </div>
                )}

                {view === 'COLORS' && (
                    <div className="flex flex-col h-full">
                        <div className="p-4 pt-6 flex items-start gap-4 border-b border-[#E4E4E7]">
                            <button onClick={() => setView('EDIT')} className="p-1 -ml-1 text-[#030303] hover:bg-gray-100 rounded-full transition-colors mt-0.5">
                                <ArrowLeft size={20} strokeWidth={2} />
                            </button>
                            <div className="flex flex-col gap-0.5">
                                <h2 style={HEADING_STYLE} className="text-[18px] font-bold text-[#030303]">Add Colors</h2>
                                <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717A]">Select all colors you offer for this item</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 pb-24">
                            <div className="flex flex-col">
                                {COLOR_OPTIONS.map(color => {
                                    const isSelected = (itemData.colors || []).includes(color.name);
                                    return (
                                        <div 
                                            key={color.name}
                                            onClick={() => toggleColor(color.name)}
                                            className={`p-4 rounded-[12px] flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-6 h-6 rounded-full border border-gray-200 shadow-xs" style={{ backgroundColor: color.hex }} />
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[14px] ${isSelected ? 'font-bold text-[#030303]' : 'text-[#3F3F47]'}`}>{color.name}</span>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-[#04222D] flex items-center justify-center text-white">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white z-20">
                            <button
                                type="button"
                                onClick={() => setView('EDIT')}
                                style={HEADING_STYLE}
                                className="w-full h-14 flex justify-center items-center bg-[#04222D] text-white rounded-[12px] text-[16px] font-bold active:scale-[0.98] transition-transform"
                            >
                                Save {itemData.colors && itemData.colors.length > 0 ? `(${itemData.colors.length} colors selected)` : 'colors'}
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
