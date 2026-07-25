'use client';
import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { X, Camera, Upload, Edit3, ChevronRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const AVATARS = ['/images/male-avatar.png', '/images/female-avatar.png'];

const ProfileField = ({ 
    label, 
    fieldKey, 
    value, 
    hasVerifyLink = false,
    isEditing,
    globalEditingField,
    editValue,
    setEditValue,
    onEditClick,
    onCancel,
    onUpdate,
    onUploadClick,
    errorMessage,
    customDisable
}: any) => {
    const isUpdateDisabled = customDisable !== undefined 
        ? customDisable 
        : (!editValue?.trim() || editValue.trim() === (value || '').trim());
    const isDisabled = globalEditingField && globalEditingField !== fieldKey;

    return (
        <div className={`mb-6 transition-opacity duration-200 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#71717B] dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
                {label}
            </label>
            
            {isEditing ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`w-full p-4 bg-white dark:bg-[#1E1E1B] border rounded-[12px] text-[15px] font-medium text-[#030303] dark:text-white focus:outline-none mb-3 transition-colors ${
                            errorMessage 
                            ? 'border-[#E11D48] focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]' 
                            : 'border-[#E4E4E7] dark:border-[#27272A] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600'
                        }`}
                    />
                    
                    {errorMessage && (
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[#E11D48] text-[11px] mb-3 -mt-1 font-medium">
                            {errorMessage}
                        </p>
                    )}
                    
                    {/* Special document required note for legal name edit */}
                    {fieldKey === 'businessName' && (
                        <div className="bg-[#F4F4F5] dark:bg-[#27272A] p-4 rounded-[12px] mb-4">
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white mb-1">New Documents Verification Required.</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed">
                                To update your legal name, we need to verify your identity. Please upload your government - issued ID.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button 
                            disabled={isUpdateDisabled}
                            onClick={fieldKey === 'businessName' ? onUploadClick : onUpdate}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`px-6 py-2.5 text-white text-[13px] font-bold rounded-[8px] transition-all ${isUpdateDisabled ? 'bg-[#84949A] dark:bg-[#3F3F47] cursor-not-allowed' : 'bg-[#04222D] dark:bg-[#E95A6E] active:scale-95'}`}
                        >
                            Update
                        </button>
                        <button 
                            onClick={onCancel}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="px-4 py-2.5 bg-transparent text-[#030303] dark:text-white text-[13px] font-medium rounded-[8px] active:scale-95 transition-transform"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="relative w-full bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[12px] p-4 flex justify-between items-center transition-colors">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-[#FAFAFA] truncate pr-16">
                            {value || 'Not set'}
                        </span>
                        <button 
                            onClick={() => onEditClick(fieldKey, value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="absolute right-4 text-[13px] font-bold text-[#04222D] dark:text-white active:scale-95 transition-transform"
                        >
                            Edit
                        </button>
                    </div>
                    {hasVerifyLink && (
                        <button style={{ fontFamily: 'Figtree, sans-serif' }} className="mt-2 ml-1 text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">
                            VERIFY EMAIL
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Onboarding progress helpers ─────────────────────────────────────────────
const TOTAL_STEPS = 15;

/**
 * Derive how many setup steps are meaningfully completed from vendor fields.
 * We map each of the 15 setup steps to a vendor field and check if it has data.
 */
function computeOnboardingStep(vendor: any): number {
    if (!vendor) return 1;
    const checks = [
        !!vendor.businessName,                                                // step 1
        !!vendor.pocName,                                                     // step 2
        true,                                                                 // step 3 email (optional)
        !!vendor.teamSize,                                                    // step 4
        !!vendor.bookingsPerYear,                                             // step 5
        !!vendor.experience,                                                  // step 6
        !!(vendor.vendorType && vendor.vendorType.length > 0),                // step 7
        !!(vendor.eventCategories && vendor.eventCategories.length > 0),     // step 8
        !!(vendor.serviceAreas && vendor.serviceAreas.length > 0),           // step 9
        !!(vendor.profilePicture && vendor.coverImage),                      // step 10
        !!(vendor.description && vendor.description.length >= 200),          // step 11
        true,                                                                 // step 12 guidelines
        !!(vendor.businessPhotos && vendor.businessPhotos.length >= 3),      // step 13
        false,                                                                // step 14 terms (can't derive)
        false,                                                                // step 15 summary
    ];
    // Return the index (1-based) of the first uncompleted step
    const firstIncomplete = checks.findIndex(c => !c);
    return firstIncomplete === -1 ? TOTAL_STEPS : firstIncomplete + 1;
}

export default function ViewProfilePage() {
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [resumeStep, setResumeStep] = useState(1);

    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Avatar picker sheet
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                
                const res = await fetch(apiUrl(`/vendors/${vendorId}`));
                if (res.ok) {
                    const responseJson = await res.json();
                    const data = responseJson.data || responseJson;
                    setVendor(data);

                    // Determine onboarding status
                    const savedStep = localStorage.getItem('vendor_setup_step');
                    const fieldStep = computeOnboardingStep(data);
                    
                    // Prefer the localStorage step, fallback to field-based derivation
                    const lsStep = savedStep ? parseInt(savedStep, 10) : 1;
                    // Take the higher of the two to avoid regressing
                    const actualStep = Math.max(lsStep, fieldStep);
                    
                    // It is finished only if they actually reached step 15
                    const isFinished = actualStep >= 15;
                    
                    setOnboardingComplete(isFinished);
                    if (!isFinished) {
                        setResumeStep(actualStep);
                    }
                } else {
                    setVendor({ businessName: '', pocName: '', email: '', phone: '', city: '' });
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
                setVendor({ businessName: '', pocName: '', email: '', phone: '', city: '' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    const handleEditClick = (field: string, currentValue: string) => {
        setEditingField(field);
        setEditValue(currentValue || '');
        setFieldError(null);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
        setFieldError(null);
    };

    const handleUpdate = async () => {
        if (!editingField || !vendor) return;

        setFieldError(null);

        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            
            const res = await fetch(apiUrl(`/vendors/${vendorId}`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [editingField]: editValue })
            });

            if (!res.ok) {
                if (editingField === 'phone') {
                    setFieldError("This mobile number is already linked to another account.");
                    return; // keep edit field open
                }
                throw new Error("Update failed");
            }

            // Success
            const updatedVendor = { ...vendor, [editingField]: editValue };
            setVendor(updatedVendor);
            setEditingField(null);
        } catch (error) {
            console.error("Failed to update profile field", error);
        }
    };

    if (isLoading || !vendor) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-transparent">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white">View Profile</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center mt-6 mb-10 px-5">
                <div className="relative mb-4">
                    <div className="w-[100px] h-[100px] min-w-[100px] shrink-0 bg-[#18181B] dark:bg-[#27272A] rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                        {vendor.profilePicture ? (
                            <img src={vendor.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                        {/* Upload in-progress overlay */}
                        {isUploadingPhoto && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    
                    <input 
                        type="file" 
                        id="profile-upload" 
                        className="hidden" 
                        accept="image/*"
                        disabled={isUploadingPhoto}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Show instant local preview
                            const previewUrl = URL.createObjectURL(file);
                            setVendor({ ...vendor, profilePicture: previewUrl });
                            setIsUploadingPhoto(true);

                            try {
                                // 1. Upload file to S3 via the existing /api/upload route
                                const formData = new FormData();
                                formData.append('file', file);
                                const uploadRes = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                });

                                if (!uploadRes.ok) {
                                    throw new Error('S3 upload failed');
                                }

                                const { url: s3Url } = await uploadRes.json();

                                // 2. Save the S3/CloudFront URL to the vendor profile
                                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                                
                                await fetch(apiUrl(`/vendors/${vendorId}`), {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ profilePicture: s3Url }),
                                });

                                // Update state with the permanent URL
                                setVendor((v: any) => ({ ...v, profilePicture: s3Url }));
                            } catch (err) {
                                console.error('Failed to upload profile picture:', err);
                                // Revert preview on failure
                                setVendor((v: any) => ({ ...v, profilePicture: vendor.profilePicture }));
                            } finally {
                                setIsUploadingPhoto(false);
                                // Release the blob URL to free memory
                                URL.revokeObjectURL(previewUrl);
                            }
                        }}
                    />
                    {/* Camera button — opens avatar picker sheet */}
                    <button
                        onClick={() => { setTempProfileImage(vendor.profilePicture || null); setShowProfileSheet(true); }}
                        disabled={isUploadingPhoto}
                        className={`absolute bottom-0 right-0 w-8 h-8 bg-[#030303] dark:bg-white rounded-full border-[2.5px] border-[#FAFAFA] dark:border-[#09090B] flex items-center justify-center transition-transform ${
                            isUploadingPhoto ? 'opacity-50 pointer-events-none' : 'active:scale-95 cursor-pointer'
                        }`}
                    >
                        <img 
                            src="https://dkuacgndftndz.cloudfront.net/Menu_Components/white_edit.svg" 
                            alt="Edit" 
                            className="w-[14px] h-[14px] object-contain dark:invert" 
                        />
                    </button>
                </div>
                
                <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white mb-1.5">{vendor.businessName || vendor.pocName || 'Vendor Partner'}</h2>
                {(vendor.phone || vendor.email) && (
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#A1A1AA] font-medium">
                        {vendor.phone}
                        {vendor.phone && vendor.email && <span className="mx-1.5">|</span>}
                        {vendor.email}
                    </p>
                )}
            </div>

            {/* Profile Fields */}
            <div className="px-5 mb-10">
                <ProfileField 
                    label="LEGAL NAME" 
                    fieldKey="businessName" 
                    value={vendor.businessName} 
                    isEditing={editingField === 'businessName'}
                    globalEditingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                    onUploadClick={() => setIsUploadModalOpen(true)}
                />
                <ProfileField 
                    label="POINT OF CONTACT" 
                    fieldKey="pocName" 
                    value={vendor.pocName} 
                    isEditing={editingField === 'pocName'}
                    globalEditingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                />
                <ProfileField 
                    label="EMAIL" 
                    fieldKey="email" 
                    value={vendor.email} 
                    hasVerifyLink 
                    isEditing={editingField === 'email'}
                    globalEditingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                />
                <ProfileField 
                    label="MOBILE NUMBER" 
                    fieldKey="phone" 
                    value={vendor.phone} 
                    isEditing={editingField === 'phone'}
                    globalEditingField={editingField}
                    editValue={editValue}
                    setEditValue={(val: string) => { setEditValue(val); setFieldError(null); }}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                    errorMessage={editingField === 'phone' ? fieldError : null}
                    customDisable={editingField === 'phone' ? (editValue === vendor.phone || editValue.length !== 10 || !/^\d+$/.test(editValue)) : undefined}
                />
                <ProfileField 
                    label="ADDRESS" 
                    fieldKey="city" 
                    value={vendor.city} 
                    isEditing={editingField === 'city'}
                    globalEditingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* Action Required Section — only shown while onboarding is in progress */}
            {!onboardingComplete && (() => {
                const progressPct = Math.round(((resumeStep - 1) / TOTAL_STEPS) * 100);
                return (
                    <div className="px-5 mb-8">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-4 pl-1">Action Required</h3>

                        <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[24px] p-6 shadow-sm">
                            <div className="bg-[#F4F4F5] dark:bg-[#27272A] inline-block px-3 py-1 rounded-full mb-3">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#3F3F47] dark:text-[#E4E4E7]">
                                    Step {resumeStep} of {TOTAL_STEPS}
                                </span>
                            </div>

                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303] dark:text-white mb-2">Set up Business Profile</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed mb-6">
                                Highlight your skills and set your availability to start attracting clients.
                            </p>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-2 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#04222D] dark:bg-[#E95A6E] transition-all duration-500"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white">
                                    {progressPct}%
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    // Save the resume step so setup-profile picks it up from localStorage
                                    localStorage.setItem('vendor_setup_step', String(resumeStep));
                                    router.push('/dashboard/setup-profile');
                                }}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full bg-[#04222D] dark:bg-[#E95A6E] text-white flex justify-between items-center p-4 rounded-[16px] active:scale-[0.98] transition-transform"
                            >
                                <span className="font-bold text-[15px] ml-2">Continue</span>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <ChevronRight className="w-5 h-5 text-[#04222D] dark:text-[#E95A6E]" strokeWidth={2.5} />
                                </div>
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* Upload Document Modal */}
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
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-2 pl-1">Adhaar Card</span>
                                
                                <label 
                                    htmlFor="document-upload"
                                    className="border border-dashed border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-8 flex flex-col items-center justify-center mb-6 hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/50 transition-colors cursor-pointer group relative overflow-hidden"
                                >
                                    <input 
                                        type="file" 
                                        id="document-upload" 
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedDocument(file);
                                        }}
                                    />
                                    {selectedDocument ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-[#ECFDF5] dark:bg-[#064E3B] shadow-sm border border-[#A7F3D0] dark:border-[#047857] rounded-full flex items-center justify-center mb-4">
                                                <Upload className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                                            </div>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#10B981] mb-1 text-center truncate max-w-[200px]">
                                                {selectedDocument.name}
                                            </p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] mb-4">Ready to send</p>
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
                                        if (selectedDocument) {
                                            setIsUploadModalOpen(false);
                                            setSelectedDocument(null);
                                            handleUpdate(); // Proceed with update
                                        } else {
                                            alert("Please select a document first.");
                                        }
                                    }}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full py-[16px] bg-[#04222D] dark:bg-[#E95A6E] text-white font-bold rounded-[12px] text-[15px] active:scale-[0.98] transition-transform"
                                >
                                    Send for Verification
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Profile Picture Bottom Sheet ── */}
            <AnimatePresence>
                {showProfileSheet && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setShowProfileSheet(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1E1E1B] rounded-t-[24px] p-6 pb-12 shadow-2xl"
                        >
                            <div className="w-10 h-1 bg-[#E4E4E7] dark:bg-[#3F3F47] rounded-full mx-auto mb-6" />
                            <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303] dark:text-white mb-5">Edit Profile Picture</h2>

                            {/* Gallery / Camera row */}
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#71717B] dark:text-[#A1A1AA] mb-3">Choose from Gallery</p>
                            <div className="flex gap-3 mb-4">
                                {/* Camera tile */}
                                <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                                    <div className="w-[64px] h-[64px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                        {isUploadingPhoto ? (
                                            <div className="w-5 h-5 border-2 border-[#04222D] dark:border-[#E95A6E] border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#71717B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA]">Camera</span>
                                    <input type="file" accept="image/*" capture="user" className="hidden" id="profile-upload" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const previewUrl = URL.createObjectURL(file);
                                        setTempProfileImage(previewUrl);
                                        setIsUploadingPhoto(true);
                                        try {
                                            const fd = new FormData(); fd.append('file', file);
                                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                            if (!res.ok) throw new Error();
                                            const { url } = await res.json();
                                            setTempProfileImage(url);
                                        } catch { alert('Upload failed.'); } finally {
                                            setIsUploadingPhoto(false);
                                            URL.revokeObjectURL(previewUrl);
                                        }
                                    }} />
                                </label>
                                {/* Gallery tile */}
                                <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                                    <div className="w-[64px] h-[64px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA]">Gallery</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const previewUrl = URL.createObjectURL(file);
                                        setTempProfileImage(previewUrl);
                                        setIsUploadingPhoto(true);
                                        try {
                                            const fd = new FormData(); fd.append('file', file);
                                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                            if (!res.ok) throw new Error();
                                            const { url } = await res.json();
                                            setTempProfileImage(url);
                                        } catch { alert('Upload failed.'); } finally {
                                            setIsUploadingPhoto(false);
                                            URL.revokeObjectURL(previewUrl);
                                        }
                                    }} />
                                </label>
                            </div>

                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-[1px] bg-[#E4E4E7] dark:bg-[#3F3F47]" />
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#A1A1AA] font-medium">or</span>
                                <div className="flex-1 h-[1px] bg-[#E4E4E7] dark:bg-[#3F3F47]" />
                            </div>

                            {/* Avatars */}
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#71717B] dark:text-[#A1A1AA] mb-3">Choose an Avatar</p>
                            <div className="flex gap-4 mb-6">
                                {AVATARS.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setTempProfileImage(url)}
                                        className={`w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] transition-all ${tempProfileImage === url ? 'border-[#04222D] dark:border-[#E95A6E]' : 'border-transparent'}`}
                                    >
                                        <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Preview */}
                            {tempProfileImage && (
                                <div className="flex items-center gap-3 mb-5 p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[12px]">
                                    <img src={tempProfileImage} className="w-10 h-10 rounded-full object-cover" alt="Selected" />
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#030303] dark:text-white">Selected — tap Save to apply</span>
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    if (!tempProfileImage) return;
                                    setVendor((v: any) => ({ ...v, profilePicture: tempProfileImage }));
                                    setShowProfileSheet(false);
                                    try {
                                        const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                                        
                                        await fetch(apiUrl(`/vendors/${vendorId}`), {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ profilePicture: tempProfileImage }),
                                        });
                                    } catch (err) { console.error('Failed to save profile picture', err); }
                                    setTempProfileImage(null);
                                }}
                                disabled={!tempProfileImage || isUploadingPhoto}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`w-full h-[56px] rounded-[12px] font-bold text-[16px] transition-all ${tempProfileImage && !isUploadingPhoto ? 'bg-[#04222D] dark:bg-[#E95A6E] text-white' : 'bg-[#E6E9EA] dark:bg-[#27272A] text-[#A1A1AA]'}`}
                            >
                                {isUploadingPhoto ? 'Uploading…' : 'Save'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            
            <BottomNav />
        </div>
    );
}
