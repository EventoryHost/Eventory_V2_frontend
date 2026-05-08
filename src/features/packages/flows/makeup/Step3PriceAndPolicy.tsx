'use client';

import React, { useState } from 'react';
import { ChevronDown, Upload, FileText, X, Plus, Minus } from 'lucide-react';
import { PolicyFile, formatFileSize } from '../../shared/types';

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
    dynamicPricing: boolean; setDynamicPricing: (v: boolean) => void;
    dynamicPricingState: DynamicPricingState;
    setDynamicPricingState: (v: DynamicPricingState) => void;
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
    return (
        <div>
            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">{label}</p>
            <button onClick={() => inputRef.current?.click()} className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                    <Upload size={24} className="text-[#3F3F47] stroke-2" />
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">{title}</p>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
            </button>
            <input type="file" ref={inputRef} className="hidden" accept=".pdf,.doc,.docx" multiple onChange={onUpload} />
            {files.length > 0 && (
                <div className="flex flex-col gap-3 mt-3">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white flex-shrink-0">
                                    <FileText size={16} className="text-[#3F3F47] stroke-2" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} · Uploaded</p>
                                </div>
                            </div>
                            <button onClick={() => onRemove(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3"><X size={20} /></button>
                        </div>
                    ))}
                </div>
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
    dynamicPricing, setDynamicPricing,
    dynamicPricingState, setDynamicPricingState,
    lastMinuteFiles, lastMinuteInputRef, onLastMinuteUpload, removeLastMinuteFile,
    policyFiles, policyInputRef, onPolicyUpload, removePolicyFile,
}: Props) {

    const updateDynamic = (patch: Partial<DynamicPricingState>) =>
        setDynamicPricingState({ ...dynamicPricingState, ...patch });

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
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] tracking-0">Set flat pricing for a flat per person rate.</p>
                    </div>
                    <button
                        onClick={() => setDynamicPricing(!dynamicPricing)}
                        className={`w-12 h-[32px] flex items-center rounded-[999px] transition-colors p-[4px] ${dynamicPricing ? 'bg-[#09090B] justify-end' : 'bg-[#E4E4E7] justify-start'}`}
                    >
                        <div className={`w-6 h-6 rounded-full bg-white transition-transform`} />
                    </button>
                </div>

                {/* Expanded dynamic pricing panel */}
                {dynamicPricing && (
                    <DynamicPricingPanel
                        state={dynamicPricingState}
                        update={updateDynamic}
                        basePrice={packagePrice}
                    />
                )}
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
