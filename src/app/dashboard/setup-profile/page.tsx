'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft, ArrowRight, X, Search, Check, Upload, CheckCircle2, XCircle, Plus, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StepTerms } from './StepTerms';
import { StepBusinessName, StepPOCName, StepEmail, StepSingleChoice, StepDescription } from './StepBasics';
import { StepVendorType } from './StepVendorType';
import { StepServiceArea } from './StepServiceArea';
import { StepProfileCover } from './StepProfileCover';
import { StepGuidelines, StepCarousel } from './StepMedia';
import { StepSummary } from './StepSummary';

const API_BASE = apiUrl('');
const CONTINUE_BUTTON_COLOR = 'rgba(4, 34, 45, 1)';

export default function SetupBusinessProfile() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
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
    const [uploadingCover, setUploadingCover] = useState(false);
    const [coverProgress, setCoverProgress] = useState(0);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [photosProgress, setPhotosProgress] = useState(0);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [eventSearch, setEventSearch] = useState('');
    const [showEventDropdown, setShowEventDropdown] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showZoomView, setShowZoomView] = useState(false);

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

    useEffect(() => {
        let interval: any;
        if (uploadingCover) {
            setCoverProgress(0);
            interval = setInterval(() => {
                setCoverProgress(prev => prev >= 90 ? prev : prev + Math.floor(Math.random() * 15 + 5));
            }, 300);
        } else {
            setCoverProgress(100);
            const to = setTimeout(() => setCoverProgress(0), 500);
            return () => { clearInterval(interval); clearTimeout(to); };
        }
        return () => clearInterval(interval);
    }, [uploadingCover]);

    useEffect(() => {
        let interval: any;
        if (uploadingPhotos) {
            setPhotosProgress(0);
            interval = setInterval(() => {
                setPhotosProgress(prev => prev >= 90 ? prev : prev + Math.floor(Math.random() * 10 + 5));
            }, 400);
        } else {
            setPhotosProgress(100);
            const to = setTimeout(() => setPhotosProgress(0), 500);
            return () => { clearInterval(interval); clearTimeout(to); };
        }
        return () => clearInterval(interval);
    }, [uploadingPhotos]);

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

                 if (step === 14) {
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
        if (showZoomView) {
            setFormData(prev => ({ ...prev, profilePicture: tempImage! }));
            setShowZoomView(false);
            return;
        }
        await handleUpdate();
        if (step < 14) {
            const nextStep = step + 1;
            setStep(nextStep);
            localStorage.setItem('vendor_setup_step', nextStep.toString());
        }
    };

    const handleBack = () => {
        if (showZoomView) {
            setShowZoomView(false);
            setTempImage(null);
            return;
        }
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
        if (step === 9) return !formData.profilePicture || !formData.coverImage;
        if (step === 10) return formData.description.length < 200 || formData.description.length > 400;
        if (step === 11) return false; // Guidelines — always enabled
        if (step === 12) return formData.businessPhotos.length < 3;
        if (step === 13) return !hasAcceptedTerms;
        if (step === 14) return false;
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

    const uploadToS3 = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
        const data = await response.json();
        return data.url;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoading(true);
            try {
                const url = await uploadToS3(file);
                setTempImage(url);
                setShowProfileSheet(false);
                setShowZoomView(true);
            } catch (err) {
                console.error("Failed to upload profile picture:", err);
                alert("Failed to upload profile picture. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadingCover(true);
            try {
                const url = await uploadToS3(file);
                setFormData(prev => ({ ...prev, coverImage: url }));
            } catch (err) {
                console.error("Failed to upload cover image:", err);
                alert("Failed to upload cover image. Please try again.");
            } finally {
                setUploadingCover(false);
            }
        }
    };

    const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setUploadingPhotos(true);
            try {
                const uploadPromises = fileArray.map(file => uploadToS3(file));
                const urls = await Promise.all(uploadPromises);
                setFormData(prev => {
                    const newPhotos = [...prev.businessPhotos, ...urls];
                    if (newPhotos.length > 10) {
                        return { ...prev, businessPhotos: newPhotos.slice(0, 10) };
                    }
                    return { ...prev, businessPhotos: newPhotos };
                });
            } catch (err) {
                console.error("Failed to upload business photos:", err);
                alert("Failed to upload some business photos. Please try again.");
            } finally {
                setUploadingPhotos(false);
            }
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
            {step < 14 && (
                <div className="px-6 pt-12">
                    {/* Progress Bar */}
                    <div
                        className="w-full h-[12px] rounded-[12px] overflow-hidden mb-6"
                        style={{ backgroundColor: 'rgba(230, 233, 234, 1)' }}
                    >
                        <div
                            className="h-full rounded-[12px] transition-all duration-500"
                            style={{
                                width: `${(step / 14) * 98}%`,
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
            )}

            {/* Main Content */}
            <div className={`flex-1 ${step < 14 ? 'overflow-y-auto px-6 pt-10 pb-24' : 'flex flex-col overflow-hidden'}`}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <StepBusinessName
                            formData={formData}
                            setFormData={setFormData}
                            onContinue={handleContinue}
                        />
                    )}

                    {step === 2 && (
                        <StepPOCName
                            formData={formData}
                            setFormData={setFormData}
                            onContinue={handleContinue}
                        />
                    )}

                    {step === 3 && (
                        <StepEmail
                            formData={formData}
                            setFormData={setFormData}
                            onContinue={handleContinue}
                        />
                    )}

                    {step === 4 && (
                        <StepSingleChoice
                            stepKey="step4"
                            title="How many people work in your team?"
                            subtitle="Include yourself in the count."
                            options={teamSizeOptions}
                            value={formData.teamSize}
                            onChange={(val) => setFormData(prev => ({ ...prev, teamSize: val }))}
                        />
                    )}

                    {step === 5 && (
                        <StepSingleChoice
                            stepKey="step5"
                            title="How many bookings do you handle in a year?"
                            subtitle="This helps us recommend the right bookings for you."
                            options={bookingsOptions}
                            value={formData.bookingsPerYear}
                            onChange={(val) => setFormData(prev => ({ ...prev, bookingsPerYear: val }))}
                        />
                    )}

                    {step === 6 && (
                        <StepSingleChoice
                            stepKey="step6"
                            title="How many years in the Business (Experience)"
                            subtitle="This helps us recommend the right bookings for you."
                            options={experienceOptions}
                            value={formData.experience}
                            onChange={(val) => setFormData(prev => ({ ...prev, experience: val }))}
                        />
                    )}

                    {step === 7 && (
                        <StepVendorType
                            formData={formData}
                            setFormData={setFormData}
                            eventSearch={eventSearch}
                            setEventSearch={setEventSearch}
                            showEventDropdown={showEventDropdown}
                            setShowEventDropdown={setShowEventDropdown}
                            toggleCategory={toggleCategory}
                            isButtonDisabled={isButtonDisabled}
                            handleContinue={handleContinue}
                        />
                    )}

                    {step === 8 && (
                        <StepServiceArea
                            formData={formData}
                            activeCity={activeCity}
                            setActiveCity={setActiveCity}
                            locationSearch={locationSearch}
                            setLocationSearch={setLocationSearch}
                            showLocationDropdown={showLocationDropdown}
                            setShowLocationDropdown={setShowLocationDropdown}
                            toggleServiceArea={toggleServiceArea}
                        />
                    )}

                    {step === 9 && (
                        <StepProfileCover
                            formData={formData}
                            setFormData={setFormData}
                            tempImage={tempImage}
                            setTempImage={setTempImage}
                            zoom={zoom}
                            setZoom={setZoom}
                            showZoomView={showZoomView}
                            showProfileSheet={showProfileSheet}
                            setShowProfileSheet={setShowProfileSheet}
                            uploadingCover={uploadingCover}
                            coverProgress={coverProgress}
                            handleFileChange={handleFileChange}
                            handleCoverUpload={handleCoverUpload}
                        />
                    )}
                    {step === 10 && (
                        <StepDescription
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}

                    {step === 11 && (
                        <StepGuidelines stepKey="step11" />
                    )}

                    {step === 12 && (
                        <StepCarousel
                            businessPhotos={formData.businessPhotos}
                            uploadingPhotos={uploadingPhotos}
                            photosProgress={photosProgress}
                            onUpload={handlePhotosUpload}
                            onRemove={removePhoto}
                        />
                    )}

                    {step === 13 && (
                        <StepTerms
                            hasAcceptedTerms={hasAcceptedTerms}
                            setHasAcceptedTerms={setHasAcceptedTerms}
                        />
                    )}

                    {step === 14 && (
                        <StepSummary
                            formData={formData}
                            onBack={() => {
                                setStep(13);
                                localStorage.setItem('vendor_setup_step', '13');
                            }}
                            onSubmit={handleContinue}
                            onEdit={() => {
                                setStep(1);
                                localStorage.setItem('vendor_setup_step', '1');
                            }}
                            loading={loading}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            {step < 14 && (
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
                            {loading ? 'Saving...' : 'Continue'}
                        </button>
                        {step === 12 && isButtonDisabled() && !loading && (
                            <p className="text-[12px] font-medium text-rose-500 animate-pulse">
                                {!formData.coverImage ? 'Please add a cover image' : 'Please upload at least 3 carousel images'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Home Indicator Spacer */}
            {step < 14 && <div className="h-6" />}
        </div>
    );
}
