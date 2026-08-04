'use client';

import React, { useState } from 'react';
import { ChevronDown, Upload, FileText, X, Plus, Minus, Check, PlusCircle } from 'lucide-react';
import { PolicyFile, GuestTier, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

/* ───────────────────────── Types ───────────────────────── */

export interface DynamicPricingState {
    dynPackagePrice: string;
    dynBillingUnit: string;
    dynNoOfPeople: string;
    weekendsEnabled: boolean;
    weekendPrice: string;
    weekendIncreaseType: '+10%' | '+20%' | string;
    weddingSeasonEnabled: boolean;
    weddingSeasonPrice: string;
    festivalsEnabled: boolean;
    festivalsPrice: string;
    customDatesEnabled: boolean;
    customDates: { label: string; price: string }[];
}

const PEOPLE_OPTIONS = [
    'eg - 1 person or 2-3 person',
    '1 person',
    '2-3 persons',
    '4-6 persons',
    '7-10 persons',
    '10+ persons',
];

export const defaultDynamicPricing = (): DynamicPricingState => ({
    dynPackagePrice: '',
    dynBillingUnit: 'Per hour',
    dynNoOfPeople: '',
    weekendsEnabled: false,
    weekendPrice: '',
    weekendIncreaseType: '+10%',
    weddingSeasonEnabled: false,
    weddingSeasonPrice: '',
    festivalsEnabled: false,
    festivalsPrice: '',
    customDatesEnabled: false,
    customDates: [{ label: '', price: '' }],
});

/* ───────────────────────── Props ───────────────────────── */

interface Props {
    packagePrice: string; setPackagePrice: (v: string) => void;
    packageBillingUnit: string; setPackageBillingUnit: (v: string) => void;
    overtimePrice: string; setOvertimePrice: (v: string) => void;
    overtimeBillingUnit: string; setOvertimeBillingUnit: (v: string) => void;
    teamPrice: string; setTeamPrice: (v: string) => void;
    teamBillingUnit: string; setTeamBillingUnit: (v: string) => void;
    isDynamicPricingEnabled: boolean; setIsDynamicPricingEnabled: (v: boolean) => void;
    weekendPricing: boolean; setWeekendPricing: (v: boolean) => void;
    weekendIncreaseType: string; setWeekendIncreaseType: (v: string) => void;
    weekendValue: string; setWeekendValue: (v: string) => void;
    weekendDays: string[]; setWeekendDays: (fn: (p: string[]) => string[]) => void;
    weekendSeason: boolean; setWeekendSeason: (v: boolean) => void;
    seasonIncreaseType: string; setSeasonIncreaseType: (v: string) => void;
    seasonValue: string; setSeasonValue: (v: string) => void;
    festivalPricing: boolean; setFestivalPricing: (v: boolean) => void;
    selectedFestivals: string[]; setSelectedFestivals: (fn: (p: string[]) => string[]) => void;
    availableFestivals: string[];
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
    festivalPrices: Record<string, { increaseType: string; value: string }>;
    setFestivalPrices: React.Dispatch<React.SetStateAction<Record<string, { increaseType: string; value: string }>>>;
    lastMinuteFiles: PolicyFile[];
    lastMinuteInputRef: React.RefObject<HTMLInputElement | null>;
    onLastMinuteUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeLastMinuteFile: (idx: number) => void;
    policyFiles: PolicyFile[];
    policyInputRef: React.RefObject<HTMLInputElement | null>;
    onPolicyUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePolicyFile: (idx: number) => void;
}

const billingOptions = ['Per hour', 'Per day', 'Per package', 'Per session'];


/* ───────────────────────── Sub-components ───────────────────────── */

function PriceCard({ label, price, setPrice, billingUnit, setBillingUnit }: {
    label: string; price: string; setPrice: (v: string) => void;
    billingUnit: string; setBillingUnit: (v: string) => void;
}) {
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-6 flex flex-col gap-4">
            <div>
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">{label}</label>
                <input
                    type="text"
                    placeholder="$ 0.0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                />
            </div>
            <div>
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Billing Unit</label>
                <div className="relative">
                    <select
                        value={billingUnit}
                        onChange={(e) => setBillingUnit(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                    >
                        {billingOptions.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

function UploadZone({ label, title, inputRef, onUpload, files, onRemove }: {
    label: string; title: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    files: PolicyFile[];
    onRemove: (idx: number) => void;
}) {
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

    return (
        <div className="mb-8">
            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">{label}</p>
            <label className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer block text-center">
                <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                    <Upload size={24} className="text-[#3F3F47] stroke-2" />
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">{title}</p>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                <input type="file" ref={inputRef} className="hidden" accept=".pdf,.doc,.docx,image/*" multiple onChange={onUpload} />
            </label>
            {files.length > 0 && (
                <div className="flex flex-col gap-3 mt-3">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                            <div 
                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:underline"
                                onClick={() => {
                                    const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                    if (url) setPreviewFile({ url, name: file.name });
                                }}
                            >
                                <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white flex-shrink-0">
                                    <FileText size={16} className="text-[#3F3F47] stroke-2" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">
                                        {file.size > 0 ? `${formatFileSize(file.size)} · Uploaded` : 'Existing Document'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => onRemove(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3"><X size={20} /></button>
                        </div>
                    ))}
                </div>
            )}
            
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

/* ── Percentage bump pill ── */
const BUMPS = ['+10%', '+20%'];

function PercentBadge({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{ fontFamily: 'Figtree, sans-serif' }}
            className={`px-4 py-2 rounded-[9999px] text-[12px] font-bold transition-all flex flex-col justify-center items-center ${active
                ? 'bg-[#030303] text-white'
                : 'bg-[#F4F4F5] text-[#71717B] hover:bg-[#E4E4E7]'
                }`}
        >
            {label}
        </button>
    );
}

/* ── Season / Festival sub-row ── */
function SeasonRow({
    label, enabled, onToggle, price, onPrice,
}: {
    label: string; enabled: boolean; onToggle: () => void; price: string; onPrice: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer">
                <div
                    onClick={onToggle}
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors cursor-pointer ${enabled ? 'bg-[#030303] border-[#030303]' : 'bg-white border-[#D4D4D8]'}`}
                >
                    {enabled && (
                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                            <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-normal text-[#000] leading-[24px] tracking-0">{label}</span>
            </label>
            {enabled && (
                <div className="ml-8">
                    <input
                        type="text"
                        placeholder="₹ 0"
                        value={price}
                        onChange={(e) => onPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#030303] placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
            )}
        </div>
    );
}

/* ── Weekend pricing panel (the popup shown in image) ── */
function WeekendPricingPanel({
    state, update, basePrice,
}: {
    state: DynamicPricingState;
    update: (patch: Partial<DynamicPricingState>) => void;
    basePrice: string;
}) {
    const weekdayNum = parseFloat(basePrice) || 0;
    const weekendNum = parseFloat(state.weekendPrice) || 0;
    const diff = weekdayNum > 0 && weekendNum > weekdayNum
        ? `+₹${(weekendNum - weekdayNum).toFixed(0)} more`
        : '';
    const pct = weekdayNum > 0 && weekendNum > weekdayNum
        ? `(+${Math.round(((weekendNum - weekdayNum) / weekdayNum) * 100)}%)`
        : '';

    return (
        <div className="mt-3 w-full flex flex-col items-start gap-5 p-5 bg-[#FAFAFA] rounded-[8px]">
            {/* SET WEEKEND PRICE label */}
            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#9F9FA9] uppercase tracking-widest">Set Weekend Price</p>

            {/* Price input box — bg #E2E2E2, radius 6px */}
            <div className="bg-[#E2E2E2] rounded-[6px] px-4 py-3 flex items-center gap-2">
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-semibold text-[#000]">₹</span>
                <input
                    type="text"
                    placeholder="0"
                    value={state.weekendPrice}
                    onFocus={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        update({ weekendPrice: raw });
                    }}
                    onChange={(e) => update({ weekendPrice: e.target.value.replace(/[^0-9.]/g, '') })}
                    onBlur={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        update({ weekendPrice: raw });
                    }}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="w-full bg-transparent text-[20px] font-semibold text-[#000] placeholder:text-[#9F9FA9] focus:outline-none"
                />
            </div>

            {/* Helper text with info icon — always show when weekendPrice is set */}
            {weekendNum > 0 && (
                <div className="flex items-start gap-2">
                    <div className="mt-0.5 w-4 h-4 rounded-full border border-[#9F9FA9] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#9F9FA9] text-[9px] font-bold leading-none">i</span>
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-normal text-[#71717B] leading-[18px]">
                        {weekdayNum > 0
                            ? <>Weekday price: ₹{weekdayNum.toLocaleString()}. You&apos;re charging ₹{Math.abs(weekendNum - weekdayNum).toLocaleString()} more {pct}</>
                            : <>Weekend price set to ₹{weekendNum.toLocaleString()}</>}
                    </p>
                </div>
            )}

            {/* % bump pills */}
            <div className="flex gap-2">
                {BUMPS.map(b => (
                    <PercentBadge
                        key={b}
                        label={b}
                        active={state.weekendIncreaseType === b}
                        onClick={() => {
                            const pctVal = parseInt(b);
                            const newPrice = weekdayNum > 0
                                ? Math.round(weekdayNum * (1 + pctVal / 100)).toString()
                                : state.weekendPrice;
                            update({ weekendIncreaseType: b, weekendPrice: newPrice });
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Custom Dates rows ── */
function CustomDatesPanel({
    dates, onUpdate,
}: {
    dates: { label: string; price: string }[];
    onUpdate: (dates: { label: string; price: string }[]) => void;
}) {
    const setDate = (i: number, field: 'label' | 'price', val: string) => {
        const next = [...dates];
        next[i] = { ...next[i], [field]: val };
        onUpdate(next);
    };
    const addRow = () => onUpdate([...dates, { label: '', price: '' }]);
    const removeRow = (i: number) => onUpdate(dates.filter((_, idx) => idx !== i));

    return (
        <div className="mt-3 w-full flex flex-col items-start gap-5 p-5 bg-[#FAFAFA] rounded-[8px]">
            {dates.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Date / Label"
                        value={d.label}
                        onChange={(e) => setDate(i, 'label', e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="flex-1 p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-[#030303] placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <input
                        type="text"
                        placeholder="₹ 0"
                        value={d.price}
                        onChange={(e) => setDate(i, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-24 p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-[#030303] placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    {dates.length > 1 && (
                        <button onClick={() => removeRow(i)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F5] text-[#3F3F47] hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Minus size={14} />
                        </button>
                    )}
                </div>
            ))}
            <button
                onClick={addRow}
                style={{ fontFamily: 'Figtree, sans-serif' }}
                className="flex items-center gap-1.5 text-[13px] font-bold text-[#3F3F47] hover:text-[#030303] transition-colors self-start"
            >
                <Plus size={14} /> Add date
            </button>
        </div>
    );
}

/* ── Full Dynamic Pricing Section ── */
function DynamicPricingPanel({
    state, update, basePrice,
}: {
    state: DynamicPricingState;
    update: (patch: Partial<DynamicPricingState>) => void;
    basePrice: string;
}) {
    return (
        <div className="flex flex-col mt-6">

            {/* ── Package Pricing ── */}
            <div className="mb-4">
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Package Pricing</label>
                <input
                    type="text"
                    placeholder="$ 0.0"
                    value={state.dynPackagePrice}
                    onChange={(e) => update({ dynPackagePrice: e.target.value.replace(/[^0-9.]/g, '') })}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]"
                />
            </div>

            {/* ── Billing Unit ── */}
            <div className="mb-4">
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">Billing Unit</label>
                <div className="relative">
                    <select
                        value={state.dynBillingUnit}
                        onChange={(e) => update({ dynBillingUnit: e.target.value })}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                    >
                        {billingOptions.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* ── No. of People ── */}
            <div className="mb-6">
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[14px] font-normal text-[#3F3F47] leading-[20px] mb-2">No. of People</label>
                <div className="relative">
                    <select
                        value={state.dynNoOfPeople || ''}
                        onChange={(e) => update({ dynNoOfPeople: e.target.value })}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300 ${state.dynNoOfPeople ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}
                    >
                        <option value="" disabled>eg - 1 person or 2-3 person</option>
                        {PEOPLE_OPTIONS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* ── Weekends ── */}
            <div className="border-t border-[#E4E4E7] pt-4 pb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        onClick={() => update({ weekendsEnabled: !state.weekendsEnabled })}
                        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors flex-shrink-0 ${state.weekendsEnabled ? 'bg-[#030303] border-[#030303]' : 'bg-white border-[#D4D4D8]'}`}
                    >
                        {state.weekendsEnabled && (
                            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-normal text-[#000] leading-[24px]">Weekends</span>
                </label>
                {state.weekendsEnabled && (
                    <WeekendPricingPanel state={state} update={update} basePrice={basePrice} />
                )}
            </div>

            {/* ── Wedding Season ── */}
            <div className=" border-[#E4E4E7] py-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        onClick={() => update({ weddingSeasonEnabled: !state.weddingSeasonEnabled })}
                        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors flex-shrink-0 ${state.weddingSeasonEnabled ? 'bg-[#030303] border-[#030303]' : 'bg-white border-[#D4D4D8]'}`}
                    >
                        {state.weddingSeasonEnabled && (
                            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-normal text-[#000] leading-[24px]">Wedding season</span>
                </label>
                {state.weddingSeasonEnabled && (
                    <div className="mt-3 w-full flex flex-col items-start gap-5 p-5 bg-[#FAFAFA] rounded-[8px]">
                        <input
                            type="text" placeholder="₹ 0"
                            value={state.weddingSeasonPrice}
                            onChange={(e) => update({ weddingSeasonPrice: e.target.value.replace(/[^0-9.]/g, '') })}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                    </div>
                )}
            </div>

            {/* ── Festivals ── */}
            <div className="border-[#E4E4E7] py-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        onClick={() => update({ festivalsEnabled: !state.festivalsEnabled })}
                        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors flex-shrink-0 ${state.festivalsEnabled ? 'bg-[#030303] border-[#030303]' : 'bg-white border-[#D4D4D8]'}`}
                    >
                        {state.festivalsEnabled && (
                            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-normal text-[#000] leading-[24px]">Festivals</span>
                </label>
                {state.festivalsEnabled && (
                    <div className="mt-3 w-full flex flex-col items-start gap-5 p-5 bg-[#FAFAFA] rounded-[8px]">
                        <input
                            type="text" placeholder="₹ 0"
                            value={state.festivalsPrice}
                            onChange={(e) => update({ festivalsPrice: e.target.value.replace(/[^0-9.]/g, '') })}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                    </div>
                )}
            </div>

            {/* ── Custom dates ── */}
            <div className=" border-[#E4E4E7] pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        onClick={() => update({ customDatesEnabled: !state.customDatesEnabled })}
                        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors flex-shrink-0 ${state.customDatesEnabled ? 'bg-[#030303] border-[#030303]' : 'bg-white border-[#D4D4D8]'}`}
                    >
                        {state.customDatesEnabled && (
                            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-normal text-[#000] leading-[24px]">Custom dates</span>
                </label>
                {state.customDatesEnabled && (
                    <CustomDatesPanel
                        dates={state.customDates}
                        onUpdate={(dates) => update({ customDates: dates })}
                    />
                )}
            </div>
        </div>
    );
}

/* ───────────────────────── Main Export ───────────────────────── */

export default function MakeupStep3PriceAndPolicy({
    packagePrice, setPackagePrice,
    packageBillingUnit, setPackageBillingUnit,
    overtimePrice, setOvertimePrice,
    overtimeBillingUnit, setOvertimeBillingUnit,
    teamPrice, setTeamPrice,
    teamBillingUnit, setTeamBillingUnit,
    isDynamicPricingEnabled, setIsDynamicPricingEnabled,
    weekendPricing, setWeekendPricing,
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
    customDatesPricing, setCustomDatesPricing,
    customDatesIncreaseType, setCustomDatesIncreaseType,
    customDatesValue, setCustomDatesValue,
    customDatesStartDate, setCustomDatesStartDate,
    customDatesEndDate, setCustomDatesEndDate,
    guestTiers, addGuestTierOption, updateGuestTier, removeGuestTier,
    festivalPrices, setFestivalPrices,
    lastMinuteFiles, lastMinuteInputRef, onLastMinuteUpload, removeLastMinuteFile,
    policyFiles, policyInputRef, onPolicyUpload, removePolicyFile,
}: Props) {
    const [dynPackagePrice, setDynPackagePrice] = useState('');
    const [dynBillingUnit, setDynBillingUnit] = useState('Per hour');
    const [dynNoOfPeople, setDynNoOfPeople] = useState('');

    return (
        <div className="flex flex-col gap-6 w-full mt-6 pb-32">
            <PriceCard label="Package Pricing" price={packagePrice} setPrice={setPackagePrice} billingUnit={packageBillingUnit} setBillingUnit={setPackageBillingUnit} />
            <PriceCard label="Overtime Charges" price={overtimePrice} setPrice={setOvertimePrice} billingUnit={overtimeBillingUnit} setBillingUnit={setOvertimeBillingUnit} />
            <PriceCard label="Team + Equipment" price={teamPrice} setPrice={setTeamPrice} billingUnit={teamBillingUnit} setBillingUnit={setTeamBillingUnit} />

            {/* Dynamic Pricing Toggle */}
            <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#3F3F47] leading-[20px] tracking-0">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] tracking-0">Set base pricing for different guest counts</p>
                    </div>
                    <button
                        onClick={() => setIsDynamicPricingEnabled(!isDynamicPricingEnabled)}
                        className={`w-12 h-[32px] flex items-center rounded-[999px] transition-colors p-[4px] ${isDynamicPricingEnabled ? 'bg-[#09090B] justify-end' : 'bg-[#E4E4E7] justify-start'}`}
                    >
                        <div className={`w-6 h-6 rounded-full bg-white transition-transform`} />
                    </button>
                </div>

                {isDynamicPricingEnabled && (() => {
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

            <UploadZone
                label="Last Minute Charges"
                title="Upload Last Minute charges documents"
                inputRef={lastMinuteInputRef}
                onUpload={onLastMinuteUpload}
                files={lastMinuteFiles}
                onRemove={removeLastMinuteFile}
            />

            <UploadZone
                label="Policies & Rules"
                title="Upload Policy Documents"
                inputRef={policyInputRef}
                onUpload={onPolicyUpload}
                files={policyFiles}
                onRemove={removePolicyFile}
            />
        </div>
    );
}
