'use client';

import React from 'react';
import { Upload, X, Plus, Calendar, Trash2, FileText, Check, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PolicyFile, formatFileSize, GuestTier } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

import CustomDateRangePicker from '../../components/CustomDateRangePicker';

interface Props {
    packageChargeType: string; setPackageChargeType: (v: string) => void;
    packagePrice: string; setPackagePrice: (v: string) => void;
    
    teamChargeType: string; setTeamChargeType: (v: string) => void;
    teamPrice: string; setTeamPrice: (v: string) => void;
    
    overtimeRate: string; setOvertimeRate: (v: string) => void;
    
    gstInclusive: boolean;
    setGstInclusive: (v: boolean) => void;
    gstRatePercent: string;
    setGstRatePercent: (v: string) => void;
    isDynamicPricingEnabled: boolean; setIsDynamicPricingEnabled: (v: boolean) => void;
    weekendPricing: boolean; setWeekendPricing: (v: boolean) => void;
    weekendIncreaseType: string; setWeekendIncreaseType: (v: string) => void;
    weekendValue: string; setWeekendValue: (v: string) => void;
    weekendDays: string[]; setWeekendDays: (v: string[]) => void;
    weekendSeason: boolean; setWeekendSeason: (v: boolean) => void;
    seasonIncreaseType: string; setSeasonIncreaseType: (v: string) => void;
    seasonValue: string; setSeasonValue: (v: string) => void;
    festivalPricing: boolean; setFestivalPricing: (v: boolean) => void;
    festivalIncreaseType: string; setFestivalIncreaseType: (v: string) => void;
    festivalValue: string; setFestivalValue: (v: string) => void;
    selectedFestivals: string[]; setSelectedFestivals: React.Dispatch<React.SetStateAction<string[]>>;
    availableFestivals: string[]; setAvailableFestivals: React.Dispatch<React.SetStateAction<string[]>>;
    isAddingFestival: boolean; setIsAddingFestival: (v: boolean) => void;
    newFestivalName: string; setNewFestivalName: (v: string) => void;
    handleAddFestival: () => void;
    customDatesPricing: boolean; setCustomDatesPricing: (v: boolean) => void;
    customDatesIncreaseType: string; setCustomDatesIncreaseType: (v: string) => void;
    customDatesValue: string; setCustomDatesValue: (v: string) => void;
    customDatesStartDate: string; setCustomDatesStartDate: (v: string) => void;
    customDatesEndDate: string; setCustomDatesEndDate: (v: string) => void;
    guestTiers: GuestTier[]; addGuestTierOption: () => void;
    updateGuestTier: (i: number, f: 'range' | 'price', v: string) => void;
    removeGuestTier: (i: number) => void;
    festivalPrices: Record<string, { increaseType: string; value: string }>; setFestivalPrices: React.Dispatch<React.SetStateAction<Record<string, { increaseType: string; value: string }>>>;
    
    lastMinuteDocs: PolicyFile[];
    setLastMinuteDocs: React.Dispatch<React.SetStateAction<PolicyFile[]>>;
    
    policyDocs: PolicyFile[];
    setPolicyDocs: React.Dispatch<React.SetStateAction<PolicyFile[]>>;
}

const CARD = 'bg-white border border-[#E4E4E7] rounded-[16px] p-5 flex flex-col gap-6';
const LABEL = 'text-[13px] font-semibold text-[#3F3F47] pl-1';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]';

