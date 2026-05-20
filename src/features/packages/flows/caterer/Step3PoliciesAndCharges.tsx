'use client';
import React from 'react';
import { ChevronDown, Check, PlusCircle, Upload, FileText, X } from 'lucide-react';
import { GuestTier, PolicyFile, formatFileSize, formatPricePlaceholder, formatPriceValue } from '../../shared/types';

interface Props {
    teamEquipmentPrice: string; setTeamEquipmentPrice: (v: string) => void;
    teamEquipmentUnit: string; setTeamEquipmentUnit: (v: string) => void;
    lastMinuteInputRef: React.RefObject<HTMLInputElement | null>;
    guestTiers: GuestTier[]; addGuestTierOption: () => void; updateGuestTier: (i: number, f: 'range' | 'price', v: string) => void;
    isDynamicPricingEnabled: boolean; setIsDynamicPricingEnabled: (v: boolean) => void;
    weekendPricing: boolean; setWeekendPricing: (v: boolean) => void;
    weekendIncreaseType: string; setWeekendIncreaseType: (v: string) => void;
    weekendValue: string; setWeekendValue: (v: string) => void;
    weekendDays: string[]; setWeekendDays: (fn: (p: string[]) => string[]) => void;
    weekendSeason: boolean; setWeekendSeason: (v: boolean) => void;
    seasonIncreaseType: string; setSeasonIncreaseType: (v: string) => void;
    seasonValue: string; setSeasonValue: (v: string) => void;
    festivalPricing: boolean; setFestivalPricing: (v: boolean) => void;
    festivalIncreaseType: string; setFestivalIncreaseType: (v: string) => void;
    festivalValue: string; setFestivalValue: (v: string) => void;
    selectedFestivals: string[]; setSelectedFestivals: (fn: (p: string[]) => string[]) => void;
    availableFestivals: string[];
    isAddingFestival: boolean; setIsAddingFestival: (v: boolean) => void;
    newFestivalName: string; setNewFestivalName: (v: string) => void;
    handleAddFestival: () => void;
    lastMinuteBooking: boolean; setLastMinuteBooking: (v: boolean) => void;
    lastMinuteDays: string; setLastMinuteDays: (v: string) => void;
    lastMinuteIncreaseType: string; setLastMinuteIncreaseType: (v: string) => void;
    lastMinuteValue: string; setLastMinuteValue: (v: string) => void;
    policyFiles: PolicyFile[]; policyInputRef: React.RefObject<HTMLInputElement | null>;
    onPolicyUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePolicyFile: (i: number) => void;

    lastMinuteFiles: PolicyFile[];
    onLastMinuteUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeLastMinuteFile: (i: number) => void;
    customDatesPricing: boolean;
    setCustomDatesPricing: (v: boolean) => void;
    customDatesIncreaseType: string;
    setCustomDatesIncreaseType: (v: string) => void;
    customDatesValue: string;
    setCustomDatesValue: (v: string) => void;
    customDatesStartDate: string;
    setCustomDatesStartDate: (v: string) => void;
    customDatesEndDate: string;
    setCustomDatesEndDate: (v: string) => void;
    festivalPrices: Record<string, { increaseType: string; value: string }>;
    setFestivalPrices: React.Dispatch<React.SetStateAction<Record<string, { increaseType: string; value: string }>>>;
}

