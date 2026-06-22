'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const FAQ_DATA = [
    {
        id: '1',
        question: 'What happens if a client cancels?',
        answer: "When a new request arrives, you'll receive a notification. Go to the 'Bookings' tab, review the details, and tap 'Accept' to confirm. You can also message the client first if you have questions.",
        category: 'All'
    },
    {
        id: '2',
        question: 'How can I change my subscription plan?',
        answer: 'You can change your subscription plan by navigating to the Settings page and selecting "Billing & Plans". From there, you can view available options and upgrade or downgrade your account.',
        category: 'Items related issue'
    },
    {
        id: '3',
        question: 'Where do I find my billing history?',
        answer: 'Your billing history is located under the "Billing & Plans" section in your Settings. You can view and download all past invoices from there.',
        category: 'Payment related issue'
    },
    {
        id: '4',
        question: 'Is there a trial period available?',
        answer: 'Yes, we offer a 14-day free trial for all new vendors joining the platform. You will not be charged until the trial period ends.',
        category: 'All'
    },
    {
        id: '5',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, UPI, and bank transfers for payouts. You can configure these in the Bank Accounts section of your dashboard.',
        category: 'Payment related issue'
    }
];

const TABS = ['All', 'Items related issue', 'Payment related issue'];

export default function FAQPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>('1');

    const filteredFaqs = FAQ_DATA.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || faq.category === activeTab || faq.category === 'All'; 
        // Showing 'All' category items in all tabs for the sake of the mockup if needed, 
        // but strictly matching tab is better. Let's strictly match tab unless it's "All"
        const strictMatchTab = activeTab === 'All' ? true : (faq.category === activeTab || faq.category === 'All');
        return matchesSearch && strictMatchTab;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">Frequently asked questions</h1>
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
                        placeholder="Search your question"
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
                                    layoutId="faq-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#030303] dark:bg-white"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {filteredFaqs.map((faq) => {
                        const isExpanded = expandedId === faq.id;
                        
                        return (
                            <div 
                                key={faq.id}
                                className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[12px] overflow-hidden transition-colors"
                            >
                                <button 
                                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                                    className="w-full px-5 py-5 flex items-center justify-between text-left"
                                >
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white pr-4">
                                        {faq.question}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-[#030303] dark:text-white shrink-0" strokeWidth={1.5} />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-[#030303] dark:text-white shrink-0" strokeWidth={1.5} />
                                    )}
                                </button>
                                
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 pt-1">
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-10">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] dark:text-[#A1A1AA]">
                                No questions found matching your search.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
