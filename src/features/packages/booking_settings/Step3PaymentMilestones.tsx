'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Milestone {
    id: string;
    title: string;
    percentage: number;
    dueDays: string;
    isFinal?: boolean;
}

interface Step3PaymentMilestonesProps {
    packageId: string | null;
    initialData?: any;
    packageData?: any; // To get the token amount from step 1
    onNext: () => void;
    onBack: () => void;
}

export default function Step3PaymentMilestones({ packageId, initialData, packageData, onNext, onBack }: Step3PaymentMilestonesProps) {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalPercentage, setModalPercentage] = useState<string>('');
    const [modalDueDays, setModalDueDays] = useState<string>('');

    useEffect(() => {
        if (initialData?.milestones?.length > 0) {
            setMilestones(initialData.milestones.map((m: any, i: number) => ({
                id: i.toString(),
                title: m.title,
                percentage: m.percentage,
                dueDays: m.dueDays,
                isFinal: m.title === 'Final Payment'
            })));
        } else {
            // Default setup based on packageData (if token exists)
            const defaultMilestones: Milestone[] = [];
            let tokenPercentage = 0;
            
            if (packageData?.bookingSettings?.paymentType === 'Token' && packageData?.bookingSettings?.token?.tokenType === 'Percentage') {
                tokenPercentage = packageData.bookingSettings.token.value || 0;
                if (tokenPercentage > 0) {
                    defaultMilestones.push({
                        id: '0',
                        title: 'Token Amount',
                        percentage: tokenPercentage,
                        dueDays: 'At the time of booking'
                    });
                }
            }

            defaultMilestones.push({
                id: 'final',
                title: 'Final Payment',
                percentage: 100 - tokenPercentage,
                dueDays: 'Due on the event date',
                isFinal: true
            });

            setMilestones(defaultMilestones);
        }
    }, [initialData, packageData]);

    const allocated = milestones.filter(m => !m.isFinal).reduce((acc, m) => acc + m.percentage, 0);
    const remaining = 100 - allocated;

    // Ensure final payment always reflects the remaining amount
    const displayMilestones = milestones.map(m => {
        if (m.isFinal) {
            return { ...m, percentage: remaining };
        }
        return m;
    });

    const handleSaveAndContinue = async () => {
        if (!packageId) {
            onNext();
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                milestones: displayMilestones.map(m => ({
                    title: m.title,
                    percentage: m.percentage,
                    dueDays: m.dueDays
                }))
            };

            const res = await fetch(apiUrl(`/packages/${packageId}/step/6`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save Payment Milestones');

            onNext();
        } catch (error: any) {
            alert(error.message || "Something went wrong while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const openModal = (index: number | null) => {
        setEditingIndex(index);
        if (index !== null) {
            const m = displayMilestones[index];
            setModalTitle(m.title);
            setModalPercentage(m.percentage.toString());
            setModalDueDays(m.dueDays);
        } else {
            // New milestone
            const currentAdvances = displayMilestones.filter(m => m.title.startsWith('Advance')).length;
            setModalTitle(`Advance ${currentAdvances + 1}`);
            setModalPercentage('');
            setModalDueDays('');
        }
        setIsModalOpen(true);
    };

    const saveMilestone = () => {
        if (!modalTitle || !modalPercentage || !modalDueDays) {
            alert("Please fill all fields.");
            return;
        }
        
        const perc = parseInt(modalPercentage, 10);
        
        if (editingIndex !== null) {
            const updated = [...milestones];
            updated[editingIndex] = {
                ...updated[editingIndex],
                title: modalTitle,
                percentage: perc,
                dueDays: modalDueDays
            };
            setMilestones(updated);
        } else {
            const newMilestone: Milestone = {
                id: Date.now().toString(),
                title: modalTitle,
                percentage: perc,
                dueDays: modalDueDays
            };
            
            // Insert before the final payment
            const updated = [...milestones];
            const finalIndex = updated.findIndex(m => m.isFinal);
            if (finalIndex !== -1) {
                updated.splice(finalIndex, 0, newMilestone);
            } else {
                updated.push(newMilestone);
            }
            setMilestones(updated);
        }
        setIsModalOpen(false);
    };

    const removeMilestone = () => {
        if (editingIndex !== null) {
            const updated = milestones.filter((_, idx) => idx !== editingIndex);
            setMilestones(updated);
        }
        setIsModalOpen(false);
    };

    const maxAvailable = editingIndex !== null 
        ? remaining + (displayMilestones[editingIndex]?.percentage || 0)
        : remaining;
        
    const baseOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    const validOptions = baseOptions.filter(val => val <= maxAvailable);

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[480px] mx-auto" style={{ fontFamily: 'Figtree, sans-serif' }}>
            
            {/* Total Distribution Progress */}
            <div className="flex flex-col gap-3">
                <h2 className="text-[17px] font-bold text-[#04222D]">
                    Total Distribution
                </h2>
                <p className="text-[13.5px] text-[#71717B] -mt-2">
                    You can distribute 100% of the payment
                </p>
                
                <div className="bg-[#F4F8FA] rounded-2xl p-5 mt-2 flex flex-col gap-4">
                    <div className="w-full h-3 bg-[#E4E4E7] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#2563EB] rounded-full transition-all duration-300" 
                            style={{ width: `${allocated}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-medium text-[#52525B]">Allocated</span>
                            <span className="text-[20px] font-bold text-[#04222D]">{allocated}%</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-[13px] font-medium text-[#52525B]">Remaining</span>
                            <span className="text-[20px] font-bold text-[#2563EB]">{remaining}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones List */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-bold text-[#04222D]">
                        Milestones
                    </h2>
                    <button 
                        onClick={() => openModal(null)}
                        disabled={remaining === 0}
                        className={`text-[14px] font-bold flex items-center gap-1.5 transition-opacity ${remaining === 0 ? 'text-[#A1A1AA] cursor-not-allowed opacity-50' : 'text-[#04222D] hover:opacity-80'}`}
                    >
                        <Plus size={16} strokeWidth={3} /> Add Milestone
                    </button>
                </div>
                
                <div className="relative pl-4">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[27px] top-8 bottom-8 w-[1.5px] bg-[#E4E4E7] z-0" />
                    
                    <div className="flex flex-col gap-6 relative z-10">
                        {displayMilestones.map((milestone, idx) => (
                            <div key={milestone.id} className="flex gap-4 items-start">
                                {/* Number circle */}
                                <div className="w-7 h-7 rounded-full bg-[#F4F4F5] border-2 border-white flex items-center justify-center text-[13px] font-bold text-[#04222D] shrink-0 mt-4 shadow-sm z-10 relative">
                                    {idx + 1}
                                </div>
                                
                                {/* Card */}
                                <div className={`flex-1 border rounded-[16px] p-5 flex flex-col gap-3 ${milestone.isFinal ? 'bg-[#F4F8FA] border-transparent' : 'bg-white border-[#E4E4E7]'}`}>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[15.5px] font-bold text-[#04222D]">{milestone.title}</h3>
                                        <span className="text-[16px] font-bold text-[#2563EB]">{milestone.percentage}%</span>
                                    </div>
                                    <div className="h-[1px] bg-[#F4F4F5] w-full" />
                                    <div className="flex justify-between items-center text-[#71717B]">
                                        <div className="flex items-center gap-2 text-[13px] font-medium">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            {milestone.dueDays}
                                        </div>
                                        <button 
                                            onClick={() => openModal(idx)}
                                            className="text-[#A1A1AA] hover:text-[#04222D] transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <p className="text-[12.5px] text-[#A1A1AA] font-medium mt-6 leading-relaxed pl-12 pr-4">
                    Final Payment is Fixed and will be updated as you add various milestones
                </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 mt-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSaving}
                    className="flex-1 py-3.5 px-6 rounded-[14px] border border-[#04222D] bg-white text-[#04222D] font-bold text-[15px] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 focus:outline-none"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                    className="flex-1 py-3.5 px-6 rounded-[14px] bg-[#04222D] text-white font-bold text-[15px] hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 focus:outline-none"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        'Save & Continue'
                    )}
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full sm:w-[420px] rounded-t-[24px] sm:rounded-[24px] p-6 pb-28 sm:pb-8 flex flex-col gap-5 animate-slideUp">
                        {/* Drag handle for mobile */}
                        <div className="w-10 h-1.5 bg-[#E4E4E7] rounded-full mx-auto sm:hidden mb-2" />
                        
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#04222D]">Milestone {editingIndex !== null ? editingIndex + 1 : milestones.length}</h3>
                                <p className="text-[13.5px] text-[#71717B] mt-1">Set when and how much of the payment you'll collect</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-[#F4F4F5] rounded-full text-[#71717B] hover:text-[#04222D]">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-[#52525B]">Type</label>
                                <select 
                                    value={modalTitle} 
                                    onChange={e => setModalTitle(e.target.value)}
                                    disabled={editingIndex !== null && (displayMilestones[editingIndex]?.isFinal || displayMilestones[editingIndex]?.title === 'Token Amount')}
                                    className="w-full bg-white border border-[#E4E4E7] rounded-xl px-4 py-3 text-[14.5px] font-medium text-[#04222D] focus:outline-none focus:border-[#04222D] appearance-none"
                                >
                                    <option value="" disabled>Enter milestone type</option>
                                    <option value="Token Amount">Token Amount</option>
                                    <option value="Advance 1">Advance 1</option>
                                    <option value="Advance 2">Advance 2</option>
                                    <option value="Advance 3">Advance 3</option>
                                    <option value="Final Payment">Final Payment</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-[#52525B]">Payment Percentage</label>
                                <select 
                                    value={modalPercentage} 
                                    onChange={e => setModalPercentage(e.target.value)}
                                    disabled={editingIndex !== null && displayMilestones[editingIndex]?.isFinal}
                                    className="w-full bg-white border border-[#E4E4E7] rounded-xl px-4 py-3 text-[14.5px] font-medium text-[#04222D] focus:outline-none focus:border-[#04222D] appearance-none"
                                >
                                    <option value="" disabled>Choose</option>
                                    {modalPercentage && !validOptions.includes(parseInt(modalPercentage)) && (
                                        <option value={modalPercentage}>{modalPercentage}%</option>
                                    )}
                                    {validOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}%</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-[#52525B]">How long before the event?</label>
                                <select 
                                    value={modalDueDays} 
                                    onChange={e => setModalDueDays(e.target.value)}
                                    className="w-full bg-white border border-[#E4E4E7] rounded-xl px-4 py-3 text-[14.5px] font-medium text-[#04222D] focus:outline-none focus:border-[#04222D] appearance-none"
                                >
                                    <option value="" disabled>Choose</option>
                                    <option value="At the time of booking">At the time of booking</option>
                                    <option value="30 days before the event">30 days before the event</option>
                                    <option value="15 days before the event">15 days before the event</option>
                                    <option value="10 days before the event">10 days before the event</option>
                                    <option value="5 days before the event">5 days before the event</option>
                                    <option value="On the day of the event">On the day of the event</option>
                                    <option value="Due on the event date">Due on the event date</option>
                                    <option value="After the event">After the event</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 mt-2">
                            <button 
                                onClick={saveMilestone}
                                className="w-full py-3.5 bg-[#04222D] text-white font-bold rounded-xl text-[15px] hover:bg-opacity-90 transition-opacity"
                            >
                                Save Milestone
                            </button>
                            {editingIndex !== null && !displayMilestones[editingIndex].isFinal && (
                                <button 
                                    onClick={removeMilestone}
                                    className="w-full py-3.5 bg-white text-[#04222D] font-bold rounded-xl text-[15px] hover:bg-gray-50 transition-colors"
                                >
                                    Remove Milestone
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
