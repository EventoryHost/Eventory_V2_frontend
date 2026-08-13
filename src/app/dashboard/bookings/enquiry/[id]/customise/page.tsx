'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Info, Check, X, Plus, RefreshCw, Edit2, ChevronRight, Upload } from 'lucide-react';
import { DUMMY_ENQUIRIES, DetailedEnquiry } from '../../../data/mockData';
import { apiUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AddonModal, Addon } from '@/features/packages/components/AddonModal';

function localFormatMoney(amount?: number) {
  if (amount === undefined || amount === null) return '0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

type ReqStatus = 'pending' | 'accepted' | 'rejected';
interface ReqItem {
  id: string;
  label: string;
  value: string;
  status: ReqStatus;
  image?: string;
}

export default function CustomiseProposalPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = params?.id as string;
  
  const [enquiry, setEnquiry] = useState<DetailedEnquiry | any>(null);

  // Request States
  const [additions, setAdditions] = useState<ReqItem[]>([]);
  const [exclusions, setExclusions] = useState<ReqItem[]>([]);
  const [groupedAdditions, setGroupedAdditions] = useState<any[]>([]);
  const [groupedExclusions, setGroupedExclusions] = useState<any[]>([]);

  // Pricing State
  const [pricing, setPricing] = useState({
    original: 0,
    itemsAdded: 0,
    addonsAdded: 0,
    substituteItemsAdded: 0,
    itemsRemoved: 0,
    addonsRemoved: 0,
    discount: 0,
  });

  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [overrideTotal, setOverrideTotal] = useState<number>(0);

  const [terms, setTerms] = useState('• Taxes \n');
  const [termsAttachmentUrl, setTermsAttachmentUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddonPanelOpen, setIsAddonPanelOpen] = useState(false);
  const [isCreatingNewAddon, setIsCreatingNewAddon] = useState(false);

  // Compute existing addons from the populated primary package
  const existingVendorAddons = useMemo(() => {
    if (!enquiry || !enquiry.primaryPackage) return [];
    
    const pkg = enquiry.primaryPackage;
    let rawAddons: any[] = [];
    
    if (pkg.step2_productsAndPricing?.addOns) {
      rawAddons = pkg.step2_productsAndPricing.addOns;
    } else if (pkg.step2_servicesAndPricing?.addOns) {
      rawAddons = pkg.step2_servicesAndPricing.addOns;
    } else if (pkg.step2_spacesAndPricing?.addOns) {
      rawAddons = pkg.step2_spacesAndPricing.addOns;
    } else if (pkg.step2_eventAndPricing?.addOns) {
      rawAddons = pkg.step2_eventAndPricing.addOns;
    }
    
    return rawAddons.map((a: any) => ({
      id: a._id || a.id || Math.random().toString(),
      name: a.name || a.addonName || a.type || 'Unnamed Addon',
      price: a.price || 0,
      desc: a.description || ''
    }));
  }, [enquiry]);

  const handleAddExistingAddon = (addon: any) => {
    setEnquiry((prev: any) => {
      if (!prev) return prev;
      const currentAddons = prev.customiseData?.addons || [];
      if (currentAddons.find((a: any) => a.name === addon.name)) return prev;
      
      const newAddons = [...currentAddons, {
        name: addon.name,
        price: Number(addon.price) || 0,
        desc: addon.description || addon.desc || '',
      }];
      
      return {
        ...prev,
        customiseData: {
          ...prev.customiseData,
          addons: newAddons
        }
      };
    });
    
    setPricing((prev: any) => ({
      ...prev,
      addonsAdded: prev.addonsAdded + (Number(addon.price) || 0)
    }));
    
    setIsAddonPanelOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok && data.url) {
        setTermsAttachmentUrl(data.url);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = {
        customiseData: {
          additions,
          exclusions,
          groupedAdditions,
          groupedExclusions,
          addons: enquiry.customiseData?.addons || [],
          equipments: enquiry.customiseData?.equipments || [],
        },
        pricing: {
          ...pricing,
          isOverrideEnabled,
          finalAmount,
        },
        termsAndPolicies: terms,
        termsAttachmentUrl,
        attachments: enquiry.attachments || [],
      };
      
      const res = await fetch(apiUrl(`/enquiries/${enquiryId}/draft`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Draft saved successfully!");
      } else {
        alert("Failed to save draft");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving draft");
    }
  };

  const handleSendProposal = async () => {
    try {
      const payload = {
        customiseData: {
          additions,
          exclusions,
          groupedAdditions,
          groupedExclusions,
          addons: enquiry.customiseData?.addons || [],
          equipments: enquiry.customiseData?.equipments || [],
        },
        pricing: {
          ...pricing,
          isOverrideEnabled,
          finalAmount,
        },
        termsAndPolicies: terms,
        termsAttachmentUrl,
        attachments: enquiry.attachments || [],
        customPrice: finalAmount,
      };
      
      const res = await fetch(apiUrl(`/enquiries/${enquiryId}/proposal`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Proposal Sent!");
        router.push('/dashboard/bookings');
      } else {
        alert("Failed to send proposal");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending proposal");
    }
  };

  useEffect(() => {
    async function fetchEnquiry() {
      try {
        const res = await fetch(apiUrl(`/enquiries/${enquiryId}`));
        const data = await res.json();
        if (data.status === 'SUCCESS' && (data.enquiry || data.data)) {
          const fetchedEnquiry = data.enquiry || data.data;
          setEnquiry(fetchedEnquiry);
          
          if (fetchedEnquiry.customiseData) {
            setAdditions(fetchedEnquiry.customiseData.additions || []);
            setExclusions(fetchedEnquiry.customiseData.exclusions || []);
            setGroupedAdditions(fetchedEnquiry.customiseData.groupedAdditions || []);
            setGroupedExclusions(fetchedEnquiry.customiseData.groupedExclusions || []);
          }
          
          if (fetchedEnquiry.proposal?.pricing) {
            setPricing({
              original: fetchedEnquiry.proposal.pricing.original || fetchedEnquiry.primaryPackage?.price || 0,
              itemsAdded: fetchedEnquiry.proposal.pricing.itemsAdded || 0,
              addonsAdded: fetchedEnquiry.proposal.pricing.addonsAdded || 0,
              substituteItemsAdded: fetchedEnquiry.proposal.pricing.substituteItemsAdded || 0,
              itemsRemoved: fetchedEnquiry.proposal.pricing.itemsRemoved || 0,
              addonsRemoved: fetchedEnquiry.proposal.pricing.addonsRemoved || 0,
              discount: fetchedEnquiry.proposal.pricing.discount || 0,
            });
            setIsOverrideEnabled(fetchedEnquiry.proposal.pricing.isOverrideEnabled || false);
            setOverrideTotal(fetchedEnquiry.proposal.pricing.finalAmount || 0);
          } else if (fetchedEnquiry.primaryPackage) {
             setPricing(prev => ({ ...prev, original: fetchedEnquiry.primaryPackage.price || 0 }));
          }

          if (fetchedEnquiry.proposal?.termsAndPolicies) {
             setTerms(fetchedEnquiry.proposal.termsAndPolicies);
          }
          if (fetchedEnquiry.proposal?.termsAttachmentUrl) {
             setTermsAttachmentUrl(fetchedEnquiry.proposal.termsAttachmentUrl);
          }
        } else {
          console.error("Failed to fetch enquiry", data);
        }
      } catch (err) {
        console.error("Error fetching enquiry:", err);
      }
    }
    fetchEnquiry();
  }, [enquiryId]);

  if (!enquiry) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin w-8 h-8 border-4 border-[#04222D] border-t-transparent rounded-full" /></div>;
  }

  // Calculate Totals
  const totalAdd = pricing.itemsAdded + pricing.addonsAdded + pricing.substituteItemsAdded;
  const totalRemove = pricing.itemsRemoved + pricing.addonsRemoved + pricing.discount;
  const subTotal = pricing.original + totalAdd - totalRemove;
  const gst = Math.round(subTotal * 0.18);
  const calculatedTotal = subTotal + gst;
  
  const finalAmount = isOverrideEnabled ? overrideTotal : calculatedTotal;

  const handleUpdateStatus = (type: 'add' | 'exclude', id: string, newStatus: ReqStatus) => {
    if (type === 'add') {
      setAdditions(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } else {
      setExclusions(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
  };

  const handleUpdateGroupedStatus = (type: 'add' | 'exclude', groupIndex: number, itemId: string, newStatus: ReqStatus) => {
    if (type === 'add') {
      setGroupedAdditions(prev => {
        const newGroups = [...prev];
        const group = { ...newGroups[groupIndex] };
        group.items = group.items.map((i: any) => i.id === itemId ? { ...i, status: newStatus } : i);
        newGroups[groupIndex] = group;
        return newGroups;
      });
    } else {
      setGroupedExclusions(prev => {
        const newGroups = [...prev];
        const group = { ...newGroups[groupIndex] };
        group.items = group.items.map((i: any) => i.id === itemId ? { ...i, status: newStatus } : i);
        newGroups[groupIndex] = group;
        return newGroups;
      });
    }
  };

  const renderReqItem = (item: ReqItem, type: 'add' | 'exclude') => {
    return (
      <div key={item.id} className="flex items-center justify-between bg-white border border-[#F0F0F1] rounded-[12px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          {item.image ? (
            <img src={item.image} alt={item.label} className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] object-cover" />
          ) : (
            <div className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] flex items-center justify-center text-xl">
              {type === 'add' ? '💄' : '💆‍♀️'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[#A1A1AA] text-[11px] font-medium">{item.label}</span>
            <span className="text-[#030303] text-[14px] font-bold">{item.value}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleUpdateStatus(type, item.id, 'accepted')}
            className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border transition-colors ${item.status === 'accepted' ? 'border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]' : 'border-[#E4E4E7] text-[#D4D4D8]'}`}
          >
            <Check size={16} strokeWidth={item.status === 'accepted' ? 3 : 2} />
          </button>
          <button 
            onClick={() => handleUpdateStatus(type, item.id, 'rejected')}
            className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border transition-colors ${item.status === 'rejected' ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-[#E4E4E7] text-[#D4D4D8]'}`}
          >
            <X size={16} strokeWidth={item.status === 'rejected' ? 3 : 2} />
          </button>
        </div>
      </div>
    );
  };

  const renderGroupedSection = (group: any, groupIndex: number, type: 'add' | 'exclude', showAll: boolean = true, filterStatus?: ReqStatus) => {
    const itemsToRender = showAll ? group.items : group.items.filter((i: any) => i.status === filterStatus);
    if (itemsToRender.length === 0) return null;

    return (
      <div key={`${type}-group-${groupIndex}`} className="flex flex-col gap-4 mt-2 mb-4">
        {group.dividerText && (
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
            <div className={`px-3 py-1 ${type === 'add' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'} text-[11px] font-bold rounded-full flex items-center gap-1`}>
              {type === 'add' ? <Plus size={12} strokeWidth={3} /> : <span className="text-[12px] leading-none mb-[1px]">🗑️</span>} {group.dividerText}
            </div>
            <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
          </div>
        )}
        
        {(group.title || group.subtitle) && (
          <div className="flex flex-col items-center justify-center">
            {group.title && <span className="text-[#030303] text-[12px] font-bold uppercase tracking-wider">{group.title}</span>}
            {group.subtitle && <span className="text-[#A1A1AA] text-[10px] font-medium mt-0.5">{group.subtitle}</span>}
          </div>
        )}

        {itemsToRender.map((item: any) => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-white border border-[#F0F0F1] rounded-[12px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col">
                <span className="text-[#A1A1AA] text-[11px] font-medium">{item.label}</span>
                <span className="text-[#030303] text-[14px] font-bold">{item.value}</span>
              </div>
              
              {showAll ? (
                <div className="flex items-center gap-2">
                  {item.hasColorPicker && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <div className="w-5 h-5 rounded-full bg-[#030303] border-2 border-[#030303] ring-2 ring-offset-1 ring-[#030303]"></div>
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-[#E4E4E7]"></div>
                    </div>
                  )}
                  <button 
                    onClick={() => handleUpdateGroupedStatus(type, groupIndex, item.id, 'accepted')}
                    className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border transition-colors ${item.status === 'accepted' ? 'border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]' : 'border-[#E4E4E7] text-[#D4D4D8]'}`}
                  >
                    <Check size={16} strokeWidth={item.status === 'accepted' ? 3 : 2} />
                  </button>
                  <button 
                    onClick={() => handleUpdateGroupedStatus(type, groupIndex, item.id, 'rejected')}
                    className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border transition-colors ${item.status === 'rejected' ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-[#E4E4E7] text-[#D4D4D8]'}`}
                  >
                    <X size={16} strokeWidth={item.status === 'rejected' ? 3 : 2} />
                  </button>
                </div>
              ) : (
                <button className="flex items-center gap-1 text-[#3B82F6] text-[11px] font-bold px-2 py-1 rounded-[8px] hover:bg-[#EFF6FF] transition-colors">
                  <RefreshCw size={12} /> Update
                </button>
              )}
            </div>
            
            {item.suggestedSubstitute && (
              <div className="bg-[#FAFAFA] rounded-[10px] p-3 mx-2 border border-[#E4E4E7] border-t-0 -mt-3 pt-4 z-0">
                <span className="text-[#A1A1AA] text-[10px] font-medium block">Suggested Substitute</span>
                <span className="text-[#030303] text-[12px] font-bold">{item.suggestedSubstitute}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const acceptedAdditions = additions.filter(i => i.status === 'accepted');
  const acceptedExclusions = exclusions.filter(i => i.status === 'accepted');
  const rejectedAdditions = additions.filter(i => i.status === 'rejected');
  const rejectedExclusions = exclusions.filter(i => i.status === 'rejected');

  const handlePricingChange = (key: keyof typeof pricing, val: string) => {
    const num = parseInt(val.replace(/\D/g, '')) || 0;
    setPricing(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col font-figtree pb-32">
      {/* Top Header */}
      <div className="w-full bg-white px-5 pt-14 pb-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft size={24} className="text-[#030303]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#030303]">Customise package</h1>
        </div>
        <button className="active:scale-95 transition-transform">
          <MoreVertical size={24} className="text-[#030303]" />
        </button>
      </div>

      <div className="px-5 flex flex-col gap-8 py-4">
        
        {/* Primary Package Card */}
        <div className="flex flex-col gap-3">
          <div className="border border-[#F0F0F1] rounded-[16px] p-4 flex flex-col gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <span className="text-[15px] font-bold text-[#030303]">Primary Package</span>
            {enquiry.primaryPackage && (
              <div className="bg-[#FAFAFA] rounded-[12px] p-3 flex gap-3 items-center border border-[#F4F4F5]">
                <img src={enquiry.primaryPackage.image} alt="" className="w-16 h-16 rounded-[8px] object-cover" />
                <div className="flex flex-col gap-1">
                  <span className="text-[#71717B] text-[13px] font-medium">{enquiry.primaryPackage.name}</span>
                  <span className="text-[#030303] text-[16px] font-bold">₹ {enquiry.primaryPackage.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
            <div className="bg-[#EFF6FF] rounded-[8px] p-3 flex gap-2">
              <Info size={16} className="text-[#3B82F6] shrink-0 mt-0.5" />
              <span className="text-[#3B82F6] text-[12px] font-medium leading-relaxed">
                Changes here are temporary and only apply to this specific proposal.
              </span>
            </div>
          </div>
        </div>

        {/* Reasons for Enquiry */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[#030303]">Reasons for Enquiry</h2>
          <div className="border border-[#F0F0F1] rounded-[16px] p-4 flex flex-col gap-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#F97316] text-[#F97316] bg-[#FFF7ED] flex items-center gap-1.5">
              <span className="text-[12px] mb-[1px]">%</span> Enquiry for Price
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[#71717B] text-[11px] font-medium">Expected budget</span>
              <span className="text-[#030303] text-[14px] font-bold">{enquiry.expectedBudgetStr || '—'}</span>
            </div>
            
            {enquiry.questionnaire?.map((q: any, i: number) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-[#71717B] text-[11px] font-medium">{q.question}</span>
                <span className="text-[#030303] text-[14px] font-bold leading-snug">{q.answer}</span>
              </div>
            ))}
            
            <div className="flex flex-col gap-2">
              <span className="text-[#71717B] text-[11px] font-medium">Message from customer</span>
              <div className="bg-[#FAFAFA] rounded-[12px] p-4 text-[#4B5563] text-[13px] leading-relaxed border border-[#F4F4F5]">
                "{enquiry.customerMessage || 'Say hello and ask a question about styling — looking for something elegant but not too over the top for a corporate crowd.'}"
              </div>
            </div>
          </div>
        </div>

        {/* Additions Requested */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[#030303]">Additions Requested</h2>
          <div className="flex flex-col gap-4 bg-[#FAFAFA] rounded-[16px] p-4 border border-[#F0F0F1]">
            {groupedAdditions.length === 0 && (
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
                <div className="px-3 py-1 bg-[#DCFCE7] text-[#16A34A] text-[11px] font-bold rounded-full flex items-center gap-1">
                  <Plus size={12} strokeWidth={3} /> Items to Add
                </div>
                <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
              </div>
            )}
            
            {enquiry.customiseData?.additionsTitle && (
              <span className="text-center text-[#71717B] text-[11px] font-bold uppercase tracking-wider mt-1">{enquiry.customiseData.additionsTitle}</span>
            )}
            
            {groupedAdditions.length > 0 
              ? groupedAdditions.map((group, i) => renderGroupedSection(group, i, 'add'))
              : additions.map(item => renderReqItem(item, 'add'))
            }
          </div>
        </div>

        {/* Exclusions Requested */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[#030303]">Exclusions Requested</h2>
          <div className="flex flex-col gap-4 bg-[#FAFAFA] rounded-[16px] p-4 border border-[#F0F0F1]">
            {groupedExclusions.length === 0 && (
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
                <div className="px-3 py-1 bg-[#FEE2E2] text-[#EF4444] text-[11px] font-bold rounded-full flex items-center gap-1">
                  <span className="text-[12px] leading-none mb-[1px]">🗑️</span> Items to Remove
                </div>
                <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
              </div>
            )}
            
            {enquiry.customiseData?.exclusionsTitle && (
              <span className="text-center text-[#71717B] text-[11px] font-bold uppercase tracking-wider mt-1">{enquiry.customiseData.exclusionsTitle}</span>
            )}
            
            {groupedExclusions.length > 0
              ? groupedExclusions.map((group, i) => renderGroupedSection(group, i, 'exclude'))
              : exclusions.map(item => renderReqItem(item, 'exclude'))
            }
          </div>
        </div>

        {/* Proposal Summary */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[#030303]">Proposal Summary</h2>
          
          <div className="border border-[#F0F0F1] rounded-[16px] p-5 flex flex-col gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            
            {/* Accepted Requests */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                  <Check size={16} strokeWidth={3} />
                </div>
                <h3 className="text-[#16A34A] text-[16px] font-bold">Accepted Requests</h3>
              </div>

              {groupedAdditions.length > 0 ? (
                groupedAdditions.map((group, i) => renderGroupedSection(group, i, 'add', false, 'accepted'))
              ) : acceptedAdditions.length > 0 && (
                <>
                  <div className="flex items-center justify-center mt-2">
                    <div className="px-3 py-1 bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Plus size={10} strokeWidth={3} /> Items to Add
                    </div>
                  </div>
                  {acceptedAdditions.map(item => (
                    <div key={item.id} className="flex items-center justify-between border border-[#F0F0F1] rounded-[12px] p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.label} className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] flex items-center justify-center text-xl">💄</div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[#A1A1AA] text-[11px] font-medium">{item.label}</span>
                          <span className="text-[#030303] text-[14px] font-bold">{item.value}</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-[#3B82F6] text-[11px] font-bold px-2 py-1 rounded-[8px] hover:bg-[#EFF6FF] transition-colors">
                        <RefreshCw size={12} /> Update
                      </button>
                    </div>
                  ))}
                </>
              )}

              {groupedExclusions.length > 0 ? (
                groupedExclusions.map((group, i) => renderGroupedSection(group, i, 'exclude', false, 'accepted'))
              ) : acceptedExclusions.length > 0 && (
                <>
                  <div className="flex items-center justify-center mt-4">
                    <div className="px-3 py-1 bg-[#FEE2E2] text-[#EF4444] text-[10px] font-bold rounded-full flex items-center gap-1">
                      <span className="text-[12px] leading-none mb-[1px]">🗑️</span> Items to Remove
                    </div>
                  </div>
                  {acceptedExclusions.map(item => (
                    <div key={item.id} className="flex items-center justify-between border border-[#F0F0F1] rounded-[12px] p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.label} className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] flex items-center justify-center text-xl">💆‍♀️</div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[#A1A1AA] text-[11px] font-medium">{item.label}</span>
                          <span className="text-[#030303] text-[14px] font-bold">{item.value}</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-[#3B82F6] text-[11px] font-bold px-2 py-1 rounded-[8px] hover:bg-[#EFF6FF] transition-colors">
                        <RefreshCw size={12} /> Update
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="h-[1px] bg-[#E4E4E7] w-full mt-2"></div>

            {/* Rejected Requests */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center">
                  <X size={16} strokeWidth={3} />
                </div>
                <h3 className="text-[#EF4444] text-[16px] font-bold">Rejected Requests</h3>
              </div>

              {groupedAdditions.length > 0 ? (
                groupedAdditions.map((group, i) => renderGroupedSection(group, i, 'add', false, 'rejected'))
              ) : rejectedAdditions.length > 0 && (
                <>
                  <div className="flex items-center justify-center mt-2">
                    <div className="px-3 py-1 bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Plus size={10} strokeWidth={3} /> Items to Add
                    </div>
                  </div>
                  {rejectedAdditions.map(item => (
                    <div key={item.id} className="flex items-center justify-between border border-[#F0F0F1] rounded-[12px] p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.label} className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] flex items-center justify-center text-xl">💄</div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[#A1A1AA] text-[11px] font-medium">{item.label}</span>
                          <span className="text-[#030303] text-[14px] font-bold">{item.value}</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-[#3B82F6] text-[11px] font-bold px-2 py-1 rounded-[8px] hover:bg-[#EFF6FF] transition-colors">
                        <RefreshCw size={12} /> Update
                      </button>
                    </div>
                  ))}
                </>
              )}

              {groupedExclusions.length > 0 ? (
                groupedExclusions.map((group, i) => renderGroupedSection(group, i, 'exclude', false, 'rejected'))
              ) : rejectedExclusions.length > 0 && (
                <>
                  <div className="flex items-center justify-center mt-4">
                    <div className="px-3 py-1 bg-[#FEE2E2] text-[#EF4444] text-[10px] font-bold rounded-full flex items-center gap-1">
                      <span className="text-[12px] leading-none mb-[1px]">🗑️</span> Items to Remove
                    </div>
                  </div>
                  {rejectedExclusions.map(item => (
                    <div key={item.id} className="flex items-center justify-between border border-[#F0F0F1] rounded-[12px] p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.label} className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-[#F4F4F5] rounded-[8px] flex items-center justify-center text-xl">💆‍♀️</div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[#A1A1AA] text-[11px] font-medium">{item.label}</span>
                          <span className="text-[#030303] text-[14px] font-bold">{item.value}</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-[#3B82F6] text-[11px] font-bold px-2 py-1 rounded-[8px] hover:bg-[#EFF6FF] transition-colors">
                        <RefreshCw size={12} /> Update
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

          </div>

        {/* Equipments Section */}
        {enquiry.customiseData?.equipments && enquiry.customiseData.equipments.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <h2 className="text-[14px] font-bold text-[#030303]">Equipment <span className="text-[#EF4444]">*</span></h2>
            {enquiry.customiseData.equipments.map((eq: any) => (
              <div key={eq.id} className="border border-[#F0F0F1] rounded-[16px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img src={eq.image} alt="" className="w-[52px] h-[52px] rounded-[12px] object-cover" />
                  <div className="flex flex-col">
                    <span className="text-[#030303] text-[14px] font-bold">{eq.name}</span>
                    <span className="text-[#A1A1AA] text-[11px] font-medium leading-none mb-1">{eq.desc}</span>
                    <span className="text-[#030303] text-[12px] font-bold">Quantity: {eq.qty}</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full border border-[#030303] flex items-center justify-center text-[#030303] active:bg-[#F4F4F5] transition-colors">
                  <div className="w-3 h-[2px] bg-[#030303]"></div>
                </button>
              </div>
            ))}
            <button className="w-full flex items-center justify-between border border-[#F0F0F1] rounded-[16px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:bg-[#FAFAFA] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-[12px] flex items-center justify-center">
                  <Plus size={20} className="text-[#030303]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[#030303] text-[14px] font-bold">Add a custom Equipment</span>
                  <span className="text-[#71717B] text-[11px] font-medium mt-0.5">e.g. Drone shot, Live streaming</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#A1A1AA]" />
            </button>
          </div>
        )}

        {/* Add-ons Section */}
        <div className="flex flex-col gap-3 mt-4">
          {enquiry.customiseData?.addons && enquiry.customiseData.addons.length > 0 && (
            <h2 className="text-[14px] font-bold text-[#030303]">Add-on <span className="text-[#EF4444]">*</span></h2>
          )}
          {enquiry.customiseData?.addons?.map((ad: any) => (
            <div key={ad.id} className="border border-[#F0F0F1] rounded-[16px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={ad.image} alt="" className="w-[52px] h-[52px] rounded-[12px] object-cover" />
                  <div className="flex flex-col">
                    <span className="text-[#030303] text-[14px] font-bold">{ad.name}</span>
                    <span className="text-[#A1A1AA] text-[11px] font-medium leading-none mb-1">{ad.desc}</span>
                    <span className="text-[#030303] text-[12px] font-bold">₹ {ad.price}{enquiry.enquiryId === 'EVT-ENQ-PAV005' ? '/hr' : ''}</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full border border-[#030303] flex items-center justify-center text-[#030303] active:bg-[#F4F4F5] transition-colors">
                  <div className="w-3 h-[2px] bg-[#030303]"></div>
                </button>
              </div>
              
              {ad.fields && ad.fields.length > 0 && (
                <>
                  <div className="w-full border-t border-dashed border-[#E4E4E7]"></div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {ad.fields.map((field: any, idx: number) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[#A1A1AA] text-[10px] font-medium leading-none mb-1">{field.label}</span>
                        <span className="text-[#030303] text-[12px] font-bold leading-none">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <button onClick={() => setIsAddonPanelOpen(true)} className="w-full flex items-center justify-between border border-[#F0F0F1] rounded-[16px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F4F4F5] rounded-[12px] flex items-center justify-center">
                <Plus size={20} className="text-[#030303]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[#030303] text-[14px] font-bold">Add a custom Add-on</span>
                <span className="text-[#71717B] text-[11px] font-medium mt-0.5">e.g. Drone shot, Live streaming</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#A1A1AA]" />
          </button>
        </div>
      </div>

        {/* Additional Media */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#030303]">Additional Media</h2>
            <Edit2 size={16} className="text-[#A1A1AA] cursor-pointer" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {enquiry.attachments && enquiry.attachments.length > 0 ? enquiry.attachments.map((att: any, idx: number) => (
              <div key={idx} className="w-[110px] h-[130px] rounded-[12px] bg-[#F4F4F5] shrink-0 relative overflow-hidden group shadow-sm border border-[#E4E4E7]">
                {att.url.includes('unsplash') || att.url.includes('loremflickr') || att.url.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                  <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#A1A1AA]">
                    <div className="w-10 h-10 rounded-full border border-[#D4D4D8] flex items-center justify-center bg-white shadow-sm">
                      <span className="text-[18px] leading-none mb-0.5">🖼️</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <span className="text-white text-[10px] font-medium truncate block">{att.name}</span>
                </div>
              </div>
            )) : (
              <div className="text-[12px] text-[#A1A1AA] italic p-2">No additional media attached.</div>
            )}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[#030303]">Pricing Breakdown</h2>
          <div className="border border-[#F0F0F1] rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-5">
            
            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Original Package Price</span>
              <span className="text-[#030303] text-[15px] font-bold">{localFormatMoney(pricing.original)}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
              <span className="text-[#71717B] text-[11px] font-bold">Price to add</span>
              <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Items Added</span>
              <input 
                type="text" 
                value={`+₹${pricing.itemsAdded.toLocaleString('en-IN')}`}
                onChange={(e) => handlePricingChange('itemsAdded', e.target.value)}
                className="w-[100px] h-[36px] border border-[#E4E4E7] rounded-[8px] text-right px-3 text-[14px] font-bold text-[#16A34A] focus:outline-none focus:border-[#04222D]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Add-ons added</span>
              <input 
                type="text" 
                value={`+₹${pricing.addonsAdded.toLocaleString('en-IN')}`}
                onChange={(e) => handlePricingChange('addonsAdded', e.target.value)}
                className="w-[100px] h-[36px] border border-[#E4E4E7] rounded-[8px] text-right px-3 text-[14px] font-bold text-[#16A34A] focus:outline-none focus:border-[#04222D]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Substitute Items Added</span>
              <input 
                type="text" 
                value={`+₹${pricing.substituteItemsAdded.toLocaleString('en-IN')}`}
                onChange={(e) => handlePricingChange('substituteItemsAdded', e.target.value)}
                className="w-[100px] h-[36px] border border-[#E4E4E7] rounded-[8px] text-right px-3 text-[14px] font-bold text-[#16A34A] focus:outline-none focus:border-[#04222D]"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
              <span className="text-[#71717B] text-[11px] font-bold">Price to Remove</span>
              <div className="h-[1px] flex-1 bg-[#E4E4E7]"></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Items Removed</span>
              <input 
                type="text" 
                value={`-₹${pricing.itemsRemoved.toLocaleString('en-IN')}`}
                onChange={(e) => handlePricingChange('itemsRemoved', e.target.value)}
                className="w-[100px] h-[36px] border border-[#E4E4E7] rounded-[8px] text-right px-3 text-[14px] font-bold text-[#030303] focus:outline-none focus:border-[#04222D]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Add-ons removed</span>
              <input 
                type="text" 
                value={`-₹${pricing.addonsRemoved.toLocaleString('en-IN')}`}
                onChange={(e) => handlePricingChange('addonsRemoved', e.target.value)}
                className="w-[100px] h-[36px] border border-[#E4E4E7] rounded-[8px] text-right px-3 text-[14px] font-bold text-[#030303] focus:outline-none focus:border-[#04222D]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#71717B] text-[14px] font-medium">Discount Allowed</span>
              <input 
                type="text" 
                value={`-₹${pricing.discount.toLocaleString('en-IN')}`}
                onChange={(e) => handlePricingChange('discount', e.target.value)}
                className="w-[100px] h-[36px] border border-[#E4E4E7] rounded-[8px] text-right px-3 text-[14px] font-bold text-[#030303] focus:outline-none focus:border-[#04222D]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA] text-[14px] font-medium">Taxes (18% GST)</span>
              <span className="text-[#030303] text-[15px] font-bold">{localFormatMoney(gst)}</span>
            </div>

            <div className="h-[1px] bg-[#E4E4E7] w-full"></div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA] text-[12px] font-bold tracking-wider">FINAL AMOUNT</span>
                {isOverrideEnabled ? (
                  <div className="flex items-center">
                    <span className="text-[20px] font-extrabold text-[#030303] mr-1">₹</span>
                    <input 
                      type="number"
                      value={overrideTotal}
                      onChange={(e) => setOverrideTotal(Number(e.target.value) || 0)}
                      className="w-[100px] h-[36px] border-b-2 border-[#04222D] text-right px-1 text-[20px] font-extrabold text-[#030303] focus:outline-none bg-transparent"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className="text-[#030303] text-[22px] font-extrabold">{localFormatMoney(calculatedTotal)}</span>
                )}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsOverrideEnabled(!isOverrideEnabled)}
                  className="text-[#3B82F6] text-[11px] font-bold hover:underline"
                >
                  {isOverrideEnabled ? 'Use Auto-Calc' : 'Manual Override Total'}
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* Terms & Policies */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#030303]">Terms & Policies</h2>
            <Edit2 size={16} className="text-[#A1A1AA] cursor-pointer" />
          </div>
          <div className="border border-[#F0F0F1] rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-4">
            <textarea 
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full h-[80px] border border-[#E4E4E7] rounded-[12px] p-3 text-[14px] text-[#030303] focus:outline-none focus:border-[#04222D] resize-none font-medium leading-relaxed bg-[#FAFAFA]"
            />
            <div className="mt-4 flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 border border-[#E4E4E7] rounded-[12px] p-3 shadow-sm bg-white cursor-pointer active:bg-[#FAFAFA] transition-colors w-full text-[#030303] text-[13px] font-bold">
                <input type="file" className="hidden" onChange={handleFileUpload} />
                <Upload size={16} /> {isUploading ? 'Uploading...' : termsAttachmentUrl ? 'Replace file' : 'Upload file'}
              </label>
              
              {termsAttachmentUrl && (
                <div className="flex items-center justify-between p-3 border border-[#E4E4E7] rounded-[12px] bg-[#FAFAFA]">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E4E4E7] flex items-center justify-center">
                        <span className="text-[14px]">📄</span>
                     </div>
                     <span className="text-[12px] text-[#030303] font-medium truncate max-w-[150px]">
                       {termsAttachmentUrl.split('/').pop() || 'Uploaded Document'}
                     </span>
                   </div>
                   <button onClick={() => setTermsAttachmentUrl(null)} className="text-[#EF4444] text-[11px] font-bold uppercase tracking-wider">Remove</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F1] p-4 flex gap-3 z-50 pb-safe">
        <button 
          onClick={handleSaveDraft}
          className="flex-1 h-[48px] border border-[#E4E4E7] text-[#030303] rounded-[12px] font-bold text-[14px] active:bg-[#FAFAFA] transition-colors shadow-sm bg-white"
        >
          Save Draft
        </button>
        <button 
          onClick={handleSendProposal}
          className="flex-1 h-[48px] bg-[#04222D] text-white rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
        >
          Send Proposal
        </button>
      </div>

      {/* Add Custom Add-on Panel */}
      <AnimatePresence>
        {isAddonPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddonPanelOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-50 p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold text-[#030303]">Add Custom Add-on</h2>
                <button onClick={() => setIsAddonPanelOpen(false)} className="w-8 h-8 flex items-center justify-center bg-[#F4F4F5] rounded-full">
                  <X size={18} className="text-[#030303]" />
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                <span className="text-[#71717B] text-[12px] font-medium">Select from your existing add-ons</span>
                
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                  {existingVendorAddons.map(addon => (
                    <div 
                      key={addon.id}
                      onClick={() => handleAddExistingAddon(addon)}
                      className="flex items-center justify-between border border-[#E4E4E7] rounded-[12px] p-4 cursor-pointer active:bg-[#FAFAFA]"
                    >
                      <div className="flex flex-col">
                        <span className="text-[#030303] text-[14px] font-bold">{addon.name}</span>
                        <span className="text-[#71717B] text-[12px] mt-0.5">{localFormatMoney(addon.price)}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-[#D4D4D8] flex items-center justify-center">
                        <Plus size={14} className="text-[#71717B]" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-[1px] bg-[#E4E4E7]"></div>
                  <span className="text-[#A1A1AA] text-[11px] font-medium uppercase">OR</span>
                  <div className="flex-1 h-[1px] bg-[#E4E4E7]"></div>
                </div>

                <button 
                  onClick={() => {
                    setIsCreatingNewAddon(true);
                    setIsAddonPanelOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-[#E4E4E7] text-[#030303] rounded-[12px] p-4 text-[14px] font-bold active:bg-[#FAFAFA]"
                >
                  <Plus size={18} /> Create New Add-on
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Actual Addon Modal component for creating a new Addon */}
      {isCreatingNewAddon && (
        <AddonModal
          isOpen={isCreatingNewAddon}
          onClose={() => setIsCreatingNewAddon(false)}
          vendorType={enquiry?.vendorId?.vendorType || "Caterer"}
          onSave={(addon) => {
             handleAddExistingAddon(addon);
             setIsCreatingNewAddon(false);
          }}
        />
      )}
    </div>
  );
}
