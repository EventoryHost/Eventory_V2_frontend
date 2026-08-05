'use client';
import React, { useState } from 'react';
import { ChevronDown, Check, PlusCircle, Plus, Info, RefreshCw, Upload, FileText, X } from 'lucide-react';
import { GuestTier, PolicyFile, formatFileSize } from '../../shared/types';
import PolicyBottomSheet from '../pav/PolicyBottomSheet';

interface Props {
    packageChargeType: string; setPackageChargeType: (v: string) => void;
    packagePrice: string; setPackagePrice: (v: string) => void;
    
    teamEquipmentChargeType: string; setTeamEquipmentChargeType: (v: string) => void;
    teamEquipmentPrice: string; setTeamEquipmentPrice: (v: string) => void;
    
    overtimePrice: string; setOvertimePrice: (v: string) => void;
    isGstInclusive: boolean; setIsGstInclusive: (v: boolean) => void;

    gstInclusive: boolean;
    setGstInclusive: (v: boolean) => void;
    gstRatePercent: string;
    setGstRatePercent: (v: string) => void;
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

    guestTiers: GuestTier[]; addGuestTierOption: () => void; updateGuestTier: (i: number, f: 'range' | 'price', v: string) => void; removeGuestTier: (i: number) => void;

    cancellationDocs: PolicyFile[]; setCancellationDocs: (docs: PolicyFile[]) => void;
    lastMinuteDocs: PolicyFile[]; setLastMinuteDocs: (docs: PolicyFile[]) => void;
    policyDocs: PolicyFile[]; setPolicyDocs: (docs: PolicyFile[]) => void;
    djItems: any[];
    addons: any[];
}

