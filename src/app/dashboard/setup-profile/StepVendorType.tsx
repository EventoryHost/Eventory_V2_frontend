'use client';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { FormData, VENDOR_TYPES, EVENT_CATEGORIES } from './types';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

interface Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function StepVendorType({ formData, setFormData }: Props) {
    const toggleVendorType = (type: string) => {
        setFormData((prev: FormData) => ({
            ...prev,
            vendorType: prev.vendorType.includes(type)
                ? prev.vendorType.filter((item) => item !== type)
                : [...prev.vendorType, type],
        }));
    };

    return (
        <motion.div key="step7" {...sv} className="pb-10">
            <h1 className="max-w-[320px] text-[#030303] text-[24px] font-semibold leading-[32px] tracking-[0] font-figtree">
                What vendor type and services you provide?
            </h1>

            <div className="mt-8 flex flex-wrap gap-x-[10px] gap-y-4">
                {VENDOR_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => toggleVendorType(type)}
                        className={`inline-flex w-fit whitespace-nowrap rounded-[9999px] px-4 py-2 text-[14px] leading-[20px] font-medium font-figtree transition-all ${
                            formData.vendorType.includes(type)
                                ? 'bg-[#04222D] border border-[#04222D] text-white'
                                : 'bg-[#ECEFF0] border border-[#ECEFF0] text-[#17313B]'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <p className="mt-6 max-w-[306px] text-[#3F3F47] text-[14px] leading-[20px] tracking-[0] font-figtree">
                Specify the type of vendor you are.
            </p>
        </motion.div>
    );
}

interface StepVendorCategoriesProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    eventSearch: string;
    setEventSearch: (value: string) => void;
    toggleCategory: (category: string) => void;
}

export function StepVendorCategories({
    formData,
    setFormData,
    eventSearch,
    setEventSearch,
    toggleCategory,
}: StepVendorCategoriesProps) {
    const filteredCategories = EVENT_CATEGORIES.filter((category) =>
        category.toLowerCase().includes(eventSearch.toLowerCase())
    );

    const removeVendorType = (type: string) => {
        setFormData((prev: FormData) => ({
            ...prev,
            vendorType: prev.vendorType.filter((item) => item !== type),
        }));
    };

    return (
        <motion.div key="step8" {...sv} className="pb-10">
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-[#5F6670] text-[12px] leading-[16px] tracking-[0] uppercase font-medium font-figtree">
                        Your vendor type
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {formData.vendorType.map((type) => (
                            <button
                                key={type}
                                onClick={() => removeVendorType(type)}
                                className="inline-flex items-center gap-2 rounded-[9999px] border border-[#04222D] bg-[#04222D] px-4 py-2 text-[14px] leading-[20px] font-medium text-white font-figtree"
                            >
                                <span>{type}</span>
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/70">
                                    <X size={10} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="max-w-[320px] text-[#030303] text-[24px] font-semibold leading-[32px] tracking-[0] font-figtree">
                        Which events do you cover?
                    </h1>
                    <p className="max-w-[320px] text-[#3F3F47] text-[14px] leading-[20px] tracking-[0] font-figtree">
                        Select all the event types you can work - you can choose more than one
                    </p>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                <p className="text-[#5F6670] text-[12px] leading-[16px] tracking-[0] uppercase font-medium font-figtree">
                    All Categories
                </p>

                <div className="rounded-[8px] border border-[#D4D4D8] bg-white px-[14px] py-3">
                    {formData.categories.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {formData.categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className="inline-flex items-center gap-2 rounded-[9999px] border border-[#04222D] bg-[#04222D] px-3 py-1.5 text-[13px] leading-[18px] font-medium text-white font-figtree"
                                >
                                    <span>{category}</span>
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/70">
                                        <X size={10} />
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            value={eventSearch}
                            onChange={(e) => setEventSearch(e.target.value)}
                            placeholder="Search Events"
                            className="w-full border-0 bg-transparent pr-8 py-1 text-[14px] leading-[20px] text-[#030303] placeholder:text-[#9F9FA9] outline-none font-figtree"
                        />
                        <Search size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                    {filteredCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className="flex w-full items-center justify-between px-4 py-4 text-left text-[16px] leading-[24px] font-normal text-[#030303] font-figtree"
                        >
                            <span>{category}</span>
                            {formData.categories.includes(category) && <Check size={18} className="text-[#030303]" />}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
