'use client';
import React from 'react';
import { ChevronDown, Check, PlusCircle, Upload, FileText, X } from 'lucide-react';
import { GuestTier, PolicyFile, formatFileSize } from '../../shared/types';

interface Props {
    packageChargeType: string; setPackageChargeType: (v: string) => void;
    packagePrice: string; setPackagePrice: (v: string) => void;
    
    teamEquipmentChargeType: string; setTeamEquipmentChargeType: (v: string) => void;
    teamEquipmentPrice: string; setTeamEquipmentPrice: (v: string) => void;
    
    overtimePrice: string; setOvertimePrice: (v: string) => void;

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
    festivalPrices: Record<string, { increaseType: string; value: string }>;
    setFestivalPrices: React.Dispatch<React.SetStateAction<Record<string, { increaseType: string; value: string }>>>;

    customDatesPricing: boolean; setCustomDatesPricing: (v: boolean) => void;
    customDatesIncreaseType: string; setCustomDatesIncreaseType: (v: string) => void;
    customDatesValue: string; setCustomDatesValue: (v: string) => void;
    customDatesStartDate: string; setCustomDatesStartDate: (v: string) => void;
    customDatesEndDate: string; setCustomDatesEndDate: (v: string) => void;

    guestTiers: GuestTier[]; addGuestTierOption: () => void; updateGuestTier: (i: number, f: 'range' | 'price', v: string) => void;

    lastMinuteFiles: PolicyFile[];
    onLastMinuteUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeLastMinuteFile: (i: number) => void;

    policyFiles: PolicyFile[];
    onPolicyUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePolicyFile: (i: number) => void;
}

