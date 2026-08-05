import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Settings, X, Copy, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { apiUrl } from '@/lib/api';

interface Variant {
    _id: string;
    variantType: string;
    packageGroupId: string;
    [key: string]: any;
}

interface VariantManagerProps {
    packageId: string;
    packageGroupId: string;
    vendorType: string;
    onVariantChange: (newPackageId: string) => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
    packageId,
    packageGroupId,
    vendorType,
    onVariantChange
}) => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSelectVariantModalOpen, setIsSelectVariantModalOpen] = useState(false);
    
    // Modal states
    const [activeActionModal, setActiveActionModal] = useState<'options' | 'choose' | 'name' | null>(null);
    const [selectedVariantForAction, setSelectedVariantForAction] = useState<Variant | null>(null);
    const [actionType, setActionType] = useState<'create' | 'duplicate' | 'rename' | null>(null);
    
    // Form states
    const [selectedVariantType, setSelectedVariantType] = useState('Standard');
    const [variantName, setVariantName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (packageGroupId) {
            fetchVariants();
        }
    }, [packageGroupId, packageId]);

    const safeVariants = Array.isArray(variants) ? variants : [];
    const activeVariant = safeVariants.find(v => v._id === packageId) || safeVariants[0];

    const fetchVariants = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`/packages/group/${packageGroupId}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'SUCCESS') {
                    setVariants(Array.isArray(data.packages) ? data.packages : []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch variants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getVariantDescription = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('premium')) return 'Includes your most complete offering with all key services and add-ons.';
        if (lowerType.includes('standard')) return 'A balanced package with the services most customers choose.';
        if (lowerType.includes('basic')) return 'An affordable option with the essential services included.';
        return 'A customized package offering tailored to specific client needs.';
    };

    const handleActionSubmit = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        try {
            let res;
            if (actionType === 'create') {
                // To create a blank variant, we initialize a new package in the same group
                const vendorId = localStorage.getItem('vendor_id') || localStorage.getItem('service_id');
                const pName = activeVariant?.step1_eventAndCrew?.packageName || 'Untitled Package';
                
                res = await fetch(apiUrl('/packages/initialize'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        vendorId,
                        vendorType,
                        packageName: pName,
                        variantType: variantName || selectedVariantType,
                        packageGroupId: packageGroupId
                    })
                });
            } else if (actionType === 'duplicate' && selectedVariantForAction) {
                res = await fetch(apiUrl(`/packages/${selectedVariantForAction._id}/duplicate-variant`), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ variantType: variantName || selectedVariantType })
                });
            } else if (actionType === 'rename' && selectedVariantForAction) {
                res = await fetch(apiUrl(`/packages/${selectedVariantForAction._id}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ variantType: variantName })
                });
            }

            if (res && res.ok) {
                const data = await res.json();
                await fetchVariants();
                
                // If creating or duplicating, switch to the new variant
                if (actionType !== 'rename' && data.packageId) {
                    onVariantChange(data.packageId);
                }
                
                closeAllModals();
            } else {
                alert('Action failed. ' + (res ? await res.text() : ''));
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (variantId: string) => {
        if (!confirm('Are you sure you want to delete this variant?')) return;
        
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(apiUrl(`/packages/${variantId}/permanent`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const remaining = variants.filter(v => v._id !== variantId);
                if (variantId === packageId && remaining.length > 0) {
                    onVariantChange(remaining[0]._id);
                }
                await fetchVariants();
                closeAllModals();
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const closeAllModals = () => {
        setActiveActionModal(null);
        setIsSelectVariantModalOpen(false);
        setSelectedVariantForAction(null);
        setActionType(null);
        setVariantName('');
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (isLoading && variants.length === 0) {
        return <div className="mb-6 animate-pulse bg-gray-200 h-10 w-32 rounded-full"></div>;
    }

    return (
        <div className="mb-6">
            <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-gray-500 font-figtree">Variants</span>
                <button
                    type="button"
                    onClick={() => setIsSelectVariantModalOpen(true)}
                    className="flex items-center justify-between w-[140px] bg-[#F4F4F5] px-4 py-2.5 rounded-full font-medium text-[15px] font-figtree"
                >
                    {activeVariant?.variantType || 'Premium'}
                    <ChevronDown size={18} className="text-gray-600" />
                </button>
            </div>

            {isMounted && typeof document !== 'undefined' && createPortal(
                <>
                    {/* Select Variant Modal */}
                    {isSelectVariantModalOpen && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex flex-col justify-end">
                            <div className="bg-white rounded-t-3xl w-full max-w-[448px] mx-auto min-h-[50vh] p-6 relative animate-slide-up pb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <button type="button" onClick={() => setIsSelectVariantModalOpen(false)} className="p-2 -ml-2">
                                        <X size={24} />
                                    </button>
                                    <h2 className="text-lg font-bold font-figtree">Select Variant</h2>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setActionType('create');
                                            setActiveActionModal('choose');
                                        }}
                                        className="p-2 -mr-2"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                    {(variants.length > 0 ? variants : [{ _id: packageId, variantType: 'Premium', packageGroupId }]).map(variant => (
                                        <div 
                                            key={variant._id} 
                                            className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                                                variant._id === packageId ? 'border-black shadow-sm' : 'border-gray-200'
                                            }`}
                                            onClick={(e) => {
                                                // Ignore clicks on the settings gear
                                                if ((e.target as HTMLElement).closest('.settings-btn')) return;
                                                if (variant._id !== packageId) onVariantChange(variant._id);
                                                setIsSelectVariantModalOpen(false);
                                            }}
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-bold font-figtree text-[15px] mb-1">{variant.variantType}</h3>
                                                <p className="text-[13px] text-gray-500 font-figtree leading-tight">
                                                    {getVariantDescription(variant.variantType)}
                                                </p>
                                            </div>
                                            <button 
                                                type="button"
                                                className="settings-btn p-2 text-gray-400 hover:text-black transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVariantForAction(variant);
                                                    setActiveActionModal('options');
                                                }}
                                            >
                                                <Settings size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Options Modal (Duplicate/Rename/Delete) */}
                    {activeActionModal === 'options' && selectedVariantForAction && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex flex-col justify-end">
                            <div className="bg-white rounded-t-3xl w-full max-w-[448px] mx-auto p-6 relative animate-slide-up pb-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <button type="button" onClick={() => setActiveActionModal(null)} className="p-2 -ml-2">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <h2 className="text-[17px] font-bold font-figtree">{selectedVariantForAction.variantType} Variant</h2>
                                </div>
                                
                                <div className="space-y-2">
                                    <button 
                                        type="button"
                                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                        onClick={() => {
                                            setActionType('duplicate');
                                            setVariantName('');
                                            setActiveActionModal('name');
                                        }}
                                    >
                                        <Copy size={20} className="text-gray-600" />
                                        <span className="font-medium font-figtree text-[15px]">Duplicate this variant</span>
                                    </button>
                                    <button 
                                        type="button"
                                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                        onClick={() => {
                                            setActionType('rename');
                                            setVariantName(selectedVariantForAction.variantType);
                                            setActiveActionModal('name');
                                        }}
                                    >
                                        <Edit2 size={20} className="text-gray-600" />
                                        <span className="font-medium font-figtree text-[15px]">Rename Variant</span>
                                    </button>
                                    <button 
                                        type="button"
                                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                        onClick={() => handleDelete(selectedVariantForAction._id)}
                                        disabled={isProcessing || variants.length === 1}
                                    >
                                        <Trash2 size={20} className="text-red-500" />
                                        <span className="font-medium font-figtree text-[15px] text-red-500">
                                            {variants.length === 1 ? 'Cannot delete last variant' : 'Delete Variant'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Choose Variant Type Modal */}
                    {activeActionModal === 'choose' && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10001] flex flex-col justify-end">
                            <div className="bg-white rounded-t-3xl w-full max-w-[448px] mx-auto p-6 relative animate-slide-up pb-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <button type="button" onClick={() => setActiveActionModal(actionType === 'create' ? null : 'options')} className="p-2 -ml-2">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <h2 className="text-lg font-bold font-figtree">New Variant</h2>
                                </div>
                                
                                <div className="mb-8">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-figtree">Action Required</p>
                                    <h3 className="text-[22px] font-bold font-figtree mb-2">Choose the Variant</h3>
                                    <p className="text-gray-500 text-[14px] font-figtree mb-6">Enter the type of variant you want to add.</p>
                                    
                                    <p className="text-[13px] font-medium text-gray-600 mb-2 font-figtree">Variant Type</p>
                                    <div className="relative">
                                        <select
                                            value={selectedVariantType}
                                            onChange={(e) => {
                                                setSelectedVariantType(e.target.value);
                                                if (e.target.value !== 'Custom') {
                                                    setVariantName(e.target.value);
                                                } else {
                                                    setVariantName('');
                                                }
                                            }}
                                            className="w-full border border-gray-300 rounded-xl p-4 appearance-none bg-white font-figtree text-[15px] focus:outline-none focus:border-black"
                                        >
                                            <option value="Premium">Premium</option>
                                            <option value="Standard">Standard</option>
                                            <option value="Basic">Basic</option>
                                            <option value="Custom">Custom</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                                    </div>

                                    {selectedVariantType === 'Custom' && (
                                        <div className="mt-4 animate-fade-in">
                                            <p className="text-[13px] font-medium text-gray-600 mb-2 font-figtree">Custom Name</p>
                                            <input
                                                type="text"
                                                value={variantName}
                                                onChange={(e) => setVariantName(e.target.value)}
                                                placeholder="e.g. VIP, Platinum"
                                                className="w-full border border-gray-300 rounded-xl p-4 font-figtree text-[15px] focus:outline-none focus:border-black transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedVariantType === 'Custom' && !variantName.trim()) {
                                            alert("Please enter a custom name");
                                            return;
                                        }
                                        handleActionSubmit();
                                    }}
                                    disabled={isProcessing}
                                    className="w-full bg-[#04222D] text-white py-4 rounded-xl font-bold font-figtree text-[16px] disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : 'Create Variant'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Name/Rename Variant Modal */}
                    {activeActionModal === 'name' && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10002] flex flex-col justify-end">
                            <div className="bg-white rounded-t-3xl w-full max-w-[448px] mx-auto p-6 relative animate-slide-up pb-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <button 
                                        type="button"
                                        onClick={() => setActiveActionModal('options')} 
                                        className="p-2 -ml-2"
                                    >
                                        <ArrowLeft size={24} />
                                    </button>
                                    <h2 className="text-lg font-bold font-figtree">
                                        {actionType === 'rename' ? 'Rename Variant' : 'New Variant'}
                                    </h2>
                                </div>
                                
                                <div className="mb-8">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-figtree">Action Required</p>
                                    <h3 className="text-[22px] font-bold font-figtree mb-2">
                                        {actionType === 'rename' ? 'Rename Variant' : 'Name this Variant'}
                                    </h3>
                                    <p className="text-gray-500 text-[14px] font-figtree mb-6">
                                        Enter a new name for this variant to keep it organized
                                    </p>
                                    
                                    <p className="text-[13px] font-medium text-gray-600 mb-2 font-figtree">Variant Name</p>
                                    <input
                                        type="text"
                                        value={variantName}
                                        onChange={(e) => setVariantName(e.target.value)}
                                        placeholder="e.g. Standard"
                                        className="w-full border border-gray-300 rounded-xl p-4 font-figtree text-[15px] focus:outline-none focus:border-black"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleActionSubmit}
                                    disabled={isProcessing || !variantName.trim()}
                                    className="w-full bg-[#04222D] text-white py-4 rounded-xl font-bold font-figtree text-[16px] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}} />
        </div>
    );
};
