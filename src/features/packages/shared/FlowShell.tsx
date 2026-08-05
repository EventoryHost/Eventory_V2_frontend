'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Menu, Plus, ChevronDown, MoreHorizontal,
    Copy, Pencil, Trash2, X
} from 'lucide-react';
import { VariantManager } from '../components/VariantManager';

interface FlowConfig {
    vendorName: string;
    steps: string[];
}

interface FlowShellProps {
    config: FlowConfig;
    step: number;
    children: React.ReactNode;
    onBack: () => void;
    onNext: () => void;
    // Variant Manager Props
    packageId?: string | null;
    packageGroupId?: string | null;
    vendorType: string;
    onVariantChange?: (newId: string) => void;
    
    // Legacy Variant props (keep optional so we don't break parent flows until we update them if needed)
    variants?: string[];
    selectedVariant?: string;
    onSelectVariant?: (v: string) => void;
    isAddingVariant?: boolean;
    newVariantName?: string;
    onSetNewVariantName?: (v: string) => void;
    onAddVariant?: (e?: React.KeyboardEvent) => void;
    onStartAddingVariant?: () => void;
    isVariantModalOpen?: boolean;
    variantToManage?: string;
    variantAction?: 'none' | 'rename' | 'delete';
    renameVariantValue?: string;
    onSetRenameVariantValue?: (v: string) => void;
    onOpenVariantModal?: (v: string) => void;
    onCloseVariantModal?: () => void;
    onSetVariantAction?: (a: 'none' | 'rename' | 'delete') => void;
    onDuplicateVariant?: () => void;
    onRenameVariant?: () => void;
    onDeleteVariant?: () => void;
    isSaving?: boolean;
    saveLabel?: string;
    onSaveDraft?: () => void;
}

