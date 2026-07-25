'use client';
import React, { useState, useEffect, useRef } from 'react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { X, ShieldAlert, FileCheck, FileClock, CloudUpload, Upload, ChevronDown, Eye, Trash2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus = 'VERIFIED' | 'UNDER REVIEW' | 'REQUIRED';

interface DocDef {
    key: string;          // vendor field key (for number/url)
    verifiedKey: string;  // vendor boolean field key
    label: string;
    /** optional: field that stores a document URL when uploaded via file */
    urlKey?: string;
    iconUrl: string;
}

const DOCS: DocDef[] = [
    { key: 'fssaiDoc',    verifiedKey: 'isFssaiVerified',   label: 'FSSAI License',    urlKey: 'fssaiDocUrl', iconUrl: 'https://dkuacgndftndz.cloudfront.net/Menu_Components/fssai_liscence.svg' },
    { key: 'gstDoc',      verifiedKey: 'isGstVerified',     label: 'GST Certificate',  urlKey: 'gstDocUrl',   iconUrl: 'https://dkuacgndftndz.cloudfront.net/Menu_Components/gst_cert.svg' },
    { key: 'tradeLicDoc',   verifiedKey: 'isTradeLicVerified',label: 'Trade License',    urlKey: 'tradeLicUrl', iconUrl: 'https://dkuacgndftndz.cloudfront.net/Menu_Components/trade_lisc.svg' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDocStatus(vendor: any, doc: DocDef): DocStatus {
    if (!vendor) return 'REQUIRED';
    if (vendor[doc.verifiedKey]) return 'VERIFIED';
    // Only show UNDER REVIEW when an actual document file URL exists.
    // doc.key (e.g. gstNumber) is just a registration number text field — not a file.
    if (doc.urlKey && vendor[doc.urlKey]) return 'UNDER REVIEW';
    return 'REQUIRED';
}

function statusMeta(status: DocStatus) {
    switch (status) {
        case 'VERIFIED':
            return { color: 'text-[#10B981]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]', Icon: FileCheck };
        case 'UNDER REVIEW':
            return { color: 'text-[#E85D04] dark:text-[#FBA94C]', bg: 'bg-[#FFF7ED] dark:bg-[#78350F]/30', Icon: FileClock };
        default:
            return { color: 'text-[#71717B] dark:text-[#A1A1AA]', bg: 'bg-[#F4F4F5] dark:bg-[#27272A]', Icon: CloudUpload };
    }
}

// ─── 3-dot Menu ───────────────────────────────────────────────────────────────
function DocMenu({ docUrl, docLabel, onDelete }: { docUrl?: string; docLabel: string; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-colors active:scale-95"
            >
                <MoreVertical className="w-4 h-4 text-[#3F3F47] dark:text-[#A1A1AA]" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-9 z-50 w-[148px] bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[12px] shadow-lg overflow-hidden"
                    >
                        {/* View */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                if (docUrl) window.open(docUrl, '_blank');
                                else alert(`No uploaded file for ${docLabel}.`);
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-3 text-left text-[14px] font-medium text-[#030303] dark:text-[#FAFAFA] hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-colors"
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                        >
                            <Eye className="w-4 h-4 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                            View
                        </button>
                        <div className="h-px bg-[#F4F4F5] dark:bg-[#27272A]" />
                        {/* Delete */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                if (window.confirm(`Remove ${docLabel}? It will be sent back for re-upload.`)) {
                                    onDelete();
                                }
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-3 text-left text-[14px] font-medium text-[#CC2B2B] dark:text-[#F87171] hover:bg-[#FFF5F5] dark:hover:bg-[#450A0A]/30 transition-colors"
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                        >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BusinessDocumentsPage() {
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocKey, setSelectedDocKey] = useState<DocDef | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || 'placeholder_id' : 'placeholder_id';
    

    // ── Fetch vendor data ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const res = await fetch(apiUrl(`/vendors/${vendorId}`));
                if (res.ok) {
                    const json = await res.json();
                    setVendor(json.data || json);
                }
            } catch (err) {
                console.error('Failed to fetch vendor:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    // ── Patch helper ─────────────────────────────────────────────────────────
    const patchVendor = async (payload: Record<string, any>) => {
        const res = await fetch(apiUrl(`/vendors/${vendorId}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            const json = await res.json();
            setVendor(json.data || json);
        }
    };

    // ── Delete a document ────────────────────────────────────────────────────
    const handleDelete = async (doc: DocDef) => {
        const payload: Record<string, any> = {
            [doc.verifiedKey]: false,
        };
        if (doc.urlKey) payload[doc.urlKey] = null;
        // Optimistic
        setVendor((v: any) => ({ ...v, ...payload }));
        try {
            await patchVendor(payload);
        } catch (err) {
            console.error('Failed to delete doc', err);
        }
    };

    // ── Upload document ──────────────────────────────────────────────────────
    const handleUploadClick = (doc: DocDef) => {
        setSelectedDocKey(doc);
        setSelectedFile(null);
        setIsUploadModalOpen(true);
    };

    const submitDocument = async () => {
        if (!selectedFile || !selectedDocKey) {
            alert('Please select a document first.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Upload to S3 via next.js upload route
            const form = new FormData();
            form.append('file', selectedFile);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
            if (!uploadRes.ok) {
                const errJson = await uploadRes.json().catch(() => ({}));
                throw new Error(errJson.error || 'Upload failed');
            }
            
            const uploadJson = await uploadRes.json();
            const fileUrl = uploadJson.url;

            const payload: Record<string, any> = {
                [selectedDocKey.verifiedKey]: false,      // triggers "under review"
            };
            if (selectedDocKey.urlKey && fileUrl) {
                payload[selectedDocKey.urlKey] = fileUrl;
            }

            // Optimistic update
            setVendor((v: any) => ({ ...v, ...payload }));
            await patchVendor(payload);

            setIsUploadModalOpen(false);
            setSelectedFile(null);
        } catch (err) {
            console.error('Failed to submit document:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Derived state ────────────────────────────────────────────────────────
    const missingDocs = DOCS.filter(d => getDocStatus(vendor, d) === 'REQUIRED');

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white">Documents</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            <div className="px-5 mt-4">
                {/* Alert */}
                {missingDocs.length > 0 ? (
                    <div className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#1E3A8A] rounded-[16px] p-5 mb-8 flex gap-3">
                        <ShieldAlert className="w-[20px] h-[20px] text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#1D4ED8] dark:text-[#60A5FA] mb-1">Verification Required</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#2563EB] dark:text-[#93C5FD]">
                                Upload {missingDocs.map(d => d.label).join(', ')} for verification.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#064E3B] rounded-[16px] p-5 mb-8 flex gap-3">
                        <FileCheck className="w-[20px] h-[20px] text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#059669] dark:text-[#34D399] mb-1">All Documents Uploaded</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#10B981]">You have provided all required business documents.</p>
                        </div>
                    </div>
                )}

                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-white mb-4">Business Documents</h3>

                {/* Document Cards */}
                {DOCS.map(doc => {
                    const status = getDocStatus(vendor, doc);
                    const { color, bg, Icon } = statusMeta(status);
                    const docUrl = vendor?.[doc.urlKey ?? ''] as string | undefined;

                    return (
                        <div key={doc.key} className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] shadow-sm overflow-hidden mb-4">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center ${bg}`}>
                                        <img src={doc.iconUrl} alt={doc.label} className="w-5 h-5 object-contain" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-0.5">{doc.label}</h4>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                            {status === 'REQUIRED' ? 'REQUIRED DOCUMENT' : status}
                                        </span>
                                    </div>
                                </div>

                                {status === 'REQUIRED' ? (
                                    <button
                                        onClick={() => handleUploadClick(doc)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold px-5 py-2.5 rounded-[8px] active:scale-95 transition-transform"
                                    >
                                        Upload
                                    </button>
                                ) : (
                                    <DocMenu
                                        docUrl={docUrl}
                                        docLabel={doc.label}
                                        onDelete={() => handleDelete(doc)}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
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

                            {selectedDocKey?.iconUrl ? (
                                <div className="w-16 h-16 bg-[#FAFAFA] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4 mt-2">
                                    <img src={selectedDocKey.iconUrl} alt={selectedDocKey.label} className="w-8 h-8 object-contain" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-[#FAFAFA] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4 mt-2">
                                    <Upload className="w-6 h-6 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                                </div>
                            )}

                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-2 text-center w-full block">Action Required</span>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white mb-6 leading-tight text-center">Upload Required Documents</h3>

                            <div className="w-full">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-2 pl-1">
                                    {selectedDocKey?.label || 'DOCUMENT NAME'}
                                </span>

                                <label
                                    htmlFor="biz-doc-upload"
                                    className="border-[1.5px] border-dashed border-[#3B82F6] dark:border-[#60A5FA] bg-[#EFF6FF]/50 dark:bg-[#1E3A8A]/10 rounded-[4px] p-8 flex flex-col items-center justify-center mb-6 hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/20 transition-colors cursor-pointer group"
                                >
                                    <input
                                        type="file"
                                        id="biz-doc-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                    />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-[#ECFDF5] dark:bg-[#064E3B] shadow-sm border border-[#A7F3D0] dark:border-[#047857] rounded-full flex items-center justify-center mb-4">
                                                <Upload className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                                            </div>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#10B981] mb-1 text-center truncate max-w-[200px]">{selectedFile.name}</p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] mb-4">Ready to submit</p>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white uppercase tracking-wide">CHANGE FILE</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white dark:bg-[#1E1E1B] shadow-sm border border-[#F4F4F5] dark:border-[#27272A] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                                <Upload className="w-5 h-5 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                                            </div>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#030303] dark:text-[#FAFAFA] mb-1 text-center">Upload Required Documents</p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] mb-4 text-center">PDF, DOC, Image up to 10MB</p>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white uppercase tracking-wide">BROWSE FILES</span>
                                        </>
                                    )}
                                </label>

                                <button
                                    onClick={submitDocument}
                                    disabled={!selectedFile || isSubmitting}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full py-[16px] bg-[#04222D] dark:bg-[#E95A6E] text-white font-bold rounded-[12px] text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Uploading…' : 'Submit Document'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
