'use client';
import { apiUrl } from '@/lib/api';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import DJStep1EventAndTeam from './Step1EventAndTeam';
import DJStep2PackageAndItems, { DJItem } from './Step2PackageAndItems';
import DJStep3PricingAndPolicies from './Step3PricingAndPolicies';
import DJStep4SampleAndMedia from './Step4SampleAndMedia';
import { AddonModal, Addon } from '../../components/AddonModal';
import { GuestTier, PolicyFile, SampleMediaFile } from '../../shared/types';

const FLOW_CONFIG = {
    vendorName: 'DJ Artist',
    steps: ['Event & Team', 'Package and Items', 'Package Price and Policy', 'Sample and Media'],
};

const VENUE_NEEDS_OPTIONS = ['Power', 'Camera', 'Stage', 'Lighting', 'Security'];

export default function DJFlow() {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // --- Step 1 State ---
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [minDuration, setMinDuration] = React.useState('');
    const [maxDuration, setMaxDuration] = React.useState('');
    const [minGuestCount, setMinGuestCount] = React.useState('');
    const [maxGuestCount, setMaxGuestCount] = React.useState('');
    const [totalCrewSize, setTotalCrewSize] = React.useState(4);
    const [performingArtistCount, setPerformingArtistCount] = React.useState('');
    const [supportingCrewCount, setSupportingCrewCount] = React.useState('');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');
    const [siteVisitProvided, setSiteVisitProvided] = React.useState(false);

    const toggleVenueNeed = (need: string) =>
        setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);

    // --- Step 2 State ---
    const [djItems, setDjItems] = React.useState<DJItem[]>([]);
    
    // Playlists State
    const [playlists, setPlaylists] = React.useState<any[]>([]);
    const [customerPlaylistAllowed, setCustomerPlaylistAllowed] = React.useState(false);
    const [guestRequestsAllowed, setGuestRequestsAllowed] = React.useState(false);

    // Equipments State
    const [equipments, setEquipments] = React.useState<any[]>([]);
    const [hasBackupEquipment, setHasBackupEquipment] = React.useState(false);
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [isAddingAddon, setIsAddingAddon] = React.useState(false);
    const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);
    const [providedDetails, setProvidedDetails] = React.useState('');
    const [notProvidedDetails, setNotProvidedDetails] = React.useState('');

    const handleAddDJItem = () => {
        const newItem: DJItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            genres: [],
            languages: [],
            description: '',
            isExpanded: true
        };
        setDjItems(prev => [...prev, newItem]);
    };
    const updateDJItem = (id: string, field: keyof DJItem, value: any) => {
        setDjItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    const toggleDJItemExpand = (id: string) => {
        setDjItems(prev => prev.map(item => item.id === id ? { ...item, isExpanded: !item.isExpanded } : item));
    };
    const deleteDJItem = (id: string) => {
        setDjItems(prev => prev.filter(item => item.id !== id));
    };

    // Playlist Handlers
    const handleAddPlaylist = () => {
        setPlaylists(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Curated Playlist',
            type: 'Curated',
            playlistType: 'Type 1',
            songs: [],
            isExpanded: true
        }]);
    };
    const updatePlaylist = (id: string, field: string, value: any) => {
        setPlaylists(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    const togglePlaylistExpand = (id: string) => {
        setPlaylists(prev => prev.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
    };
    const deletePlaylist = (id: string) => setPlaylists(prev => prev.filter(p => p.id !== id));
    const addSongToPlaylist = (playlistId: string, song: any) => {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p));
    };
    const removeSongFromPlaylist = (playlistId: string, songId: string) => {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songs: p.songs.filter((s: any) => s.id !== songId) } : p));
    };

    // Equipment Handlers
    const handleAddEquipment = (equipment: any) => {
        setEquipments(prev => [...prev, { ...equipment, id: Math.random().toString(36).substr(2, 9) }]);
    };
    const deleteEquipment = (id: string) => setEquipments(prev => prev.filter(e => e.id !== id));

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
    const [teamEquipmentChargeType, setTeamEquipmentChargeType] = React.useState('Per Performance');
    const [teamEquipmentPrice, setTeamEquipmentPrice] = React.useState('');
    const [overtimePrice, setOvertimePrice] = React.useState('');

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

    const [guestTiers, setGuestTiers] = React.useState<GuestTier[]>([{ range: 'Upto 50', price: '' }]);
    const addGuestTierOption = () => setGuestTiers(prev => [...prev, { range: 'Upto 50', price: '' }]);
    const updateGuestTier = (index: number, field: 'range' | 'price', value: string) => {
        setGuestTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };

    const [lastMinuteFiles, setLastMinuteFiles] = React.useState<PolicyFile[]>([]);
    const onLastMinuteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, file: f }));
            setLastMinuteFiles(prev => [...prev, ...newFiles]);
        }
    };
    const removeLastMinuteFile = (i: number) => setLastMinuteFiles(prev => prev.filter((_, idx) => idx !== i));

    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, file: f }));
            setPolicyFiles(prev => [...prev, ...newFiles]);
        }
    };
    const removePolicyFile = (i: number) => setPolicyFiles(prev => prev.filter((_, idx) => idx !== i));

    // --- Step 4 State ---
    const [youtubeLink, setYoutubeLink] = React.useState('');
    const [instagramLink, setInstagramLink] = React.useState('');
    const [spotifyLink, setSpotifyLink] = React.useState('');
    const [facebookLink, setFacebookLink] = React.useState('');
    const [otherLink, setOtherLink] = React.useState('');
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);

    // Integration States
    const [packageId, setPackageId] = React.useState<string | null>(null);
    const isInitializing = React.useRef(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Save current step to localStorage to preserve state on reload
    React.useEffect(() => {
        if (packageId) {
            localStorage.setItem(`dj_active_step_${packageId}`, String(step));
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
                    const djDrafts = draftData.packages.filter((p: any) => p.vendorType === 'DJArtist');
                    if (djDrafts.length > 0) {
                        const pkg = djDrafts[0];
                        setPackageId(pkg._id);
                        sessionStorage.setItem('draft_package_id_DJ', pkg._id);

                        // Populate Step 1 (Event & Team)
                        if (pkg.step1_eventAndCrew) {
                            const s1 = pkg.step1_eventAndCrew;
                            setPackageName(s1.packageName === 'Untitled Package' ? '' : s1.packageName || '');
                            if (s1.eventCategories) setEventCategories(s1.eventCategories.join(', '));
                            
                            if (s1.duration) {
                                setMinDuration(String(s1.duration.minHours || ''));
                                setMaxDuration(String(s1.duration.maxHours || ''));
                            }
                            if (s1.capacity) {
                                setMinGuestCount(String(s1.capacity.minGuests || ''));
                                setMaxGuestCount(String(s1.capacity.maxGuests || ''));
                            }
                            if (s1.performers) {
                                setPerformingArtistCount(String(s1.performers.count || ''));
                            }
                            if (s1.supportingCrew !== undefined) {
                                setSupportingCrewCount(String(s1.supportingCrew));
                            }
                            if (s1.crewSize && s1.crewSize.maxPeople) {
                                setTotalCrewSize(s1.crewSize.maxPeople);
                            }
                            
                            setSiteVisitProvided(!!s1.visitingIncluded);

                            const needs: string[] = [];
                            if (s1.venueNeeds?.power) needs.push('Power');
                            if (s1.venueNeeds?.ac) needs.push('AC');
                            if (s1.venueNeeds?.stage) needs.push('Stage');
                            if (s1.venueNeeds?.lighting) needs.push('Lighting');
                            if (s1.venueNeeds?.security) needs.push('Security');
                            // Map 'Camera' if we store it in customText
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
                                setDjItems(s2.items.map((it: any) => ({
                                    id: it._id || Math.random().toString(36).substr(2, 9),
                                    name: it.name || '',
                                    genres: it.contentDetails?.genreOfMusic || [],
                                    languages: it.contentDetails?.language || [],
                                    description: it.contentDetails?.description || '',
                                    isExpanded: false
                                })));
                            }
                            if (s2.playlists && s2.playlists.length > 0) {
                                setPlaylists(s2.playlists.map((pl: any) => ({
                                    id: pl._id || Math.random().toString(36).substr(2, 9),
                                    name: pl.name || 'Curated Playlist',
                                    type: pl.type || 'Curated',
                                    playlistType: pl.playlistType || 'Type 1',
                                    songs: (pl.songs || []).map((s: any) => ({
                                        id: s._id || Math.random().toString(36).substr(2, 9),
                                        name: s.name,
                                        artist: s.artist,
                                        duration: s.duration,
                                        url: s.url
                                    })),
                                    isExpanded: false
                                })));
                                setCustomerPlaylistAllowed(!!s2.playlists[0].customerPlaylistAllowed);
                                setGuestRequestsAllowed(!!s2.playlists[0].guestRequestsAllowed);
                            }
                            if (s2.equipments) {
                                setEquipments(s2.equipments.map((e: any) => ({
                                    id: e._id || Math.random().toString(36).substr(2, 9),
                                    name: e.name || '',
                                    quantity: String(e.quantity || '1'),
                                    category: e.category || '',
                                    subCategory: e.subCategory || ''
                                })));
                            }
                            if (s2.hasBackupEquipment !== undefined) {
                                setHasBackupEquipment(!!s2.hasBackupEquipment);
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
                            if (s2.notIncluded) setNotProvidedDetails(s2.notIncluded.join('\n'));
                            if (s2.included) setProvidedDetails(s2.included.join('\n'));
                        }

                        // Populate Step 3 (Policies & Charges)
                        if (pkg.step3_policiesAndCharges) {
                            const s3 = pkg.step3_policiesAndCharges;
                            
                            if (s3.packagePricing) {
                                setPackagePrice(String(s3.packagePricing.price || ''));
                                setPackageChargeType(s3.packagePricing.billingUnit || 'Per Performance');
                            }
                            if (s3.teamAndEquipment) {
                                setTeamEquipmentPrice(String(s3.teamAndEquipment.price || ''));
                                setTeamEquipmentChargeType(s3.teamAndEquipment.billingUnit || 'Per Performance');
                            }
                            if (s3.overtimeCharges) {
                                setOvertimePrice(String(s3.overtimeCharges.price || ''));
                            }

                            if (s3.guestTiers && s3.guestTiers.length > 0) {
                                setGuestTiers(s3.guestTiers.map((t: any) => ({
                                    range: `Upto ${t.maxGuests}`,
                                    price: String(t.price || '')
                                })));
                            }

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
                            }
                            if (s3.lastMinuteChargesDocUrl) {
                                setLastMinuteFiles([{ name: 'Last Minute Policy', size: 0, url: s3.lastMinuteChargesDocUrl } as any]);
                            }
                            if (s3.policiesDocUrl) {
                                setPolicyFiles([{ name: 'Policy Document', size: 0, url: s3.policiesDocUrl } as any]);
                            }
                        }

                        // Populate Step 4 (Sample & Media)
                        if (pkg.step4_sampleMedia) {
                            const s4 = pkg.step4_sampleMedia;
                            if (s4.socialMediaLinks) {
                                setYoutubeLink(s4.socialMediaLinks.youtube || '');
                                setInstagramLink(s4.socialMediaLinks.instagram || '');
                                setSpotifyLink(s4.socialMediaLinks.spotify || '');
                                setFacebookLink(s4.socialMediaLinks.facebook || '');
                                setOtherLink(s4.socialMediaLinks.other || '');
                            }
                            if (s4.media && s4.media.length > 0) {
                                setSampleMediaFiles(s4.media.map((m: any) => ({
                                    name: m.fileName || 'Media File',
                                    size: m.size || 0,
                                    preview: m.url
                                })));
                            }
                        }

                        // Route to last step
                        const savedStep = localStorage.getItem(`dj_active_step_${pkg._id}`);
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
                        vendorType: 'DJArtist',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.packageId) {
                    setPackageId(data.packageId);
                    sessionStorage.setItem('draft_package_id_DJ', data.packageId);
                }
            } catch (err) {
                console.error("Error restoring/initializing DJ package draft:", err);
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
                        vendorType: 'DJArtist',
                        bookingType: 'Ready-to-Book'
                    })
                });
                const initData = await initRes.json();
                if (initData.status === 'SUCCESS' && initData.packageId) {
                    currentPackageId = initData.packageId;
                    setPackageId(initData.packageId);
                    sessionStorage.setItem('draft_package_id_DJ', initData.packageId);
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
                    packageName: packageName || `${variants.selectedVariant} DJ Package`,
                    eventCategories: eventCategories ? eventCategories.split(',').map(s => s.trim()) : ['Wedding'],
                    poc: pocName,
                    duration: {
                        minHours: parseInt(minDuration) || 0,
                        maxHours: parseInt(maxDuration) || 0,
                    },
                    capacity: {
                        minGuests: parseInt(minGuestCount) || 0,
                        maxGuests: parseInt(maxGuestCount) || 0,
                    },
                    audienceCapacity: {
                        min: parseInt(minGuestCount) || 0,
                        max: parseInt(maxGuestCount) || 0,
                    },
                    crewSize: {
                        minPeople: totalCrewSize,
                        maxPeople: totalCrewSize,
                        roles: ["DJ"]
                    },
                    performers: {
                        count: parseInt(performingArtistCount) || 0,
                        performingArtists: []
                    },
                    supportingCrew: parseInt(supportingCrewCount) || 0,
                    visitingIncluded: siteVisitProvided,
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
                // Upload addon policies/media if any
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
                    items: djItems.map(item => ({
                        name: item.name || 'DJ Item',
                        contentDetails: {
                            genreOfMusic: item.genres,
                            language: item.languages,
                            description: item.description
                        }
                    })),
                    playlists: playlists.length > 0 ? playlists.map((p: any) => ({
                        name: p.name,
                        type: p.type,
                        playlistType: p.playlistType,
                        songs: p.songs.map((s: any) => ({
                            name: s.name,
                            artist: s.artist,
                            duration: s.duration,
                            url: s.url
                        })),
                        customerPlaylistAllowed,
                        guestRequestsAllowed
                    })) : [{
                        name: 'Default Playlist',
                        customerPlaylistAllowed,
                        guestRequestsAllowed
                    }],
                    equipments: equipments.map((e: any) => ({
                        name: e.name,
                        quantity: parseInt(e.quantity) || 1,
                        category: e.category,
                        subCategory: e.subCategory
                    })),
                    hasBackupEquipment,
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
                
                let lastMinuteUrl = '';
                if (lastMinuteFiles.length > 0) {
                    const lf = lastMinuteFiles[0] as any;
                    if (lf.file) {
                        const formData = new FormData(); formData.append('file', lf.file);
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (uploadRes.ok) { const data = await uploadRes.json(); lastMinuteUrl = data.url || ''; }
                    } else if (lf.url) { lastMinuteUrl = lf.url; }
                }

                let policyUrl = '';
                if (policyFiles.length > 0) {
                    const pf = policyFiles[0] as any;
                    if (pf.file) {
                        const formData = new FormData(); formData.append('file', pf.file);
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (uploadRes.ok) { const data = await uploadRes.json(); policyUrl = data.url || ''; }
                    } else if (pf.url) { policyUrl = pf.url; }
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

                const validTiers = guestTiers.filter(t => t.price).map(t => {
                    const numStr = t.range.replace(/[^0-9]/g, '');
                    return {
                        maxGuests: numStr ? parseInt(numStr) : 0,
                        price: parseFloat(t.price.replace(/[^0-9.]/g, '')) || 0
                    };
                });

                const s3Payload = {
                    packagePricing: {
                        price: parseFloat(packagePrice) || 0,
                        billingUnit: packageChargeType
                    },
                    teamAndEquipment: {
                        price: parseFloat(teamEquipmentPrice) || 0,
                        billingUnit: teamEquipmentChargeType
                    },
                    overtimeCharges: {
                        price: parseFloat(overtimePrice) || 0,
                        billingUnit: 'Per Hour'
                    },
                    guestTiers: validTiers,
                    dynamicPricing: dpPayload,
                    lastMinuteChargesDocUrl: lastMinuteUrl,
                    policiesDocUrl: policyUrl
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/3`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(s3Payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 3 (Pricing and Policies).");
                setStep(4);
            } else if (step === 4) {
                // Upload sample media files
                const uploadedMedia = [];
                for (const media of sampleMediaFiles) {
                    if (media.file) {
                        const formData = new FormData();
                        formData.append('file', media.file);
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (uploadRes.ok) {
                            const data = await uploadRes.json();
                            if (data.url) {
                                uploadedMedia.push({
                                    url: data.url,
                                    type: media.file.type.startsWith('image/') ? 'image' : 'video',
                                    fileName: media.name,
                                    size: media.size
                                });
                            }
                        }
                    } else if (media.preview && !media.preview.startsWith('blob:')) {
                        uploadedMedia.push({
                            url: media.preview,
                            type: 'image',
                            fileName: media.name || 'Existing Media',
                            size: media.size || 0
                        });
                    }
                }

                const s4Payload = {
                    socialMediaLinks: {
                        youtube: youtubeLink,
                        instagram: instagramLink,
                        spotify: spotifyLink,
                        facebook: facebookLink,
                        other: otherLink
                    },
                    media: uploadedMedia
                };

                const res = await fetch(apiUrl(`/packages/${currentPackageId}/step/4`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(s4Payload)
                });
                if (!res.ok) throw new Error("Failed to save Step 4 (Sample and Media).");

                // Submit package
                const resSubmit = await fetch(apiUrl(`/packages/${currentPackageId}/submit`), {
                    method: 'POST'
                });
                if (!resSubmit.ok) {
                    const errorData = await resSubmit.json();
                    throw new Error(errorData.errors ? errorData.errors.join(", ") : errorData.message || "Failed to submit package");
                }

                sessionStorage.removeItem('draft_package_id_DJ');
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
                    <DJStep1EventAndTeam
                        packageName={packageName} setPackageName={setPackageName}
                        eventCategories={eventCategories} setEventCategories={setEventCategories}
                        minDuration={minDuration} setMinDuration={setMinDuration}
                        maxDuration={maxDuration} setMaxDuration={setMaxDuration}
                        minGuestCount={minGuestCount} setMinGuestCount={setMinGuestCount}
                        maxGuestCount={maxGuestCount} setMaxGuestCount={setMaxGuestCount}
                        totalCrewSize={totalCrewSize} setTotalCrewSize={setTotalCrewSize}
                        performingArtistCount={performingArtistCount} setPerformingArtistCount={setPerformingArtistCount}
                        supportingCrewCount={supportingCrewCount} setSupportingCrewCount={setSupportingCrewCount}
                        venueNeeds={venueNeeds} toggleVenueNeed={toggleVenueNeed}
                        venueRequest={venueRequest} setVenueRequest={setVenueRequest}
                        siteVisitProvided={siteVisitProvided} setSiteVisitProvided={setSiteVisitProvided}
                        venueNeedsOptions={VENUE_NEEDS_OPTIONS}
                    />
                )}
                
                {step === 2 && (
                    <DJStep2PackageAndItems
                        djItems={djItems}
                        handleAddDJItem={handleAddDJItem}
                        updateDJItem={updateDJItem}
                        toggleDJItemExpand={toggleDJItemExpand}
                        deleteDJItem={deleteDJItem}
                        playlists={playlists}
                        handleAddPlaylist={handleAddPlaylist}
                        updatePlaylist={updatePlaylist}
                        togglePlaylistExpand={togglePlaylistExpand}
                        deletePlaylist={deletePlaylist}
                        addSongToPlaylist={addSongToPlaylist}
                        removeSongFromPlaylist={removeSongFromPlaylist}
                        customerPlaylistAllowed={customerPlaylistAllowed} setCustomerPlaylistAllowed={setCustomerPlaylistAllowed}
                        guestRequestsAllowed={guestRequestsAllowed} setGuestRequestsAllowed={setGuestRequestsAllowed}
                        equipments={equipments}
                        handleAddEquipment={handleAddEquipment}
                        deleteEquipment={deleteEquipment}
                        hasBackupEquipment={hasBackupEquipment} setHasBackupEquipment={setHasBackupEquipment}
                        addons={addons}
                        handleOpenAddonForm={handleOpenAddonForm}
                        handleEditAddon={handleEditAddon}
                        deleteAddon={deleteAddon}
                        activeMenuDropdown={activeMenuDropdown}
                        setActiveMenuDropdown={setActiveMenuDropdown}
                        providedDetails={providedDetails} setProvidedDetails={setProvidedDetails}
                        notProvidedDetails={notProvidedDetails} setNotProvidedDetails={setNotProvidedDetails}
                    />
                )}
                
                {step === 3 && (
                    <DJStep3PricingAndPolicies
                        packageChargeType={packageChargeType} setPackageChargeType={setPackageChargeType}
                        packagePrice={packagePrice} setPackagePrice={setPackagePrice}
                        teamEquipmentChargeType={teamEquipmentChargeType} setTeamEquipmentChargeType={setTeamEquipmentChargeType}
                        teamEquipmentPrice={teamEquipmentPrice} setTeamEquipmentPrice={setTeamEquipmentPrice}
                        overtimePrice={overtimePrice} setOvertimePrice={setOvertimePrice}

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

                        guestTiers={guestTiers} addGuestTierOption={addGuestTierOption} updateGuestTier={updateGuestTier}

                        lastMinuteFiles={lastMinuteFiles} onLastMinuteUpload={onLastMinuteUpload} removeLastMinuteFile={removeLastMinuteFile}
                        policyFiles={policyFiles} onPolicyUpload={onPolicyUpload} removePolicyFile={removePolicyFile}
                    />
                )}
                
                {step === 4 && (
                    <DJStep4SampleAndMedia
                        youtubeLink={youtubeLink} setYoutubeLink={setYoutubeLink}
                        instagramLink={instagramLink} setInstagramLink={setInstagramLink}
                        spotifyLink={spotifyLink} setSpotifyLink={setSpotifyLink}
                        facebookLink={facebookLink} setFacebookLink={setFacebookLink}
                        otherLink={otherLink} setOtherLink={setOtherLink}
                        sampleMediaFiles={sampleMediaFiles} setSampleMediaFiles={setSampleMediaFiles}
                    />
                )}
            </FlowShell>

            {isAddingAddon && (
                <AddonModal
                    isOpen={isAddingAddon}
                    onClose={() => setIsAddingAddon(false)}
                    onSave={handleSaveAddon}
                    vendorType="DJ"
                    addon={editingAddon}
                />
            )}
        </>
    );
}
