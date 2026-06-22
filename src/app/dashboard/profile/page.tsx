'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, Upload, Edit3, ChevronRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileField = ({ 
    label, 
    fieldKey, 
    value, 
    hasVerifyLink = false,
    isEditing,
    editValue,
    setEditValue,
    onEditClick,
    onCancel,
    onUpdate,
    onUploadClick
}: any) => {
    return (
        <div className="mb-6">
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
                        className="w-full p-4 bg-white dark:bg-[#1E1E1B] border border-[#E4E4E7] dark:border-[#27272A] rounded-[12px] text-[15px] font-medium text-[#030303] dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 mb-3 transition-colors"
                    />
                    
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
                            onClick={fieldKey === 'businessName' ? onUploadClick : onUpdate}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="px-6 py-2.5 bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold rounded-[8px] active:scale-95 transition-transform"
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
                            className="absolute right-4 text-[13px] font-bold text-[#E95A6E] active:scale-95 transition-transform uppercase tracking-wide"
                        >
                            EDIT
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

export default function ViewProfilePage() {
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const res = await fetch(`${baseUrl}/vendors/${vendorId}`);
                if (res.ok) {
                    const responseJson = await res.json();
                    setVendor(responseJson.data || responseJson);
                } else {
                    setVendor({
                        businessName: '',
                        pocName: '',
                        email: '',
                        phone: '',
                        city: ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
                setVendor({
                    businessName: '',
                    pocName: '',
                    email: '',
                    phone: '',
                    city: ''
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    const handleEditClick = (field: string, currentValue: string) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleUpdate = async () => {
        if (!editingField || !vendor) return;

        // Optimistic update
        const updatedVendor = { ...vendor, [editingField]: editValue };
        setVendor(updatedVendor);
        setEditingField(null);

        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
            await fetch(`${baseUrl}/vendors/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [editingField]: editValue })
            });
        } catch (error) {
            console.error("Failed to update profile field", error);
            // In a real app, we'd revert the optimistic update here
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
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-10 transition-colors duration-300">
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
                    </div>
                    
                    <input 
                        type="file" 
                        id="profile-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                // Create a local preview URL immediately for snappy UX
                                const previewUrl = URL.createObjectURL(file);
                                setVendor({ ...vendor, profilePicture: previewUrl });
                                
                                // Convert to base64 and save to backend so it persists
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                    const base64String = reader.result;
                                    try {
                                        const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                                        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                                        await fetch(`${baseUrl}/vendors/${vendorId}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ profilePicture: base64String })
                                        });
                                    } catch (err) {
                                        console.error("Failed to save profile picture to database", err);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <label 
                        htmlFor="profile-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-[#18181B] dark:bg-white rounded-full border-[3px] border-[#FAFAFA] dark:border-[#09090B] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                    >
                        <Camera className="w-[14px] h-[14px] text-white dark:text-[#09090B]" />
                    </label>
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
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                />
                <ProfileField 
                    label="ADDRESS" 
                    fieldKey="city" 
                    value={vendor.city} 
                    isEditing={editingField === 'city'}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditClick={handleEditClick}
                    onCancel={handleCancelEdit}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* Action Required Section */}
            <div className="px-5 mb-8">
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-4 pl-1">Action Required</h3>
                
                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[24px] p-6 shadow-sm">
                    <div className="bg-[#F4F4F5] dark:bg-[#27272A] inline-block px-3 py-1 rounded-full mb-3">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#3F3F47] dark:text-[#E4E4E7]">Step 1</span>
                    </div>
                    
                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303] dark:text-white mb-2">Set up Business Profile</h4>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed mb-6">
                        Highlight your skills and set your availability to start attracting clients.
                    </p>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-2 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#04222D] dark:bg-[#E95A6E]" style={{ width: '30%' }}></div>
                        </div>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white">30%</span>
                    </div>
                    
                    <button 
                        onClick={() => router.push('/dashboard/business-profile')}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full bg-[#04222D] dark:bg-[#E95A6E] text-white flex justify-between items-center p-4 rounded-[16px] active:scale-98 transition-transform"
                    >
                        <span className="font-bold text-[15px] ml-2">Continue</span>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 text-[#04222D] dark:text-[#E95A6E]" strokeWidth={2.5} />
                        </div>
                    </button>
                </div>
            </div>

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
        </div>
    );
}
