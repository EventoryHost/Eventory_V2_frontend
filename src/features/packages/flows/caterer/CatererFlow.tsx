'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import { MenuData, GuestTier, PolicyFile, SampleMediaFile } from '../../shared/types';
import CatererStep1EventAndCrew from './Step1EventAndCrew';
import CatererStep2ProductsAndPricing from './Step2ProductsAndPricing';
import CatererStep3PoliciesAndCharges from './Step3PoliciesAndCharges';
import CatererStep4SampleAndMedia from './Step4SampleAndMedia';
import { AddonModal, Addon } from '../../components/AddonModal';

const FLOW_CONFIG = { vendorName: 'Caterer', steps: ['Event and Crew', 'Products and Pricing', 'Policies and Charges', 'Sample and Media'] };
const VENUE_NEEDS_OPTIONS = ['Power', 'Camera', 'Stage', 'Lighting', 'Security'];

export default function CatererFlow() {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // Step 1
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [minDuration, setMinDuration] = React.useState('');
    const [maxDuration, setMaxDuration] = React.useState('');
    const [minCrewSize, setMinCrewSize] = React.useState('');
    const [maxCrewSize, setMaxCrewSize] = React.useState('');
    const [minCapacity, setMinCapacity] = React.useState('');
    const [maxCapacity, setMaxCapacity] = React.useState('');
    const [tastingSession, setTastingSession] = React.useState('Yes');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');
    const toggleVenueNeed = (need: string) => setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);


    // Step 2
    const [menus, setMenus] = React.useState<MenuData[]>([]);
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);
    const toggleMenuExpand = (id: string) => setMenus(prev => prev.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
    const deleteMenu = (id: string) => { setMenus(prev => prev.filter(m => m.id !== id)); setActiveMenuDropdown(null); };
    const handleAddMenu = () => {
        const newId = Math.random().toString(36).substring(7);
        setMenus(prev => [...prev, { id: newId, name: `Menu ${prev.length + 1}`, type: 'Breakfast', serviceStyles: ['Buffet'], inventory: { Starters: [], 'Main Course': [], Dessert: [], Drinks: [] }, priceModel: '', billingUnit: 'Per Plate', isExpanded: true }]);
    };

    // Step 2 crockery & addOns states
    const [crockeryIncluded, setCrockeryIncluded] = React.useState(true);
    const [crockeryDisposable, setCrockeryDisposable] = React.useState(false);
    const [crockeryBoneChina, setCrockeryBoneChina] = React.useState(false);
    const [crockeryType, setCrockeryType] = React.useState('');
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [isAddonModalOpen, setIsAddonModalOpen] = React.useState(false);

    // Step 3
    const [teamEquipmentPrice, setTeamEquipmentPrice] = React.useState('');
    const [teamEquipmentUnit, setTeamEquipmentUnit] = React.useState('Per hour');
    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    const [guestTiers, setGuestTiers] = React.useState<GuestTier[]>([{ range: 'Upto 50', price: '2000' }, { range: 'Upto 100', price: '4000' }, { range: 'Upto 200', price: '8000' }]);
    const addGuestTierOption = () => setGuestTiers(prev => [...prev, { range: 'Upto X', price: '' }]);
    const updateGuestTier = (i: number, f: 'range' | 'price', v: string) => setGuestTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [f]: v } : t));
    const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = React.useState(false);
    const [weekendPricing, setWeekendPricing] = React.useState(true);
    const [weekendIncreaseType, setWeekendIncreaseType] = React.useState('Fixed Price');
    const [weekendValue, setWeekendValue] = React.useState('');
    const [weekendDays, setWeekendDays] = React.useState<string[]>(['Saturday', 'Sunday']);
    const [weekendSeason, setWeekendSeason] = React.useState(true);
    const [seasonIncreaseType, setSeasonIncreaseType] = React.useState('Fixed Price');
    const [seasonValue, setSeasonValue] = React.useState('');
    const [festivalPricing, setFestivalPricing] = React.useState(true);
    const [festivalIncreaseType, setFestivalIncreaseType] = React.useState('Fixed Price');
    const [festivalValue, setFestivalValue] = React.useState('');
    const [selectedFestivals, setSelectedFestivals] = React.useState<string[]>(['Diwali', 'New Year']);
    const [availableFestivals, setAvailableFestivals] = React.useState<string[]>(['Diwali', 'New Year']);
    const [isAddingFestival, setIsAddingFestival] = React.useState(false);
    const [newFestivalName, setNewFestivalName] = React.useState('');
    const handleAddFestival = () => {
        if (newFestivalName.trim() && !availableFestivals.includes(newFestivalName.trim())) setAvailableFestivals(prev => [...prev, newFestivalName.trim()]);
        if (newFestivalName.trim() && !selectedFestivals.includes(newFestivalName.trim())) setSelectedFestivals(prev => [...prev, newFestivalName.trim()]);
        setNewFestivalName(''); setIsAddingFestival(false);
    };
    const [lastMinuteBooking, setLastMinuteBooking] = React.useState(true);
    const [lastMinuteDays, setLastMinuteDays] = React.useState('');
    const [lastMinuteIncreaseType, setLastMinuteIncreaseType] = React.useState('Fixed Price');
    const [lastMinuteValue, setLastMinuteValue] = React.useState('');
    
    const [lastMinuteFiles, setLastMinuteFiles] = React.useState<PolicyFile[]>([]);
    const onLastMinuteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("onLastMinuteUpload triggered, files selected:", e.target.files ? Array.from(e.target.files).map(f => f.name) : []);
        if (e.target.files) setLastMinuteFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size, file: f }))]);
        if (lastMinuteInputRef.current) lastMinuteInputRef.current.value = '';
    };
    const removeLastMinuteFile = (idx: number) => setLastMinuteFiles(prev => prev.filter((_, i) => i !== idx));

    const [customDatesPricing, setCustomDatesPricing] = React.useState(false);
    const [customDatesIncreaseType, setCustomDatesIncreaseType] = React.useState('Fixed Price');
    const [customDatesValue, setCustomDatesValue] = React.useState('');
    const [customDatesStartDate, setCustomDatesStartDate] = React.useState('');
    const [customDatesEndDate, setCustomDatesEndDate] = React.useState('');
    const [festivalPrices, setFestivalPrices] = React.useState<Record<string, { increaseType: string; value: string }>>({});

    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const policyInputRef = React.useRef<HTMLInputElement>(null);
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("onPolicyUpload triggered, files selected:", e.target.files ? Array.from(e.target.files).map(f => f.name) : []);
        if (e.target.files) setPolicyFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size, file: f }))]);
        if (policyInputRef.current) policyInputRef.current.value = '';
    };

    // Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    // Step 4 — file list in parent; upload UI matches AddonModal (step 2 add-on) with local ref inside Step4.
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);

    const mediaTypeFromSample = React.useCallback((smf: SampleMediaFile): 'image' | 'video' => {
        if (smf.mediaType) return smf.mediaType;
        if (smf.file?.type?.startsWith('video')) return 'video';
        const u = smf.preview.toLowerCase();
        if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u)) return 'video';
        return 'image';
    }, []);

    // Save current step to localStorage to preserve state on reload
    React.useEffect(() => {
        if (packageId) {
            localStorage.setItem(`caterer_active_step_${packageId}`, String(step));
        }
    }, [step, packageId]);

    const isInitializing = React.useRef(false);

    // Auto-save Step 3 inputs to localStorage in real-time to survive page reloads
    React.useEffect(() => {
        if (step === 3 && packageId) {
            const step3Draft = {
                teamEquipmentPrice,
                teamEquipmentUnit,
                guestTiers,
                weekendPricing,
                weekendIncreaseType,
                weekendValue,
                weekendDays,
                weekendSeason,
                seasonIncreaseType,
                seasonValue,
                festivalPricing,
                festivalIncreaseType,
                festivalValue,
                selectedFestivals,
                customDatesPricing,
                customDatesIncreaseType,
                customDatesValue,
                customDatesStartDate,
                customDatesEndDate,
                festivalPrices,
                lastMinuteBooking,
                lastMinuteDays,
                lastMinuteIncreaseType,
                lastMinuteValue
            };
            localStorage.setItem(`caterer_step3_draft_${packageId}`, JSON.stringify(step3Draft));
        }
    }, [
        step, packageId, teamEquipmentPrice, teamEquipmentUnit, guestTiers,
        weekendPricing, weekendIncreaseType, weekendValue, weekendDays,
        weekendSeason, seasonIncreaseType, seasonValue,
        festivalPricing, festivalIncreaseType, festivalValue, selectedFestivals,
        customDatesPricing, customDatesIncreaseType, customDatesValue,
        customDatesStartDate, customDatesEndDate, festivalPrices,
        lastMinuteBooking, lastMinuteDays, lastMinuteIncreaseType, lastMinuteValue
    ]);

    // Auto-initialize or restore draft package on mount
    React.useEffect(() => {
        if (isInitializing.current) return;
        isInitializing.current = true;

        const initOrRestorePackage = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) {
                console.error("No vendor_id found in localStorage");
                return;
            }
            try {
                // 1. Check if vendor already has a draft package in the database
                const draftRes = await fetch(`http://localhost:4000/api/packages/vendor/${vendorId}?status=Draft`);
                const draftData = await draftRes.json();
                
                if (draftData.status === 'SUCCESS' && draftData.packages && draftData.packages.length > 0) {
                    // Load the first active draft package
                    const pkg = draftData.packages[0];
                    setPackageId(pkg._id);
                    sessionStorage.setItem('draft_package_id_Caterer', pkg._id);
                    
                    // Populate Step 1 (Event & Crew)
                    if (pkg.step1_eventAndCrew) {
                        const s1 = pkg.step1_eventAndCrew;
                        setPackageName(s1.packageName || '');
                        if (s1.eventCategories) setEventCategories(s1.eventCategories.join(', '));
                        if (s1.duration) {
                            setMinDuration(String(s1.duration.minHours || ''));
                            setMaxDuration(String(s1.duration.maxHours || ''));
                        }
                        if (s1.crewSize) {
                            setMinCrewSize(String(s1.crewSize.minPeople || ''));
                            setMaxCrewSize(String(s1.crewSize.maxPeople || ''));
                        }
                        if (s1.capacity) {
                            setMinCapacity(String(s1.capacity.minGuests || ''));
                            setMaxCapacity(String(s1.capacity.maxGuests || ''));
                        }
                        setTastingSession(s1.tastingSession ? 'Yes' : 'No');
                        
                        const needs: string[] = [];
                        if (s1.venueNeeds?.power) needs.push('Power');
                        if (s1.venueNeeds?.ac) needs.push('AC');
                        if (s1.venueNeeds?.stage) needs.push('Stage');
                        if (s1.venueNeeds?.lighting) needs.push('Lighting');
                        if (s1.venueNeeds?.security) needs.push('Security');
                        if (s1.venueNeeds?.customText) {
                            const customs = s1.venueNeeds.customText.split(',').map((s: string) => s.trim()).filter(Boolean);
                            needs.push(...customs);
                        }
                        setVenueNeeds(needs);
                    }
                    
                    // Populate Step 2 (Products & Pricing)
                    if (pkg.step2_productsAndPricing) {
                        const s2 = pkg.step2_productsAndPricing;
                        if (s2.crockery) {
                            setCrockeryIncluded(!!s2.crockery.included);
                            const cType = s2.crockery.type || '';
                            setCrockeryDisposable(cType.includes('Disposable'));
                            setCrockeryBoneChina(cType.includes('Bone china'));
                            const textParts = cType.split(',').map((s: string) => s.trim()).filter((s: string) => s !== 'Disposable' && s !== 'Bone china' && s !== '');
                            setCrockeryType(textParts.join(', '));
                        }
                        if (s2.menus) {
                            setMenus(s2.menus.map((m: any, idx: number) => ({
                                id: m._id || Math.random().toString(36).substring(7),
                                name: m.name || `Menu ${idx + 1}`,
                                type: m.type || 'Breakfast',
                                serviceStyles: [m.serviceStyle || 'Buffet'],
                                priceModel: m.priceModel || '',
                                billingUnit: m.billingUnit || 'Per Plate',
                                isExpanded: false,
                                inventory: {
                                    Starters: (m.items?.starters || []).map((x: any) => x.name),
                                    'Main Course': (m.items?.mainCourse || []).map((x: any) => x.name),
                                    Dessert: (m.items?.dessert || []).map((x: any) => x.name),
                                    Drinks: (m.items?.drinks || []).map((x: any) => x.name)
                                }
                            })));
                        }
                        if (s2.addOns) {
                            setAddons(s2.addOns.map((a: any) => ({
                                id: a._id || Math.random().toString(36).substring(7),
                                type: a.type === 'Food' || a.type === 'Drinks' ? 'Product' : 'Service',
                                name: a.name || '',
                                category: a.category || '',
                                subCategory: a.subCategory || '',
                                quantity: a.quantity || '',
                                description: a.description || '',
                                price: String(a.price || ''),
                                billingUnit: a.billingUnit || 'Per hour',
                                policies: [],
                                media: [],
                                productType: a.type || 'Food'
                            })));
                        }
                    }

                    // Populate Step 3 (Policies & Charges)
                    if (pkg.step3_policiesAndCharges) {
                        const s3 = pkg.step3_policiesAndCharges;
                        if (s3.teamAndEquipment) {
                            setTeamEquipmentPrice(String(s3.teamAndEquipment.price || ''));
                            setTeamEquipmentUnit(s3.teamAndEquipment.billingUnit || 'Per hour');
                        }
                        if (s3.guestTiers) {
                            setGuestTiers(s3.guestTiers.map((gt: any) => ({
                                range: `Upto ${gt.maxGuests}`,
                                price: String(gt.price || '')
                            })));
                        }
                        if (s3.policiesDocUrl) {
                            const urls = s3.policiesDocUrl.split(',').map((s: string) => s.trim()).filter(Boolean);
                            setPolicyFiles(urls.map((url: string) => ({
                                name: url.substring(url.lastIndexOf('/') + 1) || 'policy.pdf',
                                size: 1024 * 1024,
                                preview: url
                            })));
                        }
                        if (s3.lastMinuteChargesDocUrl) {
                            const urls = s3.lastMinuteChargesDocUrl.split(',').map((s: string) => s.trim()).filter(Boolean);
                            setLastMinuteFiles(urls.map((url: string) => ({
                                name: url.substring(url.lastIndexOf('/') + 1) || 'charges.pdf',
                                size: 1024 * 1024,
                                preview: url
                            })));
                        }
                        if (s3.dynamicPricing) {
                            const dp = s3.dynamicPricing;
                            setIsDynamicPricingEnabled(!!(dp.weekends?.enabled || dp.weddingSeason?.enabled || dp.festivals?.enabled || dp.customDates?.enabled));
                            const basePrice = s3.teamAndEquipment?.price || 0;
                            if (dp.weekends) {
                                setWeekendPricing(!!dp.weekends.enabled);
                                const isFixed = dp.weekends.price !== undefined && dp.weekends.price !== null && dp.weekends.price >= 0;
                                setWeekendIncreaseType((isFixed && dp.weekends.percentage === 0) ? 'Fixed Price' : 'Percentage');
                                setWeekendValue(String((isFixed && dp.weekends.percentage === 0) ? dp.weekends.price + basePrice : (dp.weekends.percentage || '')));
                            }
                            if (dp.weddingSeason) {
                                setWeekendSeason(!!dp.weddingSeason.enabled);
                                const isFixed = dp.weddingSeason.price !== undefined && dp.weddingSeason.price !== null && dp.weddingSeason.price >= 0;
                                setSeasonIncreaseType((isFixed && dp.weddingSeason.percentage === 0) ? 'Fixed Price' : 'Percentage');
                                setSeasonValue(String((isFixed && dp.weddingSeason.percentage === 0) ? dp.weddingSeason.price + basePrice : (dp.weddingSeason.percentage || '')));
                            }
                            if (dp.festivals) {
                                setFestivalPricing(!!dp.festivals.enabled);
                                if (dp.festivals.details) {
                                    const parsedDetails: Record<string, { increaseType: string; value: string }> = {};
                                    for (const [name, spec] of Object.entries(dp.festivals.details as any)) {
                                        const specTyped = spec as any;
                                        if (specTyped.increaseType === 'Fixed Price' || (specTyped.price !== undefined && specTyped.percentage === 0)) {
                                            parsedDetails[name] = { increaseType: 'Fixed Price', value: String((specTyped.price || 0) + basePrice) };
                                        } else {
                                            parsedDetails[name] = { increaseType: 'Percentage', value: String(specTyped.percentage || '') };
                                        }
                                    }
                                    setFestivalPrices(parsedDetails);
                                    setSelectedFestivals(Object.keys(dp.festivals.details));
                                }
                            }
                            if (dp.customDates) {
                                setCustomDatesPricing(!!dp.customDates.enabled);
                                const isFixed = dp.customDates.price !== undefined && dp.customDates.price !== null && dp.customDates.price >= 0;
                                setCustomDatesIncreaseType((isFixed && dp.customDates.percentage === 0) ? 'Fixed Price' : 'Percentage');
                                setCustomDatesValue(String((isFixed && dp.customDates.percentage === 0) ? dp.customDates.price + basePrice : (dp.customDates.percentage || '')));
                                setCustomDatesStartDate(dp.customDates.startDate || '');
                                setCustomDatesEndDate(dp.customDates.endDate || '');
                            }
                        }
                    }

                    // Populate Step 4 (Sample Media)
                    if (pkg.step4_sampleMedia && pkg.step4_sampleMedia.media) {
                        setSampleMediaFiles(pkg.step4_sampleMedia.media.map((m: any) => ({
                            name: m.fileName || m.name || 'file',
                            size: m.size || 0,
                            preview: m.url || '',
                            mediaType: m.type === 'video' ? 'video' : 'image',
                        })));
                    }

                    // Check if there is any local unsaved draft for Step 3 to recover
                    const localDraftStr = localStorage.getItem(`caterer_step3_draft_${pkg._id}`);
                    if (localDraftStr) {
                        try {
                            const ld = JSON.parse(localDraftStr);
                            if (ld.teamEquipmentPrice !== undefined) setTeamEquipmentPrice(ld.teamEquipmentPrice);
                            if (ld.teamEquipmentUnit !== undefined) setTeamEquipmentUnit(ld.teamEquipmentUnit);
                            if (ld.guestTiers !== undefined) setGuestTiers(ld.guestTiers);
                            if (ld.weekendPricing !== undefined) setWeekendPricing(ld.weekendPricing);
                            if (ld.weekendIncreaseType !== undefined) setWeekendIncreaseType(ld.weekendIncreaseType);
                            if (ld.weekendValue !== undefined) setWeekendValue(ld.weekendValue);
                            if (ld.weekendDays !== undefined) setWeekendDays(ld.weekendDays);
                            if (ld.weekendSeason !== undefined) setWeekendSeason(ld.weekendSeason);
                            if (ld.seasonIncreaseType !== undefined) setSeasonIncreaseType(ld.seasonIncreaseType);
                            if (ld.seasonValue !== undefined) setSeasonValue(ld.seasonValue);
                            if (ld.festivalPricing !== undefined) setFestivalPricing(ld.festivalPricing);
                            if (ld.festivalIncreaseType !== undefined) setFestivalIncreaseType(ld.festivalIncreaseType);
                            if (ld.festivalValue !== undefined) setFestivalValue(ld.festivalValue);
                            if (ld.selectedFestivals !== undefined) setSelectedFestivals(ld.selectedFestivals);
                            if (ld.customDatesPricing !== undefined) setCustomDatesPricing(ld.customDatesPricing);
                            if (ld.customDatesIncreaseType !== undefined) setCustomDatesIncreaseType(ld.customDatesIncreaseType);
                            if (ld.customDatesValue !== undefined) setCustomDatesValue(ld.customDatesValue);
                            if (ld.customDatesStartDate !== undefined) setCustomDatesStartDate(ld.customDatesStartDate);
                            if (ld.customDatesEndDate !== undefined) setCustomDatesEndDate(ld.customDatesEndDate);
                            if (ld.festivalPrices !== undefined) setFestivalPrices(ld.festivalPrices);
                            if (ld.lastMinuteBooking !== undefined) setLastMinuteBooking(ld.lastMinuteBooking);
                            if (ld.lastMinuteDays !== undefined) setLastMinuteDays(ld.lastMinuteDays);
                            if (ld.lastMinuteIncreaseType !== undefined) setLastMinuteIncreaseType(ld.lastMinuteIncreaseType);
                            if (ld.lastMinuteValue !== undefined) setLastMinuteValue(ld.lastMinuteValue);
                        } catch (e) {
                            console.error("Error restoring step 3 draft:", e);
                        }
                    }
                    
                    // Automatically route to next uncompleted step, prioritizing last viewed step
                    const savedStep = localStorage.getItem(`caterer_active_step_${pkg._id}`);
                    if (savedStep) {
                        setStep(parseInt(savedStep));
                    } else if (pkg.completedSteps && pkg.completedSteps.length > 0) {
                        const nextStep = Math.min(4, Math.max(...pkg.completedSteps) + 1);
                        setStep(nextStep);
                    }
                    return;
                }

                // 2. Fallback: Initialize a fresh draft if no draft package exists
                const res = await fetch('http://localhost:4000/api/packages/initialize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: 'Caterer',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    sessionStorage.setItem('draft_package_id_Caterer', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing package draft:", err);
            }
        };
        initOrRestorePackage();
    }, []);

    const handleBack = () => { if (step > 1) setStep(step - 1); else router.push('/dashboard/inventory'); };

    const handleNext = async () => {
        let currentPackageId = packageId;
        if (!currentPackageId) {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) {
                alert("Vendor ID not found in localStorage. Please log in first.");
                return;
            }
            setIsSaving(true);
            try {
                const initRes = await fetch('http://localhost:4000/api/packages/initialize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: 'Caterer',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    sessionStorage.setItem('draft_package_id_Caterer', initData.packageId);
                } else {
                    throw new Error(initData.message || "Could not initialize draft package on-the-fly.");
                }
            } catch (err: any) {
                alert("Failed to initialize draft package on-the-fly: " + err.message);
                setIsSaving(false);
                return;
            }
        }

        setIsSaving(true);
        try {
            if (step === 1) {
                const pocName = localStorage.getItem('vendor_poc') || 'Point of Contact';
                const payload = {
                    packageName: packageName || `${variants.selectedVariant} Catering Package`,
                    eventCategories: eventCategories ? eventCategories.split(',').map(s => s.trim()) : ['Catering'],
                    poc: pocName,
                    duration: {
                        minHours: parseInt(minDuration) || 0,
                        maxHours: parseInt(maxDuration) || 0
                    },
                    crewSize: {
                        minPeople: parseInt(minCrewSize) || 0,
                        maxPeople: parseInt(maxCrewSize) || 0,
                        roles: ["Caterer"]
                    },
                    capacity: {
                        minGuests: parseInt(minCapacity) || 0,
                        maxGuests: parseInt(maxCapacity) || 0
                    },
                    tastingSession: tastingSession === 'Yes',
                    venueNeeds: {
                        power: venueNeeds.includes('Power'),
                        ac: venueNeeds.includes('AC'),
                        stage: venueNeeds.includes('Stage'),
                        lighting: venueNeeds.includes('Lighting'),
                        security: venueNeeds.includes('Security'),
                        customText: [
                            ...venueNeeds.filter(n => !['Power', 'Camera', 'Stage', 'Lighting', 'Security', 'AC'].includes(n)),
                            ...(venueRequest.trim() ? [venueRequest.trim()] : [])
                        ].join(', ')
                    }
                };

                const res = await fetch(`http://localhost:4000/api/packages/${currentPackageId}/step/1`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 1 (Event & Crew).");
                setStep(2);
            } else if (step === 2) {
                if (menus.length === 0) {
                    alert("Please add at least one menu before proceeding.");
                    setIsSaving(false);
                    return;
                }

                // Gather crockery details
                const selectedCrockeryTypes = [
                    ...(crockeryDisposable ? ['Disposable'] : []),
                    ...(crockeryBoneChina ? ['Bone china'] : []),
                    ...(crockeryType.trim() ? [crockeryType.trim()] : [])
                ].join(', ');

                const payload = {
                    crockery: {
                        included: crockeryIncluded,
                        type: selectedCrockeryTypes || 'Standard'
                    },
                    menus: menus.map(m => ({
                        name: m.name,
                        type: m.type,
                        serviceStyle: m.serviceStyles[0] || 'Buffet',
                        priceModel: m.priceModel || 'Per Plate',
                        billingUnit: m.billingUnit || 'Per Person',
                        items: {
                            starters: (m.inventory.Starters || []).map(name => ({ name, price: 0 })),
                            mainCourse: (m.inventory['Main Course'] || []).map(name => ({ name, price: 0 })),
                            dessert: (m.inventory.Dessert || []).map(name => ({ name, price: 0 })),
                            drinks: (m.inventory.Drinks || []).map(name => ({ name, price: 0 }))
                        }
                    })),
                    addOns: addons.map(a => ({
                        name: a.name,
                        type: a.productType === 'Food' || a.productType === 'Drinks' ? a.productType : 'Other',
                        category: a.category,
                        subCategory: a.subCategory,
                        quantity: a.quantity,
                        description: a.description,
                        price: parseFloat(a.price) || 0,
                        billingUnit: a.billingUnit,
                        policyDocUrl: '',
                        mediaUrls: []
                    }))
                };

                const res = await fetch(`http://localhost:4000/api/packages/${packageId}/step/2`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 2 (Menus & Items).");
                setStep(3);
            } else if (step === 3) {
                // Upload policies to S3
                const policyUrls: string[] = [];
                for (const pf of policyFiles) {
                    if (pf.file) {
                        const formData = new FormData();
                        formData.append('file', pf.file);
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            if (uploadData.url) policyUrls.push(uploadData.url);
                        }
                    } else if (pf.preview) {
                        // Keep already uploaded URL
                        policyUrls.push(pf.preview);
                    }
                }

                // Upload last minute charges files to S3
                const lastMinuteUrls: string[] = [];
                for (const lmf of lastMinuteFiles) {
                    if (lmf.file) {
                        const formData = new FormData();
                        formData.append('file', lmf.file);
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            if (uploadData.url) lastMinuteUrls.push(uploadData.url);
                        }
                    } else if (lmf.preview) {
                        // Keep already uploaded URL
                        lastMinuteUrls.push(lmf.preview);
                    }
                }

                const payload = {
                    teamAndEquipment: {
                        price: parseFloat(teamEquipmentPrice) || 0,
                        billingUnit: teamEquipmentUnit
                    },
                    guestTiers: guestTiers.map(tier => ({
                        maxGuests: parseInt(tier.range.replace(/\D/g, '')) || 0,
                        price: parseFloat(tier.price) || 0
                    })),
                    dynamicPricing: {
                        weekends: {
                            enabled: weekendPricing,
                            price: weekendIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(weekendValue) || 0) - (parseFloat(teamEquipmentPrice) || 20000)) : 0,
                            percentage: weekendIncreaseType === 'Percentage' ? (parseFloat(weekendValue) || 0) : 0
                        },
                        weddingSeason: {
                            enabled: weekendSeason,
                            price: seasonIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(seasonValue) || 0) - (parseFloat(teamEquipmentPrice) || 20000)) : 0,
                            percentage: seasonIncreaseType === 'Percentage' ? (parseFloat(seasonValue) || 0) : 0
                        },
                        festivals: {
                            enabled: festivalPricing,
                            percentage: 0,
                            details: Object.fromEntries(
                                Object.entries(festivalPrices).map(([name, spec]) => [
                                    name,
                                    {
                                        increaseType: spec.increaseType,
                                        price: spec.increaseType === 'Fixed Price' ? Math.max(0, (parseFloat(spec.value) || 0) - (parseFloat(teamEquipmentPrice) || 20000)) : 0,
                                        percentage: spec.increaseType === 'Percentage' ? (parseFloat(spec.value) || 0) : 0
                                    }
                                ])
                            )
                        },
                        customDates: {
                            enabled: customDatesPricing,
                            price: customDatesIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(customDatesValue) || 0) - (parseFloat(teamEquipmentPrice) || 20000)) : 0,
                            percentage: customDatesIncreaseType === 'Percentage' ? (parseFloat(customDatesValue) || 0) : 0,
                            startDate: customDatesStartDate,
                            endDate: customDatesEndDate
                        }
                    },
                    policiesDocUrl: policyUrls.join(', '),
                    lastMinuteChargesDocUrl: lastMinuteUrls.join(', ')
                };

                const res = await fetch(`http://localhost:4000/api/packages/${packageId}/step/3`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 3 (Policies & Pricing).");
                localStorage.removeItem(`caterer_step3_draft_${packageId}`);
                setStep(4);
            } else if (step === 4) {
                // Any rows still holding a local File (e.g. old sessions) upload now; otherwise reuse S3 URLs from state.
                const mediaPayload: { url: string; type: 'image' | 'video'; fileName: string; size: number }[] = [];
                for (const smf of sampleMediaFiles) {
                    if (smf.file) {
                        const formData = new FormData();
                        formData.append('file', smf.file);
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            if (uploadData.url) {
                                mediaPayload.push({
                                    url: uploadData.url,
                                    type: smf.file.type.startsWith('video') ? 'video' : 'image',
                                    fileName: smf.name,
                                    size: smf.size
                                });
                            }
                        }
                    } else if (smf.preview) {
                        mediaPayload.push({
                            url: smf.preview,
                            type: mediaTypeFromSample(smf),
                            fileName: smf.name,
                            size: smf.size
                        });
                    }
                }

                const resStep4 = await fetch(`http://localhost:4000/api/packages/${packageId}/step/4`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ media: mediaPayload })
                });
                if (!resStep4.ok) throw new Error("Failed to save Step 4 (Media files).");

                // Submit package
                const resSubmit = await fetch(`http://localhost:4000/api/packages/${packageId}/submit`, {
                    method: 'POST'
                });
                if (!resSubmit.ok) {
                    const errorData = await resSubmit.json();
                    throw new Error(errorData.errors ? errorData.errors.join(", ") : errorData.message || "Failed to submit package");
                }

                sessionStorage.removeItem('draft_package_id_Caterer');
                router.push('/dashboard/inventory');
            }
        } catch (err: any) {
            console.error("Step navigation error:", err);
            alert(err.message || "Something went wrong saving this step. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleMagicFill = () => {
        setPackageName('Premium Royal Feast');
        setEventCategories('Wedding, Corporate, Anniversary');
        setMinDuration('4');
        setMaxDuration('12');
        setMinCrewSize('8');
        setMaxCrewSize('25');
        setMinCapacity('50');
        setMaxCapacity('500');
        setTastingSession('Yes');
        setVenueNeeds(['Power', 'Stage', 'Security', 'AC']);
        setVenueRequest('Requires clean water connection and minimum 4x4m kitchen space.');

        // Step 2
        setMenus([
            {
                id: 'menu_mock_1',
                name: 'Imperial Wedding Buffet',
                type: 'Lunch',
                serviceStyles: ['Buffet'],
                priceModel: '',
                billingUnit: 'Per Plate',
                isExpanded: true,
                inventory: {
                    Starters: ['Paneer Tikka Shaslik', 'Hara Bhara Kebab', 'Crispy Corn Salt & Pepper'],
                    'Main Course': ['Dal Makhani Bukhara', 'Kadhai Paneer', 'Malai Kofta', 'Butter Naan', 'Jeera Pulao'],
                    Dessert: ['Hot Gulab Jamun', 'Kesari Rasmalai', 'Shahi Tukda'],
                    Drinks: ['Fresh Lime Mint Cooler', 'Masala Butter Milk', 'Mocktails']
                }
            }
        ]);
        setCrockeryIncluded(true);
        setCrockeryDisposable(false);
        setCrockeryBoneChina(true);
        setCrockeryType('Premium Bone China & Gold Rimmed Glassware');
        setAddons([
            {
                id: 'addon_mock_1',
                type: 'Product',
                name: 'Live Italian Pasta Station',
                category: 'Live Counter',
                subCategory: 'Italian',
                quantity: '1',
                description: 'Live pasta counter with chef, serving penne and fusilli with red/white sauce.',
                price: '7500',
                billingUnit: 'Per event',
                policies: [],
                media: [],
                productType: 'Food'
            }
        ]);

        // Step 3
        setTeamEquipmentPrice('2500');
        setTeamEquipmentUnit('Per hour');
        setGuestTiers([
            { range: 'Upto 50', price: '1800' },
            { range: 'Upto 100', price: '1600' },
            { range: 'Upto 200', price: '1400' },
            { range: 'Upto 500', price: '1200' }
        ]);
        setIsDynamicPricingEnabled(true);
        setWeekendPricing(true);
        setWeekendIncreaseType('Percentage');
        setWeekendValue('15');
        setWeekendDays(['Saturday', 'Sunday']);
        setWeekendSeason(true);
        setSeasonIncreaseType('Fixed Price');
        setSeasonValue('2200');
        setFestivalPricing(true);
        setFestivalIncreaseType('Percentage');
        setFestivalValue('20');
        setSelectedFestivals(['Diwali', 'New Year']);
        setLastMinuteBooking(true);
        setLastMinuteDays('4');
        setLastMinuteIncreaseType('Percentage');
        setLastMinuteValue('12');
        setCustomDatesPricing(true);
        setCustomDatesIncreaseType('Fixed Price');
        setCustomDatesValue('2600');
        setCustomDatesStartDate('2026-11-20');
        setCustomDatesEndDate('2026-11-25');
        setFestivalPrices({
            'Diwali': { increaseType: 'Percentage', value: '25' },
            'New Year': { increaseType: 'Fixed Price', value: '2400' }
        });
    };

    return (<>
        <button
            type="button"
            onClick={handleMagicFill}
            style={{
                position: 'fixed',
                top: '0px',
                right: '0px',
                width: '16px',
                height: '16px',
                zIndex: 999999,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                outline: 'none',
            }}
            title="🪄 Test Magic Fill"
        />

        <FlowShell
            config={FLOW_CONFIG} step={step} onBack={handleBack} onNext={handleNext} isSaving={isSaving}
            variants={variants.variants} selectedVariant={variants.selectedVariant} onSelectVariant={variants.setSelectedVariant}
            isAddingVariant={variants.isAddingVariant} newVariantName={variants.newVariantName}
            onSetNewVariantName={variants.setNewVariantName} onAddVariant={variants.handleAddVariant}
            onStartAddingVariant={() => variants.setIsAddingVariant(true)}
            isVariantModalOpen={variants.isVariantModalOpen} variantToManage={variants.variantToManage}
            variantAction={variants.variantAction} renameVariantValue={variants.renameVariantValue}
            onSetRenameVariantValue={variants.setRenameVariantValue}
            onOpenVariantModal={(v) => { variants.setVariantToManage(v); variants.setIsVariantModalOpen(true); }}
            onCloseVariantModal={() => variants.setIsVariantModalOpen(false)}
            onSetVariantAction={variants.setVariantAction}
            onDuplicateVariant={variants.handleDuplicateVariant} onRenameVariant={variants.handleRenameVariant} onDeleteVariant={variants.handleDeleteVariant}
        >
            {step === 1 && <CatererStep1EventAndCrew
                packageName={packageName} setPackageName={setPackageName}
                eventCategories={eventCategories} setEventCategories={setEventCategories}
                minDuration={minDuration} setMinDuration={setMinDuration}
                maxDuration={maxDuration} setMaxDuration={setMaxDuration}
                minCrewSize={minCrewSize} setMinCrewSize={setMinCrewSize}
                maxCrewSize={maxCrewSize} setMaxCrewSize={setMaxCrewSize}
                minCapacity={minCapacity} setMinCapacity={setMinCapacity}
                maxCapacity={maxCapacity} setMaxCapacity={setMaxCapacity}
                tastingSession={tastingSession} setTastingSession={setTastingSession}
                venueNeeds={venueNeeds} toggleVenueNeed={toggleVenueNeed}
                venueRequest={venueRequest} setVenueRequest={setVenueRequest}
                venueNeedsOptions={VENUE_NEEDS_OPTIONS}
            />}
            {step === 2 && <CatererStep2ProductsAndPricing
                menus={menus} setMenus={setMenus} toggleMenuExpand={toggleMenuExpand} deleteMenu={deleteMenu} handleAddMenu={handleAddMenu}
                activeMenuDropdown={activeMenuDropdown} setActiveMenuDropdown={setActiveMenuDropdown}
                crockeryIncluded={crockeryIncluded} setCrockeryIncluded={setCrockeryIncluded}
                crockeryDisposable={crockeryDisposable} setCrockeryDisposable={setCrockeryDisposable}
                crockeryBoneChina={crockeryBoneChina} setCrockeryBoneChina={setCrockeryBoneChina}
                crockeryType={crockeryType} setCrockeryType={setCrockeryType}
                addons={addons} setAddons={setAddons} setIsAddonModalOpen={setIsAddonModalOpen}
            />}
            {step === 3 && <CatererStep3PoliciesAndCharges
                teamEquipmentPrice={teamEquipmentPrice} setTeamEquipmentPrice={setTeamEquipmentPrice}
                teamEquipmentUnit={teamEquipmentUnit} setTeamEquipmentUnit={setTeamEquipmentUnit}
                guestTiers={guestTiers} addGuestTierOption={addGuestTierOption} updateGuestTier={updateGuestTier}
                isDynamicPricingEnabled={isDynamicPricingEnabled} setIsDynamicPricingEnabled={setIsDynamicPricingEnabled}
                weekendPricing={weekendPricing} setWeekendPricing={setWeekendPricing}
                weekendIncreaseType={weekendIncreaseType} setWeekendIncreaseType={setWeekendIncreaseType}
                weekendValue={weekendValue} setWeekendValue={setWeekendValue}
                weekendDays={weekendDays} setWeekendDays={setWeekendDays}
                weekendSeason={weekendSeason} setWeekendSeason={setWeekendSeason}
                seasonIncreaseType={seasonIncreaseType} setSeasonIncreaseType={setSeasonIncreaseType}
                seasonValue={seasonValue} setSeasonValue={setSeasonValue}
                festivalPricing={festivalPricing} setFestivalPricing={setFestivalPricing}
                festivalIncreaseType={festivalIncreaseType} setFestivalIncreaseType={setFestivalIncreaseType}
                festivalValue={festivalValue} setFestivalValue={setFestivalValue}
                selectedFestivals={selectedFestivals} setSelectedFestivals={setSelectedFestivals}
                availableFestivals={availableFestivals}
                isAddingFestival={isAddingFestival} setIsAddingFestival={setIsAddingFestival}
                newFestivalName={newFestivalName} setNewFestivalName={setNewFestivalName}
                handleAddFestival={handleAddFestival}
                lastMinuteBooking={lastMinuteBooking} setLastMinuteBooking={setLastMinuteBooking}
                lastMinuteDays={lastMinuteDays} setLastMinuteDays={setLastMinuteDays}
                lastMinuteIncreaseType={lastMinuteIncreaseType} setLastMinuteIncreaseType={setLastMinuteIncreaseType}
                lastMinuteValue={lastMinuteValue} setLastMinuteValue={setLastMinuteValue}
                policyFiles={policyFiles} policyInputRef={policyInputRef} onPolicyUpload={onPolicyUpload}
                removePolicyFile={(i) => setPolicyFiles(prev => prev.filter((_, idx) => idx !== i))}
                lastMinuteInputRef={lastMinuteInputRef}
                lastMinuteFiles={lastMinuteFiles}
                onLastMinuteUpload={onLastMinuteUpload}
                removeLastMinuteFile={removeLastMinuteFile}
                customDatesPricing={customDatesPricing}
                setCustomDatesPricing={setCustomDatesPricing}
                customDatesIncreaseType={customDatesIncreaseType}
                setCustomDatesIncreaseType={setCustomDatesIncreaseType}
                customDatesValue={customDatesValue}
                setCustomDatesValue={setCustomDatesValue}
                customDatesStartDate={customDatesStartDate}
                setCustomDatesStartDate={setCustomDatesStartDate}
                customDatesEndDate={customDatesEndDate}
                setCustomDatesEndDate={setCustomDatesEndDate}
                festivalPrices={festivalPrices}
                setFestivalPrices={setFestivalPrices}
            />}
            {step === 4 && (
                <CatererStep4SampleAndMedia
                    sampleMediaFiles={sampleMediaFiles}
                    setSampleMediaFiles={setSampleMediaFiles}
                />
            )}
        </FlowShell>

        <AddonModal
            isOpen={isAddonModalOpen}
            onClose={() => setIsAddonModalOpen(false)}
            onSave={(newAddon) => {
                setAddons(prev => [...prev, newAddon]);
                setIsAddonModalOpen(false);
            }}
            vendorType="Caterer"
        />
        </>
    );
}
