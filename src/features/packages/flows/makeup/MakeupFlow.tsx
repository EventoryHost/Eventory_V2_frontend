'use client';
import { apiUrl } from '@/lib/api';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import { AddonModal, Addon } from '../../components/AddonModal';
import { MakeupServiceItem, PolicyFile, SampleMediaFile } from '../../shared/types';
import MakeupStep1EventAndCrew from './Step1EventAndCrew';
import MakeupStep2PackageAndItems from './Step2PackageAndItems';
import MakeupStep3PriceAndPolicy from './Step3PriceAndPolicy';
import MakeupStep4SampleAndMedia from './Step4SampleAndMedia';

const FLOW_CONFIG = {
    vendorName: 'Makeup Artist',
    steps: ['Event and Crew', 'Package and Items', 'Package Price and Policy', 'Sample and Media'],
};

const VENUE_NEEDS_OPTIONS = ['Power', 'AC', 'Stage', 'Lighting', 'Security'];

export default function MakeupFlow() {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // --- Step 1 State ---
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [teamDurationPerPerson, setTeamDurationPerPerson] = React.useState('');
    const [teamDurationOfSetup, setTeamDurationOfSetup] = React.useState('');
    const [teamMinPeople, setTeamMinPeople] = React.useState('');
    const [teamMaxPeople, setTeamMaxPeople] = React.useState('');
    const [trialOffered, setTrialOffered] = React.useState('Yes');
    const [parallelServicing, setParallelServicing] = React.useState('Yes');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');

    const toggleVenueNeed = (need: string) =>
        setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);

    // --- Step 2 State ---
    const [makeupItems, setMakeupItems] = React.useState<MakeupServiceItem[]>([]);
    const [isItemTypeModalOpen, setIsItemTypeModalOpen] = React.useState(false);
    const [selectedItemType, setSelectedItemType] = React.useState<string | null>(null);
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);

    const handleAddMakeupItem = () => {
        if (!selectedItemType) return;
        const newItem: MakeupServiceItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedItemType,
            isExpanded: true,
            options: [
                { name: 'HD Makeup', price: 'Included' },
            ],
            brands: [
                { name: 'MAC', price: 'Included' },
            ],
            allowCustomInput: 'Yes',
        };
        setMakeupItems(prev => [...prev, newItem]);
        setIsItemTypeModalOpen(false);
        setSelectedItemType(null);
    };

    const toggleMakeupItemExpand = (id: string) =>
        setMakeupItems(prev => prev.map(item => item.id === id ? { ...item, isExpanded: !item.isExpanded } : item));

    const updateMakeupItemType = (id: string, type: string) =>
        setMakeupItems(prev => prev.map(item => item.id === id ? { ...item, type } : item));

    const updateMakeupItem = (itemId: string, field: 'options' | 'brands', index: number, sub: 'name' | 'price', value: string) =>
        setMakeupItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const newList = [...item[field]];
            newList[index] = { ...newList[index], [sub]: value };
            return { ...item, [field]: newList };
        }));

    const handleMakeupPriceBlur = (itemId: string, field: 'options' | 'brands', index: number, value: string) => {
        const lower = value.toLowerCase();
        if (/^[\d\srs]+$/.test(lower)) {
            const digits = value.replace(/\D/g, '');
            if (digits) updateMakeupItem(itemId, field, index, 'price', `${digits} Rs`);
        }
    };

    const addMakeupItemOptionOrBrand = (itemId: string, field: 'options' | 'brands') =>
        setMakeupItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, [field]: [...item[field], { name: '', price: '' }] } : item
        ));

    const removeMakeupItemOptionOrBrand = (itemId: string, field: 'options' | 'brands', index: number) =>
        setMakeupItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const newList = [...item[field]];
            newList.splice(index, 1);
            return { ...item, [field]: newList };
        }));

    const setMakeupItemCustomInput = (itemId: string, value: 'Yes' | 'No') =>
        setMakeupItems(prev => prev.map(item => item.id === itemId ? { ...item, allowCustomInput: value } : item));

    const deleteMakeupItem = (id: string) =>
        setMakeupItems(prev => prev.filter(item => item.id !== id));

    // Addons
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [isAddingAddon, setIsAddingAddon] = React.useState(false);
    const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);

    const handleOpenAddonForm = () => { setEditingAddon(null); setIsAddingAddon(true); };
    const handleEditAddon = (addon: Addon) => { setEditingAddon(addon); setIsAddingAddon(true); setActiveMenuDropdown(null); };
    const handleSaveAddon = (saved: Addon) => {
        if (editingAddon) {
            setAddons(prev => prev.map(a => a.id === saved.id ? saved : a));
        } else {
            setAddons(prev => [...prev, saved]);
        }
        setIsAddingAddon(false);
        setEditingAddon(null);
    };
    const deleteAddon = (id: string) => setAddons(prev => prev.filter(a => a.id !== id));

    const [notProvidedDetails, setNotProvidedDetails] = React.useState('');
    const [providedDetails, setProvidedDetails] = React.useState('');

    // --- Step 3 State ---
    const [packagePrice, setPackagePrice] = React.useState('');
    const [packageBillingUnit, setPackageBillingUnit] = React.useState('Per hour');
    const [overtimePrice, setOvertimePrice] = React.useState('');
    const [overtimeBillingUnit, setOvertimeBillingUnit] = React.useState('Per hour');
    const [teamPrice, setTeamPrice] = React.useState('');
    const [teamBillingUnit, setTeamBillingUnit] = React.useState('Per hour');
    const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = React.useState(false);
    const [weekendPricing, setWeekendPricing] = React.useState(false);
    const [weekendIncreaseType, setWeekendIncreaseType] = React.useState('Percentage');
    const [weekendValue, setWeekendValue] = React.useState('10');
    const [weekendDays, setWeekendDays] = React.useState<string[]>(['Saturday', 'Sunday']);
    const [weekendSeason, setWeekendSeason] = React.useState(false);
    const [seasonIncreaseType, setSeasonIncreaseType] = React.useState('Percentage');
    const [seasonValue, setSeasonValue] = React.useState('15');
    const [festivalPricing, setFestivalPricing] = React.useState(false);
    const [selectedFestivals, setSelectedFestivals] = React.useState<string[]>([]);
    const [availableFestivals, setAvailableFestivals] = React.useState<string[]>(['Diwali', 'Holi', 'Navratri']);
    const [isAddingFestival, setIsAddingFestival] = React.useState(false);
    const [newFestivalName, setNewFestivalName] = React.useState('');
    const [customDatesPricing, setCustomDatesPricing] = React.useState(false);
    const [customDatesIncreaseType, setCustomDatesIncreaseType] = React.useState('Percentage');
    const [customDatesValue, setCustomDatesValue] = React.useState('10');
    const [customDatesStartDate, setCustomDatesStartDate] = React.useState('');
    const [customDatesEndDate, setCustomDatesEndDate] = React.useState('');
    const [festivalPrices, setFestivalPrices] = React.useState<Record<string, { increaseType: string; value: string }>>({});

    const handleAddFestival = () => {
        if (newFestivalName.trim() && !availableFestivals.includes(newFestivalName.trim())) {
            setAvailableFestivals(prev => [...prev, newFestivalName.trim()]);
            setSelectedFestivals(prev => [...prev, newFestivalName.trim()]);
            setNewFestivalName('');
            setIsAddingFestival(false);
        }
    };

    const [lastMinuteFiles, setLastMinuteFiles] = React.useState<PolicyFile[]>([]);
    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    const onLastMinuteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).map(f => ({
                file: f, name: f.name, size: f.size, preview: URL.createObjectURL(f)
            }));
            setLastMinuteFiles(prev => [...prev, ...files]);
        }
        if (lastMinuteInputRef.current) lastMinuteInputRef.current.value = '';
    };

    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const policyInputRef = React.useRef<HTMLInputElement>(null);
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).map(f => ({
                file: f, name: f.name, size: f.size, preview: URL.createObjectURL(f)
            }));
            setPolicyFiles(prev => [...prev, ...files]);
        }
        if (policyInputRef.current) policyInputRef.current.value = '';
    };

    // --- Step 4 State ---
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);
    const onSampleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).map(file => ({
                file, name: file.name, size: file.size, preview: URL.createObjectURL(file),
            }));
            setSampleMediaFiles(prev => [...prev, ...files]);
        }
        if (sampleMediaInputRef.current) sampleMediaInputRef.current.value = '';
    };
    const removeSampleMediaFile = (idx: number) => {
        setSampleMediaFiles(prev => {
            const next = [...prev];
            URL.revokeObjectURL(next[idx].preview);
            next.splice(idx, 1);
            return next;
        });
    };

    // Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const isInitializing = React.useRef(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Save current step to localStorage to preserve state on reload
    React.useEffect(() => {
        if (packageId) {
            localStorage.setItem(`makeup_active_step_${packageId}`, String(step));
        }
    }, [step, packageId]);

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
                const draftRes = await fetch(apiUrl(`/packages/vendor/${vendorId}?status=Draft`));
                const draftData = await draftRes.json();
                
                if (draftData.status === 'SUCCESS' && draftData.packages && draftData.packages.length > 0) {
                    // Load the first active draft package
                    const pkg = draftData.packages[0];
                    setPackageId(pkg._id);
                    sessionStorage.setItem('draft_package_id_Makeup', pkg._id);
                    
                    // Populate Step 1 (Event & Crew)
                    if (pkg.step1_eventAndCrew) {
                        const s1 = pkg.step1_eventAndCrew;
                        setPackageName(s1.packageName || '');
                        if (s1.eventCategories) setEventCategories(s1.eventCategories.join(', '));
                        if (s1.durationPerPerson) setTeamDurationPerPerson(String(s1.durationPerPerson));
                        if (s1.durationOfSetup) setTeamDurationOfSetup(String(s1.durationOfSetup));
                        if (s1.crewSize) {
                            setTeamMinPeople(String(s1.crewSize.minPeople || ''));
                            setTeamMaxPeople(String(s1.crewSize.maxPeople || ''));
                        }
                        setTrialOffered(s1.trialOffered ? 'Yes' : 'No');
                        setParallelServicing(s1.parallelServicingPossible ? 'Yes' : 'No');
                        
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
                        if (s2.items) {
                            setMakeupItems(s2.items.map((it: any) => ({
                                id: it._id || Math.random().toString(36).substr(2, 9),
                                type: it.name || '',
                                isExpanded: false,
                                options: (it.options || []).map((o: any) => ({
                                    name: o.name || '',
                                    price: o.price ? `${o.price} Rs` : 'Included'
                                })),
                                brands: (it.brands || []).map((b: any) => ({
                                    name: b.name || '',
                                    price: b.price ? `${b.price} Rs` : 'Included'
                                })),
                                allowCustomInput: it.allowCustomInput ? 'Yes' : 'No'
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
                                productType: a.productType || 'Food'
                            })));
                        }
                        if (s2.notIncluded) setNotProvidedDetails(s2.notIncluded.map((s: string) => `• ${s}`).join('\n'));
                        if (s2.included) setProvidedDetails(s2.included.map((s: string) => `• ${s}`).join('\n'));
                    }

                    // Populate Step 3 (Price and Policy)
                    if (pkg.step3_policiesAndCharges) {
                        const s3 = pkg.step3_policiesAndCharges;
                        if (s3.packagePricing) {
                            setPackagePrice(String(s3.packagePricing.price || ''));
                            setPackageBillingUnit(s3.packagePricing.billingUnit || 'Per hour');
                        }
                        if (s3.teamAndEquipment) {
                            setTeamPrice(String(s3.teamAndEquipment.price || ''));
                            setTeamBillingUnit(s3.teamAndEquipment.billingUnit || 'Per hour');
                        }
                        if (s3.overtimeCharges) {
                            setOvertimePrice(String(s3.overtimeCharges.price || ''));
                            setOvertimeBillingUnit(s3.overtimeCharges.billingUnit || 'Per hour');
                        }
                        if (s3.lastMinuteChargesDocUrl) {
                            setLastMinuteFiles([{ name: 'Existing Last Minute Charges', size: 0, preview: s3.lastMinuteChargesDocUrl } as any]);
                        }
                        if (s3.policiesDocUrl) {
                            setPolicyFiles([{ name: 'Existing Policy Document', size: 0, preview: s3.policiesDocUrl } as any]);
                        }
                        if (s3.dynamicPricing) {
                            const dp = s3.dynamicPricing;
                            setIsDynamicPricingEnabled(!!(dp.weekends?.enabled || dp.weddingSeason?.enabled || dp.festivals?.enabled || dp.customDates?.enabled));
                            const basePrice = s3.packagePricing?.price || 0;
                            if (dp.weekends) {
                                setWeekendPricing(!!dp.weekends.enabled);
                                const isFixed = dp.weekends.price !== undefined && dp.weekends.price !== null && dp.weekends.price >= 0;
                                setWeekendIncreaseType(isFixed && dp.weekends.percentage === 0 ? 'Fixed Price' : 'Percentage');
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
                    
                    // Automatically route to next uncompleted step, prioritizing last viewed step
                    const savedStep = localStorage.getItem(`makeup_active_step_${pkg._id}`);
                    if (savedStep) {
                        setStep(parseInt(savedStep));
                    } else if (pkg.completedSteps && pkg.completedSteps.length > 0) {
                        const nextStep = Math.min(4, Math.max(...pkg.completedSteps) + 1);
                        setStep(nextStep);
                    }
                    return;
                }

                // 2. Fallback: Initialize a fresh draft if no draft package exists
                const res = await fetch(apiUrl('/packages/initialize'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: 'MakeupArtist',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    sessionStorage.setItem('draft_package_id_Makeup', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing package draft:", err);
            }
        };
        initOrRestorePackage();
    }, []);

    // --- Navigation ---
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
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
                        vendorType: 'MakeupArtist',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    sessionStorage.setItem('draft_package_id_Makeup', initData.packageId);
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
                    packageName: packageName || `${variants.selectedVariant} Makeup Package`,
                    eventCategories: eventCategories ? eventCategories.split(',').map(s => s.trim()) : ['Makeup'],
                    poc: pocName,
                    tastingSession: trialOffered === 'Yes',
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
                    },
                    // Makeup Artist specific fields
                    durationPerPerson: parseInt(teamDurationPerPerson) || 0,
                    durationOfSetup: parseInt(teamDurationOfSetup) || 0,
                    trialOffered: trialOffered === 'Yes',
                    parallelServicingPossible: parallelServicing === 'Yes',
                    crewSize: {
                        minPeople: parseInt(teamMinPeople) || 1,
                        maxPeople: parseInt(teamMaxPeople) || 1,
                        roles: ["Makeup Artist"]
                    }
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/1`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 1 (Event & Crew).");
                setStep(2);
            } else if (step === 2) {
                if (makeupItems.length === 0) {
                    alert("Please add at least one makeup service item.");
                    setIsSaving(false);
                    return;
                }

                // Upload any addon policies & media to S3
                const addonsPayload = [];
                for (const addon of addons) {
                    let policyUrl = '';
                    if (addon.policies && addon.policies.length > 0) {
                        const pf = addon.policies[0] as any;
                        if (pf.file) {
                            const formData = new FormData();
                            formData.append('file', pf.file);
                            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                            if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                policyUrl = uploadData.url || '';
                            }
                        } else if (pf.url) {
                            policyUrl = pf.url;
                        }
                    }

                    const mediaUrls = [];
                    if (addon.media && addon.media.length > 0) {
                        for (const m of addon.media) {
                            if (m.file) {
                                const formData = new FormData();
                                formData.append('file', m.file);
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
                    items: makeupItems.map(item => ({
                        name: item.type,
                        itemType: ["Makeup", "Hair", "Skin & Spa", "Mehendi", "Nail", "Other"].includes(item.type) ? item.type : "Makeup",
                        options: item.options.map(opt => ({
                            name: opt.name,
                            price: parseInt(opt.price.replace(/\D/g, '')) || 0
                        })),
                        brands: item.brands.map(brand => ({
                            name: brand.name,
                            price: parseInt(brand.price.replace(/\D/g, '')) || 0
                        })),
                        allowCustomInput: item.allowCustomInput === 'Yes'
                    })),
                    addOns: addonsPayload,
                    included: providedDetails.split('\n').map(s => s.replace(/^•\s*/, '').trim()).filter(Boolean),
                    notIncluded: notProvidedDetails.split('\n').map(s => s.replace(/^•\s*/, '').trim()).filter(Boolean)
                };

                const res = await fetch(apiUrl(`/packages/${packageId}/step/2`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 2 (Service Items & Add-ons).");
                setStep(3);
            } else if (step === 3) {
                // Upload policies and last minute files to S3
                let lastMinuteDocUrl = '';
                if (lastMinuteFiles.length > 0) {
                    if (lastMinuteFiles[0].file) {
                        const formData = new FormData();
                        formData.append('file', lastMinuteFiles[0].file);
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            lastMinuteDocUrl = uploadData.url || '';
                        }
                    } else if (lastMinuteFiles[0].preview) {
                        lastMinuteDocUrl = lastMinuteFiles[0].preview;
                    }
                }

                let policyDocUrl = '';
                if (policyFiles.length > 0) {
                    if (policyFiles[0].file) {
                        const formData = new FormData();
                        formData.append('file', policyFiles[0].file);
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            policyDocUrl = uploadData.url || '';
                        }
                    } else if (policyFiles[0].preview) {
                        policyDocUrl = policyFiles[0].preview;
                    }
                }

                const payload = {
                    packagePricing: {
                        price: parseFloat(packagePrice) || 0,
                        billingUnit: packageBillingUnit,
                        noOfPeople: "1 person"
                    },
                    teamAndEquipment: {
                        price: parseFloat(teamPrice) || 0,
                        billingUnit: teamBillingUnit
                    },
                    lastMinuteChargesDocUrl: lastMinuteDocUrl,
                    policiesDocUrl: policyDocUrl,
                    overtimeCharges: {
                        price: parseFloat(overtimePrice) || 0,
                        billingUnit: overtimeBillingUnit
                    },
                    dynamicPricing: {
                        weekends: {
                            enabled: weekendPricing,
                            price: weekendIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(weekendValue) || 0) - (parseFloat(packagePrice) || 20000)) : 0,
                            percentage: weekendIncreaseType === 'Percentage' ? (parseFloat(weekendValue) || 0) : 0
                        },
                        weddingSeason: {
                            enabled: weekendSeason,
                            price: seasonIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(seasonValue) || 0) - (parseFloat(packagePrice) || 20000)) : 0,
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
                                        price: spec.increaseType === 'Fixed Price' ? Math.max(0, (parseFloat(spec.value) || 0) - (parseFloat(packagePrice) || 20000)) : 0,
                                        percentage: spec.increaseType === 'Percentage' ? (parseFloat(spec.value) || 0) : 0
                                    }
                                ])
                            )
                        },
                        customDates: {
                            enabled: customDatesPricing,
                            price: customDatesIncreaseType === 'Fixed Price' ? Math.max(0, (parseFloat(customDatesValue) || 0) - (parseFloat(packagePrice) || 20000)) : 0,
                            percentage: customDatesIncreaseType === 'Percentage' ? (parseFloat(customDatesValue) || 0) : 0,
                            startDate: customDatesStartDate,
                            endDate: customDatesEndDate
                        }
                    }
                };

                const res = await fetch(apiUrl(`/packages/${packageId}/step/3`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 3 (Pricing & Policies).");
                setStep(4);
            } else if (step === 4) {
                // Upload sample media files to S3 (or reuse URL if already uploaded)
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
                        const type: 'image' | 'video' =
                            smf.mediaType ||
                            (smf.preview.toLowerCase().match(/\.(mp4|webm|mov|m4v)(\?|#|$)/i) ? 'video' : 'image');
                        mediaPayload.push({
                            url: smf.preview,
                            type,
                            fileName: smf.name,
                            size: smf.size
                        });
                    }
                }

                const resStep4 = await fetch(apiUrl(`/packages/${packageId}/step/4`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ media: mediaPayload })
                });
                if (!resStep4.ok) throw new Error("Failed to save Step 4 (Media files).");

                // Submit package
                const resSubmit = await fetch(apiUrl(`/packages/${packageId}/submit`), {
                    method: 'POST'
                });
                if (!resSubmit.ok) {
                    const errorData = await resSubmit.json();
                    throw new Error(errorData.errors ? errorData.errors.join(", ") : errorData.message || "Failed to submit package");
                }

                sessionStorage.removeItem('draft_package_id_Makeup');
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
        <>
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
                    <MakeupStep1EventAndCrew
                        packageName={packageName} setPackageName={setPackageName}
                        eventCategories={eventCategories} setEventCategories={setEventCategories}
                        teamDurationPerPerson={teamDurationPerPerson} setTeamDurationPerPerson={setTeamDurationPerPerson}
                        teamDurationOfSetup={teamDurationOfSetup} setTeamDurationOfSetup={setTeamDurationOfSetup}
                        teamMinPeople={teamMinPeople} setTeamMinPeople={setTeamMinPeople}
                        teamMaxPeople={teamMaxPeople} setTeamMaxPeople={setTeamMaxPeople}
                        trialOffered={trialOffered} setTrialOffered={setTrialOffered}
                        parallelServicing={parallelServicing} setParallelServicing={setParallelServicing}
                        venueNeeds={venueNeeds} toggleVenueNeed={toggleVenueNeed}
                        venueRequest={venueRequest} setVenueRequest={setVenueRequest}
                        venueNeedsOptions={VENUE_NEEDS_OPTIONS}
                    />
                )}

                {step === 2 && (
                    <MakeupStep2PackageAndItems
                        makeupItems={makeupItems}
                        isItemTypeModalOpen={isItemTypeModalOpen}
                        setIsItemTypeModalOpen={setIsItemTypeModalOpen}
                        selectedItemType={selectedItemType}
                        setSelectedItemType={setSelectedItemType}
                        handleAddMakeupItem={handleAddMakeupItem}
                        toggleMakeupItemExpand={toggleMakeupItemExpand}
                        updateMakeupItemType={updateMakeupItemType}
                        updateMakeupItem={updateMakeupItem}
                        handleMakeupPriceBlur={handleMakeupPriceBlur}
                        addMakeupItemOptionOrBrand={addMakeupItemOptionOrBrand}
                        removeMakeupItemOptionOrBrand={removeMakeupItemOptionOrBrand}
                        setMakeupItemCustomInput={setMakeupItemCustomInput}
                        deleteMakeupItem={deleteMakeupItem}
                        activeMenuDropdown={activeMenuDropdown}
                        setActiveMenuDropdown={setActiveMenuDropdown}
                        addons={addons}
                        handleOpenAddonForm={handleOpenAddonForm}
                        handleEditAddon={handleEditAddon}
                        deleteAddon={deleteAddon}
                        notProvidedDetails={notProvidedDetails}
                        setNotProvidedDetails={setNotProvidedDetails}
                        providedDetails={providedDetails}
                        setProvidedDetails={setProvidedDetails}
                    />
                )}

                {step === 3 && (
                    <MakeupStep3PriceAndPolicy
                        packagePrice={packagePrice} setPackagePrice={setPackagePrice}
                        packageBillingUnit={packageBillingUnit} setPackageBillingUnit={setPackageBillingUnit}
                        overtimePrice={overtimePrice} setOvertimePrice={setOvertimePrice}
                        overtimeBillingUnit={overtimeBillingUnit} setOvertimeBillingUnit={setOvertimeBillingUnit}
                        teamPrice={teamPrice} setTeamPrice={setTeamPrice}
                        teamBillingUnit={teamBillingUnit} setTeamBillingUnit={setTeamBillingUnit}
                        isDynamicPricingEnabled={isDynamicPricingEnabled} setIsDynamicPricingEnabled={setIsDynamicPricingEnabled}
                        weekendPricing={weekendPricing} setWeekendPricing={setWeekendPricing}
                        weekendIncreaseType={weekendIncreaseType} setWeekendIncreaseType={setWeekendIncreaseType}
                        weekendValue={weekendValue} setWeekendValue={setWeekendValue}
                        weekendDays={weekendDays} setWeekendDays={setWeekendDays}
                        weekendSeason={weekendSeason} setWeekendSeason={setWeekendSeason}
                        seasonIncreaseType={seasonIncreaseType} setSeasonIncreaseType={setSeasonIncreaseType}
                        seasonValue={seasonValue} setSeasonValue={setSeasonValue}
                        festivalPricing={festivalPricing} setFestivalPricing={setFestivalPricing}
                        selectedFestivals={selectedFestivals} setSelectedFestivals={setSelectedFestivals}
                        availableFestivals={availableFestivals}
                        isAddingFestival={isAddingFestival} setIsAddingFestival={setIsAddingFestival}
                        newFestivalName={newFestivalName} setNewFestivalName={setNewFestivalName}
                        handleAddFestival={handleAddFestival}
                        customDatesPricing={customDatesPricing} setCustomDatesPricing={setCustomDatesPricing}
                        customDatesIncreaseType={customDatesIncreaseType} setCustomDatesIncreaseType={setCustomDatesIncreaseType}
                        customDatesValue={customDatesValue} setCustomDatesValue={setCustomDatesValue}
                        customDatesStartDate={customDatesStartDate} setCustomDatesStartDate={setCustomDatesStartDate}
                        customDatesEndDate={customDatesEndDate} setCustomDatesEndDate={setCustomDatesEndDate}
                        festivalPrices={festivalPrices} setFestivalPrices={setFestivalPrices}
                        lastMinuteFiles={lastMinuteFiles}
                        lastMinuteInputRef={lastMinuteInputRef}
                        onLastMinuteUpload={onLastMinuteUpload}
                        removeLastMinuteFile={(idx: number) => setLastMinuteFiles(prev => prev.filter((_, i) => i !== idx))}
                        policyFiles={policyFiles}
                        policyInputRef={policyInputRef}
                        onPolicyUpload={onPolicyUpload}
                        removePolicyFile={(idx: number) => setPolicyFiles(prev => prev.filter((_, i) => i !== idx))}
                    />
                )}

                {step === 4 && (
                    <MakeupStep4SampleAndMedia
                        sampleMediaFiles={sampleMediaFiles}
                        sampleMediaInputRef={sampleMediaInputRef}
                        onSampleMediaUpload={onSampleMediaUpload}
                        removeSampleMediaFile={removeSampleMediaFile}
                    />
                )}
            </FlowShell>

            <AddonModal
                isOpen={isAddingAddon}
                onClose={() => setIsAddingAddon(false)}
                onSave={handleSaveAddon}
                vendorType="MAK"
                addon={editingAddon}
            />
        </>
    );
}
