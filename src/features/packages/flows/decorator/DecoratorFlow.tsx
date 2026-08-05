'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import DecoratorStep1EventAndCrew from './Step1EventAndCrew';
import DecoratorStep2SetupsAndPricing, { Setup } from './Step2SetupsAndPricing';
import DecoratorStep3PoliciesAndCharges from './Step3PoliciesAndCharges';
import DecoratorStep4SampleAndMedia from './Step4SampleAndMedia';
import { AddonModal, Addon } from '../../components/AddonModal';
import { DecoratorAddonModal } from './DecoratorAddonModal';
import { useFlowVariants } from '../../shared/useFlowVariants';
import { PolicyFile, SampleMediaFile, GuestTier } from '../../shared/types';
import { VariantManager } from '../../components/VariantManager';

const STEPS = ['Package basics', 'Setups and Pricing', 'Policies and Charges', 'Sample and Media'];
const VENUE_NEEDS_OPTIONS = [
    'Setup area',
    'Ceiling height & hanging/rigging points',
    'Power for lighting installations',
    'Mandap base area',
    'Entrance & pathway access',
    'Backdrop fixing permission',
    'Advance setup access (day before)',
    'Debris clearance access',
    'Lawn access',
    'Ladder / scaffolding clearance'
];

export default function DecoratorFlow({ onExitFlow }: { onExitFlow?: () => void }) {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // Step 1 States
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [poc, setPoc] = React.useState('');
    const [eventMinDuration, setEventMinDuration] = React.useState('');
    const [eventMaxDuration, setEventMaxDuration] = React.useState('');
    const [setupDuration, setSetupDuration] = React.useState('');
    const [supervisors, setSupervisors] = React.useState('');
    const [workers, setWorkers] = React.useState('');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>([]);
    const [venueRequest, setVenueRequest] = React.useState('');

    const [manualTotalPackagePrice, setManualTotalPackagePrice] = React.useState<number | null>(null);

    // Step 2 States
    const [setups, setSetups] = React.useState<Setup[]>([]);
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [notProvidedDetails, setNotProvidedDetails] = React.useState('');
    const [providedDetails, setProvidedDetails] = React.useState('');
    
    // Addon Modal States
    const [isAddonModalOpen, setIsAddonModalOpen] = React.useState(false);
    const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);

    // Step 3 States
    const [teamEquipmentPrice, setTeamEquipmentPrice] = React.useState('');
    const [teamEquipmentUnit, setTeamEquipmentUnit] = React.useState('Per hour');
    const [gstInclusive, setGstInclusive] = React.useState(false);
    const [gstRatePercent, setGstRatePercent] = React.useState('');
    const [lastMinuteFiles, setLastMinuteFiles] = React.useState<PolicyFile[]>([]);
    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const [lastMinuteChargesDescription, setLastMinuteChargesDescription] = React.useState('');

    // Dynamic Pricing & Policy Docs
    const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = React.useState(false);
    const [weekendPricing, setWeekendPricing] = React.useState(false);
    const [weekendIncreaseType, setWeekendIncreaseType] = React.useState('Percentage');
    const [weekendValue, setWeekendValue] = React.useState('10');
    const [weekendSeason, setWeekendSeason] = React.useState(false);
    const [seasonIncreaseType, setSeasonIncreaseType] = React.useState('Percentage');
    const [seasonValue, setSeasonValue] = React.useState('20');
    const [festivalPricing, setFestivalPricing] = React.useState(false);
    const [selectedFestivals, setSelectedFestivals] = React.useState<string[]>([]);
    const [availableFestivals, setAvailableFestivals] = React.useState<string[]>(['Diwali', 'Holi', 'New Year']);
    const [isAddingFestival, setIsAddingFestival] = React.useState(false);
    const [newFestivalName, setNewFestivalName] = React.useState('');
    const [festivalPrices, setFestivalPrices] = React.useState<Record<string, { increaseType: string; value: string }>>({});
    
    const handleAddFestival = () => {
        if (newFestivalName.trim() && !availableFestivals.includes(newFestivalName.trim())) {
            setAvailableFestivals(prev => [...prev, newFestivalName.trim()]);
            setSelectedFestivals(prev => [...prev, newFestivalName.trim()]);
            setNewFestivalName('');
            setIsAddingFestival(false);
        }
    };

    const [customDatesPricing, setCustomDatesPricing] = React.useState(false);
    const [customDatesIncreaseType, setCustomDatesIncreaseType] = React.useState('Percentage');
    const [customDatesValue, setCustomDatesValue] = React.useState('10');
    const [customDatesStartDate, setCustomDatesStartDate] = React.useState('');
    const [customDatesEndDate, setCustomDatesEndDate] = React.useState('');

    // Guest Count Pricing state
    const [guestTiers, setGuestTiers] = React.useState<GuestTier[]>([{ range: 'Upto 50', price: '4000' }, { range: 'Upto 100', price: '4000' }, { range: 'Upto 200', price: '4000' }]);

    const addGuestTierOption = () => setGuestTiers(prev => [...prev, { range: 'Upto X', price: '' }]);
    const updateGuestTier = (i: number, f: 'range' | 'price', v: string) => setGuestTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [f]: v } : t));
    const removeGuestTier = (i: number) => setGuestTiers(prev => prev.filter((_, idx) => idx !== i));

    const [cancellationDocs, setCancellationDocs] = React.useState<PolicyFile[]>([]);
    const [lastMinuteDocs, setLastMinuteDocs] = React.useState<PolicyFile[]>([]);
    const [policyDocs, setPolicyDocs] = React.useState<PolicyFile[]>([]);

    // Step 4 States
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);

    // File Input Refs
    const lastMinuteInputRef = React.useRef<HTMLInputElement | null>(null);
    const policyInputRef = React.useRef<HTMLInputElement | null>(null);
    const sampleMediaInputRef = React.useRef<HTMLInputElement | null>(null);

    // Database Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const [packageGroupId, setPackageGroupId] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const isInitializing = React.useRef(false);

    // Validation
    const canSave = step === 1 
        ? packageName.trim().length > 0 
        : step === 2
        ? setups.length > 0
        : true; // Steps 3 and 4 are always savable to drafts

    // Venue needs toggle
    const toggleVenueNeed = (need: string) => {
        setVenueNeeds((prev) => (
            prev.includes(need) ? prev.filter((item) => item !== need) : [...prev, need]
        ));
    };

    // ── Upload Event Handlers ──
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size,
                file,
                preview: URL.createObjectURL(file)
            }));
            setPolicyFiles(prev => [...prev, ...files]);
        }
    };

    const removePolicyFile = (idx: number) => {
        setPolicyFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const onLastMinuteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size,
                file,
                preview: URL.createObjectURL(file)
            }));
            setLastMinuteFiles(prev => [...prev, ...files]);
        }
    };

    const removeLastMinuteFile = (idx: number) => {
        setLastMinuteFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const onSampleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size,
                file,
                preview: URL.createObjectURL(file)
            }));
            setSampleMediaFiles(prev => [...prev, ...files]);
        }
    };

    const removeSampleMediaFile = (idx: number) => {
        setSampleMediaFiles(prev => prev.filter((_, i) => i !== idx));
    };

    // Auto-restore or initialize draft package on mount
    React.useEffect(() => {
        if (isInitializing.current) return;
        isInitializing.current = true;

        const initOrRestoreDecoratorPackage = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) {
                console.error("No vendor_id found in localStorage");
                return;
            }
            try {
                // 1. Check if vendor already has a draft package in the database
                const draftRes = await fetch(apiUrl(`/packages/vendor/${vendorId}?status=Draft`));
                const draftData = await draftRes.json();
                
                if (draftData.status === 'SUCCESS' && draftData.packages && draftData.packages.length > 0 && localStorage.getItem('selected_package_id') !== 'new') {
                    // Filter to load Decorator type packages (discriminator)
                    const decoratorDrafts = draftData.packages.filter((p: any) => p.vendorType === 'Decorator');
                    
                    if (decoratorDrafts.length > 0) {
                        const requestedPackageId = localStorage.getItem('selected_package_id');
                        const pkg = decoratorDrafts.find((item: any) => item._id === requestedPackageId) || decoratorDrafts[0];
                        setPackageId(pkg._id);
                        setPackageGroupId(pkg.packageGroupId);
                        sessionStorage.setItem('draft_package_id_Decorator', pkg._id);
                        
                        // Populate Step 1 (Event & Crew)
                        if (pkg.step1_eventAndCrew) {
                            const s1 = pkg.step1_eventAndCrew;
                            setPackageName(s1.packageName === 'Untitled Package' ? '' : s1.packageName || '');
                            if (s1.eventCategories) setEventCategories(s1.eventCategories.join(', '));
                            setPoc(s1.poc || '');
                            if (s1.duration) {
                                setEventMinDuration(s1.duration.minHours ? String(s1.duration.minHours) : '');
                                setEventMaxDuration(s1.duration.maxHours ? String(s1.duration.maxHours) : '');
                            }
                            if (s1.durationOfSetup) {
                                setSetupDuration(`Upto ${s1.durationOfSetup} hour${s1.durationOfSetup > 1 ? 's' : ''}`);
                            }
                            if (s1.crewSize) {
                                // Mongoose schemas map supervisors & workers to minPeople & maxPeople. Check both for full backwards compatibility
                                setSupervisors(String(s1.crewSize.minPeople !== undefined ? s1.crewSize.minPeople : (s1.crewSize.supervisors || '')));
                                setWorkers(String(s1.crewSize.maxPeople !== undefined ? s1.crewSize.maxPeople : (s1.crewSize.workers || '')));
                            }
                            
                            const needs: string[] = [];
                            if (s1.venueNeeds?.power) needs.push('Power');
                            if (s1.venueNeeds?.stage) needs.push('Stage');
                            if (s1.venueNeeds?.lighting) needs.push('Lighting');
                            if (s1.venueNeeds?.security) needs.push('Security');
                            if (s1.venueNeeds?.customText) {
                                const customs = s1.venueNeeds.customText.split(',').map((s: string) => s.trim()).filter(Boolean);
                                needs.push(...customs.filter((c: string) => VENUE_NEEDS_OPTIONS.includes(c)));
                                const nonOptions = customs.filter((c: string) => !VENUE_NEEDS_OPTIONS.includes(c));
                                if (nonOptions.length > 0) {
                                    setVenueRequest(nonOptions.join(', '));
                                }
                            }
                            setVenueNeeds(needs);
                        }
                        
                        // Populate Step 2 (Setups & Pricing)
                        if (pkg.step2_setupsAndPricing) {
                            const s2 = pkg.step2_setupsAndPricing;
                            if (s2.totalPackagePrice && s2.totalPackagePrice > 0) {
                                setManualTotalPackagePrice(s2.totalPackagePrice);
                            }
                            if (s2.setups) {
                                setSetups(s2.setups.map((s: any) => ({
                                    id: s._id || Math.random().toString(36).substring(7),
                                    name: s.name || '',
                                    setupPhoto: s.setupPhoto || '',
                                    referenceStyle: s.referenceStyle || '',
                                    description: s.description || '',
                                    price: String(s.price || ''),
                                    decoratingWhat: s.decoratingWhat || '',
                                    structuresIncluded: s.structuresIncluded || [],
                                    themes: s.themes || [],
                                    items: s.items || [],
                                    partOfSetup: s.partOfSetup || '',
                                    notPartOfSetup: s.notPartOfSetup || '',
                                })));
                            }
                            if (s2.addOns) {
                                setAddons(s2.addOns.map((a: any) => ({
                                    id: a._id || Math.random().toString(36).substring(7),
                                    type: a.addOnType || 'Service',
                                    name: a.name || '',
                                    category: a.category || '',
                                    subCategory: a.subCategory || '',
                                    quantity: String(a.quantity || ''),
                                    description: a.description || '',
                                    price: String(a.price || ''),
                                    billingUnit: a.billingUnit || 'Per hour',
                                    policies: a.policyDocUrl ? a.policyDocUrl.split(',').map((u: string, i: number) => ({ name: `Policy Document ${i + 1}`, size: 0, preview: u })) : [],
                                    media: (a.mediaUrls || []).map((url: string, i: number) => ({ name: `Media ${i+1}`, size: 0, preview: url })),
                                    // Read from physicalSpec where the schema stores them
                                    colors: a.physicalSpec?.color ? a.physicalSpec.color.split(' & ') : undefined,
                                    dimensions: a.physicalSpec?.dimensions
                                        ? `${a.physicalSpec.dimensions.length || 0} x ${a.physicalSpec.dimensions.breadth || 0} x ${a.physicalSpec.dimensions.height || 0} ${a.physicalSpec.dimensions.unit || 'CM'}`
                                        : undefined,
                                })));
                            }
                            if (s2.included && s2.included.length > 0) {
                                setProvidedDetails(s2.included.map((x: string) => `• ${x}`).join('\n'));
                            }
                            if (s2.notIncluded && s2.notIncluded.length > 0) {
                                setNotProvidedDetails(s2.notIncluded.map((x: string) => `• ${x}`).join('\n'));
                            }
                        }

                        // Populate Step 3 (Policies & Charges)
                        if (pkg.step3_policiesAndCharges) {
                            const s3 = pkg.step3_policiesAndCharges;
                            if (s3.teamAndEquipment) {
                                setTeamEquipmentPrice(String(s3.teamAndEquipment.price || ''));
                                setTeamEquipmentUnit(s3.teamAndEquipment.billingUnit || 'Per hour');
                    if (s3.gstInclusive !== undefined) setGstInclusive(s3.gstInclusive);
                    if (s3.gstRatePercent !== undefined) setGstRatePercent(String(s3.gstRatePercent));
                            }
                            if (s3.dynamicPricing) {
                                const dp = s3.dynamicPricing;
                                setIsDynamicPricingEnabled(!!dp.weekends?.enabled || !!dp.weddingSeason?.enabled || !!dp.festivals?.enabled || !!dp.customDates?.enabled);
                                
                                if (dp.weekends?.enabled) {
                                    setWeekendPricing(true);
                                    if (dp.weekends.percentage !== undefined) {
                                        setWeekendIncreaseType('Percentage');
                                        setWeekendValue(String(dp.weekends.percentage));
                                    } else if (dp.weekends.price !== undefined) {
                                        setWeekendIncreaseType('Fixed Price');
                                        setWeekendValue(String(dp.weekends.price));
                                    }
                                }
                                
                                if (dp.weddingSeason?.enabled) {
                                    setWeekendSeason(true);
                                    if (dp.weddingSeason.percentage !== undefined) {
                                        setSeasonIncreaseType('Percentage');
                                        setSeasonValue(String(dp.weddingSeason.percentage));
                                    } else if (dp.weddingSeason.price !== undefined) {
                                        setSeasonIncreaseType('Fixed Price');
                                        setSeasonValue(String(dp.weddingSeason.price));
                                    }
                                }
                                
                                if (dp.festivals?.enabled && dp.festivals.details) {
                                    setFestivalPricing(true);
                                    const fKeys = Object.keys(dp.festivals.details);
                                    setSelectedFestivals(fKeys);
                                    setAvailableFestivals(prev => Array.from(new Set([...prev, ...fKeys])));
                                    const fpMap: Record<string, { increaseType: string; value: string }> = {};
                                    for (const f of fKeys) {
                                        const spec = dp.festivals.details[f];
                                        if (spec.percentage !== undefined) fpMap[f] = { increaseType: 'Percentage', value: String(spec.percentage) };
                                        else if (spec.price !== undefined) fpMap[f] = { increaseType: 'Fixed Price', value: String(spec.price) };
                                    }
                                    setFestivalPrices(fpMap);
                                }
                                
                                if (dp.customDates?.enabled) {
                                    setCustomDatesPricing(true);
                                    if (dp.customDates.percentage !== undefined) {
                                        setCustomDatesIncreaseType('Percentage');
                                        setCustomDatesValue(String(dp.customDates.percentage));
                                    } else if (dp.customDates.price !== undefined) {
                                        setCustomDatesIncreaseType('Fixed Price');
                                        setCustomDatesValue(String(dp.customDates.price));
                                    }
                                    if (dp.customDates.startDate !== undefined) setCustomDatesStartDate(dp.customDates.startDate);
                                    if (dp.customDates.endDate !== undefined) setCustomDatesEndDate(dp.customDates.endDate);
                                }
                            }
                            if (s3.guestTiers && s3.guestTiers.length > 0) {
                                setGuestTiers(s3.guestTiers.map((gt: any) => ({
                                    range: `Upto ${gt.maxGuests}`,
                                    price: String(gt.price || '')
                                })));
                            }
                            if (s3.cancellationDocUrl) {
                                const urls = s3.cancellationDocUrl.split(',').map((u: string) => u.trim()).filter(Boolean);
                                setCancellationDocs(urls.map((url: string) => ({
                                    name: url.startsWith('http') ? (url.split('/').pop() || 'CancellationPolicy.pdf') : url,
                                    size: 0,
                                    preview: url.startsWith('http') ? url : undefined
                                })));
                            }
                            if (s3.lastMinuteChargesDocUrl) {
                                const urls = s3.lastMinuteChargesDocUrl.split(',').map((u: string) => u.trim()).filter(Boolean);
                                setLastMinuteDocs(urls.map((url: string) => ({
                                    name: url.startsWith('http') ? (url.split('/').pop() || 'LastMinuteCharges.pdf') : url,
                                    size: 0,
                                    preview: url.startsWith('http') ? url : undefined
                                })));
                            }
                            if (s3.policiesDocUrl) {
                                const urls = s3.policiesDocUrl.split(',').map((u: string) => u.trim()).filter(Boolean);
                                setPolicyDocs(urls.map((url: string) => ({
                                    name: url.startsWith('http') ? (url.split('/').pop() || 'PolicyDocument.pdf') : url,
                                    size: 0,
                                    preview: url.startsWith('http') ? url : undefined
                                })));
                            }
                            if (s3.lastMinuteChargesDescription) {
                                setLastMinuteChargesDescription(s3.lastMinuteChargesDescription);
                            }
                        }

                        // Populate Step 4 (Sample & Media)
                        if (pkg.step4_sampleMedia && pkg.step4_sampleMedia.media) {
                            setSampleMediaFiles(pkg.step4_sampleMedia.media.map((m: any) => ({
                                name: m.fileName || m.url.split('/').pop() || 'MediaFile',
                                size: m.size || 0,
                                preview: m.url
                            })));
                        }
                        
                        // Automatically route to next uncompleted step, prioritizing last viewed step
                        const savedStep = localStorage.getItem(`decorator_active_step_${pkg._id}`);
                        if (savedStep) {
                            setStep(parseInt(savedStep));
                        } else if (pkg.completedSteps && pkg.completedSteps.length > 0) {
                            const nextStep = Math.min(4, Math.max(...pkg.completedSteps) + 1);
                            setStep(nextStep);
                        }
                        return;
                    }
                }

                // 2. Fallback: Initialize a fresh draft if no draft package exists
                const res = await fetch(apiUrl('/packages/initialize'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: 'Decorator',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    setPackageGroupId(data.packageGroupId);
                    sessionStorage.setItem('draft_package_id_Decorator', data.packageId);
                        localStorage.setItem('selected_package_id', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing package draft:", err);
            }
        };
        initOrRestoreDecoratorPackage();
    }, []);

    // Navigation and Action Handlers
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            if (packageId) {
                localStorage.setItem(`decorator_active_step_${packageId}`, String(step - 1));
            }
        } else {
            router.push('/dashboard/inventory');
        }
    };

    const handleNext = async () => {
        if (!canSave) return;

        let currentPackageId = packageId;
        if (!currentPackageId) {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) {
                alert("Vendor ID not found in localStorage. Please log in first.");
                return;
            }
            setIsSaving(true);
            try {
                const initRes = await fetch(apiUrl('/packages/initialize'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: 'Decorator',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    setPackageGroupId(initData.packageGroupId);
                    sessionStorage.setItem('draft_package_id_Decorator', initData.packageId);
                    localStorage.setItem('selected_package_id', initData.packageId);
                } else {
                    throw new Error(initData.message || "Could not initialize draft package.");
                }
            } catch (err: any) {
                alert("Failed to initialize draft package: " + err.message);
                setIsSaving(false);
                return;
            }
        }

        setIsSaving(true);
        try {
            if (step === 1) {
                // Save Step 1 (Event & Crew)
                const payload = {
                    packageName: packageName || `${variants.selectedVariant} Decorator Package`,
                    eventCategories: eventCategories ? eventCategories.split(',').map(s => s.trim()) : ['Decoration'],
                    poc: poc || 'Rahul Sharma',
                    duration: {
                        minHours: parseInt(eventMinDuration) || 0,
                        maxHours: parseInt(eventMaxDuration) || 0
                    },
                    durationOfSetup: parseInt(setupDuration.replace(/\D/g, '')) || 0,
                    crewSize: {
                        // Map supervisors and workers to minPeople & maxPeople as defined in the Mongoose schema (Package.js)
                        minPeople: parseInt(supervisors) || 0,
                        maxPeople: parseInt(workers) || 0,
                        roles: ["Decorator"]
                    },
                    venueNeeds: {
                        power: venueNeeds.includes('Power'),
                        stage: venueNeeds.includes('Stage'),
                        lighting: venueNeeds.includes('Lighting'),
                        security: venueNeeds.includes('Security'),
                        customText: [
                            ...venueNeeds.filter(n => !['Power', 'Stage', 'Lighting', 'Security'].includes(n)),
                            ...(venueRequest.trim() ? [venueRequest.trim()] : [])
                        ].join(', ')
                    }
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/1`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 1 (Event & Crew).");
                
                setStep(2);
                localStorage.setItem(`decorator_active_step_${currentPackageId}`, '2');
            } else if (step === 2) {
                // Save Step 2 (Setups and Pricing)
                if (setups.length === 0) {
                    alert("Please add at least one setup before proceeding.");
                    setIsSaving(false);
                    return;
                }

                const cleanIncluded = providedDetails
                    .split('\n')
                    .map(line => line.replace(/^•\s*/, '').trim())
                    .filter(Boolean);

                const cleanNotIncluded = notProvidedDetails
                    .split('\n')
                    .map(line => line.replace(/^•\s*/, '').trim())
                    .filter(Boolean);

                const calculatedTotal = setups.reduce((acc, setup) => {
                    const itemsTotal = (setup.items || []).reduce((iAcc, item) => iAcc + (Number(item.price) || 0), 0);
                    return acc + (Number(setup.price) || 0) + itemsTotal;
                }, 0) + addons.reduce((acc, addon) => acc + (Number(addon.price) || 0), 0);
                const totalPackagePrice = manualTotalPackagePrice !== null ? manualTotalPackagePrice : calculatedTotal;

                // Upload addOn files
                const processedAddons = [];
                for (const a of addons) {
                    const uploadedPolicyUrls: string[] = [];
                    if (a.policies && a.policies.length > 0) {
                        for (const pf of a.policies) {
                            if (pf.file) {
                                const formData = new FormData();
                                formData.append('file', pf.file);
                                formData.append('uploadType', 'policies');
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (uploadRes.ok) {
                                    const uploadData = await uploadRes.json();
                                    if (uploadData.url) uploadedPolicyUrls.push(uploadData.url);
                                }
                            } else if (pf.preview) {
                                uploadedPolicyUrls.push(pf.preview);
                            }
                        }
                    }
                    const policyDocUrl = uploadedPolicyUrls.join(',');

                    const mediaUrls: string[] = [];
                    if (a.media && a.media.length > 0) {
                        for (const m of a.media) {
                            if (m.file) {
                                const formData = new FormData();
                                formData.append('file', m.file);
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (uploadRes.ok) {
                                    const uploadData = await uploadRes.json();
                                    if (uploadData.url) mediaUrls.push(uploadData.url);
                                }
                            } else if (m.preview) {
                                mediaUrls.push(m.preview);
                            }
                        }
                    }

                    processedAddons.push({
                        addOnType: a.type,
                        name: a.name,
                        category: a.category,
                        subCategory: a.subCategory,
                        quantity: parseInt(a.quantity) || 0,
                        description: a.description,
                        price: parseFloat(a.price) || 0,
                        billingUnit: a.billingUnit,
                        physicalSpec: {
                            // color stored as a single joined string e.g. "Red & Green"
                            color: Array.isArray(a.colors) ? a.colors.join(' & ') : (a.colors || ''),
                            // dimensions stored as structured object — parse back from "L x B x H UNIT"
                            dimensions: (() => {
                                if (!a.dimensions) return undefined;
                                const parts = a.dimensions.split(' ');
                                return {
                                    length: parseFloat(parts[0]) || 0,
                                    breadth: parseFloat(parts[2]) || 0,
                                    height: parseFloat(parts[4]) || 0,
                                    unit: parts[5] || 'CM',
                                };
                            })(),
                        },
                        policyDocUrl,
                        mediaUrls
                    });
                }

                const payload = {
                    totalPackagePrice,
                    setups: setups.map(s => ({
                        name: s.name,
                        setupPhoto: s.setupPhoto || '',
                        referenceStyle: s.referenceStyle,
                        description: s.description,
                        price: parseFloat(s.price) || 0,
                        decoratingWhat: s.decoratingWhat,
                        structuresIncluded: s.structuresIncluded || [],
                        themes: s.themes || [],
                        items: s.items.map(item => ({
                            name: item.name,
                            qty: item.qty || 1,
                            unit: item.unit || 'pcs',
                            price: item.price || 0
                        })),
                    })),
                    addOns: processedAddons,
                    included: cleanIncluded,
                    notIncluded: cleanNotIncluded
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/2`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 2 (Setups & Pricing).");

                setStep(3);
                localStorage.setItem(`decorator_active_step_${currentPackageId}`, '3');
            } else if (step === 3) {
                // Save Step 3 (Policies & Charges)
                let lastMinuteUrl = '';
                if (lastMinuteDocs.length > 0) {
                    const doc = lastMinuteDocs[0];
                    if (doc.file) {
                        const formData = new FormData(); formData.append('file', doc.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); lastMinuteUrl = data.url; }
                    } else if (doc.preview) { lastMinuteUrl = doc.preview; }
                    else if (doc.name) { lastMinuteUrl = doc.name; }
                }

                let policyUrl = '';
                if (policyDocs.length > 0) {
                    const doc = policyDocs[0];
                    if (doc.file) {
                        const formData = new FormData(); formData.append('file', doc.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); policyUrl = data.url; }
                    } else if (doc.preview) { policyUrl = doc.preview; }
                    else if (doc.name) { policyUrl = doc.name; }
                }

                let cancellationUrl = '';
                if (cancellationDocs.length > 0) {
                    const doc = cancellationDocs[0];
                    if (doc.file) {
                        const formData = new FormData(); formData.append('file', doc.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); cancellationUrl = data.url; }
                    } else if (doc.preview) { cancellationUrl = doc.preview; }
                    else if (doc.name) { cancellationUrl = doc.name; }
                }

                const festDetails: Record<string, any> = {};
                selectedFestivals.forEach(f => {
                    const spec = festivalPrices[f] || { increaseType: 'Percentage', value: '10' };
                    festDetails[f] = spec.increaseType === 'Percentage' 
                        ? { percentage: parseFloat(spec.value) || 0 }
                        : { price: parseFloat(spec.value) || 0 };
                });

                const dpPayload = {
                    weekends: {
                        enabled: isDynamicPricingEnabled && weekendPricing,
                        percentage: weekendIncreaseType === 'Percentage' ? (parseFloat(weekendValue) || 0) : undefined,
                        price: weekendIncreaseType === 'Fixed Price' ? (parseFloat(weekendValue) || 0) : undefined
                    },
                    weddingSeason: {
                        enabled: isDynamicPricingEnabled && weekendSeason,
                        percentage: seasonIncreaseType === 'Percentage' ? (parseFloat(seasonValue) || 0) : undefined,
                        price: seasonIncreaseType === 'Fixed Price' ? (parseFloat(seasonValue) || 0) : undefined
                    },
                    festivals: {
                        enabled: isDynamicPricingEnabled && festivalPricing,
                        details: festDetails
                    },
                    customDates: {
                        enabled: isDynamicPricingEnabled && customDatesPricing,
                        percentage: customDatesIncreaseType === 'Percentage' ? (parseFloat(customDatesValue) || 0) : undefined,
                        price: customDatesIncreaseType === 'Fixed Price' ? (parseFloat(customDatesValue) || 0) : undefined,
                        startDate: customDatesStartDate,
                        endDate: customDatesEndDate
                    }
                };

                const payload = {
                    teamAndEquipment: {
                        price: parseFloat(teamEquipmentPrice) || 0,
                        billingUnit: teamEquipmentUnit
                    },
                    gstInclusive,
                    gstRatePercent: 18,
                    guestTiers: guestTiers.map(tier => ({
                        maxGuests: parseInt(tier.range.replace(/\D/g, '')) || 0,
                        price: parseFloat(tier.price) || 0
                    })),
                    dynamicPricing: dpPayload,
                    policiesDocUrl: policyUrl,
                    lastMinuteChargesDocUrl: lastMinuteUrl,
                    cancellationDocUrl: cancellationUrl
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/3`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 3 (Policies & Charges).");

                setStep(4);
                localStorage.setItem(`decorator_active_step_${currentPackageId}`, '4');
            } else if (step === 4) {
                // Save Step 4 (Sample & Media)
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
                        const ext = smf.name.split('.').pop()?.toLowerCase();
                        const isVideo = ext && ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
                        mediaPayload.push({
                            url: smf.preview,
                            type: isVideo ? 'video' : 'image',
                            fileName: smf.name,
                            size: smf.size
                        });
                    }
                }

                const resStep4 = await fetch(apiUrl(`/packages/${currentPackageId}/step/4`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ media: mediaPayload })
                });
                if (!resStep4.ok) throw new Error("Failed to save Step 4 (Media files).");

                sessionStorage.removeItem('draft_package_id_Decorator');
                if (packageId) {
                    localStorage.removeItem(`decorator_active_step_${packageId}`);
                }
                if (onExitFlow) {
                    onExitFlow();
                } else {
                    router.push('/dashboard/packages/new');
                }
            }
        } catch (err: any) {
            console.error("Step navigation error:", err);
            alert(err.message || "Failed to save this step. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Setup State Updaters ──
    const saveSetupsToBackend = async (newSetups: Setup[]) => {
        if (!packageId) return;
        try {
            await fetch(apiUrl(`/packages/${packageId}/step/2`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setups: newSetups })
            });
        } catch (err) {
            console.error('Failed to auto-save setups', err);
        }
    };

    const handleAddSetup = (newSetup: Setup) => {
        setSetups((prev) => {
            const newSetups = [...prev, newSetup];
            saveSetupsToBackend(newSetups);
            return newSetups;
        });
    };

    const handleEditSetup = (updatedSetup: Setup) => {
        setSetups((prev) => {
            const newSetups = prev.map((s) => (s.id === updatedSetup.id ? updatedSetup : s));
            saveSetupsToBackend(newSetups);
            return newSetups;
        });
    };

    const deleteSetup = (id: string) => {
        setSetups((prev) => {
            const newSetups = prev.filter((s) => s.id !== id);
            saveSetupsToBackend(newSetups);
            return newSetups;
        });
    };

    // ── Add-on Modal Handlers ──
    const handleOpenAddonForm = () => {
        setEditingAddon(null);
        setIsAddonModalOpen(true);
    };

    const handleEditAddon = (addon: Addon) => {
        setEditingAddon(addon);
        setIsAddonModalOpen(true);
    };

    const deleteAddon = (id: string) => {
        setAddons((prev) => prev.filter((a) => a.id !== id));
    };

    const handleSaveAddon = (savedAddon: Addon) => {
        setAddons((prev) => {
            const exists = prev.some((a) => a.id === savedAddon.id);
            if (exists) {
                return prev.map((a) => (a.id === savedAddon.id ? savedAddon : a));
            }
            return [...prev, savedAddon];
        });
        setIsAddonModalOpen(false);
    };

    // ── Magic Fill for Testing ──
    const handleMagicFill = () => {
        // Step 1
        setPackageName('Royal Floral Palace Decor');
        setEventCategories('Wedding, Engagement, Sangeet');
        setEventMinDuration('4');
        setEventMaxDuration('6');
        setPoc('Rahul Sharma');
        setSetupDuration('E.g Upto 5 hours');
        setSupervisors('3');
        setWorkers('12');
        setVenueNeeds(['Power', 'Stage', 'Lighting']);
        setVenueRequest('Minimum 10ft ceiling height for main backdrop floral installations.');

        // Step 2
        setSetups([
            {
                id: 'setup_mock_1',
                name: 'Exquisite White-Rose Mandap',
                decoratingWhat: 'Mandap',
                referenceStyle: 'Royal Indian',
                setupPhoto: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600',
                description: 'A grand four-pillar dome mandap decorated with high-quality white roses, orchids, hanging crystals, and soft yellow spotlights.',
                price: '75000',
                items: [
                    { name: 'Floral Pillar Frames', qty: 4, unit: 'pcs', price: 8000 },
                    { name: 'Hanging Crystal Chandeliers', qty: 2, unit: 'pcs', price: 3500 },
                    { name: 'Warm LED Spotlights', qty: 8, unit: 'pcs', price: 400 }
                ]
            },
            {
                id: 'setup_mock_2',
                name: 'Premium Photo Booth Wall',
                decoratingWhat: 'Photo Booth',
                referenceStyle: 'Boho Chic',
                setupPhoto: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600',
                description: 'Retro wooden hexagonal frame backdrop wrapped in fresh pampas grass, neon signs saying "Happily Ever After", and rustic carpet styling.',
                price: '25000',
                items: [
                    { name: 'Hexagonal Wooden Backdrop', qty: 1, unit: 'pcs', price: 5000 },
                    { name: 'Neon Script Sign', qty: 1, unit: 'pcs', price: 2000 }
                ]
            }
        ]);
        setAddons([
            {
                id: 'addon_mock_1',
                type: 'Service',
                name: 'Red Carpet Guest Pathway Decor',
                category: 'Entrance',
                subCategory: 'Pathway',
                quantity: '1',
                description: 'A 50ft plush red carpet pathway flanked by gold-finished posts and warm candle lantern displays.',
                price: '8500',
                billingUnit: 'Per event',
                policies: [],
                media: []
            }
        ]);
        setProvidedDetails('• Complete structural setups and installations\n• Post-event cleaning and disassembly\n• Initial transportation within 30km radius');
        setNotProvidedDetails('• Continuous power generation or diesel generator supply\n• Major structural permissions from venue authorities');

        // Step 3
        setTeamEquipmentPrice('15000');
        setTeamEquipmentUnit('Per day');
        setLastMinuteFiles([
            {
                name: 'LastMinuteDecorCharges_V1.pdf',
                size: 1542000,
                preview: 'https://eventory-uploads.s3.amazonaws.com/mock/LastMinuteDecorCharges_V1.pdf'
            }
        ]);
        setPolicyFiles([
            {
                name: 'StandardDecorPolicy_2026.pdf',
                size: 2480000,
                preview: 'https://eventory-uploads.s3.amazonaws.com/mock/StandardDecorPolicy_2026.pdf'
            }
        ]);

        // Step 4
        setSampleMediaFiles([
            {
                name: 'Mandap_setup_close_up.jpg',
                size: 2516582,
                preview: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600'
            },
            {
                name: 'Reception_floral_backdrop.jpg',
                size: 3460300,
                preview: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600'
            }
        ]);
    };

    return (
        <div className="min-h-screen bg-white relative">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white px-6 pt-6 pb-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303] leading-[24px]">
                            Package Setup
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/inventory')}
                        aria-label="Close decorator package"
                        className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#030303] hover:bg-[#E4E4E7] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Variants Bar */}
            {packageId && packageGroupId && (
                <div className="px-6 pt-6 pb-4 bg-white">
                    <div className="max-w-md mx-auto">
                        <VariantManager 
                            packageId={packageId}
                            packageGroupId={packageGroupId}
                            vendorType="Decorator"
                            onVariantChange={(newId) => {
                                localStorage.setItem('selected_package_id', newId);
                                window.dispatchEvent(new Event('refresh_package_flow'));
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Step Progress Bar */}
            <div className="px-6 py-4 bg-white border-b border-[#F4F4F5]">
                <div className="max-w-md mx-auto flex flex-col gap-1">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase leading-[16px]">
                        STEP {step} OF {STEPS.length}
                    </span>
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] leading-[24px]">
                        {STEPS[step - 1]}
                    </h2>
                    <div className="h-[6px] w-full bg-[#E4E4E7] rounded-full mt-3">
                        <div className="h-full bg-[#04222D] rounded-full transition-all duration-300" style={{ width: `${(step / STEPS.length) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Main Step Render */}
            <main className="px-6 pt-6 pb-48 max-w-md mx-auto">
                {step === 1 && (
                    <DecoratorStep1EventAndCrew
                        packageName={packageName}
                        setPackageName={setPackageName}
                        eventCategories={eventCategories}
                        setEventCategories={setEventCategories}
                        eventMinDuration={eventMinDuration}
                        setEventMinDuration={setEventMinDuration}
                        eventMaxDuration={eventMaxDuration}
                        setEventMaxDuration={setEventMaxDuration}
                        poc={poc}
                        setPoc={setPoc}
                        setupDuration={setupDuration}
                        setSetupDuration={setSetupDuration}
                        supervisors={supervisors}
                        setSupervisors={setSupervisors}
                        workers={workers}
                        setWorkers={setWorkers}
                        venueNeeds={venueNeeds}
                        toggleVenueNeed={toggleVenueNeed}
                        venueRequest={venueRequest}
                        setVenueRequest={setVenueRequest}
                        venueNeedsOptions={VENUE_NEEDS_OPTIONS}
                    />
                )}
                {step === 2 && packageId && packageGroupId && (
                    <DecoratorStep2SetupsAndPricing
                        packageId={packageId}
                        packageGroupId={packageGroupId}
                        setups={setups}
                        handleAddSetup={handleAddSetup}
                        handleEditSetup={handleEditSetup}
                        deleteSetup={deleteSetup}
                        addons={addons}
                        handleOpenAddonForm={handleOpenAddonForm}
                        handleEditAddon={handleEditAddon}
                        deleteAddon={deleteAddon}
                        providedDetails={providedDetails}
                        setProvidedDetails={setProvidedDetails}
                        notProvidedDetails={notProvidedDetails}
                        setNotProvidedDetails={setNotProvidedDetails}
                        manualTotalPackagePrice={manualTotalPackagePrice}
                        setManualTotalPackagePrice={setManualTotalPackagePrice}
                    />
                )}
                {step === 3 && (
                    <DecoratorStep3PoliciesAndCharges
                        teamEquipmentPrice={teamEquipmentPrice}
                        setTeamEquipmentPrice={setTeamEquipmentPrice}
                        teamEquipmentUnit={teamEquipmentUnit}
                        setTeamEquipmentUnit={setTeamEquipmentUnit}
                        gstInclusive={gstInclusive}
                        setGstInclusive={setGstInclusive}
                        gstRatePercent={gstRatePercent}
                        setGstRatePercent={setGstRatePercent}
                        setups={setups}
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
                        guestTiers={guestTiers}
                        addGuestTierOption={addGuestTierOption}
                        updateGuestTier={updateGuestTier}
                        removeGuestTier={removeGuestTier}
                        cancellationDocs={cancellationDocs}
                        setCancellationDocs={setCancellationDocs}
                        isDynamicPricingEnabled={isDynamicPricingEnabled}
                        setIsDynamicPricingEnabled={setIsDynamicPricingEnabled}
                        weekendPricing={weekendPricing}
                        setWeekendPricing={setWeekendPricing}
                        weekendIncreaseType={weekendIncreaseType}
                        setWeekendIncreaseType={setWeekendIncreaseType}
                        weekendValue={weekendValue}
                        setWeekendValue={setWeekendValue}
                        weekendSeason={weekendSeason}
                        setWeekendSeason={setWeekendSeason}
                        seasonIncreaseType={seasonIncreaseType}
                        setSeasonIncreaseType={setSeasonIncreaseType}
                        seasonValue={seasonValue}
                        setSeasonValue={setSeasonValue}
                        festivalPricing={festivalPricing}
                        setFestivalPricing={setFestivalPricing}
                        selectedFestivals={selectedFestivals}
                        setSelectedFestivals={setSelectedFestivals}
                        availableFestivals={availableFestivals}
                        isAddingFestival={isAddingFestival}
                        setIsAddingFestival={setIsAddingFestival}
                        newFestivalName={newFestivalName}
                        setNewFestivalName={setNewFestivalName}
                        handleAddFestival={handleAddFestival}
                        festivalPrices={festivalPrices}
                        setFestivalPrices={setFestivalPrices}
                        lastMinuteDocs={lastMinuteFiles}
                        setLastMinuteDocs={setLastMinuteFiles}
                        policyDocs={policyFiles}
                        setPolicyDocs={setPolicyFiles}
                        addons={addons}
                    />
                )}
                {step === 4 && (
                    <DecoratorStep4SampleAndMedia
                        sampleMediaFiles={sampleMediaFiles}
                        sampleMediaInputRef={sampleMediaInputRef}
                        onSampleMediaUpload={onSampleMediaUpload}
                        removeSampleMediaFile={removeSampleMediaFile}
                    />
                )}
            </main>

            {/* Sticky Bottom Actions Bar */}
            <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 p-6 bg-white border-t border-gray-100 z-20 max-w-md mx-auto shadow-md">
                <div className="flex items-center justify-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={handleBack}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="flex-1 h-14 flex justify-center items-center bg-white border border-[#04222D] text-[#04222D] rounded-[12px] font-bold text-[15px] active:scale-[0.98] transition-all hover:bg-gray-50 cursor-pointer"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canSave || isSaving}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`flex-1 h-14 flex justify-center items-center rounded-[12px] font-bold text-[15px] active:scale-[0.98] transition-all ${
                            step === 4 && sampleMediaFiles.length === 0
                                ? 'bg-[#7F9299] text-white cursor-not-allowed'
                                : canSave && !isSaving
                                ? 'bg-[#04222D] text-white hover:bg-[#031820] cursor-pointer'
                                : 'bg-[#7F9299] text-white cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? 'Saving...' : step === 4 ? 'Save & Continue' : 'Save & Next'}
                    </button>
                </div>
            </div>

            {/* Decorator Add-on Modal */}
            <DecoratorAddonModal
                isOpen={isAddonModalOpen}
                onClose={() => setIsAddonModalOpen(false)}
                onSave={handleSaveAddon}
                addon={editingAddon}
            />

            {/* Hidden developer auto-fill trigger */}
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
        </div>
    );
}
