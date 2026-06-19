'use client';

import React from 'react';
import { ChevronDown, Upload, FileText, X } from 'lucide-react';
import { PolicyFile, formatFileSize } from '../../shared/types';

interface Props {
    teamEquipmentPrice: string;
    setTeamEquipmentPrice: (v: string) => void;
    teamEquipmentUnit: string;
    setTeamEquipmentUnit: (v: string) => void;

    lastMinuteFiles: PolicyFile[];
    lastMinuteInputRef: React.RefObject<HTMLInputElement | null>;
    onLastMinuteUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeLastMinuteFile: (i: number) => void;

    policyFiles: PolicyFile[];
    policyInputRef: React.RefObject<HTMLInputElement | null>;
    onPolicyUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePolicyFile: (i: number) => void;

    lastMinuteChargesDescription: string;
    setLastMinuteChargesDescription: (v: string) => void;
}

// ── Figma Design Tokens & Typography Styles ──
const HEADING_STYLE = {
    color: 'var(--Text-Neutral-primary, #030303)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--H6-Font-size, 20px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 600)',
    lineHeight: 'var(--H6-Line-height, 28px)',
    letterSpacing: 'var(--H6-Letter-spacing, 0)',
};

const INPUT_STYLE = {
    color: 'var(--Input-text-value, #030303)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const SUBTEXT_STYLE = {
    color: 'var(--Text-Neutral-secondary, #3F3F47)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const SECTION_LABEL = 'text-[12px] font-bold text-[#9F9FA9] leading-[18px] uppercase tracking-[0.05em]';
const INPUT_CLASS = 'p-4 bg-white border border-[#E4E4E7] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal';

export default function DecoratorStep3PoliciesAndCharges({
    teamEquipmentPrice,
    setTeamEquipmentPrice,
    teamEquipmentUnit,
    setTeamEquipmentUnit,
    lastMinuteFiles,
    lastMinuteInputRef,
    onLastMinuteUpload,
    removeLastMinuteFile,
    policyFiles,
    policyInputRef,
    onPolicyUpload,
    removePolicyFile,
    lastMinuteChargesDescription,
    setLastMinuteChargesDescription,
}: Props) {

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return 'Existing Document';
        return `${formatFileSize(bytes)} · Uploaded`;
    };

    return (
        <div className="flex flex-col gap-6 pb-40">
            {/* Inject explicit placeholder style rule */}
            <style dangerouslySetInnerHTML={{ __html: `
                input::placeholder, select::placeholder, textarea::placeholder {
                    color: var(--Input-text-placeholder, #9F9FA9) !important;
                    font-family: var(--Font-family-San-serif, Figtree) !important;
                    font-size: var(--S-Font-size, 16px) !important;
                    font-style: normal !important;
                    font-weight: var(--font-weight, 400) !important;
                    line-height: var(--S-Line-height, 24px) !important;
                    letter-spacing: var(--S-Letter-spacing, 0) !important;
                    opacity: 1 !important;
                }
            ` }} />

            {/* Team + Equipment Card Container */}
            <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-6 shadow-sm flex flex-col gap-4">
                {/* Team + Equipment Price field */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ ...INPUT_STYLE, fontWeight: 600, color: '#3F3F47' }}>
                        Team + Equipment
                    </label>
                    <input
                        type="text"
                        placeholder="Rs. 0"
                        value={teamEquipmentPrice ? `Rs. ${teamEquipmentPrice}` : ''}
                        onChange={(e) => setTeamEquipmentPrice(e.target.value.replace(/[^0-9]/g, ''))}
                        style={INPUT_STYLE}
                        className={INPUT_CLASS}
                    />
                </div>

                {/* Billing Unit Select */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ ...INPUT_STYLE, fontWeight: 600, color: '#3F3F47' }}>
                        Billing Unit
                    </label>
                    <div className="relative">
                        <select
                            value={teamEquipmentUnit}
                            onChange={(e) => setTeamEquipmentUnit(e.target.value)}
                            style={INPUT_STYLE}
                            className={`${INPUT_CLASS} w-full appearance-none pr-12`}
                        >
                            <option value="Per hour">Per hour</option>
                            <option value="Per day">Per day</option>
                            <option value="Per package">Per package</option>
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* LAST MINUTE CHARGES zone */}
            <div className="flex flex-col gap-3">
                <span className={SECTION_LABEL}>Last Minute Charges</span>
                
                <label className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-center block shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                        <Upload size={24} className="text-[#3F3F47]" />
                    </div>
                    <p style={INPUT_STYLE} className="font-bold text-[#030303] mb-1">
                        Upload Last Minute charges documents
                    </p>
                    <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717B] mb-6">
                        PDF, DOC up to 10MB
                    </p>
                    <span style={INPUT_STYLE} className="font-bold text-[#030303] uppercase tracking-wide text-[13px] hover:underline">
                        Browse Files
                    </span>
                    <input
                        type="file"
                        ref={lastMinuteInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={onLastMinuteUpload}
                    />
                </label>

                {/* Uploaded Last Minute Files List */}
                {lastMinuteFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {lastMinuteFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px] gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white">
                                        <FileText size={16} className="text-[#3F3F47]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={INPUT_STYLE} className="font-bold text-[#030303] truncate text-[13px]">
                                            {file.name}
                                        </p>
                                        <p style={SUBTEXT_STYLE} className="text-[11px] text-[#71717B]">
                                            {formatFileSizeLocal(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeLastMinuteFile(idx)} 
                                    className="text-[#3F3F47] hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center my-2 select-none">
                    <div className="flex-1 h-[1px] bg-gray-200" />
                    <span className="px-4 text-[12px] font-bold text-gray-400 uppercase">or</span>
                    <div className="flex-1 h-[1px] bg-gray-200" />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ ...INPUT_STYLE, fontWeight: 600, color: '#3F3F47' }}>
                        Describe Them Instead
                    </label>
                    <textarea
                        rows={4}
                        placeholder="Describe last-minute charges..."
                        value={lastMinuteChargesDescription}
                        onChange={(e) => setLastMinuteChargesDescription(e.target.value)}
                        style={INPUT_STYLE}
                        className={`${INPUT_CLASS} resize-none`}
                    />
                </div>
            </div>

            {/* POLICIES & RULES zone */}
            <div className="flex flex-col gap-3">
                <span className={SECTION_LABEL}>Policies &amp; Rules</span>
                
                <label className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-center block shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                        <Upload size={24} className="text-[#3F3F47]" />
                    </div>
                    <p style={INPUT_STYLE} className="font-bold text-[#030303] mb-1">
                        Upload Policy Documents
                    </p>
                    <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717B] mb-6">
                        PDF, DOC up to 10MB
                    </p>
                    <span style={INPUT_STYLE} className="font-bold text-[#030303] uppercase tracking-wide text-[13px] hover:underline">
                        Browse Files
                    </span>
                    <input
                        type="file"
                        ref={policyInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={onPolicyUpload}
                    />
                </label>

                {/* Uploaded Policy Files List */}
                {policyFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {policyFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px] gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white">
                                        <FileText size={16} className="text-[#3F3F47]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={INPUT_STYLE} className="font-bold text-[#030303] truncate text-[13px]">
                                            {file.name}
                                        </p>
                                        <p style={SUBTEXT_STYLE} className="text-[11px] text-[#71717B]">
                                            {formatFileSizeLocal(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removePolicyFile(idx)} 
                                    className="text-[#3F3F47] hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
