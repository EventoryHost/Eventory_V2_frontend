'use client';

import { apiUrl } from '@/lib/api';
import { Suspense, useEffect, useState } from 'react';
import { BarChart3, Bell, Check, CheckCircle2, Copy, Edit3, FileText, Layers3, Loader2, MoreVertical, Pause, Search, SlidersHorizontal, Trash2, UploadCloud, ArrowRight, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateServiceModal from '@/components/CreateServiceModal';
import styles from './inventory.module.css';

interface PackageData {
    _id: string;
    reviewStatus?: 'images' | 'trust' | 'documents' | 'approved' | 'under_review';
    packageStatus: string;
    vendorType: string;
    bookingType: string;
    updatedAt: string;
    isTemplate?: boolean;
    templateNote?: string;
    completedSteps?: number[];
    vendorId?: { businessName?: string; vendorType?: string };
    step1_eventAndCrew?: { packageName?: string; eventCategories?: string[] };
    step2_productsAndPricing?: any;
    step3_policiesAndCharges?: any;
    step4_sampleMedia?: { media?: Array<{ url?: string; type?: string }> };
}

type InventoryTab = 'Drafts' | 'Live' | 'Submitted';

const VENDOR_TYPES = ['Decorator', 'Caterer', 'Makeup Artist', 'Venue Provider', 'Dj Artist', 'Photographer'];
const SERVICE_TYPES = ['Birthday Party', 'Anniversary Party', 'Birthday Celebration', 'Corporate Meeting', 'Wedding Reception', 'Charity Fundraiser'];

const getPackagePrefix = (vendorType: string) => ({
    Caterer: 'CAT', Decorator: 'DEC', MakeupArtist: 'MAK', DJArtist: 'DJA', PAV: 'PAV', VenueProvider: 'VEN',
}[vendorType] || 'MAK');

function packageName(pkg: PackageData) {
    return pkg.step1_eventAndCrew?.packageName || 'Untitled Package';
}

function getDraftProgress(pkg: PackageData) {
    const stepsDone = new Set<number>(pkg.completedSteps || []);
    if (pkg.step1_eventAndCrew?.packageName) stepsDone.add(1);
    if (pkg.step2_productsAndPricing && Object.keys(pkg.step2_productsAndPricing).length > 0) stepsDone.add(2);
    if (pkg.step3_policiesAndCharges && Object.keys(pkg.step3_policiesAndCharges).length > 0) stepsDone.add(3);
    if (pkg.step4_sampleMedia?.media?.length) stepsDone.add(4);

    const count = stepsDone.size;
    const percent = count >= 4 ? 100 : count === 3 ? 75 : count === 2 ? 50 : count === 1 ? 30 : 8;
    return {
        percent,
        isComplete: count >= 4 || percent === 100,
    };
}

function getVendorIcon(vendorType?: string): string {
    const type = (vendorType || '').toLowerCase();
    if (type.includes('photo') || type === 'pav') return "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/photographer.png";
    if (type.includes('decor')) return "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/decorator.png";
    if (type.includes('dj')) return "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/dj%20artist.png";
    if (type.includes('venue')) return "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/venue%20provider.png";
    if (type.includes('cater')) return "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/caterer.png";
    return "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/makeup.png";
}

function getVendorStepKey(vendorType?: string): string {
    const vt = (vendorType || '').toLowerCase();
    if (vt.includes('decor')) return 'decorator';
    if (vt.includes('cater')) return 'caterer';
    if (vt.includes('makeup') || vt === 'mak') return 'makeup';
    if (vt.includes('dj')) return 'dj';
    if (vt === 'pav' || vt.includes('photo')) return 'pav';
    if (vt.includes('venue')) return 'venue';
    return 'makeup';
}

function matchesVendorFilter(pkg: PackageData, selected: string[]) {
    if (selected.length === 0) return true;
    const type = (pkg.vendorType || '').toUpperCase().trim();
    return selected.some((item) => {
        const norm = item.toUpperCase().trim();
        if (norm === 'VENUE PROVIDER' && (type === 'VENUEPROVIDER' || type === 'VENUE')) return true;
        if (norm === 'PHOTOGRAPHER' && (type === 'PAV' || type === 'PHOTOGRAPHER')) return true;
        if (norm === 'DJ ARTIST' && (type === 'DJARTIST' || type === 'DJ' || type === 'DJ ARTIST')) return true;
        if (norm === 'MAKEUP ARTIST' && (type === 'MAKEUPARTIST' || type === 'MAKEUP' || type === 'MAKEUP ARTIST')) return true;
        if (norm === 'CATERER' && type === 'CATERER') return true;
        if (norm === 'DECORATOR' && type === 'DECORATOR') return true;
        return type === norm;
    });
}

function matchesServiceFilter(pkg: PackageData, selected: string[]) {
    if (selected.length === 0) return true;
    const categories: string[] = pkg.step1_eventAndCrew?.eventCategories || [];
    return selected.some((sel) => categories.some((c) => c.toLowerCase().includes(sel.toLowerCase())));
}

function InventoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<InventoryTab>('Drafts');
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(() => searchParams.get('add') === 'true');
    const [actionPackage, setActionPackage] = useState<PackageData | null>(null);
    const [templatePackage, setTemplatePackage] = useState<PackageData | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [documentModalPkg, setDocumentModalPkg] = useState<PackageData | null>(null);
    const [doc1File, setDoc1File] = useState<{ name: string; size: string } | null>(null);
    const [doc2File, setDoc2File] = useState<{ name: string; size: string } | null>(null);
    const [demoReviewMap, setDemoReviewMap] = useState<Record<string, string>>({});
    const [showTemplateSuccess, setShowTemplateSuccess] = useState(false);
    const [templateNote, setTemplateNote] = useState('');
    const [busyPackageId, setBusyPackageId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const toggleFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
        if (list.includes(item)) setList(list.filter((i) => i !== item));
        else setList([...list, item]);
    };

    const togglePause = async (pkg: PackageData, targetStatus: string) => {
        setBusyPackageId(pkg._id); setError('');
        try {
            await fetch(apiUrl(`/packages/${pkg._id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageStatus: targetStatus })
            });
            setPackages((current) => current.map((item) => item._id === pkg._id ? { ...item, packageStatus: targetStatus } : item));
            if (actionPackage?._id === pkg._id) setActionPackage(null);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not change package status');
        } finally {
            setBusyPackageId(null);
        }
    };

    const loadPackages = async () => {
        const vendorId = localStorage.getItem('vendor_id');
        if (!vendorId) return;
        const response = await fetch(apiUrl(`/packages/vendor/${vendorId}`), { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || data.status !== 'SUCCESS') throw new Error(data.message || 'Could not load packages');
        setPackages(data.packages || []);
    };

    useEffect(() => {
        const loadTimer = window.setTimeout(() => {
            const step = localStorage.getItem('dashboard_step');
            setIsProfileComplete(step === '3');
            loadPackages().catch(() => setError('Some inventory details could not be loaded. Please try again.')).finally(() => setIsLoading(false));
        }, 0);
        return () => window.clearTimeout(loadTimer);
    }, []);

    const getEffectiveStatus = (pkg: PackageData) => {
        const demo = demoReviewMap[pkg._id];
        if (demo) return demo;
        if (pkg.packageStatus === 'Under Review' || pkg.packageStatus === 'Submitted') {
            return 'under_review';
        }
        return pkg.packageStatus;
    };

    const isSubmittedStatus = (status: string, id: string) => {
        const demo = demoReviewMap[id];
        if (demo && demo !== 'draft' && demo !== 'live') return true;
        return ['Under Review', 'Submitted', 'Action Required', 'Rejected', 'Needs Review', 'Documents Required', 'Approved', 'images', 'trust', 'documents', 'approved', 'under_review'].includes(status);
    };

    const displayedPackages = packages.filter((pkg) => (
        activeTab === 'Drafts' ? pkg.packageStatus === 'Draft'
            : activeTab === 'Live' ? (pkg.packageStatus === 'Live' || pkg.packageStatus === 'Paused')
                : isSubmittedStatus(getEffectiveStatus(pkg), pkg._id)
    ))
    .filter((pkg) => packageName(pkg).toLowerCase().includes(query.trim().toLowerCase()))
    .filter((pkg) => matchesVendorFilter(pkg, selectedVendors))
    .filter((pkg) => matchesServiceFilter(pkg, selectedServices));

    const tabCount = (tab: InventoryTab) => packages.filter((pkg) => (
        tab === 'Drafts' ? pkg.packageStatus === 'Draft'
            : tab === 'Live' ? (pkg.packageStatus === 'Live' || pkg.packageStatus === 'Paused')
                : isSubmittedStatus(getEffectiveStatus(pkg), pkg._id)
    )).length;

    const needsReviewPackages = displayedPackages.filter((p) => ['images', 'trust', 'documents', 'Action Required', 'Rejected', 'Needs Review', 'Documents Required'].includes(getEffectiveStatus(p)));
    const inProcessPackages = displayedPackages.filter((p) => !needsReviewPackages.includes(p));

    const renderPackageCard = (pkg: PackageData) => {
        const progress = getDraftProgress(pkg);
        const effStatus = getEffectiveStatus(pkg);
        const isActionReq = ['images', 'trust', 'documents', 'Action Required', 'Rejected', 'Needs Review', 'Documents Required'].includes(effStatus);
        const isApprov = effStatus === 'approved' || effStatus === 'Approved' || effStatus === 'Verified';

        return (
            <article className={styles.packageCard} key={pkg._id}>
                <div className={styles.packageImage}>
                    {pkg.step4_sampleMedia?.media?.find((media) => media.type !== 'video')?.url ? <img src={pkg.step4_sampleMedia.media.find((media) => media.type !== 'video')?.url} alt="" /> : <div className={styles.imageFallback}><Layers3 size={38} /></div>}
                    {activeTab === 'Drafts' ? (
                        progress.isComplete ? (
                            <span className={styles.completeBadge}>COMPLETE</span>
                        ) : (
                            <span className={styles.inProgressBadge}>IN-PROGRESS</span>
                        )
                    ) : pkg.packageStatus === 'Live' ? (
                        <span className={styles.liveBadge}>LIVE</span>
                    ) : pkg.packageStatus === 'Paused' ? (
                        <span className={styles.pausedBadge}>PAUSED</span>
                    ) : isActionReq ? (
                        <span className={styles.actionRequiredBadge}>ACTION REQUIRED</span>
                    ) : isApprov ? (
                        <span className={styles.approvedBadge}>APPROVED</span>
                    ) : (
                        <span className={styles.underReviewBadge}>UNDER REVIEW</span>
                    )}
                    <button className={styles.imageMenuButton} aria-label={`Actions for ${packageName(pkg)}`} onClick={() => setActionPackage(pkg)}><MoreVertical size={22} /></button>
                </div>
                <div className={styles.cardBody}>
                    {activeTab === 'Drafts' && (
                        <div className={styles.progressRow}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
                            </div>
                            <span className={styles.progressText}>{progress.percent < 10 ? `0${progress.percent}%` : `${progress.percent}%`}</span>
                        </div>
                    )}
                    <div className={styles.packageMeta}>
                        <span className={styles.vendorTypePill}>
                            <img src={getVendorIcon(pkg.vendorType)} alt="" style={{ width: 13, height: 13 }} />
                            {pkg.vendorType ? pkg.vendorType.replace(/([A-Z])/g, ' $1').trim().toUpperCase() : 'VENDOR'}
                        </span>
                        {pkg.bookingType && <><i /> <span>{pkg.bookingType.toUpperCase()}</span></>}
                    </div>
                    <h2>{packageName(pkg)}</h2>
                    {activeTab === 'Live' || pkg.packageStatus === 'Live' || pkg.packageStatus === 'Paused' ? (
                        <p>Your package is active and visible to customers. You have 12 active bookings and 450 views this month.</p>
                    ) : activeTab === 'Drafts' ? (
                        progress.isComplete ? (
                            !isProfileComplete ? (
                                <div className={styles.warningCallout}>
                                    <strong className={styles.warningCalloutTitle}>Profile Setup Incomplete.</strong>
                                    <ul>
                                        <li>• Need to Complete Business Profile Setup</li>
                                        <li>• Need to Complete Personal Document Verification</li>
                                    </ul>
                                </div>
                            ) : (
                                <p>All steps are finished and your package looks great! Submit it now for verification to start receiving bookings.</p>
                            )
                        ) : (
                            <p>Your package needs a few updates before it can be approved. Check the checklist for details.</p>
                        )
                    ) : isActionReq ? (
                        <>
                            <p>Your package needs a few updates before it can be approved. Check the notes for details.</p>
                            {effStatus === 'trust' ? (
                                <div className={styles.trustCallout}>
                                    <strong className={styles.trustCalloutTitle}>Quality/Authenticity Issues (Trust Violation)</strong>
                                    <ul>
                                        <li>• The portfolio images provided appear to be watermarked stock photos and do not represent original work.</li>
                                        <li>• This listing was flagged as a duplicate of another existing account. Multiple listings for the same service are not allowed.</li>
                                    </ul>
                                </div>
                            ) : effStatus === 'documents' ? (
                                <div className={styles.reviewCallout}>
                                    <strong className={styles.reviewCalloutTitle}>Documents Required</strong>
                                    <ul>
                                        <li>1. Business Document need Verification</li>
                                        <li>2. Personal Documents need Verification</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className={styles.reviewCallout}>
                                    <ul>
                                        <li>• Please upload at least <strong>3 high-resolution images</strong>. The current main cover photo is blurry.</li>
                                        <li>• The &ldquo;Silver Package&rdquo; <strong>description is missing a clear breakdown</strong> of deliverables.</li>
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : isApprov ? (
                        <p>Great news! Your package has been approved and is ready to go live on the marketplace.</p>
                    ) : (
                        <p>Our team is currently verifying your details. You can view this package while it&rsquo;s being reviewed.</p>
                    )}
                    {activeTab === 'Drafts' ? (
                        progress.isComplete ? (
                            !isProfileComplete ? (
                                <button className={styles.cardPrimaryButton} onClick={() => router.push('/dashboard')}>
                                    Complete Profile Setup <ArrowRight size={17} style={{ marginLeft: 6 }} />
                                </button>
                            ) : (
                                <button className={styles.cardPrimaryButton} onClick={() => togglePause(pkg, 'Under Review')}>
                                    Send for Verification
                                </button>
                            )
                        ) : (
                            <button className={styles.cardPrimaryButton} onClick={() => openPackage(pkg)}>Finish Setup</button>
                        )
                    ) : pkg.packageStatus === 'Paused' ? (
                        <button className={styles.cardPrimaryButton} onClick={() => togglePause(pkg, 'Live')}>Resume Listing</button>
                    ) : activeTab === 'Live' ? (
                        <button className={styles.cardPrimaryButton}>View Analytics</button>
                    ) : isActionReq ? (
                        effStatus === 'documents' ? (
                            <button className={styles.cardPrimaryButton} onClick={() => { setDocumentModalPkg(pkg); setDoc1File(null); setDoc2File(null); }}>
                                Upload Documents &amp; Resubmit
                            </button>
                        ) : (
                            <button className={styles.cardPrimaryButton} onClick={() => openPackage(pkg)}>
                                Fix &amp; Resubmit
                            </button>
                        )
                    ) : isApprov ? (
                        <button className={styles.cardPrimaryButton} onClick={() => togglePause(pkg, 'Live')}>Go Live</button>
                    ) : (
                        <button className={styles.cardPrimaryButton} onClick={() => openPackage(pkg)}>View Submission</button>
                    )}
                </div>
            </article>
        );
    };

    const openPackage = (pkg: PackageData) => {
        localStorage.setItem('selected_package_id', pkg._id);
        localStorage.setItem('service_id', `${getPackagePrefix(pkg.vendorType)}${pkg._id}`);
        
        // Take them to the last filled page or next uncompleted step from DB
        const stepKey = `${getVendorStepKey(pkg.vendorType)}_active_step_${pkg._id}`;
        let targetStep = 1;
        const localStep = localStorage.getItem(stepKey);
        if (localStep && !isNaN(parseInt(localStep, 10)) && parseInt(localStep, 10) >= 1 && parseInt(localStep, 10) <= 4) {
            targetStep = parseInt(localStep, 10);
        } else if (pkg.completedSteps && pkg.completedSteps.length > 0) {
            targetStep = Math.min(4, Math.max(...pkg.completedSteps) + 1);
        } else {
            if (pkg.step3_policiesAndCharges && Object.keys(pkg.step3_policiesAndCharges).length > 0) targetStep = 4;
            else if (pkg.step2_productsAndPricing && Object.keys(pkg.step2_productsAndPricing).length > 0) targetStep = 3;
            else if (pkg.step1_eventAndCrew && Object.keys(pkg.step1_eventAndCrew).length > 0) targetStep = 2;
        }
        localStorage.setItem(stepKey, String(targetStep));

        router.push('/dashboard/packages/new');
    };

    const deleteDraft = async (pkg: PackageData) => {
        if (!window.confirm(`Delete draft “${packageName(pkg)}”?`)) return;
        setBusyPackageId(pkg._id); setError('');
        try {
            const response = await fetch(apiUrl(`/packages/${pkg._id}`), { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok || data.status !== 'SUCCESS') throw new Error(data.message || 'Could not delete draft');
            setPackages((current) => current.filter((item) => item._id !== pkg._id));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not delete draft');
        } finally { setBusyPackageId(null); setActionPackage(null); }
    };

    const saveTemplate = async () => {
        if (!templatePackage) return;
        const vendorId = localStorage.getItem('vendor_id');
        if (!vendorId) {
            setError('Vendor ID not found. Please log in again.');
            return;
        }
        
        setBusyPackageId(templatePackage._id); setError('');
        try {
            const response = await fetch(apiUrl(`/templates/vendor/${vendorId}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourcePackageId: templatePackage._id,
                    note: templateNote
                })
            });
            const data = await response.json();
            if (!response.ok || data.status !== 'SUCCESS') throw new Error(data.message || 'Could not save template');
            
            // Mark the local package as a template so UI reflects it (optional, but good for UX)
            setPackages((current) => current.map((item) => item._id === templatePackage._id ? { ...item, isTemplate: true, templateNote } : item));
            setTemplatePackage(null); setTemplateNote(''); setShowTemplateSuccess(true);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save template');
        } finally { setBusyPackageId(null); }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img className={styles.logo} src="https://dkuacgndftndz.cloudfront.net/inventory-page/clearLogoeventoryV2.svg" alt="Eventory Logo" />
                <button className={styles.iconButton} aria-label="Notifications"><Bell size={23} /></button>
            </header>
            <section className={styles.titleRow}>
                <div><h1>Inventory</h1><p>View and manage your Inventories.</p></div>
                <button className={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>+ Add</button>
            </section>

            <div className={styles.tabs} role="tablist" aria-label="Package status">
                {(['Drafts', 'Live', 'Submitted'] as const).map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? styles.tabActive : styles.tab} onClick={() => setActiveTab(tab)}>{tab}{tabCount(tab) > 0 && <span>{tabCount(tab)}</span>}</button>)}
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.searchRow}>
                <label className={styles.searchBox}><Search size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search packages" /></label>
                <button className={styles.filterButton} aria-label="Filter packages" onClick={() => setShowFilterModal(true)}><SlidersHorizontal size={21} /></button>
            </div>
            {activeTab === 'Submitted' && !isLoading && displayedPackages.length > 0 ? (
                <div>
                    <section className={styles.sectionGroup}>
                        <h2 className={styles.sectionGroupTitle}>Needs Your Review</h2>
                        {needsReviewPackages.length > 0 ? (
                            <div className={styles.packageList}>
                                {needsReviewPackages.map((pkg) => renderPackageCard(pkg))}
                            </div>
                        ) : (
                            <p style={{ color: '#71717a', fontSize: '13px', margin: '0 0 20px 0' }}>No packages currently require admin edits or documents.</p>
                        )}
                    </section>
                    <section className={styles.sectionGroup}>
                        <h2 className={styles.sectionGroupTitle}>In Process &amp; Verified</h2>
                        {inProcessPackages.length > 0 ? (
                            <div className={styles.packageList}>
                                {inProcessPackages.map((pkg) => renderPackageCard(pkg))}
                            </div>
                        ) : (
                            <p style={{ color: '#71717a', fontSize: '13px' }}>No packages currently in verification or approved state.</p>
                        )}
                    </section>
                </div>
            ) : (
                <section className={styles.packageList}>
                    {isLoading ? <div className={styles.loader}><Loader2 className="animate-spin" size={28} /></div>
                        : displayedPackages.length ? displayedPackages.map((pkg) => renderPackageCard(pkg)) : <div className={styles.emptyState}><FileText size={36} strokeWidth={1.3} /><h2>No {activeTab.toLowerCase()} yet</h2><p>Create a package to start building your inventory.</p>{activeTab === 'Drafts' && <button className={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>Create package</button>}</div>}
                </section>
            )}

            {actionPackage && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setActionPackage(null)}><section className={styles.actionSheet} role="dialog" aria-modal="true" aria-label="Package actions" onMouseDown={(event) => event.stopPropagation()}>
                <button className={styles.sheetClose} aria-label="Close" onClick={() => setActionPackage(null)}><X size={21} /></button>
                <button onClick={() => { setTemplatePackage(actionPackage); setTemplateNote(''); setActionPackage(null); }}><FileText size={20} />Save as template</button>
                {activeTab === 'Drafts' && (
                    <button onClick={() => { setIsProfileComplete(!isProfileComplete); setActionPackage(null); }}>
                        <CheckCircle2 size={20} color="#0284c7" /> Toggle Profile Setup Alert (Currently: {isProfileComplete ? 'Complete' : 'Incomplete'})
                    </button>
                )}
                {activeTab === 'Submitted' && (
                    <>
                        <button onClick={() => { setDemoReviewMap(prev => ({ ...prev, [actionPackage._id]: 'images' })); setActionPackage(null); }}>
                            <FileText size={20} color="#e11d48" /> Demo: Mark as Action Required (Image Fixes)
                        </button>
                        <button onClick={() => { setDemoReviewMap(prev => ({ ...prev, [actionPackage._id]: 'trust' })); setActionPackage(null); }}>
                            <FileText size={20} color="#e11d48" /> Demo: Mark as Trust Violation (Red Alert)
                        </button>
                        <button onClick={() => { setDemoReviewMap(prev => ({ ...prev, [actionPackage._id]: 'documents' })); setActionPackage(null); }}>
                            <FileText size={20} color="#0284c7" /> Demo: Mark as Documents Required (Modal)
                        </button>
                        <button onClick={() => { setDemoReviewMap(prev => ({ ...prev, [actionPackage._id]: 'approved' })); setActionPackage(null); }}>
                            <CheckCircle2 size={20} color="#16a34a" /> Demo: Mark as Approved (Go Live)
                        </button>
                        <button onClick={() => { setDemoReviewMap(prev => ({ ...prev, [actionPackage._id]: 'under_review' })); setActionPackage(null); }}>
                            <CheckCircle2 size={20} color="#2563eb" /> Demo: Reset to Under Review
                        </button>
                    </>
                )}
                {actionPackage.packageStatus === 'Live' && <button onClick={() => togglePause(actionPackage, 'Paused')} disabled={busyPackageId === actionPackage._id}><Pause size={20} />Pause this package</button>}
                {actionPackage.packageStatus === 'Paused' && <button onClick={() => togglePause(actionPackage, 'Live')} disabled={busyPackageId === actionPackage._id}><Check size={20} />Resume this package</button>}
                <button className={styles.deleteAction} onClick={() => deleteDraft(actionPackage)} disabled={busyPackageId === actionPackage._id}><Trash2 size={20} />Delete this package</button>
            </section></div>}
            {documentModalPkg && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setDocumentModalPkg(null)} style={{ zIndex: 90 }}>
                <section className={styles.documentModal} role="dialog" aria-modal="true" aria-labelledby="upload-doc-title" onMouseDown={(event) => event.stopPropagation()}>
                    <button className={styles.closeButton} aria-label="Close" onClick={() => setDocumentModalPkg(null)}><X size={20} /></button>
                    <h2 id="upload-doc-title" className={styles.documentModalTitle}>Upload Requires Documents</h2>
                    
                    <div className={styles.documentSection}>
                        <div className={styles.documentLabel}>
                            {doc1File && <span className={styles.documentLabelIcon}><CheckCircle2 size={17} /></span>}
                            Document Name 1
                        </div>
                        {!doc1File ? (
                            <label className={styles.dropZone}>
                                <div className={styles.dropIcon}><UploadCloud size={24} /></div>
                                <p className={styles.dropTitle}>Upload Required Documents</p>
                                <p className={styles.dropSubtitle}>PDF, DOC up to 10MB</p>
                                <span className={styles.browseButton}>BROWSE FILES</span>
                                <input type="file" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setDoc1File({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                                }} />
                            </label>
                        ) : (
                            <div className={styles.uploadedChip}>
                                <div className={styles.uploadedChipInfo}>
                                    <FileText className={styles.uploadedChipIcon} size={24} />
                                    <div className={styles.uploadedChipText}>
                                        <strong>{doc1File.name}</strong>
                                        <span>{doc1File.size} • Uploaded</span>
                                    </div>
                                </div>
                                <button className={styles.removeFileButton} onClick={() => setDoc1File(null)}><X size={18} /></button>
                            </div>
                        )}
                    </div>

                    <div className={styles.documentSection}>
                        <div className={styles.documentLabel}>
                            {doc2File && <span className={styles.documentLabelIcon}><CheckCircle2 size={17} /></span>}
                            Document Name 2
                        </div>
                        {!doc2File ? (
                            <label className={styles.dropZone}>
                                <div className={styles.dropIcon}><UploadCloud size={24} /></div>
                                <p className={styles.dropTitle}>Upload Required Documents</p>
                                <p className={styles.dropSubtitle}>PDF, DOC up to 10MB</p>
                                <span className={styles.browseButton}>BROWSE FILES</span>
                                <input type="file" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setDoc2File({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                                }} />
                            </label>
                        ) : (
                            <div className={styles.uploadedChip}>
                                <div className={styles.uploadedChipInfo}>
                                    <FileText className={styles.uploadedChipIcon} size={24} />
                                    <div className={styles.uploadedChipText}>
                                        <strong>{doc2File.name}</strong>
                                        <span>{doc2File.size} • Uploaded</span>
                                    </div>
                                </div>
                                <button className={styles.removeFileButton} onClick={() => setDoc2File(null)}><X size={18} /></button>
                            </div>
                        )}
                    </div>

                    <button className={styles.submitDocumentsButton} onClick={() => {
                        setDemoReviewMap(prev => ({ ...prev, [documentModalPkg._id]: 'under_review' }));
                        setDocumentModalPkg(null);
                        setShowTemplateSuccess(true);
                    }}>
                        Submit Documents
                    </button>
                </section>
            </div>}
            {templatePackage && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setTemplatePackage(null)}><section className={styles.templateModal} role="dialog" aria-modal="true" aria-labelledby="save-template-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.closeButton} aria-label="Close" onClick={() => setTemplatePackage(null)}><X size={20} /></button><h2 id="save-template-title">Save as Template</h2><p className={styles.modalHint}>Saving in template section during creation</p><div className={styles.templatePreview}>{templatePackage.step4_sampleMedia?.media?.[0]?.url ? <img src={templatePackage.step4_sampleMedia.media[0].url} alt="" /> : <Layers3 size={20} />}<div><span>{templatePackage.vendorType}</span><strong>{packageName(templatePackage)}</strong></div></div><label htmlFor="template-note">Template Note <span>(Optional)</span></label><textarea id="template-note" value={templateNote} onChange={(event) => setTemplateNote(event.target.value)} placeholder="This is for special event only" maxLength={500} /><small className={styles.noteHelp}>Helps you for remembering when creating new packages</small><button className={styles.saveTemplate} disabled={busyPackageId === templatePackage._id} onClick={saveTemplate}>{busyPackageId === templatePackage._id ? 'Saving…' : 'Continue'}</button></section></div>}
            {showTemplateSuccess && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowTemplateSuccess(false)}><section className={styles.templateSuccess} role="dialog" aria-modal="true" aria-label="Template added" onMouseDown={(event) => event.stopPropagation()}><button className={styles.successClose} aria-label="Close" onClick={() => setShowTemplateSuccess(false)}><X size={22} /></button><div className={styles.successBurst}><span><Check size={40} strokeWidth={4} /></span></div><h2>Added to template</h2></section></div>}
            <CreateServiceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            {/* Filter Modal */}
            {showFilterModal && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowFilterModal(false)} style={{ zIndex: 100 }}>
                <section className={styles.filterModal} role="dialog" aria-modal="true" aria-label="Filter" onMouseDown={(event) => event.stopPropagation()}>
                    <div className={styles.filterHeader}>
                        <div>
                            <h2 className={styles.filterTitle}>Filter</h2>
                            <p className={styles.filterSubtitle}>Vendor type & Event type</p>
                        </div>
                        <button className={styles.filterClose} aria-label="Close filters" onClick={() => setShowFilterModal(false)}><X size={22} /></button>
                    </div>

                    <div className={styles.filterScrollArea}>
                        <div className={styles.filterSection}>
                            <span className={styles.filterSectionTitle}>VENDOR TYPE</span>
                            <div className={styles.filterPills}>
                                {VENDOR_TYPES.map(vt => (
                                    <button 
                                        key={vt} 
                                        className={`${styles.filterPill} ${selectedVendors.includes(vt) ? styles.filterPillActive : ''}`}
                                        onClick={() => toggleFilter(selectedVendors, setSelectedVendors, vt)}
                                    >
                                        {vt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterSection}>
                            <span className={styles.filterSectionTitle}>SERVICE TYPE</span>
                            <div className={styles.filterPills}>
                                {SERVICE_TYPES.map(st => (
                                    <button 
                                        key={st} 
                                        className={`${styles.filterPill} ${selectedServices.includes(st) ? styles.filterPillActive : ''}`}
                                        onClick={() => toggleFilter(selectedServices, setSelectedServices, st)}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.filterFooter}>
                        <button className={styles.filterSearchButton} onClick={() => setShowFilterModal(false)}>Search Now</button>
                    </div>
                </section>
            </div>}
        </div>
    );
}

export default function InventoryPage() { return <Suspense fallback={null}><InventoryContent /></Suspense>; }
