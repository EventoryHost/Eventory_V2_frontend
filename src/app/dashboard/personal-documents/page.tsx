'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldAlert, FileCheck, FileText, Upload, ChevronUp, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

export default function PersonalDocumentsPage() {
    const router = useRouter();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocumentToUpload, setSelectedDocumentToUpload] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isReferenceOpen, setIsReferenceOpen] = useState(true);
    
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const res = await fetch(`${baseUrl}/vendors/${vendorId}`);
                if (res.ok) {
                    const responseJson = await res.json();
                    setVendor(responseJson.data || responseJson);
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    const handleUploadClick = (docName: string) => {
        setSelectedDocumentToUpload(docName);
        setIsUploadModalOpen(true);
        setSelectedFile(null);
    };

    const submitDocument = async () => {
        if (!selectedFile || !selectedDocumentToUpload) {
            alert("Please select a document first.");
            return;
        }

        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
            
            // Generate dummy field updates for optimistic UI update and backend save
            // Realistically you'd upload the file and set the URL, and maybe isVerified = false to trigger review
            let updatePayload: any = {};
            if (selectedDocumentToUpload === 'Aadhaar Card') updatePayload.aadharNumber = 'Uploaded';
            if (selectedDocumentToUpload === 'GST Number') updatePayload.gstNumber = 'Uploaded';
            if (selectedDocumentToUpload === 'PAN Card') updatePayload.panNumber = 'Uploaded';

            // Optimistic update
            setVendor({ ...vendor, ...updatePayload });
            
            await fetch(`${baseUrl}/vendors/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });
            
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            alert(`${selectedDocumentToUpload} submitted successfully for review!`);
        } catch (error) {
            console.error("Failed to submit document", error);
            alert("Failed to submit document. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Determine missing documents
    const missingDocs = [];
    if (!vendor?.aadharNumber && !vendor?.isAadharVerified) missingDocs.push("Aadhaar Card");
    if (!vendor?.gstNumber && !vendor?.isGstVerified) missingDocs.push("GST Number");
    if (!vendor?.panNumber && !vendor?.isPanVerified) missingDocs.push("PAN Card");

    const getDocStatus = (docName: string) => {
        if (docName === 'Aadhaar Card') {
            if (vendor?.isAadharVerified) return { status: 'VERIFIED', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]', icon: FileCheck };
            if (vendor?.aadharNumber) return { status: 'UNDER REVIEW', color: 'text-[#E85D04]', bg: 'bg-[#FFF7ED] dark:bg-[#78350F]/30', icon: FileText };
            return { status: 'REQUIRED DOCUMENT', color: 'text-[#71717B] dark:text-[#A1A1AA]', bg: 'bg-[#F4F4F5] dark:bg-[#27272A]', icon: FileText };
        }
        if (docName === 'GST Number') {
            if (vendor?.isGstVerified) return { status: 'VERIFIED', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]', icon: FileCheck };
            if (vendor?.gstNumber) return { status: 'UNDER REVIEW', color: 'text-[#E85D04]', bg: 'bg-[#FFF7ED] dark:bg-[#78350F]/30', icon: FileText };
            return { status: 'REQUIRED DOCUMENT', color: 'text-[#71717B] dark:text-[#A1A1AA]', bg: 'bg-[#F4F4F5] dark:bg-[#27272A]', icon: FileText };
        }
        if (docName === 'PAN Card') {
            if (vendor?.isPanVerified) return { status: 'VERIFIED', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]', icon: FileCheck };
            if (vendor?.panNumber) return { status: 'UNDER REVIEW', color: 'text-[#E85D04]', bg: 'bg-[#FFF7ED] dark:bg-[#78350F]/30', icon: FileText };
            return { status: 'REQUIRED DOCUMENT', color: 'text-[#71717B] dark:text-[#A1A1AA]', bg: 'bg-[#F4F4F5] dark:bg-[#27272A]', icon: FileText };
        }
        return { status: 'UNKNOWN', color: 'text-gray-500', bg: 'bg-gray-100', icon: FileText };
    };

    const renderDocCard = (docName: string) => {
        const { status, color, bg, icon: Icon } = getDocStatus(docName);
        
        return (
            <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center ${bg}`}>
                        <Icon className={`w-5 h-5 ${status === 'REQUIRED DOCUMENT' ? 'text-[#3F3F47] dark:text-[#A1A1AA]' : color}`} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-0.5">{docName}</h4>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{status}</span>
                    </div>
                </div>
                
                {status === 'REQUIRED DOCUMENT' ? (
                    <button 
                        onClick={() => handleUploadClick(docName)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold px-5 py-2.5 rounded-[8px] active:scale-95 transition-transform"
                    >
                        Upload
                    </button>
                ) : (
                    <button className="w-8 h-8 flex items-center justify-center">
                        <div className="flex flex-col gap-1">
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#3F3F47] dark:bg-[#A1A1AA] rounded-full"></div>
                        </div>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-transparent">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white">Personal Documents</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            <div className="px-5 mt-4">
                {/* Alert Box */}
                {missingDocs.length > 0 ? (
                    <div className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#1E3A8A] rounded-[16px] p-5 mb-8 flex gap-3">
                        <ShieldAlert className="w-[20px] h-[20px] text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#1D4ED8] dark:text-[#60A5FA] mb-1">Verification Required</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#2563EB] dark:text-[#93C5FD] leading-relaxed">
                                Complete your {missingDocs.join(', ')} documents to go live and start receiving orders.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#064E3B] rounded-[16px] p-5 mb-8 flex gap-3">
                        <FileCheck className="w-[20px] h-[20px] text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#059669] dark:text-[#34D399] mb-1">All Documents Uploaded</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#10B981] leading-relaxed">
                                You have successfully provided all required personal documents.
                            </p>
                        </div>
                    </div>
                )}

                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-white mb-4">Personal Documents</h3>

                {renderDocCard('Aadhaar Card')}
                {renderDocCard('GST Number')}
                {renderDocCard('PAN Card')}

                {/* Document Reference Image Accordion */}
                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] shadow-sm overflow-hidden mb-4 mt-8">
                    <div 
                        onClick={() => setIsReferenceOpen(!isReferenceOpen)}
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#27272A]/50 transition-colors"
                    >
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#71717B] dark:text-[#A1A1AA]">Document Reference Image</span>
                        {isReferenceOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#A1A1AA]" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                        )}
                    </div>

                    <AnimatePresence>
                        {isReferenceOpen && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-4 pb-4 overflow-hidden"
                            >
                                <div className="w-full bg-[#E4E4E7] dark:bg-[#3F3F47] rounded-[12px] h-[180px] relative overflow-hidden flex items-center justify-center mt-2">
                                    {/* Mock Aadhaar Card styling */}
                                    <div className="absolute inset-2 bg-[#F4F4F5] dark:bg-[#D4D4D8] rounded-[8px] shadow-sm p-4 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-8 h-10 border border-gray-400 flex flex-col items-center justify-center p-1">
                                                <div className="w-4 h-4 rounded-full border border-gray-500 mb-1"></div>
                                                <div className="w-full border-t border-gray-500"></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-gray-800">भारत सरकार</div>
                                                <div className="text-[8px] text-gray-700">GOVERNMENT OF INDIA</div>
                                            </div>
                                            <div className="w-6 h-6"></div>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="w-[50px] h-[60px] bg-gray-300 rounded-[4px] flex items-center justify-center overflow-hidden">
                                                <User className="w-8 h-8 text-gray-500 mt-2" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <div className="text-[12px] font-bold text-gray-800">Name XXXX</div>
                                                <div className="text-[10px] font-medium text-gray-700">DOB: XX-XX-XXXX</div>
                                                <div className="text-[10px] font-medium text-gray-700">Gender: MALE</div>
                                            </div>
                                            <div className="flex-1 flex justify-end items-end">
                                                <div className="w-[40px] h-[40px] bg-gray-800 rounded-[2px] p-0.5">
                                                    <div className="w-full h-full border border-white border-dashed"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-sm shadow-md border border-gray-200 whitespace-nowrap z-10">
                                            <span className="text-[10px] text-gray-600 mr-2">Aadhar no.</span>
                                            <span className="text-[14px] font-bold text-gray-900 tracking-wider">0000 1111 2222</span>
                                        </div>
                                        
                                        <div className="text-center mt-3 border-t border-gray-400 pt-1">
                                            <div className="text-[11px] font-bold text-gray-800">आधार - आम आदमी का अधिकार</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                                    onClick={submitDocument}
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

            <BottomNav />
        </div>
    );
}