export default function FlowShell({
    config,
    step,
    children,
    onBack,
    onNext,
    variants,
    selectedVariant,
    onSelectVariant,
    isAddingVariant,
    newVariantName,
    onSetNewVariantName,
    onAddVariant,
    onStartAddingVariant,
    isVariantModalOpen,
    variantToManage,
    variantAction,
    renameVariantValue,
    onSetRenameVariantValue,
    onOpenVariantModal,
    onCloseVariantModal,
    onSetVariantAction,
    onDuplicateVariant,
    onRenameVariant,
    onDeleteVariant,
    packageId,
    packageGroupId,
    vendorType,
    onVariantChange,
    isSaving = false,
    saveLabel,
    onSaveDraft,
}: FlowShellProps) {
    return (
        <div className="min-h-screen bg-white relative overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white z-20 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-[#030303]" />
                    </button>
                    <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">New Package</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSaveDraft}
                        disabled={isSaving}
                        className="px-4 py-2 text-[14px] font-semibold text-[#3F3F47] hover:bg-gray-50 rounded-full transition-colors disabled:opacity-40"
                    >Save Draft</button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Menu size={24} className="text-[#030303]" /></button>
                </div>
            </div>

            {/* Variant Manager */}
            {packageId && packageGroupId && vendorType && onVariantChange && (
                <div className="px-6 pt-6 bg-white">
                    <div className="max-w-md mx-auto">
                        <VariantManager 
                            packageId={packageId}
                            packageGroupId={packageGroupId}
                            vendorType={vendorType}
                            onVariantChange={onVariantChange}
                        />
                    </div>
                </div>
            )}

            {/* Stepper */}
            <div className="px-6 py-6 bg-white border-b border-gray-50">
                <div className="max-w-md mx-auto flex flex-col gap-1">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider">
                        STEP {step} OF {config.steps.length}
                    </span>
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-[600] text-[#030303] leading-[28px] tracking-[0px] mb-2">
                        {config.steps[step - 1]}
                    </h2>
                    <div className="h-[6px] w-full bg-[#E4E4E7] rounded-full">
                        <div
                            className="h-full bg-[#04222D] transition-all duration-300 ease-in-out rounded-full"
                            style={{ width: `${(step / config.steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="px-6 pt-6 pb-48 max-w-md mx-auto w-full min-w-0">
                <div className="flex flex-col gap-8 w-full min-w-0">
                    {children}
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 p-6 bg-white border-t border-gray-50 z-20 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4 w-full">
                    {step > 1 && (
                        <button
                            onClick={onBack}
                            disabled={isSaving}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="flex-1 h-14 flex justify-center items-center bg-white border border-[#E4E4E7] text-gray-900 rounded-[12px] font-semibold text-[16px] whitespace-nowrap px-4 sm:px-8 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        disabled={isSaving}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`flex-1 h-14 flex justify-center items-center gap-4 bg-[#04222D] text-white rounded-[12px] font-semibold text-[16px] whitespace-nowrap px-4 sm:px-8 active:scale-[0.98] transition-transform ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-95'}`}
                    >
                        {isSaving ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                            </div>
                        ) : (
                            saveLabel || (step === config.steps.length ? 'Publish Package' : 'Save & Next')
                        )}
                    </button>
                </div>
            </div>

            {/* Variant Modals */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence mode="wait">
                    {isVariantModalOpen && (
                        <>
                            {variantAction === 'none' && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/40 flex items-end z-[100]"
                                    onClick={onCloseVariantModal}
                                >
                                    <motion.div
                                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className="w-full max-w-md mx-auto bg-white rounded-t-[24px] p-6 pb-8"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">MANAGE VARIANT</p>
                                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-gray-900 mb-6">{variantToManage}</h2>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={onDuplicateVariant} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-[12px] transition-colors text-left">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0"><Copy size={18} className="text-gray-900" /></div>
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-gray-900">Duplicate Variant</span>
                                            </button>
                                            <button onClick={() => { onSetRenameVariantValue?.(variantToManage || ''); onSetVariantAction?.('rename'); }} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-[12px] transition-colors text-left">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0"><Pencil size={18} className="text-gray-900" /></div>
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-gray-900">Rename Variant</span>
                                            </button>
                                            <button onClick={() => onSetVariantAction?.('delete')} className="flex items-center gap-4 w-full p-4 hover:bg-red-50 rounded-[12px] transition-colors text-left">
                                                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0"><Trash2 size={18} className="text-[#DE350B]" /></div>
                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#DE350B]">Delete Variant</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                            {variantAction === 'rename' && (
                                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100]" onClick={() => onSetVariantAction?.('none')}>
                                     <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white rounded-[24px] p-6 relative" onClick={(e) => e.stopPropagation()}>
                                         <button onClick={() => onSetVariantAction?.('none')} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"><X size={18} /></button>
                                         <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">ACTION REQUIRED</p>
                                         <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-gray-900 mb-2">Rename Variant</h2>
                                         <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-gray-600 mb-6 leading-relaxed">Enter a new name for this variant to keep your crew setup organized.</p>
                                         <div className="mb-6">
                                             <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-gray-600 mb-2">Variant Name</label>
                                             <input type="text" value={renameVariantValue} onChange={(e) => onSetRenameVariantValue?.(e.target.value)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full p-3.5 bg-white border border-gray-300 rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                                         </div>
                                         <button onClick={onRenameVariant} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-4 bg-[#04222D] text-white rounded-[12px] font-semibold text-[16px] hover:bg-opacity-90 transition-colors">Save</button>
                                     </motion.div>
                                </motion.div>
                            )}
                            {variantAction === 'delete' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100]" onClick={() => onSetVariantAction?.('none')}>
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white rounded-[24px] p-6 pt-8 flex flex-col items-center text-center relative" onClick={(e) => e.stopPropagation()}>
                                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-6"><Trash2 size={24} className="text-[#DE350B]" /></div>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">ACTION REQUIRED</p>
                                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-gray-900 mb-4">Delete Variant</h2>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-gray-600 mb-2 leading-relaxed">Are you sure you want to delete the &ldquo;{variantToManage}&rdquo; variant?</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-gray-600 mb-6 leading-relaxed">All associated configurations will be permanently removed.</p>
                                        <button onClick={onDeleteVariant} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-4 bg-[#DE350B] text-white rounded-[12px] font-semibold text-[16px] mb-4 hover:bg-opacity-90 transition-colors">Delete</button>
                                        <button onClick={() => onSetVariantAction?.('none')} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-2 text-[#9F9FA9] font-semibold text-[16px] hover:text-gray-900 transition-colors">Cancel</button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
