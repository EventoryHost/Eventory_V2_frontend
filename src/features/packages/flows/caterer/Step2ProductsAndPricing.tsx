'use client';
import { createPortal } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { CollapsibleSection } from '../../components/CollapsibleSection';

import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2, X, Search, ChevronRight, PlusCircle } from 'lucide-react';
import { MenuData, FoodItem } from '../../shared/types';
import { AddonModal, Addon } from '../../components/AddonModal';
import { VariantManager } from '../../components/VariantManager';

interface Props {
    packageId?: string | null;
    packageGroupId?: string | null;
    minMealsPreference: number | null;
    setMinMealsPreference: React.Dispatch<React.SetStateAction<number | null>>;
    menus: MenuData[];
    setMenus: React.Dispatch<React.SetStateAction<MenuData[]>>;
    toggleMenuExpand: (id: string) => void;
    deleteMenu: (id: string) => void;
    handleAddMenu: (categories?: string[], mealType?: string) => void;
    activeMenuDropdown: string | null;
    setActiveMenuDropdown: (v: string | null) => void;

    // Crockery Panel States
    crockeryIncluded: boolean;
    setCrockeryIncluded: (v: boolean) => void;
    crockeryDisposable: boolean;
    setCrockeryDisposable: (v: boolean) => void;
    crockeryBoneChina: boolean;
    setCrockeryBoneChina: (v: boolean) => void;
    crockeryType: string;
    setCrockeryType: (v: string) => void;

    // Addons States
    addons: Addon[];
    setAddons: React.Dispatch<React.SetStateAction<Addon[]>>;
    handleOpenAddonForm: () => void;
    handleEditAddon: (addon: Addon) => void;

    // Included / Not Included text States
    includedText: string;
    setIncludedText: (v: string) => void;
    notIncludedText: string;
    setNotIncludedText: (v: string) => void;
}

const CARD = 'bg-white p-6 rounded-[24px] border border-[#D4D4D8] flex flex-col gap-6';

const CROCKERY_SUGGESTIONS = [
    'Silverware', 'Melamine', 'Bone China', 'Ceramic Plates', 'Stainless Steel Thali', 
    'Glassware', 'Disposable Plates', 'Eco-friendly Bamboo Plates', 'Copper Ware', 
    'Porcelain', 'Wooden Cutlery', 'Banana Leaf Service', 'Gold-plated Cutlery'
];

const FOOD_SUGGESTIONS: Record<string, { top: string[], all: string[] }> = {
    'Breads': {
        top: ['Butter Naan', 'Tandoori Roti', 'Paratha', 'Puri', 'Lachcha Paratha', 'Rumali Roti', 'Kulcha', 'Bhature'],
        all: ['Butter Naan', 'Tandoori Roti', 'Paratha', 'Puri', 'Lachcha Paratha', 'Rumali Roti', 'Kulcha', 'Bhature', 'Garlic Naan', 'Pudina Paratha', 'Missi Roti', 'Stuffed Kulcha']
    },
    'Desserts': {
        top: ['Gulab Jamun', 'Jalebi', 'Rasgulla', 'Kheer', 'Kaju Katli', 'Rabdi', 'Kulfi', 'Barfi', 'Motichoor Laddu', 'Phirni'],
        all: ['Gulab Jamun', 'Jalebi', 'Rasgulla', 'Kheer', 'Kaju Katli', 'Rabdi', 'Kulfi', 'Barfi', 'Motichoor Laddu', 'Phirni', 'Mithai Mix', 'Peda', 'Laddu', 'Momos Dessert', 'Malpua', 'Halwa (Gajar/Suji)', 'Ice Cream Counter', 'Chocolate Fountain', 'Falooda', 'Shahi Tukda']
    },
    'Starters': {
        top: ['Samosa', 'Paneer Tikka', 'Chicken Lollipop', 'Gol Gappa', 'Aloo Tikki', 'Shami Kebab', 'Tandoori Prawns', 'Hara Bhara Kebab'],
        all: ['Samosa', 'Paneer Tikka', 'Chicken Lollipop', 'Gol Gappa', 'Aloo Tikki', 'Shami Kebab', 'Tandoori Prawns', 'Hara Bhara Kebab', 'Chaat Bhel', 'Pav Bhaji', 'Dahi Bhalle', 'Sev Tamatar', 'Chikhalwali', 'Spring Rolls', 'Chilli Paneer', 'Mushroom Tikka', 'Veg Manchurian']
    },
    'Main Course': {
        top: ['Dal Makhani', 'Paneer Butter Masala', 'Butter Chicken', 'Tandoori Chicken', 'Mutton Biryani', 'Shahi Paneer', 'Malai Kofta', 'Chana Masala', 'Kadai Paneer', 'Fish Curry'],
        all: ['Dal Makhani', 'Paneer Butter Masala', 'Butter Chicken', 'Tandoori Chicken', 'Mutton Biryani', 'Shahi Paneer', 'Malai Kofta', 'Chana Masala', 'Kadai Paneer', 'Fish Curry', 'Palak Paneer', 'Aloo Gobi', 'Mixed Veg Curry', 'Rajma', 'Baingan Bharta', 'Veg Biryani', 'Pulao (Jeera/Veg)', 'Bhindi Masala', 'Kaju Curry', 'Prawn Masala', 'Keema', 'Tandoori Fish']
    },
    'Rice': {
        top: ['Jeera Rice', 'Veg Biryani', 'Mutton Biryani', 'Pulao', 'Steamed Rice'],
        all: ['Jeera Rice', 'Veg Biryani', 'Mutton Biryani', 'Pulao', 'Steamed Rice', 'Peas Pulao', 'Chicken Biryani', 'Kashmiri Pulao']
    },
    'Beverages': {
        top: ['Tea', 'Coffee', 'Cold Drink', 'Fresh Juice', 'Mocktail', 'Jaljeera', 'Lassi', 'Butter Milk'],
        all: ['Tea', 'Coffee', 'Cold Drink', 'Fresh Juice', 'Mocktail', 'Jaljeera', 'Lassi', 'Butter Milk', 'Aam Panna', 'Thandai', 'Mojito', 'Iced Tea']
    },
    'Salads': {
        top: ['Green Salad', 'Russian Salad', 'Macaroni Salad', 'Kachumber Salad', 'Corn Salad', 'Sprout Salad', 'Fruit Salad', 'Tossed Salad'],
        all: ['Green Salad', 'Russian Salad', 'Macaroni Salad', 'Kachumber Salad', 'Corn Salad', 'Sprout Salad', 'Fruit Salad', 'Tossed Salad']
    },
    'Soups': {
        top: ['Tomato Soup', 'Sweet Corn Soup', 'Manchow Soup', 'Hot & Sour Soup', 'Mushroom Soup', 'Clear Soup', 'Minestrone Soup', 'Broccoli Soup'],
        all: ['Tomato Soup', 'Sweet Corn Soup', 'Manchow Soup', 'Hot & Sour Soup', 'Mushroom Soup', 'Clear Soup', 'Minestrone Soup', 'Broccoli Soup']
    },
    'Accompaniments': {
        top: ['Roasted Papad', 'Masala Papad', 'Mixed Pickle', 'Green Chutney', 'Tamarind Chutney', 'Raita', 'Pineapple Raita', 'Boondi Raita'],
        all: ['Roasted Papad', 'Masala Papad', 'Mixed Pickle', 'Green Chutney', 'Tamarind Chutney', 'Raita', 'Pineapple Raita', 'Boondi Raita']
    },
    'Grilled Meats': {
        top: ['Tandoori Chicken', 'Chicken Tikka', 'Mutton Seekh Kebab', 'Fish Tikka', 'Prawns Koliwada'],
        all: ['Tandoori Chicken', 'Chicken Tikka', 'Mutton Seekh Kebab', 'Fish Tikka', 'Prawns Koliwada', 'Reshmi Kebab', 'Tangdi Kebab']
    },
    'Seafood': {
        top: ['Fish Curry', 'Prawn Masala', 'Tandoori Fish', 'Fish Fry', 'Goan Fish Curry'],
        all: ['Fish Curry', 'Prawn Masala', 'Tandoori Fish', 'Fish Fry', 'Goan Fish Curry', 'Prawns Pepper Fry', 'Crab Masala']
    },
    'Pastas': {
        top: ['Penne Arrabbiata', 'Alfredo Pasta', 'Mac & Cheese', 'Aglio Olio', 'Pink Sauce Pasta'],
        all: ['Penne Arrabbiata', 'Alfredo Pasta', 'Mac & Cheese', 'Aglio Olio', 'Pink Sauce Pasta', 'Pesto Pasta', 'Lasagna']
    }
};

