'use client';

import React from 'react';
import { Upload, X, Plus, Calendar, Trash2, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PolicyFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

export interface DynamicPrice {
    id: string;
    fromDate: string;
    toDate: string;
    price: string;
}

interface Props {
    packageChargeType: string; setPackageChargeType: (v: string) => void;
    packagePrice: string; setPackagePrice: (v: string) => void;
    
    teamChargeType: string; setTeamChargeType: (v: string) => void;
    teamPrice: string; setTeamPrice: (v: string) => void;
    
    overtimeRate: string; setOvertimeRate: (v: string) => void;
    
    dynamicPrices: DynamicPrice[];
    setDynamicPrices: React.Dispatch<React.SetStateAction<DynamicPrice[]>>;
    
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
    dynamicPrices, setDynamicPrices,
    lastMinuteDocs, setLastMinuteDocs,
    policyDocs, setPolicyDocs
}: Props) {
    const [isDynamicPricingModalOpen, setIsDynamicPricingModalOpen] = React.useState(false);
    const [dpFrom, setDpFrom] = React.useState('');
    const [dpTo, setDpTo] = React.useState('');
    const [dpPrice, setDpPrice] = React.useState('');

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

    const handleSaveDynamicPrice = () => {
        if (dpFrom && dpTo && dpPrice) {
            setDynamicPrices(prev => [...prev, { id: Math.random().toString(36).substring(7), fromDate: dpFrom, toDate: dpTo, price: dpPrice }]);
            setDpFrom(''); setDpTo(''); setDpPrice('');
            setIsDynamicPricingModalOpen(false);
        }
    };

    const formatDateRange = (from: string, to: string) => {
        const fromD = new Date(from);
        const toD = new Date(to);
        const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${fromD.toLocaleDateString('en-GB', formatOptions)} - ${toD.toLocaleDateString('en-GB', formatOptions)}`;
    };

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

            {/* ── Dynamic Pricing ── */}
            <div className="flex items-center justify-between px-2 mt-2">
                <div className="flex flex-col">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Dynamic Pricing (Optional)</span>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">Adjust your price by season, dates, or guest count</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={dynamicPrices.length > 0} onChange={() => { if (dynamicPrices.length === 0) setIsDynamicPricingModalOpen(true); else setDynamicPrices([]); }} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04222D]"></div>
                </label>
            </div>

            {dynamicPrices.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">DYNAMIC PRICING</span>
                        <button type="button" onClick={() => setIsDynamicPricingModalOpen(true)} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                            Add Dynamic Pricing <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {dynamicPrices.map((dp, idx) => (
                            <div key={dp.id} className="bg-white p-4 rounded-[12px] border border-[#E4E4E7] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <div className="flex flex-col gap-1">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303]">Date Range</span>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B]">{formatDateRange(dp.fromDate, dp.toDate)}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Rs. {dp.price}</span>
                                    <button onClick={() => setDynamicPrices(prev => prev.filter(p => p.id !== dp.id))} className="text-[#FF3B30] hover:text-red-700 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {isDynamicPricingModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white w-full max-w-[400px] rounded-[24px] overflow-hidden flex flex-col shadow-xl p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD DYNAMIC PRICING</span>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303]">Dynamic Pricing</h3>
                            </div>
                            <button onClick={() => setIsDynamicPricingModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-1">
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#3F3F47] pl-1">From</label>
                                    <div className="relative">
                                        <input type="date" value={dpFrom} onChange={e => setDpFrom(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-[#030303] cursor-pointer" />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#3F3F47] pl-1">To</label>
                                    <div className="relative">
                                        <input type="date" value={dpTo} onChange={e => setDpTo(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-[#030303] cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#3F3F47] pl-1">Set Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#030303] text-[15px] font-normal" style={{ fontFamily: 'Figtree, sans-serif' }}>Rs.</span>
                                    <input type="text" placeholder="20,000" value={dpPrice} onChange={e => setDpPrice(e.target.value)} className={`${INPUT} pl-11`} />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleSaveDynamicPrice}
                                disabled={!dpFrom || !dpTo || !dpPrice}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`w-full py-4 mt-2 text-white rounded-[52px] font-semibold text-[16px] tracking-wide transition-colors ${(!dpFrom || !dpTo || !dpPrice) ? 'bg-[#8B9A9F] cursor-not-allowed' : 'bg-[#04222D] hover:bg-[#031820]'}`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
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
