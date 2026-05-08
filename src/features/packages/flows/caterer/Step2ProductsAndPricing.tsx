'use client';

import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { MenuData } from '../../shared/types';

interface Props {
    menus: MenuData[];
    toggleMenuExpand: (id: string) => void;
    deleteMenu: (id: string) => void;
    handleAddMenu: () => void;
    activeMenuDropdown: string | null;
    setActiveMenuDropdown: (v: string | null) => void;
}

export default function CatererStep2ProductsAndPricing({ menus, toggleMenuExpand, deleteMenu, handleAddMenu, activeMenuDropdown, setActiveMenuDropdown }: Props) {
    return (
        <div className="flex flex-col gap-6 mt-6 pb-32">
            {menus.map((menu) => (
                <div key={menu.id} className="bg-white rounded-[24px] border border-[#E4E4E7] overflow-hidden">
                    <div className="p-6 flex items-center justify-between bg-[#FAFAFA] border-b border-[#E4E4E7]">
                        <div className="flex items-center gap-3">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">{menu.name}</h3>
                            <span className="px-3 py-1 bg-white border border-[#E4E4E7] rounded-full text-[12px] font-semibold text-[#3F3F47]">{menu.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggleMenuExpand(menu.id)} className="p-2 text-[#71717A] hover:bg-gray-100 rounded-full">
                                {menu.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <div className="relative">
                                <button onClick={() => setActiveMenuDropdown(activeMenuDropdown === menu.id ? null : menu.id)} className="p-2 text-[#71717A] hover:bg-gray-100 rounded-full">
                                    <MoreHorizontal size={20} />
                                </button>
                                {activeMenuDropdown === menu.id && (
                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                        <button onClick={() => deleteMenu(menu.id)} className="w-full text-left px-4 py-2 text-[14px] text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2">
                                            <Trash2 size={16} /> Delete Menu
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {menu.isExpanded && (
                        <div className="p-6"><p className="text-[14px] text-gray-500">Menu content</p></div>
                    )}
                </div>
            ))}
            <button onClick={handleAddMenu} className="w-full py-6 rounded-[24px] border-2 border-dashed border-[#D4D4D8] text-[#9F9FA9] text-[15px] font-bold bg-white hover:bg-gray-50 transition-colors">
                Add Menu +
            </button>
        </div>
    );
}
