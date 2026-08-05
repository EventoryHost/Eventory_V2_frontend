'use client';

import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { MenuData } from '../../shared/types';
import { AddonModal, Addon } from '../../components/AddonModal';
import { VariantManager } from '../../components/VariantManager';

interface Props {
    packageId?: string | null;
    packageGroupId?: string | null;
    menus: MenuData[];
    setMenus: React.Dispatch<React.SetStateAction<MenuData[]>>;
    toggleMenuExpand: (id: string) => void;
    deleteMenu: (id: string) => void;
    handleAddMenu: () => void;
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

const FOOD_SUGGESTIONS: Record<string, string[]> = {
    'Salads': ['Green Salad', 'Russian Salad', 'Caesar Salad', 'Corn Salad', 'Greek Salad', 'Kachumber Salad', 'Sprout Salad'],
    'Breads': ['Butter Naan', 'Garlic Naan', 'Plain Naan', 'Tandoori Roti', 'Missi Roti', 'Lachha Paratha', 'Kulcha', 'Roomali Roti', 'Poori'],
    'Rice': ['Veg Biryani', 'Hyderabadi Biryani', 'Jeera Rice', 'Steamed Rice', 'Peas Pulao', 'Kashmiri Pulao', 'Curd Rice', 'Saffron Rice'],
    'Starters': ['Paneer Tikka', 'Hara Bhara Kebab', 'Spring Rolls', 'Crispy Baby Corn', 'Chicken Tikka', 'Tandoori Chicken', 'Fish Fingers', 'Chilli Paneer', 'Veg Manchurian', 'Dahi Kebab', 'Corn Kebab', 'Aloo Tikki'],
    'Main Course': ['Dal Makhani', 'Paneer Butter Masala', 'Shahi Paneer', 'Kadhai Paneer', 'Chana Masala', 'Malai Kofta', 'Dal Tadka', 'Dum Aloo', 'Mix Veg Curry', 'Butter Chicken', 'Chicken Curry', 'Mutton Rogan Josh'],
    'Dessert': ['Gulab Jamun', 'Rasgulla', 'Rasmalai', 'Jalebi with Rabri', 'Moong Dal Halwa', 'Gajar Ka Halwa', 'Ice Cream with Hot Chocolate', 'Kulfi Falooda', 'Fruit Custard', 'Brownie with Ice Cream'],
    'Desserts': ['Gulab Jamun', 'Rasgulla', 'Rasmalai', 'Jalebi with Rabri', 'Moong Dal Halwa', 'Gajar Ka Halwa', 'Ice Cream with Hot Chocolate', 'Kulfi Falooda', 'Fruit Custard', 'Brownie with Ice Cream'],
    'Beverages': ['Virgin Mojito', 'Masala Cold Drink', 'Blue Lagoon', 'Fresh Fruit Juice', 'Masala Chai', 'Filter Coffee', 'Hot Espresso', 'Iced Tea', 'Pina Colada'],
    'Chats': ['Pani Puri / Golgappa', 'Papdi Chat', 'Bhel Puri', 'Dahi Puri', 'Raj Kachori', 'Aloo Tikki Chat', 'Dahi Bhalla', 'Samosa Chat', 'Sev Puri'],
    'Miscellaneous': ['Roasted Papad', 'Masala Papad', 'Mixed Pickle', 'Green Chutney', 'Tamarind Chutney', 'Raita', 'Pineapple Raita', 'Boondi Raita']
};

export default function CatererStep2ProductsAndPricing({
    packageId,
    packageGroupId,
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
    const [typedInputs, setTypedInputs] = React.useState<Record<string, string>>({});
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

    const handleAddFoodItem = (menuId: string, tabName: string, text: string) => {
        if (!text.trim()) return;
        setMenus(prev => prev.map(m => {
            if (m.id !== menuId) return m;
            const currentList = m.inventory[tabName] || [];
            if (currentList.some(item => item.name.toLowerCase() === text.trim().toLowerCase())) return m;
            return {
                ...m,
                inventory: {
                    ...m.inventory,
                    [tabName]: [...currentList, { name: text.trim(), foodType: 'Veg' }]
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
                <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="4" stroke="#10B981" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r="5" fill="#10B981" />
                </svg>
            );
        } else if (type === 'Non-veg') {
            return (
                <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="4" stroke="#92400E" strokeWidth="2.5" />
                    <polygon points="12,6 6,17 18,17" fill="#92400E" />
                </svg>
            );
        } else {
            return (
                <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="4" stroke="#F59E0B" strokeWidth="2.5" />
                    <ellipse cx="12" cy="12" rx="4" ry="5.5" fill="#F59E0B" />
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

                    {/* Premium capsular toggle selector */}
                    <div 
                        onClick={() => setCrockeryIncluded(!crockeryIncluded)}
                        className="w-[120px] h-[40px] bg-[#E4E4E7] rounded-full p-1 flex items-center cursor-pointer relative select-none"
                    >
                        <div 
                            className={`absolute w-[56px] h-[32px] bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-[14px] text-[#030303] transition-all duration-300 ${
                                crockeryIncluded ? 'left-[60px]' : 'left-[4px]'
                            }`}
                        >
                            {crockeryIncluded ? 'Yes' : 'No'}
                        </div>
                        <span className={`w-1/2 text-center text-[14px] font-semibold z-10 transition-colors ${!crockeryIncluded ? 'text-[#030303]' : 'text-[#71717B]'}`}>No</span>
                        <span className={`w-1/2 text-center text-[14px] font-semibold z-10 transition-colors ${crockeryIncluded ? 'text-[#030303]' : 'text-[#71717B]'}`}>Yes</span>
                    </div>
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
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717B] tracking-wider uppercase">Menu Options</span>
                <button 
                    type="button" 
                    onClick={handleAddMenu}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="text-[15px] font-bold text-[#030303] flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-transform"
                >
                    Add Menu <span className="text-[20px] font-semibold leading-none">+</span>
                </button>
            </div>

            {/* ── Render Menus List / Empty State ── */}
            {menus.length === 0 ? (
                <div 
                    onClick={handleAddMenu}
                    className="border-2 border-dashed border-[#D4D4D8] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-all select-none"
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
                menus.map((menu) => {
                    const currentTab = activeTabs[menu.id] || 'Salads';
                    const currentInput = typedInputs[menu.id] || '';

                    return (
                        <div key={menu.id} className="bg-white rounded-[24px] border border-[#E4E4E7] overflow-hidden shadow-sm">
                            
                            {/* ── Card Header ── */}
                            <div className="p-6 flex items-center justify-between bg-[#FAFAFA] border-b border-[#E4E4E7]">
                                <div className="flex items-center gap-3">
                                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">{menu.name}</h3>
                                    <span className="px-3 py-1 bg-white border border-[#E4E4E7] rounded-full text-[12px] font-semibold text-[#3F3F47]">{menu.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => toggleMenuExpand(menu.id)} className="p-2 text-[#71717A] hover:bg-gray-100 rounded-full transition-colors">
                                        {menu.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    <div className="relative">
                                        <button type="button" onClick={() => setActiveMenuDropdown(activeMenuDropdown === menu.id ? null : menu.id)} className="p-2 text-[#71717A] hover:bg-gray-100 rounded-full transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {activeMenuDropdown === menu.id && (
                                            <div className="absolute right-0 top-full mt-2 w-42 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => deleteMenu(menu.id)} 
                                                    className="w-full text-left px-4 py-2.5 text-[14px] text-red-600 font-bold hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Delete Menu
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Card Body (Active Expanded Form) ── */}
                            {menu.isExpanded && (
                                <div className="p-6 flex flex-col gap-6">

                                    {/* 1. Menu Type */}
                                    <div className="flex flex-col gap-2">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Menu Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((t) => {
                                                const isActive = menu.type === t;
                                                return (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => {
                                                            setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, type: t } : m));
                                                        }}
                                                        className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                                                            isActive 
                                                                ? 'bg-[#04222D] text-white shadow-sm' 
                                                                : 'bg-[#F4F4F5] text-[#71717A] hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Service Style */}
                                    <div className="flex flex-col gap-2">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Service Style</label>
                                        <div className="flex flex-col gap-2.5">
                                            {['Buffet', 'Table', 'Live Counter', 'Family'].map((style) => {
                                                const isChecked = menu.serviceStyles.includes(style);
                                                return (
                                                    <div
                                                        key={style}
                                                        onClick={() => {
                                                            setMenus(prev => prev.map(m => {
                                                                if (m.id !== menu.id) return m;
                                                                const newStyles = m.serviceStyles.includes(style)
                                                                    ? m.serviceStyles.filter(s => s !== style)
                                                                    : [...m.serviceStyles, style];
                                                                return { ...m, serviceStyles: newStyles };
                                                            }));
                                                        }}
                                                        className="flex items-center gap-3 p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[12px] cursor-pointer hover:bg-gray-50 transition-all select-none"
                                                    >
                                                        <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                                                            isChecked ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8]'
                                                        }`}>
                                                            {isChecked && (
                                                                <svg className="w-3 h-3 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">{style}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 3. Per Plate Price */}
                                    <div className="flex flex-col gap-2">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Per Plate Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] text-[16px] font-normal">₹</span>
                                            <input
                                                type="text"
                                                placeholder="0.0"
                                                value={menu.priceModel || ''}
                                                onChange={(e) => {
                                                    setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, priceModel: e.target.value } : m));
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="w-full p-4 pl-8 bg-white border border-[#E4E4E7] rounded-[12px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Food Inventory with internal tabs */}
                                    <div className="flex flex-col gap-3">
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Food Inventory</label>
                                        
                                        {/* Scrollable Tabs */}
                                        <div className="flex border-b border-[#E4E4E7] gap-5 overflow-x-auto pb-0.5 scrollbar-thin">
                                            {foodInventoryTabs.map((tab) => {
                                                const isActive = currentTab === tab;
                                                return (
                                                    <button
                                                        key={tab}
                                                        type="button"
                                                        onClick={() => setActiveTabs(prev => ({ ...prev, [menu.id]: tab }))}
                                                        className={`pb-2.5 text-[14px] font-bold transition-all relative whitespace-nowrap ${
                                                            isActive ? 'text-[#030303]' : 'text-[#71717A] hover:text-black'
                                                        }`}
                                                    >
                                                        {tab}
                                                        {isActive && (
                                                            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#030303] rounded-full" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Input & add block */}
                                        <div className="flex gap-2 mt-1 relative">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Type the food"
                                                    value={currentInput}
                                                    onChange={(e) => { setTypedInputs(prev => ({ ...prev, [menu.id]: e.target.value })); setActiveMenuSuggestionId(menu.id); }}
                                                    onFocus={() => setActiveMenuSuggestionId(menu.id)}
                                                    onBlur={() => setTimeout(() => setActiveMenuSuggestionId(null), 200)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddFoodItem(menu.id, currentTab, currentInput);
                                                            setActiveMenuSuggestionId(null);
                                                        }
                                                    }}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                                />
                                                {activeMenuSuggestionId === menu.id && (
                                                    (() => {
                                                        const existingNames = ((menu.inventory && menu.inventory[currentTab]) || []).map(it => it.name.toLowerCase());
                                                        const suggestions = (FOOD_SUGGESTIONS[currentTab] || FOOD_SUGGESTIONS['Starters']).filter(s => 
                                                            !existingNames.includes(s.toLowerCase()) && s.toLowerCase().includes(currentInput.toLowerCase())
                                                        );
                                                        if (suggestions.length === 0) return null;
                                                        return (
                                                            <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-[#E4E4E7] rounded-[16px] shadow-lg max-h-56 overflow-y-auto z-50 py-1 text-left">
                                                                {suggestions.map(suggestion => (
                                                                    <div
                                                                        key={suggestion}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            handleAddFoodItem(menu.id, currentTab, suggestion);
                                                                            setActiveMenuSuggestionId(null);
                                                                        }}
                                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                        className="px-4 py-3 cursor-pointer text-[15px] font-medium text-[#3F3F47] hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        {suggestion}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                disabled={!currentInput.trim()}
                                                onClick={() => handleAddFoodItem(menu.id, currentTab, currentInput)}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`text-white font-bold px-6 py-4 rounded-[16px] text-[14px] transition-colors ${
                                                    currentInput.trim() 
                                                        ? 'bg-[#030303] hover:opacity-90 active:scale-[0.98] cursor-pointer' 
                                                        : 'bg-[#8A9A9F] cursor-not-allowed'
                                                }`}
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {/* Items List */}
                                        <div className="flex flex-col gap-2 mt-2">
                                            {((menu.inventory && menu.inventory[currentTab]) || []).map((item, idx) => (
                                                <div key={idx} className="p-4 bg-white border border-[#E4E4E7] rounded-[16px] flex justify-between items-center shadow-xs">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {renderFoodTypeIcon(item.foodType || 'Veg')}
                                                            <button 
                                                                type="button"
                                                                onClick={() => setActiveFoodItemChoice({
                                                                    menuId: menu.id,
                                                                    tabName: currentTab,
                                                                    itemIndex: idx,
                                                                    name: item.name,
                                                                    currentType: item.foodType || 'Veg'
                                                                })}
                                                                className="text-[12px] text-blue-600 hover:text-blue-800 font-semibold"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{item.name}</span>
                                                    </div>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setMenus(prev => prev.map(m => {
                                                                if (m.id !== menu.id) return m;
                                                                const list = m.inventory[currentTab] || [];
                                                                const filtered = list.filter((_, i) => i !== idx);
                                                                return { ...m, inventory: { ...m.inventory, [currentTab]: filtered } };
                                                            }));
                                                        }}
                                                        className="text-[#71717A] hover:text-[#030303] transition-colors"
                                                    >
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                                            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 5. Save Menu Button */}
                                    <button
                                        type="button"
                                        onClick={() => toggleMenuExpand(menu.id)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full bg-[#04222D] hover:bg-opacity-95 text-white font-bold py-4 rounded-full text-[15px] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center mt-2"
                                    >
                                        Save Menu
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* ── Extra Add-ons ── */}
            <div className="flex flex-col gap-3 mt-6 border-t border-[#E4E4E7] pt-6">
                <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717B] tracking-wider uppercase">Extra Add-ons</span>
                    <button 
                        type="button" 
                        onClick={handleOpenAddonForm}
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
                        onClick={handleOpenAddonForm}
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

            {/* ── Included & Not Included Textareas ── */}
            <div className="flex flex-col gap-6 mt-6 border-t border-[#E4E4E7] pt-6">
                
                {/* Included */}
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] uppercase tracking-wider">Whats Included</label>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium -mt-1">List everything a customer gets when they book this package</p>
                    <textarea
                        rows={4}
                        placeholder="Enter details"
                        value={includedText}
                        onChange={(e) => setIncludedText(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none"
                    />
                </div>

                {/* Not Included */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] uppercase tracking-wider">Whats Not Included</label>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="#C21A1A"/>
                            <path d="M12 7v6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="12" cy="16.5" r="1.25" fill="white"/>
                        </svg>
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium -mt-1">Help customers know what they'll need to arrange separately</p>
                    <textarea
                        rows={4}
                        placeholder="Enter Details.."
                        value={notIncludedText}
                        onChange={(e) => setNotIncludedText(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none"
                    />
                </div>
            </div>

            {/* ── Choose Food Item Type Modal Overlay ── */}
            {activeFoodItemChoice && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="flex justify-between items-center">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-black">Choose food item type</span>
                            <button 
                                type="button" 
                                onClick={() => setActiveFoodItemChoice(null)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Options */}
                        <div className="flex flex-col gap-3">
                            {(['Veg', 'Non-veg', 'Egg'] as const).map((type) => {
                                const isSelected = activeFoodItemChoice.currentType === type;
                                let themeBorder = 'border-[#E4E4E7]';
                                if (isSelected) {
                                    if (type === 'Veg') themeBorder = 'border-[#10B981] bg-[#10B981]/5';
                                    else if (type === 'Non-veg') themeBorder = 'border-[#92400E] bg-[#92400E]/5';
                                    else themeBorder = 'border-[#F59E0B] bg-[#F59E0B]/5';
                                }

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setActiveFoodItemChoice(prev => prev ? { ...prev, currentType: type } : null)}
                                        className={`flex items-center gap-3 p-4 rounded-[16px] border-[1.5px] transition-all hover:bg-gray-50 text-left font-bold text-[15px] text-gray-900 ${themeBorder}`}
                                    >
                                        {renderFoodTypeIcon(type, 'w-5 h-5')}
                                        {type}
                                    </button>
                                );
                            })}
                            
                            {/* Dummy Add Tag capsule button */}
                            <button 
                                type="button"
                                className="flex items-center justify-center gap-1.5 p-3 rounded-[16px] border border-dashed border-[#D4D4D8] text-[13px] font-bold text-[#71717B] hover:bg-gray-50 transition-colors"
                            >
                                <span>+ Add tag</span>
                            </button>
                        </div>

                        {/* Save Button */}
                        <button
                            type="button"
                            onClick={handleSaveFoodType}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="w-full bg-[#092230] text-white font-bold py-4 rounded-[16px] text-[15px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shadow-md"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