export default function VenueStep3PricingAndPolicies({
    packageChargeType, setPackageChargeType,
    packagePrice, setPackagePrice,
    teamChargeType, setTeamChargeType,
    teamPrice, setTeamPrice,
    overtimeRate, setOvertimeRate,
    gstInclusive,
    setGstInclusive,
    gstRatePercent,
    setGstRatePercent,
    isDynamicPricingEnabled, setIsDynamicPricingEnabled,
    weekendPricing, setWeekendPricing,
    weekendIncreaseType, setWeekendIncreaseType,
    weekendValue, setWeekendValue,
    weekendDays, setWeekendDays,
    weekendSeason, setWeekendSeason,
    seasonIncreaseType, setSeasonIncreaseType,
    seasonValue, setSeasonValue,
    festivalPricing, setFestivalPricing,
    festivalIncreaseType, setFestivalIncreaseType,
    festivalValue, setFestivalValue,
    selectedFestivals, setSelectedFestivals,
    availableFestivals, setAvailableFestivals,
    isAddingFestival, setIsAddingFestival,
    newFestivalName, setNewFestivalName,
    handleAddFestival,
    customDatesPricing, setCustomDatesPricing,
    customDatesIncreaseType, setCustomDatesIncreaseType,
    customDatesValue, setCustomDatesValue,
    customDatesStartDate, setCustomDatesStartDate,
    customDatesEndDate, setCustomDatesEndDate,
    guestTiers, addGuestTierOption, updateGuestTier, removeGuestTier,
    festivalPrices, setFestivalPrices,
    lastMinuteDocs, setLastMinuteDocs,
    policyDocs, setPolicyDocs
}: Props) {
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    const policyInputRef = React.useRef<HTMLInputElement>(null);

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return 'Existing Document';
        return `${formatFileSize(bytes)} _ Uploaded`;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<PolicyFile[]>>, ref: React.RefObject<HTMLInputElement | null>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size,
                file: file
            }));
            setter(prev => [...prev, ...filesArray]);
        }
        if (ref.current) ref.current.value = '';
    };

    const removeFile = (index: number, setter: React.Dispatch<React.SetStateAction<PolicyFile[]>>) => {
        setter(prev => prev.filter((_, idx) => idx !== index));
    };

    // Removing handleSaveDynamicPrice and formatDateRange as they are replaced

    return (
        <div className="flex flex-col gap-8 pb-32">
            
            {/* ── Package Pricing ── */}
            <div className={CARD}>
                <div className="flex flex-col gap-4">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider mb-2">Package Pricing</h3>
                    
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>How do you charge?</label>
                        <div className="flex p-1 bg-[#F4F4F5] rounded-[12px] relative">
                            <button onClick={() => setPackageChargeType('Per Package')} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${packageChargeType === 'Per Package' ? 'text-[#030303]' : 'text-[#71717B]'}`}>Per Package</button>
                            <button onClick={() => setPackageChargeType('Per Hour')} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${packageChargeType === 'Per Hour' ? 'text-[#030303]' : 'text-[#71717B]'}`}>Per Hour</button>
                            <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm border border-[#E4E4E7] rounded-[10px] transition-transform duration-300 ease-in-out" style={{ transform: packageChargeType === 'Per Package' ? 'translateX(0)' : 'translateX(100%)' }} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#030303] text-[15px] font-normal" style={{ fontFamily: 'Figtree, sans-serif' }}>Rs.</span>
                            <input type="text" placeholder="5,000" value={packagePrice} onChange={e => setPackagePrice(e.target.value.replace(/[^0-9.]/g, ''))} className={`${INPUT} pl-11`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Team & Equipment Charges ── */}
            <div className={CARD}>
                <div className="flex flex-col gap-4">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider mb-2">Team & Equipment Charges</h3>
                    
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>How do you charge?</label>
                        <div className="flex p-1 bg-[#F4F4F5] rounded-[12px] relative">
                            <button onClick={() => setTeamChargeType('Per Package')} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${teamChargeType === 'Per Package' ? 'text-[#030303]' : 'text-[#71717B]'}`}>Per Package</button>
                            <button onClick={() => setTeamChargeType('Per Hour')} className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] relative z-10 transition-colors ${teamChargeType === 'Per Hour' ? 'text-[#030303]' : 'text-[#71717B]'}`}>Per Hour</button>
                            <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm border border-[#E4E4E7] rounded-[10px] transition-transform duration-300 ease-in-out" style={{ transform: teamChargeType === 'Per Package' ? 'translateX(0)' : 'translateX(100%)' }} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#030303] text-[15px] font-normal" style={{ fontFamily: 'Figtree, sans-serif' }}>Rs.</span>
                            <input type="text" placeholder="3,000" value={teamPrice} onChange={e => setTeamPrice(e.target.value.replace(/[^0-9.]/g, ''))} className={`${INPUT} pl-11`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Overtime Rate ── */}
            <div className={CARD}>
                <div className="flex flex-col gap-4">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider mb-2">Overtime Rate</h3>
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Price Per Hour</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#030303] text-[15px] font-normal" style={{ fontFamily: 'Figtree, sans-serif' }}>Rs.</span>
                            <input type="text" placeholder="3,000" value={overtimeRate} onChange={e => setOvertimeRate(e.target.value.replace(/[^0-9.]/g, ''))} className={`${INPUT} pl-11`} />
                        </div>
                    </div>
                </div>
            </div>

                            <div className="pt-2 mb-6">
                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-3">
                        GST Charges <span className="text-red-500">*</span>
                    </h4>
                    
                    <div className="flex flex-col gap-2 mb-5">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#71717B]">Choose GST percentage</label>
                        <div className="relative">
                            <select
                                value={gstRatePercent}
                                onChange={(e) => setGstRatePercent(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif', appearance: 'none' }}
                                className="w-full p-4 pr-10 bg-white border border-[#E4E4E7] rounded-[16px] text-[15px] font-semibold text-[#030303] focus:outline-none focus:border-[#04222D]"
                            >
                                <option value="" disabled className="text-gray-400">Select percentage</option>
                                <option value="5">5 %</option>
                                <option value="18">18 %</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">GST Inclusive</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] mt-0.5">Is GST already included in the prices<br/>you entered?</p>
                        </div>
                        <div className="bg-[#E4E4E7] rounded-full p-1 flex items-center w-[96px] relative h-9 cursor-pointer" onClick={() => setGstInclusive(!gstInclusive)}>
                            <div className={`absolute top-1 bottom-1 w-[44px] bg-white rounded-full transition-transform shadow-sm ${gstInclusive ? 'translate-x-[42px]' : 'translate-x-0'}`} />
                            <div className="flex-1 flex items-center justify-center relative z-10 text-[12px] font-bold text-[#71717B] transition-colors">
                                No
                            </div>
                            <div className={`flex-1 flex items-center justify-center relative z-10 text-[12px] font-bold transition-colors ${gstInclusive ? 'text-[#030303]' : 'text-[#71717B]'}`}>
                                Yes
                            </div>
                        </div>
                    </div>
                </div>

            {/* ── Dynamic Pricing ── */}
            <div className="p-6 flex flex-col bg-white border border-[#E4E4E7] rounded-[16px]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mt-0.5">Adjust your price by season, dates, or guest count</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsDynamicPricingEnabled(!isDynamicPricingEnabled)} 
                        className={`w-12 h-6 flex items-center rounded-full transition-colors px-1 ${isDynamicPricingEnabled ? 'bg-[#030303]' : 'bg-[#E4E4E7]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {isDynamicPricingEnabled && (() => {
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
                        }
                        customDatesInputVal = customDatesValue;
                    }
                    const customDatesPercent = customDatesIncreaseType === 'Percentage' 
                        ? (parseFloat(customDatesValue) || 0) 
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
                                                onClick={() => setWeekendPricing(!weekendPricing)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    weekendPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Weekends</span>
                                        </div>

                                        {weekendPricing && (
                                            <div className="ml-8 p-5 bg-[#FAFAFA] rounded-[16px] flex flex-col gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                    <div className="w-[120px] bg-white border border-[#D4D4D8] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                        <input
                                                            type="text"
                                                            value={weekendInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(weekendInputVal)) : ''}
                                                            onChange={(e) => {
                                                                setWeekendIncreaseType('Fixed Price');
                                                                setWeekendValue(e.target.value.replace(/[^0-9]/g, ''));
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
                                                            onClick={() => { setWeekendIncreaseType('Percentage'); setWeekendValue('10'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${weekendIncreaseType === 'Percentage' && weekendValue === '10' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 10 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setWeekendIncreaseType('Percentage'); setWeekendValue('20'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${weekendIncreaseType === 'Percentage' && weekendValue === '20' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 20 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setWeekendIncreaseType('Percentage'); setWeekendValue(''); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${weekendIncreaseType === 'Percentage' && weekendValue !== '10' && weekendValue !== '20' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#030303] border-[#030303]'}`}
                                                        >
                                                            Custom %
                                                        </button>
                                                    </div>
                                                    
                                                    {weekendIncreaseType === 'Percentage' && weekendValue !== '10' && weekendValue !== '20' && (
                                                        <div className="flex items-center justify-between w-[200px] mt-1 bg-[#FAFAFA] rounded-[8px] p-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#9F9FA9]">Custom percentage</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter"
                                                                value={weekendValue}
                                                                onChange={(e) => setWeekendValue(e.target.value.replace(/[^0-9]/g, ''))}
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
                                                onClick={() => setWeekendSeason(!weekendSeason)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    weekendSeason ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {weekendSeason && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Wedding Session</span>
                                        </div>

                                        {weekendSeason && (
                                            <div className="ml-8 p-5 bg-[#FAFAFA] rounded-[16px] flex flex-col gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Label Price</span>
                                                    <div className="w-[120px] bg-white border border-[#D4D4D8] rounded-[8px] px-3 py-2 flex items-center gap-1.5 h-[42px]">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#71717B] flex-shrink-0">Rs.</span>
                                                        <input
                                                            type="text"
                                                            value={seasonInputVal ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(seasonInputVal)) : ''}
                                                            onChange={(e) => {
                                                                setSeasonIncreaseType('Fixed Price');
                                                                setSeasonValue(e.target.value.replace(/[^0-9]/g, ''));
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
                                                            onClick={() => { setSeasonIncreaseType('Percentage'); setSeasonValue('10'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${seasonIncreaseType === 'Percentage' && seasonValue === '10' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 10 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setSeasonIncreaseType('Percentage'); setSeasonValue('20'); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${seasonIncreaseType === 'Percentage' && seasonValue === '20' ? 'bg-white text-[#030303] border-[#030303]' : 'bg-white text-[#71717B] border-[#D4D4D8] hover:bg-gray-50'}`}
                                                        >
                                                            + 20 %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setSeasonIncreaseType('Percentage'); setSeasonValue(''); }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${seasonIncreaseType === 'Percentage' && seasonValue !== '10' && seasonValue !== '20' ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#030303] border-[#030303]'}`}
                                                        >
                                                            Custom %
                                                        </button>
                                                    </div>
                                                    
                                                    {seasonIncreaseType === 'Percentage' && seasonValue !== '10' && seasonValue !== '20' && (
                                                        <div className="flex items-center justify-between w-[200px] mt-1 bg-[#FAFAFA] rounded-[8px] p-3">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#9F9FA9]">Custom percentage</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter"
                                                                value={seasonValue}
                                                                onChange={(e) => setSeasonValue(e.target.value.replace(/[^0-9]/g, ''))}
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
                                                onClick={() => setFestivalPricing(!festivalPricing)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    festivalPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
                                                }`}
                                            >
                                                {festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">Festivals</span>
                                        </div>

                                        {festivalPricing && (
                                            <div className="ml-8 p-5 bg-[#FAFAFA] border border-[#D4D4D8] rounded-[16px] flex flex-col gap-4">
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
                                                                    ? 'bg-[#030303] border-[#030303] text-white shadow-sm' 
                                                                    : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:border-gray-400'
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
                                                                className="w-32 py-2 px-3 bg-white border border-[#D4D4D8] rounded-full text-[13px] font-semibold focus:outline-none" 
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
                                                            className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-dashed border-[#D4D4D8] bg-white hover:border-gray-400"
                                                        >
                                                            + Add New
                                                        </button>
                                                    )}
                                                </div>
                                                {selectedFestivals.length > 0 && (
                                                    <div className="mt-4 flex flex-col gap-4 border-t border-[#E4E4E7] pt-4">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] uppercase tracking-wider block">CONFIGURE PRICES FOR SELECTED FESTIVALS</span>
                                                        <div className="flex flex-col gap-3">
                                                            {selectedFestivals.map(f => {
                                                                const spec = festivalPrices[f] || { increaseType: 'Percentage', value: '10' };
                                                                
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
                                                                                    setFestivalPrices(prev => ({
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
                                                                                    setFestivalPrices(prev => ({
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
                                                                                    setFestivalPrices(prev => ({
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
                                                onClick={() => setCustomDatesPricing(!customDatesPricing)} 
                                                className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                                                    customDatesPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8] bg-white'
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

            {/* ── Last-Minute Change Charges ── */}
            <div className="flex flex-col gap-3 mt-4">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider pl-2">Last-Minute Change Charges</span>
                <button onClick={() => lastMinuteInputRef.current?.click()} className="w-full py-8 px-4 rounded-[16px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                        <Upload size={20} className="text-[#3F3F47] stroke-[2]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload your last-minute change policy</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-5">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">BROWSE FILES</span>
                </button>
                <input type="file" ref={lastMinuteInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, setLastMinuteDocs, lastMinuteInputRef)} multiple />
                
                {lastMinuteDocs.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                        {lastMinuteDocs.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white">
                                        <FileText size={16} className="text-[#3F3F47] stroke-2" />
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer hover:underline" onClick={() => { const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null); if (url) setPreviewFile({ url, name: file.name }); }}>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSizeLocal(file.size)}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(idx, setLastMinuteDocs)} className="text-[#3F3F47] hover:text-[#030303]"><X size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Policies & Documents ── */}
            <div className="flex flex-col gap-3 mt-4">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider pl-2">Policies & Documents</span>
                <button onClick={() => policyInputRef.current?.click()} className="w-full py-8 px-4 rounded-[16px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                        <Upload size={20} className="text-[#3F3F47] stroke-[2]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-5">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">BROWSE FILES</span>
                </button>
                <input type="file" ref={policyInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, setPolicyDocs, policyInputRef)} multiple />
                
                {policyDocs.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                        {policyDocs.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white">
                                        <FileText size={16} className="text-[#3F3F47] stroke-2" />
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer hover:underline" onClick={() => { const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null); if (url) setPreviewFile({ url, name: file.name }); }}>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSizeLocal(file.size)}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(idx, setPolicyDocs)} className="text-[#3F3F47] hover:text-[#030303]"><X size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>



            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    fileUrl={previewFile.url}
                    fileName={previewFile.name}
                />
            )}
        </div>
    );
}
