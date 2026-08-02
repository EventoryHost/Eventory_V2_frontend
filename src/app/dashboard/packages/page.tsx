'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';
import { Plus, Package, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

interface PackageItem {
    _id: string;
    packageName?: string;
    packageType?: string;
    packageStatus?: string;
    step1_eventAndCrew?: { packageName?: string };
    step1_basicDetails?: { packageName?: string };
    createdAt?: string;
    updatedAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    Draft: { label: 'Draft', color: '#71717B', bg: '#F4F4F5', icon: <Clock size={12} /> },
    Under_Review: { label: 'Under Review', color: '#D97706', bg: '#FEF3C7', icon: <Clock size={12} /> },
    IN_REVIEW: { label: 'Under Review', color: '#D97706', bg: '#FEF3C7', icon: <Clock size={12} /> },
    Active: { label: 'Active', color: '#16A34A', bg: '#F0FDF4', icon: <CheckCircle size={12} /> },
    Rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: <AlertCircle size={12} /> },
};

export default function PackagesPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<PackageItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPackages = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            if (!vendorId) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(apiUrl(`/packages/vendor/${vendorId}`));
                const data = await res.json();
                if (data.status === 'SUCCESS') {
                    setPackages(data.packages || []);
                } else {
                    setError('Failed to load packages');
                }
            } catch (err) {
                setError('Error fetching packages');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const getPackageName = (pkg: PackageItem) =>
        pkg.step1_eventAndCrew?.packageName ||
        pkg.step1_basicDetails?.packageName ||
        pkg.packageName ||
        'Untitled Package';

    const getStatusConfig = (status?: string) =>
        STATUS_CONFIG[status || 'Draft'] || STATUS_CONFIG['Draft'];

    return (
        <div className="min-h-screen bg-[#F9F9F9]" style={{ fontFamily: 'Figtree, sans-serif' }}>
            {/* Header */}
            <div className="bg-white border-b border-[#F4F4F5] px-5 pt-12 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#04222D] m-0">My Packages</h1>
                        <p className="text-[13px] text-[#71717B] m-0 mt-0.5">
                            {packages.length} package{packages.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/packages/new')}
                        className="flex items-center gap-2 bg-[#04222D] text-white text-[13px] font-bold px-4 py-2.5 rounded-[10px] active:scale-95 transition-transform"
                    >
                        <Plus size={16} />
                        New
                    </button>
                </div>
            </div>

            <div className="px-4 py-5">
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-[16px] h-[90px] animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-[#71717B] text-[14px]">{error}</div>
                ) : packages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                            <Package size={28} color="#A1A1AA" />
                        </div>
                        <div className="text-center">
                            <p className="text-[16px] font-bold text-[#04222D] m-0">No packages yet</p>
                            <p className="text-[13px] text-[#71717B] m-0 mt-1">Create your first package to get started</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/packages/new')}
                            className="flex items-center gap-2 bg-[#04222D] text-white text-[13px] font-bold px-5 py-3 rounded-[12px] active:scale-95 transition-transform mt-2"
                        >
                            <Plus size={16} />
                            Create Package
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {packages.map((pkg) => {
                            const statusCfg = getStatusConfig(pkg.packageStatus);
                            return (
                                <button
                                    key={pkg._id}
                                    onClick={() => router.push('/dashboard/packages/new')}
                                    className="bg-white border border-[#F4F4F5] rounded-[16px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                                >
                                    <div className="w-10 h-10 rounded-[10px] bg-[#F0FDF4] flex items-center justify-center shrink-0">
                                        <Package size={18} color="#16A34A" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-bold text-[#04222D] m-0 truncate">
                                            {getPackageName(pkg)}
                                        </p>
                                        <p className="text-[12px] text-[#71717B] m-0 mt-0.5">
                                            {pkg.packageType || 'Package'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div
                                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold"
                                            style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
                                        >
                                            {statusCfg.icon}
                                            {statusCfg.label}
                                        </div>
                                        <ChevronRight size={16} color="#A1A1AA" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
