'use client';
import { apiUrl } from '@/lib/api';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import PAVStep1EventAndTeam from './Step1EventAndTeam';
import PAVStep2PackageAndItems, { PAVItem } from './Step2PackageAndItems';
import PAVStep3PricingAndPolicies, { DynamicPrice } from './Step3PricingAndPolicies';
import PAVStep4SampleAndMedia from './Step4SampleAndMedia';
import { AddonModal, Addon } from '../../components/AddonModal';
import { PolicyFile, SampleMediaFile } from '../../shared/types';

const FLOW_CONFIG = {
    vendorName: 'Photographer',
    steps: ['Your Package & Team', 'Deliverables', 'Pricing', 'Sample & Media'],
};

const VENUE_NEEDS_OPTIONS = ['Power', 'Camera', 'Stage', 'Lighting', 'Security'];

export default function PAVFlow({ onExitFlow }: { onExitFlow?: () => void }) {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // --- Step 1 State ---
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [minDuration, setMinDuration] = React.useState('');
    const [maxDuration, setMaxDuration] = React.useState('');
    const [totalCrewSize, setTotalCrewSize] = React.useState(4);
    const [photographersCount, setPhotographersCount] = React.useState('');
    const [videographersCount, setVideographersCount] = React.useState('');
    const [otherRoles, setOtherRoles] = React.useState('');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');

    const toggleVenueNeed = (need: string) =>
        setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);

    // --- Step 2 State ---
    const [pavItems, setPavItems] = React.useState<PAVItem[]>([]);
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [isAddingAddon, setIsAddingAddon] = React.useState(false);
    const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);
    const [providedDetails, setProvidedDetails] = React.useState('');
    const [notProvidedDetails, setNotProvidedDetails] = React.useState('');

    const handleOpenAddonForm = () => { setEditingAddon(null); setIsAddingAddon(true); };
    const handleEditAddon = (addon: Addon) => { setEditingAddon(addon); setIsAddingAddon(true); setActiveMenuDropdown(null); };
    const handleSaveAddon = (saved: Addon) => {
        if (editingAddon) setAddons(prev => prev.map(a => a.id === saved.id ? saved : a));
        else setAddons(prev => [...prev, saved]);
        setIsAddingAddon(false);
        setEditingAddon(null);
    };
    const deleteAddon = (id: string) => setAddons(prev => prev.filter(a => a.id !== id));

    // --- Step 3 State ---
    const [packageChargeType, setPackageChargeType] = React.useState('Per Performance');
    const [packagePrice, setPackagePrice] = React.useState('');
    const [teamChargeType, setTeamChargeType] = React.useState('Per Performance');
    const [teamPrice, setTeamPrice] = React.useState('');
    const [overtimeRate, setOvertimeRate] = React.useState('');
    const [isGstInclusive, setIsGstInclusive] = React.useState(false);
    const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = React.useState(false);
    const [weekendPricing, setWeekendPricing] = React.useState(false);
    const [weekendIncreaseType, setWeekendIncreaseType] = React.useState('Percentage');
    const [weekendValue, setWeekendValue] = React.useState('10');
    const [weekendDays, setWeekendDays] = React.useState<string[]>(['Saturday', 'Sunday']);
    
    const [weekendSeason, setWeekendSeason] = React.useState(false);
    const [seasonIncreaseType, setSeasonIncreaseType] = React.useState('Percentage');
    const [seasonValue, setSeasonValue] = React.useState('15');
    
    const [festivalPricing, setFestivalPricing] = React.useState(false);
    const [festivalIncreaseType, setFestivalIncreaseType] = React.useState('Percentage');
    const [festivalValue, setFestivalValue] = React.useState('10');
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

    const [cancellationDocs, setCancellationDocs] = React.useState<PolicyFile[]>([]);
    const [lastMinuteDocs, setLastMinuteDocs] = React.useState<PolicyFile[]>([]);
    const [policyDocs, setPolicyDocs] = React.useState<PolicyFile[]>([]);

    // --- Step 4 State ---
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);

    // Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const isInitializing = React.useRef(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Save current step to localStorage to preserve state on reload
    React.useEffect(() => {
        if (packageId) {
            localStorage.setItem(`pav_active_step_${packageId}`, String(step));
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

                if (draftData.status === 'SUCCESS' && draftData.packages && draftData.packages.length > 0) {
                    const pavDrafts = draftData.packages.filter((p: any) => p.vendorType === 'PAV');
                    if (pavDrafts.length > 0) {
                        const pkg = pavDrafts[0];
                        setPackageId(pkg._id);
                        sessionStorage.setItem('draft_package_id_PAV', pkg._id);

                        // Populate Step 1 (Event & Team)
                        if (pkg.step1_eventAndCrew) {
                            const s1 = pkg.step1_eventAndCrew;
                            setPackageName(s1.packageName === 'Untitled Package' ? '' : s1.packageName || '');
                            if (s1.eventCategories) setEventCategories(s1.eventCategories.join(', '));
                            
                            if (s1.duration) {
                                setMinDuration(String(s1.duration.minHours || ''));
                                setMaxDuration(String(s1.duration.maxHours || ''));
                            }
                            if (s1.crewSize && s1.crewSize.maxPeople) {
                                setTotalCrewSize(s1.crewSize.maxPeople);
                            }
                            if (s1.crewBreakdown) {
                                setPhotographersCount(String(s1.crewBreakdown.photographers || ''));
                                setVideographersCount(String(s1.crewBreakdown.videographers || ''));
                            }
                            if (s1.crewSize && s1.crewSize.roles) {
                                setOtherRoles(s1.crewSize.roles.join(', '));
                            }
                            
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

                        // Populate Step 2 (Package and Items)
                        if (pkg.step2_productsAndPricing) {
                            const s2 = pkg.step2_productsAndPricing;
                            if (s2.packageItems) {
                                setPavItems(s2.packageItems.map((it: any, idx: number) => ({
                                    id: it._id || Math.random().toString(36).substr(2, 9),
                                    itemType: it.itemType || 'Photography',
                                    name: `PAV Item ${idx + 1}`,
                                    isExpanded: false,
                                    categories: it.contentDetails?.categories || [],
                                    style: it.contentDetails?.style || '',
                                    quantity: String(it.contentDetails?.quantity || ''),
                                    description: it.contentDetails?.description || '',
                                    coverType: it.albumSpecific?.coverType || '',
                                    pageCount: String(it.albumSpecific?.pageCount || ''),
                                    bindingType: it.albumSpecific?.bindingType || '',
                                    pageFinish: it.albumSpecific?.pageFinish || '',
                                    deliveryFormat: it.logisticsAndHandover?.deliveryFormat || '',
                                    deliveryMedium: it.logisticsAndHandover?.deliveryMedium || '',
                                    deliveryTimeline: it.logisticsAndHandover?.deliveryTimeline || '',
                                    isVisitingIncluded: it.logisticsAndHandover?.isVisitingIncluded || false,
                                    resolution: it.contentDetails?.categories?.[0] || ''
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
                                    policies: a.policyDocUrl ? [{ name: 'Existing Policy', size: 0, preview: a.policyDocUrl } as any] : [],
                                    media: (a.mediaUrls || []).map((url: string) => ({ name: 'Media File', size: 0, file: null, preview: url })),
                                    productType: a.productType || 'Product'
                                })));
                            }
                            if (s2.notIncluded) setNotProvidedDetails(s2.notIncluded.join('\n'));
                            if (s2.included) setProvidedDetails(s2.included.join('\n'));
                        }

                        // Populate Step 3
                        if (pkg.step3_policiesAndCharges) {
                            const s3 = pkg.step3_policiesAndCharges;
                            if (s3.packagePricing) {
                                setPackageChargeType(s3.packagePricing.billingUnit || 'Per Performance');
                                setPackagePrice(String(s3.packagePricing.price || ''));
                            }
                            if (s3.teamAndEquipment) {
                                setTeamChargeType(s3.teamAndEquipment.billingUnit || 'Per Performance');
                                setTeamPrice(String(s3.teamAndEquipment.price || ''));
                            }
                            if (s3.overtimeCharges) setOvertimeRate(String(s3.overtimeCharges.price || ''));
                            if (typeof s3.gstInclusive === 'boolean') setIsGstInclusive(s3.gstInclusive);
                            
                            if (s3.dynamicPricing) {
                                const dp = s3.dynamicPricing;
                                const enabled = dp.weekends?.enabled || dp.weddingSeason?.enabled || dp.festivals?.enabled || dp.customDates?.enabled;
                                setIsDynamicPricingEnabled(!!enabled);

                                if (dp.weekends) {
                                    setWeekendPricing(!!dp.weekends.enabled);
                                    if (dp.weekends.percentage) {
                                        setWeekendIncreaseType('Percentage');
                                        setWeekendValue(String(dp.weekends.percentage));
                                    } else if (dp.weekends.price) {
                                        setWeekendIncreaseType('Fixed Price');
                                        setWeekendValue(String(dp.weekends.price));
                                    }
                                }
                                if (dp.weddingSeason) {
                                    setWeekendSeason(!!dp.weddingSeason.enabled);
                                    if (dp.weddingSeason.percentage) {
                                        setSeasonIncreaseType('Percentage');
                                        setSeasonValue(String(dp.weddingSeason.percentage));
                                    } else if (dp.weddingSeason.price) {
                                        setSeasonIncreaseType('Fixed Price');
                                        setSeasonValue(String(dp.weddingSeason.price));
                                    }
                                }
                                if (dp.festivals) {
                                    setFestivalPricing(!!dp.festivals.enabled);
                                    if (dp.festivals.details) {
                                        const fNames = Object.keys(dp.festivals.details);
                                        setSelectedFestivals(fNames);
                                        const newAvail = [...availableFestivals];
                                        const newPrices: Record<string, { increaseType: string; value: string }> = {};
                                        fNames.forEach(fn => {
                                            if (!newAvail.includes(fn)) newAvail.push(fn);
                                            const fd = dp.festivals.details[fn];
                                            if (fd.percentage) newPrices[fn] = { increaseType: 'Percentage', value: String(fd.percentage) };
                                            else newPrices[fn] = { increaseType: 'Fixed Price', value: String(fd.price) };
                                        });
                                        setAvailableFestivals(newAvail);
                                        setFestivalPrices(newPrices);
                                    }
                                }
                                if (dp.customDates) {
                                    setCustomDatesPricing(!!dp.customDates.enabled);
                                    if (dp.customDates.percentage) {
                                        setCustomDatesIncreaseType('Percentage');
                                        setCustomDatesValue(String(dp.customDates.percentage));
                                    } else if (dp.customDates.price) {
                                        setCustomDatesIncreaseType('Fixed Price');
                                        setCustomDatesValue(String(dp.customDates.price));
                                    }
                                    setCustomDatesStartDate(dp.customDates.startDate || '');
                                    setCustomDatesEndDate(dp.customDates.endDate || '');
                                }
                            } else if (s3.dateRangeDynamicPricing && s3.dateRangeDynamicPricing.length > 0) {
                                setIsDynamicPricingEnabled(true);
                            }
                            if (s3.lastMinuteChargesDocUrl) setLastMinuteDocs([{ name: 'Existing Document', size: 0, preview: s3.lastMinuteChargesDocUrl }] as any);
                            if (s3.policiesDocUrl) setPolicyDocs([{ name: 'Existing Policy', size: 0, preview: s3.policiesDocUrl }] as any);
                            if (s3.cancellationDocUrl) setCancellationDocs([{ name: 'Existing Policy', size: 0, preview: s3.cancellationDocUrl }] as any);
                        }

                        // Populate Step 4
                        if (pkg.step4_sampleMedia && pkg.step4_sampleMedia.media) {
                            setSampleMediaFiles(pkg.step4_sampleMedia.media.map((m: any) => ({
                                name: m.fileName || 'Sample File',
                                size: m.size || 0,
                                preview: m.url || ''
                            } as any)));
                        }

                        // Route to last step
                        const savedStep = localStorage.getItem(`pav_active_step_${pkg._id}`);
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
                        vendorType: 'PAV',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    sessionStorage.setItem('draft_package_id_PAV', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing PAV package draft:", err);
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
                        vendorType: 'PAV',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    sessionStorage.setItem('draft_package_id_PAV', initData.packageId);
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
                    packageName: packageName || `${variants.selectedVariant} Photographer Package`,
                    eventCategories: eventCategories ? eventCategories.split(',').map(s => s.trim()) : ['Wedding'],
                    poc: pocName,
                    duration: {
                        minHours: parseInt(minDuration) || 0,
                        maxHours: parseInt(maxDuration) || 0,
                    },
                    crewSize: {
                        minPeople: totalCrewSize,
                        maxPeople: totalCrewSize,
                        roles: otherRoles ? otherRoles.split(',').map(s => s.trim()).filter(Boolean) : []
                    },
                    crewBreakdown: {
                        photographers: parseInt(photographersCount) || 0,
                        videographers: parseInt(videographersCount) || 0,
                        otherAssistants: 0,
                        editors: 0
                    },
                    venueNeeds: {
                        power: venueNeeds.includes('Power'),
                        ac: venueNeeds.includes('AC'),
                        stage: venueNeeds.includes('Stage'),
                        lighting: venueNeeds.includes('Lighting'),
                        security: venueNeeds.includes('Security'),
                        customText: [
                            ...venueNeeds.filter(n => !['Power', 'AC', 'Stage', 'Lighting', 'Security'].includes(n)),
                            ...(venueRequest.trim() ? [venueRequest.trim()] : [])
                        ].join(', ')
                    }
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/1`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 1 (Event & Team).");
                setStep(2);
            } else if (step === 2) {
                const addonsPayload = [];
                for (const addon of addons) {
                    let policyUrl = '';
                    if (addon.policies && addon.policies.length > 0) {
                        const pf = addon.policies[0] as any;
                        if (pf.file) {
                            const formData = new FormData(); formData.append('file', pf.file);
                            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                            if (uploadRes.ok) { const data = await uploadRes.json(); policyUrl = data.url || ''; }
                        } else if (pf.url) { policyUrl = pf.url; }
                    }
                    const mediaUrls = [];
                    if (addon.media && addon.media.length > 0) {
                        for (const m of addon.media) {
                            if (m.file) {
                                const formData = new FormData(); formData.append('file', m.file);
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (uploadRes.ok) { const data = await uploadRes.json(); if (data.url) mediaUrls.push(data.url); }
                            } else if (m.preview && !m.preview.startsWith('blob:')) { mediaUrls.push(m.preview); }
                        }
                    }
                    addonsPayload.push({
                        addOnType: addon.type === 'Product' ? 'Product' : 'Service',
                        name: addon.name,
                        category: addon.category || "",
                        subCategory: addon.subCategory || "",
                        quantity: parseInt(addon.quantity) || 1,
                        description: addon.description || "",
                        price: parseFloat(addon.price) || 0,
                        billingUnit: addon.billingUnit || "Per hour",
                        policyDocUrl: policyUrl,
                        mediaUrls: mediaUrls
                    });
                }

                const payload = {
                    packageItems: pavItems.map(item => ({
                        itemType: item.itemType,
                        contentDetails: {
                            categories: item.itemType === 'Videography' && item.resolution ? [item.resolution] : item.categories,
                            style: item.style,
                            quantity: parseInt(item.quantity) || 0,
                            description: item.description
                        },
                        albumSpecific: item.itemType === 'Albums/Hardcopy' ? {
                            coverType: item.coverType,
                            pageCount: parseInt(item.pageCount) || 0,
                            bindingType: item.bindingType,
                            pageFinish: item.pageFinish
                        } : undefined,
                        logisticsAndHandover: {
                            deliveryFormat: item.deliveryFormat,
                            deliveryMedium: item.deliveryMedium,
                            deliveryTimeline: item.deliveryTimeline,
                            isVisitingIncluded: item.isVisitingIncluded
                        }
                    })),
                    addOns: addonsPayload,
                    included: providedDetails.split('\n').map(s => s.trim()).filter(Boolean),
                    notIncluded: notProvidedDetails.split('\n').map(s => s.trim()).filter(Boolean)
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/2`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 2 (Deliverables).");
                setStep(3);
            } else if (step === 3) {
                // Upload Last Minute Doc
                let lastMinuteUrl = '';
                if (lastMinuteDocs.length > 0) {
                    const doc = lastMinuteDocs[0];
                    if (doc.file) {
                        const formData = new FormData(); formData.append('file', doc.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); lastMinuteUrl = data.url; }
                    } else if (doc.preview) lastMinuteUrl = doc.preview;
                }

                // Upload Policy Doc
                let policyUrl = '';
                if (policyDocs.length > 0) {
                    const doc = policyDocs[0];
                    if (doc.file) {
                        const formData = new FormData(); formData.append('file', doc.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); policyUrl = data.url; }
                    } else if (doc.preview) policyUrl = doc.preview;
                }

                // Upload Cancellation Doc
                let cancellationUrl = '';
                if (cancellationDocs.length > 0) {
                    const doc = cancellationDocs[0];
                    if (doc.file) {
                        const formData = new FormData(); formData.append('file', doc.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); cancellationUrl = data.url; }
                    } else if (doc.preview) cancellationUrl = doc.preview;
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
                    packagePricing: { price: parseFloat(packagePrice) || 0, billingUnit: packageChargeType },
                    teamAndEquipment: { price: parseFloat(teamPrice) || 0, billingUnit: teamChargeType },
                    overtimeCharges: { price: parseFloat(overtimeRate) || 0, billingUnit: 'Per Hour' },
                    gstInclusive: isGstInclusive,
                    dynamicPricing: dpPayload,
                    lastMinuteChargesDocUrl: lastMinuteUrl,
                    policiesDocUrl: policyUrl,
                    cancellationDocUrl: cancellationUrl
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/3`), {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 3 (Pricing)");
                setStep(4);
            } else if (step === 4) {
                const mediaPayload = [];
                for (const m of sampleMediaFiles) {
                    if (m.file) {
                        const formData = new FormData(); formData.append('file', m.file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) { const data = await res.json(); mediaPayload.push({ url: data.url, type: m.file.type.startsWith('video') ? 'video' : 'image', fileName: m.name, size: m.size }); }
                    } else if (m.preview && !m.preview.startsWith('blob:')) {
                        mediaPayload.push({ url: m.preview, type: 'image', fileName: m.name, size: m.size });
                    }
                }
                const payload = { media: mediaPayload };
                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/4`), {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 4 (Sample & Media)");
                
                // Final submission
                const submitRes = await fetch(apiUrl(`/packages/${currentPackageId}/submit`), { method: 'POST' });
                if (!submitRes.ok) throw new Error("Failed to submit package");
                localStorage.removeItem(`pav_active_step_${currentPackageId}`);
                sessionStorage.removeItem('draft_package_id_PAV');
                router.push('/dashboard/inventory');
            }
        } catch (err: any) {
            console.error("Step navigation error:", err);
            alert(err.message || "Something went wrong saving this step. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FlowShell
            config={FLOW_CONFIG}
            step={step}
            onBack={handleBack}
            onNext={handleNext}
            isSaving={isSaving}
            variants={variants.variants}
            selectedVariant={variants.selectedVariant}
            onSelectVariant={variants.setSelectedVariant}
            isAddingVariant={variants.isAddingVariant}
            newVariantName={variants.newVariantName}
            onSetNewVariantName={variants.setNewVariantName}
            onAddVariant={variants.handleAddVariant}
            onStartAddingVariant={() => variants.setIsAddingVariant(true)}
            isVariantModalOpen={variants.isVariantModalOpen}
            variantToManage={variants.variantToManage}
            variantAction={variants.variantAction}
            renameVariantValue={variants.renameVariantValue}
            onSetRenameVariantValue={variants.setRenameVariantValue}
            onOpenVariantModal={(v) => { variants.setVariantToManage(v); variants.setIsVariantModalOpen(true); }}
            onCloseVariantModal={() => variants.setIsVariantModalOpen(false)}
            onSetVariantAction={variants.setVariantAction}
            onDuplicateVariant={variants.handleDuplicateVariant}
            onRenameVariant={variants.handleRenameVariant}
            onDeleteVariant={variants.handleDeleteVariant}
        >
            {step === 1 && (
                <PAVStep1EventAndTeam
                    packageName={packageName} setPackageName={setPackageName}
                    eventCategories={eventCategories} setEventCategories={setEventCategories}
                    minDuration={minDuration} setMinDuration={setMinDuration}
                    maxDuration={maxDuration} setMaxDuration={setMaxDuration}
                    totalCrewSize={totalCrewSize} setTotalCrewSize={setTotalCrewSize}
                    photographersCount={photographersCount} setPhotographersCount={setPhotographersCount}
                    videographersCount={videographersCount} setVideographersCount={setVideographersCount}
                    otherRoles={otherRoles} setOtherRoles={setOtherRoles}
                    venueNeeds={venueNeeds} toggleVenueNeed={toggleVenueNeed}
                    venueRequest={venueRequest} setVenueRequest={setVenueRequest}
                    venueNeedsOptions={VENUE_NEEDS_OPTIONS}
                />
            )}
            {step === 2 && (
                <PAVStep2PackageAndItems
                    pavItems={pavItems} setPavItems={setPavItems}
                    addons={addons} handleOpenAddonForm={handleOpenAddonForm} handleEditAddon={handleEditAddon} deleteAddon={deleteAddon}
                    providedDetails={providedDetails} setProvidedDetails={setProvidedDetails}
                    notProvidedDetails={notProvidedDetails} setNotProvidedDetails={setNotProvidedDetails}
                    activeMenuDropdown={activeMenuDropdown} setActiveMenuDropdown={setActiveMenuDropdown}
                />
            )}
            {step === 3 && (
                <PAVStep3PricingAndPolicies
                    packageChargeType={packageChargeType} setPackageChargeType={setPackageChargeType}
                    packagePrice={packagePrice} setPackagePrice={setPackagePrice}
                    teamChargeType={teamChargeType} setTeamChargeType={setTeamChargeType}
                    teamPrice={teamPrice} setTeamPrice={setTeamPrice}
                    overtimeRate={overtimeRate} setOvertimeRate={setOvertimeRate}
                    isGstInclusive={isGstInclusive} setIsGstInclusive={setIsGstInclusive}
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
                    festivalPrices={festivalPrices} setFestivalPrices={setFestivalPrices}
                    customDatesPricing={customDatesPricing} setCustomDatesPricing={setCustomDatesPricing}
                    customDatesIncreaseType={customDatesIncreaseType} setCustomDatesIncreaseType={setCustomDatesIncreaseType}
                    customDatesValue={customDatesValue} setCustomDatesValue={setCustomDatesValue}
                    customDatesStartDate={customDatesStartDate} setCustomDatesStartDate={setCustomDatesStartDate}
                    customDatesEndDate={customDatesEndDate} setCustomDatesEndDate={setCustomDatesEndDate}
                    cancellationDocs={cancellationDocs} setCancellationDocs={setCancellationDocs}
                    lastMinuteDocs={lastMinuteDocs} setLastMinuteDocs={setLastMinuteDocs}
                    policyDocs={policyDocs} setPolicyDocs={setPolicyDocs}
                    pavItems={pavItems}
                    addons={addons}
                />
            )}
            {step === 4 && (
                <PAVStep4SampleAndMedia
                    sampleMediaFiles={sampleMediaFiles} setSampleMediaFiles={setSampleMediaFiles}
                />
            )}
            {isAddingAddon && (
                <AddonModal
                    isOpen={isAddingAddon}
                    vendorType="PAV"
                    addon={editingAddon}
                    onClose={() => { setIsAddingAddon(false); setEditingAddon(null); }}
                    onSave={handleSaveAddon}
                />
            )}
        </FlowShell>
    );
}
