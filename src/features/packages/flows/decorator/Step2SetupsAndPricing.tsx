'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, MoreHorizontal, Pencil, Trash2, X, ShieldAlert, Check, PlusCircle, Camera, Edit2, ChevronRight, ArrowLeft, MinusCircle } from 'lucide-react';
import { Addon, AddonModal } from '../../components/AddonModal';

// Setup types mapped to the backend mongoose schema
export interface SetupItem {
    name: string;
    itemType?: string;
    flowerType?: string;
    volume?: string;
    lightingType?: string;
    dimensions?: string;
    colors?: string[];
    chargeMoreForLargerSize?: boolean;
    description?: string;
    qty: number;
    unit: string;
    price: number;
}

export interface Setup {
    id: string; // Temporary ID for frontend operations
    name: string;
    setupPhoto: string;
    referenceStyle: string; // Indoor/Outdoor/Both
    description: string;
    price: string;
    decoratingWhat: string; // What are you decorating?
    structuresIncluded?: string[]; // Added for Figma match
    themes?: string[]; // Added for Figma match
    items: SetupItem[];
}

import { ItemManagerModal } from './ItemManagerModal';

interface Props {
    setups: Setup[];
    handleAddSetup: (setup: Setup) => void;
    handleEditSetup: (setup: Setup) => void;
    deleteSetup: (id: string) => void;
    
    addons: Addon[];
    handleOpenAddonForm: () => void;
    handleEditAddon: (addon: Addon) => void;
    deleteAddon: (id: string) => void;
    
    notProvidedDetails: string;
    setNotProvidedDetails: (v: string) => void;
    providedDetails: string;
    setProvidedDetails: (v: string) => void;
}

// ── Figma Design Tokens & Typography Styles ──
const HEADING_STYLE = {
    color: 'var(--Text-Neutral-primary, #030303)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--H6-Font-size, 20px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 600)',
    lineHeight: 'var(--H6-Line-height, 28px)',
    letterSpacing: 'var(--H6-Letter-spacing, 0)',
};

const INPUT_STYLE = {
    color: 'var(--Input-text-value, #030303)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const SUBTEXT_STYLE = {
    color: 'var(--Text-Neutral-secondary, #3F3F47)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const DECORATION_ITEMS_STYLE = {
    color: 'var(--Text-Neutral-tertiary, #9F9FA9)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const FOOTNOTE_STYLE = {
    color: 'var(--Text-Neutral-primary, #030303)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--footnote-Font-size, 12px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 700)',
    lineHeight: 'var(--footnote-Line-height, 18px)',
    letterSpacing: 'var(--caption-Letter-spacing, 0)',
};

const SECTION_LABEL = 'text-[12px] font-bold text-[#9F9FA9] leading-[18px] uppercase tracking-[0.05em]';
const INPUT_CLASS = 'p-4 bg-white border border-[#E4E4E7] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal';

// Pre-defined stock styles for decorator flow
const STOCK_STYLES = [
    {
        id: 'style_floral_arch',
        name: 'Floral Arch',
        setupPhoto: 'https://dkuacgndftndz.cloudfront.net/inventory-page/floral%20arch.png',
        referenceStyle: 'Indoor',
        description: 'Includes: Flowers, Frame, Drapes',
        price: '2500',
        decoratingWhat: 'Door',
        items: [
            { name: 'Steel Frame (Adjustable)', itemType: 'Custom', qty: 1, unit: 'Units', price: 120 },
            { name: 'Fresh Flowers (Roses & Orchids)', itemType: 'Flowers', flowerType: 'Rose', volume: 'Medium', qty: 50, unit: 'Pcs', price: 15 },
            { name: 'Drapes (Satin / Silk)', itemType: 'Custom', qty: 4, unit: 'Meters', price: 200 }
        ]
    },
    {
        id: 'style_royal_table',
        name: 'Royal Table Decor',
        setupPhoto: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600',
        referenceStyle: 'Indoor',
        description: 'Includes: Floral centerpieces, Candles, Tableware',
        price: '4500',
        decoratingWhat: 'Dining Area',
        items: [
            { name: 'Floral Centerpiece', itemType: 'Flowers', flowerType: 'Mixed', volume: 'Medium', qty: 10, unit: 'Pcs', price: 300 },
            { name: 'Scented Candle Holders', itemType: 'Lighting', lightingType: 'Candles', qty: 20, unit: 'Pcs', price: 50 },
        ]
    }
];

