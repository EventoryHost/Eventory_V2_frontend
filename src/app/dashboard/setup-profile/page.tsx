'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft, ArrowRight, X, Search, Check, Upload, CheckCircle2, XCircle, Plus, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://localhost:4000/api';
const CONTINUE_BUTTON_COLOR = 'rgba(4, 34, 45, 1)';

export default function SetupBusinessProfile() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: '',
        isIndividual: false,
        pocName: '',
        email: '',
        teamSize: '',
        bookingsPerYear: '',
        experience: '',
        vendorType: '',
        categories: [] as string[],
        city: '',
        serviceAreas: [] as string[],
        profilePicture: '',
        description: '',
        businessPhotos: [] as string[],
        coverImage: ''
    });
    const [isFocused, setIsFocused] = useState(false);
    const [activeCity, setActiveCity] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [eventSearch, setEventSearch] = useState('');
    const [showEventDropdown, setShowEventDropdown] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const teamSizeOptions = [
        "1 - 5 people",
        "6 - 15 people",
        "16 - 30 people",
        "31 - 50 people",
        "50+ people"
    ];

    const bookingsOptions = [
        "0 - 24 bookings/year",
        "25 - 49 bookings/year",
        "50 - 74 bookings/year",
        "75 - 99 bookings/year",
        "100+ bookings/year"
    ];

    const experienceOptions = [
        "0 - 2 years",
        "2 - 5 years",
        "5 - 8 years",
        "8 - 12 years",
        "12+ years"
    ];

    const vendorTypes = [
        'Caterer', 'Decorator', 'DJ Artist', 'Makeup Artist', 'Photography and Videography', 'Venue Provider'
    ];

    const eventCategories = [
        'Wedding', 'Corporate', 'Haldi', 'Birthday', 'Conference', 'Workshop', 'Exhibition', 'Engagement', 'Anniversary'
    ];

    const cityLocalities: Record<string, string[]> = {
        "Ghaziabad": ["Indirapuram", "Vasundhara", "Vaishali"],
        "Delhi": ["Connaught Place", "South Delhi", "North Delhi", "Dwarka", "Saket"],
        "Gurugram": ["DLF Phase 1", "Sushant Lok", "Golf Course Road", "Sector 56"],
        "Moradabad": ["Civil Lines", "Ramganga Vihar", "Kanth Road"],
        "Meerut": ["Shastri Nagar", "Modipuram", "Pallavpuram"],
        "Noida": ["Sector 18", "Sector 62", "Noida Extension", "Sector 15"]
    };

    const cities = Object.keys(cityLocalities);

    const avatars = [
        "/images/male-avatar.png",
        "/images/female-avatar.png"
    ];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('vendor_id');
            setVendorId(id);

            // Pre-fill from localStorage if available
            const savedName = localStorage.getItem('vendor_name');
            const savedPoc = localStorage.getItem('vendor_poc');
            const savedEmail = localStorage.getItem('vendor_email');
            const savedTeamSize = localStorage.getItem('vendor_team_size');
            const savedBookings = localStorage.getItem('vendor_bookings');
            const savedExperience = localStorage.getItem('vendor_experience');
            const savedVendorType = localStorage.getItem('vendor_type');
            const savedCategories = localStorage.getItem('vendor_categories');
            const savedCity = localStorage.getItem('vendor_city');
            const savedServiceAreas = localStorage.getItem('vendor_service_areas');
            const savedProfilePic = localStorage.getItem('vendor_profile_picture');
            const savedDescription = localStorage.getItem('vendor_description');
            const savedPhotos = localStorage.getItem('vendor_business_photos');
            const savedCover = localStorage.getItem('vendor_cover_image');
            const savedStep = localStorage.getItem('vendor_setup_step');
            const savedVendorId = localStorage.getItem('vendor_id');

            // Auto-recovery for development: if no vendor_id, fetch one from the backend
            if (!savedVendorId) {
                console.warn('No vendor_id found. Attempting to fetch an existing vendor for development...');
                fetch(`${API_BASE}/vendors`)
                    .then(res => res.json())
                    .then(data => {
                        const vendorsList = data.data || [];
                        if (vendorsList.length > 0) {
                            const latestVendor = vendorsList[vendorsList.length - 1]; // Use last one
                            console.log('Auto-recovered vendor_id:', latestVendor.id);
                            localStorage.setItem('vendor_id', latestVendor.id);
                        } else {
                            console.error('No vendors found in backend. Please sign up first.');
                        }
                    })
                    .catch(err => console.error('Failed to auto-recover vendor_id:', err));
            }

            if (savedName) setFormData(prev => ({ ...prev, businessName: savedName }));
            if (savedPoc) setFormData(prev => ({ ...prev, pocName: savedPoc }));
            if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));
            if (savedTeamSize) setFormData(prev => ({ ...prev, teamSize: savedTeamSize }));
            if (savedBookings) setFormData(prev => ({ ...prev, bookingsPerYear: savedBookings }));
            if (savedExperience) setFormData(prev => ({ ...prev, experience: savedExperience }));
            if (savedVendorType) setFormData(prev => ({ ...prev, vendorType: savedVendorType }));
            if (savedCategories) setFormData(prev => ({ ...prev, categories: JSON.parse(savedCategories) }));
            if (savedCity) setFormData(prev => ({ ...prev, city: savedCity }));
            if (savedServiceAreas) setFormData(prev => ({ ...prev, serviceAreas: JSON.parse(savedServiceAreas) }));
            if (savedProfilePic) {
                setFormData(prev => ({ ...prev, profilePicture: savedProfilePic }));
                setTempImage(savedProfilePic);
            }
            if (savedDescription) setFormData(prev => ({ ...prev, description: savedDescription }));
            if (savedPhotos) setFormData(prev => ({ ...prev, businessPhotos: JSON.parse(savedPhotos) }));
            if (savedCover) setFormData(prev => ({ ...prev, coverImage: savedCover }));
            if (savedStep) setStep(parseInt(savedStep));
        }
    }, []);

    const handleSaveAndExit = async () => {
        await handleUpdate();
        router.push('/dashboard');
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const vendorId = localStorage.getItem('vendor_id');
            console.log('Attempting update for vendor:', vendorId);

            if (!vendorId) {
                console.error('No vendor ID found in localStorage');
                return;
            }

            const response = await fetch(`${API_BASE}/vendors/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: formData.businessName,
                    pocName: formData.pocName,
                    email: formData.email,
                    teamSize: formData.teamSize,
                    bookingsPerYear: formData.bookingsPerYear,
                    experience: formData.experience,
                    vendorType: formData.vendorType,
                    categories: formData.categories,
                    city: formData.city,
                    serviceAreas: formData.serviceAreas,
                    profilePicture: formData.profilePicture,
                    description: formData.description,
                    businessPhotos: formData.businessPhotos,
                    coverImage: formData.coverImage
                }),
            });

            console.log('Update response status:', response.status);
            const data = await response.json();

            if (response.ok) {
                console.log('Update successful, current step:', step);
                // Save locally too
                localStorage.setItem('vendor_name', formData.businessName);
                localStorage.setItem('vendor_poc', formData.pocName);
                localStorage.setItem('vendor_email', formData.email);
                localStorage.setItem('vendor_team_size', formData.teamSize);
                localStorage.setItem('vendor_bookings', formData.bookingsPerYear);
                localStorage.setItem('vendor_experience', formData.experience);
                localStorage.setItem('vendor_type', formData.vendorType);
                localStorage.setItem('vendor_categories', JSON.stringify(formData.categories));
                localStorage.setItem('vendor_city', formData.city);
                localStorage.setItem('vendor_service_areas', JSON.stringify(formData.serviceAreas));
                if (formData.profilePicture) localStorage.setItem('vendor_profile_picture', formData.profilePicture);
                if (formData.description) localStorage.setItem('vendor_description', formData.description);
                localStorage.setItem('vendor_business_photos', JSON.stringify(formData.businessPhotos));
                if (formData.coverImage) localStorage.setItem('vendor_cover_image', formData.coverImage);

                if (step === 12) {
                    console.log('Final step reached. Redirecting...');
                    localStorage.removeItem('vendor_setup_step');
                    localStorage.setItem('onboarding_success', 'true');
                    router.push('/dashboard');
                }
            } else {
                console.error('Server error:', data);
                alert(`Error: ${data.message || 'Failed to save data'}`);
            }
        } catch (error) {
            console.error('Network or client error:', error);
            alert('Connection error. Please check your internet or if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        await handleUpdate();
        if (step < 12) {
            const nextStep = step + 1;
            setStep(nextStep);
            localStorage.setItem('vendor_setup_step', nextStep.toString());
        }
    };

    const handleBack = () => {
        if (step === 1) {
            router.back();
        } else {
            const prevStep = step - 1;
            setStep(prevStep);
            localStorage.setItem('vendor_setup_step', prevStep.toString());
        }
    };

    const isButtonDisabled = () => {
        if (step === 1) return formData.businessName.trim().length < 2;
        if (step === 2) return formData.pocName.trim().length < 2;
        if (step === 3) return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (step === 4) return !formData.teamSize;
        if (step === 5) return !formData.bookingsPerYear;
        if (step === 6) return !formData.experience;
        if (step === 7) return !formData.vendorType || formData.categories.length === 0;
        if (step === 8) return formData.serviceAreas.length === 0;
        if (step === 9) return !formData.profilePicture;
        if (step === 10) return formData.description.length < 200 || formData.description.length > 400;
        if (step === 11) return false; // Guidelines step always enabled
        if (step === 12) return formData.businessPhotos.length < 3 || !formData.coverImage;
        return true;
    };

    const toggleCategory = (category: string) => {
        setFormData(prev => {
            const categories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories };
        });
    };

    const toggleServiceArea = (area: string, isCity: boolean = false) => {
        setFormData(prev => {
            const exists = prev.serviceAreas.includes(area);
            let newAreas = [...prev.serviceAreas];
            let newCity = prev.city;

            if (exists) {
                newAreas = newAreas.filter(a => a !== area);
                if (isCity && newCity === area) {
                    newCity = newAreas.find(a => cities.includes(a)) || '';
                }
            } else {
                newAreas.push(area);
                if (isCity && !newCity) {
                    newCity = area;
                }
            }
            return { ...prev, serviceAreas: newAreas, city: newCity };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setTempImage(base64String);
                setFormData(prev => ({ ...prev, profilePicture: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            fileArray.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => {
                        if (prev.businessPhotos.length >= 10) return prev;
                        return { ...prev, businessPhotos: [...prev.businessPhotos, reader.result as string] };
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            businessPhotos: prev.businessPhotos.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree">
            {/* Top Bar */}
            <div className="px-6 pt-12">
                {/* Progress Bar */}
                <div
                    className="w-full h-[12px] rounded-[12px] overflow-hidden mb-6"
                    style={{ backgroundColor: 'rgba(230, 233, 234, 1)' }}
                >
                    <div
                        className="h-full rounded-[12px] transition-all duration-500"
                        style={{
                            width: `${(step / 12) * 98}%`,
                            backgroundColor: 'rgba(3, 27, 36, 1)'
                        }}
                    />
                </div>

                {/* Save & Exit */}
                <button
                    onClick={handleSaveAndExit}
                    className="flex items-center gap-1 text-[#030303] text-[14px] font-medium py-2 active:opacity-60 transition-all"
                >
                    <ChevronLeft size={20} />
                    <span>Save & Exit</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 pt-10 overflow-y-auto pb-24">
                <AnimatePresence mode="wait">
                    {/* ... (previous steps remain the same) */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                What’s your business or brand name
                            </h1>

                            <div className="flex flex-col items-start gap-2 w-full max-w-[361px]">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Business Name/ Brand Name"
                                    value={formData.businessName}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                    className="w-full text-[16px] leading-6 font-normal px-5 py-4 border rounded-xl outline-none transition-all bg-white shadow-sm font-figtree placeholder:text-[rgba(159,159,169,1)]"
                                    style={{
                                        borderColor: isFocused || formData.businessName ? 'rgba(3, 3, 3, 1)' : 'rgba(212, 212, 216, 1)',
                                        color: isFocused || formData.businessName ? 'rgba(3, 3, 3, 1)' : 'rgba(159, 159, 169, 1)'
                                    }}
                                />
                                <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] tracking-normal mt-2 font-figtree">
                                    Enter your business name. If you’re an individual/ Freelancer, you can use your own name.
                                </p>
                                <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" checked={formData.isIndividual} onChange={(e) => setFormData({ ...formData, isIndividual: e.target.checked })} className="sr-only" />
                                        <div className={`w-5 h-5 border-2 rounded-[4px] transition-all flex items-center justify-center ${formData.isIndividual ? 'bg-[#04222D] border-[#04222D]' : 'border-[#D4D4D8] group-hover:border-gray-400'}`}>
                                            {formData.isIndividual && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </div>
                                    </div>
                                    <span className="text-[#030303] text-[14px] font-medium leading-[20px] font-figtree">I operate as an individual</span>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                What is the name of the person receiving the order
                            </h1>
                            <div className="flex flex-col items-start gap-2 w-full max-w-[361px]">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Person Name"
                                    value={formData.pocName}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                    className="w-full text-[16px] leading-6 font-normal px-5 py-4 border rounded-xl outline-none transition-all bg-white shadow-sm font-figtree placeholder:text-[rgba(159,159,169,1)]"
                                    style={{
                                        borderColor: isFocused || formData.pocName ? 'rgba(3, 3, 3, 1)' : 'rgba(212, 212, 216, 1)',
                                        color: isFocused || formData.pocName ? 'rgba(3, 3, 3, 1)' : 'rgba(159, 159, 169, 1)'
                                    }}
                                />
                                <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] tracking-normal mt-2 font-figtree">
                                    Enter name of the Person one who will Handle the booking
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                What is your Email
                            </h1>
                            <div className="flex flex-col items-start gap-2 w-full max-w-[361px]">
                                <input
                                    autoFocus
                                    type="email"
                                    placeholder="Johnjoe@gmail.com"
                                    value={formData.email}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                    className="w-full text-[16px] leading-6 font-normal px-5 py-4 border rounded-xl outline-none transition-all bg-white shadow-sm font-figtree placeholder:text-[rgba(159,159,169,1)]"
                                    style={{
                                        borderColor: isFocused || formData.email ? 'rgba(3, 3, 3, 1)' : 'rgba(212, 212, 216, 1)',
                                        color: isFocused || formData.email ? 'rgba(3, 3, 3, 1)' : 'rgba(159, 159, 169, 1)'
                                    }}
                                />
                                <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] tracking-normal mt-2 font-figtree">
                                    Enter your email address to receive important updates
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                How many people work in your team?
                            </h1>
                            <div className="flex flex-wrap gap-3 w-full max-w-[400px]">
                                {teamSizeOptions.map((option) => (
                                    <button key={option} onClick={() => setFormData({ ...formData, teamSize: option })} className={`px-6 py-3 rounded-full border transition-all font-medium text-[14px] font-figtree ${formData.teamSize === option ? 'bg-[#04222D] border-[#04222D] text-white' : 'bg-white border-[#04222D] text-[#04222D] hover:bg-gray-50'}`}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] tracking-normal mt-4 font-figtree">Include yourself in the count.</p>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                How many bookings do you handle in a year?
                            </h1>
                            <div className="flex flex-wrap gap-3 w-full max-w-[450px]">
                                {bookingsOptions.map((option) => (
                                    <button key={option} onClick={() => setFormData({ ...formData, bookingsPerYear: option })} className={`px-6 py-3 rounded-full border transition-all font-medium text-[14px] font-figtree ${formData.bookingsPerYear === option ? 'bg-[#04222D] border-[#04222D] text-white' : 'bg-white border-[#04222D] text-[#04222D] hover:bg-gray-50'}`}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] tracking-normal mt-4 font-figtree">This helps us recommend the right bookings for you.</p>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div
                            key="step6"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                How many years in the Business (Experience)
                            </h1>
                            <div className="flex flex-wrap gap-3 w-full max-w-[400px]">
                                {experienceOptions.map((option) => (
                                    <button key={option} onClick={() => setFormData({ ...formData, experience: option })} className={`px-6 py-3 rounded-full border transition-all font-medium text-[14px] font-figtree ${formData.experience === option ? 'bg-[#04222D] border-[#04222D] text-white' : 'bg-white border-[#04222D] text-[#04222D] hover:bg-gray-50'}`}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] tracking-normal mt-4 font-figtree">This helps us recommend the right bookings for you.</p>
                        </motion.div>
                    )}

                    {step === 7 && (
                        <motion.div
                            key="step7"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal">
                                What vendor type and services you provide?
                            </h1>

                            {/* Vendor Type Selection */}
                            <div className="flex flex-wrap gap-3 w-full max-w-[500px]">
                                {vendorTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData(prev => ({ ...prev, vendorType: type }))}
                                        className={`px-4 py-2 rounded-full border transition-all font-medium text-[14px] font-figtree flex items-center gap-2 ${formData.vendorType === type
                                                ? 'bg-[#04222D] border-[#04222D] text-white'
                                                : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-50'
                                            }`}
                                    >
                                        {type}
                                        {formData.vendorType === type && (
                                            <div
                                                className="bg-white rounded-full p-0.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData(prev => ({ ...prev, vendorType: '' }));
                                                }}
                                            >
                                                <X size={12} className="text-[#04222D]" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] font-figtree">
                                Specify the type of vendor you are.
                            </p>

                            {formData.vendorType && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 pt-4 border-t border-gray-100"
                                >
                                    <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] font-figtree italic">
                                        Events which you provide with a wide category Ex. Tent, Catering, Decorations etc.
                                    </p>

                                    {/* Selected Categories Tags */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className="bg-[#04222D] text-white px-3 py-1.5 rounded-full text-[13px] flex items-center gap-2 font-medium"
                                            >
                                                {cat}
                                                <X size={14} />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full max-w-[361px]">
                                        <div className="text-[12px] font-semibold text-[#030303] mb-2 uppercase tracking-wider">All Categories</div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search Events"
                                                value={eventSearch}
                                                onFocus={() => setShowEventDropdown(true)}
                                                onChange={(e) => setEventSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                                className="w-full pl-4 pr-10 py-3.5 border border-[#D4D4D8] rounded-xl outline-none focus:border-[#030303] transition-all font-figtree text-[15px]"
                                            />
                                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        </div>

                                        {/* Dropdown */}
                                        {showEventDropdown && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[250px] overflow-y-auto py-2">
                                                {eventCategories
                                                    .filter(cat => cat.toLowerCase().includes(eventSearch.toLowerCase()))
                                                    .map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => {
                                                                toggleCategory(cat);
                                                                setEventSearch('');
                                                                // Keep dropdown open for multi-select
                                                            }}
                                                            className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                                                        >
                                                            <span className={`text-[15px] ${formData.categories.includes(cat) ? 'font-semibold text-[#030303]' : 'text-[#3F3F47]'}`}>
                                                                {cat}
                                                            </span>
                                                            {formData.categories.includes(cat) && <Check size={18} className="text-[#030303]" />}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {step === 8 && (
                        <motion.div
                            key="step8"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal font-figtree">
                                What is your Service area?
                            </h1>

                            <div className="space-y-6">
                                {/* City Selection */}
                                <div className="flex flex-wrap gap-3">
                                    {cities.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => {
                                                setActiveCity(city);
                                                if (!formData.serviceAreas.includes(city)) {
                                                    toggleServiceArea(city, true);
                                                }
                                            }}
                                            className={`px-5 py-2.5 rounded-full border transition-all text-[14px] font-medium font-figtree ${activeCity === city
                                                    ? 'bg-[#04222D] border-[#04222D] text-white'
                                                    : formData.serviceAreas.includes(city)
                                                        ? 'bg-gray-100 border-[#04222D] text-[#04222D]'
                                                        : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-50'
                                                }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>

                                {/* Localities for Active City */}
                                {activeCity && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-[#3F3F47] text-[14px] font-normal leading-[20px] font-figtree">
                                            Enter the localities where your business operates.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {cityLocalities[activeCity].map((locality) => (
                                                <button
                                                    key={locality}
                                                    onClick={() => toggleServiceArea(locality)}
                                                    className={`px-5 py-2.5 rounded-full border transition-all text-[14px] font-medium font-figtree ${formData.serviceAreas.includes(locality)
                                                            ? 'bg-[#04222D] border-[#04222D] text-white'
                                                            : 'bg-white border-[#D4D4D8] text-[#3F3F47] hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {locality}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Location Search Box */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <p className="text-gray-400 text-[14px] font-normal font-figtree">
                                        Couldn't find your location
                                    </p>
                                    <div className="relative w-full max-w-[361px]">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search Locations"
                                                value={locationSearch}
                                                onFocus={() => setShowLocationDropdown(true)}
                                                onChange={(e) => setLocationSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                                className="w-full pl-4 pr-10 py-3.5 border border-[#D4D4D8] rounded-xl outline-none focus:border-[#030303] transition-all font-figtree text-[15px]"
                                            />
                                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        </div>

                                        {/* Dropdown */}
                                        {showLocationDropdown && locationSearch && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[200px] overflow-y-auto py-2">
                                                {Object.values(cityLocalities)
                                                    .flat()
                                                    .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                                                    .map(loc => (
                                                        <button
                                                            key={loc}
                                                            onClick={() => {
                                                                toggleServiceArea(loc);
                                                                setLocationSearch('');
                                                                setShowLocationDropdown(false);
                                                            }}
                                                            className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                                                        >
                                                            <span className={`text-[15px] ${formData.serviceAreas.includes(loc) ? 'font-semibold text-[#030303]' : 'text-[#3F3F47]'}`}>
                                                                {loc}
                                                            </span>
                                                            {formData.serviceAreas.includes(loc) && <Check size={18} className="text-[#030303]" />}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Areas Tags */}
                                {formData.serviceAreas.length > 0 && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="text-[12px] font-semibold text-[#030303] mb-3 uppercase tracking-wider font-figtree">Selected Areas</div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.serviceAreas.map(area => (
                                                <button
                                                    key={area}
                                                    onClick={() => toggleServiceArea(area, cities.includes(area))}
                                                    className="bg-[#04222D] text-white px-4 py-2 rounded-full text-[13px] flex items-center gap-2 font-medium font-figtree shadow-sm active:scale-95 transition-all"
                                                >
                                                    {area}
                                                    <X size={14} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 9 && (
                        <motion.div
                            key="step9"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8 pb-10"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal font-figtree">
                                {tempImage ? 'Uploaded profile picture' : 'Create profile picture'}
                            </h1>

                            {tempImage ? (
                                <div className="space-y-10 flex flex-col items-center">
                                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#04222D]/10 shadow-xl bg-gray-50 flex items-center justify-center">
                                        <motion.img
                                            src={tempImage}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                            style={{ scale: zoom }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    </div>

                                    <div className="w-full max-w-[361px] space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-sm font-medium text-[#030303] font-figtree">Zoom</span>
                                            <span className="text-xs text-gray-400 font-figtree">{Math.round(zoom * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.01"
                                            value={zoom}
                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#04222D]"
                                        />
                                        <button
                                            onClick={() => {
                                                setTempImage(null);
                                                setFormData(prev => ({ ...prev, profilePicture: '' }));
                                            }}
                                            className="w-full text-center text-sm text-[#04222D] font-semibold py-3.5 border border-[#D4D4D8] rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                                        >
                                            Remove and upload another
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Upload Button */}
                                    <label className="flex flex-col items-center justify-center w-full max-w-[361px] h-20 border-2 border-[#D4D4D8] rounded-xl cursor-pointer hover:border-[#04222D] transition-all bg-white group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#04222D]/10 transition-colors">
                                                <Upload size={18} className="text-gray-600 group-hover:text-[#04222D]" />
                                            </div>
                                            <span className="text-[16px] font-medium text-[#030303] font-figtree">Upload your Picture</span>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>

                                    {/* Or Separator */}
                                    <div className="flex items-center gap-4 w-full max-w-[361px]">
                                        <div className="h-[1px] bg-gray-200 flex-1"></div>
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Or</span>
                                        <div className="h-[1px] bg-gray-200 flex-1"></div>
                                    </div>

                                    {/* Avatar Grid */}
                                    <div className="flex justify-center gap-8 pt-4">
                                        {avatars.map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setTempImage(url);
                                                    setFormData(prev => ({ ...prev, profilePicture: url }));
                                                }}
                                                className={`relative w-[140px] h-[140px] rounded-full flex items-center justify-center transition-all ${formData.profilePicture === url
                                                        ? 'ring-2 ring-[#04222D] ring-offset-4'
                                                        : 'hover:scale-105'
                                                    }`}
                                            >
                                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                                                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 10 && (
                        <motion.div
                            key="step10"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6 pb-10"
                        >
                            <div className="space-y-2">
                                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal font-figtree">
                                    Tell us about your brand
                                </h1>
                                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree leading-relaxed">
                                    Effective descriptions highlight key details and what makes your venue stand out to attract clients.
                                </p>
                            </div>

                            <div className="space-y-2 relative">
                                <div className="flex justify-end pr-1">
                                    <span className={`text-[12px] font-medium font-figtree transition-colors ${formData.description.length > 400
                                            ? 'text-rose-500'
                                            : 'text-gray-400'
                                        }`}>
                                        {formData.description.length}/400
                                    </span>
                                </div>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Description about your brand"
                                    className={`w-full min-h-[220px] p-5 rounded-[8px] border transition-all resize-none font-figtree text-[15px] leading-relaxed placeholder:text-gray-400 outline-none text-[#030303] ${formData.description.length > 400
                                            ? 'border-rose-300 bg-rose-50/10 focus:border-rose-500'
                                            : 'border-[#71717B] focus:border-[#04222D] bg-[#E6E9EA]'
                                        }`}
                                />
                                <p className="text-[13px] font-medium font-figtree text-gray-400">
                                    A minimum of 200 characters is required
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 11 && (
                        <motion.div
                            key="step11"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8 pb-10"
                        >
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal font-figtree">
                                Uploading images guidelines
                            </h1>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-[14px] font-bold text-[#3F3F47] uppercase tracking-wider font-figtree">SUITABLE</h2>
                                    <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
                                        <div className="bg-white p-4 rounded-xl shadow-sm">
                                            <ImageIcon size={40} className="text-[#04222D]/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-green-600">
                                            <CheckCircle2 size={18} />
                                            <span className="text-[14px] font-medium font-figtree">Clear images of your space</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-green-600">
                                            <CheckCircle2 size={18} />
                                            <span className="text-[14px] font-medium font-figtree">At least 5 Images</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-green-600">
                                            <CheckCircle2 size={18} />
                                            <span className="text-[14px] font-medium font-figtree">Images should be high resolution</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6">
                                    <h2 className="text-[14px] font-bold text-[#3F3F47] uppercase tracking-wider font-figtree">UNSUITABLE</h2>
                                    <div className="w-full h-40 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200">
                                        <div className="opacity-20 grayscale">
                                            <ImageIcon size={32} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-rose-500">
                                            <XCircle size={18} />
                                            <span className="text-[14px] font-medium font-figtree">Stock Image</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-rose-500">
                                            <XCircle size={18} />
                                            <span className="text-[14px] font-medium font-figtree">Logos and brand Image</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 12 && (
                        <motion.div
                            key="step12"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8 pb-10"
                        >
                            <div className="space-y-2">
                                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal font-figtree">
                                    Upload images for carousel
                                </h1>
                                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree leading-relaxed">
                                    Add 3 to 10 images of your location to your profile for the carousel. Drag and drop to reorder them. You can update or add more images anytime.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Cover Image Section */}
                                <div className={`relative flex items-center justify-between p-4 rounded-[8px] transition-all ${formData.coverImage ? 'bg-[#04222D]/5 border border-[#04222D]' : 'bg-[#E6E9EA]'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formData.coverImage ? 'bg-white' : 'bg-white/50'}`}>
                                            {formData.coverImage ? (
                                                <img src={formData.coverImage} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <ImageIcon size={24} className="text-[#04222D]/40" />
                                            )}
                                        </div>
                                        <span className="text-[16px] font-semibold text-[#04222D] font-figtree">
                                            {formData.coverImage ? 'Cover image added' : 'Add cover Image'}
                                        </span>
                                    </div>
                                    <label className="bg-white text-[#04222d]  border border-[#04222d] px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-50 transition-all">
                                        Choose a File
                                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                                    </label>
                                </div>

                                {/* Carousel Photos Section */}
                                <div className="space-y-4">
                                    <div className="w-full p-8 rounded-[8px] bg-[#E6E9EA] flex flex-col items-center justify-center gap-4 group transition-all border border-[#71717B]/20">
                                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#04222D]">
                                            <ImageIcon size={24} />
                                        </div>

                                        <label className="bg-white text-[#04222d] border border-[#04222d] px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all shadow-sm">
                                            Choose a File
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosUpload} />
                                        </label>
                                        <div className="text-center">
                                            <p className="text-[16px] font-semibold text-[#04222D] font-figtree">Add your images</p>
                                            <p className="text-[12px] text-gray-500 mt-1 font-figtree">Max size 10 MB</p>
                                        </div>e
                                    </div>

                                    {/* Photo Grid */}
                                    {formData.businessPhotos.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            {formData.businessPhotos.map((photo, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                                                    <img src={photo} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removePhoto(idx)}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.businessPhotos.length < 10 && (
                                                <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:border-[#04222D] hover:text-[#04222D] cursor-pointer transition-all">
                                                    <Plus size={32} />
                                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosUpload} />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 flex items-center gap-4 border-t border-gray-50">
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center border border-[#04222D] bg-[#E6E9EA] rounded-lg active:scale-95 transition-all flex-shrink-0"
                    style={{ width: '56px', height: '56px' }}
                >
                    <ArrowLeft size={24} className="text-[#04222D]" />
                </button>

                <div className="flex-1 flex flex-col items-center gap-2">
                    <button
                        disabled={isButtonDisabled() || loading}
                        onClick={handleContinue}
                        className={`w-full h-[56px] rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${isButtonDisabled() || loading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'text-white active:scale-[0.98]'
                            }`}
                        style={{
                            backgroundColor: isButtonDisabled() || loading ? '#E5E7EB' : CONTINUE_BUTTON_COLOR
                        }}
                    >
                        {loading ? 'Saving...' : (step === 12 ? 'Submit' : 'Continue')}
                    </button>
                    {step === 12 && isButtonDisabled() && !loading && (
                        <p className="text-[12px] font-medium text-rose-500 animate-pulse">
                            {!formData.coverImage ? 'Please add a cover image' : 'Please upload at least 3 carousel images'}
                        </p>
                    )}
                </div>
            </div>

            {/* Home Indicator Spacer */}
            <div className="h-6" />
        </div>
    );
}
