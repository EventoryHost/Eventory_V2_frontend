'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import { AddonModal, Addon } from '../../components/AddonModal';
import { MakeupServiceItem, PolicyFile, SampleMediaFile } from '../../shared/types';
import MakeupStep1EventAndCrew from './Step1EventAndCrew';
import MakeupStep2PackageAndItems from './Step2PackageAndItems';
import MakeupStep3PriceAndPolicy, { defaultDynamicPricing, DynamicPricingState } from './Step3PriceAndPolicy';
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
                { name: 'Air Brush', price: '800 Rs' },
                { name: 'Matte Finish', price: '400 Rs' },
            ],
            brands: [
                { name: 'MAC', price: 'Included' },
                { name: 'HUDA', price: '800 Rs' },
                { name: 'Loreal', price: '400 Rs' },
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

    // --- Step 3 State ---
    const [packagePrice, setPackagePrice] = React.useState('');
    const [packageBillingUnit, setPackageBillingUnit] = React.useState('Per hour');
    const [overtimePrice, setOvertimePrice] = React.useState('');
    const [overtimeBillingUnit, setOvertimeBillingUnit] = React.useState('Per hour');
    const [teamPrice, setTeamPrice] = React.useState('');
    const [teamBillingUnit, setTeamBillingUnit] = React.useState('Per hour');
    const [dynamicPricing, setDynamicPricing] = React.useState(false);
    const [dynamicPricingState, setDynamicPricingState] = React.useState<DynamicPricingState>(defaultDynamicPricing());

    const [lastMinuteFiles, setLastMinuteFiles] = React.useState<PolicyFile[]>([]);
    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    const onLastMinuteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setLastMinuteFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size, file: f }))]);
        }
        if (lastMinuteInputRef.current) lastMinuteInputRef.current.value = '';
    };

    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const policyInputRef = React.useRef<HTMLInputElement>(null);
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPolicyFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size, file: f }))]);
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
                const draftRes = await fetch(`http://localhost:4000/api/packages/vendor/${vendorId}?status=Draft`);
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

                    // Populate Step 3 (Price and Policy)
                    if (pkg.step3_policiesAndCharges) {
                        const s3 = pkg.step3_policiesAndCharges;
                        if (s3.teamAndEquipment) {
                            setTeamPrice(String(s3.teamAndEquipment.price || ''));
                            setTeamBillingUnit(s3.teamAndEquipment.billingUnit || 'Per hour');
                        }
                        if (s3.overtimeCharges) {
                            setOvertimePrice(String(s3.overtimeCharges.price || ''));
                            setOvertimeBillingUnit(s3.overtimeCharges.billingUnit || 'Per hour');
                        }
                        if (s3.dynamicPricing) {
                            const dp = s3.dynamicPricing;
                            setDynamicPricing(!!(dp.weekends?.enabled || dp.weddingSeason?.enabled || dp.festivals?.enabled || dp.customDates?.enabled));
                            
                            const dynamicPricingState: DynamicPricingState = defaultDynamicPricing();
                            if (dp.weekends) {
                                dynamicPricingState.weekendsEnabled = !!dp.weekends.enabled;
                                dynamicPricingState.weekendPrice = String(dp.weekends.price || dp.weekends.percentage || '');
                                dynamicPricingState.weekendIncreaseType = dp.weekends.price ? 'Fixed Price' : 'Percentage';
                            }
                            if (dp.weddingSeason) {
                                dynamicPricingState.weddingSeasonEnabled = !!dp.weddingSeason.enabled;
                                dynamicPricingState.weddingSeasonPrice = String(dp.weddingSeason.percentage || '');
                            }
                            if (dp.festivals) {
                                dynamicPricingState.festivalsEnabled = !!dp.festivals.enabled;
                                dynamicPricingState.festivalsPrice = String(dp.festivals.percentage || '');
                            }
                            setDynamicPricingState(dynamicPricingState);
                        }
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
                const res = await fetch('http://localhost:4000/api/packages/initialize', {
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
                const initRes = await fetch('http://localhost:4000/api/packages/initialize', {
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
                        customText: venueRequest
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

                const res = await fetch(`http://localhost:4000/api/packages/${currentPackageId}/step/1`, {
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
                        const pf = addon.policies[0];
                        if (pf.file) {
                            const formData = new FormData();
                            formData.append('file', pf.file);
                            const uploadRes = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                policyUrl = uploadData.url || '';
                            }
                        }
                    }

                    const mediaUrls = [];
                    if (addon.media && addon.media.length > 0) {
                        for (const m of addon.media) {
                            if (m.file) {
                                const formData = new FormData();
                                formData.append('file', m.file);
                                const uploadRes = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData
                                });
                                if (uploadRes.ok) {
                                    const uploadData = await uploadRes.json();
                                    if (uploadData.url) mediaUrls.push(uploadData.url);
                                }
                            }
                        }
                    }

                    addonsPayload.push({
                        addOnType: addon.type === 'Product' ? 'Product' : 'Service',
                        name: addon.name,
                        category: addon.category || "Addon category",
                        subCategory: addon.subCategory || "Addon subcategory",
                        quantity: parseInt(addon.quantity) || 1,
                        description: addon.description || "",
                        price: parseFloat(addon.price) || 0,
                        billingUnit: addon.billingUnit || "Per Person",
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
                    addOns: addonsPayload
                };

                const res = await fetch(`http://localhost:4000/api/packages/${packageId}/step/2`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 2 (Service Items & Add-ons).");
                setStep(3);
            } else if (step === 3) {
                // Upload policies and last minute files to S3
                let lastMinuteDocUrl = '';
                if (lastMinuteFiles.length > 0 && lastMinuteFiles[0].file) {
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
                }

                let policyDocUrl = '';
                if (policyFiles.length > 0 && policyFiles[0].file) {
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
                }

                // Dynamically calculate percentages based on base packagePrice
                const base = parseFloat(packagePrice) || 0;

                let weekendPriceVal = parseFloat(dynamicPricingState.weekendPrice) || 0;
                let weekendPct = 0;
                if (base > 0 && weekendPriceVal > base) {
                    weekendPct = Math.round(((weekendPriceVal - base) / base) * 100);
                }

                let seasonPriceVal = parseFloat(dynamicPricingState.weddingSeasonPrice) || 0;
                let seasonPct = 0;
                if (base > 0 && seasonPriceVal > base) {
                    seasonPct = Math.round(((seasonPriceVal - base) / base) * 100);
                }

                let festivalPriceVal = parseFloat(dynamicPricingState.festivalsPrice) || 0;
                let festivalPct = 0;
                if (base > 0 && festivalPriceVal > base) {
                    festivalPct = Math.round(((festivalPriceVal - base) / base) * 100);
                }

                const payload = {
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
                            enabled: dynamicPricingState.weekendsEnabled,
                            price: weekendPriceVal,
                            percentage: weekendPct
                        },
                        weddingSeason: {
                            enabled: dynamicPricingState.weddingSeasonEnabled,
                            percentage: seasonPct
                        },
                        festivals: {
                            enabled: dynamicPricingState.festivalsEnabled,
                            percentage: festivalPct
                        },
                        customDates: {
                            enabled: dynamicPricingState.customDatesEnabled,
                            percentage: 0
                        }
                    }
                };

                const res = await fetch(`http://localhost:4000/api/packages/${packageId}/step/3`, {
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
                        dynamicPricing={dynamicPricing} setDynamicPricing={setDynamicPricing}
                        dynamicPricingState={dynamicPricingState} setDynamicPricingState={setDynamicPricingState}
                        lastMinuteFiles={lastMinuteFiles}
                        lastMinuteInputRef={lastMinuteInputRef}
                        onLastMinuteUpload={onLastMinuteUpload}
                        removeLastMinuteFile={(idx) => setLastMinuteFiles(prev => prev.filter((_, i) => i !== idx))}
                        policyFiles={policyFiles}
                        policyInputRef={policyInputRef}
                        onPolicyUpload={onPolicyUpload}
                        removePolicyFile={(idx) => setPolicyFiles(prev => prev.filter((_, i) => i !== idx))}
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
