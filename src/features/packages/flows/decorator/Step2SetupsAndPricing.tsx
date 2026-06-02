'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, MoreHorizontal, Pencil, Trash2, X, ShieldAlert, Check, PlusCircle, Camera, Edit2 } from 'lucide-react';
import { Addon, AddonModal } from '../../components/AddonModal';

// Setup types mapped to the backend mongoose schema
export interface SetupItem {
    name: string;
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
    items: SetupItem[];
    notPartOfSetup: string;
    partOfSetup: string;
}

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
        setupPhoto: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600',
        referenceStyle: 'Indoor',
        description: 'Includes: Flowers, Frame, Drapes',
        price: '2500',
        decoratingWhat: 'Door',
        items: [
            { name: 'Steel Frame (Adjustable)', qty: 1, unit: 'Units', price: 120 },
            { name: 'Fresh Flowers (Roses & Orchids)', qty: 50, unit: 'Pcs', price: 15 },
            { name: 'Drapes (Satin / Silk)', qty: 4, unit: 'Meters', price: 200 }
        ],
        partOfSetup: '• Floral Arch Frame\n• Fresh flower arrangements\n• Premium drapery',
        notPartOfSetup: '• Ambient spot lighting\n• Additional stands'
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
            { name: 'Floral Centerpiece', qty: 10, unit: 'Pcs', price: 300 },
            { name: 'Scented Candle Holders', qty: 20, unit: 'Pcs', price: 50 },
            { name: 'Premium Satin Table Runners', qty: 10, unit: 'Pcs', price: 100 }
        ],
        partOfSetup: '• Premium tableware setting\n• Candles and crystal stands',
        notPartOfSetup: '• Chairs and heavy catering tables'
    }
];

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
    const totalCalculatedPrice = setups.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

    // Setup Custom Form States
    const [setupName, setSetupName] = React.useState('');
    const [isCustomName, setIsCustomName] = React.useState(false);
    
    const [setupDecoratingWhat, setSetupDecoratingWhat] = React.useState('Door');
    const [isCustomDecorating, setIsCustomDecorating] = React.useState(false);

    const [setupReferenceStyle, setSetupReferenceStyle] = React.useState('Indoor'); // Indoor/Outdoor/Both
    const [setupDescription, setSetupDescription] = React.useState('');
    const [setupPrice, setSetupPrice] = React.useState('');
    const [setupPhoto, setSetupPhoto] = React.useState('');
    const [setupItems, setSetupItems] = React.useState<SetupItem[]>([]);
    const [setupPartOfSetup, setSetupPartOfSetup] = React.useState('');
    const [setupNotPartOfSetup, setSetupNotPartOfSetup] = React.useState('');

    // Inline item edit state in setup wizard
    const [editingItemIndex, setEditingItemIndex] = React.useState<number | null>(null);
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
        setIsCustomName(!['Floral Arch', 'Flora Arch', 'Royal Table Decor'].includes(setup.name));
        
        setSetupDecoratingWhat(setup.decoratingWhat);
        setIsCustomDecorating(!['Door', 'Stage', 'Entrance', 'Mandap', 'Photo Booth', 'Dining Area'].includes(setup.decoratingWhat));

        setSetupReferenceStyle(setup.referenceStyle || 'Indoor');
        setSetupDescription(setup.description || '');
        setSetupPrice(setup.price || '');
        setSetupPhoto(setup.setupPhoto || STOCK_STYLES[0].setupPhoto);
        setSetupItems(setup.items || []);
        setSetupPartOfSetup(setup.partOfSetup || '');
        setSetupNotPartOfSetup(setup.notPartOfSetup || '');
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
                setSetupName('Custom Setup');
                setIsCustomName(true);
                setSetupDecoratingWhat('Stage');
                setIsCustomDecorating(false);
                setSetupReferenceStyle('Indoor');
                setSetupDescription('Custom uploaded setup reference photo.');
                setSetupPrice('5000');
                setSetupPhoto(base64Url);
                setSetupPartOfSetup('• Premium custom setup installations');
                setSetupNotPartOfSetup('• Power generator backing');
                setSetupItems([
                    { name: 'Structure Frame', qty: 1, unit: 'Units', price: 1500 },
                    { name: 'Custom Decor Elements', qty: 1, unit: 'Pcs', price: 3500 }
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
        setIsCustomName(false);
        setSetupDecoratingWhat(style.decoratingWhat);
        setIsCustomDecorating(false);
        setSetupReferenceStyle(style.referenceStyle);
        setSetupDescription(style.description);
        setSetupPrice(style.price);
        setSetupPhoto(style.setupPhoto);
        setSetupItems(style.items);
        setSetupPartOfSetup(style.partOfSetup);
        setSetupNotPartOfSetup(style.notPartOfSetup);
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
            decoratingWhat: setupDecoratingWhat,
            items: setupItems,
            partOfSetup: setupPartOfSetup,
            notPartOfSetup: setupNotPartOfSetup,
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
        const item = setupItems[index];
        setEditingItemIndex(index);
        setItemEditName(item.name);
        setItemEditQty(item.qty);
        setItemEditUnit(item.unit);
        setItemEditPrice(item.price);
    };

    const saveEditedItem = () => {
        if (editingItemIndex === null) return;
        setSetupItems(prev => prev.map((item, idx) => {
            if (idx === editingItemIndex) {
                return {
                    name: itemEditName,
                    qty: itemEditQty,
                    unit: itemEditUnit,
                    price: itemEditPrice
                };
            }
            return item;
        }));
        setEditingItemIndex(null);
    };

    const deleteItemRow = (index: number) => {
        setSetupItems(prev => prev.filter((_, idx) => idx !== index));
        setEditingItemIndex(null);
    };

    const addNewItemRow = () => {
        const newItem = { name: 'New Decor Item', qty: 1, unit: 'Pcs', price: 100 };
        setSetupItems(prev => [...prev, newItem]);
        startEditItem(setupItems.length);
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
                    <div className="flex items-center justify-between">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={SECTION_LABEL}>Setups</span>
                        <button
                            type="button"
                            onClick={openCreateSetup}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="flex items-center gap-1.5 text-[14px] font-bold text-[#04222D] hover:underline transition-all"
                        >
                            <span>Add setup</span>
                            <PlusCircle size={16} className="text-[#04222D]" />
                        </button>
                    </div>

                    {setups.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {/* Total Package Price Card/Banner */}
                            <div className="bg-[#F4F4F5] rounded-[16px] p-5 flex flex-col items-center gap-1.5 border border-[#E4E4E7]/30">
                                <span style={DECORATION_ITEMS_STYLE} className="text-[11px] font-bold uppercase tracking-wider text-[#71717B]">
                                    TOTAL PACKAGE PRICE
                                </span>
                                <div className="flex items-center gap-2 bg-white px-8 py-3 rounded-[12px] shadow-xs border border-gray-100 min-w-[200px] justify-center">
                                    <span style={HEADING_STYLE} className="text-[18px]">₹</span>
                                    <span style={HEADING_STYLE} className="text-[24px] font-black">
                                        {totalCalculatedPrice.toLocaleString('en-IN')}
                                    </span>
                                    <button type="button" className="text-gray-400 hover:text-gray-600 ml-2" title="Edit manual price">
                                        <Pencil size={15} />
                                    </button>
                                </div>
                                <span style={SUBTEXT_STYLE} className="text-[11px] text-[#71717B]">
                                    Calculated from items
                                </span>
                            </div>

                            {/* Section Heading: Setups (Count) */}
                            <h3 style={HEADING_STYLE} className="text-[20px] font-bold text-[#030303] mt-2 mb-1">
                                Setups ({setups.length})
                            </h3>

                            {/* List of horizontal rows */}
                            <div className="flex flex-col gap-3">
                                {setups.map((setup) => {
                                    const itemCount = setup.items?.length || 0;
                                    return (
                                        <div key={setup.id} className="p-4 bg-white border border-[#E4E4E7] rounded-[16px] flex items-center justify-between shadow-xs">
                                            <div className="flex items-center gap-4">
                                                {/* Thumbnail Image */}
                                                <img 
                                                    src={setup.setupPhoto} 
                                                    alt={setup.name} 
                                                    className="w-16 h-16 rounded-[12px] object-cover bg-gray-100 flex-shrink-0"
                                                />
                                                
                                                {/* Details */}
                                                <div className="flex flex-col gap-1">
                                                    <span style={HEADING_STYLE} className="text-[16px]">
                                                        {setup.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {/* Item count badge */}
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="bg-[#F4F4F5] text-[#71717B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px]">
                                                            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
                                                        </span>
                                                        {/* Price */}
                                                        <span style={SUBTEXT_STYLE} className="text-[14px] font-medium">
                                                            ₹{setup.price ? Number(setup.price).toLocaleString('en-IN') : '0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Edit trigger icon button */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if(confirm('Are you sure you want to delete this setup?')) deleteSetup(setup.id);
                                                    }}
                                                    className="w-10 h-10 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Delete Setup"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditSetup(setup)}
                                                    className="w-10 h-10 rounded-full border border-[#E4E4E7] flex items-center justify-center text-[#71717A] hover:bg-gray-50 transition-colors"
                                                    title="Edit Setup"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-4 bg-transparent" />
                    )}
                </div>

                {/* ── EXTRA ADD-ONS Section ── */}
                <div className="flex flex-col gap-3">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className={SECTION_LABEL}>Extra Add-ons</span>
                    
                    {addons.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {addons.map((addon) => (
                                <div key={addon.id} className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex items-center justify-between shadow-sm">
                                    <div className="flex flex-col">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-[24px]">
                                            {addon.name}
                                        </span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px]">
                                            {addon.type} • {addon.price ? `₹${addon.price}` : 'Free'} {addon.price && `• ${addon.billingUnit}`}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => handleEditAddon(addon)}
                                            className="hover:bg-gray-100 p-2 rounded-full text-[#71717A]"
                                            title="Edit Add-on"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="w-full bg-white rounded-[12px] border border-[#E4E4E7] p-6 shadow-sm">
                        <button
                            type="button"
                            onClick={handleOpenAddonForm}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="w-full py-6 rounded-[12px] border-[2px] border-dashed border-[#D4D4D8] text-[#9F9FA9] text-[16px] font-normal leading-[24px] bg-white hover:bg-gray-50 transition-colors"
                        >
                            Entre Add-on +
                        </button>
                    </div>
                </div>

                {/* ── NOT PART OF THIS PACKAGE Section ── */}
                <div className="bg-white rounded-[12px] border border-[#E4E4E7] p-6 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h4 style={FOOTNOTE_STYLE}>Not Part of This Package</h4>
                        <div className="w-5 h-5 rounded-full bg-[#D92D20] flex items-center justify-center text-white">
                            <ShieldAlert size={12} className="stroke-[3]" />
                        </div>
                    </div>
                    <p style={SUBTEXT_STYLE} className="text-[12px] leading-[18px] mb-2">
                        Enter the things that wil not be provided by you
                    </p>
                    <textarea
                        value={notProvidedDetails}
                        onChange={(e) => handleBulletChange(e, setNotProvidedDetails)}
                        onKeyDown={(e) => handleBulletKeyDown(e, notProvidedDetails, setNotProvidedDetails)}
                        placeholder="Entre Details..."
                        style={INPUT_STYLE}
                        className={`${INPUT_CLASS} w-full h-28 resize-none`}
                    />
                </div>

                {/* ── PART OF THIS PACKAGE Section ── */}
                <div className="bg-white rounded-[12px] border border-[#E4E4E7] p-6 shadow-sm flex flex-col gap-2">
                    <h4 style={FOOTNOTE_STYLE}>Part of This Package</h4>
                    <p style={SUBTEXT_STYLE} className="text-[12px] leading-[18px] mb-2">
                        Enter the things that wil be provided by you
                    </p>
                    <textarea
                        value={providedDetails}
                        onChange={(e) => handleBulletChange(e, setProvidedDetails)}
                        onKeyDown={(e) => handleBulletKeyDown(e, providedDetails, setProvidedDetails)}
                        placeholder="Entre Details..."
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
                                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
                                    <h2 style={HEADING_STYLE}>
                                        Setup
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsSetupModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        <X size={20} className="text-[#030303]" />
                                    </button>
                                </div>

                                {/* Main Choose style content */}
                                <div className="p-6 flex flex-col gap-6">
                                    
                                    {/* Upload reference Photo box */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-xs border border-[#E4E4E7]">
                                            <Camera size={24} className="text-[#3F3F47]" />
                                        </div>
                                        <p style={HEADING_STYLE} className="mb-1 text-[16px] text-center">
                                            Use your own setup photo
                                        </p>
                                        <p style={SUBTEXT_STYLE} className="text-center">
                                            Upload a reference photo to build a custom setup
                                        </p>
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
                                    <div className="flex flex-col gap-1.5">
                                        <h3 style={HEADING_STYLE}>
                                            Choose your Setup
                                        </h3>
                                        <p style={SUBTEXT_STYLE}>
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
                                                    className={`bg-white rounded-[20px] overflow-hidden flex flex-col transition-all ${
                                                        isSelected ? 'border-2 border-[#04222D] p-1.5 shadow-sm' : 'border border-transparent p-1.5'
                                                    }`}
                                                >
                                                    {/* Square aspect ratio image container */}
                                                    <div className="w-full relative rounded-[16px] overflow-hidden bg-gray-100 aspect-square">
                                                        <img 
                                                            src={style.setupPhoto} 
                                                            alt={style.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        
                                                        {/* Selected Badge */}
                                                        {isSelected && (
                                                            <div className="absolute bottom-4 left-4 bg-black/90 text-white text-[11px] font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 leading-[16px] shadow-xs">
                                                                <Check size={12} className="stroke-[3]" />
                                                                SELECTED FOR YOUR PACKAGE
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Details layout */}
                                                    <div className="px-2 pt-4 pb-2 flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <span style={HEADING_STYLE} className="text-[18px]">
                                                                {style.name}
                                                            </span>
                                                            <span style={SUBTEXT_STYLE} className="bg-[#F4F4F5] text-[#71717B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6px]">
                                                                {style.referenceStyle}
                                                            </span>
                                                        </div>
                                                        <p style={SUBTEXT_STYLE} className="text-[12px] leading-[18px]">
                                                            {style.description}
                                                        </p>
                                                        <span style={HEADING_STYLE} className="text-[18px] mt-1">
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
                                                                className="w-full mt-3 py-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-bold text-[#030303] hover:bg-gray-50 transition-colors shadow-xs"
                                                            >
                                                                Edit this setup
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
                                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
                                    <h2 style={HEADING_STYLE}>
                                        Custom Setup
                                    </h2>
                                    <button 
                                        type="button"
                                        onClick={() => setModalStage('CHOOSE_STYLE')} 
                                        className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center"
                                    >
                                        <X size={20} className="text-[#030303]" />
                                    </button>
                                </div>

                                {/* Custom Form Inputs with active Hotspots */}
                                <div className="p-6 flex flex-col gap-6 pb-36">
                                    
                                    {/* Image with interactive tag pins */}
                                    <div className="w-full h-64 rounded-[20px] overflow-hidden bg-gray-100 relative shadow-sm border border-gray-200 aspect-square">
                                        <img src={setupPhoto} alt="Setup reference" className="w-full h-full object-cover" />
                                        
                                        {/* Hotspot overlays */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* Hotspot 1: Flowers */}
                                            <div className="absolute flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md border border-gray-100 pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '18%', left: '50%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Flowers
                                            </div>

                                            {/* Hotspot 2: Lighting */}
                                            <div className="absolute flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md border border-gray-100 pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '32%', left: '80%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Lighting
                                            </div>

                                            {/* Hotspot 3: Frame */}
                                            <div className="absolute flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md border border-gray-100 pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '50%', left: '72%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Frame
                                            </div>

                                            {/* Hotspot 4: Drapes */}
                                            <div className="absolute flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-[#030303] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md border border-gray-100 pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105" style={{ top: '58%', left: '32%' }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Drapes
                                            </div>
                                        </div>

                                        {/* Bottom Action Pill */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#030303]/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                                            Tap items to edit
                                        </div>
                                    </div>

                                    {/* Name of the Setup */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE}>
                                            Name of the Setup
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            <div className="relative">
                                                <select
                                                    value={isCustomName ? 'custom' : setupName}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'custom') {
                                                            setIsCustomName(true);
                                                            setSetupName('');
                                                        } else {
                                                            setIsCustomName(false);
                                                            setSetupName(val);
                                                        }
                                                    }}
                                                    style={INPUT_STYLE}
                                                    className={`${INPUT_CLASS} w-full appearance-none pr-12`}
                                                >
                                                    <option value="Floral Arch">Floral Arch</option>
                                                    <option value="Flora Arch">Flora Arch</option>
                                                    <option value="Royal Table Decor">Royal Table Decor</option>
                                                    <option value="custom">Custom (Type your own)...</option>
                                                </select>
                                                <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                                            </div>
                                            {isCustomName && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter setup name..."
                                                    value={setupName}
                                                    onChange={(e) => setSetupName(e.target.value)}
                                                    style={INPUT_STYLE}
                                                    className={INPUT_CLASS}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* What are you decorating? */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE}>
                                            What are you decorating?
                                        </label>
                                        <p style={SUBTEXT_STYLE}>
                                            This helps define your setup clearly.
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <div className="relative">
                                                <select
                                                    value={isCustomDecorating ? 'custom' : setupDecoratingWhat}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'custom') {
                                                            setIsCustomDecorating(true);
                                                            setSetupDecoratingWhat('');
                                                        } else {
                                                            setIsCustomDecorating(false);
                                                            setSetupDecoratingWhat(val);
                                                        }
                                                    }}
                                                    style={INPUT_STYLE}
                                                    className={`${INPUT_CLASS} w-full appearance-none pr-12`}
                                                >
                                                    <option value="Door">Door</option>
                                                    <option value="Stage">Stage</option>
                                                    <option value="Entrance">Entrance</option>
                                                    <option value="Mandap">Mandap</option>
                                                    <option value="Photo Booth">Photo Booth</option>
                                                    <option value="Dining Area">Dining Area</option>
                                                    <option value="custom">Custom (Type your own)...</option>
                                                </select>
                                                <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                                            </div>
                                            {isCustomDecorating && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter decorating location..."
                                                    value={setupDecoratingWhat}
                                                    onChange={(e) => setSetupDecoratingWhat(e.target.value)}
                                                    style={INPUT_STYLE}
                                                    className={INPUT_CLASS}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Type of Setup */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE}>
                                            Type of Setup
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={setupReferenceStyle}
                                                onChange={(e) => setSetupReferenceStyle(e.target.value)}
                                                style={INPUT_STYLE}
                                                className={`${INPUT_CLASS} w-full appearance-none pr-12`}
                                            >
                                                <option value="Indoor">Indoor</option>
                                                <option value="Outdoor">Outdoor</option>
                                                <option value="Both">Both</option>
                                            </select>
                                            <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                                        </div>
                                    </div>

                                    {/* Setup Price */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={HEADING_STYLE}>
                                            Setup Price (₹)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2500"
                                            value={setupPrice}
                                            onChange={(e) => setSetupPrice(e.target.value.replace(/\D/g, ''))}
                                            style={INPUT_STYLE}
                                            className={INPUT_CLASS}
                                        />
                                    </div>

                                    {/* Items list section */}
                                    <div className="flex flex-col gap-3 mt-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label style={HEADING_STYLE}>
                                                    Items in your Setup
                                                </label>
                                                <p style={SUBTEXT_STYLE} className="mt-0.5">
                                                    We found these items for you based on your photo.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addNewItemRow}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="flex items-center gap-1 text-[13px] font-bold text-[#04222D] hover:underline"
                                            >
                                                <span>Add item</span>
                                                <PlusCircle size={16} className="text-[#04222D]" />
                                            </button>
                                        </div>

                                        {/* Decoration Items Label */}
                                        <div className="mt-2">
                                            <span style={DECORATION_ITEMS_STYLE} className="uppercase tracking-wider">
                                                DECORATION ITEMS
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {setupItems.map((item, idx) => {
                                                const isEditing = editingItemIndex === idx;
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className={`p-4 bg-white border rounded-[12px] flex flex-col gap-3 shadow-xs relative transition-all ${
                                                            isEditing ? 'border-[#030303] bg-gray-50' : 'border-[#E4E4E7]'
                                                        }`}
                                                    >
                                                        {isEditing ? (
                                                            <div className="flex flex-col gap-2.5">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Item Name"
                                                                    value={itemEditName}
                                                                    onChange={(e) => setItemEditName(e.target.value)}
                                                                    style={INPUT_STYLE}
                                                                    className="p-2 border rounded"
                                                                />
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Qty"
                                                                        value={itemEditQty || ''}
                                                                        onChange={(e) => setItemEditQty(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                                                                        style={INPUT_STYLE}
                                                                        className="p-2 border rounded text-center"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Unit"
                                                                        value={itemEditUnit}
                                                                        onChange={(e) => setItemEditUnit(e.target.value)}
                                                                        style={INPUT_STYLE}
                                                                        className="p-2 border rounded text-center"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Price"
                                                                        value={itemEditPrice || ''}
                                                                        onChange={(e) => setItemEditPrice(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                                                                        style={INPUT_STYLE}
                                                                        className="p-2 border rounded text-center"
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2 justify-end mt-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteItemRow(idx)}
                                                                        className="px-3 py-1 bg-red-100 text-red-600 rounded text-[12px] font-bold"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingItemIndex(null)}
                                                                        className="px-3 py-1 bg-white border rounded text-[12px]"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={saveEditedItem}
                                                                        className="px-4 py-1 bg-[#04222D] text-white rounded text-[12px] font-bold"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex flex-col">
                                                                        <span style={HEADING_STYLE} className="text-[15px]">
                                                                            {item.name}
                                                                        </span>
                                                                        <span style={DECORATION_ITEMS_STYLE} className="text-[11px]">
                                                                            Add material, size, color
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => startEditItem(idx)}
                                                                        className="p-1.5 text-[#71717A] hover:bg-gray-100 rounded-full"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                </div>
                                                                <div className="flex gap-6 mt-1 text-[12px] text-[#3F3F47]">
                                                                    <div className="flex flex-col">
                                                                        <span style={DECORATION_ITEMS_STYLE} className="text-[10px] font-bold uppercase">Qty</span>
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="font-bold">{item.qty} {item.unit}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span style={DECORATION_ITEMS_STYLE} className="text-[10px] font-bold uppercase">Price</span>
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="font-bold">₹{item.price.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Exclusions */}
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <div className="flex items-center gap-2">
                                            <label style={FOOTNOTE_STYLE}>
                                                Not Part of this Setup
                                            </label>
                                            <div className="w-4 h-4 rounded-full bg-[#D92D20] flex items-center justify-center text-white">
                                                <ShieldAlert size={10} className="stroke-[3]" />
                                            </div>
                                        </div>
                                        <p style={SUBTEXT_STYLE}>
                                            Choose the things that wil not be provided by you
                                        </p>
                                        <textarea
                                            value={setupNotPartOfSetup}
                                            onChange={(e) => handleBulletChange(e, setSetupNotPartOfSetup)}
                                            onKeyDown={(e) => handleBulletKeyDown(e, setupNotPartOfSetup, setSetupNotPartOfSetup)}
                                            placeholder="Entre Details.."
                                            rows={3}
                                            style={INPUT_STYLE}
                                            className={`${INPUT_CLASS} text-[14px] resize-none`}
                                        />
                                    </div>

                                    {/* Inclusions */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={FOOTNOTE_STYLE}>
                                            Part of this Setup
                                        </label>
                                        <p style={SUBTEXT_STYLE}>
                                            Choose the things that wil be provided by you
                                        </p>
                                        <textarea
                                            value={setupPartOfSetup}
                                            onChange={(e) => handleBulletChange(e, setSetupPartOfSetup)}
                                            onKeyDown={(e) => handleBulletKeyDown(e, setupPartOfSetup, setSetupPartOfSetup)}
                                            placeholder="Entre Details.."
                                            rows={3}
                                            style={INPUT_STYLE}
                                            className={`${INPUT_CLASS} text-[14px] resize-none`}
                                        />
                                    </div>
                                </div>

                                {/* Sticky Bottom Bar solid save button */}
                                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-20 max-w-md mx-auto shadow-md">
                                    <button
                                        type="button"
                                        onClick={handleSaveSetup}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full h-14 flex justify-center items-center bg-[#04222D] text-white rounded-[12px] font-bold text-[16px] active:scale-[0.98] transition-transform hover:bg-[#063445]"
                                    >
                                        Save Setup
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
