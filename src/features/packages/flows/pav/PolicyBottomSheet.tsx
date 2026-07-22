import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Edit3, Trash2 } from 'lucide-react';
import { PolicyFile } from '../../shared/types';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    onSaveDocs: (docs: PolicyFile[]) => void;
    initialDocs?: PolicyFile[];
}

export default function PolicyBottomSheet({ isOpen, onClose, title, subtitle, onSaveDocs, initialDocs = [] }: Props) {
    const [view, setView] = useState<'main' | 'write' | 'upload'>('main');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [docs, setDocs] = useState<PolicyFile[]>([]);
    const [textPolicy, setTextPolicy] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setView('main');
            setTextPolicy('');
            
            // Check if initialDocs contains a preset doc vs actual uploaded files
            const presetDoc = initialDocs.find(d => !d.file && (d.size === 0 || !d.size) && (d.name.includes('Flexible') || d.name.includes('Standard') || d.name.includes('Strict')));
            if (presetDoc) {
                if (presetDoc.name.includes('Flexible')) setSelectedPreset('Flexible');
                else if (presetDoc.name.includes('Standard')) setSelectedPreset('Standard');
                else if (presetDoc.name.includes('Strict')) setSelectedPreset('Strict');
                else setSelectedPreset(null);

                setDocs(initialDocs.filter(d => d !== presetDoc));
            } else {
                setSelectedPreset(null);
                setDocs(initialDocs);
            }
        }
    }, [isOpen, initialDocs]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size,
                file: file
            }));
            setDocs(prev => [...prev, ...newFiles]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setDocs(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveTextPolicy = () => {
        if (textPolicy.trim()) {
            const textFile = new File([textPolicy], `Written_Policy_${Date.now()}.txt`, { type: 'text/plain' });
            setDocs(prev => [...prev, { name: textFile.name, size: textFile.size, file: textFile }]);
        }
        setView('main');
    };

    const handleSave = () => {
        let finalDocs = [...docs];
        if (finalDocs.length === 0 && selectedPreset) {
            finalDocs = [{ name: `${selectedPreset} Cancellation Policy`, size: 0 }];
        }
        onSaveDocs(finalDocs);
        onClose();
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
                    
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md mx-auto bg-white rounded-t-[24px] flex flex-col min-h-[50vh] max-h-[90vh] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-[#E4E4E7] rounded-full" />
                        </div>

                        {view === 'main' && (
                            <div className="flex flex-col flex-1">
                                <div className="flex items-start justify-between px-6 pt-2 pb-4">
                                    <div className="flex flex-col gap-1.5 pr-4">
                                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] leading-none">{title}</h2>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B]">{subtitle}</p>
                                    </div>
                                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] hover:bg-gray-200 transition-colors shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="px-6 flex flex-col gap-4 overflow-y-auto pb-4 max-h-[60vh]">
                                    {/* Cancellation Policy Presets */}
                                    {title.toLowerCase().includes('cancellation') && (
                                        <div className="flex flex-col gap-3">
                                            {[
                                                { id: 'flexible', name: 'Flexible', desc: 'Full refund 7 days before event. 50% refund after.' },
                                                { id: 'standard', name: 'Standard', desc: 'Full refund 30 days before. No refund within 14 days.' },
                                                { id: 'strict', name: 'Strict', desc: 'Non-refundable deposit. No cancellations permitted.' }
                                            ].map((preset) => {
                                                const isSelected = selectedPreset === preset.name;
                                                return (
                                                    <div 
                                                        key={preset.id}
                                                        onClick={() => {
                                                            setSelectedPreset(prev => prev === preset.name ? null : preset.name);
                                                        }}
                                                        className={`p-4 border rounded-[16px] cursor-pointer transition-all flex items-start justify-between ${
                                                            isSelected ? 'border-[#04222D] bg-[#F4F4F5]/50 ring-1 ring-[#04222D]' : 'border-[#E4E4E7] hover:border-gray-400 bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{preset.name}</span>
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] leading-relaxed">{preset.desc}</span>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                            isSelected ? 'bg-[#04222D] text-white' : 'border-2 border-[#D4D4D8]'
                                                        }`}>
                                                            {isSelected && <span className="text-[10px]">✓</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div className="p-3 bg-[#F4F4F5] rounded-[12px] flex items-start gap-2 text-[#71717B] text-[12px]">
                                                <span className="text-[14px]">ⓘ</span>
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }}>
                                                    Not sure which to choose? Flexible is the most common for new vendors and the easiest for customers to accept.
                                                </span>
                                            </div>

                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] mt-2 block">
                                                Already have your own policy?
                                            </span>
                                        </div>
                                    )}

                                    <div 
                                        onClick={() => setView('upload')}
                                        className="flex items-center gap-4 p-4 border border-[#E4E4E7] rounded-[16px] cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47]">
                                            <UploadCloud size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">Upload Document</span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B]">Add your policy as a PDF</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center relative">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E4E4E7]"></div></div>
                                        <div className="relative bg-white px-3"><span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9]">or</span></div>
                                    </div>

                                    <div 
                                        onClick={() => setView('write')}
                                        className="flex items-center gap-4 p-4 border border-[#E4E4E7] rounded-[16px] cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47]">
                                            <Edit3 size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">Write your own</span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B]">Opens a full editor to write. This will be reviewed by our team</span>
                                        </div>
                                    </div>

                                    {docs.length > 0 && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] mb-1">Attached Policies ({docs.length})</span>
                                            {docs.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 border border-[#E4E4E7] rounded-[8px] bg-gray-50">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47] truncate pr-4 font-medium">{doc.name}</span>
                                                    <button onClick={() => removeFile(idx)} className="text-[#9F9FA9] hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-white border-t border-[#F4F4F5] mt-auto">
                                    <button 
                                        onClick={handleSave}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full py-4 bg-[#04222D] hover:bg-[#031820] text-white rounded-[12px] font-bold text-[16px] transition-colors"
                                    >
                                        Save Policy
                                    </button>
                                </div>
                            </div>
                        )}

                        {view === 'write' && (
                            <div className="flex flex-col flex-1 h-[70vh]">
                                <div className="flex items-start justify-between px-6 pt-2 pb-4">
                                    <div className="flex flex-col gap-1.5 pr-4">
                                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] leading-none">Write your own</h2>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B]">Write about your policy</p>
                                    </div>
                                    <button onClick={() => setView('main')} className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] hover:bg-gray-200 transition-colors shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="px-6 flex-1 flex flex-col pb-4">
                                    <textarea 
                                        value={textPolicy}
                                        onChange={e => setTextPolicy(e.target.value)}
                                        placeholder="Type your policy details here..."
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="flex-1 w-full p-4 border border-[#E4E4E7] rounded-[12px] text-[14px] text-[#030303] focus:outline-none focus:border-[#04222D] resize-none"
                                    />
                                </div>
                                <div className="p-6 bg-white border-t border-[#F4F4F5] mt-auto flex gap-4">
                                    <button 
                                        onClick={() => setView('main')}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="flex-1 py-4 bg-white border border-[#E4E4E7] hover:bg-gray-50 text-[#030303] rounded-[12px] font-bold text-[16px] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveTextPolicy}
                                        disabled={!textPolicy.trim()}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="flex-1 py-4 bg-[#04222D] hover:bg-[#031820] text-white rounded-[12px] font-bold text-[16px] transition-colors disabled:opacity-50"
                                    >
                                        Save Policy
                                    </button>
                                </div>
                            </div>
                        )}

                        {view === 'upload' && (
                            <div className="flex flex-col flex-1">
                                <div className="flex items-start justify-between px-6 pt-2 pb-4">
                                    <div className="flex flex-col gap-1.5 pr-4">
                                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] leading-none">Upload Documents</h2>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B]">Add your policy as a PDF</p>
                                    </div>
                                    <button onClick={() => setView('main')} className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] hover:bg-gray-200 transition-colors shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="px-6 flex-1 flex flex-col pb-4 gap-4">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 border-2 border-dashed border-[#E4E4E7] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#3F3F47] border border-[#E4E4E7]">
                                            <UploadCloud size={20} />
                                        </div>
                                        <div className="text-center">
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">Tap to Upload media</p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">PDF, Max 50 MB each</p>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} multiple />
                                    </div>

                                    {docs.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            {docs.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 border border-[#E4E4E7] rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[#3F3F47] shrink-0 font-bold text-[10px]">DOC</div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] truncate">{doc.name}</span>
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B]">{doc.size ? `${Math.round((doc.size) / 1024 / 1024 * 10) / 10} MB` : 'File attached'}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFile(idx)} className="text-[#3F3F47] p-2 hover:bg-gray-100 rounded-full">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 bg-white border-t border-[#F4F4F5] mt-auto">
                                    <button 
                                        onClick={() => setView('main')}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="w-full py-4 bg-[#04222D] hover:bg-[#031820] text-white rounded-[12px] font-bold text-[16px] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return null;
}