// Reusable Multi-Select Pills Component
const MultiSelectPills = ({ 
    options, 
    selected, 
    onChange, 
    customInputPlaceholder 
}: { 
    options: string[], 
    selected: string[], 
    onChange: (val: string[]) => void,
    customInputPlaceholder: string
}) => {
    const [customValue, setCustomValue] = React.useState('');

    const toggle = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(o => o !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    const handleCustomSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customValue.trim() !== '') {
            e.preventDefault();
            if (!selected.includes(customValue.trim())) {
                onChange([...selected, customValue.trim()]);
            }
            setCustomValue('');
        }
    };

    const allOptions = Array.from(new Set([...options, ...selected]));

    return (
        <div className="flex flex-col gap-3 p-4 border border-[#E4E4E7] rounded-[16px] bg-white shadow-sm">
            <div className="flex flex-wrap gap-2">
                {allOptions.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`px-4 py-2 rounded-full text-[14px] transition-colors flex items-center gap-1.5 ${
                            selected.includes(opt) 
                            ? 'bg-[#04222D] text-white border border-[#04222D] font-normal' 
                            : 'bg-[#F4F4F5] text-[#030303] border border-transparent hover:bg-gray-200 font-normal'
                        }`}
                    >
                        {opt}
                        {selected.includes(opt) && <span className="flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>}
                    </button>
                ))}
            </div>
            <input
                type="text"
                placeholder={customInputPlaceholder}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={handleCustomSubmit}
                className="w-full text-[12px] bg-transparent border-none focus:outline-none placeholder:text-[#9F9FA9] text-[#030303] mt-1"
                style={{ fontFamily: 'Figtree, sans-serif' }}
            />
        </div>
    );
};

