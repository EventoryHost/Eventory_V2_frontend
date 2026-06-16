'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft, ArrowRight, X, Search, Check, Upload, CheckCircle2, XCircle, Plus, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StepTerms } from './StepTerms';
import { StepBusinessName, StepPOCName, StepEmail, StepSingleChoice, StepDescription } from './StepBasics';
import { StepVendorType, StepVendorCategories } from './StepVendorType';
import { StepServiceArea } from './StepServiceArea';
import { StepProfileCover } from './StepProfileCover';
import { StepGuidelines, StepCarousel } from './StepMedia';
import { StepSummary } from './StepSummary';

const API_BASE = apiUrl('');
const CONTINUE_BUTTON_COLOR = 'rgba(4, 34, 45, 1)';
const SETUP_FLOW_VERSION = '2';

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
        vendorType: [] as string[],
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
            // Clear stale dashboard_step if onboarding wizard is still in progress
            const _existingSetupStep = localStorage.getItem('vendor_setup_step');
            if (_existingSetupStep && _existingSetupStep !== '15') {
                localStorage.removeItem('dashboard_step');
            }
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
            if (savedVendorType) {
                const parsedVendorTypes = savedVendorType.trim().startsWith('[')
                    ? JSON.parse(savedVendorType)
                    : savedVendorType.split(',').map((item) => item.trim()).filter(Boolean);
                setFormData(prev => ({ ...prev, vendorType: parsedVendorTypes }));
            }
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
            if (savedStep) {
                const savedFlowVersion = localStorage.getItem('vendor_setup_flow_version');
                const parsedStep = parseInt(savedStep);
                const nextStep = savedFlowVersion === SETUP_FLOW_VERSION
                    ? parsedStep
                    : parsedStep >= 8
                        ? parsedStep + 1
                        : parsedStep;

                // Auto-reset to step 10 (ProfileCover) if we're past it but images are missing.
                // This lets you re-test step 10 just by deleting images from the DB.
                const hasCover = !!(savedCover && savedCover.trim());
                const hasProfilePic = !!(savedProfilePic && savedProfilePic.trim());
                if (nextStep >= 10 && (!hasCover || !hasProfilePic)) {
                    console.log('[Dev] Images missing — resetting to step 10 (ProfileCover)');
                    setStep(10);
                    localStorage.setItem('vendor_setup_step', '10');
                    localStorage.removeItem('vendor_cover_image');
                    localStorage.removeItem('vendor_profile_picture');
                } else {
                    setStep(nextStep);
                    localStorage.setItem('vendor_setup_flow_version', SETUP_FLOW_VERSION);
                }
            }
        }
    }, []);

    useEffect(() => {
        let interval: any;
        if (uploadingCover) {
            setCoverProgress(0);
            interval = setInterval(() => {
                // Cap at 92 so it never prematurely shows 100% before the real upload finishes
                setCoverProgress(prev => prev >= 92 ? 92 : prev + Math.floor(Math.random() * 12 + 4));
            }, 300);
        } else {
            setCoverProgress(100);
            const to = setTimeout(() => setCoverProgress(0), 600);
            return () => { clearInterval(interval); clearTimeout(to); };
        }
        return () => clearInterval(interval);
    }, [uploadingCover]);

    useEffect(() => {
        let interval: any;
        if (uploadingPhotos) {
            setPhotosProgress(0);
            interval = setInterval(() => {
                setPhotosProgress(prev => prev >= 92 ? 92 : prev + Math.floor(Math.random() * 8 + 4));
            }, 400);
        } else {
            setPhotosProgress(100);
            const to = setTimeout(() => setPhotosProgress(0), 600);
            return () => { clearInterval(interval); clearTimeout(to); };
        }
        return () => clearInterval(interval);
    }, [uploadingPhotos]);

    const handleSaveAndExit = async () => {
        await handleUpdate();
        router.push('/dashboard');
    };

    const handleUpdate = async (): Promise<boolean> => {
        setLoading(true);
        try {
            const vendorId = localStorage.getItem('vendor_id');
            console.log('Attempting update for vendor:', vendorId);

            if (!vendorId) {
                console.error('No vendor ID found in localStorage');
                return false;
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
                    vendorType: formData.vendorType.join(', '),
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
                localStorage.setItem('vendor_type', JSON.stringify(formData.vendorType));
                localStorage.setItem('vendor_categories', JSON.stringify(formData.categories));
                localStorage.setItem('vendor_setup_flow_version', SETUP_FLOW_VERSION);
                localStorage.setItem('vendor_city', formData.city);
                localStorage.setItem('vendor_service_areas', JSON.stringify(formData.serviceAreas));
                if (formData.profilePicture) localStorage.setItem('vendor_profile_picture', formData.profilePicture);
                if (formData.description) localStorage.setItem('vendor_description', formData.description);
                localStorage.setItem('vendor_business_photos', JSON.stringify(formData.businessPhotos));
                if (formData.coverImage) localStorage.setItem('vendor_cover_image', formData.coverImage);

                if (step === 15) {
                    console.log('Final step reached. Redirecting...');
                    localStorage.removeItem('vendor_setup_step');
                    localStorage.removeItem('dashboard_step'); // force dashboard to re-evaluate
                    localStorage.setItem('onboarding_success', 'true');
                    router.push('/dashboard');
                }
                return true;
            } else {
                console.error('Server error:', data);
                alert(`Error: ${data.message || 'Failed to save data'}`);
                return false;
            }
        } catch (error) {
            console.error('Network or client error:', error);
            alert('Connection error. Please check your internet or if the server is running.');
            return false;
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
        const success = await handleUpdate();
        // Only advance when the API call actually succeeded.
        // Previously this always advanced even on failure, causing
        // localStorage step to get ahead of what was saved.
        if (success && step < 15) {
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
        if (showZoomView) return !tempImage;
        if (step === 1) return formData.businessName.trim().length < 2;
        if (step === 2) return formData.pocName.trim().length < 2;
        if (step === 3) {
            if (formData.email.trim() === '') return false;
            return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        }
        if (step === 4) return !formData.teamSize;
        if (step === 5) return !formData.bookingsPerYear;
        if (step === 6) return !formData.experience;
        if (step === 7) return formData.vendorType.length === 0;
        if (step === 8) return formData.categories.length === 0;
        if (step === 9) return formData.serviceAreas.length === 0;
        if (step === 10) return !formData.profilePicture || !formData.coverImage;
        if (step === 11) return formData.description.length < 200 || formData.description.length > 400;
        if (step === 12) return false; // Guidelines — always enabled
        if (step === 13) return formData.businessPhotos.length < 3;
        if (step === 14) return !hasAcceptedTerms;
        if (step === 15) return false;
        return true;
    };

    const isContinueDisabled = showZoomView ? !tempImage : isButtonDisabled() || loading;

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
        const data = await response.json();
        if (!response.ok || !data.url) {
            const reason = data?.details || data?.error || 'Unknown upload error';
            throw new Error(reason);
        }
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
            } catch (err: any) {
                console.error("Failed to upload cover image:", err);
                alert(`Cover image upload failed: ${err?.message || 'Please try again.'}`);
                setCoverProgress(0);
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
            } catch (err: any) {
                console.error("Failed to upload business photos:", err);
                alert(`Photo upload failed: ${err?.message || 'Please try again.'}`);
                setPhotosProgress(0);
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
        <div className="min-h-[100dvh] bg-white flex flex-col font-figtree">
            {/* Top Bar */}
            {step < 15 && (
                <div className={`${step === 1 ? 'px-[22px] pt-[61px] pb-[10px] border-b border-[#F0F0F1]' : 'px-6 pt-12'}`}>
                    {/* Progress Bar */}
                    <div
                        className={`${step === 1 ? 'w-full h-[10px] rounded-[10px] mb-[21px]' : 'w-full h-[12px] rounded-[12px] mb-6'} overflow-hidden`}
                        style={{ backgroundColor: 'rgba(230, 233, 234, 1)' }}
                    >
                        <div
                            className={`${step === 1 ? 'rounded-[10px]' : 'rounded-[12px]'} h-full transition-all duration-500`}
                            style={{
                                width: step === 1 ? '31px' : `${(step / 15) * 98}%`,
                                backgroundColor: 'rgba(3, 27, 36, 1)'
                            }}
                        />
                    </div>

                    {/* Save & Exit */}
                    <button
                        onClick={handleSaveAndExit}
                        className={`${step === 1 ? 'py-0' : 'py-2'} flex items-center gap-1 text-[#030303] text-[14px] font-medium active:opacity-60 transition-all`}
                    >
                        <ChevronLeft size={step === 1 ? 18 : 20} />
                        <span>Save & Exit</span>
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 ${step === 15 ? 'flex flex-col overflow-hidden' : step === 1 ? 'overflow-y-auto px-[22px] pt-[29px] pb-[128px]' : 'overflow-y-auto px-6 pt-10 pb-[140px]'}`}>
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
                            title="How many bookings do you handle in a year ?"
                            subtitle="This helps us recommend bookings that match your capacity."
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
                        />
                    )}

                    {step === 8 && (
                        <StepVendorCategories
                            formData={formData}
                            setFormData={setFormData}
                            eventSearch={eventSearch}
                            setEventSearch={setEventSearch}
                            toggleCategory={toggleCategory}
                        />
                    )}

                    {step === 9 && (
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

                    {step === 10 && (
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
                    {step === 11 && (
                        <StepDescription
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}

                    {step === 12 && (
                        <StepGuidelines stepKey="step12" />
                    )}

                    {step === 13 && (
                        <StepCarousel
                            businessPhotos={formData.businessPhotos}
                            uploadingPhotos={uploadingPhotos}
                            photosProgress={photosProgress}
                            onUpload={handlePhotosUpload}
                            onRemove={removePhoto}
                        />
                    )}

                    {step === 14 && (
                        <StepTerms
                            hasAcceptedTerms={hasAcceptedTerms}
                            setHasAcceptedTerms={setHasAcceptedTerms}
                        />
                    )}

                    {step === 15 && (
                        <StepSummary
                            formData={formData}
                            onBack={() => {
                                setStep(14);
                                localStorage.setItem('vendor_setup_step', '14');
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
            {step < 15 && (
                <div className={`fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-white ${step === 1 ? 'px-[22px] pt-[14px] pb-[calc(17px+env(safe-area-inset-bottom))]' : 'px-6 pt-6 pb-[calc(24px+env(safe-area-inset-bottom))]'} flex items-center gap-4 border-t border-gray-50`}>
                    <button
                        onClick={handleBack}
                        className={`flex items-center justify-center border border-[#04222D] ${step === 1 ? 'bg-[#F8FAFA] rounded-[6px]' : 'bg-[#E6E9EA] rounded-lg'} active:scale-95 transition-all flex-shrink-0`}
                        style={{ width: step === 1 ? '50px' : '56px', height: step === 1 ? '50px' : '56px' }}
                    >
                        <ArrowLeft size={step === 1 ? 20 : 24} className="text-[#04222D]" />
                    </button>

                    <div className="flex-1 flex flex-col items-center gap-2">
                        <button
                            disabled={isContinueDisabled}
                            onClick={handleContinue}
                            className={`w-full ${step === 1 ? 'h-[50px] rounded-[6px] text-[15px]' : 'h-[56px] rounded-lg text-lg'} font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isContinueDisabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'text-white active:scale-[0.98]'
                                }`}
                            style={{
                                backgroundColor: isContinueDisabled ? '#E5E7EB' : CONTINUE_BUTTON_COLOR
                            }}
                        >
                            {loading ? 'Saving...' : (step === 3 && formData.email.trim() === '') ? 'Skip' : 'Continue'}
                        </button>
                        {step === 13 && isButtonDisabled() && !loading && (
                            <p className="text-[12px] font-medium text-rose-500 animate-pulse">
                                {!formData.coverImage ? 'Please add a cover image' : 'Please upload at least 3 carousel images'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