export default function DJStep3PricingAndPolicies(p: Props) {
    const [activePolicySheet, setActivePolicySheet] = useState<'cancellation' | 'lastMinute' | 'general' | null>(null);

    // Helper to extract numeric value
    const getBasePrice = () => parseFloat(p.packagePrice) || 0;

    return (
        <div className="flex flex-col gap-6 w-full pb-32">
            
            {/* Consolidated Pricing Container */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col">
                
                {/* Package Pricing */}
                <div className="flex flex-col gap-4">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">Package Pricing <span className="text-red-500">*</span></h3>
                    
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-[500] text-[#3F3F47] leading-[20px] tracking-[0px] pl-1">How do you charge?</label>
                        <div className="flex p-1 bg-[#F4F4F5] rounded-[12px] relative">
                            <button 
                                type="button"
                                onClick={() => p.setPackageChargeType('Per Performance')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${p.packageChargeType === 'Per Performance' ? 'text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Event
                            </button>
                            <button 
                                type="button"
                                onClick={() => p.setPackageChargeType('Per Hour')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${p.packageChargeType === 'Per Hour' ? 'text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Hour
                            </button>
                            <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm border border-[#E4E4E7] rounded-[10px] transition-transform duration-300 ease-in-out" style={{ transform: p.packageChargeType === 'Per Performance' ? 'translateX(0)' : 'translateX(100%)' }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-[500] text-[#3F3F47] leading-[20px] tracking-[0px] pl-1">Price</label>
                        <div className="flex border border-[#E4E4E7] rounded-[8px] overflow-hidden focus-within:border-gray-400 transition-colors">
                            <div className="flex items-center justify-center bg-[#F4F4F5] px-5 border-r border-[#E4E4E7]">
                                <span className="text-[#3F3F47] text-[15px] font-medium">₹</span>
                            </div>
                            <input 
                                type="number" 
                                min="0" step="any"
                                placeholder="5000" 
                                value={p.packagePrice} 
                                onChange={(e) => p.setPackagePrice(e.target.value)} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="flex-1 w-full min-w-0 p-4 bg-white text-[15px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]" 
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full border-t border-dashed border-[#E4E4E7] my-6"></div>

                {/* Team & Equipment Charges */}
                <div className="flex flex-col gap-4">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">Team & Equipment Charges <span className="text-red-500">*</span></h3>
                    
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-[500] text-[#3F3F47] leading-[20px] tracking-[0px] pl-1">How do you charge?</label>
                        <div className="flex p-1 bg-[#F4F4F5] rounded-[12px] relative">
                            <button 
                                type="button"
                                onClick={() => p.setTeamEquipmentChargeType('Per Performance')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${p.teamEquipmentChargeType === 'Per Performance' ? 'text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Event
                            </button>
                            <button 
                                type="button"
                                onClick={() => p.setTeamEquipmentChargeType('Per Hour')}
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${p.teamEquipmentChargeType === 'Per Hour' ? 'text-[#030303]' : 'text-[#71717B]'}`}
                            >
                                Per Hour
                            </button>
                            <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm border border-[#E4E4E7] rounded-[10px] transition-transform duration-300 ease-in-out" style={{ transform: p.teamEquipmentChargeType === 'Per Performance' ? 'translateX(0)' : 'translateX(100%)' }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-[500] text-[#3F3F47] leading-[20px] tracking-[0px] pl-1">Price</label>
                        <div className="flex border border-[#E4E4E7] rounded-[8px] overflow-hidden focus-within:border-gray-400 transition-colors">
                            <div className="flex items-center justify-center bg-[#F4F4F5] px-5 border-r border-[#E4E4E7]">
                                <span className="text-[#3F3F47] text-[15px] font-medium">₹</span>
                            </div>
                            <input 
                                type="number" 
                                min="0" step="any"
                                placeholder="3000" 
                                value={p.teamEquipmentPrice} 
                                onChange={(e) => p.setTeamEquipmentPrice(e.target.value)} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="flex-1 w-full min-w-0 p-4 bg-white text-[15px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]" 
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full border-t border-dashed border-[#E4E4E7] my-6"></div>

                {/* Overtime Rate */}
                <div className="flex flex-col gap-4">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">Overtime Charges <span className="text-red-500">*</span></h3>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-[500] text-[#3F3F47] leading-[20px] tracking-[0px] pl-1">Price Per Hour</label>
                        <div className="flex border border-[#E4E4E7] rounded-[8px] overflow-hidden focus-within:border-gray-400 transition-colors">
                            <div className="flex items-center justify-center bg-[#F4F4F5] px-5 border-r border-[#E4E4E7]">
                                <span className="text-[#3F3F47] text-[15px] font-medium">₹</span>
                            </div>
                            <input 
                                type="number" 
                                min="0" step="any"
                                placeholder="3000" 
                                value={p.overtimePrice} 
                                onChange={(e) => p.setOvertimePrice(e.target.value)} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="flex-1 w-full min-w-0 p-4 bg-white text-[15px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]" 
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full border-t border-dashed border-[#E4E4E7] my-6"></div>
                
                {/* GST Inclusive */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col max-w-[65%]">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">GST Inclusive</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-0.5 leading-tight">Is GST already included in the prices you entered?</span>
                    </div>
                    <div className="flex bg-[#E4E4E7] rounded-full p-1 border border-[#D4D4D8]">
                        <button type="button" onClick={() => p.setIsGstInclusive(false)} className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-colors ${!p.isGstInclusive ? 'bg-white text-[#030303] shadow-sm' : 'text-[#71717B]'}`}>No</button>
                        <button type="button" onClick={() => p.setIsGstInclusive(true)} className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-colors ${p.isGstInclusive ? 'bg-white text-[#030303] shadow-sm' : 'text-[#71717B]'}`}>Yes</button>
                    </div>
                </div>
            </div>

                            <div className="pt-2 mb-6">
                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-3">
                        GST Charges <span className="text-red-500">*</span>
                    </h4>
                    
                    

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">GST Inclusive</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] mt-0.5">Is GST already included in the prices<br/>you entered?</p>
                        </div>
                        <div className="bg-[#E4E4E7] rounded-full p-1 flex items-center w-[96px] relative h-9 cursor-pointer" onClick={() => p.setGstInclusive(!p.gstInclusive)}>
                            <div className={`absolute top-1 bottom-1 w-[44px] bg-white rounded-full transition-transform shadow-sm ${p.gstInclusive ? 'translate-x-[42px]' : 'translate-x-0'}`} />
                            <div className="flex-1 flex items-center justify-center relative z-10 text-[12px] font-bold text-[#71717B] transition-colors">
                                No
                            </div>
                            <div className={`flex-1 flex items-center justify-center relative z-10 text-[12px] font-bold transition-colors ${p.gstInclusive ? 'text-[#030303]' : 'text-[#71717B]'}`}>
                                Yes
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
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">{f}</span>
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
                                    <div className="mt-1 p-5 bg-[#F8F9FA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]/60">
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

            {/* ── Policies and other documents ── */}
            <div className="flex flex-col gap-3">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">
                    Policies and other documents <span className="text-red-500">*</span>
                </span>

                {/* Cancellation Policy row */}
                {p.cancellationDocs.length === 0 ? (
                    <button onClick={() => setActivePolicySheet('cancellation')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-left hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">Cancellation Policy</span>
                            <span className="text-[12px] text-[#9F9FA9]">Tap to add policy</span>
                        </div>
                        <Plus size={18} className="text-[#9F9FA9] shrink-0" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {p.cancellationDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px]">
                                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1.5 6L6 10.5L14.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mb-0.5 block">Cancellation Policy</span>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#666666] truncate block">{doc.name}</span>
                                </div>
                                <button onClick={() => setActivePolicySheet('cancellation')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-1.5 text-[13px] font-bold text-[#3F3F47] hover:text-[#030303] transition-colors shrink-0">Update <RefreshCw size={14} /></button>
                                <button onClick={() => {
                                    const newDocs = [...p.cancellationDocs];
                                    newDocs.splice(idx, 1);
                                    p.setCancellationDocs(newDocs);
                                }} className="text-[#9F9FA9] hover:text-red-500 ml-1 shrink-0 transition-colors"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Last Minute Charges row */}
                {p.lastMinuteDocs.length === 0 ? (
                    <button onClick={() => setActivePolicySheet('lastMinute')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-left hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-orange-500 shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">Last Minute Charges</span>
                            <span className="text-[12px] text-[#9F9FA9]">Tap to add policy</span>
                        </div>
                        <Plus size={18} className="text-[#9F9FA9] shrink-0" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {p.lastMinuteDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px]">
                                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1.5 6L6 10.5L14.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mb-0.5 block">Last Minute Charges</span>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#666666] truncate block">{doc.name}</span>
                                </div>
                                <button onClick={() => setActivePolicySheet('lastMinute')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-1.5 text-[13px] font-bold text-[#3F3F47] hover:text-[#030303] transition-colors shrink-0">Update <RefreshCw size={14} /></button>
                                <button onClick={() => {
                                    const newDocs = [...p.lastMinuteDocs];
                                    newDocs.splice(idx, 1);
                                    p.setLastMinuteDocs(newDocs);
                                }} className="text-[#9F9FA9] hover:text-red-500 ml-1 shrink-0 transition-colors"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* General Policy row */}
                {p.policyDocs.length === 0 ? (
                    <button onClick={() => setActivePolicySheet('general')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-left hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-orange-500 shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[16px] font-[600] text-[#030303] leading-[24px] tracking-[0px]">General Policy</span>
                            <span className="text-[12px] text-[#9F9FA9]">Tap to add policy</span>
                        </div>
                        <Plus size={18} className="text-[#9F9FA9] shrink-0" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {p.policyDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px]">
                                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1.5 6L6 10.5L14.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mb-0.5 block">General Policy</span>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#666666] truncate block">{doc.name}</span>
                                </div>
                                <button onClick={() => setActivePolicySheet('general')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-1.5 text-[13px] font-bold text-[#3F3F47] hover:text-[#030303] transition-colors shrink-0">Update <RefreshCw size={14} /></button>
                                <button onClick={() => {
                                    const newDocs = [...p.policyDocs];
                                    newDocs.splice(idx, 1);
                                    p.setPolicyDocs(newDocs);
                                }} className="text-[#9F9FA9] hover:text-red-500 ml-1 shrink-0 transition-colors"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add button */}
                <button style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center justify-center gap-2 w-full py-4 bg-[#F4F4F5] rounded-[12px] text-[15px] font-bold text-[#030303] hover:bg-[#E4E4E7] transition-colors">
                    Add
                    <div className="w-6 h-6 rounded-full border-2 border-[#030303] flex items-center justify-center">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                </button>
            </div>

            {/* ── Pricing Summary ── */}
            <div className="rounded-[20px] overflow-hidden border border-[#E4E4E7]">
                {/* Header */}
                <div className="bg-[#04222D] px-5 py-4 flex items-center justify-between">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-white">Pricing summary</span>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#04222D] bg-[#A8C5B5] px-3 py-1 rounded-full">
                        {p.djItems.length} item{p.djItems.length !== 1 ? 's' : ''} {p.addons.length > 0 ? `+ ${p.addons.length} add-on${p.addons.length !== 1 ? 's' : ''}` : ''}
                    </span>
                </div>
                {/* Body */}
                <div className="bg-[#0A2E3B] p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-white">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px]">Package amount</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold">₹{new Intl.NumberFormat('en-IN').format(parseFloat(p.packagePrice) || 0)}</span>
                    </div>
                    {p.teamEquipmentPrice && (
                        <div className="flex justify-between items-center text-[#9F9FA9]">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px]">Team & Equipment</span>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px]">₹{new Intl.NumberFormat('en-IN').format(parseFloat(p.teamEquipmentPrice) || 0)}</span>
                        </div>
                    )}
                    {p.overtimePrice && (
                        <div className="flex justify-between items-center text-[#9F9FA9]">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px]">Overtime per hour</span>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px]">₹{new Intl.NumberFormat('en-IN').format(parseFloat(p.overtimePrice) || 0)}</span>
                        </div>
                    )}
                </div>
            </div>

            <PolicyBottomSheet 
                isOpen={activePolicySheet !== null} 
                onClose={() => setActivePolicySheet(null)}
                title={activePolicySheet === 'cancellation' ? 'Cancellation Policy' : activePolicySheet === 'lastMinute' ? 'Last Minute Charges' : 'General Policy'}
                subtitle="Add your policy details here."
                initialDocs={activePolicySheet === 'cancellation' ? p.cancellationDocs : activePolicySheet === 'lastMinute' ? p.lastMinuteDocs : p.policyDocs}
                onSaveDocs={(docs) => {
                    if (activePolicySheet === 'cancellation') p.setCancellationDocs(docs);
                    else if (activePolicySheet === 'lastMinute') p.setLastMinuteDocs(docs);
                    else if (activePolicySheet === 'general') p.setPolicyDocs(docs);
                    setActivePolicySheet(null);
                }}
            />
        </div>
    );
}
