'use client';

import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { MenuData } from '../../shared/types';
import { Addon } from '../../components/AddonModal';

interface Props {
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
    setIsAddonModalOpen: (v: boolean) => void;
}

const CARD  = 'bg-white p-6 rounded-[20px] border border-[#E4E4E7] flex flex-col gap-6';

export default function CatererStep2ProductsAndPricing({
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
    setIsAddonModalOpen,
}: Props) {
    // Inventory sub-tabs & text input states mapped by menu.id
    const [activeTabs, setActiveTabs] = React.useState<Record<string, string>>({});
    const [typedInputs, setTypedInputs] = React.useState<Record<string, string>>({});

    // Dynamic Custom Crockery Builder States
    const [newCrockeryType, setNewCrockeryType] = React.useState('');
    const [customCrockery, setCustomCrockery] = React.useState<string[]>(() => {
        return crockeryType.split(',').map(s => s.trim()).filter(Boolean);
    });

    // Sync custom options from parent's loaded state
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
            if (currentList.includes(text.trim())) return m;
            return {
                ...m,
                inventory: {
                    ...m.inventory,
                    [tabName]: [...currentList, text.trim()]
                }
            };
        }));
        setTypedInputs(prev => ({ ...prev, [menuId]: '' }));
    };

    return (
        <div className="flex flex-col gap-6 mt-6 pb-32">

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
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. Silverware, Melamine"
                                    value={newCrockeryType}
                                    onChange={(e) => setNewCrockeryType(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomCrockery();
                                        }
                                    }}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="flex-1 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                />
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

            {/* ── Render Menus List ── */}
            {menus.map((menu) => {
                const currentTab = activeTabs[menu.id] || 'Starters';
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
                                    <div className="flex gap-2">
                                        {['Breakfast', 'Lunch', 'Dinner'].map((t) => {
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
                                                            ? 'bg-[#030303] text-white shadow-sm' 
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

                                {/* 3. Food Inventory with internal tabs */}
                                <div className="flex flex-col gap-3">
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Food Inventory</label>
                                    
                                    {/* Tabs */}
                                    <div className="flex border-b border-[#E4E4E7] gap-5 overflow-x-auto pb-0.5 scrollbar-none">
                                        {['Starters', 'Main Course', 'Dessert', 'Drinks'].map((tab) => {
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
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="text"
                                            placeholder="Type the food"
                                            value={currentInput}
                                            onChange={(e) => setTypedInputs(prev => ({ ...prev, [menu.id]: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddFoodItem(menu.id, currentTab, currentInput);
                                                }
                                            }}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="flex-1 p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[12px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddFoodItem(menu.id, currentTab, currentInput)}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="bg-[#E4E4E7] text-[#030303] font-bold px-6 py-4 rounded-[12px] text-[14px] hover:bg-gray-300 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Items List */}
                                    <div className="flex flex-col gap-2 mt-1">
                                        {((menu.inventory && menu.inventory[currentTab]) || []).map((item, idx) => (
                                            <div key={idx} className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex justify-between items-center shadow-xs">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">{item}</span>
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
                                                    className="p-1 hover:bg-red-50 rounded-full text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 4. Price Model */}
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Price Model</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] text-[16px] font-semibold">$</span>
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

                                {/* 5. Billing Unit */}
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Billing Unit</label>
                                    <div className="relative">
                                        <select
                                            value={menu.billingUnit || 'Per Plate'}
                                            onChange={(e) => {
                                                setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, billingUnit: e.target.value } : m));
                                            }}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-[16px] font-medium text-[#030303] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
                                        >
                                            <option value="Per Plate">Per Plate</option>
                                            <option value="Per Person">Per Person</option>
                                            <option value="Per Day">Per Day</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Save Menu Button */}
                                <button
                                    type="button"
                                    onClick={() => toggleMenuExpand(menu.id)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full bg-[#E4E4E7] hover:bg-gray-300 text-[#030303] font-bold py-4 rounded-full text-[15px] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center mt-2"
                                >
                                    Save Menu
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* ── Extra Add-ons ── */}
            <div className="flex flex-col gap-3 mt-6 border-t border-[#E4E4E7] pt-6">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#71717B] tracking-wider uppercase">Extra Add-ons</span>
                
                {/* Active Add-ons */}
                {addons.map((addon) => (
                    <div key={addon.id} className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-[#030303]">{addon.name}</span>
                            <span className="text-[12px] text-[#71717B] font-medium">{addon.category} • {addon.price} INR {addon.billingUnit}</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setAddons(prev => prev.filter(a => a.id !== addon.id))}
                            className="text-red-500 hover:text-red-700 font-bold text-[13px]"
                        >
                            Remove
                        </button>
                    </div>
                ))}

                {/* Dotted border trigger Addon button */}
                <div 
                    onClick={() => setIsAddonModalOpen(true)}
                    className="border-2 border-dashed border-[#D4D4D8] rounded-[20px] py-8 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all active:scale-[0.99] select-none"
                >
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[#71717B] text-[15px] font-bold">Entre Add-on +</span>
                </div>
            </div>
        </div>
    );
}