export default function DecoratorStep2SetupsAndPricing({
    setups,
    handleAddSetup,
    handleEditSetup,
    deleteSetup,
    addons,
    handleOpenAddonForm,
    handleEditAddon,
    deleteAddon,
    notProvidedDetails,
    setNotProvidedDetails,
    providedDetails,
    setProvidedDetails,
}: Props) {
    const [isSetupModalOpen, setIsSetupModalOpen] = React.useState(false);
    const [modalStage, setModalStage] = React.useState<'CHOOSE_STYLE' | 'EDIT_SETUP'>('CHOOSE_STYLE');
    const [selectedStyleId, setSelectedStyleId] = React.useState<string | null>(null);
    const [editingSetupId, setEditingSetupId] = React.useState<string | null>(null);
    const totalCalculatedPrice = setups.reduce((acc, setup) => {
        const itemsTotal = (setup.items || []).reduce((iAcc, item) => iAcc + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
        return acc + (Number(setup.price) || 0) + itemsTotal;
    }, 0) + addons.reduce((acc, addon) => acc + (Number(addon.price) || 0), 0);

    // Setup Custom Form States
    const [setupName, setSetupName] = React.useState('');
    const [isCustomName, setIsCustomName] = React.useState(false);
    
    const [setupDecoratingWhat, setSetupDecoratingWhat] = React.useState('Door');
    const [setupDecoratingWhatList, setSetupDecoratingWhatList] = React.useState<string[]>([]);
    
    const [setupStructures, setSetupStructures] = React.useState<string[]>([]);
    const [setupThemes, setSetupThemes] = React.useState<string[]>([]);

    const [setupReferenceStyle, setSetupReferenceStyle] = React.useState('Indoor'); // Indoor/Outdoor/Both
    const [setupDescription, setSetupDescription] = React.useState('');
    const [setupPrice, setSetupPrice] = React.useState('');
    const [setupPhoto, setSetupPhoto] = React.useState('');
    const [setupItems, setSetupItems] = React.useState<SetupItem[]>([]);

    // Inline item edit state in setup wizard
    const [editingItemIndex, setEditingItemIndex] = React.useState<number | null>(null);
    const [isItemManagerOpen, setIsItemManagerOpen] = React.useState(false);
    const [itemEditName, setItemEditName] = React.useState('');
    const [itemEditQty, setItemEditQty] = React.useState(1);
    const [itemEditUnit, setItemEditUnit] = React.useState('Pcs');
    const [itemEditPrice, setItemEditPrice] = React.useState(0);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Open wizard for creation
    const openCreateSetup = () => {
        setEditingSetupId(null);
        setSelectedStyleId(STOCK_STYLES[0].id);
        setModalStage('CHOOSE_STYLE');
        setIsSetupModalOpen(true);
    };

    // Open wizard for editing
    const openEditSetup = (setup: Setup) => {
        setEditingSetupId(setup.id);
        setSetupName(setup.name);
        
        setSetupDecoratingWhat(setup.decoratingWhat);
        setSetupDecoratingWhatList(setup.decoratingWhat ? setup.decoratingWhat.split(', ') : []);
        setSetupStructures(setup.structuresIncluded || []);
        setSetupThemes(setup.themes || []);

        setSetupReferenceStyle(setup.referenceStyle || 'Indoor');
        setSetupDescription(setup.description || '');
        setSetupPrice(setup.price || '');
        setSetupPhoto(setup.setupPhoto || STOCK_STYLES[0].setupPhoto);
        setSetupItems(setup.items || []);
        setEditingItemIndex(null);
        
        setModalStage('EDIT_SETUP');
        setIsSetupModalOpen(true);
    };

    // Handle Custom File Upload (Android / browser gallery selection mockup)
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target?.result as string;
                // Initialize Custom Setup with uploaded image
                setEditingSetupId(null);
                setSetupName('');
                setSetupDecoratingWhatList([]);
                setSetupStructures([]);
                setSetupThemes([]);
                setSetupReferenceStyle('Indoor');
                setSetupDescription('Custom uploaded setup reference photo.');
                setSetupPrice('5000');
                setSetupPhoto(base64Url);
                setSetupItems([
                    { name: 'Structure Frame', itemType: 'Custom', qty: 1, unit: 'Units', price: 1500 },
                    { name: 'Custom Decor Elements', itemType: 'Custom', qty: 1, unit: 'Pcs', price: 3500 }
                ]);
                setEditingItemIndex(null);
                
                setModalStage('EDIT_SETUP');
            };
            reader.readAsDataURL(file);
        }
    };

    // Transition to edit setup screen with chosen style data
    const handleNextStage = () => {
        const style = STOCK_STYLES.find(s => s.id === selectedStyleId) || STOCK_STYLES[0];
        setSetupName(style.name);
        setSetupDecoratingWhat(style.decoratingWhat);
        setSetupDecoratingWhatList([style.decoratingWhat]);
        setSetupStructures([]);
        setSetupThemes([]);
        setSetupReferenceStyle(style.referenceStyle);
        setSetupDescription(style.description);
        setSetupPrice(style.price);
        setSetupPhoto(style.setupPhoto);
        setSetupItems(style.items);
        setEditingItemIndex(null);
        
        setModalStage('EDIT_SETUP');
    };

    const handleSaveSetup = () => {
        if (!setupName.trim()) {
            alert('Setup Name is required');
            return;
        }

        const setupPayload: Setup = {
            id: editingSetupId ? editingSetupId : Math.random().toString(36).substring(7),
            name: setupName,
            setupPhoto: setupPhoto,
            referenceStyle: setupReferenceStyle,
            description: setupDescription,
            price: setupPrice,
            decoratingWhat: setupDecoratingWhatList.join(', '),
            structuresIncluded: setupStructures,
            themes: setupThemes,
            items: setupItems,
        };

        if (editingSetupId) {
            handleEditSetup(setupPayload);
        } else {
            handleAddSetup(setupPayload);
        }

        setIsSetupModalOpen(false);
    };

    // Edit dynamic item row handlers
    const startEditItem = (index: number) => {
        setEditingItemIndex(index);
        setIsItemManagerOpen(true);
    };

    const deleteItemRow = (index: number) => {
        setSetupItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveItemManager = (newItem: SetupItem) => {
        const updatedItems = [...setupItems];
        if (editingItemIndex !== null && editingItemIndex >= 0) {
            updatedItems[editingItemIndex] = newItem;
        } else {
            updatedItems.push(newItem);
        }
        setSetupItems(updatedItems);
        setIsItemManagerOpen(false);
        setEditingItemIndex(null);
    };

    const addNewItemRow = () => {
        const newItem = { name: 'New Decor Item', qty: 1, unit: 'Pcs', price: 100 };
        setSetupItems(prev => [...prev, newItem]);
        startEditItem(setupItems.length - 1);
    };

    // Automatic bullet prefix formatting
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
            <style dangerouslySetInnerHTML={{ __html: `
                input::placeholder, select::placeholder, textarea::placeholder {
                    color: var(--Input-text-placeholder, #9F9FA9) !important;
                    font-family: var(--Font-family-San-serif, Figtree) !important;
                    font-size: var(--S-Font-size, 16px) !important;
                    font-style: normal !important;
                    font-weight: var(--font-weight, 400) !important;
                    line-height: var(--S-Line-height, 24px) !important;
                    letter-spacing: var(--S-Letter-spacing, 0) !important;
                    opacity: 1 !important;
                }
            ` }} />
            <div className="flex flex-col gap-6 pb-40">
                {/* ── SETUPS Section ── */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold uppercase tracking-wide text-[#030303]">SETUPS</span>
                    </div>

                    {setups.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {/* Total Package Price Card/Banner */}
                            <div className="bg-[#F4F4F5] rounded-[16px] p-6 flex flex-col items-center gap-3 border border-[#E4E4E7]/30">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold uppercase tracking-wider text-[#4B5563]">
                                    TOTAL PACKAGE PRICE
                                </span>
                                <div className="flex items-center gap-4">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[32px] font-bold text-[#030303] leading-none mt-1">₹</span>
                                    <div className="flex items-center justify-center bg-white px-8 py-3 rounded-[12px] shadow-sm border border-black/5 min-w-[200px]">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[32px] font-black tracking-tight text-[#030303] leading-none">
                                            {totalCalculatedPrice.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <button type="button" className="w-12 h-12 rounded-full bg-[#CBD5E1]/50 flex items-center justify-center text-[#475569] hover:bg-[#CBD5E1] transition-colors shadow-sm" title="Edit manual price">
                                        <Pencil size={20} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#4B5563]">
                                    Calculated from items. Edit to override
                                </span>
                            </div>

                            {/* List of horizontal rows */}
                            <div className="flex flex-col gap-3 mt-1">
                                {setups.map((setup) => {
                                    const itemCount = setup.items?.length || 0;
                                    const itemsTotal = (setup.items || []).reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
                                    const setupTotal = (Number(setup.price) || 0) + itemsTotal;
                                    return (
                                        <div 
                                            key={setup.id} 
                                            onClick={() => openEditSetup(setup)}
                                            className="p-3 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 pointer-events-none">
                                                {/* Thumbnail Image */}
                                                <img 
                                                    src={setup.setupPhoto || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600"} 
                                                    alt={setup.name} 
                                                    className="w-[56px] h-[64px] rounded-[8px] object-cover bg-transparent flex-shrink-0"
                                                />
                                                
                                                {/* Details */}
                                                <div className="flex flex-col gap-0.5">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#111827]">
                                                        {setup.name}
                                                    </span>
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#9CA3AF]">
                                                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                                                    </span>
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#111827] mt-1">
                                                        ₹ {setupTotal.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Delete trigger icon button */}
                                            <div className="flex items-center pr-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if(confirm('Are you sure you want to delete this setup?')) deleteSetup(setup.id);
                                                    }}
                                                    className="text-[#1E293B] hover:text-[#030303] transition-colors"
                                                    title="Delete Setup"
                                                >
                                                    <MinusCircle size={26} strokeWidth={1.25} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col items-center justify-center py-8 border-[2px] border-dashed border-[#E4E4E7] rounded-[16px] bg-white cursor-pointer" onClick={openCreateSetup}>
                                <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/decorationpage2.png" alt="No setups added" className="w-32 h-24 mb-3 object-contain grayscale opacity-60" />
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-1">No setups added</span>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] text-center max-w-[200px]">To add an item click on Add Item on top or in this box</span>
                            </div>
                            <button
                                type="button"
                                onClick={openCreateSetup}
                                className="w-full mt-2 py-3 bg-[#E9ECEE] rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#DDE0E2] transition-colors"
                            >
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">
                                    Add
                                </span>
                                <PlusCircle size={16} className="text-[#030303]" strokeWidth={1.5} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── EXTRA ADD-ONS Section ── */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold uppercase tracking-wide text-[#030303]">ADD-ONS <span className="text-red-500">*</span></span>
                    </div>
                    
                    {addons.length > 0 ? (
                        <div className="flex flex-col gap-3 mt-1">
                            {addons.map((addon) => (
                                <div 
                                    key={addon.id} 
                                    onClick={() => handleEditAddon(addon)}
                                    className="p-3 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 pointer-events-none">
                                        <img 
                                            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600" 
                                            alt={addon.name} 
                                            className="w-[56px] h-[64px] rounded-[8px] object-cover bg-transparent flex-shrink-0"
                                        />
                                        <div className="flex flex-col gap-0.5">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#111827]">
                                                {addon.name}
                                            </span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#9CA3AF]">
                                                {addon.type}
                                            </span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#111827] mt-1">
                                                ₹ {addon.price ? Number(addon.price).toLocaleString('en-IN') : '0'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative pr-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(confirm('Are you sure you want to delete this add-on?')) deleteAddon(addon.id);
                                            }}
                                            className="text-[#1E293B] hover:text-[#030303] transition-colors"
                                            title="Delete Add-on"
                                        >
                                            <MinusCircle size={26} strokeWidth={1.25} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleOpenAddonForm}
                                className="w-full mt-2 py-3 bg-[#E9ECEE] rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#DDE0E2] transition-colors"
                            >
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">
                                    Add
                                </span>
                                <PlusCircle size={16} className="text-[#030303]" strokeWidth={1.5} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col items-center justify-center py-8 border-[2px] border-dashed border-[#E4E4E7] rounded-[16px] bg-white cursor-pointer" onClick={handleOpenAddonForm}>
                                <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/decorationpage21.png" alt="No Add-ons" className="w-32 h-24 mb-3 object-contain grayscale opacity-60" />
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-1">No Add-ons</span>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] text-center max-w-[200px]">To add an add-on click Add on top or in this box</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenAddonForm}
                                className="w-full mt-2 py-3 bg-[#E9ECEE] rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#DDE0E2] transition-colors"
                            >
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">
                                    Add
                                </span>
                                <PlusCircle size={16} className="text-[#030303]" strokeWidth={1.5} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── ABOUT THE PACKAGE Section ── */}
                <div className="bg-white rounded-[12px] border border-[#E4E4E7] p-6 shadow-sm flex flex-col gap-2">
                    <h4 style={FOOTNOTE_STYLE}>About The Package</h4>
                    <p style={SUBTEXT_STYLE} className="text-[12px] leading-[18px] mb-2 text-[#71717A]">
                        List everything a customer gets when they book this package
                    </p>
                    <textarea
                        value={providedDetails}
                        onChange={(e) => handleBulletChange(e, setProvidedDetails)}
                        onKeyDown={(e) => handleBulletKeyDown(e, providedDetails, setProvidedDetails)}
                        placeholder="Enter details..."
                        style={INPUT_STYLE}
                        className={`${INPUT_CLASS} w-full h-28 resize-none`}
                    />
                </div>

                {/* ── WHAT'S NOT INCLUDED Section ── */}
                <div className="bg-white rounded-[12px] border border-[#E4E4E7] p-6 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h4 style={FOOTNOTE_STYLE}>What's Not Included</h4>
                        <div className="w-5 h-5 rounded-full bg-[#D92D20] flex items-center justify-center text-white">
                            <ShieldAlert size={12} className="stroke-[3]" />
                        </div>
                    </div>
                    <p style={SUBTEXT_STYLE} className="text-[12px] leading-[18px] mb-2 text-[#71717A]">
                        Help customers know what they'll need to arrange separately
                    </p>
                    <textarea
                        value={notProvidedDetails}
                        onChange={(e) => handleBulletChange(e, setNotProvidedDetails)}
                        onKeyDown={(e) => handleBulletKeyDown(e, notProvidedDetails, setNotProvidedDetails)}
                        placeholder="Enter Details..."
                        style={INPUT_STYLE}
                        className={`${INPUT_CLASS} w-full h-28 resize-none`}
                    />
                </div>
            </div>

            {/* ── Multi-screen Full Page Setup Wizard Portal ── */}
            {isSetupModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
                    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-32 relative bg-white">
                        
                        {/* ── STAGE 1: CHOOSE STYLE (Full Page) ── */}
                        {modalStage === 'CHOOSE_STYLE' && (
                            <>
                                {/* Header matches native view layout */}
                                <div className="sticky top-0 bg-white z-10 flex items-center gap-3 p-6 pb-4 border-b border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsSetupModalOpen(false)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-2"
                                    >
                                        <ArrowLeft size={20} className="text-[#030303]" />
                                    </button>
                                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">
                                        Add a Setup
                                    </h2>
                                </div>

                                {/* Main Choose style content */}
                                <div className="p-6 flex flex-col gap-6">
                                    
                                    {/* Upload reference Photo box */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-6 py-4 rounded-[16px] border-[2px] border-dashed border-[#E4E4E7] bg-[#F4F4F5] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#E4E4E7]/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E4E4E7]">
                                            <Camera size={18} className="text-[#3F3F47]" />
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] text-center">
                                                Use your own setup photo
                                            </p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] text-center max-w-[220px] leading-[18px]">
                                                Upload a reference photo to build a custom setup
                                            </p>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handlePhotoUpload} 
                                    />

                                    {/* thin lowercase separator matching mockup */}
                                    <div className="flex items-center justify-center text-[#9F9FA9]">
                                        <div className="w-[45%] h-[1px] bg-[#E4E4E7]" />
                                        <span style={SUBTEXT_STYLE} className="px-3">or</span>
                                        <div className="w-[45%] h-[1px] bg-[#E4E4E7]" />
                                    </div>

                                    {/* Section Choose your Setup text and subheadings */}
                                    <div className="flex flex-col gap-1">
                                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">
                                            Start from a preset
                                        </h3>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">
                                            Choose one style. Next, you&apos;ll add items from this setup.
                                        </p>
                                    </div>

                                    {/* High fidelity Style Selection Cards (square image layouts) */}
                                    <div className="flex flex-col gap-8 pb-20">
                                        {STOCK_STYLES.map((style) => {
                                            const isSelected = selectedStyleId === style.id;
                                            return (
                                                <div 
                                                    key={style.id}
                                                    onClick={() => setSelectedStyleId(style.id)}
                                                    className={`bg-white rounded-[16px] overflow-hidden flex flex-col transition-all border ${
                                                        isSelected ? 'border-[#030303]' : 'border-transparent'
                                                    }`}
                                                >
                                                    {/* Image without outer padding */}
                                                    <div className="w-full relative bg-gray-100 aspect-[4/3]">
                                                        <img 
                                                            src={style.setupPhoto} 
                                                            alt={style.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    
                                                    {/* Details layout */}
                                                    <div className="p-4 flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">
                                                                {style.name}
                                                            </span>
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="bg-[#F4F4F5] text-[#71717B] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px]">
                                                                {style.referenceStyle}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] leading-[18px]">
                                                            {style.description}
                                                        </p>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mt-1">
                                                            ₹{Number(style.price).toLocaleString('en-IN')}
                                                        </span>
                                                        
                                                        {/* Edit Inside Selected card only */}
                                                        {isSelected && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNextStage();
                                                                }}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-full mt-3 py-3 bg-white border border-[#030303] rounded-[8px] text-[14px] font-bold text-[#030303] hover:bg-gray-50 transition-colors shadow-sm"
                                                            >
                                                                Proceed with this Setup
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Sticky Bottom Bar side-by-side buttons exactly as mockup */}
                                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-20 max-w-md mx-auto shadow-md">
                                    <div className="flex items-center justify-center gap-4 w-full">
                                        <button
                                            type="button"
                                            onClick={() => setIsSetupModalOpen(false)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="flex-1 h-14 flex justify-center items-center bg-white border border-[#E4E4E7] text-[#030303] rounded-[12px] font-bold text-[16px] active:scale-[0.98] transition-transform"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextStage}
                                            disabled={!selectedStyleId}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className={`flex-1 h-14 flex justify-center items-center rounded-[12px] font-bold text-[16px] active:scale-[0.98] transition-transform ${
                                                selectedStyleId
                                                    ? 'bg-[#6B7C85] text-white hover:bg-[#5C6E77]'
                                                    : 'bg-[#E6E9EA] text-[#9F9FA9] cursor-not-allowed'
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── STAGE 2: CUSTOM SETUP / EDIT SETUP (Full Page) ── */}
                        {modalStage === 'EDIT_SETUP' && (
                            <>
                                {/* Header */}
                                <div className="sticky top-0 bg-white z-10 flex items-center gap-3 p-6 pb-4 border-b border-gray-100">
                                    <button 
                                        type="button"
                                        onClick={() => setModalStage('CHOOSE_STYLE')} 
                                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-2"
                                    >
                                        <ArrowLeft size={20} className="text-[#030303]" />
                                    </button>
                                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">
                                        Edit Setup
                                    </h2>
                                </div>

                                {/* Custom Form Inputs with active Hotspots */}
                                <div className="flex flex-col gap-6 pb-36">
                                    
                                    {/* Image with interactive tag pins */}
                                    <div className="w-full relative bg-gray-100 aspect-[4/5] sm:aspect-square">
                                        <img src={setupPhoto} alt="Setup reference" className="w-full h-full object-cover" />
                                        
                                        {/* Hotspot overlays */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* Hotspot 1: Flowers */}
                                            <div className="absolute flex items-center gap-1.5 bg-white text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '18%', left: '50%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                                Flowers
                                            </div>

                                            {/* Hotspot 2: Lighting */}
                                            <div className="absolute flex items-center gap-1.5 bg-white text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '32%', left: '80%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                                Lighting
                                            </div>

                                            {/* Hotspot 3: Frame */}
                                            <div className="absolute flex items-center gap-1.5 bg-white text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '50%', left: '72%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                                Frame
                                            </div>

                                            {/* Hotspot 4: Drapes */}
                                            <div className="absolute flex items-center gap-1.5 bg-white text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '58%', left: '32%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                                Drapes
                                            </div>
                                        </div>

                                        {/* Bottom Action Pill */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-[#E4E4E7] text-[#030303] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                                            Tap items to edit
                                        </div>
                                    </div>

                                    <div className="px-6 flex flex-col gap-6">
                                        {/* Name of the Setup */}
                                        <div className="flex flex-col gap-1.5">
                                            <label style={HEADING_STYLE}>
                                                Setup name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Floral Arch with Drapes"
                                                value={setupName}
                                                onChange={(e) => setSetupName(e.target.value)}
                                                style={INPUT_STYLE}
                                                className={INPUT_CLASS}
                                            />
                                        </div>

                                        {/* What are you decorating? */}
                                        <div className="flex flex-col gap-1.5">
                                            <label style={HEADING_STYLE}>
                                                What are you decorating?
                                            </label>
                                            <p style={SUBTEXT_STYLE} className="-mt-1 text-[14px]">
                                                This helps define your setup clearly
                                            </p>
                                            <MultiSelectPills
                                                options={['Hall', 'Doors', 'Stage', 'Corners', 'Entrance Gate', 'Floor', 'Lawn', 'Banquets', 'Restaurants', 'Hotel', 'Farm House', 'Swimming Pool', 'Balcony', 'Terrace', 'Porch', 'Road', 'Front', 'Out/SUVs', 'Ground', 'Wall', 'Garden']}
                                                selected={setupDecoratingWhatList}
                                                onChange={setSetupDecoratingWhatList}
                                                customInputPlaceholder="Enter Object"
                                            />
                                        </div>

                                        {/* Structures Included */}
                                        <div className="flex flex-col gap-1.5">
                                            <label style={HEADING_STYLE}>
                                                Structures included
                                            </label>
                                            <p style={SUBTEXT_STYLE} className="-mt-1 text-[14px]">
                                                Create your setup with one or more structures
                                            </p>
                                            <MultiSelectPills
                                                options={[
                                                    'Gate Entrance', 'Centerpieces', 'Chair Decor', 'Ceiling Draping', 
                                                    'Mandap (Open)', 'Mandap (Closed)', 'Mandap(Domed)', 'Stage Riser', 
                                                    'Walkway Truss', 'Pergola', 'Cabana', 'Gazebo', 'Swing/Jhula', 
                                                    'Throne Chairs', 'Vintage Sofa', 'Floral Arch (various types)', 
                                                    'Hexagon Arch', 'Round Arch', 'Triangle Arch', 'Cake Table'
                                                ]}
                                                selected={setupStructures}
                                                onChange={setSetupStructures}
                                                customInputPlaceholder="Enter Structures you want to add"
                                            />
                                        </div>

                                        {/* Theme */}
                                        <div className="flex flex-col gap-1.5">
                                            <label style={HEADING_STYLE}>
                                                Theme
                                            </label>
                                            <p style={SUBTEXT_STYLE} className="-mt-1 text-[14px]">
                                                Choose the theme for this setup
                                            </p>
                                            <MultiSelectPills
                                                options={['Indian(Regional)', 'Fairy-tale', 'Bollywood Retro', 'Boho', 'Rustin', 'Botanical/Greenery', 'Monochrome', 'Floral Pastel', 'Signage', 'Minimalist Modern', 'Floor Decor', 'Vintage', 'Pool Decor', 'Black & Gold', 'White & Gold', 'Neon']}
                                                selected={setupThemes}
                                                onChange={setSetupThemes}
                                                customInputPlaceholder="Enter Theme"
                                            />
                                        </div>

                                        {/* Type of Setup */}
                                        <div className="flex flex-col gap-1.5">
                                            <label style={HEADING_STYLE}>
                                                Type of Setup
                                            </label>
                                            <div className="flex w-full p-1 bg-[#F4F4F5] rounded-[12px] border border-[#E4E4E7]">
                                                {['Indoor', 'Outdoor', 'Both'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setSetupReferenceStyle(type)}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className={`flex-1 py-2 text-[14px] font-medium rounded-[10px] transition-all ${
                                                            setupReferenceStyle === type 
                                                            ? 'bg-white text-[#030303] shadow-sm' 
                                                            : 'text-[#9F9FA9] hover:text-[#030303]'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Items in your Setup */}
                                        <div className="flex flex-col gap-3 mt-2">
                                            <div className="flex flex-col gap-1">
                                                <label style={HEADING_STYLE}>
                                                    Items in your Setup
                                                </label>
                                                <p style={SUBTEXT_STYLE} className="text-[14px]">
                                                    We found these items for you based on your photo.
                                                </p>
                                            </div>

                                            {setupItems.length > 0 ? (
                                                <div className="flex flex-col gap-3">
                                                    {setupItems.map((item, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => {
                                                                setEditingItemIndex(idx);
                                                                setIsItemManagerOpen(true);
                                                            }}
                                                            className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between shadow-xs cursor-pointer hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <span style={HEADING_STYLE} className="text-[14px] text-[#030303]">
                                                                    {item.name}
                                                                </span>
                                                                <span style={SUBTEXT_STYLE} className="text-[12px] text-[#71717A]">
                                                                    Quantity: {item.qty}
                                                                </span>
                                                                <span style={HEADING_STYLE} className="text-[14px] font-bold text-[#030303] mt-1">
                                                                    ₹ {item.price ? item.price.toLocaleString('en-IN') : '0'}
                                                                </span>
                                                            </div>
                                                            <ChevronRight size={20} className="text-[#9F9FA9]" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="w-full flex flex-col items-center justify-center py-8 px-4 border border-dashed border-[#E4E4E7] rounded-[16px] bg-white gap-4">
                                                    <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/decorationpage2.png" alt="No setups added" className="w-[180px] h-auto object-contain" />
                                                    <div className="flex flex-col items-center gap-1.5 text-center">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[#030303] text-[16px] font-bold">
                                                            No setups added
                                                        </span>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[#9F9FA9] text-[14px]">
                                                            To add an item click on Add Item on top<br/>or in this box
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingItemIndex(-1);
                                                    setIsItemManagerOpen(true);
                                                }}
                                                className="w-full mt-2 py-3.5 bg-[#E9ECEE] rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#DDE0E2] transition-colors"
                                            >
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">
                                                    Add
                                                </span>
                                                <PlusCircle size={18} className="text-[#030303]" strokeWidth={1.5} />
                                            </button>
                                        </div>

                                        {/* Setup Cost */}
                                        <div className="flex flex-col gap-1.5 mt-2">
                                            <label style={HEADING_STYLE}>
                                                Setup Cost(per event)
                                            </label>
                                            <div className="flex w-full rounded-[8px] border border-[#E4E4E7] overflow-hidden focus-within:border-gray-400">
                                                <div className="w-14 bg-[#F4F4F5] flex items-center justify-center border-r border-[#E4E4E7]">
                                                    <span className="text-[#030303] font-medium text-[16px]">₹</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Enter Cost"
                                                    value={setupPrice}
                                                    onChange={(e) => setSetupPrice(e.target.value.replace(/\D/g, ''))}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="flex-1 p-3.5 text-[14px] text-[#030303] outline-none placeholder:text-[#9F9FA9]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Bottom Bar solid save button */}
                                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-20 max-w-md mx-auto shadow-md">
                                    <button
                                        type="button"
                                        onClick={handleSaveSetup}
                                        disabled={setupName.trim() === ''}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`w-full h-14 flex justify-center items-center text-white rounded-[12px] font-bold text-[16px] transition-transform ${
                                            setupName.trim() !== '' 
                                            ? 'bg-[#04222D] active:scale-[0.98] hover:bg-[#031b24]' 
                                            : 'bg-[#829296] cursor-not-allowed opacity-80'
                                        }`}
                                    >
                                        Save Setup
                                    </button>
                                </div>
                                {isItemManagerOpen && (
                                    <ItemManagerModal
                                        isOpen={isItemManagerOpen}
                                        onClose={() => setIsItemManagerOpen(false)}
                                        onSave={handleSaveItemManager}
                                        onDelete={() => {
                                            if (editingItemIndex !== null && editingItemIndex >= 0) {
                                                setSetupItems(prev => prev.filter((_, idx) => idx !== editingItemIndex));
                                            }
                                        }}
                                        initialItem={editingItemIndex !== null && editingItemIndex >= 0 ? setupItems[editingItemIndex] : null}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
