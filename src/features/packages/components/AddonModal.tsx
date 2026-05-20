import React from 'react';
import { ArrowLeft, Upload, FileText, X, ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

import { PolicyFile, SampleMediaFile } from '../shared/types';

export interface Addon {
    id: string;
    type: 'Service' | 'Product';
    name: string;
    category: string;
    subCategory: string;
    quantity: string;
    description: string;
    price: string;
    billingUnit: string;
    policies: PolicyFile[];
    media: SampleMediaFile[];
    productType?: string;
}

interface AddonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addon: Addon) => void;
    vendorType: string;
    addon?: Addon | null;
}

export function AddonModal({ isOpen, onClose, onSave, vendorType, addon }: AddonModalProps) {
    const [addonType, setAddonType] = React.useState<'Service' | 'Product'>('Service');
    const [addonName, setAddonName] = React.useState('');
    const [addonCategory, setAddonCategory] = React.useState('');
    const [addonSubCategory, setAddonSubCategory] = React.useState('');
    const [addonQuantity, setAddonQuantity] = React.useState('');
    const [addonDescription, setAddonDescription] = React.useState('');
    const [addonPrice, setAddonPrice] = React.useState('');
    const [addonBillingUnit, setAddonBillingUnit] = React.useState('Per hour');
    const [addonPolicies, setAddonPolicies] = React.useState<PolicyFile[]>([]);
    const [addonMedia, setAddonMedia] = React.useState<SampleMediaFile[]>([]);
    const [addonProductType, setAddonProductType] = React.useState<string>('Food');

    const addonPolicyInputRef = React.useRef<HTMLInputElement>(null);
    const addonMediaInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            if (addon) {
                setAddonType(addon.type);
                setAddonName(addon.name);
                setAddonCategory(addon.category);
                setAddonSubCategory(addon.subCategory);
                setAddonQuantity(addon.quantity);
                setAddonDescription(addon.description);
                setAddonPrice(addon.price);
                setAddonBillingUnit(addon.billingUnit);
                setAddonPolicies(addon.policies);
                setAddonMedia(addon.media);
                setAddonProductType(addon.productType || 'Food');
            } else {
                setAddonType('Service');
                setAddonName('');
                setAddonCategory('');
                setAddonSubCategory('');
                setAddonQuantity('');
                setAddonDescription('');
                setAddonPrice('');
                setAddonBillingUnit('Per hour');
                setAddonPolicies([]);
                setAddonMedia([]);
                setAddonProductType('Food');
            }
        }
    }, [isOpen, addon]);

    if (!isOpen || typeof document === 'undefined') return null;

    const handleSaveAddon = () => {
        const newAddon: Addon = {
            id: addon ? addon.id : Math.random().toString(36).substring(7),
            type: addonType,
            name: addonName,
            category: addonCategory,
            subCategory: addonSubCategory,
            quantity: addonQuantity,
            description: addonDescription,
            price: addonPrice,
            billingUnit: addonBillingUnit,
            policies: addonPolicies,
            media: addonMedia,
            ...(addonType === 'Product' && { productType: addonProductType })
        };
        onSave(newAddon);
    };

    const handleAddonPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                name: file.name,
                size: file.size,
                file: file
            }));
            setAddonPolicies(prev => [...prev, ...filesArray]);
        }
        if (addonPolicyInputRef.current) addonPolicyInputRef.current.value = '';
    };

    const removeAddonPolicy = (indexToRemove: number) => {
        setAddonPolicies(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleAddonMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                file,
                name: file.name,
                size: file.size,
                preview: URL.createObjectURL(file)
            }));
            setAddonMedia(prev => [...prev, ...filesArray]);
        }
        if (addonMediaInputRef.current) addonMediaInputRef.current.value = '';
    };

    const removeAddonMedia = (indexToRemove: number) => {
        setAddonMedia(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[indexToRemove].preview);
            newFiles.splice(indexToRemove, 1);
            return newFiles;
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return createPortal(
        <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-32 relative bg-white">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center p-6 border-b border-gray-100">
                    <button onClick={onClose} className="mr-4">
                        <ArrowLeft size={24} className="text-[#030303]" />
                    </button>
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Add-on</h2>
                </div>

                <div className="p-6 flex flex-col gap-8">
                    {/* ADD-ON TYPE */}
                    <div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-3">ADD-ON TYPE</p>
                        <div className="flex bg-[#F4F4F5] rounded-[12px] p-1 relative">
                            <button
                                onClick={() => setAddonType('Service')}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Service' ? 'text-white' : 'text-[#71717B]'}`}
                            >
                                Service
                            </button>
                            <button
                                onClick={() => setAddonType('Product')}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === 'Product' ? 'text-white' : 'text-[#71717B]'}`}
                            >
                                Product
                            </button>
                            <div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#030303] rounded-[10px] transition-transform duration-300 ease-in-out"
                                style={{ transform: addonType === 'Service' ? 'translateX(0)' : 'translateX(100%)' }}
                            />
                        </div>
                    </div>

                    {/* Basic Details */}
                    <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7] flex flex-col gap-4">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-2">Basic Details</h3>
                        
                        <div>
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">{addonType === 'Service' ? 'Service Name' : 'Product Name'}</label>
                            <input
                                type="text"
                                placeholder={addonType === 'Service' ? "Package Name" : "Product Name"}
                                value={addonName}
                                onChange={(e) => setAddonName(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Category</label>
                                <input
                                    type="text"
                                    placeholder="Name Category"
                                    value={addonCategory}
                                    onChange={(e) => setAddonCategory(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                />
                            </div>
                            <div className="flex-1">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Sub-Category</label>
                                <input
                                    type="text"
                                    placeholder="Sub Category"
                                    value={addonSubCategory}
                                    onChange={(e) => setAddonSubCategory(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Quantity</label>
                            <input
                                type="text"
                                placeholder="No. of Products"
                                value={addonQuantity}
                                onChange={(e) => setAddonQuantity(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                            />
                        </div>

                        <div>
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Add Description"
                                value={addonDescription}
                                onChange={(e) => setAddonDescription(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none"
                            />
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-2">Helper Text according to Input field.</p>
                        </div>
                    </div>

                    {/* Choose Type (Product Only, Caterer flow only) */}
                    {addonType === 'Product' && vendorType === 'CAT' && (
                        <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7] flex flex-col gap-4">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Choose Type</h3>
                            
                            <div className="flex flex-col gap-3">
                                {['Food', 'Drinks', 'Other'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setAddonProductType(type)}
                                        className="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[8px] transition-colors hover:bg-gray-50 w-full text-left"
                                    >
                                        <div className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${addonProductType === type ? 'bg-[#030303] border-[#030303]' : 'border-[#D4D4D8] bg-white'}`}>
                                            {addonProductType === type && <Check size={14} strokeWidth={3} className="text-white" />}
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303]">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing Model */}
                    <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7] flex flex-col gap-4">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-2">Pricing Model</h3>
                        
                        <div>
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Add-on Price</label>
                            <input
                                type="text"
                                placeholder="$ 0.0"
                                value={addonPrice}
                                onChange={(e) => setAddonPrice(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                            />
                        </div>

                        <div>
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-semibold text-[#3F3F47] mb-2">Billing Unit</label>
                            <div className="relative">
                                <select
                                    value={addonBillingUnit}
                                    onChange={(e) => setAddonBillingUnit(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-semibold text-[#9F9FA9] appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                >
                                    <option>Per hour</option>
                                    <option>Per day</option>
                                    <option>Per piece</option>
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* POLICIES & RULES */}
                    <div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-4">POLICIES & RULES</p>
                        <button onClick={() => addonPolicyInputRef.current?.click()} className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                <Upload size={24} className="text-[#3F3F47] stroke-2" />
                            </div>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Upload Policy Documents</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">PDF, DOC up to 10MB</p>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide">BROWSE FILES</span>
                        </button>
                        <input type="file" ref={addonPolicyInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleAddonPolicyUpload} multiple />

                        {addonPolicies.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {addonPolicies.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center border border-[#3F3F47] rounded-[4px] bg-white">
                                                <FileText size={16} className="text-[#3F3F47] stroke-2" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] break-all">{file.name}</p>
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)} _ Uploaded</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeAddonPolicy(idx)} className="text-[#3F3F47] hover:text-[#030303]">
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SAMPLE MEDIA */}
                    <div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-4">SAMPLE MEDIA</p>
                        <div className="bg-[#F4F4F5] p-4 rounded-[12px]">
                            <button onClick={() => addonMediaInputRef.current?.click()} className="w-full py-10 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                    <Upload size={24} className="text-[#3F3F47] stroke-2" />
                                </div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Browse or Drop media</p>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">High-res images and videos ( max 50 MB )</p>
                            </button>
                            <input type="file" ref={addonMediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleAddonMediaUpload} multiple />

                            {addonMedia.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {addonMedia.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[8px]">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeAddonMedia(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 z-20 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-4 w-full">
                        <button
                            onClick={onClose}
                            style={{ fontFamily: 'Figtree, sans-serif', padding: '16px 0' }}
                            className="flex-1 flex justify-center items-center bg-white border border-[#E4E4E7] text-[#030303] rounded-[12px] font-semibold text-[16px] active:scale-[0.98] transition-transform"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAddon}
                            style={{ fontFamily: 'Figtree, sans-serif', padding: '16px 0' }}
                            className="flex-[2_2_0%] flex justify-center items-center gap-4 bg-[#04222D] text-white rounded-[12px] font-semibold text-[16px] active:scale-[0.98] transition-transform"
                        >
                            Save Add-on
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
