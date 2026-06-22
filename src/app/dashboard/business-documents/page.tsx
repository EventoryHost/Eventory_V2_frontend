'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Info, ShieldAlert, FileCheck, FileClock, CloudUpload, Upload, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessDocumentsPage() {
    const router = useRouter();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocumentToUpload, setSelectedDocumentToUpload] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleUploadClick = (docName: string) => {
        setSelectedDocumentToUpload(docName);
        setIsUploadModalOpen(true);
        setSelectedFile(null);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-transparent">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white">Documents</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            <div className="px-5 mt-4">
                {/* Alert Box */}
                <div className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#1E3A8A] rounded-[16px] p-5 mb-8 flex gap-3">
                    <ShieldAlert className="w-[20px] h-[20px] text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#1D4ED8] dark:text-[#60A5FA] mb-1">Verification Required</h4>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#2563EB] dark:text-[#93C5FD]">Upload Trade License Document for verification.</p>
                    </div>
                </div>

                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-white mb-4">Business Documents</h3>

                {/* FSSAI License */}
                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-[42px] h-[42px] rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-[#10B981]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-0.5">FSSAI License</h4>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">VERIFIED</span>
                        </div>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center">
                        <div className="flex flex-col gap-1">
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                        </div>
                    </button>
                </div>

                {/* GST Certificate */}
                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-[42px] h-[42px] rounded-full bg-[#FFF7ED] dark:bg-[#78350F]/30 flex items-center justify-center">
                            <FileClock className="w-5 h-5 text-[#E85D04] dark:text-[#FBA94C]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-0.5">GST Certificate</h4>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#E85D04] dark:text-[#FBA94C] uppercase tracking-wider">UNDER REVIEW</span>
                        </div>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center">
                        <div className="flex flex-col gap-1">
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                        </div>
                    </button>
                </div>

                {/* Trade License (Needs Upload) */}
                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] shadow-sm overflow-hidden mb-4">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-[42px] h-[42px] rounded-full bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                <CloudUpload className="w-5 h-5 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-0.5">Trade License</h4>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#71717B] dark:text-[#A1A1AA] uppercase tracking-wider">REQUIRED DOCUMENT</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleUploadClick('Trade License')}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold px-5 py-2.5 rounded-[8px] active:scale-95 transition-transform"
                        >
                            Upload
                        </button>
                    </div>
                    
                    <div className="border-t border-[#F4F4F5] dark:border-[#27272A] p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#27272A]/50 transition-colors">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA]">Document Reference Image</span>
                        <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white dark:bg-[#1E1E1B] w-full max-w-[340px] rounded-[28px] p-6 flex flex-col items-center shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setIsUploadModalOpen(false)}
                                className="absolute right-6 top-6 text-[#A1A1AA] hover:text-[#030303] dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-16 h-16 bg-[#FAFAFA] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4 mt-2">
                                <Upload className="w-6 h-6 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                            </div>
                            
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-2 text-center w-full block">Action Required</span>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white mb-6 leading-tight text-center">Upload Requires Documents</h3>
                            
                            <div className="w-full">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-2 pl-1">{selectedDocumentToUpload || 'DOCUMENT NAME'}</span>
                                
                                <label 
                                    htmlFor="document-upload"
                                    className="border-[1.5px] border-dashed border-[#3B82F6] dark:border-[#60A5FA] bg-[#EFF6FF]/50 dark:bg-[#1E3A8A]/10 rounded-[4px] p-8 flex flex-col items-center justify-center mb-6 hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/20 transition-colors cursor-pointer group relative overflow-hidden"
                                >
                                    <input 
                                        type="file" 
                                        id="document-upload" 
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                    />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-[#ECFDF5] dark:bg-[#064E3B] shadow-sm border border-[#A7F3D0] dark:border-[#047857] rounded-full flex items-center justify-center mb-4">
                                                <Upload className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                                            </div>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#10B981] mb-1 text-center truncate max-w-[200px]">
                                                {selectedFile.name}
                                            </p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] mb-4">Ready to submit</p>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white uppercase tracking-wide">CHANGE FILE</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white dark:bg-[#1E1E1B] shadow-sm border border-[#F4F4F5] dark:border-[#27272A] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                                <Upload className="w-5 h-5 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                                            </div>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#030303] dark:text-[#FAFAFA] mb-1 text-center">Upload Required Documents</p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] mb-4 text-center">PDF, DOC up to 10MB</p>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white uppercase tracking-wide">BROWSE FILES</span>
                                        </>
                                    )}
                                </label>
                                
                                <button 
                                    onClick={() => {
                                        if (selectedFile) {
                                            // Handle document submit logic
                                            setIsUploadModalOpen(false);
                                            setSelectedFile(null);
                                            alert(`${selectedDocumentToUpload} submitted successfully for review!`);
                                        } else {
                                            alert("Please select a document first.");
                                        }
                                    }}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full py-[16px] bg-[#04222D] dark:bg-[#E95A6E] text-white font-bold rounded-[12px] text-[15px] active:scale-[0.98] transition-transform"
                                >
                                    Submit Document
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
