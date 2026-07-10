'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const FAQ_DATA = [
    // Packages & Services
    { id: '1', question: 'How do I create a service package?', answer: 'Select “inventory” and tap \'Create first package\'. Add your service details, pricing, and variants. Packages are saved as drafts if your document verification is incomplete; they go live once verification is done.', category: 'Packages & Services' },
    { id: '2', question: 'Why is my package showing as a draft?', answer: 'A package stays in draft if your document verification is pending. Complete the verification step, and your packages will be published. You can view all your draft packages in the Drafts section in Inventory.', category: 'Packages & Services' },
    { id: '3', question: 'What documents do I need to submit for verification?', answer: 'Required documents depend on your service category. Generally, you\'ll need a PAN card and Aadhaar. A food license is required for catering vendors. GST registration is required for select categories. You can resubmit documents if verification fails; there is no limit on attempts.', category: 'Packages & Services' },
    { id: '4', question: 'How long does document verification take?', answer: 'Verification is completed within 24 hours of submission. You\'ll be notified once it\'s done. If your documents are rejected, you can resubmit immediately.', category: 'Packages & Services' },
    { id: '5', question: 'Can I add variants to my package?', answer: 'Yes. You can create multiple variants for a package (e.g. Basic, Premium). Clients will book a specific variant, and that variant\'s inclusions are locked in at the time of booking; any edits you make later won\'t affect existing bookings.', category: 'Packages & Services' },
    { id: '6', question: 'Can I edit a package that has already been booked?', answer: 'You can edit the package, but the client who booked will always receive the exact inclusions and variant that were shown at the time of their booking. Edits only affect new bookings going forward.', category: 'Packages & Services' },
    { id: '7', question: 'Is there a limit on how many packages I can create?', answer: 'No. You can create as many packages as you need across your listed service categories.', category: 'Packages & Services' },
    { id: '8', question: 'Can I offer multiple services under one account?', answer: 'Yes. A single Eventory vendor account can list services across multiple categories; for example, you can offer both photography and decor under the same account.', category: 'Packages & Services' },

    // Payments & Earnings
    { id: '9', question: 'How does payment work on Eventory?', answer: 'Payments are split across two or three stages: an optional token amount, an advance payment collected before the event, and a final payment collected after event completion. The commission is deducted from the total booking amount.', category: 'Payments & Earnings' },
    { id: '10', question: 'When do I receive my payout?', answer: 'Payouts are processed immediately after the client makes each payment. Funds are transferred to your registered bank account via Cashfree Payouts.', category: 'Payments & Earnings' },
    { id: '11', question: 'What are the commission charges, and how is it calculated?', answer: 'Eventory charges a commission between 3% and 12% of the total booking amount. The exact percentage depends on your service category and how far in advance the event is booked. This fee is deducted from the total.', category: 'Payments & Earnings' },
    { id: '12', question: 'Where can I see my earnings?', answer: 'Select Earnings in the Menu section. You\'ll find a full breakdown including booking amount, payment timeline, and net payout for every transaction.', category: 'Payments & Earnings' },
    { id: '13', question: 'What bank account details do I need to add for payouts?', answer: 'You\'ll need to add your bank account number and IFSC code during profile setup. Payouts are processed through Cashfree directly to this account. Make sure the account is in the name of the business or individual registered on the platform.', category: 'Payments & Earnings' },

    // Bookings & Enquiries
    { id: '14', question: 'How will I know when I receive a new booking request?', answer: 'You\'ll receive an in-app notification whenever a new booking request is assigned to you. You can view all pending requests in the Bookings section.', category: 'Bookings & Enquiries' },
    { id: '15', question: 'How do I communicate with clients?', answer: 'All communication happens through Eventory\'s in-app chat. Direct contact with clients outside the platform is not supported. An event manager is assigned to every booking and acts as a mediator between you and the client.', category: 'Bookings & Enquiries' },
    { id: '16', question: 'How long do I have to accept or reject a booking request?', answer: 'You have 12 hours to accept or reject an incoming booking request. If you don\'t respond within this window, the request will auto-expire.', category: 'Bookings & Enquiries' },
    { id: '17', question: 'What happens after I accept a booking?', answer: 'Once accepted, the booking is confirmed, and the client will be notified. An event manager may coordinate further event requirements and communication.', category: 'Bookings & Enquiries' },
    { id: '18', question: 'What happens if a client cancels a booking?', answer: 'The booking status will be updated automatically. Cancellation policies and applicable charges will be processed according to Eventory\'s cancellation terms.', category: 'Bookings & Enquiries' },
    { id: '19', question: 'Are there charges if I cancel a booking?', answer: 'Yes. Vendor cancellation charges apply and can go up to 80% depending on how close to the event date the cancellation is made. We recommend only accepting bookings you are confident you can fulfil. [To be confirmed]', category: 'Bookings & Enquiries' },
    { id: '20', question: 'How can I block dates on my calendar?', answer: 'Use our smart event calendar to block dates when you\'re unavailable or already booked. Tap on the date you want to block with your booking or unavailability and fill in the details. Your listings will only appear to clients for dates you have not blocked.', category: 'Bookings & Enquiries' },
    { id: '21', question: 'Why am I seeing a date conflict warning?', answer: 'The warning appears when the booking overlaps with another confirmed event or blocked date on your calendar.', category: 'Bookings & Enquiries' },
    { id: '22', question: 'How can I check the status of my enquiries?', answer: 'You can view all your enquiries under Enquiries in the app\'s Menu section. Each enquiry will display its current status, such as New Enquiry, Awaiting Response, Accepted, Declined, or Expired, helping you track every request easily.', category: 'Bookings & Enquiries' },
    { id: '23', question: 'Why am I not receiving enquiries?', answer: 'This may happen if your profile is incomplete, your services are under review, your availability is limited, or there is currently low demand for your category.', category: 'Bookings & Enquiries' },
    { id: '24', question: 'Can clients leave a review after an event?', answer: 'Yes. Clients can rate and review your service after the event. Maintaining a good rating improves your visibility and booking chances on the platform. You can check your reviews at “My Ratings” in the Menu section.', category: 'Bookings & Enquiries' },

    // App Support
    { id: '25', question: 'I\'m unable to log in to my account. What should I do?', answer: 'Verify your registered mobile number and OTP. If the issue persists, contact support through the Help & Support section.', category: 'App Support' },
    { id: '26', question: 'I am not receiving OTPs or notifications. How can I fix this?', answer: 'Check your network connection, SMS permissions, and notification settings. If the issue continues, report it through App Support.', category: 'App Support' },
    { id: '27', question: 'How do I report a technical issue or bug?', answer: 'Go to Menu > Help & Support and submit a support request with screenshots and details of the issue for faster resolution.', category: 'App Support' },
    { id: '28', question: 'My package changes are not showing live. Why?', answer: 'A package stays in draft if your document verification is pending. Complete the verification step, and your packages will be published within 24 hours of review. You can view all your draft packages in the Drafts section in Inventory.', category: 'App Support' },
    { id: '29', question: 'How do I update my profile information?', answer: 'Navigate to Profile Settings and edit the required details. Some changes may require verification before they are updated.', category: 'App Support' },
    { id: '30', question: 'Can I change my registered phone number or email address?', answer: 'Yes. Contact the support team through Help & Support available in the Menu section for assistance with updating registered account information.', category: 'App Support' },
    { id: '31', question: 'How can I contact the Eventory support team?', answer: 'You can raise a support ticket through the Help & Support section in the app. Our team will review and respond as soon as possible.', category: 'App Support' },
    { id: '32', question: 'Can I use the same account on multiple devices?', answer: 'Yes. However, additional authentication may be required when signing in from a new device.', category: 'App Support' }
];

const TABS = ['All', 'Payments & Earnings', 'Bookings & Enquiries', 'Packages & Services', 'App Support'];

export default function FAQPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>('1');

    const filteredFaqs = FAQ_DATA.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
        const strictMatchTab = activeTab === 'All' ? true : (faq.category === activeTab || faq.category === 'All');
        return matchesSearch && strictMatchTab;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-[#E4E4E7] dark:border-[#27272A]">
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
                        <div className="flex flex-col items-center justify-center mt-[60px] pb-10 text-center">
                            <img src="https://dkuacgndftndz.cloudfront.net/Menu_Components/faq.png" alt="No FAQ" className="w-[247px] h-[247px] object-contain mb-6 mix-blend-multiply dark:mix-blend-normal" />
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">Couldn't find that question</h3>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] max-w-[260px] mb-6 leading-relaxed">
                                Try searching for keywords like "payout", "cancel", or "commission".
                            </p>
                            <button 
                                onClick={() => {/* Handle Chat logic */}} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="px-6 py-3 bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold rounded-[8px] active:scale-95 transition-transform"
                            >
                                Chat with Support
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
