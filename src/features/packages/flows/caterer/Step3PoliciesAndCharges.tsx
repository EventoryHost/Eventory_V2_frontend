'use client';

import React from 'react';
import { ChevronDown, Check, Upload, FileText, X, Plus } from 'lucide-react';
import { GuestTier, PolicyFile, formatFileSize } from '../../shared/types';
import CustomDateRangePicker from '../../components/CustomDateRangePicker';

interface Props {
    teamEquipmentPrice: string; setTeamEquipmentPrice: (v: string) => void;
    teamEquipmentUnit: string; setTeamEquipmentUnit: (v: string) => void;
    overtimePrice: string; setOvertimePrice: (v: string) => void;
    lastMinuteChargesDescription: string; setLastMinuteChargesDescription: (v: string) => void;
    lastMinuteInputRef: React.RefObject<HTMLInputElement | null>;
    guestTiers: GuestTier[]; 
    addGuestTierOption: () => void; 
    updateGuestTier: (i: number, f: 'range' | 'price', v: string) => void;
    removeGuestTier: (i: number) => void;
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

const CARD = 'p-6 flex flex-col gap-6';
const CARD_STYLE = {
    borderRadius: 'var(--Radius-radius-md, 8px)',
    border: 'var(--Border-border-thin, 0.5px) solid var(--Border-Neutral-default, #D4D4D8)',
    background: 'var(--surface-Neutral-default, #FFF)'
};

export default function CatererStep3PoliciesAndCharges(p: Props) {
    React.useEffect(() => {
        console.log("Step3 - lastMinuteFiles:", p.lastMinuteFiles);
        console.log("Step3 - policyFiles:", p.policyFiles);
    }, [p.lastMinuteFiles, p.policyFiles]);

    return (
        <div className="flex flex-col gap-6 w-full mt-6 pb-32">
            
            {/* Team & Equipment Charges */}
            <div className={CARD} style={CARD_STYLE}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-[22px]">Team & Equipment Charges</h3>
                
                <div className="flex flex-col gap-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">How do you charge?</span>
                    <div className="bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] p-1 flex w-full select-none relative h-[48px]">
                        <div 
                            onClick={() => p.setTeamEquipmentUnit('Per package')}
                            className={`flex-1 flex items-center justify-center font-bold text-[14px] cursor-pointer rounded-[12px] transition-all ${
                                p.teamEquipmentUnit.toLowerCase() === 'per package' 
                                    ? 'bg-white shadow-sm text-gray-900 border border-[#D4D4D8]' 
                                    : 'text-[#71717B]'
                            }`}
                        >
                            Per Package
                        </div>
                        <div 
                            onClick={() => p.setTeamEquipmentUnit('Per hour')}
                            className={`flex-1 flex items-center justify-center font-bold text-[14px] cursor-pointer rounded-[12px] transition-all ${
                                p.teamEquipmentUnit.toLowerCase() === 'per hour' 
                                    ? 'bg-white shadow-sm text-gray-900 border border-[#D4D4D8]' 
                                    : 'text-[#71717B]'
                            }`}
                        >
                            Per Hour
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#71717B]">Rs.</span>
                        <input 
                            type="text" 
                            placeholder="0" 
                            value={p.teamEquipmentPrice} 
                            onChange={(e) => p.setTeamEquipmentPrice(e.target.value.replace(/[^0-9]/g, ''))} 
                            style={{ fontFamily: 'Figtree, sans-serif' }} 
                            className="w-full p-4 pl-12 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]" 
                        />
                    </div>
                </div>
            </div>

            {/* Overtime Rate */}
            <div className={CARD} style={CARD_STYLE}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-[22px]">Overtime Rate</h3>
                <div>
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Price Per Hour</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#71717B]">Rs.</span>
                        <input 
                            type="text" 
                            placeholder="3,000" 
                            value={p.overtimePrice} 
                            onChange={(e) => p.setOvertimePrice(e.target.value.replace(/[^0-9]/g, ''))} 
                            style={{ fontFamily: 'Figtree, sans-serif' }} 
                            className="w-full p-4 pl-12 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]" 
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Pricing */}
            <div className="p-6 flex flex-col" style={CARD_STYLE}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mt-0.5">Adjust your price by season, dates, or guest count</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => p.setIsDynamicPricingEnabled(!p.isDynamicPricingEnabled)} 
                        className={`w-12 h-6 flex items-center rounded-full transition-colors px-1 ${p.isDynamicPricingEnabled ? 'bg-[#030303]' : 'bg-[#E4E4E7]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${p.isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {p.isDynamicPricingEnabled && (() => {
                    const weekdayPrice = parseFloat(p.teamEquipmentPrice) || 20000;

                    // Weekend Calculation
                    let weekendIncreaseAmount = 0;
                    let weekendPrice = weekdayPrice;
                    let weekendInputVal = '';

                    if (p.weekendIncreaseType === 'Percentage') {
                        const pct = parseFloat(p.weekendValue) || 0;
                        weekendIncreaseAmount = weekdayPrice * (pct / 100);
                        weekendPrice = weekdayPrice + weekendIncreaseAmount;
                        weekendInputVal = String(Math.round(weekendPrice));
                    } else {
                        const val = parseFloat(p.weekendValue);
                        if (!isNaN(val)) {
                            weekendIncreaseAmount = Math.max(0, val - weekdayPrice);
                            weekendPrice = val;
                        }
                        weekendInputVal = p.weekendValue;
                    }
                    const weekendPercent = p.weekendIncreaseType === 'Percentage' 
                        ? (parseFloat(p.weekendValue) || 0) 
                        : Math.round((weekendIncreaseAmount / weekdayPrice) * 100);

                    // Season Calculation
                    let seasonIncreaseAmount = 0;
                    let seasonPrice = weekdayPrice;
                    let seasonInputVal = '';

                    if (p.seasonIncreaseType === 'Percentage') {
                        const pct = parseFloat(p.seasonValue) || 0;
                        seasonIncreaseAmount = weekdayPrice * (pct / 100);
                        seasonPrice = weekdayPrice + seasonIncreaseAmount;
                        seasonInputVal = String(Math.round(seasonPrice));
                    } else {
                        const val = parseFloat(p.seasonValue);
                        if (!isNaN(val)) {
                            seasonIncreaseAmount = Math.max(0, val - weekdayPrice);
                            seasonPrice = val;
                        }
                        seasonInputVal = p.seasonValue;
                    }
                    const seasonPercent = p.seasonIncreaseType === 'Percentage' 
                        ? (parseFloat(p.seasonValue) || 0) 
                        : Math.round((seasonIncreaseAmount / weekdayPrice) * 100);

                    // Custom Dates Calculation
                    let customDatesIncreaseAmount = 0;
                    let customDatesPrice = weekdayPrice;
                    let customDatesInputVal = '';

                    if (p.customDatesIncreaseType === 'Percentage') {
                        const pct = parseFloat(p.customDatesValue) || 0;
                        customDatesIncreaseAmount = weekdayPrice * (pct / 100);
                        customDatesPrice = weekdayPrice + customDatesIncreaseAmount;
                        customDatesInputVal = String(Math.round(customDatesPrice));
                    } else {
                        const val = parseFloat(p.customDatesValue);
                        if (!isNaN(val)) {
                            customDatesIncreaseAmount = Math.max(0, val - weekdayPrice);
                            customDatesPrice = val;
                        }
                        customDatesInputVal = p.customDatesValue;
                    }
                    const customDatesPercent = p.customDatesIncreaseType === 'Percentage' 
                        ? (parseFloat(p.customDatesValue) || 0) 
                        : Math.round((customDatesIncreaseAmount / weekdayPrice) * 100);

                    return (
                        <div className="flex flex-col gap-6 mt-4 border-t border-[#E4E4E7] pt-6 animate-in fade-in duration-200">
                            
                            {/* Seasonal & Date Pricing Section */}
                            <div className="flex flex-col gap-4">
                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Seasonal & Date Pricing</h4>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium -mt-2">
                                    Adjust your package pricing for wedding seasons, festivals, weekends, or custom dates.
                                </p>

                                <div className="flex flex-col gap-3.5">
                                    
                                    {/* Weekends Checkbox */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                onClick={() => p.setWeekendPricing(!p.weekendPricing)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    p.weekendPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {p.weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Weekends</span>
                                        </div>

                                        {p.weekendPricing && (
                                            <div className="ml-8 p-5 bg-[#FAFAFA] rounded-[16px] flex flex-col gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                    <div className="w-[120px] bg-white border border-[#D4D4D8] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                        <input
                                                            type="text"
                                                            value={weekendInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(weekendInputVal)) : ''}
                                                            onChange={(e) => {
                                                                p.setWeekendIncreaseType('Fixed Price');
                                                                p.setWeekendValue(e.target.value.replace(/[^0-9]/g, ''));
                                                            }}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="w-full bg-transparent text-[14px] font-bold text-[#030303] focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 mt-1">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9] uppercase tracking-wider">QUICK ADD</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setWeekendIncreaseType('Percentage'); p.setWeekendValue('10'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${p.weekendIncreaseType === 'Percentage' && p.weekendValue === '10' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 10 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setWeekendIncreaseType('Percentage'); p.setWeekendValue('20'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${p.weekendIncreaseType === 'Percentage' && p.weekendValue === '20' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 20 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setWeekendIncreaseType('Percentage'); p.setWeekendValue(''); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${p.weekendIncreaseType === 'Percentage' && p.weekendValue !== '10' && p.weekendValue !== '20' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#030303] border-[#030303]'}`}
                                                        >
                                                            Custom %
                                                        </button>
                                                    </div>
                                                    
                                                    {p.weekendIncreaseType === 'Percentage' && p.weekendValue !== '10' && p.weekendValue !== '20' && (
                                                        <div className="flex items-center justify-between w-[200px] mt-1 bg-[#FAFAFA] rounded-[8px] p-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#9F9FA9]">Custom percentage</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter"
                                                                value={p.weekendValue}
                                                                onChange={(e) => p.setWeekendValue(e.target.value.replace(/[^0-9]/g, ''))}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-12 bg-transparent text-[13px] font-semibold text-right text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-1.5 mt-2">
                                                    <div className="min-w-[14px] mt-[3px]">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M7 9.4V7" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M7 4.6001H7.006" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#71717B] leading-tight">
                                                        Weekday price: ₹{new Intl.NumberFormat('en-IN').format(weekdayPrice)}. You're charging ₹{new Intl.NumberFormat('en-IN').format(weekendIncreaseAmount)} more (+{weekendPercent}%)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Wedding Season Checkbox */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                onClick={() => p.setWeekendSeason(!p.weekendSeason)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    p.weekendSeason ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {p.weekendSeason && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Wedding Session</span>
                                        </div>

                                        {p.weekendSeason && (
                                            <div className="ml-8 p-5 bg-[#FAFAFA] rounded-[16px] flex flex-col gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                    <div className="w-[120px] bg-white border border-[#D4D4D8] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                        <input
                                                            type="text"
                                                            value={seasonInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(seasonInputVal)) : ''}
                                                            onChange={(e) => {
                                                                p.setSeasonIncreaseType('Fixed Price');
                                                                p.setSeasonValue(e.target.value.replace(/[^0-9]/g, ''));
                                                            }}
                                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                                            className="w-full bg-transparent text-[14px] font-bold text-[#030303] focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 mt-1">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9] uppercase tracking-wider">QUICK ADD</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setSeasonIncreaseType('Percentage'); p.setSeasonValue('10'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${p.seasonIncreaseType === 'Percentage' && p.seasonValue === '10' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 10 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setSeasonIncreaseType('Percentage'); p.setSeasonValue('20'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${p.seasonIncreaseType === 'Percentage' && p.seasonValue === '20' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 20 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setSeasonIncreaseType('Percentage'); p.setSeasonValue(''); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${p.seasonIncreaseType === 'Percentage' && p.seasonValue !== '10' && p.seasonValue !== '20' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#030303] border-[#030303]'}`}
                                                        >
                                                            Custom %
                                                        </button>
                                                    </div>
                                                    
                                                    {p.seasonIncreaseType === 'Percentage' && p.seasonValue !== '10' && p.seasonValue !== '20' && (
                                                        <div className="flex items-center justify-between w-[200px] mt-1 bg-[#FAFAFA] rounded-[8px] p-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#9F9FA9]">Custom percentage</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter"
                                                                value={p.seasonValue}
                                                                onChange={(e) => p.setSeasonValue(e.target.value.replace(/[^0-9]/g, ''))}
                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                className="w-12 bg-transparent text-[13px] font-semibold text-right text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-1.5 mt-2">
                                                    <div className="min-w-[14px] mt-[3px]">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M7 9.4V7" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M7 4.6001H7.006" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#71717B] leading-tight">
                                                        Weekday price: ₹{new Intl.NumberFormat('en-IN').format(weekdayPrice)}. You're charging ₹{new Intl.NumberFormat('en-IN').format(seasonIncreaseAmount)} more (+{seasonPercent}%)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Festivals Checkbox */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                onClick={() => p.setFestivalPricing(!p.festivalPricing)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    p.festivalPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {p.festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Festivals</span>
                                        </div>

                                        {p.festivalPricing && (
                                            <div className="ml-8 p-5 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] flex flex-col gap-4">
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
                                                                    ? 'bg-[#030303] border-[#030303] text-white shadow-sm' 
                                                                    : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:border-gray-400'
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
                                                                className="w-32 py-2 px-3 bg-white border border-[#D4D4D8] rounded-full text-[13px] font-semibold focus:outline-none" 
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
                                                            className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-dashed border-[#D4D4D8] bg-white hover:border-gray-400"
                                                        >
                                                            + Add New
                                                        </button>
                                                    )}
                                                </div>
                                                {p.selectedFestivals.length > 0 && (
                                                    <div className="mt-4 flex flex-col gap-4 border-t border-[#E4E4E7] pt-4">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">CONFIGURE PRICES FOR SELECTED FESTIVALS</span>
                                                        <div className="flex flex-col gap-3">
                                                            {p.selectedFestivals.map(f => {
                                                                const spec = p.festivalPrices[f] || { increaseType: 'Percentage', value: '10' };
                                                                
                                                                let fIncreaseAmount = 0;
                                                                let fPrice = weekdayPrice;
                                                                let fInputVal = '';
                                                                
                                                                if (spec.increaseType === 'Percentage') {
                                                                    const pct = parseFloat(spec.value) || 0;
                                                                    fIncreaseAmount = weekdayPrice * (pct / 100);
                                                                    fPrice = weekdayPrice + fIncreaseAmount;
                                                                    fInputVal = String(Math.round(fPrice));
                                                                } else {
                                                                    const val = parseFloat(spec.value);
                                                                    if (!isNaN(val)) {
                                                                        fIncreaseAmount = Math.max(0, val - weekdayPrice);
                                                                        fPrice = val;
                                                                    }
                                                                    fInputVal = spec.value;
                                                                }

                                                                return (
                                                                    <div key={f} className="p-4 bg-white border border-[#D4D4D8] rounded-[16px] flex flex-col gap-3">
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
                                                                                placeholder="Total price"
                                                                                value={fInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(fInputVal)) : ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                                                    p.setFestivalPrices(prev => ({
                                                                                        ...prev,
                                                                                        [f]: { increaseType: 'Fixed Price', value: val }
                                                                                    }));
                                                                                }}
                                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                                className="w-full pl-8 pr-4 py-3 bg-white border border-[#D4D4D8] rounded-[12px] text-[14px] font-bold text-[#030303] focus:outline-none"
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
                                                                                        ? 'bg-[#030303] text-white shadow-sm'
                                                                                        : 'bg-white border border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-100'
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
                                                                                        ? 'bg-[#030303] text-white shadow-sm'
                                                                                        : 'bg-white border border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-100'
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

                                    {/* Custom Dates Checkbox */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                onClick={() => p.setCustomDatesPricing(!p.customDatesPricing)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    p.customDatesPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {p.customDatesPricing && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Custom Dates</span>
                                        </div>

                                        {p.customDatesPricing && (
                                            <div className="mt-1 p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] flex flex-col gap-5">
                                                <div className="flex flex-col gap-3">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303]">Choose Date</span>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#9F9FA9]">Start</span>
                                                            <div className="relative">
                                                                <input 
                                                                    type="date" 
                                                                    value={p.customDatesStartDate} 
                                                                    onChange={(e) => p.setCustomDatesStartDate(e.target.value)} 
                                                                    onClick={(e) => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()}
                                                                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-[8px] px-2.5 py-2.5 text-[13px] font-medium text-[#030303] focus:outline-none cursor-pointer" 
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#9F9FA9]">End</span>
                                                            <div className="relative">
                                                                <input 
                                                                    type="date" 
                                                                    value={p.customDatesEndDate} 
                                                                    onChange={(e) => p.setCustomDatesEndDate(e.target.value)} 
                                                                    onClick={(e) => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()}
                                                                    className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-[8px] px-2.5 py-2.5 text-[13px] font-medium text-[#030303] focus:outline-none cursor-pointer" 
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9] uppercase tracking-wider">QUICK ADD</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setCustomDatesIncreaseType('Percentage'); p.setCustomDatesValue('10'); }}
                                                            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${p.customDatesIncreaseType === 'Percentage' && p.customDatesValue === '10' ? 'bg-transparent text-[#030303] border-[#030303]' : 'bg-transparent text-[#9F9FA9] border-[#D4D4D8] hover:border-gray-400'}`}
                                                        >
                                                            + 10 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setCustomDatesIncreaseType('Percentage'); p.setCustomDatesValue('20'); }}
                                                            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${p.customDatesIncreaseType === 'Percentage' && p.customDatesValue === '20' ? 'bg-transparent text-[#030303] border-[#030303]' : 'bg-transparent text-[#9F9FA9] border-[#D4D4D8] hover:border-gray-400'}`}
                                                        >
                                                            + 20 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { p.setCustomDatesIncreaseType('Percentage'); p.setCustomDatesValue(''); }}
                                                            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${p.customDatesIncreaseType === 'Percentage' && p.customDatesValue !== '10' && p.customDatesValue !== '20' ? 'bg-transparent text-[#030303] border-[#030303]' : 'bg-transparent text-[#9F9FA9] border-[#D4D4D8] hover:border-gray-400'}`}
                                                        >
                                                            Custom
                                                        </button>
                                                    </div>
                                                    
                                                    {p.customDatesIncreaseType === 'Percentage' && p.customDatesValue !== '10' && p.customDatesValue !== '20' && (
                                                        <div className="flex items-center justify-between w-full mt-1 bg-white border border-[#D4D4D8] rounded-[8px] p-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#9F9FA9]">Custom percentage</span>
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="0"
                                                                    value={p.customDatesValue}
                                                                    onChange={(e) => p.setCustomDatesValue(e.target.value.replace(/[^0-9]/g, ''))}
                                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                    className="w-8 bg-transparent text-[13px] font-semibold text-right text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]"
                                                                />
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#030303]">%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-2 mt-1">
                                                    <div className="min-w-[14px] mt-[3px]">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M7 9.4V7" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M7 4.6001H7.006" stroke="#71717B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#71717B] leading-tight">
                                                        Weekday price: ₹{new Intl.NumberFormat('en-IN').format(weekdayPrice)}. You're charging ₹{new Intl.NumberFormat('en-IN').format(customDatesIncreaseAmount)} more (+{customDatesPercent}%)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Guest Count Pricing Section */}
                            <div className="flex flex-col gap-4 border-t border-[#E4E4E7] pt-6 mt-4">
                                <div className="flex flex-col gap-1">
                                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Guest Count Pricing</h4>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium">
                                        Set different prices based on how many guests attend
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-3 mt-1">
                                    {/* Column Headers */}
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <div className="flex-1">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9] uppercase tracking-wider">NO OF GUESTS</span>
                                        </div>
                                        <span className="px-1 opacity-0">-</span>
                                        <div className="flex-1">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9] uppercase tracking-wider">COST PER PERSON</span>
                                        </div>
                                        <div className="w-8 flex-shrink-0"></div>
                                    </div>

                                    {p.guestTiers.map((tier, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <select 
                                                    value={tier.range} 
                                                    onChange={(e) => p.updateGuestTier(i, 'range', e.target.value)} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className="w-full p-3 pr-10 bg-white border border-[#E4E4E7] rounded-[12px] text-[14px] font-medium text-[#030303] appearance-none focus:outline-none focus:border-[#04222D]"
                                                >
                                                    {['Upto 50','Upto 100','Upto 200','Upto 500','Upto 1000','Upto X'].map(o => (
                                                        <option key={o} value={o}>{o}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                            
                                            <span className="text-gray-400 font-medium px-1">-</span>
                                            
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#71717B]">₹</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="0" 
                                                    value={tier.price} 
                                                    onChange={(e) => p.updateGuestTier(i, 'price', e.target.value.replace(/[^0-9]/g, ''))} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className="w-full p-3 pl-8 bg-white border border-[#E4E4E7] rounded-[12px] text-[14px] font-medium text-[#030303] focus:outline-none focus:border-[#04222D]" 
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => p.removeGuestTier(i)}
                                                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="9" stroke="#030303" strokeWidth="1.5" />
                                                    <line x1="8" y1="12" x2="16" y2="12" stroke="#030303" strokeWidth="1.5" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                        <button
                                            type="button"
                                            onClick={p.addGuestTierOption}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className="flex items-center justify-center gap-2 text-[14px] font-bold text-[#030303] mt-2 py-2 hover:opacity-80 transition-opacity bg-transparent"
                                        >
                                            <Plus size={18} /> Add Guest Range
                                        </button>
                                    </div>
                                </div>
                            </div>
                    );
                })()}
            </div>

            {/* Last-Minute Change Charges */}
            <div className={CARD} style={CARD_STYLE}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-[22px]">Last-Minute Change Charges</h3>
                
                <label className="w-full py-8 px-4 rounded-[16px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-center block">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                        <Upload size={24} className="text-[#3F3F47] stroke-[2]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload your last-minute change policy</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide underline">BROWSE FILES</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={p.onLastMinuteUpload}
                    />
                </label>
                
                {p.lastMinuteFiles && p.lastMinuteFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {p.lastMinuteFiles.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[12px] border border-[#E4E4E7] gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#D4D4D8] rounded-[6px] bg-white">
                                        <FileText size={16} className="text-[#3F3F47]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">{formatFileSize(file.size)} _ Uploaded</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => p.removeLastMinuteFile(idx)} className="text-gray-400 hover:text-[#030303] flex-shrink-0"><X size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center my-2 select-none">
                    <div className="flex-1 h-[1px] bg-gray-200" />
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="px-4 text-[12px] font-bold text-gray-400 uppercase">or</span>
                    <div className="flex-1 h-[1px] bg-gray-200" />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B] uppercase tracking-wider">Describe Them Instead</label>
                    <textarea
                        rows={4}
                        placeholder="Placeholder"
                        value={p.lastMinuteChargesDescription}
                        onChange={(e) => p.setLastMinuteChargesDescription(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] text-[15px] font-medium text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none"
                    />
                </div>
            </div>

            {/* Policies & Documents */}
            <div className={CARD} style={CARD_STYLE}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] leading-[22px]">Policies & Documents</h3>
                
                <label className="w-full py-8 px-4 rounded-[16px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-center block">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                        <Upload size={24} className="text-[#3F3F47] stroke-[2]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide underline">BROWSE FILES</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={p.onPolicyUpload}
                    />
                </label>

                {p.policyFiles && p.policyFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {p.policyFiles.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[12px] border border-[#E4E4E7] gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#D4D4D8] rounded-[6px] bg-white">
                                        <FileText size={16} className="text-[#3F3F47]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">{formatFileSize(file.size)} _ Uploaded</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => p.removePolicyFile(idx)} className="text-gray-400 hover:text-[#030303] flex-shrink-0"><X size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
