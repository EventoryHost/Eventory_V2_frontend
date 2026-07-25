'use client';

import { apiUrl } from '@/lib/api';
import { Suspense, useEffect, useState } from 'react';
import { Bell, Edit3, Layers3, Loader2, MoreVertical, Search, SlidersHorizontal, Trash2, X, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './templates.module.css';

interface TemplateData {
    _id: string;
    packageName: string;
    note?: string;
    coverImageUrl?: string;
    vendorTypeLabel?: string;
    ownerVendorId: string;
    ownerName?: string;
    sourcePackageId?: string;
    createdAt?: string;
    data?: { packages?: Array<any> };
}

type TemplateTab = 'All Templates' | 'My Templates';

const VENDOR_TYPES = ['Decorator', 'Caterer', 'Makeup Artist', 'Venue Provider', 'Dj Artist', 'Photographer'];
const SERVICE_TYPES = ['Birthday Party', 'Anniversary Party', 'Birthday Celebration', 'Corporate Meeting', 'Wedding Reception', 'Charity Fundraiser'];

const DUMMY_TEMPLATES: TemplateData[] = [
    {
        _id: 'dummy1',
        packageName: 'Bridal Makeup - Gold Package',
        vendorTypeLabel: 'MAKEUP ARTIST',
        note: 'This is for special events',
        coverImageUrl: 'https://dkuacgndftndz.cloudfront.net/inventory-page/package_image1.jpeg',
        ownerVendorId: 'VEN123',
        createdAt: new Date().toISOString()
    }
];

const getPackagePrefix = (vendorType: string) => ({
    Caterer: 'CAT', Decorator: 'DEC', MakeupArtist: 'MAK', DJArtist: 'DJA', PAV: 'PAV', VenueProvider: 'VEN',
}[vendorType] || 'MAK');

function packageName(pkg: TemplateData) {
    return pkg.packageName || 'Untitled Template';
}

function matchesVendorFilter(pkg: TemplateData, selected: string[]) {
    if (selected.length === 0) return true;
    const label = (pkg.vendorTypeLabel || '').toUpperCase();
    const pkgVendors = (pkg.data?.packages || []).map((p: any) => (p.vendorType || '').toUpperCase());

    return selected.some((item) => {
        const norm = item.toUpperCase().trim();
        if (norm === 'VENUE PROVIDER' && (label === 'VENUE' || pkgVendors.includes('VENUEPROVIDER'))) return true;
        if (norm === 'PHOTOGRAPHER' && (label === 'PAV' || pkgVendors.includes('PAV'))) return true;
        if (norm === 'DJ ARTIST' && (label === 'DJ ARTIST' || label === 'DJ' || pkgVendors.includes('DJARTIST'))) return true;
        if (norm === 'MAKEUP ARTIST' && (label === 'MAKEUP ARTIST' || pkgVendors.includes('MAKEUPARTIST'))) return true;
        if (norm === 'CATERER' && (label === 'CATERER' || pkgVendors.includes('CATERER'))) return true;
        if (norm === 'DECORATOR' && (label === 'DECORATOR' || pkgVendors.includes('DECORATOR'))) return true;
        return label === norm;
    });
}

function matchesServiceFilter(pkg: TemplateData, selected: string[]) {
    if (selected.length === 0) return true;
    const pkgs = pkg.data?.packages || [];
    for (const p of pkgs) {
        const categories: string[] = p?.step1_eventAndCrew?.eventCategories || [];
        if (selected.some((sel) => categories.some((c) => c.toLowerCase().includes(sel.toLowerCase())))) {
            return true;
        }
    }
    return false;
}

function TemplatesContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TemplateTab>('All Templates');
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionPackage, setActionPackage] = useState<TemplateData | null>(null);
    const [busyPackageId, setBusyPackageId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    
    const [showDummyData, setShowDummyData] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const loadTemplates = async (tab: TemplateTab) => {
        setIsLoading(true);
        try {
            const vendorId = localStorage.getItem('vendor_id');
            const url = tab === 'My Templates' && vendorId 
                ? apiUrl(`/templates/vendor/${vendorId}`) 
                : apiUrl('/templates');
                
            const response = await fetch(url, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'SUCCESS') {
                    setTemplates(data.templates || []);
                }
            }
        } catch (err) {
            console.error('Failed to load templates', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates(activeTab);
    }, [activeTab]);

    const sourceData = showDummyData ? DUMMY_TEMPLATES : templates;
    const displayedTemplates = sourceData
        .filter((pkg) => packageName(pkg).toLowerCase().includes(query.trim().toLowerCase()))
        .filter((pkg) => matchesVendorFilter(pkg, selectedVendors))
        .filter((pkg) => matchesServiceFilter(pkg, selectedServices));

    const openTemplate = async (template: TemplateData) => {
        const vendorId = localStorage.getItem('vendor_id');
        if (!vendorId) {
            setError('Please log in first to use this template.');
            return;
        }
        setBusyPackageId(template._id);
        setError('');
        try {
            let templateData = template;
            const res = await fetch(apiUrl(`/templates/${template._id}`), { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                if (json.status === 'SUCCESS' && json.template) {
                    templateData = json.template;
                }
            }
            const packagesToClone: any[] = templateData.data?.packages || [];
            if (!packagesToClone.length) {
                throw new Error("This template does not contain any valid package data.");
            }

            let firstCreatedPackageId: string | null = null;
            let packageGroupId: string | null = null;

            for (const srcPkg of packagesToClone) {
                const initResponse: Response = await fetch(apiUrl('/packages/initialize'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        vendorType: srcPkg.vendorType || 'Decorator',
                        packageName: srcPkg.step1_eventAndCrew?.packageName || template.packageName || 'Untitled Package',
                        variantType: srcPkg.variantType || 'Standard',
                        packageGroupId: packageGroupId || undefined
                    })
                });
                const initData: any = await initResponse.json();
                if (!initResponse.ok || initData.status !== 'SUCCESS') {
                    throw new Error(initData.message || "Failed to initialize draft package from template.");
                }

                const newPkgId = initData.packageId;
                if (!packageGroupId) packageGroupId = initData.packageGroupId;
                if (!firstCreatedPackageId) firstCreatedPackageId = newPkgId;

                if (srcPkg.step1_eventAndCrew) {
                    await fetch(apiUrl(`/packages/${newPkgId}/step/1`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(srcPkg.step1_eventAndCrew)
                    });
                }
                if (srcPkg.step2_productsAndPricing) {
                    await fetch(apiUrl(`/packages/${newPkgId}/step/2`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(srcPkg.step2_productsAndPricing)
                    });
                }
                if (srcPkg.step3_policiesAndCharges) {
                    await fetch(apiUrl(`/packages/${newPkgId}/step/3`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(srcPkg.step3_policiesAndCharges)
                    });
                }
                if (srcPkg.step4_sampleMedia) {
                    await fetch(apiUrl(`/packages/${newPkgId}/step/4`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(srcPkg.step4_sampleMedia)
                    });
                }
            }

            if (firstCreatedPackageId) {
                const primaryPkg = packagesToClone[0];
                const prefix = getPackagePrefix(primaryPkg?.vendorType || 'Decorator');
                localStorage.setItem('selected_package_id', firstCreatedPackageId);
                localStorage.setItem('service_id', `${prefix}${firstCreatedPackageId}`);
                router.push('/dashboard/packages/new');
            }
        } catch (err) {
            console.error("Failed to use template", err);
            setError(err instanceof Error ? err.message : "Failed to create package from template");
            setBusyPackageId(null);
        }
    };

    const deleteTemplate = async (pkg: TemplateData) => {
        if (!window.confirm(`Delete template “${packageName(pkg)}”?`)) return;
        setBusyPackageId(pkg._id); setError('');
        try {
            const response = await fetch(apiUrl(`/templates/${pkg._id}`), { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok || data.status !== 'SUCCESS') throw new Error(data.message || 'Could not delete template');
            setTemplates((current) => current.filter((item) => item._id !== pkg._id));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not delete template');
        } finally { setBusyPackageId(null); setActionPackage(null); }
    };

    const toggleFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img className={styles.logo} src="https://dkuacgndftndz.cloudfront.net/inventory-page/clearLogoeventoryV2.svg" alt="Eventory Logo" />
                <button className={styles.iconButton} aria-label="Notifications"><Bell size={23} /></button>
            </header>
            <section className={styles.titleRow}>
                <div>
                    <h1 onDoubleClick={() => setShowDummyData(!showDummyData)} style={{ cursor: 'pointer', userSelect: 'none' }}>Template Inventory</h1>
                    <p>View and manage your Inventories.</p>
                </div>
            </section>

            <div className={styles.tabs} role="tablist" aria-label="Template views">
                {(['All Templates', 'My Templates'] as const).map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? styles.tabActive : styles.tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
            </div>

            <div className={styles.searchRow}>
                <label className={styles.searchBox}><Search size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search templates" /></label>
                <button className={styles.filterButton} aria-label="Filter templates" onClick={() => setShowFilterModal(true)}><SlidersHorizontal size={21} /></button>
            </div>

            {error && <p style={{ color: '#b42318', padding: '10px 12px', background: '#fef3f2', borderRadius: '8px', marginTop: '14px', fontSize: '13px' }} role="alert">{error}</p>}

            <section className={styles.packageList}>
                {isLoading && !showDummyData ? <div className={styles.loader}><Loader2 className="animate-spin" size={28} /></div>
                    : displayedTemplates.length ? displayedTemplates.map((pkg) => (
                        <article className={styles.packageCard} key={pkg._id}>
                            <div className={styles.packageImage}>
                                {pkg.coverImageUrl ? <img src={pkg.coverImageUrl} alt="" /> : <div className={styles.imageFallback}><Layers3 size={38} /></div>}
                                <span className={styles.templateBadge}>• TEMPLATE</span>
                                <button className={styles.imageMenuButton} aria-label={`Actions for ${packageName(pkg)}`} onClick={() => setActionPackage(pkg)}><MoreVertical size={22} /></button>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.packageMeta}>
                                    <span className={styles.vendorTypeBadge}>
                                        <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/makeup.png" alt="" style={{width: 14, height: 14}} />
                                        {pkg.vendorTypeLabel || 'VENDOR'}
                                    </span>
                                </div>
                                <h2>{packageName(pkg)}</h2>
                                <p>{pkg.note || 'No notes available'}</p>
                                <button className={styles.cardPrimaryButton} disabled={busyPackageId === pkg._id} onClick={() => openTemplate(pkg)}>{busyPackageId === pkg._id ? 'Creating Package...' : 'Use this template'}</button>
                            </div>
                        </article>
                    )) : <div className={styles.emptyState}><FileText size={36} strokeWidth={1.3} /><h2>No templates yet</h2><p>Templates will appear here once available.</p></div>}
            </section>

            {/* Action Sheet Modal */}
            {actionPackage && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setActionPackage(null)}><section className={styles.actionSheet} role="dialog" aria-modal="true" aria-label="Template actions" onMouseDown={(event) => event.stopPropagation()}>
                <button className={styles.sheetClose} aria-label="Close" onClick={() => setActionPackage(null)}><X size={21} /></button>
                <button onClick={() => { console.log('Edit template', actionPackage._id); setActionPackage(null); }}><Edit3 size={20} />Edit Template</button>
                <button className={styles.deleteAction} onClick={() => deleteTemplate(actionPackage)} disabled={busyPackageId === actionPackage._id}><Trash2 size={20} />Delete Template</button>
            </section></div>}

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

export default function TemplatesPage() { return <Suspense fallback={null}><TemplatesContent /></Suspense>; }
