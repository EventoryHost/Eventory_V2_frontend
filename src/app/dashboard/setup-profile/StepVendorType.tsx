'use client';
import { motion } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { FormData, VENDOR_TYPES, EVENT_CATEGORIES } from './types';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

interface Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    eventSearch: string;
    setEventSearch: (v: string) => void;
    showEventDropdown: boolean;
    setShowEventDropdown: (v: boolean) => void;
    toggleCategory: (cat: string) => void;
    isButtonDisabled: () => boolean;
    handleContinue: () => void;
}

export function StepVendorType({
    formData, setFormData, eventSearch, setEventSearch,
    showEventDropdown, setShowEventDropdown, toggleCategory,
}: Props) {
    return (
        <motion.div key="step7" {...sv} className="space-y-6">
            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">
                What vendor type and services you provide?
            </h1>

            <div className="flex flex-wrap gap-3">
                {VENDOR_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setFormData((prev: FormData) => ({ ...prev, vendorType: type }))}
                        className={`px-4 py-2 rounded-full border transition-all font-medium text-[14px] font-figtree flex items-center gap-2 ${formData.vendorType === type
                            ? 'bg-[#04222D] border-[#04222D] text-white'
                            : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-50'}`}
                    >
                        {type}
                        {formData.vendorType === type && (
                            <div className="bg-white rounded-full p-0.5"
                                onClick={(e) => { e.stopPropagation(); setFormData((prev: FormData) => ({ ...prev, vendorType: '' })); }}>
                                <X size={12} className="text-[#04222D]" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <p className="text-[#3F3F47] text-[14px] font-figtree">Specify the type of vendor you are.</p>

            {formData.vendorType && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-[#3F3F47] text-[14px] font-figtree italic">
                        Events which you provide with a wide category Ex. Tent, Catering, Decorations etc.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.categories.map(cat => (
                            <button key={cat} onClick={() => toggleCategory(cat)}
                                className="bg-[#04222D] text-white px-3 py-1.5 rounded-full text-[13px] flex items-center gap-2 font-medium">
                                {cat}<X size={14} />
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full max-w-[361px]">
                        <div className="text-[12px] font-semibold text-[#030303] mb-2 uppercase tracking-wider">All Categories</div>
                        <div className="relative">
                            <input type="text" placeholder="Search Events" value={eventSearch}
                                onFocus={() => setShowEventDropdown(true)}
                                onChange={(e) => setEventSearch(e.target.value)}
                                className="w-full pl-4 pr-10 py-3.5 border border-[#D4D4D8] rounded-xl outline-none focus:border-[#030303] font-figtree text-[15px]"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        {showEventDropdown && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[250px] overflow-y-auto py-2">
                                {EVENT_CATEGORIES.filter(cat => cat.toLowerCase().includes(eventSearch.toLowerCase())).map(cat => (
                                    <button key={cat} onClick={() => { toggleCategory(cat); setEventSearch(''); }}
                                        className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center justify-between">
                                        <span className={`text-[15px] ${formData.categories.includes(cat) ? 'font-semibold text-[#030303]' : 'text-[#3F3F47]'}`}>{cat}</span>
                                        {formData.categories.includes(cat) && <Check size={18} className="text-[#030303]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