export default function CatererStep3PoliciesAndCharges(p: Props) {
    React.useEffect(() => {
        console.log("Step3 - lastMinuteFiles:", p.lastMinuteFiles);
        console.log("Step3 - policyFiles:", p.policyFiles);
    }, [p.lastMinuteFiles, p.policyFiles]);

    return (
        <div className="flex flex-col gap-8 w-full mt-6 pb-32">
            {/* Team + Equipment */}
            <div className="p-4 bg-white border border-[#E4E4E7] rounded-[12px] flex flex-col gap-4">
                <div>
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Team + Equipment</label>
                    <input type="text" placeholder="₹ 0.0" value={p.teamEquipmentPrice} onChange={(e) => p.setTeamEquipmentPrice(e.target.value.replace(/[^0-9]/g, ''))} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none placeholder:text-[#9F9FA9]" />
                </div>
                <div>
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Billing Unit</label>
                    <div className="relative">
                        <select value={p.teamEquipmentUnit} onChange={(e) => p.setTeamEquipmentUnit(e.target.value)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none">
                            <option>Per hour</option><option>Per day</option><option>Per package</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Last Minute Charges Upload */}
            <div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Last Minute Charges</p>
                <button 
                    type="button" 
                    onClick={() => p.lastMinuteInputRef.current?.click()} 
                    className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4"
                >
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4"><Upload size={24} className="text-[#3F3F47]" /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Last Minute charges documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                </button>
                <input
                    type="file"
                    ref={p.lastMinuteInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={p.onLastMinuteUpload}
                />
                
                {p.lastMinuteFiles && p.lastMinuteFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {p.lastMinuteFiles.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white"><FileText size={16} className="text-[#3F3F47]" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} · Uploaded</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => p.removeLastMinuteFile(idx)} className="text-[#3F3F47] hover:text-[#030303]"><X size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Guest Range Tiers */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-6">
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Guest Range Tiers</h3>
                <div className="flex flex-col gap-4">
                    {p.guestTiers.map((tier, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <select value={tier.range} onChange={(e) => p.updateGuestTier(i, 'range', e.target.value)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-bold text-[#3F3F47] appearance-none focus:outline-none">
                                    {['Upto 50','Upto 100','Upto 200','Upto 500','Upto 1000','Upto X'].map(o => <option key={o}>{o}</option>)}
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" />
                            </div>
                            <div className="h-[2px] w-4 bg-[#E4E4E7]" />
                            <div className="flex-1">
                                <input type="text" placeholder="₹ 0" value={tier.price ? `₹ ${tier.price}` : ''} onChange={(e) => p.updateGuestTier(i, 'price', e.target.value.replace(/[^0-9]/g, ''))} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-bold text-[#3F3F47] focus:outline-none" />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={p.addGuestTierOption} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-4 bg-white border border-[#030303] text-[#030303] font-bold text-[16px] rounded-[12px] hover:bg-gray-50">Add Option</button>
            </div>

            {/* Dynamic Pricing */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9]">Adjust Pricing for Busy Dates.</p>
                    </div>
                    <button onClick={() => p.setIsDynamicPricingEnabled(!p.isDynamicPricingEnabled)} className={`w-12 h-6 flex items-center rounded-full transition-colors px-1 ${p.isDynamicPricingEnabled ? 'bg-[#030303]' : 'bg-[#E4E4E7]'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${p.isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {p.isDynamicPricingEnabled && (() => {
                    // Extract base price from Team + Equipment Price, defaulting to 20000 if empty/zero
                    const weekdayPrice = parseFloat(p.teamEquipmentPrice) || 20000;

                    // Weekend Calculation
                    let weekendIncreaseAmount = 0;
                    if (p.weekendIncreaseType === 'Percentage') {
                        const pct = parseFloat(p.weekendValue) || 0;
                        weekendIncreaseAmount = weekdayPrice * (pct / 100);
                    } else {
                        weekendIncreaseAmount = parseFloat(p.weekendValue) || 0;
                    }
                    const weekendPrice = weekdayPrice + weekendIncreaseAmount;
                    const weekendPercent = p.weekendIncreaseType === 'Percentage' 
                        ? (parseFloat(p.weekendValue) || 0) 
                        : Math.round((weekendIncreaseAmount / weekdayPrice) * 100);
                    const weekendInputVal = p.weekendIncreaseType === 'Percentage'
                        ? String(Math.round(weekdayPrice * (parseFloat(p.weekendValue) || 0) / 100))
                        : p.weekendValue;

                    // Season Calculation
                    let seasonIncreaseAmount = 0;
                    if (p.seasonIncreaseType === 'Percentage') {
                        const pct = parseFloat(p.seasonValue) || 0;
                        seasonIncreaseAmount = weekdayPrice * (pct / 100);
                    } else {
                        seasonIncreaseAmount = parseFloat(p.seasonValue) || 0;
                    }
                    const seasonPrice = weekdayPrice + seasonIncreaseAmount;
                    const seasonPercent = p.seasonIncreaseType === 'Percentage' 
                        ? (parseFloat(p.seasonValue) || 0) 
                        : Math.round((seasonIncreaseAmount / weekdayPrice) * 100);
                    const seasonInputVal = p.seasonIncreaseType === 'Percentage'
                        ? String(Math.round(weekdayPrice * (parseFloat(p.seasonValue) || 0) / 100))
                        : p.seasonValue;

                    // Custom Dates Calculation
                    let customDatesIncreaseAmount = 0;
                    if (p.customDatesIncreaseType === 'Percentage') {
                        const pct = parseFloat(p.customDatesValue) || 0;
                        customDatesIncreaseAmount = weekdayPrice * (pct / 100);
                    } else {
                        customDatesIncreaseAmount = parseFloat(p.customDatesValue) || 0;
                    }
                    const customDatesPrice = weekdayPrice + customDatesIncreaseAmount;
                    const customDatesPercent = p.customDatesIncreaseType === 'Percentage' 
                        ? (parseFloat(p.customDatesValue) || 0) 
                        : Math.round((customDatesIncreaseAmount / weekdayPrice) * 100);
                    const customDatesInputVal = p.customDatesIncreaseType === 'Percentage'
                        ? String(Math.round(weekdayPrice * (parseFloat(p.customDatesValue) || 0) / 100))
                        : p.customDatesValue;

                    return (
                        <div className="flex flex-col gap-6">
                            {/* 1. Weekends Option */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        onClick={() => p.setWeekendPricing(!p.weekendPricing)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            p.weekendPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {p.weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Weekends</span>
                                </div>

                                {p.weekendPricing && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/40">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SET WEEKEND PRICE</span>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[#030303]">₹</span>
                                            <input
                                                type="text"
                                                placeholder="Surcharge amount"
                                                value={weekendInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(weekendInputVal)) : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    p.setWeekendIncreaseType('Fixed Price');
                                                    p.setWeekendValue(val);
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="w-full pl-8 pr-4 py-4 bg-[#E4E4E7]/70 border-none rounded-[12px] text-[18px] font-bold text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            />
                                        </div>
                                        
                                        <div className="flex items-start gap-2 text-[#71717B] text-[13px] leading-relaxed">
                                            <span className="text-[14px] mt-0.5">ⓘ</span>
                                            <span>
                                                Weekday price: ₹{new Intl.NumberFormat('en-IN').format(weekdayPrice)}. You&rsquo;re charging ₹{new Intl.NumberFormat('en-IN').format(weekendIncreaseAmount)} more (+{weekendPercent}%)
                                            </span>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    p.setWeekendIncreaseType('Percentage');
                                                    p.setWeekendValue('10');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    p.weekendIncreaseType === 'Percentage' && p.weekendValue === '10'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +10%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    p.setWeekendIncreaseType('Percentage');
                                                    p.setWeekendValue('20');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    p.weekendIncreaseType === 'Percentage' && p.weekendValue === '20'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +20%
                                            </button>
                                        </div>

                                        {/* Day selector */}
                                        <div className="flex items-center gap-3 mt-2 border-t border-[#E4E4E7]/40 pt-3">
                                            {['Saturday', 'Sunday'].map(d => (
                                                <button 
                                                    key={d} 
                                                    type="button"
                                                    onClick={() => p.setWeekendDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                                                        p.weekendDays.includes(d) ? 'bg-[#030303] text-white' : 'bg-[#F4F4F5] text-[#3F3F47]'
                                                    }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. Wedding Season Option */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        onClick={() => p.setWeekendSeason(!p.weekendSeason)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            p.weekendSeason ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {p.weekendSeason && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Wedding season</span>
                                </div>

                                {p.weekendSeason && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SET WEDDING SEASON PRICE</span>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[#030303]">₹</span>
                                            <input
                                                type="text"
                                                placeholder="Surcharge amount"
                                                value={seasonInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(seasonInputVal)) : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    p.setSeasonIncreaseType('Fixed Price');
                                                    p.setSeasonValue(val);
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="w-full pl-8 pr-4 py-4 bg-[#E4E4E7]/70 border-none rounded-[12px] text-[18px] font-bold text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            />
                                        </div>
                                        
                                        <div className="flex items-start gap-2 text-[#71717B] text-[13px] leading-relaxed">
                                            <span className="text-[14px] mt-0.5">ⓘ</span>
                                            <span>
                                                Weekday price: ₹{new Intl.NumberFormat('en-IN').format(weekdayPrice)}. You&rsquo;re charging ₹{new Intl.NumberFormat('en-IN').format(seasonIncreaseAmount)} more (+{seasonPercent}%)
                                            </span>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    p.setSeasonIncreaseType('Percentage');
                                                    p.setSeasonValue('15');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    p.seasonIncreaseType === 'Percentage' && p.seasonValue === '15'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +15%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    p.setSeasonIncreaseType('Percentage');
                                                    p.setSeasonValue('25');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    p.seasonIncreaseType === 'Percentage' && p.seasonValue === '25'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +25%
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Festivals Option */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        onClick={() => p.setFestivalPricing(!p.festivalPricing)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            p.festivalPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {p.festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Festivals</span>
                                </div>

                                {p.festivalPricing && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SELECT FESTIVALS</span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {p.availableFestivals.map(f => (
                                                <button 
                                                    key={f} 
                                                    type="button"
                                                    onClick={() => p.setSelectedFestivals(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                                                        p.selectedFestivals.includes(f) 
                                                            ? 'bg-[#030303] border-[#030303] text-white' 
                                                            : 'bg-white border-[#E4E4E7] text-[#3F3F47] hover:border-gray-400'
                                                    }`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                            {p.isAddingFestival ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add festival" 
                                                        value={p.newFestivalName} 
                                                        onChange={(e) => p.setNewFestivalName(e.target.value)} 
                                                        onKeyDown={(e) => e.key === 'Enter' && p.handleAddFestival()} 
                                                        autoFocus 
                                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                        className="w-32 py-2 px-3 bg-white border border-[#E4E4E7] rounded-full text-[13px] font-semibold focus:outline-none" 
                                                    />
                                                    <button type="button" onClick={p.handleAddFestival} className="p-2 bg-[#030303] text-white rounded-full">
                                                        <Check size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => p.setIsAddingFestival(true)} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-[#E4E4E7] bg-white hover:border-gray-400"
                                                >
                                                    <PlusCircle size={14} /> Add New
                                                </button>
                                            )}
                                        </div>
                                        {p.selectedFestivals.length > 0 && (
                                            <div className="mt-4 flex flex-col gap-4 border-t border-[#E4E4E7]/40 pt-4">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">CONFIGURE PRICES FOR SELECTED FESTIVALS</span>
                                                <div className="flex flex-col gap-3">
                                                    {p.selectedFestivals.map(f => {
                                                        const spec = p.festivalPrices[f] || { increaseType: 'Percentage', value: '10' };
                                                        
                                                        // Festival specific calculation
                                                        let fIncreaseAmount = 0;
                                                        if (spec.increaseType === 'Percentage') {
                                                            const pct = parseFloat(spec.value) || 0;
                                                            fIncreaseAmount = weekdayPrice * (pct / 100);
                                                        } else {
                                                            fIncreaseAmount = parseFloat(spec.value) || 0;
                                                        }
                                                        const fPrice = weekdayPrice + fIncreaseAmount;
                                                            
                                                        const fInputVal = spec.increaseType === 'Percentage'
                                                            ? String(Math.round(weekdayPrice * (parseFloat(spec.value) || 0) / 100))
                                                            : spec.value;

                                                        return (
                                                            <div key={f} className="p-4 bg-white border border-[#E4E4E7]/60 rounded-[12px] flex flex-col gap-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">{f}</span>
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B]">
                                                                        Total: ₹{new Intl.NumberFormat('en-IN').format(fPrice)}
                                                                    </span>
                                                                </div>

                                                                <div className="relative">
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-[#030303]">₹</span>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Surcharge amount"
                                                                        value={fInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(fInputVal)) : ''}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                                            p.setFestivalPrices(prev => ({
                                                                                ...prev,
                                                                                [f]: { increaseType: 'Fixed Price', value: val }
                                                                            }));
                                                                        }}
                                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                        className="w-full pl-8 pr-4 py-3 bg-[#E4E4E7]/40 border-none rounded-[8px] text-[14px] font-bold text-[#030303] focus:outline-none"
                                                                    />
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            p.setFestivalPrices(prev => ({
                                                                                ...prev,
                                                                                [f]: { increaseType: 'Percentage', value: '10' }
                                                                            }));
                                                                        }}
                                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                                                            spec.increaseType === 'Percentage' && spec.value === '10'
                                                                                ? 'bg-[#030303] text-white'
                                                                                : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                                        }`}
                                                                    >
                                                                        +10%
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            p.setFestivalPrices(prev => ({
                                                                                ...prev,
                                                                                [f]: { increaseType: 'Percentage', value: '20' }
                                                                            }));
                                                                        }}
                                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                                                            spec.increaseType === 'Percentage' && spec.value === '20'
                                                                                ? 'bg-[#030303] text-white'
                                                                                : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                                        }`}
                                                                    >
                                                                        +20%
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 4. Custom Dates Option */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        onClick={() => p.setCustomDatesPricing(!p.customDatesPricing)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            p.customDatesPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {p.customDatesPricing && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Custom dates</span>
                                </div>

                                {p.customDatesPricing && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SET CUSTOM DATES PRICE</span>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={p.customDatesStartDate}
                                                    onChange={(e) => p.setCustomDatesStartDate(e.target.value)}
                                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                                    onFocus={(e) => e.currentTarget.showPicker?.()}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-gray-900 focus:outline-none cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    value={p.customDatesEndDate}
                                                    onChange={(e) => p.setCustomDatesEndDate(e.target.value)}
                                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                                    onFocus={(e) => e.currentTarget.showPicker?.()}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-gray-900 focus:outline-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">SURCHARGE PRICE</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[#030303]">₹</span>
                                                <input
                                                    type="text"
                                                    placeholder="Surcharge amount"
                                                    value={customDatesInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(customDatesInputVal)) : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        p.setCustomDatesIncreaseType('Fixed Price');
                                                        p.setCustomDatesValue(val);
                                                    }}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full pl-8 pr-4 py-4 bg-[#E4E4E7]/70 border-none rounded-[12px] text-[18px] font-bold text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-2 text-[#71717B] text-[13px] leading-relaxed">
                                            <span className="text-[14px] mt-0.5">ⓘ</span>
                                            <span>
                                                Weekday price: ₹{new Intl.NumberFormat('en-IN').format(weekdayPrice)}. You&rsquo;re charging ₹{new Intl.NumberFormat('en-IN').format(customDatesIncreaseAmount)} more (+{customDatesPercent}%)
                                            </span>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    p.setCustomDatesIncreaseType('Percentage');
                                                    p.setCustomDatesValue('10');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    p.customDatesIncreaseType === 'Percentage' && p.customDatesValue === '10'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +10%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    p.setCustomDatesIncreaseType('Percentage');
                                                    p.setCustomDatesValue('20');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    p.customDatesIncreaseType === 'Percentage' && p.customDatesValue === '20'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +20%
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Policies */}
            <div className="mt-8">
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Policies &amp; Rules</p>
                <button 
                    type="button" 
                    onClick={() => p.policyInputRef.current?.click()} 
                    className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4"
                >
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4"><Upload size={24} className="text-[#3F3F47]" /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                </button>
                <input
                    type="file"
                    ref={p.policyInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={p.onPolicyUpload}
                />
                {p.policyFiles && p.policyFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {p.policyFiles.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white"><FileText size={16} className="text-[#3F3F47]" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} · Uploaded</p>
                                    </div>
                                </div>
                                <button onClick={() => p.removePolicyFile(idx)} className="text-[#3F3F47] hover:text-[#030303]"><X size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
