'use client';
import { apiUrl } from '@/lib/api';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Eye,
    EyeOff,
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    ArrowLeft,
    Clock,
    Calendar as CalendarIcon,
    AlertTriangle,
    Mail,
    Star,
    Banknote,
    Search,
    MessageCircle,
    MoreVertical,
    Plus,
    Image as ImageIcon,
    Send,
    CheckCircle2
} from 'lucide-react';

export default function DashboardHome() {
    const router = useRouter();
    const [userName, setUserName] = useState('Vyom');
    const [dashboardStep, setDashboardStep] = useState(1);
    
    // UI state
    const [revenueFilter, setRevenueFilter] = useState('M'); // D, M, Y
    const [showRevenue, setShowRevenue] = useState(false);
    
    // Inbox State
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    const [inboxTab, setInboxTab] = useState<'Notification' | 'EM Chats'>('Notification');
    const [notifFilter, setNotifFilter] = useState('New Bookings');
    const [activeChat, setActiveChat] = useState<any>(null);
    
    // Dynamic Data state
    const [stats, setStats] = useState({ revenue: 0, bookings: 0, enquiries: 0 });
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [vendorData, setVendorData] = useState<any>(null);
    const [showStep2Popup, setShowStep2Popup] = useState(false);

    // Dummy Data Function for Dev
    const populateDummyData = () => {
        if (upcomingBookings.length > 0 || stats.revenue > 0) {
            setStats({ revenue: 0, bookings: 0, enquiries: 0 });
            setUpcomingBookings([]);
        } else {
            setStats({ revenue: 285400, bookings: 188, enquiries: 12 });
            setUpcomingBookings([
                {
                    id: 'dummy-1',
                    clientName: 'Rahul Sharma',
                    packageName: 'Corporate Premium Package',
                    eventCategories: ['Corporate Party'],
                    date: new Date('2023-10-16T16:00:00'),
                    endDate: new Date('2023-10-16T20:00:00'),
                    vendorType: 'CATERING',
                    price: 25000,
                    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=100&h=100&fit=crop'
                }
            ]);
        }
    };

    useEffect(() => {
        const vendorId = localStorage.getItem('vendor_id');
        if (!vendorId) {
            router.push('/login');
            return;
        }

        const name = localStorage.getItem('vendor_name');
        if (name) setUserName(name);

        const success = localStorage.getItem('onboarding_success');
        // Only trust dashboard_step=3 from cache (doc-verified state is hard to fake).
        // dashboard_step=2 is NOT trusted from cache — it's always re-verified by the
        // API call below to prevent it from sticking after the user goes back into the wizard.
        const savedStep = localStorage.getItem('dashboard_step');

        if (savedStep === '3') {
            setDashboardStep(3);
        } else if (success === 'true') {
            // Show confetti only on the fresh completion redirect
            setDashboardStep(2);
            localStorage.setItem('dashboard_step', '2');
            setShowStep2Popup(true);
            import('canvas-confetti').then((confetti) => {
                confetti.default({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            });
            localStorage.removeItem('onboarding_success');
        }
        // Note: savedStep==='2' is intentionally NOT used here — the API check below
        // is the single source of truth for step 1 vs step 2.

        const checkOnboardingStatus = async () => {
            if (vendorId) {
                try {
                    const res = await fetch(apiUrl(`/vendors/${vendorId}`), {
                        cache: 'no-store'
                    });
                    const data = await res.json();

                    if (data.success && data.data) {
                        const vendor = data.data;
                        const isDocVerified = vendor.isIndividual 
                            ? (vendor.isAadharVerified && vendor.isPanVerified)
                            : (vendor.isPanVerified && vendor.isGstVerified);

                        if (isDocVerified && vendor.bankDetails?.accountNumber) {
                            setDashboardStep(3);
                            localStorage.setItem('dashboard_step', '3');
                        } else {
                            // Onboarding is complete only when:
                            // 1. vendor_setup_step has been cleared (wizard fully submitted)
                            // 2. The vendor has all required fields: coverImage, description, ≥3 businessPhotos
                            const savedSetupStep = localStorage.getItem('vendor_setup_step');
                            const onboardingDone = !savedSetupStep || savedSetupStep === '15';
                            if (onboardingDone && vendor.coverImage && vendor.description && vendor.businessPhotos?.length >= 3) {
                                setDashboardStep(2);
                                localStorage.setItem('dashboard_step', '2');
                            } else {
                                // Onboarding is still in progress — reset to Step 1 and clear
                                // any stale dashboard_step so it doesn't get stuck on Step 2.
                                setDashboardStep(1);
                                localStorage.removeItem('dashboard_step');
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error checking vendor status:', err);
                }

                // Fetch packages for stats and calendar
                try {
                    const res = await fetch(apiUrl(`/packages/vendor/${vendorId}`), {
                        cache: 'no-store'
                    });
                    const data = await res.json();
                    if (data.status === 'SUCCESS' || data.success) {
                        const packages = data.packages || [];
                        let totalBookings = 0;
                        const upcoming: any[] = [];
                        const events: any[] = [];
                        
                        const now = new Date();

                        packages.forEach((pkg: any) => {
                            if (pkg.availabilityCalendar) {
                                pkg.availabilityCalendar.forEach((cal: any) => {
                                    const calDate = new Date(cal.date);
                                    events.push({ date: calDate, status: cal.status });
                                    
                                    if (cal.status === 'Booked') {
                                        totalBookings++;
                                        if (calDate >= now) {
                                            upcoming.push({
                                                id: cal._id || Math.random().toString(),
                                                packageName: pkg.step1_eventAndCrew?.packageName || 'Untitled Package',
                                                date: calDate,
                                                vendorType: pkg.vendorType || 'SERVICE',
                                                price: pkg.step3_policiesAndCharges?.overallPriceOfPackage?.price || pkg.step3_policiesAndCharges?.packagePricing?.price || 0
                                            });
                                        }
                                    }
                                });
                            }
                        });

                        // Sort upcoming bookings by date ascending
                        upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

                        setStats({ revenue: 0, bookings: totalBookings, enquiries: 0 });
                        setUpcomingBookings(upcoming.slice(0, 5));
                        setCalendarEvents(events);
                    }
                } catch (err) {
                    console.error('Error fetching packages:', err);
                }
            }
        };

        checkOnboardingStatus();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-figtree">
            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-center sticky top-0 z-40 bg-[#FAFAFA]">
                <div className="flex items-center gap-3">
                    <div className="w-[42px] h-[42px] bg-[#E4E4E7] rounded-full flex items-center justify-center overflow-hidden cursor-pointer" onClick={populateDummyData}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-gray-400 mt-2"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" fill="currentColor"/></svg>
                    </div>
                    <div>
                        <h1 className="text-[16px] font-bold text-[#030303] leading-tight font-figtree">Hi, {userName}</h1>
                        <p className="text-[12px] font-medium text-[#9F9FA9] leading-tight mt-0.5">
                            {dashboardStep < 3 ? 'Have get more packages today' : 'Good Morning'}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={() => setIsInboxOpen(true)} className="p-2 border border-[#E4E4E7] rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors">
                        <Mail size={20} className="text-[#030303]" />
                    </button>
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-[#FAFAFA] pointer-events-none"></div>
                </div>
            </div>

            {dashboardStep < 3 ? (
                <div className="px-6 py-4 pb-24 flex flex-col gap-4">
                    {/* Step 1 Card */}
                    {(dashboardStep === 1 || dashboardStep >= 2) && (
                        <div className="bg-white rounded-[16px] border border-[#F4F4F5] overflow-hidden shadow-sm">
                            <div className="p-5 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className={`inline-flex h-[24px] min-h-[24px] px-[12px] py-[2px] justify-center items-center gap-[8px] rounded-full border ${dashboardStep >= 2 ? 'border-green-100 bg-green-50 text-green-700' : 'border-[#E6E9EA] bg-[#E6E9EA] text-[#030303]'} text-[12px] font-bold w-fit`}>
                                        {dashboardStep >= 2 ? 'Completed' : 'Step 1'}
                                    </div>
                                    {dashboardStep >= 2 && <CheckCircle2 size={20} className="text-green-500" />}
                                </div>
                                <h2 className="text-[20px] font-bold text-[#030303] leading-tight font-figtree">Set up Business Profile</h2>
                                <p className="text-[#A1A1AA] text-[14px] leading-snug font-figtree">
                                    Highlight your skills and set your availability to start attracting clients.
                                </p>
                            </div>
                            <div 
                                className="bg-[#04222D] p-5 flex justify-between items-center cursor-pointer active:bg-opacity-90 transition-all"
                                onClick={() => router.push('/dashboard/setup-profile')}
                            >
                                <span className="text-white font-bold text-[16px]">{dashboardStep >= 2 ? 'Edit Profile' : 'Start Now'}</span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                    <ArrowRight size={18} className="text-[#030303]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 Card */}
                    {dashboardStep >= 2 ? (
                        <div className="bg-white rounded-[16px] border border-[#F4F4F5] overflow-hidden shadow-sm">
                            <div className="p-5 flex flex-col gap-3">
                                <div className="inline-flex h-[24px] min-h-[24px] px-[12px] py-[2px] justify-center items-center gap-[8px] rounded-full border border-[#E6E9EA] bg-[#E6E9EA] text-[12px] font-bold text-[#030303] w-fit">Step 2</div>
                                <h2 className="text-[20px] font-bold text-[#030303] leading-tight font-figtree">Personal Documents</h2>
                                <p className="text-[#A1A1AA] text-[14px] leading-snug font-figtree">
                                    Submit your personal documents like Aadhar, PAN, and GST for e-KYC verification.
                                </p>
                            </div>
                            <div 
                                className="bg-[#04222D] p-5 flex justify-between items-center cursor-pointer active:bg-opacity-90 transition-all"
                                onClick={() => router.push('/dashboard/documents')}
                            >
                                <span className="font-bold text-[16px] text-white">Start Now</span>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
                                    <ArrowRight size={18} className="text-[#030303]" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[16px] border border-[#F4F4F5] overflow-hidden shadow-sm p-5 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="inline-flex h-[24px] min-h-[24px] px-[12px] py-[2px] justify-center items-center gap-[8px] rounded-full border border-[#E6E9EA] bg-[#E6E9EA] text-[12px] font-bold text-[#A1A1AA] w-fit">Step 2</div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 1.25C15.7279 1.25 18.75 4.27208 18.75 8V10.0547C19.8648 10.1379 20.5905 10.3483 21.1211 10.8789C21.9998 11.7576 22 13.1716 22 16C22 18.8284 21.9998 20.2424 21.1211 21.1211C20.2424 21.9998 18.8284 22 16 22H8C5.17157 22 3.75759 21.9998 2.87891 21.1211C2.00023 20.2424 2 18.8284 2 16C2 13.1716 2.00023 11.7576 2.87891 10.8789C3.40954 10.3483 4.13525 10.1379 5.25 10.0547V8C5.25 4.27208 8.27208 1.25 12 1.25ZM12 2.75C9.10051 2.75 6.75 5.10051 6.75 8V10.0039C7.13301 10.0003 7.54849 10 8 10H16C16.4515 10 16.867 10.0003 17.25 10.0039V8C17.25 5.10051 14.8995 2.75 12 2.75Z" fill="#A1A1AA"/>
                                </svg>
                            </div>
                            <h2 className="text-[20px] font-bold text-[#A1A1AA] leading-tight font-figtree">Personal Documents</h2>
                            <p className="text-[#D4D4D8] text-[14px] leading-snug font-figtree pr-4">
                                Submit your personal documents like Aadhar, PAN, and GST for e-KYC verification.
                            </p>
                        </div>
                    )}

                    {/* Step 3 Card (Video) */}
                    <div className="bg-white rounded-[16px] border border-[#F4F4F5] overflow-hidden shadow-sm relative flex items-center p-5 min-h-[110px]" style={{ backgroundImage: 'radial-gradient(#E4E4E7 1.5px, transparent 0)', backgroundSize: '10px 10px' }}>
                        <div className="absolute inset-0 bg-white bg-opacity-80 z-0"></div>
                        <div className="flex flex-col gap-2 z-10 w-2/3">
                            <h2 className="text-[15px] font-bold text-[#030303] leading-tight font-figtree">Business profile setup made easy</h2>
                            <div className="flex items-center gap-1.5 text-[#2563EB] text-[14px] font-semibold mt-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                <span>Video • 2 mins</span>
                            </div>
                        </div>
                        <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/homepagesignupman.png" alt="Profile setup video placeholder" className="absolute right-0 bottom-0 h-[100%] object-cover object-top w-[100px] z-0 mask-image-gradient" style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }} />
                    </div>

                    {/* Create Package Card */}
                    <div className="bg-[#FAFAFA] rounded-[16px] border-[1.5px] border-dashed border-[#D4D4D8] p-4 flex items-center justify-between cursor-pointer mt-2 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#030303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-[#030303] leading-tight">Create your first package</span>
                                <span className="text-[12px] text-[#A1A1AA] font-medium mt-0.5">Add More • Earn More</span>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-[#71717B]" />
                    </div>
                </div>
            ) : (
                <div className="px-6 py-4 pb-12 flex flex-col gap-6">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#F4F4F5]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-[#71717B]">
                                <div className="w-7 h-7 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                                <span className="text-[11px] font-bold tracking-[0.05em] uppercase">TOTAL REVENUE</span>
                            </div>
                            <div className="text-[#16A34A] text-[13px] font-bold">
                                +12%
                            </div>
                        </div>
                        
                        <div className="border-b border-dashed border-[#E4E4E7] mb-4"></div>
                        
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[26px] font-bold text-[#030303] leading-none tracking-tight">
                                    {showRevenue ? `₹${stats.revenue.toLocaleString('en-IN')}` : '••••••••'}
                                </h2>
                                <button onClick={() => setShowRevenue(!showRevenue)} className="text-[#A1A1AA] hover:text-[#030303] pb-1 transition-colors">
                                    {showRevenue ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            <div className="flex bg-[#F4F4F5] rounded-full p-1 h-9">
                                {['D', 'M', 'Y'].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setRevenueFilter(f)}
                                        className={`w-8 h-full rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${revenueFilter === f ? 'bg-white shadow-sm text-[#030303]' : 'text-[#A1A1AA]'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bookings & Enquiries */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#F4F4F5] flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-[#71717B]">
                                    <div className="w-7 h-7 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                                        <CalendarIcon size={12} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">BOOKINGS</span>
                                </div>
                            </div>
                            <div className="border-b border-dashed border-[#E4E4E7] mb-4"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-[24px] font-bold text-[#030303] leading-none tracking-tight">{stats.bookings}</span>
                                <span className="text-[13px] font-bold text-[#16A34A] mb-0.5">+2</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#F4F4F5] flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-[#71717B]">
                                    <div className="w-7 h-7 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    </div>
                                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">ENQUIRIES</span>
                                </div>
                            </div>
                            <div className="border-b border-dashed border-[#E4E4E7] mb-4"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-[24px] font-bold text-[#030303] leading-none tracking-tight">{stats.enquiries}</span>
                                <span className="text-[13px] font-bold text-[#16A34A] mb-0.5">+4</span>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[16px] font-bold text-[#030303]">Upcoming Bookings</h3>
                                <span className="text-[10px] bg-[#F4F4F5] text-[#71717B] px-2 py-0.5 rounded-full font-bold">{upcomingBookings.length} Events</span>
                            </div>
                            <button className="text-[12px] font-bold text-[#030303] flex items-center hover:underline">
                                View all
                            </button>
                        </div>

                        {upcomingBookings.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {upcomingBookings.map((booking) => (
                                    <div key={booking.id} style={{ padding: '12px 12px 0 12px', border: '0.5px solid #D4D4D8', borderRadius: '12px' }} className="w-full flex flex-col items-start gap-4 bg-white overflow-hidden shadow-sm mx-auto max-w-[361px]">
                                        <h4 style={{ color: '#030303', fontSize: '20px', fontWeight: 600, lineHeight: '28px' }} className="w-full font-figtree">
                                            {booking.clientName || 'Client Booking'}
                                        </h4>
                                        
                                        <div className="w-full flex flex-col gap-2">
                                            <div className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.05em] uppercase">EVENT</div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-[#3F3F47] text-[14px] font-medium">
                                                    <Star size={18} />
                                                    {booking.eventCategories?.[0] || 'Corporate Party'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[#3F3F47] text-[14px] font-medium">
                                                    <CalendarIcon size={18} />
                                                    {booking.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {booking.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {booking.endDate ? booking.endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '8:00 PM'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full flex flex-col gap-2 pb-4">
                                            <div className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.05em] uppercase">{booking.vendorType}</div>
                                            
                                            <div style={{ padding: '8px 9px', borderRadius: '8px', border: '1px solid #D4D4D8' }} className="flex items-center gap-4 w-full">
                                                <img src={booking.image || 'https://images.unsplash.com/photo-1555244162-803834f70033?w=100&h=100&fit=crop'} alt="Package" style={{ width: '69px', height: '70px', borderRadius: '4px', objectFit: 'cover' }} />
                                                <div className="flex flex-col justify-center gap-1">
                                                    <div style={{ color: '#04222D', fontSize: '16px', fontWeight: 500, lineHeight: '24px' }} className="font-figtree">
                                                        {booking.packageName}
                                                    </div>
                                                    {booking.price > 0 && (
                                                        <div style={{ color: '#030303', fontSize: '18px', fontWeight: 700, lineHeight: '24px' }} className="font-figtree">
                                                            ₹ {booking.price.toLocaleString('en-IN')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-[calc(100%+24px)] -ml-[12px] bg-[#EFF6FF] py-2.5 flex justify-center border-t border-[#D4D4D8]">
                                            <div className="flex items-center gap-2 text-[#2563EB] text-[14px] font-bold">
                                                <div className="w-2 h-2 rounded-full bg-[#2563EB]"></div>
                                                Booked
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-[#F4F4F5] rounded-[24px] shadow-sm p-6 text-center text-[#71717B] text-[13px] font-medium">
                                No upcoming bookings found.
                            </div>
                        )}
                    </div>

                    {/* Calendar Component */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-[20px] font-bold text-[#030303]">Calendar</h3>
                            <button className="text-[12px] font-bold text-[#030303] flex items-center gap-1 hover:underline">
                                View detail <ArrowRight size={16} />
                            </button>
                        </div>
                        
                        <div className="bg-white border border-[#F4F4F5] rounded-[24px] p-5 shadow-sm">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <button className="w-[32px] h-[32px] flex items-center justify-center text-[#030303] transition-colors rounded-full bg-[#F4F4F5] hover:bg-gray-200">
                                    <ChevronLeft size={18} />
                                </button>
                                <h4 className="text-[16px] font-bold text-[#030303]">Today, 2 April</h4>
                                <button className="w-[32px] h-[32px] flex items-center justify-center text-[#030303] transition-colors rounded-full bg-[#F4F4F5] hover:bg-gray-200">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                            
                            {/* Days grid */}
                            <div className="grid grid-cols-7 gap-[10px] text-center">
                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                                    <div key={d} className="text-[11px] font-bold text-[#A1A1AA] tracking-[0.05em] mb-2">{d}</div>
                                ))}
                                
                                {(stats.revenue > 0 ? [
                                    { day: 1 },
                                    { day: 2, isSelected: true, bottom: <div className="flex gap-[4px]"><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div></div> },
                                    { day: 3, bottom: <div className="flex gap-[4px]"><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div></div> },
                                    { day: 4 },
                                    { day: 5, bottom: <div className="w-[20px] h-[20px] rounded-full bg-[#2563EB] text-white text-[11px] flex items-center justify-center font-bold leading-none">4</div> },
                                    { day: 6, bottom: <div className="flex gap-[4px]"><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div></div> },
                                    { day: 7, bottom: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717B" strokeWidth="2"><path d="M12 22V8M7 12l5-4M17 12l-5-4M5 8c0 4 3 6 7 6s7-2 7-6-3-6-7-6-7 2-7 6z"/></svg> },
                                    { day: 8 },
                                    { day: 9 },
                                    { day: 10, isError: true, bottom: <div className="w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[11px] flex items-center justify-center font-bold leading-none">!</div> },
                                    { day: 11 },
                                    { day: 12, badge: true, bottom: <div className="w-[20px] h-[20px] rounded-full bg-[#F97316] text-white text-[11px] flex items-center justify-center font-bold leading-none">4</div> },
                                    { day: 13 },
                                    { day: 14 },
                                    { day: 15 },
                                    { day: 16 },
                                    { day: 17 },
                                    { day: 18 },
                                    { day: 19 },
                                    { day: 20 },
                                    { day: 21 },
                                    { day: 22 },
                                    { day: 23 },
                                    { day: 24 },
                                    { day: 25 },
                                    { day: 26 },
                                    { day: 27, isFestival: true },
                                    { day: 28 },
                                    { day: 15 },
                                    { day: 30, bottom: <div className="flex gap-[4px]"><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div><div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]"></div></div> },
                                    { day: 31 },
                                    { day: 1, bottom: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
                                    { day: 2 },
                                    { day: 3 },
                                    { day: 4 }
                                ] : [
                                    // Plain calendar layout
                                    { day: 1 },
                                    { day: 2, isSelected: true },
                                    ...[...Array(26)].map((_, i) => ({ day: i + 3 })),
                                    { day: 29 },
                                    { day: 30 },
                                    { day: 31 },
                                    { day: 1 },
                                    { day: 2 },
                                    { day: 3 },
                                    { day: 4 }
                                ]).map((cell: any, i: number) => (
                                    <div key={i} className={`relative flex flex-col items-center justify-between h-[64px] py-1.5 rounded-[12px] border transition-all ${
                                        cell.isSelected ? 'border-[#2563EB] shadow-[0_0_0_1px_rgba(37,99,235,0.2)] bg-[#F8FAFC]' : 
                                        cell.isError ? 'border-[#EF4444]' : 
                                        cell.isFestival ? 'border-transparent overflow-hidden' : 'border-[#E4E4E7]'
                                    }`}>
                                        {cell.isFestival && (
                                            <div className="absolute inset-0 bg-black z-0 rounded-[12px] overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1601614392272-353d91cfbd81?w=100&h=100&fit=crop" className="w-full h-full object-cover opacity-80" alt="Diwali" />
                                            </div>
                                        )}
                                        <div className={`text-[15px] font-bold z-10 ${cell.isFestival ? 'text-white' : 'text-[#030303]'}`}>
                                            {cell.day}
                                        </div>
                                        <div className="z-10 flex items-center justify-center h-[20px]">
                                            {cell.bottom}
                                        </div>
                                        
                                        {cell.badge && (
                                            <div className="absolute -top-1.5 -right-1.5 w-[16px] h-[16px] bg-[#F97316] rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-20">!</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Notification Center / Inbox Slide-Over */}
            <AnimatePresence>
                {isInboxOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
                            onClick={() => setIsInboxOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white z-50 shadow-2xl flex flex-col font-figtree overflow-hidden"
                        >
                            {activeChat ? (
                                <div className="flex flex-col h-full bg-[#FAFAFA]">
                                    {/* Chat Header */}
                                    <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm z-10">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setActiveChat(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                                <ArrowLeft size={20} />
                                            </button>
                                            <h2 className="text-[18px] font-bold text-[#030303]">{activeChat}</h2>
                                        </div>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#030303]">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                                        <div className="flex justify-center my-2">
                                            <span className="text-[11px] font-bold text-[#71717B]">May 4, 2026</span>
                                        </div>
                                        
                                        {/* Chat Bubble Left */}
                                        <div className="flex gap-3 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-bold text-[#030303]">Rohit</span>
                                                    <span className="text-[10px] text-[#2563EB] font-bold bg-[#EFF6FF] px-2 py-0.5 rounded-full">Event manager</span>
                                                </div>
                                                <div className="bg-white border border-[#E4E4E7] rounded-tl-none rounded-[16px] p-3 text-[13px] text-[#3F3F47] leading-relaxed shadow-sm">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                                                </div>
                                                <span className="text-[10px] text-[#A1A1AA] font-medium mt-0.5">8:18 AM</span>
                                            </div>
                                        </div>

                                        {/* Chat Bubble Right */}
                                        <div className="flex gap-3 max-w-[85%] self-end">
                                            <div className="flex flex-col gap-1 items-end">
                                                <div className="bg-[#04222D] rounded-tr-none rounded-[16px] p-3 text-[13px] text-white leading-relaxed shadow-sm">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                                                </div>
                                                <span className="text-[10px] text-[#A1A1AA] font-medium mt-0.5">8:19 AM</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="bg-white p-4 border-t border-[#F4F4F5] flex items-center gap-3">
                                        <button className="w-8 h-8 flex items-center justify-center text-[#71717B] hover:text-[#030303] transition-colors rounded-full border border-[#E4E4E7]">
                                            <Plus size={16} />
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center text-[#71717B] hover:text-[#030303] transition-colors">
                                            <ImageIcon size={20} />
                                        </button>
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                placeholder="Write your message" 
                                                className="w-full h-[40px] bg-[#F4F4F5] rounded-full px-4 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#04222D]"
                                            />
                                        </div>
                                        <button className="w-[40px] h-[40px] flex items-center justify-center bg-[#04222D] text-white rounded-full">
                                            <Send size={16} className="ml-0.5 mt-0.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full bg-[#FAFAFA]">
                                    {/* Inbox Header */}
                                    <div className="bg-white px-4 py-4 flex items-center gap-3">
                                        <button onClick={() => setIsInboxOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h2 className="text-[18px] font-bold text-[#030303]">Inbox</h2>
                                    </div>

                                    {/* Main Tabs */}
                                    <div className="bg-white flex border-b border-[#E4E4E7] px-4">
                                        <button 
                                            className={`flex-1 py-3 text-[14px] font-semibold relative ${inboxTab === 'Notification' ? 'text-[#04222D]' : 'text-[#71717B]'}`}
                                            onClick={() => setInboxTab('Notification')}
                                        >
                                            Notification <span className="inline-block w-1.5 h-1.5 bg-[#04222D] rounded-full align-top ml-1 mt-1"></span>
                                            {inboxTab === 'Notification' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#04222D] rounded-t-full"></div>}
                                        </button>
                                        <button 
                                            className={`flex-1 py-3 text-[14px] font-semibold relative ${inboxTab === 'EM Chats' ? 'text-[#04222D]' : 'text-[#71717B]'}`}
                                            onClick={() => setInboxTab('EM Chats')}
                                        >
                                            EM Chats
                                            {inboxTab === 'EM Chats' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#04222D] rounded-t-full"></div>}
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto">
                                        {inboxTab === 'Notification' && (
                                            <div className="p-4 flex flex-col gap-5">
                                                {/* Filters */}
                                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                                    {['New Bookings', 'Enquiry', 'Transactions'].map(filter => (
                                                        <button 
                                                            key={filter}
                                                            onClick={() => setNotifFilter(filter)}
                                                            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors border ${
                                                                notifFilter === filter 
                                                                    ? 'bg-[#04222D] text-white border-[#04222D]' 
                                                                    : 'bg-white text-[#71717B] border-[#E4E4E7] hover:border-[#A1A1AA]'
                                                            }`}
                                                        >
                                                            {filter}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Date Section */}
                                                <div className="flex flex-col gap-3">
                                                    <h3 className="text-[14px] font-bold text-[#030303]">Today</h3>
                                                    
                                                    {/* Dynamic Cards based on filter */}
                                                    {notifFilter === 'New Bookings' && (
                                                        <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#F4F4F5]">
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0 relative">
                                                                    <CalendarIcon size={18} className="text-[#04222D]" />
                                                                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EF4444] border-2 border-[#F4F4F5] rounded-full"></div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-0.5">
                                                                        <h4 className="text-[14px] font-bold text-[#030303]">New Bookings</h4>
                                                                        <span className="text-[11px] text-[#A1A1AA] font-medium">10h ago</span>
                                                                    </div>
                                                                    <div className="text-[13px] font-bold text-[#030303] mb-0.5">#BKG-102-334 generated</div>
                                                                    <div className="text-[12px] text-[#71717B] mb-3 leading-relaxed">Diamond Package of Haldi Event on da...</div>
                                                                    <button className="px-4 py-1.5 rounded-full border border-[#E4E4E7] text-[12px] font-bold text-[#030303] hover:bg-gray-50 transition-colors">
                                                                        View details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {notifFilter === 'Enquiry' && (
                                                        <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#F4F4F5]">
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0 relative">
                                                                    <Search size={18} className="text-[#B45309]" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-0.5">
                                                                        <h4 className="text-[14px] font-bold text-[#030303]">New Enquiry</h4>
                                                                        <span className="text-[11px] text-[#A1A1AA] font-medium">2 mins ago</span>
                                                                    </div>
                                                                    <div className="text-[13px] font-bold text-[#030303] mb-0.5">#ENQ-102-334 generated</div>
                                                                    <div className="text-[12px] text-[#71717B] mb-3 leading-relaxed">Premium Birthday Party package on dat...</div>
                                                                    <button className="px-4 py-1.5 rounded-full border border-[#E4E4E7] text-[12px] font-bold text-[#030303] hover:bg-gray-50 transition-colors">
                                                                        View details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {notifFilter === 'Transactions' && (
                                                        <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#F4F4F5]">
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0 relative">
                                                                    <Banknote size={18} className="text-[#16A34A]" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-0.5">
                                                                        <h4 className="text-[14px] font-bold text-[#030303]">Payment received</h4>
                                                                        <span className="text-[11px] text-[#A1A1AA] font-medium">2 mins ago</span>
                                                                    </div>
                                                                    <div className="text-[12px] text-[#71717B] mb-3 leading-relaxed">Received ₹20000 payment from Rahul S...</div>
                                                                    <button className="px-4 py-1.5 rounded-full border border-[#E4E4E7] text-[12px] font-bold text-[#030303] hover:bg-gray-50 transition-colors">
                                                                        View details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {inboxTab === 'EM Chats' && (
                                            <div className="flex flex-col bg-white h-full">
                                                {/* Chat List */}
                                                <div className="flex flex-col">
                                                    <div 
                                                        className="flex items-start gap-3 p-4 border-b border-[#F4F4F5] cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => setActiveChat('EM Support')}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold">
                                                            EM
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="text-[14px] font-bold text-[#030303]">EM Support</h4>
                                                                <span className="text-[11px] text-[#A1A1AA] font-medium">12:51 am</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-[13px] text-[#71717B] truncate">Hey, the requirement has changed</p>
                                                                <div className="w-2 h-2 rounded-full bg-[#04222D]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Older chats */}
                                                    <div className="flex items-start gap-3 p-4 border-b border-[#F4F4F5] opacity-60">
                                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold">
                                                            EM
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="text-[14px] font-bold text-[#030303]">EM Support</h4>
                                                                <span className="text-[11px] text-[#A1A1AA] font-medium">yesterday</span>
                                                            </div>
                                                            <p className="text-[13px] text-[#71717B] truncate">Hey, the requirements have been updated.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showStep2Popup && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowStep2Popup(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center"
                        />

                        {/* Bottom Drawer Card */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] overflow-visible z-[100] flex flex-col items-center px-8 pb-10 pt-16 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
                        >
                            {/* Close button hovering in white circle above the drawer */}
                            <button
                                onClick={() => setShowStep2Popup(false)}
                                className="absolute -top-16 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#030303" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            {/* 3D Clapping Hands Emoji */}
                            <div className="text-[72px] mb-6 animate-bounce">
                                👏
                            </div>

                            {/* Title */}
                            <h2 className="text-[24px] font-bold text-[#030303] text-center font-figtree mb-2 leading-tight">
                                Yay! You&apos;re all set.
                            </h2>

                            {/* Subtitle */}
                            <p className="text-[14px] text-[#71717B] text-center font-figtree mb-8 max-w-xs leading-relaxed">
                                Start step 2 of personal Document verification, and start adding item to Build your Inventory.
                            </p>

                            {/* Button */}
                            <button
                                onClick={() => {
                                    setShowStep2Popup(false);
                                    router.push('/dashboard/documents');
                                }}
                                className="w-full h-[56px] rounded-lg bg-[#04222D] text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <span>Step 2 : Add Personal Documents</span>
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
