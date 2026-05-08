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
}

export default function CatererStep3PoliciesAndCharges(p: Props) {
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
                <button onClick={() => p.lastMinuteInputRef.current?.click()} className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4"><Upload size={24} className="text-[#3F3F47]" /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Last Minute charges documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                </button>
                <input type="file" ref={p.lastMinuteInputRef} className="hidden" accept=".pdf,.doc,.docx" />
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
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">Dynamic Pricing (Optional)</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9]">Adjust Pricing for Busy Dates.</p>
                    </div>
                    <button onClick={() => p.setIsDynamicPricingEnabled(!p.isDynamicPricingEnabled)} className={`w-12 h-6 flex items-center rounded-full transition-colors px-1 ${p.isDynamicPricingEnabled ? 'bg-[#030303]' : 'bg-[#E4E4E7]'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${p.isDynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                {p.isDynamicPricingEnabled && (
                    <div className="mt-8 flex flex-col gap-10">
                        {/* Weekend */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div onClick={() => p.setWeekendPricing(!p.weekendPricing)} className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${p.weekendPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}>
                                    {p.weekendPricing && <Check size={14} className="text-white stroke-[3]" />}
                                </div>
                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Weekend Pricing</h4>
                            </div>
                            {p.weekendPricing && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Increase Price By</label>
                                            <div className="relative">
                                                <select value={p.weekendIncreaseType} onChange={(e) => p.setWeekendIncreaseType(e.target.value)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none">
                                                    <option>Fixed Price</option><option>Percentage</option>
                                                </select>
                                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] uppercase tracking-wider mb-2">Value</label>
                                            <input type="text" placeholder={formatPricePlaceholder(p.weekendIncreaseType)} value={formatPriceValue(p.weekendValue, p.weekendIncreaseType)} onChange={(e) => { let v = e.target.value.replace(/[^0-9]/g,''); if (p.weekendIncreaseType==='Percentage'&&v!==''&&parseInt(v)>100) v='100'; p.setWeekendValue(v); }} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {['Saturday','Sunday'].map(d => (
                                            <button key={d} onClick={() => p.setWeekendDays(prev => prev.includes(d)?prev.filter(x=>x!==d):[...prev,d])} style={{ fontFamily: 'Figtree, sans-serif' }} className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${p.weekendDays.includes(d)?'bg-[#030303] text-white':'bg-[#F4F4F5] text-[#3F3F47]'}`}>{d}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Festival */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div onClick={() => p.setFestivalPricing(!p.festivalPricing)} className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${p.festivalPricing ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}>
                                    {p.festivalPricing && <Check size={14} className="text-white stroke-[3]" />}
                                </div>
                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Festival Pricing</h4>
                            </div>
                            {p.festivalPricing && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {p.availableFestivals.map(f => (
                                            <button key={f} onClick={() => p.setSelectedFestivals(prev => prev.includes(f)?prev.filter(x=>x!==f):[...prev,f])} style={{ fontFamily: 'Figtree, sans-serif' }} className={`px-4 py-2 rounded-full text-[13px] font-semibold border ${p.selectedFestivals.includes(f)?'border-[#030303] text-[#030303]':'border-[#E4E4E7] text-[#3F3F47]'}`}>{f}</button>
                                        ))}
                                        {p.isAddingFestival ? (
                                            <div className="flex items-center gap-2">
                                                <input type="text" placeholder="Add festival" value={p.newFestivalName} onChange={(e) => p.setNewFestivalName(e.target.value)} onKeyDown={(e) => e.key==='Enter'&&p.handleAddFestival()} autoFocus style={{ fontFamily: 'Figtree, sans-serif' }} className="w-32 py-2 px-3 bg-white border border-[#E4E4E7] rounded-full text-[13px] font-semibold focus:outline-none" />
                                                <button onClick={p.handleAddFestival} className="p-2 bg-[#030303] text-white rounded-full"><Check size={14} strokeWidth={3} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => p.setIsAddingFestival(true)} style={{ fontFamily: 'Figtree, sans-serif' }} className="px-4 py-2 flex items-center gap-2 rounded-full text-[13px] font-semibold text-[#71717B] border border-[#E4E4E7]"><PlusCircle size={14} /> Add New</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Last-minute */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div onClick={() => p.setLastMinuteBooking(!p.lastMinuteBooking)} className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${p.lastMinuteBooking ? 'bg-[#030303]' : 'border-2 border-[#D4D4D8]'}`}>
                                    {p.lastMinuteBooking && <Check size={14} className="text-white stroke-[3]" />}
                                </div>
                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Last-minute Bookings</h4>
                            </div>
                            {p.lastMinuteBooking && (
                                <div className="flex flex-col gap-6">
                                    <input type="text" placeholder="e.g. 7" value={p.lastMinuteDays} onChange={(e) => p.setLastMinuteDays(e.target.value.replace(/[^0-9]/g,''))} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-semibold text-[#9F9FA9] focus:outline-none" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Policies */}
            <div className="mt-8">
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4">Policies &amp; Rules</p>
                <button onClick={() => p.policyInputRef.current?.click()} className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4"><Upload size={24} className="text-[#3F3F47]" /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">Browse Files</span>
                </button>
                <input type="file" ref={p.policyInputRef} className="hidden" accept=".pdf,.doc,.docx" multiple onChange={p.onPolicyUpload} />
                {p.policyFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {p.policyFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
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
