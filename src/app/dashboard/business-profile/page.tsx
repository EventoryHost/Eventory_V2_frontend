'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Image as ImageIcon, Edit3, User, Mail, Calendar, Users, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessProfilePage() {
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('About');

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const res = await fetch(`${baseUrl}/vendors/${vendorId}?fullPhotos=true`);
                if (res.ok) {
                    const responseJson = await res.json();
                    setVendor(responseJson.data || responseJson);
                } else {
                    // Dummy data fallback if API fails
                    setVendor({
                        businessName: "Business Name/Brand Name",
                        vendorType: "DJ Artist, Makeup Artist, PAV",
                        experience: "7 - 10",
                        teamSize: "5 - 15",
                        bookingsPerYear: "70 - 100",
                        description: "Top-rated DJ artist in Delhi NCR specializing in high-energy sets for premium weddings and corporate events. We bring the vibe.",
                        pocName: "Arjun Sharma",
                        email: "arjun.studio@gmail.com",
                        eventCategories: ["Weddings", "Corporate Events", "Concerts", "Birthdays", "Private Parties"],
                        serviceAreas: ["South Delhi", "Gurugram", "Gaziabad", "Noida", "Faridabad"],
                        businessPhotos: [],
                        profilePicture: "",
                        coverImage: ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    if (isLoading || !vendor) {
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

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        // Optimistic update with local URLs
        const newLocalPhotos = Array.from(files).map(file => URL.createObjectURL(file));
        const updatedPhotosLocal = [...(vendor.businessPhotos || []), ...newLocalPhotos];
        setVendor({ ...vendor, businessPhotos: updatedPhotosLocal });
        
        // Convert to base64 for persistent backend save
        const base64Promises = Array.from(files).map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });
        
        const base64Photos = await Promise.all(base64Promises);
        const finalUpdatedPhotos = [...(vendor.businessPhotos || []), ...base64Photos];
        
        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
            await fetch(`${baseUrl}/vendors/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessPhotos: finalUpdatedPhotos })
            });
        } catch (err) {
            console.error("Failed to save gallery photos", err);
        }
    };

    return (
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
                    <div className="h-[120px] bg-[#F4F4F5] dark:bg-[#27272A] relative flex items-center justify-center">
                        {vendor.coverImage ? (
                            <img src={vendor.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-[#A1A1AA]" strokeWidth={1.5} />
                        )}
                        <button className="absolute bottom-3 right-3 w-7 h-7 bg-white dark:bg-[#18181B] rounded-full shadow-md flex items-center justify-center active:scale-95">
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
                                <button className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-[#18181B] border border-[#F4F4F5] dark:border-[#27272A] rounded-full shadow-md flex items-center justify-center active:scale-95">
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
                <div className="flex items-center justify-between border-b border-[#F4F4F5] dark:border-[#27272A] mb-6">
                    {['About', 'Events', 'Area', 'Gallery'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
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
                {activeTab === 'About' && (
                    <motion.div 
                        key="about"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8"
                    >
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
                    </motion.div>
                )}

                {activeTab === 'Events' && (
                    <motion.div 
                        key="events"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
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
                    </motion.div>
                )}

                {activeTab === 'Area' && (
                    <motion.div 
                        key="area"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
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
                    </motion.div>
                )}

                {activeTab === 'Gallery' && (
                    <motion.div 
                        key="gallery"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
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
                    </motion.div>
                )}
            </div>
        </div>
    );
}
