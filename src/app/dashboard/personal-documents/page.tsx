'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldAlert, FileCheck, FileText, Upload, ChevronUp, ChevronDown, User, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

export default function PersonalDocumentsPage() {
    const router = useRouter();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocumentToUpload, setSelectedDocumentToUpload] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
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
        setInputValue('');
    };

    const submitDocument = async () => {
        if (!inputValue || !selectedDocumentToUpload) {
            alert("Please enter the document number first.");
            return;
        }

        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
            
            let updatePayload: any = {};
            if (selectedDocumentToUpload === 'Aadhaar Card') updatePayload.aadharNumber = inputValue;
            if (selectedDocumentToUpload === 'GST Number') updatePayload.gstNumber = inputValue;
            if (selectedDocumentToUpload === 'PAN Card') updatePayload.panNumber = inputValue;

            // Optimistic update
            setVendor({ ...vendor, ...updatePayload });
            
            await fetch(`${baseUrl}/vendors/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });
            
            setIsUploadModalOpen(false);
            setInputValue('');
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

    // Determine missing docs based on document numbers (ignoring legacy 'Uploaded' dummy string)
    const missingDocs = [];
    if ((!vendor?.aadharNumber || vendor?.aadharNumber === 'Uploaded') && !vendor?.isAadharVerified) missingDocs.push("Aadhaar Card");
    if ((!vendor?.gstNumber || vendor?.gstNumber === 'Uploaded') && !vendor?.isGstVerified) missingDocs.push("GST Number");
    if ((!vendor?.panNumber || vendor?.panNumber === 'Uploaded') && !vendor?.isPanVerified) missingDocs.push("PAN Card");

    const getDocStatus = (docName: string) => {
        const baseCloudfrontUrl = 'https://dkuacgndftndz.cloudfront.net/Menu_Components';
        let imgSrc = '';
        if (docName === 'Aadhaar Card') imgSrc = `${baseCloudfrontUrl}/adhaar.png`;
        if (docName === 'GST Number') imgSrc = `${baseCloudfrontUrl}/gst%20number.png`;
        if (docName === 'PAN Card') imgSrc = `${baseCloudfrontUrl}/pan.png`;

        if (docName === 'Aadhaar Card') {
            if (vendor?.isAadharVerified) return { status: 'VERIFIED', color: 'text-[#10B981]', imgSrc };
            if (vendor?.aadharNumber && vendor.aadharNumber !== 'Uploaded') return { status: 'UNDER REVIEW', color: 'text-[#E85D04]', imgSrc };
            return { status: 'REQUIRED', color: 'text-[#71717B] dark:text-[#A1A1AA]', imgSrc };
        }
        if (docName === 'GST Number') {
            if (vendor?.isGstVerified) return { status: 'VERIFIED', color: 'text-[#10B981]', imgSrc };
            if (vendor?.gstNumber && vendor.gstNumber !== 'Uploaded') return { status: 'UNDER REVIEW', color: 'text-[#E85D04]', imgSrc };
            return { status: 'REQUIRED', color: 'text-[#71717B] dark:text-[#A1A1AA]', imgSrc };
        }
        if (docName === 'PAN Card') {
            if (vendor?.isPanVerified) return { status: 'VERIFIED', color: 'text-[#10B981]', imgSrc };
            if (vendor?.panNumber && vendor.panNumber !== 'Uploaded') return { status: 'UNDER REVIEW', color: 'text-[#E85D04]', imgSrc };
            return { status: 'REQUIRED', color: 'text-[#71717B] dark:text-[#A1A1AA]', imgSrc };
        }
        return { status: 'UNKNOWN', color: 'text-gray-500', imgSrc };
    };

    const renderDocCard = (docName: string) => {
        const { status, color, imgSrc } = getDocStatus(docName);
        
        return (
            <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[8px] p-4 flex items-center justify-between mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4">
                    <div className="w-[44px] h-[44px] flex items-center justify-center shrink-0">
                        <img src={imgSrc} alt={docName} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" />
                    </div>
                    <div>
                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white mb-0.5">{docName}</h4>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[10px] font-bold uppercase ${color}`}>{status}</span>
                    </div>
                </div>
                
                {status === 'REQUIRED' ? (
                    <button 
                        onClick={() => handleUploadClick(docName)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="bg-[#031B24] dark:bg-[#E95A6E] text-white text-[12px] font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform whitespace-nowrap shadow-sm"
                    >
                        Link {docName.split(' ')[0]}
                    </button>
                ) : (
                    <button 
                        onClick={() => handleUploadClick(docName)}
                        className="flex items-center gap-1.5 active:scale-95 transition-transform"
                    >
                        <RefreshCcw className="w-[14px] h-[14px] text-[#030303] dark:text-white" strokeWidth={2} />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] dark:text-white">Update</span>
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
                {renderDocCard('PAN Card')}
                {renderDocCard('GST Number')}

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

            {/* Bottom Sheet Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUploadModalOpen(false)}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#1E1E1B] rounded-t-[24px] p-6 pb-10 flex flex-col"
                            style={{ maxHeight: '90vh' }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">
                                    Add {selectedDocumentToUpload === 'GST Number' ? 'GST number' : selectedDocumentToUpload === 'Aadhaar Card' ? 'Aadhaar card number' : 'Pan card number'}
                                </h2>
                                <button 
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F47] transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#030303] dark:text-white" />
                                </button>
                            </div>

                            <div className="w-full aspect-[1.6/1] bg-[#F8F9FA] dark:bg-[#27272A] rounded-[24px] border border-[#E5E7EB] dark:border-[#3F3F47] mb-8 relative flex items-center justify-center overflow-hidden shadow-sm">
                                {selectedDocumentToUpload === 'PAN Card' && (
                                    <>
                                        <img 
                                            src="/images/pan_card_template.png" 
                                            alt="PAN Card" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/F8F9FA/999?text=PAN+Card'}
                                        />
                                        <div className="absolute bottom-6 bg-white/95 dark:bg-[#1E1E1B]/95 backdrop-blur-md px-5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#3F3F47] shadow-lg">
                                            <p className="text-[14px] font-bold tracking-[3px] text-[#030303] dark:text-white flex items-center gap-3">
                                                <span className="text-[10px] font-medium tracking-normal text-[#71717B] dark:text-[#A1A1AA] uppercase opacity-80">PAN no.</span>
                                                {inputValue ? inputValue.toUpperCase().padEnd(10, '•') : 'ABCDE1234F'}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {selectedDocumentToUpload === 'Aadhaar Card' && (
                                    <>
                                        <img 
                                            src="/images/aadhar_card_template.png" 
                                            alt="Aadhar Card" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/F8F9FA/999?text=Aadhaar+Card'}
                                        />
                                        <div className="absolute bottom-6 bg-white/95 dark:bg-[#1E1E1B]/95 backdrop-blur-md px-5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#3F3F47] shadow-lg">
                                            <p className="text-[14px] font-bold tracking-[3px] text-[#030303] dark:text-white flex items-center gap-3">
                                                <span className="text-[10px] font-medium tracking-normal text-[#71717B] dark:text-[#A1A1AA] uppercase opacity-80">Aadhar no.</span>
                                                {inputValue ? inputValue.replace(/(.{4})/g, '$1 ').trim().padEnd(14, '•') : '0000 1111 2222'}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {selectedDocumentToUpload === 'GST Number' && (
                                    <>
                                        <img 
                                            src="/images/gst_certificate_template.png" 
                                            alt="GST Certificate" 
                                            className="w-full h-full object-cover opacity-70"
                                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/F8F9FA/999?text=GST+Certificate'}
                                        />
                                        <div className="absolute bottom-6 bg-white/95 dark:bg-[#1E1E1B]/95 backdrop-blur-md px-5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#3F3F47] shadow-lg">
                                            <p className="text-[14px] font-bold tracking-[2px] text-[#030303] dark:text-white flex items-center gap-3">
                                                <span className="text-[10px] font-medium tracking-normal text-[#71717B] dark:text-[#A1A1AA] uppercase opacity-80">GSTIN</span>
                                                {inputValue ? inputValue.toUpperCase().padEnd(15, '•') : '12ABCD345E6F7'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#3F3F47] dark:text-[#E4E4E7] mb-2 block">
                                {selectedDocumentToUpload === 'GST Number' ? 'GST number' : selectedDocumentToUpload === 'Aadhaar Card' ? 'Aadhaar card number' : 'PAN card number'}
                            </label>
                            
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                                placeholder={selectedDocumentToUpload === 'GST Number' ? '29GGGGG1314R9Z6' : selectedDocumentToUpload === 'Aadhaar Card' ? '0000 0000 0000' : 'ABCDE1234F'}
                                className="w-full h-[52px] px-4 rounded-[12px] border border-[#E4E4E7] dark:border-[#3F3F47] bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] mb-6 uppercase"
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                            />

                            <button 
                                onClick={submitDocument}
                                disabled={!inputValue}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`w-full h-[52px] rounded-[12px] text-[16px] font-bold transition-all active:scale-[0.98] flex items-center justify-center
                                    ${inputValue 
                                        ? 'bg-[#04222D] dark:bg-[#E95A6E] text-white' 
                                        : 'bg-[#94A3B8] dark:bg-[#475569] text-white/90 cursor-not-allowed'
                                    }`}
                            >
                                Continue
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
