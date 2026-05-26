'use client';
import { apiUrl } from '@/lib/api';

import { Suspense, useState, useEffect } from 'react';
import { Bell, Edit3, Eye, FileText, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import CreateServiceModal from '@/components/CreateServiceModal';

interface PackageData {
    _id: string;
    packageStatus: string;
    vendorType: string;
    bookingType: string;
    updatedAt: string;
    step1_eventAndCrew?: {
        packageName?: string;
    };
}

function InventoryContent() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'Created' | 'Drafts' | 'Deleted'>('Created');
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setIsCreateModalOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchPackages = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) {
                setIsLoading(false);
                return;
            }
            try {
                // Fetch all packages for the vendor
                const res = await fetch(apiUrl(`/packages/vendor/${vendorId}`));
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'SUCCESS') {
                        setPackages(data.packages || []);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch packages:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // Filter packages based on active tab
    const displayedPackages = packages.filter(pkg => {
        if (activeTab === 'Created') return pkg.packageStatus === 'Live' || pkg.packageStatus === 'Under Review';
        if (activeTab === 'Drafts') return pkg.packageStatus === 'Draft';
        if (activeTab === 'Deleted') return pkg.packageStatus === 'Deleted';
        return false;
    });

    const handleResumeDraft = (pkg: PackageData) => {
        // We can just open the flow for that vendor type. 
        // The flow component will automatically load the draft for that vendor.
        router.push(`/dashboard/packages/flows?vendorType=${pkg.vendorType}&bookingType=${pkg.bookingType}`);
    };

    return (
        <div style={{ backgroundColor: 'white', paddingBottom: '96px', minHeight: '100vh' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px' }}>
                <img
                    src="https://dkuacgndftndz.cloudfront.net/inventory-page/new-logo.jpg"
                    alt="Eventory"
                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '50%' }}
                />
                <button style={{ padding: '8px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                    <Bell size={24} color="#111" />
                </button>
            </div>

            {/* Page Title */}
            <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#000', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>Services</h1>
                    <p style={{ fontSize: '18px', color: '#9f9fa9', fontWeight: 400 }}>View and manage your services</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ backgroundColor: '#09090b', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: 'none' }}
                >
                    Add New
                </button>
            </div>

            {/* Segmented Control Tabs */}
            <div style={{ padding: '0 24px 24px' }}>
                <div style={{ display: 'flex', backgroundColor: '#f4f4f5', borderRadius: '10px', padding: '6px', gap: '2px' }}>
                    {(['Created', 'Drafts', 'Deleted'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                backgroundColor: activeTab === tab ? '#0a0a0a' : 'transparent',
                                color: activeTab === tab ? 'white' : '#a1a1aa',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
            ) : displayedPackages.length > 0 ? (
                <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayedPackages.map((pkg) => (
                        <div key={pkg._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: '1px solid #E4E4E7', borderRadius: '16px', backgroundColor: '#FAFAFA' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E4E4E7' }}>
                                    <FileText size={24} color="#3F3F47" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#030303', margin: '0 0 4px 0', fontFamily: 'Figtree, sans-serif' }}>
                                        {pkg.step1_eventAndCrew?.packageName || 'Untitled Package'}
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#71717B', margin: 0, fontFamily: 'Figtree, sans-serif' }}>
                                        {pkg.vendorType} • {pkg.bookingType} • Last updated {new Date(pkg.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            {activeTab === 'Drafts' ? (
                                <button 
                                    onClick={() => handleResumeDraft(pkg)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', border: '1px solid #E4E4E7', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#030303', cursor: 'pointer' }}
                                >
                                    <Edit3 size={16} /> Resume
                                </button>
                            ) : (
                                <span style={{ padding: '6px 12px', backgroundColor: pkg.packageStatus === 'Live' ? '#dcfce7' : '#fef08a', color: pkg.packageStatus === 'Live' ? '#166534' : '#854d0e', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                                    {pkg.packageStatus}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 24px 48px', textAlign: 'center' }}>
                    <img
                        src="https://dkuacgndftndz.cloudfront.net/inventory-page/services_home_page.jpg"
                        alt="Welcome"
                        style={{ width: '200px', height: '180px', objectFit: 'contain', marginBottom: '24px' }}
                    />
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#030303', marginBottom: '12px', lineHeight: 1.3 }}>
                        No {activeTab} Found
                    </h2>
                    <p style={{ fontSize: '14px', color: '#3f3f47', marginBottom: '32px', lineHeight: 1.6, maxWidth: '280px' }}>
                        {activeTab === 'Created' 
                            ? "To Start getting your bookings you will have to list your service" 
                            : `You don't have any ${activeTab.toLowerCase()} right now.`}
                    </p>
                    {activeTab === 'Created' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            style={{
                                width: '280px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#09090b', color: '#fafafa', border: 'none', borderRadius: '8px',
                                fontSize: '16px', fontWeight: 500, cursor: 'pointer'
                            }}
                        >
                            Create Package
                        </button>
                    )}
                </div>
            )}

            <CreateServiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

export default function InventoryPage() {
    return (
        <Suspense fallback={null}>
            <InventoryContent />
        </Suspense>
    );
}
