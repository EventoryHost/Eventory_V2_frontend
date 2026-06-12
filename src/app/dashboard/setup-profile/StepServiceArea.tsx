'use client';
import { motion } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { FormData, CITY_LOCALITIES } from './types';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };
const cities = Object.keys(CITY_LOCALITIES);

interface Props {
    formData: FormData;
    activeCity: string | null;
    setActiveCity: (c: string | null) => void;
    locationSearch: string;
    setLocationSearch: (v: string) => void;
    showLocationDropdown: boolean;
    setShowLocationDropdown: (v: boolean) => void;
    toggleServiceArea: (area: string, isCity?: boolean) => void;
}

export function StepServiceArea({
    formData, activeCity, setActiveCity,
    locationSearch, setLocationSearch,
    showLocationDropdown, setShowLocationDropdown,
    toggleServiceArea,
}: Props) {
    return (
        <motion.div key="step8" {...sv} className="space-y-8">
            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">
                What is your Service area?
            </h1>

            <div className="space-y-6">
                {/* City chips */}
                <div className="flex flex-wrap gap-3">
                    {cities.map((city) => (
                        <button key={city}
                            onClick={() => { setActiveCity(city); if (!formData.serviceAreas.includes(city)) toggleServiceArea(city, true); }}
                            className={`px-5 py-2.5 rounded-full border transition-all text-[14px] font-medium font-figtree ${activeCity === city ? 'bg-[#04222D] border-[#04222D] text-white'
                                : formData.serviceAreas.includes(city) ? 'bg-gray-100 border-[#04222D] text-[#04222D]'
                                : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-50'}`}>
                            {city}
                        </button>
                    ))}
                </div>

                {/* Locality chips */}
                {activeCity && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[#3F3F47] text-[14px] font-figtree">Enter the localities where your business operates.</p>
                        <div className="flex flex-wrap gap-3">
                            {CITY_LOCALITIES[activeCity].map((locality: string) => (
                                <button key={locality} onClick={() => toggleServiceArea(locality)}
                                    className={`px-5 py-2.5 rounded-full border transition-all text-[14px] font-medium font-figtree ${formData.serviceAreas.includes(locality)
                                        ? 'bg-[#04222D] border-[#04222D] text-white'
                                        : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-50'}`}>
                                    {locality}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-400 text-[14px] font-figtree">Couldn't find your location</p>
                    <div className="relative w-full max-w-[361px]">
                        <div className="relative">
                            <input type="text" placeholder="Search Locations" value={locationSearch}
                                onFocus={() => setShowLocationDropdown(true)}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="w-full pl-4 pr-10 py-3.5 border border-[#D4D4D8] rounded-xl outline-none focus:border-[#030303] font-figtree text-[15px]"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        {showLocationDropdown && locationSearch && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[200px] overflow-y-auto py-2">
                                {Object.values(CITY_LOCALITIES).flat()
                                    .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                                    .map((loc: string) => (
                                        <button key={loc} onClick={() => { toggleServiceArea(loc); setLocationSearch(''); setShowLocationDropdown(false); }}
                                            className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center justify-between">
                                            <span className={`text-[15px] ${formData.serviceAreas.includes(loc) ? 'font-semibold text-[#030303]' : 'text-[#3F3F47]'}`}>{loc}</span>
                                            {formData.serviceAreas.includes(loc) && <Check size={18} className="text-[#030303]" />}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected tags */}
                {formData.serviceAreas.length > 0 && (
                    <div className="pt-6 border-t border-gray-100">
                        <div className="text-[12px] font-semibold text-[#030303] mb-3 uppercase tracking-wider font-figtree">Selected Areas</div>
                        <div className="flex flex-wrap gap-2">
                            {formData.serviceAreas.map((area: string) => (
                                <button key={area} onClick={() => toggleServiceArea(area, cities.includes(area))}
                                    className="bg-[#04222D] text-white px-4 py-2 rounded-full text-[13px] flex items-center gap-2 font-medium font-figtree shadow-sm active:scale-95 transition-all">
                                    {area}<X size={14} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
