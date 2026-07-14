import React from 'react';
import { X, ChevronRight, Plus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PAVAddonSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPreset: (presetName: string, presetSubtitle: string) => void;
    onCustom: () => void;
}

export function PAVAddonSelector({ isOpen, onClose, onSelectPreset, onCustom }: PAVAddonSelectorProps) {
    if (typeof document === 'undefined') return null;

    const presets = [
        { name: 'Drone Footage', subtitle: 'Drone Coverage' },
        { name: 'Cinematic Video', subtitle: 'Videography Deliverables' },
        { name: 'Same-day Edit', subtitle: 'Social Content(reels, SDE)' },
        { name: 'Photo Book', subtitle: 'Album / Hard Copy' },
        { name: 'Engagement Shoot', subtitle: 'Photography Deliverable' },
        { name: 'Extra Crew', subtitle: 'Additional Team Members' },
        { name: 'Equipment', subtitle: 'Extra Lighting, Drone, etc.' },
    ];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
                    {/* Backdrop */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
                    
                    {/* Bottom Sheet */}
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md mx-auto bg-white rounded-t-[24px] flex flex-col max-h-[90vh] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
                    >
                
                {/* Drag Handle */}
                <div className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-[#E4E4E7] rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-2 pb-5">
                    <div className="flex flex-col gap-1.5">
                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[22px] font-bold text-[#030303] leading-none">Add an Add-on</h2>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B]">Pick one to start, or build your own</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] hover:bg-gray-200 transition-colors mt-[-4px]">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 flex flex-col gap-3 overflow-y-auto pb-10">
                    {presets.map(preset => (
                        <div 
                            key={preset.name}
                            onClick={() => onSelectPreset(preset.name, preset.subtitle)}
                            className="p-4 border border-[#E4E4E7] rounded-[16px] flex items-center justify-between cursor-pointer hover:border-[#D4D4D8] hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">{preset.name}</span>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">{preset.subtitle}</span>
                            </div>
                            <ChevronRight size={20} className="text-[#04222D]" />
                        </div>
                    ))}
                    
                    <div 
                        onClick={onCustom}
                        className="p-4 border border-[#E4E4E7] rounded-[16px] flex items-center gap-4 cursor-pointer hover:border-[#D4D4D8] hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-2"
                    >
                        <div className="w-10 h-10 rounded-[12px] bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                            <Plus size={20} className="text-[#030303]" />
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">Add a custom add-on</span>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">e.g. Drone shot, Live streaming</span>
                        </div>
                        <ChevronRight size={20} className="text-[#04222D]" />
                    </div>
                </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
