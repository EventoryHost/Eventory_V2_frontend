    'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Image as ImageIcon, Edit3, User, Mail, Calendar, Users, Clock, Plus, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = ['/images/male-avatar.png', '/images/female-avatar.png'];

export default function BusinessProfilePage() {
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('About');
    const isManualScrolling = useRef(false);

    // Profile picture sheet
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);

    // Cover image
    const [uploadingCover, setUploadingCover] = useState(false);
    const [coverProgress, setCoverProgress] = useState(0);
    const [showCoverSheet, setShowCoverSheet] = useState(false);
    const [tempCoverFile, setTempCoverFile] = useState<File | null>(null);
    const [tempCoverPreview, setTempCoverPreview] = useState<string | null>(null);

    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || 'placeholder_id' : 'placeholder_id';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

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
                    setVendor({});
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
                setVendor({});
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isManualScrolling.current) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const tabId = entry.target.id.replace('section-', '');
                        setActiveTab(tabId);
                    }
                });
            },
            { rootMargin: '-140px 0px -60% 0px', threshold: 0.1 }
        );

        const tabs = ['About', 'Events', 'Area', 'Gallery'];
        tabs.forEach(tab => {
            const el = document.getElementById(`section-${tab}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [isLoading]);

    const scrollToSection = (tab: string) => {
        isManualScrolling.current = true;
        setActiveTab(tab);
        const el = document.getElementById(`section-${tab}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 130;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            setTimeout(() => {
                isManualScrolling.current = false;
            }, 800);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Helper to format vendorType string into array of badges
    const getVendorTypes = () => {
        if (!vendor.vendorType) return ["Vendor"];
        if (Array.isArray(vendor.vendorType)) return vendor.vendorType;
        return vendor.vendorType.split(',').map((t: string) => t.trim());
    };

    const vendorTypes = getVendorTypes();

    const uploadToS3 = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok || !json.url) throw new Error(json?.error || 'Upload failed');
        return json.url;
    };

    const patchVendor = async (payload: Record<string, any>) => {
        const res = await fetch(`${baseUrl}/vendors/${vendorId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            const json = await res.json();
            setVendor(json.data || json);
        }
    };

    // Save selected avatar or uploaded profile picture
    const handleProfileSave = async () => {
        if (!tempImage) return;
        setIsUploadingProfile(true);
        try {
            setVendor((v: any) => ({ ...v, profilePicture: tempImage }));
            await patchVendor({ profilePicture: tempImage });
        } catch (err) {
            console.error('Failed to save profile picture', err);
        } finally {
            setIsUploadingProfile(false);
            setShowProfileSheet(false);
            setTempImage(null);
        }
    };

    // Handle profile picture file upload → S3
    const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingProfile(true);
        try {
            const url = await uploadToS3(file);
            setTempImage(url);
        } catch (err) {
            console.error('Failed to upload profile picture', err);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploadingProfile(false);
        }
    };

    // Handle cover image save → S3 with progress
    const handleCoverSave = async () => {
        if (!tempCoverFile) return;
        setUploadingCover(true);
        setCoverProgress(0);
        const interval = setInterval(() => {
            setCoverProgress(p => (p >= 90 ? 90 : p + Math.floor(Math.random() * 12 + 4)));
        }, 300);
        try {
            const url = await uploadToS3(tempCoverFile);
            clearInterval(interval);
            setCoverProgress(100);
            setVendor((v: any) => ({ ...v, coverImage: url }));
            await patchVendor({ coverImage: url });
        } catch (err) {
            console.error('Failed to upload cover image', err);
            alert('Cover image upload failed. Please try again.');
        } finally {
            clearInterval(interval);
            setTimeout(() => { 
                setUploadingCover(false); 
                setCoverProgress(0); 
                setShowCoverSheet(false);
                setTempCoverFile(null);
                setTempCoverPreview(null);
            }, 600);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newLocalPhotos = Array.from(files).map(file => URL.createObjectURL(file));
        setVendor((v: any) => ({ ...v, businessPhotos: [...(v.businessPhotos || []), ...newLocalPhotos] }));
        try {
            const urls = await Promise.all(Array.from(files).map(uploadToS3));
            const updated = [...(vendor.businessPhotos || []), ...urls];
            setVendor((v: any) => ({ ...v, businessPhotos: updated }));
            await patchVendor({ businessPhotos: updated });
        } catch (err) {
            console.error('Failed to save gallery photos', err);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-[#F4F4F5] dark:border-[#27272A]">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">Business Profile</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            <div className="px-5 mt-4">
                {/* Profile Card Container */}
                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[24px] overflow-hidden mb-6 shadow-sm">
                    {/* Cover Image */}
                    <div className="h-[120px] bg-[#F4F4F5] dark:bg-[#27272A] relative flex items-center justify-center overflow-hidden">
                        {vendor.coverImage ? (
                            <img src={vendor.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-[#A1A1AA]" strokeWidth={1.5} />
                        )}
                        {/* Cover upload progress overlay */}
                        {uploadingCover && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 px-6">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#04222D]">Uploading… {coverProgress}%</span>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#04222D] transition-all duration-300" style={{ width: `${coverProgress}%` }} />
                                </div>
                            </div>
                        )}
                        {/* Clickable edit button for cover */}
                        <button 
                            onClick={() => setShowCoverSheet(true)}
                            className="absolute bottom-3 right-3 w-7 h-7 bg-white dark:bg-[#18181B] rounded-full shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-[#3F3F47] dark:text-[#A1A1AA]" />
                        </button>
                    </div>

                    {/* Avatar & Details */}
                    <div className="px-5 pb-6 relative">
                        {/* Avatar */}
                        <div className="absolute -top-[40px] left-5">
                            <div className="relative">
                                <div className="w-[80px] h-[80px] rounded-full border-4 border-white dark:border-[#1E1E1B] bg-[#E4E4E7] dark:bg-[#3F3F47] flex items-center justify-center overflow-hidden">
                                    {vendor.profilePicture ? (
                                        <img src={vendor.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-[#A1A1AA]" />
                                    )}
                                </div>
                                <button
                                    onClick={() => { setTempImage(vendor.profilePicture || null); setShowProfileSheet(true); }}
                                    className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-[#18181B] border border-[#F4F4F5] dark:border-[#27272A] rounded-full shadow-md flex items-center justify-center active:scale-95"
                                >
                                    <Edit3 className="w-3 h-3 text-[#3F3F47] dark:text-[#A1A1AA]" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-12">
                            <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303] dark:text-white mb-3">
                                {vendor.businessName || "Business Name/Brand Name"}
                            </h2>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                {vendorTypes.map((type: string, i: number) => (
                                    <span key={i} style={{ fontFamily: 'Figtree, sans-serif' }} className="px-3 py-1.5 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[20px] text-[11px] font-medium text-[#3F3F47] dark:text-[#E4E4E7]">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="sticky top-[76px] z-30 bg-[#FAFAFA] dark:bg-[#09090B] pt-2 flex items-center justify-between border-b border-[#F4F4F5] dark:border-[#27272A] mb-8">
                    {['About', 'Events', 'Area', 'Gallery'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => scrollToSection(tab)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`pb-3 px-2 text-[14px] font-medium transition-colors relative ${
                                activeTab === tab 
                                    ? 'text-[#030303] dark:text-white' 
                                    : 'text-[#A1A1AA] hover:text-[#71717B] dark:hover:text-[#E4E4E7]'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#030303] dark:bg-white"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex flex-col gap-12 pb-10">
                    <div id="section-About" className="flex flex-col gap-8 scroll-mt-32">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E1E1B]">
                                <Clock className="w-[18px] h-[18px] text-[#3F3F47] dark:text-[#A1A1AA] mb-2" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white mb-0.5">{vendor.experience || "0 - 1"}</span>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA]">Yrs Exp</span>
                            </div>
                            <div className="border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E1E1B]">
                                <Users className="w-[18px] h-[18px] text-[#3F3F47] dark:text-[#A1A1AA] mb-2" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white mb-0.5">{vendor.teamSize || "1 - 5"}</span>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA]">Team</span>
                            </div>
                            <div className="border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E1E1B]">
                                <Calendar className="w-[18px] h-[18px] text-[#3F3F47] dark:text-[#A1A1AA] mb-2" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white mb-0.5">{vendor.bookingsPerYear || "0 - 24"}</span>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA]">Bookings/yr</span>
                            </div>
                        </div>

                        {/* About the Brand */}
                        <div>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">About the Brand</h3>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed">
                                {vendor.description || "Vendor description goes here. Update this in your profile settings."}
                            </p>
                        </div>

                        {/* Point of Contact */}
                        <div>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-3">Point of Contact</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-[18px] h-[18px] text-[#71717B] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#3F3F47] dark:text-[#E4E4E7]">{vendor.pocName || "Not set"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-[18px] h-[18px] text-[#71717B] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#3F3F47] dark:text-[#E4E4E7]">{vendor.email || "Not set"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="section-Events" className="flex flex-col gap-4 scroll-mt-32">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white">Events & Specializations</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {vendor.eventCategories?.length > 0 ? vendor.eventCategories.map((evt: string, i: number) => (
                                <span key={i} style={{ fontFamily: 'Figtree, sans-serif' }} className="px-3.5 py-2 bg-[#E2E8F0] dark:bg-[#334155] rounded-[20px] text-[12px] font-medium text-[#334155] dark:text-[#CBD5E1]">
                                    {evt}
                                </span>
                            )) : (
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#A1A1AA]">No events specified</span>
                            )}
                        </div>
                    </div>

                    <div id="section-Area" className="flex flex-col gap-4 scroll-mt-32">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white">Service Localities</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {vendor.serviceAreas?.length > 0 ? vendor.serviceAreas.map((area: string, i: number) => (
                                <span key={i} style={{ fontFamily: 'Figtree, sans-serif' }} className="px-3.5 py-2 bg-[#E2E8F0] dark:bg-[#334155] rounded-[20px] text-[12px] font-medium text-[#334155] dark:text-[#CBD5E1]">
                                    {area}
                                </span>
                            )) : (
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#A1A1AA]">No service areas specified</span>
                            )}
                        </div>
                    </div>

                    <div id="section-Gallery" className="flex flex-col gap-4 scroll-mt-32">
                        <div className="flex items-center justify-between">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white">Gallery</h3>
                            <label className="p-1 active:scale-95 transition-transform cursor-pointer">
                                <Plus className="w-6 h-6 text-[#030303] dark:text-white" strokeWidth={2} />
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleGalleryUpload}
                                />
                            </label>
                        </div>
                        
                        {(!vendor.businessPhotos || vendor.businessPhotos.length === 0) ? (
                            <div className="w-full h-[120px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-[16px] border border-dashed border-[#E4E4E7] dark:border-[#3F3F47] flex flex-col items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-[#A1A1AA] mb-2" strokeWidth={1.5} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#A1A1AA]">No images in gallery yet</p>
                            </div>
                        ) : (
                            <div className={`grid gap-2 ${vendor.businessPhotos.length === 1 ? 'grid-cols-1' : vendor.businessPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} h-[200px]`}>
                                {vendor.businessPhotos.length === 1 ? (
                                    <div className="col-span-1 h-full rounded-[8px] overflow-hidden">
                                        <img src={vendor.businessPhotos[0]} className="w-full h-full object-cover" />
                                    </div>
                                ) : vendor.businessPhotos.length === 2 ? (
                                    <>
                                        <div className="col-span-1 h-full rounded-[8px] overflow-hidden">
                                            <img src={vendor.businessPhotos[0]} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="col-span-1 h-full rounded-[8px] overflow-hidden">
                                            <img src={vendor.businessPhotos[1]} className="w-full h-full object-cover" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-2 h-full rounded-[8px] overflow-hidden">
                                            <img src={vendor.businessPhotos[0]} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="col-span-1 flex flex-col gap-2 h-full">
                                            <div className="flex-1 rounded-[8px] overflow-hidden">
                                                <img src={vendor.businessPhotos[1]} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 rounded-[8px] relative flex items-center justify-center overflow-hidden">
                                                <img src={vendor.businessPhotos[2]} className="w-full h-full object-cover" />
                                                {vendor.businessPhotos.length > 3 && (
                                                    <>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-white absolute z-10">
                                                            {vendor.businessPhotos.length - 3}+
                                                        </span>
                                                        <div className="absolute inset-0 bg-black/40"></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

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
                                <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                                    <div className="w-[64px] h-[64px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                        {isUploadingProfile ? (
                                            <div className="w-5 h-5 border-2 border-[#04222D] dark:border-[#E95A6E] border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#71717B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA]">Open camera</span>
                                    <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleProfileFileChange} />
                                </label>
                                <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                                    <div className="w-[64px] h-[64px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA]">Gallery</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileFileChange} />
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
                                        onClick={() => setTempImage(url)}
                                        className={`w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] transition-all ${tempImage === url ? 'border-[#04222D] dark:border-[#E95A6E]' : 'border-transparent'}`}
                                    >
                                        <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Preview of selected */}
                            {tempImage && (
                                <div className="flex items-center gap-3 mb-5 p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[12px]">
                                    <img src={tempImage} className="w-10 h-10 rounded-full object-cover" alt="Selected" />
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#030303] dark:text-white">Selected — tap Save to apply</span>
                                </div>
                            )}

                            <button
                                onClick={handleProfileSave}
                                disabled={!tempImage || isUploadingProfile}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`w-full h-[56px] rounded-[12px] font-bold text-[16px] transition-all ${tempImage && !isUploadingProfile ? 'bg-[#04222D] dark:bg-[#E95A6E] text-white' : 'bg-[#E6E9EA] dark:bg-[#27272A] text-[#A1A1AA]'}`}
                            >
                                {isUploadingProfile ? 'Saving…' : 'Save'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Cover Image Bottom Sheet ── */}
            <AnimatePresence>
                {showCoverSheet && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setShowCoverSheet(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1E1E1B] rounded-t-[24px] p-6 pb-12 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">Upload Cover Photo</h2>
                                <button onClick={() => setShowCoverSheet(false)} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                                    <X className="w-5 h-5 text-[#3F3F47] dark:text-white" />
                                </button>
                            </div>

                            <label className="border-[1.5px] border-dashed border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-8 flex flex-col items-center justify-center mb-6 hover:bg-[#FAFAFA] dark:hover:bg-[#27272A] transition-colors cursor-pointer group relative overflow-hidden">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setTempCoverFile(file);
                                            setTempCoverPreview(URL.createObjectURL(file));
                                        }
                                    }} 
                                />
                                {tempCoverPreview ? (
                                    <div className="w-full h-[120px] rounded-[8px] overflow-hidden flex items-center justify-center relative">
                                        <img src={tempCoverPreview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-white uppercase tracking-wider">CHANGE PHOTO</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                            <Upload className="w-5 h-5 text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                                        </div>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#030303] dark:text-[#FAFAFA] mb-1 text-center">Upload Required Documents</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] mb-4 text-center">PDF, DOC up to 10MB</p>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white uppercase tracking-wide">BROWSE FILES</span>
                                    </>
                                )}
                            </label>

                            <button
                                disabled={!tempCoverFile || uploadingCover}
                                onClick={handleCoverSave}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`w-full py-[16px] rounded-[12px] text-[16px] font-bold transition-all active:scale-[0.98] flex items-center justify-center ${tempCoverFile ? 'bg-[#031B24] text-white shadow-md' : 'bg-[#84949A] text-white cursor-not-allowed'}`}
                            >
                                {uploadingCover ? 'Saving...' : 'Save'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

