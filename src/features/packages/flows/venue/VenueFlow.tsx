'use client';
import { apiUrl } from '@/lib/api';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import VenueStep1PackageAndTeam from './Step1PackageAndTeam';
import VenueStep2SpacesAndItems, { VenueSpace } from './Step2SpacesAndItems';
import VenueStep3PricingAndPolicies from './Step3PricingAndPolicies';
import VenueStep4SampleMedia from './Step4SampleMedia';
import { Addon } from '../../components/AddonModal';
import { PolicyFile, SampleMediaFile, GuestTier } from '../../shared/types';

const FLOW_CONFIG = {
    vendorName: 'Venue Provider',
    steps: ['Your Package & Team', 'Package and Items', 'Policies and Charges', 'Sample and Media'],
};

export default function VenueFlow({ onExitFlow }: { onExitFlow?: () => void }) {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);
    const [isGlobalLoading, setIsGlobalLoading] = React.useState(true);
    const isInitializing = React.useRef(false);

    // --- Step 1 State ---
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [poc, setPoc] = React.useState('');
    const [minDuration, setMinDuration] = React.useState('');
    const [maxDuration, setMaxDuration] = React.useState('');
    const [crewSize, setCrewSize] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [offerTours, setOfferTours] = React.useState(false);

    // --- Step 2 State ---
    const [spaces, setSpaces] = React.useState<VenueSpace[]>([]);
    const [inHouseServices, setInHouseServices] = React.useState<Addon[]>([]);
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [providedDetails, setProvidedDetails] = React.useState('');
    const [notProvidedDetails, setNotProvidedDetails] = React.useState('');
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);

    // --- Step 3 State ---
    const [packageChargeType, setPackageChargeType] = React.useState('Per Package');
    const [packagePrice, setPackagePrice] = React.useState('');
    const [teamChargeType, setTeamChargeType] = React.useState('Per Package');
    const [teamPrice, setTeamPrice] = React.useState('');
    const [overtimeRate, setOvertimeRate] = React.useState('');
    const [gstInclusive, setGstInclusive] = React.useState(false);
    const [gstRatePercent, setGstRatePercent] = React.useState("");
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
    const [festivalPrices, setFestivalPrices] = React.useState<Record<string, { increaseType: string; value: string }>>({});
    const [lastMinuteDocs, setLastMinuteDocs] = React.useState<PolicyFile[]>([]);
    const [policyDocs, setPolicyDocs] = React.useState<PolicyFile[]>([]);

    // --- Step 4 State ---
    const [spaceMedia, setSpaceMedia] = React.useState<Record<string, SampleMediaFile[]>>({});

    // Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const [packageGroupId, setPackageGroupId] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (packageId) {
            localStorage.setItem(`venue_active_step_${packageId}`, String(step));
        }
    }, [step, packageId]);

    // Auto-initialize or restore draft package on mount
    React.useEffect(() => {
        if (isInitializing.current) return;
        isInitializing.current = true;

        const initOrRestorePackage = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) return;

            try {
                // 1. Check if vendor already has a draft package in the database
                const draftRes = await fetch(apiUrl(`/packages/vendor/${vendorId}?status=Draft`));
                const draftData = await draftRes.json();

                if (draftData.status === 'SUCCESS' && draftData.packages && draftData.packages.length > 0 && localStorage.getItem('selected_package_id') !== 'new') {
                    const venueDrafts = draftData.packages.filter((p: any) => p.vendorType === 'VenueProvider' || p.vendorType === 'VEN');
                    if (venueDrafts.length > 0) {
                        const requestedPackageId = localStorage.getItem('selected_package_id');
                        const pkg = venueDrafts.find((item: any) => item._id === requestedPackageId) || venueDrafts[0];
                        setPackageId(pkg._id);
                        setPackageGroupId(pkg.packageGroupId);
                        sessionStorage.setItem('draft_package_id_VEN', pkg._id);

                        // Populate Step 1
                        if (pkg.step1_eventAndCrew) {
                            const s1 = pkg.step1_eventAndCrew;
                            setPackageName(s1.packageName === 'Untitled Package' ? '' : s1.packageName || '');
                            if (s1.eventCategories) setEventCategories(s1.eventCategories.join(', '));
                            setPoc(s1.poc || '');
                            if (s1.duration) {
                                setMinDuration(String(s1.duration.minHours || ''));
                                setMaxDuration(String(s1.duration.maxHours || ''));
                            }
                            if (s1.crewSize) {
                                setCrewSize(String(s1.crewSize.maxPeople || ''));
                            }
                            setAddress(s1.address || '');
                            setOfferTours(s1.offerTours || false);
                        }

                        // Populate Step 2
                        if (pkg.step2_productsAndPricing) {
                            const s2 = pkg.step2_productsAndPricing;
                            if (s2.packageItems) {
                                setSpaces(s2.packageItems.map((sp: any, idx: number) => ({
                                    id: sp._id || Math.random().toString(36).substr(2, 9),
                                    isExpanded: false,
                                    name: sp.contentDetails?.description || `Space ${idx + 1}`,
                                    type: sp.contentDetails?.categories?.[0] || '',
                                    area: String(sp.contentDetails?.quantity || ''),
                                    areaUnit: sp.logisticsAndHandover?.deliveryFormat || 'Sq. Ft.',
                                    height: String(sp.albumSpecific?.pageCount || ''),
                                    heightUnit: sp.albumSpecific?.coverType || 'M',
                                    layout: sp.contentDetails?.style || '',
                                    capacityStanding: String(sp.logisticsAndHandover?.deliveryTimeline?.split(',')[0] || ''),
                                    capacitySitting: String(sp.logisticsAndHandover?.deliveryTimeline?.split(',')[1] || ''),
                                    capacityDining: String(sp.logisticsAndHandover?.deliveryTimeline?.split(',')[2] || ''),
                                    environment: sp.logisticsAndHandover?.deliveryMedium === 'Outdoor' ? 'Outdoor' : 'Indoor',
                                    activities: sp.albumSpecific?.pageFinish ? sp.albumSpecific.pageFinish.split(',') : [],
                                    amenities: sp.albumSpecific?.bindingType ? sp.albumSpecific.bindingType.split(',') : [],
                                    price: String(sp.albumSpecific?.price || ''),
                                    billingUnit: sp.itemType || 'Per hour'
                                })));
                            }
                            if (s2.addOns) {
                                const ihs = s2.addOns.filter((a: any) => a.addOnType === 'InHouseService');
                                const ads = s2.addOns.filter((a: any) => a.addOnType !== 'InHouseService');
                                
                                const mapAddon = (a: any) => ({
                                    id: a._id || Math.random().toString(36).substring(7),
                                    type: a.addOnType === 'Product' ? 'Product' : 'Service',
                                    name: a.name || '',
                                    category: a.category || '',
                                    subCategory: a.subCategory || '',
                                    quantity: String(a.quantity || ''),
                                    description: a.description || '',
                                    price: String(a.price || ''),
                                    billingUnit: a.billingUnit || 'Per hour',
                                    policies: a.policyDocUrl ? a.policyDocUrl.split(',').map((u: string, i: number) => ({ name: `Policy Document ${i + 1}`, size: 0, preview: u } as any)) : [],
                                    media: a.mediaUrls ? a.mediaUrls.map((u: string, i: number) => ({ name: `Sample ${i + 1}`, size: 0, preview: u } as any)) : [],
                                    productType: a.productType || 'Product'
                                });
                                
                                setInHouseServices(ihs.map(mapAddon));
                                setAddons(ads.map(mapAddon));
                            }
                            if (s2.included) setProvidedDetails(s2.included.join('\n'));
                            if (s2.notIncluded) setNotProvidedDetails(s2.notIncluded.join('\n'));
                        }

                        // Populate Step 3
                        if (pkg.step3_pricingAndPolicies) {
                            const s3 = pkg.step3_pricingAndPolicies;
                            if (s3.pricing) {
                                if (s3.pricing.packagePricing) {
                                    setPackageChargeType(s3.pricing.packagePricing.chargeType || 'Per Package');
                                    setPackagePrice(String(s3.pricing.packagePricing.price || ''));
                                }
                                if (s3.pricing.teamAndEquipment) {
                                    setTeamChargeType(s3.pricing.teamAndEquipment.chargeType || 'Per Package');
                                    setTeamPrice(String(s3.pricing.teamAndEquipment.price || ''));
                                }
                                setOvertimeRate(String(s3.pricing.overtimeRate || ''));
                            }
                            if (s3.gstInclusive !== undefined) setGstInclusive(s3.gstInclusive);
                            if (s3.gstRatePercent !== undefined) setGstRatePercent(String(s3.gstRatePercent));
                            if (s3.dynamicPricing) {
                                const dp = s3.dynamicPricing;
                                // In case it's an array from old data, just enable if there's anything
                                if (Array.isArray(dp)) {
                                    setIsDynamicPricingEnabled(dp.length > 0);
                                } else {
                                    setIsDynamicPricingEnabled(!!(dp.weekends?.enabled || dp.weddingSeason?.enabled || dp.festivals?.enabled || dp.customDates?.enabled));
                                    const basePrice = s3.pricing?.packagePricing?.price || 0;
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
                            if (s3.policies) {
                                if (s3.policies.lastMinuteChangePolicy) {
                                    setLastMinuteDocs(s3.policies.lastMinuteChangePolicy.map((doc: any) => ({
                                        name: doc.name || 'Policy Document',
                                        size: 0,
                                        preview: doc.url
                                    })));
                                }
                                if (s3.policies.cancellationPolicy) {
                                    setPolicyDocs(s3.policies.cancellationPolicy.map((doc: any) => ({
                                        name: doc.name || 'Policy Document',
                                        size: 0,
                                        preview: doc.url
                                    })));
                                }
                            }
                            if (s3.guestTiers && s3.guestTiers.length > 0) {
                                setGuestTiers(s3.guestTiers.map((gt: any) => ({
                                    range: `Upto ${gt.maxGuests}`,
                                    price: String(gt.price || '')
                                })));
                            }
                        }

                        // Populate Step 4
                        if (pkg.step4_sampleWork) {
                            if (pkg.step4_sampleWork.spaceMedia) {
                                const sm: Record<string, SampleMediaFile[]> = {};
                                pkg.step4_sampleWork.spaceMedia.forEach((smItem: any) => {
                                    if (smItem.spaceId && smItem.media) {
                                        sm[smItem.spaceId] = smItem.media.map((m: any) => ({
                                            name: 'Media File',
                                            size: 0,
                                            preview: m.url
                                        }));
                                    }
                                });
                                setSpaceMedia(sm);
                            } else if (pkg.step4_sampleWork.media && spaces.length > 0) {
                                // Fallback mapping
                                const sm: Record<string, SampleMediaFile[]> = {};
                                sm[spaces[0].id] = pkg.step4_sampleWork.media.map((m: any) => ({
                                    name: 'Media File',
                                    size: 0,
                                    preview: m.url
                                }));
                                setSpaceMedia(sm);
                            }
                        }

                        // Route to last step
                        const savedStep = localStorage.getItem(`venue_active_step_${pkg._id}`);
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
                        vendorType: 'VenueProvider',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    setPackageGroupId(data.packageGroupId);
                    sessionStorage.setItem('draft_package_id_VEN', data.packageId);
                        localStorage.setItem('selected_package_id', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing Venue package draft:", err);
            } finally {
                setIsGlobalLoading(false);
            }
        };
        initOrRestorePackage();
    }, []);

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else if (onExitFlow) onExitFlow();
        else router.push('/dashboard/inventory');
    };

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
                const initRes = await fetch(apiUrl('/packages/initialize'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: 'VenueProvider',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    setPackageGroupId(initData.packageGroupId);
                    sessionStorage.setItem('draft_package_id_VEN', initData.packageId);
                    localStorage.setItem('selected_package_id', initData.packageId);
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
                const payload = {
                    packageName: packageName || `${variants.selectedVariant} Venue Package`,
                    eventCategories: eventCategories ? eventCategories.split(',').map(s => s.trim()) : ['Wedding'],
                    poc: poc,
                    duration: {
                        minHours: parseInt(minDuration) || 0,
                        maxHours: parseInt(maxDuration) || 0,
                    },
                    crewSize: {
                        minPeople: parseInt(crewSize) || 0,
                        maxPeople: parseInt(crewSize) || 0,
                        roles: []
                    },
                    address: address,
                    offerTours: offerTours
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/1`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 1 (Event & Team).");
                setStep(2);
            } else if (step === 2) {
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
                                formData.append('uploadType', 'media');
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (uploadRes.ok) {
                                    const uploadData = await uploadRes.json();
                                    if (uploadData.url) mediaUrls.push(uploadData.url);
                                }
                            } else if (m.preview && !m.preview.startsWith('blob:')) {
                                mediaUrls.push(m.preview);
                            }
                        }
                    }

                    processedAddons.push({
                        addOnType: a.type || "Service",
                        name: a.name || "",
                        category: a.category || "",
                        subCategory: a.subCategory || "",
                        quantity: Number(a.quantity) || 1,
                        description: a.description || "",
                        price: parseFloat(a.price) || 0,
                        billingUnit: a.billingUnit || "Per hour",
                        policyDocUrl: policyDocUrl,
                        mediaUrls: mediaUrls,
                        ...(a.type === 'Space' && (a as any).spaceDetails ? { spaceDetails: (a as any).spaceDetails } : {})
                    });
                }

                const ihsPayload: any = {
                    caterer: [],
                    decorator: [],
                    pav: [],
                    djArtist: [],
                    makeupArtist: []
                };

                for (const ihs of inHouseServices) {
                    const mediaUrls = [];
                    if (ihs.media && ihs.media.length > 0) {
                        for (const m of ihs.media) {
                            if (m.file) {
                                const formData = new FormData(); formData.append('file', m.file);
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (uploadRes.ok) { const data = await uploadRes.json(); if (data.url) mediaUrls.push(data.url); }
                            } else if (m.preview && !m.preview.startsWith('blob:')) { mediaUrls.push(m.preview); }
                        }
                    }

                    let cat = ihs.category?.toLowerCase() || '';
                    if (cat === 'dj artist') cat = 'djArtist';
                    if (cat === 'makeup artist') cat = 'makeupArtist';
                    
                    const targetCategory = ihsPayload[cat] ? cat : 'decorator';

                    ihsPayload[targetCategory].push({
                        serviceType: ihs.name,
                        data: {
                            totalPackagePrice: parseFloat(ihs.price as any) || 0,
                            setups: [{ name: ihs.name, price: parseFloat(ihs.price as any) || 0 }],
                            packageItems: [{ name: ihs.name, price: parseFloat(ihs.price as any) || 0 }]
                        },
                        sampleMedia: mediaUrls.map(url => ({ url, type: 'image' }))
                    });
                }

                const payload = {
                    spaces: spaces.map(space => ({
                        name: space.name,
                        spaceType: space.type,
                        area: { value: parseInt(space.area) || 0, unit: space.areaUnit },
                        height: { value: parseInt(space.height) || 0, unit: space.heightUnit },
                        layout: space.layout,
                        capacity: {
                            standing: parseInt(space.capacityStanding) || 0,
                            sitting: parseInt(space.capacitySitting) || 0,
                            dining: parseInt(space.capacityDining) || 0
                        },
                        environment: space.environment,
                        activities: space.activities,
                        amenities: {
                            power: space.amenities.includes('power'),
                            ac: space.amenities.includes('ac'),
                            stage: space.amenities.includes('stage'),
                            lighting: space.amenities.includes('lighting'),
                            security: space.amenities.includes('security')
                        },
                        price: parseFloat(space.price) || 0,
                        billingUnit: space.billingUnit
                    })),
                    inHouseServices: ihsPayload,
                    addOns: processedAddons,
                    included: providedDetails.split('\n').map(s => s.trim()).filter(Boolean),
                    notIncluded: notProvidedDetails.split('\n').map(s => s.trim()).filter(Boolean)
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/2`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 2 (Package and Items).");
                setStep(3);
            } else if (step === 3) {
                const uploadFiles = async (files: PolicyFile[]) => {
                    const urls = [];
                    for (const f of files) {
                        if (f.file) {
                            const fd = new FormData(); fd.append('file', f.file);
                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                            if (res.ok) { const data = await res.json(); if (data.url) urls.push({ url: data.url, name: f.name }); }
                        } else if (f.preview) {
                            urls.push({ url: f.preview, name: f.name });
                        }
                    }
                    return urls;
                };

                const lastMinuteUrls = await uploadFiles(lastMinuteDocs);
                const policyUrls = await uploadFiles(policyDocs);

                const basePriceForCalculation = parseFloat(packagePrice) || 0;
                const payload = {
                    pricing: {
                        packagePricing: { chargeType: packageChargeType, price: parseFloat(packagePrice) || 0 },
                        teamAndEquipment: { chargeType: teamChargeType, price: parseFloat(teamPrice) || 0 },
                        overtimeRate: parseFloat(overtimeRate) || 0,
                    },
                    guestTiers: guestTiers.map(tier => ({
                        maxGuests: parseInt(tier.range.replace(/\D/g, '')) || 0,
                        price: parseFloat(tier.price) || 0
                    })),
                    gstInclusive,
                    gstRatePercent: gstRatePercent ? parseFloat(gstRatePercent) : undefined,
                    dynamicPricing: {
                        weekends: {
                            enabled: weekendPricing,
                            price: weekendIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(weekendValue) || 0) - basePriceForCalculation) : 0,
                            percentage: weekendIncreaseType === 'Percentage' ? (parseFloat(weekendValue) || 0) : 0
                        },
                        weddingSeason: {
                            enabled: weekendSeason,
                            price: seasonIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(seasonValue) || 0) - basePriceForCalculation) : 0,
                            percentage: seasonIncreaseType === 'Percentage' ? (parseFloat(seasonValue) || 0) : 0
                        },
                        festivals: {
                            enabled: festivalPricing,
                            percentage: 0,
                            details: Object.fromEntries(
                                selectedFestivals.map(fest => {
                                    const fp = festivalPrices[fest] || { increaseType: festivalIncreaseType, value: festivalValue };
                                    return [
                                        fest,
                                        {
                                            increaseType: fp.increaseType,
                                            price: fp.increaseType === 'Fixed Price' ? Math.max(0, (parseFloat(fp.value) || 0) - basePriceForCalculation) : 0,
                                            percentage: fp.increaseType === 'Percentage' ? (parseFloat(fp.value) || 0) : 0
                                        }
                                    ];
                                })
                            )
                        },
                        customDates: {
                            enabled: customDatesPricing,
                            price: customDatesIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(customDatesValue) || 0) - basePriceForCalculation) : 0,
                            percentage: customDatesIncreaseType === 'Percentage' ? (parseFloat(customDatesValue) || 0) : 0,
                            startDate: customDatesStartDate,
                            endDate: customDatesEndDate
                        }
                    },
                    policies: {
                        lastMinuteChangePolicy: lastMinuteUrls,
                        cancellationPolicy: policyUrls
                    }
                };
                
                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/3`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 3.");
                setStep(4);
            } else if (step === 4) {
                const spaceMediaPayload: any[] = [];
                for (const spaceId of Object.keys(spaceMedia)) {
                    const files = spaceMedia[spaceId];
                    const uploadedUrls = [];
                    for (const f of files) {
                        if (f.file) {
                            const fd = new FormData(); fd.append('file', f.file);
                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                            if (res.ok) { const data = await res.json(); if (data.url) uploadedUrls.push({ url: data.url, type: f.file.type.startsWith('image/') ? 'Image' : 'Video' }); }
                        } else if (f.preview && !f.preview.startsWith('blob:')) {
                            uploadedUrls.push({ url: f.preview, type: 'Image' });
                        }
                    }
                    if (uploadedUrls.length > 0) {
                        spaceMediaPayload.push({
                            spaceId: spaceId,
                            media: uploadedUrls
                        });
                    }
                }

                // If the backend needs a flattened array as fallback
                const allUploadedMedia = spaceMediaPayload.reduce((acc, curr) => acc.concat(curr.media), []);

                const payload = { 
                    spaceMedia: spaceMediaPayload,
                    media: allUploadedMedia
                };
                
                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/4`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!res.ok) throw new Error("Failed to save Step 4.");
                
                if (onExitFlow) {
                    onExitFlow();
                } else {
                    router.push('/dashboard/packages/new');
                }
            }
        } catch (err: any) {
            console.error("Step navigation error:", err);
            alert(err.message || "Something went wrong saving this step. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

        if (isGlobalLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-[#04222D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[#3F3F47] font-semibold text-[14px]">Loading your package details...</p>
                </div>
            </div>
        );
    }

    return (
        <FlowShell
            config={FLOW_CONFIG}
            step={step}
            onBack={handleBack}
            onNext={handleNext}
            isSaving={isSaving}
            packageId={packageId}
            packageGroupId={packageGroupId}
            vendorType="Venue"
            onVariantChange={(newId) => {
                localStorage.setItem('selected_package_id', newId);
                window.dispatchEvent(new Event('refresh_package_flow'));
            }}
        >
            {step === 1 && (
                <VenueStep1PackageAndTeam
                    packageName={packageName} setPackageName={setPackageName}
                    eventCategories={eventCategories} setEventCategories={setEventCategories}
                    poc={poc} setPoc={setPoc}
                    minDuration={minDuration} setMinDuration={setMinDuration}
                    maxDuration={maxDuration} setMaxDuration={setMaxDuration}
                    crewSize={crewSize} setCrewSize={setCrewSize}
                    address={address} setAddress={setAddress}
                    offerTours={offerTours} setOfferTours={setOfferTours}
                />
            )}
            {step === 2 && packageId && packageGroupId && (
                <VenueStep2SpacesAndItems
                    packageId={packageId}
                    packageGroupId={packageGroupId}
                    spaces={spaces} setSpaces={setSpaces}
                    inHouseServices={inHouseServices} setInHouseServices={setInHouseServices}
                    addons={addons} setAddons={setAddons}
                    providedDetails={providedDetails} setProvidedDetails={setProvidedDetails}
                    notProvidedDetails={notProvidedDetails} setNotProvidedDetails={setNotProvidedDetails}
                    activeMenuDropdown={activeMenuDropdown} setActiveMenuDropdown={setActiveMenuDropdown}
                />
            )}
            {step === 3 && (
                <VenueStep3PricingAndPolicies
                    packageChargeType={packageChargeType} setPackageChargeType={setPackageChargeType}
                    packagePrice={packagePrice} setPackagePrice={setPackagePrice}
                    teamChargeType={teamChargeType} setTeamChargeType={setTeamChargeType}
                    teamPrice={teamPrice} setTeamPrice={setTeamPrice}
                    overtimeRate={overtimeRate} setOvertimeRate={setOvertimeRate}
                    
                    gstInclusive={gstInclusive}
                        setGstInclusive={setGstInclusive}
                        gstRatePercent={gstRatePercent}
                        setGstRatePercent={setGstRatePercent}
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
                    availableFestivals={availableFestivals} setAvailableFestivals={setAvailableFestivals}
                    isAddingFestival={isAddingFestival} setIsAddingFestival={setIsAddingFestival}
                    newFestivalName={newFestivalName} setNewFestivalName={setNewFestivalName}
                    handleAddFestival={handleAddFestival}
                    customDatesPricing={customDatesPricing} setCustomDatesPricing={setCustomDatesPricing}
                    customDatesIncreaseType={customDatesIncreaseType} setCustomDatesIncreaseType={setCustomDatesIncreaseType}
                    customDatesValue={customDatesValue} setCustomDatesValue={setCustomDatesValue}
                    customDatesStartDate={customDatesStartDate} setCustomDatesStartDate={setCustomDatesStartDate}
                    customDatesEndDate={customDatesEndDate} setCustomDatesEndDate={setCustomDatesEndDate}
                    guestTiers={guestTiers} addGuestTierOption={addGuestTierOption} updateGuestTier={updateGuestTier} removeGuestTier={removeGuestTier}
                    festivalPrices={festivalPrices} setFestivalPrices={setFestivalPrices}
                    
                    lastMinuteDocs={lastMinuteDocs} setLastMinuteDocs={setLastMinuteDocs}
                    policyDocs={policyDocs} setPolicyDocs={setPolicyDocs}
                />
            )}
            {step === 4 && (
                <VenueStep4SampleMedia
                    spaces={spaces}
                    spaceMedia={spaceMedia}
                    setSpaceMedia={setSpaceMedia}
                />
            )}
        </FlowShell>
    );
}
