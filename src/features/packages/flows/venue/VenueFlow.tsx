'use client';
import { apiUrl } from '@/lib/api';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import VenueStep1PackageAndTeam from './Step1PackageAndTeam';
import VenueStep2SpacesAndItems, { VenueSpace } from './Step2SpacesAndItems';
import VenueStep3PricingAndPolicies, { DynamicPrice } from './Step3PricingAndPolicies';
import VenueStep4SampleMedia from './Step4SampleMedia';
import { Addon } from '../../components/AddonModal';
import { PolicyFile, SampleMediaFile } from '../../shared/types';

const FLOW_CONFIG = {
    vendorName: 'Venue Provider',
    steps: ['Your Package & Team', 'Package and Items', 'Policies and Charges', 'Sample and Media'],
};

export default function VenueFlow() {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

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
    const [dynamicPrices, setDynamicPrices] = React.useState<DynamicPrice[]>([]);
    const [lastMinuteDocs, setLastMinuteDocs] = React.useState<PolicyFile[]>([]);
    const [policyDocs, setPolicyDocs] = React.useState<PolicyFile[]>([]);

    // --- Step 4 State ---
    const [spaceMedia, setSpaceMedia] = React.useState<Record<string, SampleMediaFile[]>>({});

    // Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const isInitializing = React.useRef(false);
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

                if (draftData.status === 'SUCCESS' && draftData.packages && draftData.packages.length > 0) {
                    const venueDrafts = draftData.packages.filter((p: any) => p.vendorType === 'VEN');
                    if (venueDrafts.length > 0) {
                        const pkg = venueDrafts[0];
                        setPackageId(pkg._id);
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
                                    policies: a.policyDocUrl ? [{ name: 'Existing Policy', size: 0, preview: a.policyDocUrl } as any] : [],
                                    media: (a.mediaUrls || []).map((url: string) => ({ name: 'Media File', size: 0, file: null, preview: url })),
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
                            if (s3.dynamicPricing) {
                                setDynamicPrices(s3.dynamicPricing.map((dp: any) => ({
                                    id: dp._id || Math.random().toString(36).substring(7),
                                    fromDate: dp.fromDate?.split('T')[0] || '',
                                    toDate: dp.toDate?.split('T')[0] || '',
                                    price: String(dp.price || '')
                                })));
                            }
                            if (s3.policies) {
                                if (s3.policies.lastMinuteChangePolicy) {
                                    setLastMinuteDocs(s3.policies.lastMinuteChangePolicy.map((doc: any) => ({
                                        name: doc.name || 'Policy Document',
                                        size: 0,
                                        preview: doc.url,
                                        url: doc.url
                                    })));
                                }
                                if (s3.policies.cancellationPolicy) {
                                    setPolicyDocs(s3.policies.cancellationPolicy.map((doc: any) => ({
                                        name: doc.name || 'Policy Document',
                                        size: 0,
                                        preview: doc.url,
                                        url: doc.url
                                    })));
                                }
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
                        vendorType: 'VEN',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    sessionStorage.setItem('draft_package_id_VEN', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing Venue package draft:", err);
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
                        vendorType: 'VEN',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    sessionStorage.setItem('draft_package_id_VEN', initData.packageId);
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
                const allAddons = [
                    ...inHouseServices.map(a => ({ ...a, mappedType: 'InHouseService' })),
                    ...addons.map(a => ({ ...a, mappedType: a.type === 'Product' ? 'Product' : 'Service' }))
                ];

                const addonsPayload = [];
                for (const addon of allAddons) {
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
                        addOnType: addon.mappedType,
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
                    packageItems: spaces.map(space => ({
                        itemType: space.billingUnit,
                        contentDetails: {
                            description: space.name,
                            categories: [space.type],
                            quantity: parseInt(space.area) || 0,
                            style: space.layout
                        },
                        albumSpecific: {
                            pageCount: parseInt(space.height) || 0,
                            coverType: space.heightUnit,
                            pageFinish: space.activities.join(','),
                            bindingType: space.amenities.join(','),
                            price: parseFloat(space.price) || 0
                        },
                        logisticsAndHandover: {
                            deliveryFormat: space.areaUnit,
                            deliveryMedium: space.environment,
                            deliveryTimeline: `${space.capacityStanding},${space.capacitySitting},${space.capacityDining}`
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
                        } else if (f.url || f.preview) {
                            urls.push({ url: f.url || f.preview, name: f.name });
                        }
                    }
                    return urls;
                };

                const lastMinuteUrls = await uploadFiles(lastMinuteDocs);
                const policyUrls = await uploadFiles(policyDocs);

                const payload = {
                    pricing: {
                        packagePricing: { chargeType: packageChargeType, price: parseFloat(packagePrice) || 0 },
                        teamAndEquipment: { chargeType: teamChargeType, price: parseFloat(teamPrice) || 0 },
                        overtimeRate: parseFloat(overtimeRate) || 0,
                    },
                    dynamicPricing: dynamicPrices,
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
                
                // Final submission API call
                const submitRes = await fetch(apiUrl(`/packages/${currentPackageId}/status`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Under Review' })
                });
                
                if (!submitRes.ok) throw new Error("Failed to submit package for review.");
                
                alert("Venue Package successfully submitted for review!");
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
            {step === 2 && (
                <VenueStep2SpacesAndItems
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
                    dynamicPrices={dynamicPrices} setDynamicPrices={setDynamicPrices}
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