export default function DJStep3PricingAndPolicies(p: Props) {
    // Helper to extract numeric value
    const getBasePrice = () => parseFloat(p.packagePrice) || 0;

    return (
        <div className="flex flex-col gap-6 w-full pb-32">
            
            {/* Consolidated Pricing Container */}
            <div className="p-6 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-6">
                
                {/* Package Pricing */}
                <div className="flex flex-col gap-5">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Package Pricing</h3>
                    
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-semibold text-[#3F3F47]">How do you charge?</label>
                        <div className="flex p-1 bg-[#F4F4F5] rounded-[8px]">
                            <button 
                                type="button"
                                onClick={() => p.setPackageChargeType('Per Performance')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[6px] transition-colors ${p.packageChargeType === 'Per Performance' ? 'bg-white shadow-sm text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Performance
                            </button>
                            <button 
                                type="button"
                                onClick={() => p.setPackageChargeType('Per Hour')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[6px] transition-colors ${p.packageChargeType === 'Per Hour' ? 'bg-white shadow-sm text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Hour
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-semibold text-[#3F3F47]">Package Pricing</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#030303] font-normal">Rs</span>
                            <input 
                                type="text" 
                                placeholder="5,000" 
                                value={p.packagePrice ? new Intl.NumberFormat('en-IN').format(parseFloat(p.packagePrice.replace(/[^0-9]/g, '')) || 0) : ''} 
                                onChange={(e) => p.setPackagePrice(e.target.value.replace(/[^0-9]/g, ''))} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="w-full pl-12 p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#E4E4E7]"></div>

                {/* Team & Equipment Charges */}
                <div className="flex flex-col gap-5">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Team & Equipment Charges</h3>
                    
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-semibold text-[#3F3F47]">How do you charge?</label>
                        <div className="flex p-1 bg-[#F4F4F5] rounded-[8px]">
                            <button 
                                type="button"
                                onClick={() => p.setTeamEquipmentChargeType('Per Performance')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[6px] transition-colors ${p.teamEquipmentChargeType === 'Per Performance' ? 'bg-white shadow-sm text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Performance
                            </button>
                            <button 
                                type="button"
                                onClick={() => p.setTeamEquipmentChargeType('Per Hour')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[6px] transition-colors ${p.teamEquipmentChargeType === 'Per Hour' ? 'bg-white shadow-sm text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Hour
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-semibold text-[#3F3F47]">Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#030303] font-normal">Rs</span>
                            <input 
                                type="text" 
                                placeholder="3,000" 
                                value={p.teamEquipmentPrice ? new Intl.NumberFormat('en-IN').format(parseFloat(p.teamEquipmentPrice.replace(/[^0-9]/g, '')) || 0) : ''} 
                                onChange={(e) => p.setTeamEquipmentPrice(e.target.value.replace(/[^0-9]/g, ''))} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="w-full pl-12 p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#E4E4E7]"></div>

                {/* Overtime Rate */}
                <div className="flex flex-col gap-5">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Overtime Rate</h3>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-semibold text-[#3F3F47]">Price Per Hour</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#030303] font-normal">Rs</span>
                            <input 
                                type="text" 
                                placeholder="3,000" 
                                value={p.overtimePrice ? new Intl.NumberFormat('en-IN').format(parseFloat(p.overtimePrice.replace(/[^0-9]/g, '')) || 0) : ''} 
                                onChange={(e) => p.setOvertimePrice(e.target.value.replace(/[^0-9]/g, ''))} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="w-full pl-12 p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Pricing */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col">
                <div className={`flex items-center justify-between ${p.isDynamicPricingEnabled ? 'mb-4' : ''}`}>
                    <div className="flex flex-col gap-1">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#3F3F47]">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-normal text-[#9F9FA9]">Adjust your price by season, dates, or guest count</p>
                    </div>
                    <button onClick={() => p.setIsDynamicPricingEnabled(!p.isDynamicPricingEnabled)} className={`w-14 h-8 flex items-center rounded-full transition-colors p-[6px] ${p.isDynamicPricingEnabled ? 'bg-[#04222D]' : 'bg-[#9F9FA9]'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${p.isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                                {p.isDynamicPricingEnabled && (() => {
                    const {
                        packagePrice, weekendPricing, setWeekendPricing,
                        weekendIncreaseType, setWeekendIncreaseType,
                        weekendValue, setWeekendValue,
                        weekendDays, setWeekendDays,
                        weekendSeason, setWeekendSeason,
                        seasonIncreaseType, setSeasonIncreaseType,
                        seasonValue, setSeasonValue,
                        festivalPricing, setFestivalPricing,
                        selectedFestivals, setSelectedFestivals,
                        availableFestivals,
                        isAddingFestival, setIsAddingFestival,
                        newFestivalName, setNewFestivalName,
                        handleAddFestival,
                        festivalPrices, setFestivalPrices,
                        customDatesPricing, setCustomDatesPricing,
                        customDatesIncreaseType, setCustomDatesIncreaseType,
                        customDatesValue, setCustomDatesValue,
                        customDatesStartDate, setCustomDatesStartDate,
                        customDatesEndDate, setCustomDatesEndDate,
                    } = p;

                    // Extract base price from packagePrice
                    const weekdayPrice = parseFloat(packagePrice) || 20000;

                    // Weekend Calculation
                    let weekendIncreaseAmount = 0;
                    let weekendPrice = weekdayPrice;
                    let weekendInputVal = '';

                    if (weekendIncreaseType === 'Percentage') {
                        const pct = parseFloat(weekendValue) || 0;
                        weekendIncreaseAmount = weekdayPrice * (pct / 100);
                        weekendPrice = weekdayPrice + weekendIncreaseAmount;
                        weekendInputVal = String(Math.round(weekendPrice));
                    } else {
                        const val = parseFloat(weekendValue);
                        if (!isNaN(val)) {
                            weekendIncreaseAmount = Math.max(0, val - weekdayPrice);
                            weekendPrice = val;
                        } else {
                            weekendIncreaseAmount = 0;
                        }
                        weekendInputVal = weekendValue;
                    }
                    const weekendPercent = weekendIncreaseType === 'Percentage' 
                        ? (parseFloat(weekendValue) || 0) 
                        : Math.round((weekendIncreaseAmount / weekdayPrice) * 100);

                    // Season Calculation
                    let seasonIncreaseAmount = 0;
                    let seasonPrice = weekdayPrice;
                    let seasonInputVal = '';

                    if (seasonIncreaseType === 'Percentage') {
                        const pct = parseFloat(seasonValue) || 0;
                        seasonIncreaseAmount = weekdayPrice * (pct / 100);
                        seasonPrice = weekdayPrice + seasonIncreaseAmount;
                        seasonInputVal = String(Math.round(seasonPrice));
                    } else {
                        const val = parseFloat(seasonValue);
                        if (!isNaN(val)) {
                            seasonIncreaseAmount = Math.max(0, val - weekdayPrice);
                            seasonPrice = val;
                        } else {
                            seasonIncreaseAmount = 0;
                        }
                        seasonInputVal = seasonValue;
                    }
                    const seasonPercent = seasonIncreaseType === 'Percentage' 
                        ? (parseFloat(seasonValue) || 0) 
                        : Math.round((seasonIncreaseAmount / weekdayPrice) * 100);

                    // Custom Dates Calculation
                    let customDatesIncreaseAmount = 0;
                    let customDatesPrice = weekdayPrice;
                    let customDatesInputVal = '';

                    if (customDatesIncreaseType === 'Percentage') {
                        const pct = parseFloat(customDatesValue) || 0;
                        customDatesIncreaseAmount = weekdayPrice * (pct / 100);
                        customDatesPrice = weekdayPrice + customDatesIncreaseAmount;
                        customDatesInputVal = String(Math.round(customDatesPrice));
                    } else {
                        const val = parseFloat(customDatesValue);
                        if (!isNaN(val)) {
                            customDatesIncreaseAmount = Math.max(0, val - weekdayPrice);
                            customDatesPrice = val;
                        } else {
                            customDatesIncreaseAmount = 0;
                        }
                        customDatesInputVal = customDatesValue;
                    }
                    const customDatesPercent = customDatesIncreaseType === 'Percentage' 
                        ? (parseFloat(customDatesValue) || 0) 
                        : Math.round((customDatesIncreaseAmount / weekdayPrice) * 100);

                    return (
                        <div className="flex flex-col gap-6 mt-6">

                            {/* 1. Weekends Option */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        onClick={() => setWeekendPricing(!weekendPricing)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            weekendPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Weekends</span>
                                </div>

                                {weekendPricing && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/40">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SET WEEKEND PRICE</span>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[#030303]">₹</span>
                                            <input
                                                type="text"
                                                placeholder="Total price"
                                                value={weekendInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(weekendInputVal)) : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setWeekendIncreaseType('Fixed Price');
                                                    setWeekendValue(val);
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
                                                    setWeekendIncreaseType('Percentage');
                                                    setWeekendValue('10');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    weekendIncreaseType === 'Percentage' && weekendValue === '10'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +10%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setWeekendIncreaseType('Percentage');
                                                    setWeekendValue('20');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    weekendIncreaseType === 'Percentage' && weekendValue === '20'
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
                                                    onClick={() => setWeekendDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                                                        weekendDays.includes(d) ? 'bg-[#030303] text-white' : 'bg-[#F4F4F5] text-[#3F3F47]'
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
                                        onClick={() => setWeekendSeason(!weekendSeason)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            weekendSeason ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {weekendSeason && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Wedding season</span>
                                </div>

                                {weekendSeason && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SET WEDDING SEASON PRICE</span>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[#030303]">₹</span>
                                            <input
                                                type="text"
                                                placeholder="Total price"
                                                value={seasonInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(seasonInputVal)) : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setSeasonIncreaseType('Fixed Price');
                                                    setSeasonValue(val);
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
                                                    setSeasonIncreaseType('Percentage');
                                                    setSeasonValue('15');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    seasonIncreaseType === 'Percentage' && seasonValue === '15'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +15%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSeasonIncreaseType('Percentage');
                                                    setSeasonValue('25');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    seasonIncreaseType === 'Percentage' && seasonValue === '25'
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
                                        onClick={() => setFestivalPricing(!festivalPricing)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            festivalPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Festivals</span>
                                </div>

                                {festivalPricing && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SELECT FESTIVALS</span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {availableFestivals.map(f => (
                                                <button 
                                                    key={f} 
                                                    type="button"
                                                    onClick={() => setSelectedFestivals(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                                                        selectedFestivals.includes(f) 
                                                            ? 'bg-[#030303] border-[#030303] text-white' 
                                                            : 'bg-white border-[#E4E4E7] text-[#3F3F47] hover:border-gray-400'
                                                    }`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                            {isAddingFestival ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add festival" 
                                                        value={newFestivalName} 
                                                        onChange={(e) => setNewFestivalName(e.target.value)} 
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddFestival()} 
                                                        autoFocus 
                                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                        className="w-32 py-2 px-3 bg-white border border-[#E4E4E7] rounded-full text-[13px] font-semibold focus:outline-none" 
                                                    />
                                                    <button type="button" onClick={handleAddFestival} className="p-2 bg-[#030303] text-white rounded-full">
                                                        <Check size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsAddingFestival(true)} 
                                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                    className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-[#E4E4E7] bg-white hover:border-gray-400"
                                                >
                                                    <PlusCircle size={14} /> Add New
                                                </button>
                                            )}
                                        </div>
                                        {selectedFestivals.length > 0 && (
                                            <div className="mt-4 flex flex-col gap-4 border-t border-[#E4E4E7]/40 pt-4">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">CONFIGURE PRICES FOR SELECTED FESTIVALS</span>
                                                <div className="flex flex-col gap-3">
                                                    {selectedFestivals.map(f => {
                                                        const spec = festivalPrices[f] || { increaseType: 'Percentage', value: '10' };
                                                        
                                                        // Festival specific calculation
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
                                                            } else {
                                                                fIncreaseAmount = 0;
                                                            }
                                                            fInputVal = spec.value;
                                                        }

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
                                                                        placeholder="Total price"
                                                                        value={fInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(fInputVal)) : ''}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                                            setFestivalPrices(prev => ({
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
                                                                            setFestivalPrices(prev => ({
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
                                                                            setFestivalPrices(prev => ({
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
                                        onClick={() => setCustomDatesPricing(!customDatesPricing)} 
                                        className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                            customDatesPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                        }`}
                                    >
                                        {customDatesPricing && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-semibold text-[#030303]">Custom dates</span>
                                </div>

                                {customDatesPricing && (
                                    <div className="ml-[34px] p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">SET CUSTOM DATES PRICE</span>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={customDatesStartDate}
                                                    onChange={(e) => setCustomDatesStartDate(e.target.value)}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-gray-900 focus:outline-none cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    value={customDatesEndDate}
                                                    onChange={(e) => setCustomDatesEndDate(e.target.value)}
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
                                                    placeholder="Total price"
                                                    value={customDatesInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(customDatesInputVal)) : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        setCustomDatesIncreaseType('Fixed Price');
                                                        setCustomDatesValue(val);
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
                                                    setCustomDatesIncreaseType('Percentage');
                                                    setCustomDatesValue('10');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    customDatesIncreaseType === 'Percentage' && customDatesValue === '10'
                                                        ? 'bg-[#030303] text-white'
                                                        : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-100'
                                                }`}
                                            >
                                                +10%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomDatesIncreaseType('Percentage');
                                                    setCustomDatesValue('20');
                                                }}
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                                    customDatesIncreaseType === 'Percentage' && customDatesValue === '20'
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

                            {/* Guest Count Pricing inside Dynamic Pricing */}
                            <div className="mt-4 flex flex-col gap-4">
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Guest Count Pricing</h3>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#3F3F47] mt-[-10px]">Set different prices based on how many guests attend</p>
                                
                                <div className="flex flex-col gap-3">
                                    {p.guestTiers.map((tier, i) => (
                                        <div key={i} className="flex items-center gap-3 p-1">
                                            <div className="relative flex-1">
                                                <select value={tier.range} onChange={(e) => p.updateGuestTier(i, 'range', e.target.value)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#3F3F47] appearance-none focus:outline-none">
                                                    {['Upto 50','Upto 100','Upto 200','Upto 500','Upto 1000'].map(o => <option key={o}>{o}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                            <span className="text-[#D4D4D8] font-bold">-</span>
                                            <div className="flex-1 relative flex items-center bg-white border border-[#E4E4E7] rounded-[8px] overflow-hidden">
                                                <span className="absolute left-4 text-[14px] font-semibold text-[#3F3F47]">₹</span>
                                                <input type="text" placeholder="4000" value={tier.price} onChange={(e) => p.updateGuestTier(i, 'price', e.target.value.replace(/[^0-9]/g, ''))} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-3.5 pl-9 pr-10 text-[14px] font-semibold text-[#3F3F47] focus:outline-none" />
                                                <button className="absolute right-3 text-[#71717B]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={p.addGuestTierOption} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-3 bg-white text-[#3F3F47] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-gray-50"><PlusCircle size={16} /> Add Guest Range</button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Last Minute Change Charges */}
            <div className="mt-8">
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] mb-3">Last Minute Charges</p>
                <label className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4 cursor-pointer block text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto"><Upload size={20} className="text-[#3F3F47]" /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mb-1">Upload your last-minute change policy</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={p.onLastMinuteUpload}
                    />
                </label>
                
                {p.lastMinuteFiles && p.lastMinuteFiles.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {p.lastMinuteFiles.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-[8px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white"><FileText size={16} className="text-[#3F3F47]" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} _ Uploaded</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => p.removeLastMinuteFile(idx)} className="text-[#3F3F47] hover:text-[#030303]"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Policies & Documents */}
            <div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] mb-3">Policies & Documents</p>
                <label className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4 cursor-pointer block text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto"><Upload size={20} className="text-[#3F3F47]" /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={p.onPolicyUpload}
                    />
                </label>
                {p.policyFiles && p.policyFiles.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {p.policyFiles.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-[8px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white"><FileText size={16} className="text-[#3F3F47]" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} _ Uploaded</p>
                                    </div>
                                </div>
                                <button onClick={() => p.removePolicyFile(idx)} className="text-[#3F3F47] hover:text-[#030303]"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