const ALL_CATEGORIES = [
    { name: 'Breads', count: 28 },
    { name: 'Pastas', count: 28 },
    { name: 'Salads', count: 15 },
    { name: 'Soups', count: 12 },
    { name: 'Grilled Meats', count: 20 },
    { name: 'Seafood', count: 18 },
    { name: 'Desserts', count: 22 },
    { name: 'Starters', count: 30 },
    { name: 'Main Course', count: 40 },
    { name: 'Beverages', count: 15 },
    { name: 'Accompaniments', count: 10 },
    { name: 'Rice', count: 15 },
];

export default function CatererStep2ProductsAndPricing({
    packageId,
    packageGroupId,
    minMealsPreference,
    setMinMealsPreference,
    menus,
    setMenus,
    toggleMenuExpand,
    deleteMenu,
    handleAddMenu,
    activeMenuDropdown,
    setActiveMenuDropdown,
    crockeryIncluded,
    setCrockeryIncluded,
    crockeryDisposable,
    setCrockeryDisposable,
    crockeryBoneChina,
    setCrockeryBoneChina,
    crockeryType,
    setCrockeryType,
    addons,
    setAddons,
    handleOpenAddonForm,
    handleEditAddon,
    includedText,
    setIncludedText,
    notIncludedText,
    setNotIncludedText,
}: Props) {
    // Inventory sub-tabs & text input states mapped by menu.id
    const [activeTabs, setActiveTabs] = React.useState<Record<string, string>>({});
    const [activeMainSections, setActiveMainSections] = React.useState<Record<string, string>>({});
    const [typedInputs, setTypedInputs] = React.useState<Record<string, string>>({});
    
    // NEW STATES FOR SHEETS
    const [isPreferenceSheetOpen, setIsPreferenceSheetOpen] = React.useState(false);
    const [categorySelection, setCategorySelection] = React.useState<{ isOpen: boolean, step: 'meal-type' | 'category', isNewMenu: boolean, targetMenuId?: string } | null>(null);
    const [selectedMealType, setSelectedMealType] = React.useState<string>('Breakfast');
    const [selectedCategoriesList, setSelectedCategoriesList] = React.useState<string[]>([]);
    const [categorySearchQuery, setCategorySearchQuery] = React.useState('');
    const [browseItemsSheet, setBrowseItemsSheet] = React.useState<{menuId: string, category: string} | null>(null);
    const [bottomSheetSearchTerm, setBottomSheetSearchTerm] = React.useState('');
    const [isAddonSelectionSheetOpen, setIsAddonSelectionSheetOpen] = React.useState(false);
    const [showCrockerySuggestions, setShowCrockerySuggestions] = React.useState(false);
    const [activeMenuSuggestionId, setActiveMenuSuggestionId] = React.useState<string | null>(null);

    // Food item classification modal state
    const [activeFoodItemChoice, setActiveFoodItemChoice] = React.useState<{
        menuId: string;
        tabName: string;
        itemIndex: number;
        name: string;
        currentType: 'Veg' | 'Non-veg' | 'Egg';
    } | null>(null);

    // Dynamic Custom Crockery Builder States
    const [newCrockeryType, setNewCrockeryType] = React.useState('');
    const [customCrockery, setCustomCrockery] = React.useState<string[]>(() => {
        return crockeryType.split(',').map(s => s.trim()).filter(Boolean);
    });
    const [customEnabled, setCustomEnabled] = React.useState(() => {
        return crockeryType.split(',').map(s => s.trim()).filter(Boolean).length > 0;
    });

    const foodInventoryTabs = [
        'Salads',
        'Breads',
        'Rice',
        'Starters',
        'Main Course',
        'Dessert',
        'Beverages',
        'Desserts',
        'Chats',
        'Miscellaneous'
    ];

    // Sync custom crockery options from loaded state
    React.useEffect(() => {
        if (crockeryType) {
            const parsed = crockeryType.split(',').map(s => s.trim()).filter(Boolean);
            // eslint-disable-next-line
            setCustomCrockery(prev => {
                const merged = Array.from(new Set([...prev, ...parsed]));
                return merged;
            });
        }
    }, [crockeryType]);

    const handleAddCustomCrockery = () => {
        if (!newCrockeryType.trim()) return;
        const trimmed = newCrockeryType.trim();
        if (!customCrockery.includes(trimmed)) {
            setCustomCrockery(prev => [...prev, trimmed]);
        }
        const currentSelected = crockeryType.split(',').map(s => s.trim()).filter(Boolean);
        if (!currentSelected.includes(trimmed)) {
            setCrockeryType([...currentSelected, trimmed].join(', '));
        }
        setNewCrockeryType('');
    };

    const handleAddFoodItem = (menuId: string, tabName: string, text: string, defaultType: 'Veg' | 'Non-veg' | 'Egg' = 'Veg') => {
        if (!text.trim()) return;
        setMenus(prev => prev.map(m => {
            if (m.id !== menuId) return m;
            const currentList = m.inventory[tabName] || [];
            if (currentList.some(item => item.name.toLowerCase() === text.trim().toLowerCase())) return m;
            
            const newItem: FoodItem = {
                name: text.trim(),
                foodType: defaultType,
            };
            return {
                ...m,
                inventory: {
                    ...m.inventory,
                    [tabName]: [...currentList, newItem]
                }
            };
        }));
        setTypedInputs(prev => ({ ...prev, [menuId]: '' }));
    };

    const handleSaveFoodType = () => {
        if (!activeFoodItemChoice) return;
        const { menuId, tabName, itemIndex, currentType } = activeFoodItemChoice;
        setMenus(prev => prev.map(m => {
            if (m.id !== menuId) return m;
            const currentList = [...(m.inventory[tabName] || [])];
            if (currentList[itemIndex]) {
                currentList[itemIndex] = {
                    ...currentList[itemIndex],
                    foodType: currentType
                };
            }
            return {
                ...m,
                inventory: {
                    ...m.inventory,
                    [tabName]: currentList
                }
            };
        }));
        setActiveFoodItemChoice(null);
    };

    // Helper SVG components for food item classification
    const renderFoodTypeIcon = (type: 'Veg' | 'Non-veg' | 'Egg', sizeClass = 'w-4 h-4') => {
        if (type === 'Veg') {
            return (
                <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke="#10B981" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r="4.5" fill="#10B981" />
                </svg>
            );
        } else if (type === 'Non-veg') {
            return (
                <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke="#C21A1A" strokeWidth="2.5" />
                    <polygon points="12,7 7,16 17,16" fill="#C21A1A" />
                </svg>
            );
        } else {
            return (
                <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke="#F59E0B" strokeWidth="2.5" />
                    <ellipse cx="12" cy="12" rx="3.5" ry="5" fill="#F59E0B" />
                </svg>
            );
        }
    };

    return (
        <div className="flex flex-col gap-6 mt-6 pb-32">
            <VariantManager 
                packageId={packageId || ''} 
                packageGroupId={packageGroupId || ''} 
                vendorType="Caterer"
                onVariantChange={(newId) => {
                    localStorage.setItem('selected_package_id', newId);
                    window.dispatchEvent(new Event('refresh_package_flow'));
                }}
            />

            {/* ── Crockery Panel ── */}
            <div className={CARD}>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-[22px]">Crockery</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium leading-[18px]">Include specific Crockery</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={crockeryIncluded}
                            onChange={() => setCrockeryIncluded(!crockeryIncluded)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#030303]"></div>
                    </label>
                </div>

                {crockeryIncluded && (
                    <div className="flex flex-col gap-4 transition-all duration-300">
                        {/* Disposable checkbox card */}
                        <div 
                            onClick={() => setCrockeryDisposable(!crockeryDisposable)}
                            className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] cursor-pointer hover:bg-gray-50 transition-all select-none"
                        >
                            <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                                crockeryDisposable ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8]'
                            }`}>
                                {crockeryDisposable && (
                                    <svg className="w-3.5 h-3.5 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Disposable</span>
                        </div>

                        {/* Bone china checkbox card */}
                        <div 
                            onClick={() => setCrockeryBoneChina(!crockeryBoneChina)}
                            className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] cursor-pointer hover:bg-gray-50 transition-all select-none"
                        >
                            <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                                crockeryBoneChina ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8]'
                            }`}>
                                {crockeryBoneChina && (
                                    <svg className="w-3.5 h-3.5 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Bone china</span>
                        </div>

                        {/* Custom checkbox card */}
                        <div 
                            onClick={() => {
                                const nextVal = !customEnabled;
                                setCustomEnabled(nextVal);
                                if (!nextVal) {
                                    setCustomCrockery([]);
                                    setCrockeryType('');
                                }
                            }}
                            className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] cursor-pointer hover:bg-gray-50 transition-all select-none"
                        >
                            <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                                customEnabled ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8]'
                            }`}>
                                {customEnabled && (
                                    <svg className="w-3.5 h-3.5 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Custom</span>
                        </div>

                        {customEnabled && (
                            <>
                                {/* Dynamic Custom Crockery Items List */}
                                {customCrockery.map((item) => {
                                    const isChecked = crockeryType.split(',').map(s => s.trim()).filter(Boolean).includes(item);
                                    return (
                                        <div 
                                            key={item}
                                            onClick={() => {
                                                const currentSelected = crockeryType.split(',').map(s => s.trim()).filter(Boolean);
                                                let nextSelected;
                                                if (isChecked) {
                                                    nextSelected = currentSelected.filter(s => s !== item);
                                                } else {
                                                    nextSelected = [...currentSelected, item];
                                                }
                                                setCrockeryType(nextSelected.join(', '));
                                            }}
                                            className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[12px] cursor-pointer hover:bg-gray-50 transition-all select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                                                    isChecked ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8]'
                                                }`}>
                                                    {isChecked && (
                                                        <svg className="w-3.5 h-3.5 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">{item}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const currentSelected = crockeryType.split(',').map(s => s.trim()).filter(Boolean);
                                                    setCrockeryType(currentSelected.filter(s => s !== item).join(', '));
                                                    setCustomCrockery(prev => prev.filter(s => s !== item));
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Add Custom Crockery Input with Add Button */}
                                <div className="flex flex-col gap-2 mt-2">
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Crockery Type</label>
                                    <div className="flex gap-2 relative">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="e.g. Silverware, Melamine"
                                                value={newCrockeryType}
                                                onChange={(e) => { setNewCrockeryType(e.target.value); setShowCrockerySuggestions(true); }}
                                                onFocus={() => setShowCrockerySuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowCrockerySuggestions(false), 200)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCustomCrockery();
                                                        setShowCrockerySuggestions(false);
                                                    }
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                            />
                                            {showCrockerySuggestions && (
                                                <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg max-h-52 overflow-y-auto z-50 py-1 text-left">
                                                    {CROCKERY_SUGGESTIONS
                                                        .filter(s => !customCrockery.includes(s) && s.toLowerCase().includes(newCrockeryType.toLowerCase()))
                                                        .map(suggestion => (
                                                            <div
                                                                key={suggestion}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    setNewCrockeryType(suggestion);
                                                                    setTimeout(() => {
                                                                        if (!customCrockery.includes(suggestion)) {
                                                                            setCustomCrockery(prev => [...prev, suggestion]);
                                                                        }
                                                                        const currentSelected = crockeryType.split(',').map(s => s.trim()).filter(Boolean);
                                                                        if (!currentSelected.includes(suggestion)) {
                                                                            setCrockeryType([...currentSelected, suggestion].join(', '));
                                                                        }
                                                                        setNewCrockeryType('');
                                                                        setShowCrockerySuggestions(false);
                                                                    }, 50);
                                                                }}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="px-4 py-2.5 cursor-pointer text-[15px] font-medium text-[#3F3F47] hover:bg-gray-100 transition-colors"
                                                            >
                                                                {suggestion}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomCrockery}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="px-6 bg-[#030303] text-white rounded-[12px] font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ── Menu Options Header ── */}
            <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-6 mt-4">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717B] tracking-wider uppercase">Menu Options <span className="text-[#C21A1A]">*</span></span>
                {menus.length > 1 && (
                    <button 
                        type="button" 
                        onClick={() => setIsPreferenceSheetOpen(true)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={minMealsPreference 
                            ? "bg-[#EFF6FF] text-[#3B82F6] px-3 py-1.5 rounded-full text-[13px] font-normal hover:bg-blue-100 transition-colors"
                            : "text-[#3B82F6] text-[14px] font-bold hover:underline"
                        }
                    >
                        {minMealsPreference ? `Atleast ${minMealsPreference} meal${minMealsPreference > 1 ? 's' : ''}` : 'Set Preference'}
                    </button>
                )}
            </div>

            {/* ── Render Menus List / Empty State ── */}
            {menus.length === 0 ? (
                <div 
                    onClick={() => {
                        setCategorySelection({ isOpen: true, step: 'meal-type', isNewMenu: true });
                        setSelectedCategoriesList([]);
                        setSelectedMealType('Breakfast');
                        setCategorySearchQuery('');
                    }}
                    className="border-2 border-dashed border-[#D4D4D8] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none mt-4"
                >
                    <img 
                        src="https://dkuacgndftndz.cloudfront.net/inventory-page/caterer_flow/menu_options.png" 
                        alt="No menus" 
                        className="w-40 h-40 object-contain mb-4 pointer-events-none"
                    />
                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">No items</h4>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#71717B] mt-1">To add an item click on Add Item on top or in this box</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 mt-6">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Brunch', 'Custom'].map(mealType => {
                        const mealMenus = menus.filter(m => m.type === mealType);
                        if (mealMenus.length === 0) return null;
                        
                        return (
                            <div key={mealType} className="flex flex-col gap-3">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider pl-1">{mealType}</span>
                                {mealMenus.map((menu, index) => (
                                    <div 
                                        key={menu.id} 
                                        onClick={() => setActiveMenuDropdown(menu.id)}
                                        className="p-5 flex justify-between items-center cursor-pointer bg-white rounded-[16px] border border-[#E4E4E7] hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">
                                                {menu.name || `Menu Option ${index + 1}`}
                                            </span>
                                            <div className="flex items-center text-[#A1A1AA]">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                    
                    <button 
                        type="button" 
                        onClick={() => {
                            setCategorySelection({ isOpen: true, step: 'meal-type', isNewMenu: true });
                            setSelectedCategoriesList([]);
                            setSelectedMealType('Breakfast');
                            setCategorySearchQuery('');
                        }}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full py-3.5 bg-[#F4F4F5] rounded-[16px] text-[15px] font-bold text-[#030303] flex items-center justify-center gap-2 hover:bg-[#E4E4E7] transition-colors mt-2"
                    >
                        Add <PlusCircle size={18} />
                    </button>
                </div>
            )}


            {/* ── Extra Add-ons ── */}
            <div className="flex flex-col gap-3 mt-6 border-t border-[#E4E4E7] pt-6">
                <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717B] tracking-wider uppercase">Add-ons <span className="text-[#C21A1A]">*</span></span>
                    <button 
                        type="button" 
                        onClick={() => setIsAddonSelectionSheetOpen(true)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="text-[15px] font-bold text-[#030303] flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-transform"
                    >
                        Add <span className="text-[20px] font-semibold leading-none">+</span>
                    </button>
                </div>
                
                {addons.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {addons.map((addon) => (
                            <div 
                                key={addon.id} 
                                onClick={() => handleEditAddon(addon)}
                                className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex justify-between items-center shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
                            >
                                <div className="flex flex-col">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{addon.name}</span>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium">{addon.category} • {addon.price} INR {addon.billingUnit}</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAddons(prev => prev.filter(a => a.id !== addon.id));
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold text-[13px] relative z-10"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div 
                        onClick={() => setIsAddonSelectionSheetOpen(true)}
                        className="border-2 border-dashed border-[#D4D4D8] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none"
                    >
                        <img 
                            src="https://dkuacgndftndz.cloudfront.net/inventory-page/caterer_flow/add_ons.png" 
                            alt="No add-ons" 
                            className="w-40 h-40 object-contain mb-4 pointer-events-none"
                        />
                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">No Add-ons</h4>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#71717B] mt-1">To add an add-on click Add on top or in this box</p>
                    </div>
                )}
            </div>


            {/* ── About The Package ── */}
            <div className={CARD}>
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] tracking-wider">About The Package</label>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium -mt-1">List everything a customer gets when they book this package</p>
                    <textarea
                        rows={4}
                        placeholder="Enter details"
                        value={includedText}
                        onChange={(e) => setIncludedText(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none mt-2"
                    />
                </div>

                <div className="flex flex-col gap-2 mt-6">
                    <div className="flex items-center gap-1.5">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] tracking-wider">What&apos;s Not Included</label>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="#C21A1A"/>
                            <path d="M12 7v6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="12" cy="16.5" r="1.25" fill="white"/>
                        </svg>
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium -mt-1">Help customers know what they&apos;ll need to arrange separately</p>
                    <textarea
                        rows={4}
                        placeholder="Enter Details.."
                        value={notIncludedText}
                        onChange={(e) => setNotIncludedText(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none mt-2"
                    />
                </div>
            </div>

            {/* ── Active Menu Portal Drawer ── */}
            {activeMenuDropdown && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden">
                    {menus.filter(m => m.id === activeMenuDropdown).map(menu => {
                        const currentTab = activeTabs[menu.id] !== undefined ? activeTabs[menu.id] : (Object.keys(menu.inventory || {})[0] || '');
                        const currentMainSection = activeMainSections[menu.id] !== undefined ? activeMainSections[menu.id] : 'Menu Builder';
                        const currentInput = typedInputs[menu.id] || '';
                        return (
                            <div key={menu.id} className="flex flex-col h-full relative">
                                {/* Header */}
                                <div className="sticky top-0 bg-white border-b border-[#E4E4E7] px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                                    <div className="flex flex-col">
                                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">{menu.name || 'Menu Option 1'}</h2>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] font-medium mt-1">Fill out the details about the item you chose.</p>
                                    </div>
                                    <button onClick={() => deleteMenu(menu.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 pb-32 max-w-3xl mx-auto w-full flex flex-col gap-4">
                                    {/* 1. Menu Basics */}
                                    <div className="bg-white rounded-[16px] border border-[#E4E4E7] overflow-hidden shrink-0">
                                        <CollapsibleSection 
                                            title="Menu Basics" 
                                            isOpen={currentMainSection === 'Menu Basics'}
                                            onToggle={() => setActiveMainSections(prev => ({ ...prev, [menu.id]: currentMainSection === 'Menu Basics' ? '' : 'Menu Basics' }))}
                                            subtitle="2/2"
                                            icon={
                                                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${menu.name.trim() && menu.type ? 'bg-[#16A34A]' : 'bg-[#E4E4E7]'}`}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                            }
                                            summary={
                                                (menu.name.trim() || menu.type) ? (
                                                    <div style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#A1A1AA] pt-1">
                                                        {menu.name || 'Unnamed Menu'}{menu.type ? ` • ${menu.type}` : ''}
                                                    </div>
                                                ) : null
                                            }
                                        >
                                            <div className="flex flex-col gap-6 pt-2 pb-6 px-5">
                                                <div className="flex flex-col gap-2">
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Menu Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Standard Menu"
                                                        value={menu.name}
                                                        onChange={(e) => setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, name: e.target.value } : m))}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Menu Type</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((t) => {
                                                            const isActive = menu.type === t;
                                                            return (
                                                                <button
                                                                    key={t}
                                                                    type="button"
                                                                    onClick={() => setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, type: t } : m))}
                                                                    className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                                                                        isActive 
                                                                            ? 'bg-[#04222D] text-white shadow-sm' 
                                                                            : 'bg-[#FAFAFA] text-[#71717B] border border-[#E4E4E7] hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {t}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleSection>
                                    </div>

                                    {/* 2. Menu Builder */}
                                    <div className="bg-white rounded-[16px] border border-[#E4E4E7] overflow-hidden shrink-0">
                                        <CollapsibleSection 
                                            title="Menu Builder" 
                                            isOpen={currentMainSection === 'Menu Builder'}
                                            onToggle={() => setActiveMainSections(prev => ({ ...prev, [menu.id]: currentMainSection === 'Menu Builder' ? '' : 'Menu Builder' }))}
                                            subtitle="1/1"
                                            icon={
                                                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${Object.values(menu.inventory || {}).some(items => items.length > 0) ? 'bg-[#16A34A]' : 'bg-[#E4E4E7]'}`}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                            }
                                            summary={
                                                Object.keys(menu.inventory || {}).some(k => menu.inventory[k].length > 0) ? (
                                                    <div className="flex flex-col gap-2 pt-2">
                                                        {Object.entries(menu.inventory || {}).filter(([_, items]) => items.length > 0).map(([cat, items]) => (
                                                            <div key={cat} className="flex items-center justify-between">
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#A1A1AA]">{cat}</span>
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717A]">{items.length} dishes</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null
                                            }
                                        >
                                            <div className="flex flex-col gap-4 px-3 pb-5 sm:px-4">
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Food Categories</span>
                                                    <button type="button" onClick={() => {
                                                        setCategorySelection({ isOpen: true, step: 'category', isNewMenu: false, targetMenuId: menu.id });
                                                        setSelectedCategoriesList(Object.keys(menu.inventory || {}));
                                                        setCategorySearchQuery('');
                                                    }} className="flex items-center gap-1.5 text-[14px] font-bold text-[#030303] hover:opacity-80">
                                                        Edit 
                                                        <div className="w-5 h-5 rounded-full bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Accordions for Categories */}
                                                {Object.keys(menu.inventory || {}).map(category => {
                                                    const isCategoryExpanded = currentTab === category;
                                                    const categoryItems = menu.inventory[category] || [];
                                                    const limit = Math.min(menu.chooseLimits?.[category] !== undefined ? menu.chooseLimits[category] : categoryItems.length, Math.max(1, categoryItems.length));
                                                    
                                                    let suggestions: string[] = FOOD_SUGGESTIONS[category]?.top || [];
                                                        
                                                    return (
                                                        <div key={category} className={`border rounded-[16px] overflow-hidden transition-colors ${isCategoryExpanded ? 'border-[#04222D]' : 'border-[#E4E4E7]'}`}>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setActiveTabs(prev => ({ ...prev, [menu.id]: isCategoryExpanded ? '' : category }))}
                                                                className="w-full px-3 py-4 sm:px-4 flex items-center justify-between bg-white text-left"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{category}</span>
                                                                    {!isCategoryExpanded && <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#A1A1AA] font-medium">{categoryItems.length} items added {limit > 0 ? `• Choose ${limit}` : ''}</span>}
                                                                </div>
                                                                <ChevronDown size={20} className={`text-[#A1A1AA] transition-transform ${isCategoryExpanded ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            {isCategoryExpanded && (
                                                                <div className="px-3 sm:px-4 pb-4 bg-white flex flex-col gap-6">
                                                                    {/* QUICK ADD */}
                                                                    <div className="flex flex-col gap-3 mt-4">
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wider">Quick Add</span>
                                                                        
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {suggestions.filter(s => !categoryItems.some(item => item.name.toLowerCase() === s.toLowerCase())).map((s, idx) => (
                                                                                <button key={`${s}-${idx}`} type="button" onClick={() => handleAddFoodItem(menu.id, category, s)} className="px-3 py-2 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-[#030303] hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm">
                                                                                    {renderFoodTypeIcon('Veg', 'w-3.5 h-3.5')}
                                                                                    <span className="max-w-[120px] truncate">{s}</span>
                                                                                    <span className="text-[16px] leading-none text-[#A1A1AA] font-light ml-1">+</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <button type="button" onClick={() => { setBrowseItemsSheet({menuId: menu.id, category}); setBottomSheetSearchTerm(''); }} className="mt-2 w-max px-6 py-2.5 bg-white border border-[#030303] rounded-[24px] text-[14px] font-bold text-[#030303] hover:bg-gray-50 transition-all">
                                                                            Show All Items
                                                                        </button>
                                                                    </div>

                                                                    {/* SELECTED */}
                                                                    {categoryItems.length > 0 && (
                                                                        <div className="flex flex-col gap-3 border-t border-[#E4E4E7] pt-6">
                                                                            <div className="flex items-center justify-between">
                                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wider">Selected</span>
                                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">{categoryItems.length} items selected</span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {categoryItems.map((item, idx) => (
                                                                                    <button 
                                                                                        key={idx} 
                                                                                        type="button" 
                                                                                        onClick={() => setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, inventory: { ...m.inventory, [category]: m.inventory[category].filter((_, i) => i !== idx) } } : m))}
                                                                                        className="px-3 py-2 bg-[#F4F4F5] border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-[#030303] hover:bg-gray-200 flex items-center gap-2 transition-all"
                                                                                    >
                                                                                        {renderFoodTypeIcon(item.foodType, 'w-3.5 h-3.5')}
                                                                                        <span className="max-w-[120px] truncate">{item.name}</span>
                                                                                        <span className="text-[#A1A1AA] ml-1">×</span>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Custom Add */}
                                                                    <div className="flex flex-col gap-3">
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#030303]">Can't find it? Add your own dish</span>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="qwerty"
                                                                            value={currentInput}
                                                                            onChange={(e) => setTypedInputs(prev => ({ ...prev, [menu.id]: e.target.value }))}
                                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                            className="w-full p-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[12px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            {['Veg', 'Non-veg', 'Egg'].map(type => (
                                                                                <button 
                                                                                    key={type}
                                                                                    type="button"
                                                                                    onClick={() => handleAddFoodItem(menu.id, category, currentInput, type as any)}
                                                                                    className="flex-1 py-2 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-[#030303] hover:bg-gray-50 flex flex-row items-center justify-center gap-1 sm:gap-2 transition-all whitespace-nowrap"
                                                                                >
                                                                                    {renderFoodTypeIcon(type as any, 'w-4 h-4')} {type}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => handleAddFoodItem(menu.id, category, currentInput)}
                                                                            className="w-full py-3.5 bg-[#E4E4E7] text-[#71717B] rounded-[12px] font-bold text-[15px] hover:bg-gray-300 transition-all mt-1"
                                                                        >
                                                                            Add dish
                                                                        </button>
                                                                    </div>

                                                                    {/* Limit Selector */}
                                                                    <div className="flex flex-col gap-3 mt-4">
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#030303]">How many items can the customer choose?</span>
                                                                        <div className="flex items-center gap-3">
                                                                            <button 
                                                                                type="button" 
                                                                                onClick={() => setMenus(prev => prev.map(m => {
                                                                                    const catLen = (m.inventory[category] || []).length;
                                                                                    const currentLim = Math.min(m.chooseLimits?.[category] !== undefined ? m.chooseLimits[category] : catLen, Math.max(1, catLen));
                                                                                    return m.id === menu.id ? { ...m, chooseLimits: { ...(m.chooseLimits || {}), [category]: Math.max(1, currentLim - 1) } } : m;
                                                                                }))}
                                                                                disabled={limit <= 1 || categoryItems.length === 0}
                                                                                className={`w-10 h-10 rounded-full border border-[#D4D4D8] flex items-center justify-center font-bold text-[20px] shrink-0 transition-colors ${(limit <= 1 || categoryItems.length === 0) ? 'text-[#A1A1AA] bg-gray-50 cursor-not-allowed' : 'text-[#030303] hover:bg-gray-50'}`}
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <div className="flex-1 p-3.5 border border-[#D4D4D8] rounded-[12px] flex items-center justify-between bg-white">
                                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{categoryItems.length === 0 ? 0 : limit}</span>
                                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#A1A1AA]">of {categoryItems.length}</span>
                                                                            </div>
                                                                            <button 
                                                                                type="button" 
                                                                                onClick={() => setMenus(prev => prev.map(m => {
                                                                                    const catLen = (m.inventory[category] || []).length;
                                                                                    const currentLim = Math.min(m.chooseLimits?.[category] !== undefined ? m.chooseLimits[category] : catLen, Math.max(1, catLen));
                                                                                    return m.id === menu.id ? { ...m, chooseLimits: { ...(m.chooseLimits || {}), [category]: Math.min(catLen, currentLim + 1) } } : m;
                                                                                }))}
                                                                                disabled={limit >= categoryItems.length || categoryItems.length === 0}
                                                                                className={`w-10 h-10 rounded-full border border-[#D4D4D8] flex items-center justify-center font-bold text-[20px] shrink-0 transition-colors ${(limit >= categoryItems.length || categoryItems.length === 0) ? 'text-[#A1A1AA] bg-gray-50 cursor-not-allowed' : 'text-[#030303] hover:bg-gray-50'}`}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#A1A1AA] mt-1">Guests can pick any {categoryItems.length === 0 ? 0 : limit} of your {categoryItems.length} items</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CollapsibleSection>
                                    </div>

                                    {/* 3. Tags And Pricing */}
                                    <div className="bg-white rounded-[16px] border border-[#E4E4E7] overflow-hidden shrink-0">
                                        <CollapsibleSection 
                                            title="Tags And Pricing" 
                                            isOpen={currentMainSection === 'Tags And Pricing'}
                                            onToggle={() => setActiveMainSections(prev => ({ ...prev, [menu.id]: currentMainSection === 'Tags And Pricing' ? '' : 'Tags And Pricing' }))}
                                            subtitle="2/2"
                                            icon={
                                                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${(menu.serviceStyles?.length > 0 && menu.priceModel?.trim()) ? 'bg-[#16A34A]' : 'bg-[#E4E4E7]'}`}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                            }
                                            summary={
                                                ((menu.cuisineTypes?.length ?? 0) > 0 || (menu.serviceStyles?.length ?? 0) > 0 || menu.priceModel) ? (
                                                    <div className="flex flex-col pt-2">
                                                        <div className="flex flex-col gap-2 pb-3 border-b border-[#F4F4F5]">
                                                            {menu.cuisineTypes && menu.cuisineTypes.length > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#A1A1AA]">Cuisine Type</span>
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717A]">{menu.cuisineTypes.length} selected</span>
                                                                </div>
                                                            )}
                                                            {menu.serviceStyles && menu.serviceStyles.length > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#A1A1AA]">Service Type</span>
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717A]">{menu.serviceStyles.length} selected</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between pt-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#A1A1AA]">Per Plate Price</span>
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">{menu.priceModel ? `₹ ${menu.priceModel}` : '-'}</span>
                                                        </div>
                                                    </div>
                                                ) : null
                                            }
                                        >
                                            <div className="flex flex-col gap-6 pt-2 px-5 pb-6">
                                                {/* Cuisine Type */}
                                                <div className="flex flex-col gap-3">
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#030303]">Cuisine Type</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Mughlai', 'Italian', 'Thai', 'Mexican', 'Street Food', 'Pan-Asian', 'Bengali', 'Gujarati', 'Rajasthani', 'Hyderabadi', 'Punjabi', 'Multi-Cuisine'].map(c => {
                                                            const isActive = (menu.cuisineTypes || []).includes(c);
                                                            return (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const types = menu.cuisineTypes || [];
                                                                        const newTypes = isActive ? types.filter(t => t !== c) : [...types, c];
                                                                        setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, cuisineTypes: newTypes } : m));
                                                                    }}
                                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                                                                        isActive ? 'bg-[#E4E4E7] text-[#030303]' : 'bg-[#FAFAFA] text-[#71717B] border border-[#E4E4E7] hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {c}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Service Type */}
                                                <div className="flex flex-col gap-3">
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#030303]">Service Type</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Buffet', 'Sit-down / Plated', 'Live Counters', 'Food Truck', 'Cloud Kitchen Delivery'].map(s => {
                                                            const isActive = menu.serviceStyles.includes(s);
                                                            return (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const styles = menu.serviceStyles;
                                                                        const newStyles = isActive ? styles.filter(x => x !== s) : [...styles, s];
                                                                        setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, serviceStyles: newStyles } : m));
                                                                    }}
                                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                                                                        isActive ? 'bg-[#E4E4E7] text-[#030303]' : 'bg-[#FAFAFA] text-[#71717B] border border-[#E4E4E7] hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Additional Chips */}
                                                <div className="flex flex-col gap-3">
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#030303]">Additional Chips</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Gluten free', 'Sattvic', 'Vegan-friendly', 'Jain Food', 'Dairy-free', 'Sugar-free', 'Nut-free', 'Halal (or Jain)', 'Highly Spicy', 'Moderately Spicy', 'Less Spicy'].map(c => {
                                                            const isActive = (menu.additionalChips || []).includes(c);
                                                            return (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const chips = menu.additionalChips || [];
                                                                        const newChips = isActive ? chips.filter(x => x !== c) : [...chips, c];
                                                                        setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, additionalChips: newChips } : m));
                                                                    }}
                                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                                                                        isActive ? 'bg-[#E4E4E7] text-[#030303]' : 'bg-[#FAFAFA] text-[#71717B] border border-[#E4E4E7] hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {c}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Pricing */}
                                                <div className="flex flex-col gap-2">
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#030303]">Per Plate Price</label>
                                                    <div className="flex items-center border border-[#E4E4E7] rounded-[16px] overflow-hidden focus-within:ring-1 focus-within:ring-gray-300">
                                                        <div className="bg-[#F4F4F5] px-5 py-4 border-r border-[#E4E4E7] flex items-center justify-center shrink-0">
                                                            <span className="text-[#71717B] font-medium text-[15px]">₹</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="0.0"
                                                            value={menu.priceModel || ''}
                                                            onChange={(e) => setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, priceModel: e.target.value } : m))}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="flex-1 p-4 bg-white text-[16px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleSection>
                                    </div>
                                </div>

                                {/* Save Sticky Footer */}
                                <div className="sticky bottom-0 bg-white border-t border-[#E4E4E7] p-4 pb-8 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    <button 
                                        type="button"
                                        onClick={() => setActiveMenuDropdown(null)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                        className="w-full bg-[#030303] text-white py-4 rounded-[16px] font-bold text-[15px] hover:bg-gray-800 transition-all shadow-md"
                                    >
                                        Save Menu
                                    </button>
                                </div>
                            
                                {/* Bottom Sheets */}
                                {browseItemsSheet && browseItemsSheet.menuId === menu.id && (
                                    <div className="absolute inset-0 bg-black/40 z-[70] flex flex-col justify-end">
                                        <div className="bg-white rounded-t-[24px] p-6 h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Browse {browseItemsSheet.category}</h3>
                                                <button onClick={() => setBrowseItemsSheet(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                                            </div>
                                            <div className="relative mb-4">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="text" placeholder={`Search ${browseItemsSheet.category}...`} value={bottomSheetSearchTerm} onChange={(e) => setBottomSheetSearchTerm(e.target.value)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full pl-11 p-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[12px] text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-300" />
                                            </div>
                                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                                                {['All', 'Veg', 'Non-veg', 'Egg'].map(f => (
                                                    <button key={f} className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap ${f === 'All' ? 'bg-[#030303] text-white' : 'bg-gray-100 text-[#71717B] hover:bg-gray-200 transition-colors'}`}>{f}</button>
                                                ))}
                                            </div>
                                            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-8">
                                                {(() => {
                                                    const activeMenu = menus.find(m => m.id === browseItemsSheet.menuId);
                                                    const categoryItemsForSheet = activeMenu?.inventory[browseItemsSheet.category] || [];
                                                    return (FOOD_SUGGESTIONS[browseItemsSheet.category]?.all || [])
                                                        .filter(dish => dish.toLowerCase().includes(bottomSheetSearchTerm.toLowerCase()))
                                                        .filter(dish => !categoryItemsForSheet.some(item => item.name.toLowerCase() === dish.toLowerCase()))
                                                        .map(dish => (
                                                        <div key={dish} className="flex items-center justify-between p-4 rounded-[16px] border border-[#E4E4E7] bg-white">
                                                            <div className="flex items-center gap-3">
                                                                {renderFoodTypeIcon(dish.includes('Chicken') || dish.includes('Mutton') || dish.includes('Fish') || dish.includes('Prawn') || dish.includes('Keema') ? 'Non-veg' : 'Veg', 'w-4 h-4')}
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{dish}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleAddFoodItem(browseItemsSheet.menuId, browseItemsSheet.category, dish)}
                                                            className="w-8 h-8 rounded-full border border-[#D4D4D8] flex items-center justify-center text-[#030303] font-medium text-[16px] hover:bg-gray-100 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ))})()}
                                            </div>
                                        </div>
                                    </div>
                                )}
</div>
                        );
                    })}
                </div>,
                document.body
            )}


            {/* ── Menu Selection Rules Bottom Sheet ── */}
            {isPreferenceSheetOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[70] bg-black/40 flex flex-col justify-end">
                    <div className="bg-white rounded-t-[24px] p-6 flex flex-col animate-in slide-in-from-bottom-full duration-300 relative mx-auto w-full max-w-2xl">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303]">Menu Selection Rules</h3>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] mt-1">Set Menu preferences based on your needs</p>
                            </div>
                            <button onClick={() => setIsPreferenceSheetOpen(false)} className="p-2 bg-[#F4F4F5] hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="border-t border-[#F4F4F5] my-4"></div>
                        
                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-1">Minimum meal types</h4>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] mb-5 leading-relaxed">
                            Select the minimum number of meal types customers must choose.
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mb-8">
                            {Array.from({ length: Math.max(0, menus.length - 1) }, (_, i) => i + 1).map(num => (
                                <button 
                                    key={num}
                                    onClick={() => setMinMealsPreference(num)}
                                    className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-all ${
                                        minMealsPreference === num 
                                            ? 'bg-white border-2 border-[#030303] text-[#030303] shadow-sm' 
                                            : 'bg-white border border-[#D4D4D8] text-[#71717B] hover:border-gray-400'
                                    }`}
                                >
                                    Atleast {num}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setIsPreferenceSheetOpen(false)}
                            style={{ fontFamily: 'Figtree, sans-serif' }} 
                            className="w-full bg-[#04222D] text-white py-4 rounded-[16px] font-bold text-[15px] hover:bg-gray-800 transition-all shadow-md mb-2"
                        >
                            Save Rule
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Add-on Selection Sheet */}
            {isAddonSelectionSheetOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-black/40 z-[80] flex flex-col justify-end">
                    <div className="bg-white rounded-t-[24px] p-6 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 mx-auto w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Add an Add-on</h3>
                            <button onClick={() => setIsAddonSelectionSheetOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] mb-6 -mt-2">Pick one to start, or build your own</p>
                        
                        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-8">
                            {[
                                { name: 'Basmati Upgrade', type: 'Product', cat: 'Main Course' },
                                { name: 'Panipuri Live Counter', type: 'Service', cat: 'Food' },
                                { name: 'Tandoori Specialties', type: 'Product', cat: 'Starter' },
                                { name: 'Bar Service', type: 'Service', cat: 'Drinks' },
                                { name: 'Premium Dessert Counter', type: 'Service', cat: 'Food' }
                            ].map(preset => (
                                <button 
                                    key={preset.name}
                                    onClick={() => {
                                        setIsAddonSelectionSheetOpen(false);
                                        const presetAddon: Addon = {
                                            id: Math.random().toString(36).substring(7),
                                            type: preset.type as any,
                                            name: preset.name,
                                            category: preset.type === 'Product' ? 'Food' : preset.cat,
                                            subCategory: preset.type === 'Product' ? preset.cat : '',
                                            quantity: '',
                                            description: '',
                                            price: '',
                                            billingUnit: preset.type === 'Product' ? 'Per Person' : 'Per Event',
                                            policies: [],
                                            media: [],
                                            productType: preset.type === 'Product' ? 'Food' : undefined
                                        };
                                        handleEditAddon(presetAddon);
                                    }}
                                    className="flex items-center justify-between p-4 rounded-[16px] border border-[#E4E4E7] hover:border-[#030303] bg-white transition-colors"
                                >
                                    <div className="flex flex-col text-left">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{preset.name}</span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium">{preset.type}</span>
                                    </div>
                                    <span className="text-[#030303]">
                                        <ChevronDown size={18} className="-rotate-90" />
                                    </span>
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => {
                                    setIsAddonSelectionSheetOpen(false);
                                    handleOpenAddonForm();
                                }}
                                className="flex items-center gap-3 p-4 rounded-[16px] border border-[#E4E4E7] hover:border-[#030303] bg-white transition-colors mt-2"
                            >
                                <span className="w-8 h-8 rounded-full border border-[#D4D4D8] flex items-center justify-center text-[#030303] font-light text-[20px]">+</span>
                                <div className="flex flex-col text-left">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">Add a custom add-on</span>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium">e.g. Drone shot, Live streaming</span>
                                </div>
                                <div className="ml-auto">
                                    <ChevronDown size={18} className="-rotate-90 text-[#030303]" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Category Selection Bottom Sheet */}
            {categorySelection?.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-black/40 z-[90] flex flex-col justify-end">
                    <div className="bg-white rounded-t-[24px] p-6 h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 mx-auto w-full max-w-2xl relative">
                        {categorySelection.step === 'meal-type' ? (
                            <>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Choose Meal Type</h3>
                                    <button onClick={() => setCategorySelection(null)} className="w-8 h-8 flex items-center justify-center bg-[#F4F4F5] hover:bg-[#E4E4E7] rounded-full transition-colors text-[#71717B]"><X size={16} strokeWidth={3}/></button>
                                </div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] mb-6">Select the meal type that best suits this menu</p>
                                
                                <div className="flex-1 overflow-y-auto pb-32 scrollbar-none">
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Brunch', 'Custom'].map((meal) => {
                                            const isSelected = selectedMealType === meal;
                                            return (
                                                <button
                                                    key={meal}
                                                    onClick={() => setSelectedMealType(meal)}
                                                    className={`relative overflow-hidden h-28 rounded-[16px] border ${isSelected ? 'border-[#04222D] border-[2px] shadow-sm' : 'border-[#E4E4E7] hover:border-[#D4D4D8] border-[1px]'} bg-white transition-all text-left flex flex-col`}
                                                >
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="p-4 text-[15px] font-bold text-[#030303] relative z-10">{meal}</span>
                                                    <div className="absolute right-0 bottom-0 w-20 h-20 opacity-95">
                                                        <img 
                                                            src={`/images/meal-types/${meal.toLowerCase()}.jpg`} 
                                                            alt={meal} 
                                                            style={{ mixBlendMode: 'multiply' }}
                                                            className="w-full h-full object-contain mix-blend-multiply rounded-br-[16px]" 
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Sticky Continue Button */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                                    <button
                                        type="button"
                                        onClick={() => setCategorySelection(prev => prev ? { ...prev, step: 'category' } : null)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 rounded-[16px] text-[16px] font-bold transition-all shadow-md bg-[#04222D] text-white hover:bg-opacity-90"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Add a category</h3>
                                    <button onClick={() => setCategorySelection(null)} className="w-8 h-8 flex items-center justify-center bg-[#F4F4F5] hover:bg-[#E4E4E7] rounded-full transition-colors text-[#71717B]"><X size={16} strokeWidth={3}/></button>
                                </div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] mb-6">Pick a course to add to this menu.</p>
                                
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search any category of food" 
                                        value={categorySearchQuery}
                                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                        className="w-full pl-11 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-300 shadow-sm" 
                                    />
                                </div>
                                
                                <div className="flex-1 overflow-y-auto flex flex-col pb-32 scrollbar-none divide-y divide-[#E4E4E7]">
                                    {ALL_CATEGORIES.filter(c => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).map(category => {
                                        const isChecked = selectedCategoriesList.includes(category.name);
                                        return (
                                            <label 
                                                key={category.name} 
                                                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{category.name}</span>
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#A1A1AA] mt-1">{category.count} dishes</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                                                    isChecked ? 'bg-[#04222D] border-[#04222D]' : 'border-[#D4D4D8]'
                                                }`}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setSelectedCategoriesList(prev => 
                                                                prev.includes(category.name) 
                                                                    ? prev.filter(c => c !== category.name)
                                                                    : [...prev, category.name]
                                                            );
                                                        }}
                                                    />
                                                    {isChecked && (
                                                        <svg className="w-3.5 h-3.5 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                
                                {/* Sticky Add Button inside modal */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                                    <button
                                        type="button"
                                        disabled={selectedCategoriesList.length === 0}
                                        onClick={() => {
                                            if (categorySelection.isNewMenu) {
                                                handleAddMenu(selectedCategoriesList, selectedMealType);
                                            } else if (categorySelection.targetMenuId) {
                                                // Update existing menu's inventory keys
                                                setMenus(prev => prev.map(m => {
                                                    if (m.id !== categorySelection.targetMenuId) return m;
                                                    const newInventory = { ...m.inventory };
                                                    selectedCategoriesList.forEach(cat => {
                                                        if (!newInventory[cat]) newInventory[cat] = [];
                                                    });
                                                    const syncedInventory: Record<string, FoodItem[]> = {};
                                                    selectedCategoriesList.forEach(cat => {
                                                        syncedInventory[cat] = newInventory[cat] || [];
                                                    });
                                                    return { ...m, inventory: syncedInventory };
                                                }));
                                            }
                                            setCategorySelection(null);
                                        }}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full p-4 rounded-[16px] text-[16px] font-bold transition-all shadow-md bg-[#04222D] text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add {selectedCategoriesList.length} categories
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
