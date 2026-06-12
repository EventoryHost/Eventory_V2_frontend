'use client';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Award, Users, Calendar, User, Mail, ArrowLeft, Plus } from 'lucide-react';
import { FormData } from './types';

interface Props {
    formData: FormData;
    onBack: () => void;
    onSubmit: () => void;
    onEdit: () => void;
    loading: boolean;
}

const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
};

export function StepSummary({ formData, onBack, onSubmit, onEdit, loading }: Props) {
    const [activeTab, setActiveTab] = useState<'About' | 'Events' | 'Area' | 'Gallery'>('About');

    // Refs for scrolling to sections
    const aboutRef = useRef<HTMLDivElement>(null);
    const eventsRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (tab: 'About' | 'Events' | 'Area' | 'Gallery') => {
        setActiveTab(tab);
        const refMap = {
            About: aboutRef,
            Events: eventsRef,
            Area: areaRef,
            Gallery: galleryRef,
        };
        const targetRef = refMap[tab];
        if (targetRef && targetRef.current) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Helper to extract first word or number from options
    const formatNumberVal = (val: string, fallback: string) => {
        if (!val) return fallback;
        return val.split(' ')[0];
    };

    const formatLabelVal = (val: string, label: string) => {
        if (!val) return label;
        const parts = val.split(' ');
        if (parts.length > 1) {
            return parts.slice(1).join(' ');
        }
        return label;
    };

    return (
        <motion.div 
            key="step14" 
            {...stepVariants} 
            className="flex flex-col h-full bg-white font-figtree relative overflow-hidden"
        >
            {/* Business Profile Title Header */}
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
                <span className="text-[18px] font-bold text-[#030303]">Business Profile</span>
                <button 
                    onClick={onEdit}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                    <X size={16} className="text-[#3F3F47]" />
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-36 scroll-smooth">
                
                {/* Profile Card (Rounded border card matching Figma) */}
                <div className="border border-gray-200 rounded-[20px] overflow-hidden bg-white shadow-sm flex flex-col">
                    {/* Cover Photo */}
                    <div className="relative h-[140px] w-full bg-gray-50">
                        {formData.coverImage ? (
                            <img 
                                src={formData.coverImage} 
                                alt="Cover" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-[13px] font-medium">No cover image</span>
                            </div>
                        )}
                    </div>

                    {/* Profile Avatar & Info */}
                    <div className="px-5 pb-5 relative pt-12 flex flex-col items-start">
                        {/* Overlapping Avatar */}
                        <div className="absolute -top-10 left-5">
                            <div className="w-[80px] h-[80px] rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                                {formData.profilePicture ? (
                                    <img 
                                        src={formData.profilePicture} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#CBD5E1] flex items-center justify-center">
                                        <User size={32} className="text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Tags */}
                        <div className="space-y-2 w-full">
                            <h2 className="text-[18px] font-bold text-[#030303] leading-tight">
                                {formData.businessName || 'Business Name/Brand Name'}
                            </h2>
                            
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#04222D]/5 text-[#04222D]">
                                    {formData.vendorType || 'Vendor Type'}
                                </span>
                                {formData.categories.slice(0, 2).map((cat) => (
                                    <span key={cat} className="px-3 py-1 rounded-full text-[12px] font-medium bg-gray-100 text-gray-600">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Navigation Tabs */}
                <div className="border-b border-gray-100 flex pb-1">
                    {(['About', 'Events', 'Area', 'Gallery'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => scrollToSection(tab)}
                            className={`flex-1 py-2 text-center text-[14px] font-bold relative transition-all ${
                                activeTab === tab ? 'text-[#030303]' : 'text-gray-400'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#030303]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Section Content (Stacked vertically and clean, matching Figma) */}
                <div className="space-y-8">
                    
                    {/* About Section Wrapper */}
                    <div ref={aboutRef} className="space-y-6">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="border border-gray-200 rounded-[12px] p-3 flex flex-col items-center justify-center text-center gap-1">
                                <Award size={18} className="text-[#04222D]" />
                                <span className="text-[15px] font-bold text-[#030303] leading-none mt-1">
                                    {formatNumberVal(formData.experience, '0+')}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400">
                                    {formatLabelVal(formData.experience, 'Yrs Exp')}
                                </span>
                            </div>

                            <div className="border border-gray-200 rounded-[12px] p-3 flex flex-col items-center justify-center text-center gap-1">
                                <Users size={18} className="text-[#04222D]" />
                                <span className="text-[15px] font-bold text-[#030303] leading-none mt-1">
                                    {formatNumberVal(formData.teamSize, '1-5')}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400">
                                    {formatLabelVal(formData.teamSize, 'Team')}
                                </span>
                            </div>

                            <div className="border border-gray-200 rounded-[12px] p-3 flex flex-col items-center justify-center text-center gap-1">
                                <Calendar size={18} className="text-[#04222D]" />
                                <span className="text-[15px] font-bold text-[#030303] leading-none mt-1">
                                    {formatNumberVal(formData.bookingsPerYear, '0+')}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400">
                                    {formatLabelVal(formData.bookingsPerYear, 'Bookings/yr')}
                                </span>
                            </div>
                        </div>

                        {/* About the Brand */}
                        <div className="space-y-2.5">
                            <h3 className="text-[16px] font-bold text-[#030303]">About the Brand</h3>
                            <p className="text-[#3F3F47] text-[14px] leading-relaxed whitespace-pre-line">
                                {formData.description || 'No description provided yet.'}
                            </p>
                        </div>

                        {/* Point of Contact */}
                        <div className="space-y-3">
                            <h3 className="text-[16px] font-bold text-[#030303]">Point of Contact</h3>
                            <div className="space-y-2.5 pt-0.5">
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-gray-400" />
                                    <span className="text-[14px] font-medium text-[#3F3F47]">
                                        {formData.pocName || 'POC Name'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-[14px] font-medium text-[#3F3F47] break-all">
                                        {formData.email || 'poc@email.com'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events & Specializations Section */}
                    <div ref={eventsRef} className="space-y-3 pt-2">
                        <h3 className="text-[16px] font-bold text-[#030303]">Events & Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                            {formData.categories.length > 0 ? (
                                formData.categories.map((cat) => (
                                    <span key={cat} className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#EBF0F2] text-[#3F3F47]">
                                        {cat}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-[14px] font-medium">No events selected</span>
                            )}
                        </div>
                    </div>

                    {/* Service Localities Section */}
                    <div ref={areaRef} className="space-y-3 pt-2">
                        <h3 className="text-[16px] font-bold text-[#030303]">Service Localities</h3>
                        {formData.city && (
                            <p className="text-[13px] font-medium text-gray-400">
                                Primary City: <span className="text-[#030303] font-semibold">{formData.city}</span>
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {formData.serviceAreas.length > 0 ? (
                                formData.serviceAreas.map((area) => (
                                    <span key={area} className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#EBF0F2] text-[#3F3F47]">
                                        {area}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-[14px] font-medium">No service areas selected</span>
                            )}
                        </div>
                    </div>

                    {/* Gallery Section */}
                    <div ref={galleryRef} className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[16px] font-bold text-[#030303]">Gallery</h3>
                            <button 
                                onClick={onEdit} 
                                className="w-7 h-7 rounded-full bg-[#EBF0F2] hover:bg-[#D7DFE2] flex items-center justify-center text-[#030303] active:scale-95 transition-all cursor-pointer"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        
                        {formData.businessPhotos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {formData.businessPhotos.slice(0, 5).map((photo, index) => {
                                    if (index === 0) {
                                        return (
                                            <div key={index} className="col-span-2 row-span-2 aspect-square rounded-[12px] overflow-hidden bg-gray-50">
                                                <img 
                                                    src={photo} 
                                                    alt="Gallery preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        );
                                    }
                                    const isLast = index === 4 && formData.businessPhotos.length > 5;
                                    return (
                                        <div key={index} className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-50">
                                            <img 
                                                src={photo} 
                                                alt="Gallery preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            {isLast && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-[14px]">
                                                    +{formData.businessPhotos.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-gray-400 text-[14px] font-medium block text-center py-6">No business photos uploaded</span>
                        )}
                    </div>

                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-4 absolute bottom-0 left-0 right-0 z-20">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg active:scale-95 transition-all flex-shrink-0"
                    style={{ width: '56px', height: '56px' }}
                >
                    <ArrowLeft size={24} className="text-[#04222D]" />
                </button>

                <button
                    disabled={loading}
                    onClick={onSubmit}
                    className={`flex-1 h-[56px] rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 text-white ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#04222D] active:scale-[0.98]'
                    }`}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </motion.div>
    );
}
