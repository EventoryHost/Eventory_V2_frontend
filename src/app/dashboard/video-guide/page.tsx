'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const VIDEO_DATA = [
    {
        id: '1',
        title: 'What payment methods do you accept?',
        subtitle: 'Learn how to customize your brand and listing',
        category: 'All'
    },
    {
        id: '2',
        title: 'What payment methods do you accept?',
        subtitle: 'Learn how to customize your brand and listing',
        category: 'Items related issue'
    },
    {
        id: '3',
        title: 'What payment methods do you accept?',
        subtitle: 'Learn how to customize your brand and listing',
        category: 'Payment related issue'
    },
    {
        id: '4',
        title: 'What payment methods do you accept?',
        subtitle: 'Learn how to customize your brand and listing',
        category: 'All'
    }
];

const TABS = ['All', 'Items related issue', 'Payment related issue'];

export default function VideoGuidePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const filteredVideos = VIDEO_DATA.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
        const strictMatchTab = activeTab === 'All' ? true : (video.category === activeTab || video.category === 'All');
        return matchesSearch && strictMatchTab;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">Video Guide</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            <div className="px-5 mt-2">
                <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[26px] font-bold text-[#030303] dark:text-white mb-6">How can we help you?</h2>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Search className="w-5 h-5 text-[#71717B] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search your tutorial"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-[52px] pl-12 pr-4 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[12px] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA]"
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                    />
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-6 mb-8 border-b border-[#F4F4F5] dark:border-[#27272A]">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`pb-3 whitespace-nowrap text-[14px] font-medium transition-colors relative
                                ${activeTab === tab 
                                    ? 'text-[#030303] dark:text-white font-bold' 
                                    : 'text-[#71717B] dark:text-[#A1A1AA]'
                                }
                            `}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="video-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#030303] dark:bg-white"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Video List */}
                <div className="space-y-3">
                    {filteredVideos.map((video) => (
                        <div 
                            key={video.id}
                            className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[12px] p-4 flex gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#27272A]/50 transition-colors"
                        >
                            <div className="w-[100px] h-[72px] shrink-0 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[8px] flex items-center justify-center">
                                <Play className="w-5 h-5 text-[#030303] dark:text-white" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white leading-tight mb-1">
                                    {video.title}
                                </h3>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA] leading-snug">
                                    {video.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}

                    {filteredVideos.length === 0 && (
                        <div className="text-center py-10">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] dark:text-[#A1A1AA]">
                                No tutorials found matching your search.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
