'use client';

import React from 'react';
import { Upload, X, FileText, Check, Plus, ChevronDown, Info, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';
import PolicyBottomSheet from '../pav/PolicyBottomSheet';
import { PolicyFile, formatFileSize, GuestTier } from '../../shared/types';
import CustomDateRangePicker from '../../components/CustomDateRangePicker';

interface Props {
    teamEquipmentPrice: string;
    setTeamEquipmentPrice: (v: string) => void;
    teamEquipmentUnit: string;
    setTeamEquipmentUnit: (v: string) => void;

    isDynamicPricingEnabled: boolean;
    setIsDynamicPricingEnabled: (v: boolean) => void;
    weekendPricing: boolean;
    setWeekendPricing: (v: boolean) => void;
    weekendIncreaseType: string;
    setWeekendIncreaseType: (v: string) => void;
    weekendValue: string;
    setWeekendValue: (v: string) => void;

    weekendSeason: boolean;
    setWeekendSeason: (v: boolean) => void;
    seasonIncreaseType: string;
    setSeasonIncreaseType: (v: string) => void;
    seasonValue: string;
    setSeasonValue: (v: string) => void;

    festivalPricing: boolean;
    setFestivalPricing: (v: boolean) => void;
    selectedFestivals: string[];
    setSelectedFestivals: React.Dispatch<React.SetStateAction<string[]>>;
    availableFestivals: string[];
    isAddingFestival: boolean;
    setIsAddingFestival: (v: boolean) => void;
    newFestivalName: string;
    setNewFestivalName: (v: string) => void;
    handleAddFestival: () => void;
    festivalPrices: Record<string, { increaseType: string; value: string }>;
    setFestivalPrices: React.Dispatch<React.SetStateAction<Record<string, { increaseType: string; value: string }>>>;

    customDatesPricing: boolean;
    setCustomDatesPricing: (v: boolean) => void;
    customDatesIncreaseType: string;
    setCustomDatesIncreaseType: (v: string) => void;
    customDatesValue: string;
    setCustomDatesValue: (v: string) => void;
    customDatesStartDate: string;
    setCustomDatesStartDate: (v: string) => void;
    customDatesEndDate: string; setCustomDatesEndDate: (v: string) => void;
    guestTiers: GuestTier[]; addGuestTierOption: () => void;
    updateGuestTier: (i: number, f: 'range' | 'price', v: string) => void;
    removeGuestTier: (i: number) => void;
    cancellationDocs: PolicyFile[]; setCancellationDocs: React.Dispatch<React.SetStateAction<PolicyFile[]>>;
    lastMinuteDocs: PolicyFile[];
    setLastMinuteDocs: React.Dispatch<React.SetStateAction<PolicyFile[]>>;
    policyDocs: PolicyFile[];
    setPolicyDocs: React.Dispatch<React.SetStateAction<PolicyFile[]>>;

    setups?: any[];
    addons?: any[];
}

const CARD_STYLE = {
    borderRadius: '16px',
    border: '0.5px solid #E4E4E7',
    background: '#FFF'
};

export default function DecoratorStep3PoliciesAndCharges({
    teamEquipmentPrice,
    setTeamEquipmentPrice,
    teamEquipmentUnit,
    setTeamEquipmentUnit,

    isDynamicPricingEnabled,
    setIsDynamicPricingEnabled,
    weekendPricing,
    setWeekendPricing,
    weekendIncreaseType,
    setWeekendIncreaseType,
    weekendValue,
    setWeekendValue,

    weekendSeason,
    setWeekendSeason,
    seasonIncreaseType,
    setSeasonIncreaseType,
    seasonValue,
    setSeasonValue,

    festivalPricing,
    setFestivalPricing,
    selectedFestivals,
    setSelectedFestivals,
    availableFestivals,
    isAddingFestival,
    setIsAddingFestival,
    newFestivalName,
    setNewFestivalName,
    handleAddFestival,
    festivalPrices,
    setFestivalPrices,

    customDatesPricing,
    setCustomDatesPricing,
    customDatesIncreaseType, setCustomDatesIncreaseType,
    customDatesValue, setCustomDatesValue,
    customDatesStartDate, setCustomDatesStartDate,
    customDatesEndDate, setCustomDatesEndDate,
    guestTiers, addGuestTierOption, updateGuestTier, removeGuestTier,
    cancellationDocs, setCancellationDocs,
    lastMinuteDocs,
    setLastMinuteDocs,
    policyDocs,
    setPolicyDocs,

    setups = [],
    addons = []
}: Props) {
    const [activePolicySheet, setActivePolicySheet] = React.useState<'cancellation' | 'lastMinute' | 'general' | null>(null);
    const [showAddonsInSummary, setShowAddonsInSummary] = React.useState(true);

    return (
        <div className="flex flex-col gap-6 w-full mt-4 pb-32">
            
            {/* 1. Team & Equipment Charges Card */}
            <div className="p-6 flex flex-col gap-5 bg-white border border-[#E4E4E7] rounded-[16px] shadow-sm">
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Team & Equipment Charges <span className="text-red-500">*</span></h3>
                
                <div className="flex flex-col gap-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#71717B]">How do you charge?</span>
                    <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[16px] p-1 flex w-full select-none relative h-[48px]">
                        <div 
                            onClick={() => setTeamEquipmentUnit('Per package')}
                            className={`flex-1 flex items-center justify-center font-bold text-[14px] cursor-pointer rounded-[12px] transition-all ${
                                teamEquipmentUnit.toLowerCase() === 'per package' 
                                    ? 'bg-white shadow-sm text-gray-900 border border-[#E4E4E7]' 
                                    : 'text-[#71717B]'
                            }`}
                        >
                            Per Package
                        </div>
                        <div 
                            onClick={() => setTeamEquipmentUnit('Per hour')}
                            className={`flex-1 flex items-center justify-center font-bold text-[14px] cursor-pointer rounded-[12px] transition-all ${
                                teamEquipmentUnit.toLowerCase() === 'per hour' 
                                    ? 'bg-white shadow-sm text-gray-900 border border-[#E4E4E7]' 
                                    : 'text-[#71717B]'
                            }`}
                        >
                            Per Hour
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-bold text-[#71717B] mb-2">Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#71717B]">Rs.</span>
                        <input 
                            type="text" 
                            placeholder="3,000" 
                            value={teamEquipmentPrice ? new Intl.NumberFormat('en-IN').format(parseFloat(teamEquipmentPrice)) : ''} 
                            onChange={(e) => setTeamEquipmentPrice(e.target.value.replace(/[^0-9]/g, ''))} 
                            style={{ fontFamily: 'Figtree, sans-serif' }} 
                            className="w-full p-4 pl-12 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[16px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]" 
                        />
                    </div>
                </div>
            </div>

            {/* 2. Dynamic Pricing (Optional) Card */}
            <div className="p-6 flex flex-col bg-white border border-[#E4E4E7] rounded-[16px] shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mt-0.5">Adjust your price by season, dates, or guest count</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsDynamicPricingEnabled(!isDynamicPricingEnabled)} 
                        className={`w-12 h-6 flex items-center rounded-full transition-colors px-1 ${isDynamicPricingEnabled ? 'bg-[#04222D]' : 'bg-[#E4E4E7]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {isDynamicPricingEnabled && (() => {
                    const basePrice = parseFloat(teamEquipmentPrice) || 3000;

                    // Weekend Calculation
                    let weekendInputVal = weekendValue;
                    if (weekendIncreaseType === 'Percentage') {
                        const pct = parseFloat(weekendValue) || 0;
                        weekendInputVal = String(Math.round(basePrice + basePrice * (pct / 100)));
                    }

                    // Season Calculation
                    let seasonInputVal = seasonValue;
                    if (seasonIncreaseType === 'Percentage') {
                        const pct = parseFloat(seasonValue) || 0;
                        seasonInputVal = String(Math.round(basePrice + basePrice * (pct / 100)));
                    }

                    // Custom Dates Calculation
                    let customDatesInputVal = customDatesValue;
                    if (customDatesIncreaseType === 'Percentage') {
                        const pct = parseFloat(customDatesValue) || 0;
                        customDatesInputVal = String(Math.round(basePrice + basePrice * (pct / 100)));
                    }

                    return (
                        <div className="flex flex-col gap-6 mt-6 border-t border-[#E4E4E7] pt-6 animate-in fade-in duration-200">
                            
                            <div className="flex flex-col gap-1">
                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Date Based Rules</h4>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] font-medium">
                                    Adjust your package pricing for wedding seasons, festivals, weekends, or custom event dates.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                
                                {/* Weekends Checkbox */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            onClick={() => setWeekendPricing(!weekendPricing)} 
                                            className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                weekendPricing ? 'bg-[#04222D]' : 'border-2 border-[#D4D4D8] bg-white'
                                            }`}
                                        >
                                            {weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Weekends</span>
                                    </div>

                                    {weekendPricing && (
                                        <div className="ml-8 p-5 bg-[#FAFAFA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]">
                                            <div className="flex flex-col gap-1.5">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                <div className="w-[140px] bg-white border border-[#E4E4E7] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                    <input
                                                        type="text"
                                                        value={weekendInputVal ? new Intl.NumberFormat('en-IN').format(parseFloat(weekendInputVal)) : ''}
                                                        onChange={(e) => {
                                                            setWeekendIncreaseType('Fixed Price');
                                                            setWeekendValue(e.target.value.replace(/[^0-9]/g, ''));
                                                        }}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full bg-transparent text-[14px] font-bold text-[#030303] focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9]">Quick Add</span>
                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setWeekendIncreaseType('Percentage'); setWeekendValue('10'); }}
                                                        className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${weekendIncreaseType === 'Percentage' && weekendValue === '10' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                    >
                                                        + 10 %
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setWeekendIncreaseType('Percentage'); setWeekendValue('20'); }}
                                                        className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${weekendIncreaseType === 'Percentage' && weekendValue === '20' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                    >
                                                        + 20 %
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Wedding Season Checkbox */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            onClick={() => setWeekendSeason(!weekendSeason)} 
                                            className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                weekendSeason ? 'bg-[#04222D]' : 'border-2 border-[#D4D4D8] bg-white'
                                            }`}
                                        >
                                            {weekendSeason && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Wedding Season</span>
                                    </div>

                                    {weekendSeason && (
                                        <div className="ml-8 p-5 bg-[#FAFAFA] rounded-[16px] flex flex-col gap-4 border border-[#E4E4E7]">
                                            <div className="flex flex-col gap-1.5">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                <div className="w-[140px] bg-white border border-[#E4E4E7] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                    <input
                                                        type="text"
                                                        value={seasonInputVal ? new Intl.NumberFormat('en-IN').format(parseFloat(seasonInputVal)) : ''}
                                                        onChange={(e) => {
                                                            setSeasonIncreaseType('Fixed Price');
                                                            setSeasonValue(e.target.value.replace(/[^0-9]/g, ''));
                                                        }}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full bg-transparent text-[14px] font-bold text-[#030303] focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9]">Quick Add</span>
                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setSeasonIncreaseType('Percentage'); setSeasonValue('10'); }}
                                                        className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${seasonIncreaseType === 'Percentage' && seasonValue === '10' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                    >
                                                        + 10 %
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setSeasonIncreaseType('Percentage'); setSeasonValue('20'); }}
                                                        className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${seasonIncreaseType === 'Percentage' && seasonValue === '20' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                    >
                                                        + 20 %
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Festivals Checkbox */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            onClick={() => setFestivalPricing(!festivalPricing)} 
                                            className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                festivalPricing ? 'bg-[#04222D]' : 'border-2 border-[#D4D4D8] bg-white'
                                            }`}
                                        >
                                            {festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Festivals</span>
                                    </div>

                                    {festivalPricing && (
                                        <div className="ml-8 p-5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[16px] flex flex-col gap-4">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] block">Select Festivals</span>
                                            <div className="flex flex-wrap items-center gap-3">
                                                {availableFestivals.map(f => (
                                                    <button 
                                                        key={f} 
                                                        type="button"
                                                        onClick={() => setSelectedFestivals(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} 
                                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                        className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                                                            selectedFestivals.includes(f) 
                                                                ? 'bg-[#04222D] border-[#04222D] text-white shadow-sm' 
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
                                                        <button type="button" onClick={handleAddFestival} className="p-2 bg-[#04222D] text-white rounded-full">
                                                            <Check size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsAddingFestival(true)} 
                                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                        className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-dashed border-[#E4E4E7] bg-white hover:border-gray-400"
                                                    >
                                                        + Add New
                                                    </button>
                                                )}
                                            </div>
                                            {selectedFestivals.length > 0 && (
                                                <div className="mt-4 flex flex-col gap-4 border-t border-[#E4E4E7] pt-4 w-full">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] block">Configure Prices for Selected Festivals</span>
                                                    <div className="flex flex-col gap-3">
                                                        {selectedFestivals.map(f => {
                                                            const spec = festivalPrices[f] || { increaseType: 'Percentage', value: '10' };
                                                            
                                                            let fInputVal = spec.value;
                                                            if (spec.increaseType === 'Percentage') {
                                                                const pct = parseFloat(spec.value) || 0;
                                                                fInputVal = String(Math.round(basePrice + basePrice * (pct / 100)));
                                                            }

                                                            return (
                                                                <div key={f} className="p-4 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">{f}</span>
                                                                    </div>

                                                                    <div className="flex flex-col gap-1.5">
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                                        <div className="w-[140px] bg-white border border-[#E4E4E7] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                                            <input
                                                                                type="text"
                                                                                value={fInputVal ? new Intl.NumberFormat('en-IN').format(parseFloat(fInputVal)) : ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                                                    setFestivalPrices(prev => ({
                                                                                        ...prev,
                                                                                        [f]: { increaseType: 'Fixed Price', value: val }
                                                                                    }));
                                                                                }}
                                                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                                                className="w-full bg-transparent text-[14px] font-bold text-[#030303] focus:outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col gap-2">
                                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9]">Quick Add</span>
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
                                                                                className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${
                                                                                    spec.increaseType === 'Percentage' && spec.value === '10'
                                                                                        ? 'bg-[#04222D] text-white border-[#04222D]'
                                                                                        : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'
                                                                                }`}
                                                                            >
                                                                                + 10 %
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
                                                                                className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${
                                                                                    spec.increaseType === 'Percentage' && spec.value === '20'
                                                                                        ? 'bg-[#04222D] text-white border-[#04222D]'
                                                                                        : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'
                                                                                }`}
                                                                            >
                                                                                + 20 %
                                                                            </button>
                                                                        </div>
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
                                            onClick={() => setCustomDatesPricing(!customDatesPricing)} 
                                            className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                customDatesPricing ? 'bg-[#04222D]' : 'border-2 border-[#D4D4D8] bg-white'
                                            }`}
                                        >
                                            {customDatesPricing && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Custom Dates</span>
                                    </div>

                                        {customDatesPricing && (
                                            <div className="mt-1 p-4 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] flex flex-col gap-5">
                                                <div className="flex flex-col gap-3">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303]">Choose Date</span>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#9F9FA9]">Start</span>
                                                            <div className="relative">
                                                                <input 
                                                                    type="date" 
                                                                    value={customDatesStartDate} 
                                                                    onChange={(e) => setCustomDatesStartDate(e.target.value)} 
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
                                                                    value={customDatesEndDate} 
                                                                    onChange={(e) => setCustomDatesEndDate(e.target.value)} 
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
                                                            onClick={() => { setCustomDatesIncreaseType('Percentage'); setCustomDatesValue('10'); }}
                                                            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${customDatesIncreaseType === 'Percentage' && customDatesValue === '10' ? 'bg-transparent text-[#030303] border-[#030303]' : 'bg-transparent text-[#9F9FA9] border-[#D4D4D8] hover:border-gray-400'}`}
                                                        >
                                                            + 10 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setCustomDatesIncreaseType('Percentage'); setCustomDatesValue('20'); }}
                                                            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${customDatesIncreaseType === 'Percentage' && customDatesValue === '20' ? 'bg-transparent text-[#030303] border-[#030303]' : 'bg-transparent text-[#9F9FA9] border-[#D4D4D8] hover:border-gray-400'}`}
                                                        >
                                                            + 20 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setCustomDatesIncreaseType('Percentage'); setCustomDatesValue(''); }}
                                                            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${customDatesIncreaseType === 'Percentage' && customDatesValue !== '10' && customDatesValue !== '20' ? 'bg-transparent text-[#030303] border-[#030303]' : 'bg-transparent text-[#9F9FA9] border-[#D4D4D8] hover:border-gray-400'}`}
                                                        >
                                                            Custom
                                                        </button>
                                                    </div>
                                                    
                                                    {customDatesIncreaseType === 'Percentage' && customDatesValue !== '10' && customDatesValue !== '20' && (
                                                        <div className="flex items-center justify-between w-full mt-1 bg-white border border-[#D4D4D8] rounded-[8px] p-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#9F9FA9]">Custom percentage</span>
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="0"
                                                                    value={customDatesValue}
                                                                    onChange={(e) => setCustomDatesValue(e.target.value.replace(/[^0-9]/g, ''))}
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
                                                        {(() => {
                                                            const base = parseFloat(teamEquipmentPrice) || 3000;
                                                            let incAmt = 0;
                                                            let pct = 0;
                                                            if (customDatesIncreaseType === 'Percentage') {
                                                                pct = parseFloat(customDatesValue) || 0;
                                                                incAmt = base * (pct / 100);
                                                            } else {
                                                                const val = parseFloat(customDatesValue) || 0;
                                                                incAmt = Math.max(0, val - base);
                                                                pct = base > 0 ? Math.round((incAmt / base) * 100) : 0;
                                                            }
                                                            return `Weekday price: ₹${new Intl.NumberFormat('en-IN').format(base)}. You're charging ₹${new Intl.NumberFormat('en-IN').format(incAmt)} more (+${pct}%)`;
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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

                                        {guestTiers.map((tier, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <select 
                                                        value={tier.range} 
                                                        onChange={(e) => updateGuestTier(i, 'range', e.target.value)} 
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
                                                        onChange={(e) => updateGuestTier(i, 'price', e.target.value.replace(/[^0-9]/g, ''))} 
                                                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                                                        className="w-full p-3 pl-8 bg-white border border-[#E4E4E7] rounded-[12px] text-[14px] font-medium text-[#030303] focus:outline-none focus:border-[#04222D]" 
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeGuestTier(i)}
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
                                            onClick={addGuestTierOption}
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

            {/* 3. Policies and other documents Card */}
            <div className="p-6 flex flex-col gap-4 bg-white border border-[#E4E4E7] rounded-[16px] shadow-sm">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">
                    Policies and other documents <span className="text-red-500">*</span>
                </span>

                {/* Cancellation Policy row */}
                {cancellationDocs.length === 0 ? (
                    <button onClick={() => setActivePolicySheet('cancellation')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-left hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[14px] font-bold text-[#030303]">Cancellation Policy</span>
                            <span className="text-[12px] text-[#9F9FA9]">Tap to add policy</span>
                        </div>
                        <Plus size={18} className="text-[#9F9FA9] shrink-0" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {cancellationDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px]">
                                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1.5 6L6 10.5L14.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="flex-1 min-w-0"><span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mb-0.5 block">Cancellation Policy</span><span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#666666] truncate block">{doc.name}</span></div>
                                <button onClick={() => setActivePolicySheet('cancellation')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-1.5 text-[13px] font-bold text-[#3F3F47] hover:text-[#030303] transition-colors shrink-0">Update <RefreshCw size={14} /></button>
                                <button onClick={() => {
                                    const newDocs = [...cancellationDocs];
                                    newDocs.splice(idx, 1);
                                    setCancellationDocs(newDocs);
                                }} className="text-[#9F9FA9] hover:text-red-500 ml-1 shrink-0 transition-colors"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Last Minute Charges row */}
                {lastMinuteDocs.length === 0 ? (
                    <button onClick={() => setActivePolicySheet('lastMinute')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-left hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-orange-500 shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[14px] font-bold text-[#030303]">Last Minute Charges</span>
                            <span className="text-[12px] text-[#9F9FA9]">Tap to add policy</span>
                        </div>
                        <Plus size={18} className="text-[#9F9FA9] shrink-0" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {lastMinuteDocs.map((doc, idx) => (
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
                                    const newDocs = [...lastMinuteDocs];
                                    newDocs.splice(idx, 1);
                                    setLastMinuteDocs(newDocs);
                                }} className="text-[#9F9FA9] hover:text-red-500 ml-1 shrink-0 transition-colors"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* General Policy row */}
                {policyDocs.length === 0 ? (
                    <button onClick={() => setActivePolicySheet('general')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[12px] text-left hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-orange-500 shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[14px] font-bold text-[#030303]">General Policy</span>
                            <span className="text-[12px] text-[#9F9FA9]">Tap to add policy</span>
                        </div>
                        <Plus size={18} className="text-[#9F9FA9] shrink-0" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {policyDocs.map((doc, idx) => (
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
                                    const newDocs = [...policyDocs];
                                    newDocs.splice(idx, 1);
                                    setPolicyDocs(newDocs);
                                }} className="text-[#9F9FA9] hover:text-red-500 ml-1 shrink-0 transition-colors"><X size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Button */}
                <button onClick={() => setActivePolicySheet('general')} style={{ fontFamily: 'Figtree, sans-serif' }} className="flex items-center justify-center gap-2 w-full py-4 bg-[#F4F4F5] rounded-[12px] text-[15px] font-bold text-[#030303] hover:bg-[#E4E4E7] transition-colors mt-2">
                    Add
                    <div className="w-6 h-6 rounded-full border-2 border-[#030303] flex items-center justify-center">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                </button>
            </div>

            {/* 4. Pricing Summary Card */}
            <div className="rounded-[20px] overflow-hidden border border-[#E4E4E7]">
                <div className="bg-[#04222D] px-5 py-4 flex items-center justify-between">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-white">Pricing summary</span>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#04222D] bg-[#A8C5B5] px-3 py-1 rounded-full">
                        {setups.length} item{setups.length !== 1 ? 's' : ''} {addons.length > 0 ? `+ ${addons.length} add-on${addons.length !== 1 ? 's' : ''}` : ''}
                    </span>
                </div>

                <div className="bg-white px-5 py-5 flex flex-col gap-5">
                    {/* Setups Breakdown */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Setups</span>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">{setups.length} item{setups.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {setups.length > 0 ? (
                                setups.map((s, idx) => (
                                    <div key={s.id || idx} className="flex items-center justify-between">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47]">• {s.title || s.name || `Setup ${idx + 1}`}<span className="text-red-500">*</span></span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#030303]">
                                            ₹{Number(s.pricing?.basePrice || s.price || 0).toLocaleString('en-IN')} <span className="text-[#9F9FA9] font-normal text-[11px]">flat</span>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-[13px] text-[#9F9FA9] italic">No setups added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Add-ons Breakdown */}
                    {addons.length > 0 && (
                        <>
                            <div className="border-t border-[#F4F4F5]" />
                            <div className="flex flex-col gap-3">
                                <button onClick={() => setShowAddonsInSummary(v => !v)} className="flex items-center justify-between w-full">
                                    <div className="flex flex-col items-start">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Add-ons</span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9]">Optional – customer would have to add, priced separately</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">{addons.length} item{addons.length !== 1 ? 's' : ''}</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-[#9F9FA9] transition-transform ${showAddonsInSummary ? 'rotate-180' : ''}`}><path d="M18 15l-6-6-6 6" /></svg>
                                    </div>
                                </button>
                                {showAddonsInSummary && (
                                    <div className="flex flex-col gap-2">
                                        {addons.map(addon => (
                                            <div key={addon.id} className="flex items-center justify-between">
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47]">• {addon.name}</span>
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#030303]">₹{Number(addon.price || 0).toLocaleString('en-IN')} <span className="text-[#9F9FA9] font-normal text-[11px]">{addon.billingUnit?.toLowerCase() || 'flat'}</span></span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Footnotes */}
                    <div className="border-t border-[#F4F4F5] pt-3 flex flex-col gap-2">
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] flex gap-2">
                            <Info size={13} className="shrink-0 mt-0.5" />
                            Flat items sum to a package price. LED wall billed by area at booking. GST extra.
                        </p>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9]">
                            <span className="text-red-500">*</span> Red Star marked items are compulsory in a package
                        </p>
                    </div>
                </div>
            </div>

            {/* Policy Bottomsheet Modal */}
            <PolicyBottomSheet
                isOpen={activePolicySheet === 'cancellation'}
                onClose={() => setActivePolicySheet(null)}
                title="Cancellation Policy"
                subtitle="Select or upload cancellation policy for your package"
                initialDocs={cancellationDocs}
                onSaveDocs={(docs) => setCancellationDocs(docs)}
            />
            <PolicyBottomSheet
                isOpen={activePolicySheet === 'lastMinute'}
                onClose={() => setActivePolicySheet(null)}
                title="Last Minute Charges"
                subtitle="Set your charges for last minute changes or extensions"
                initialDocs={lastMinuteDocs}
                onSaveDocs={(docs) => setLastMinuteDocs(docs)}
            />
            <PolicyBottomSheet
                isOpen={activePolicySheet === 'general'}
                onClose={() => setActivePolicySheet(null)}
                title="General Policy"
                subtitle="Upload or write general terms and conditions for customers"
                initialDocs={policyDocs}
                onSaveDocs={(docs) => setPolicyDocs(docs)}
            />
        </div>
    );
}
