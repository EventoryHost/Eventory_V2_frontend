'use client';

import React from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';

interface Props {
    packageName: string;
    setPackageName: (v: string) => void;
    eventCategories: string;
    setEventCategories: (v: string) => void;
    poc: string;
    setPoc: (v: string) => void;
    setupDuration: string;
    setSetupDuration: (v: string) => void;
    supervisors: string;
    setSupervisors: (v: string) => void;
    workers: string;
    setWorkers: (v: string) => void;
    venueNeeds: string[];
    toggleVenueNeed: (v: string) => void;
    venueRequest: string;
    setVenueRequest: (v: string) => void;
    venueNeedsOptions: string[];
}

const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-normal text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD = 'text-[18px] font-bold text-[#030303] leading-[24px]';
const HELPER = 'text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1';

const pocOptions = ['Rahul Sharma', 'Ananya Mehta', 'Karan Patel'];

export default function DecoratorStep1EventAndCrew({
    packageName,
    setPackageName,
    eventCategories,
    setEventCategories,
    poc,
    setPoc,
    setupDuration,
    setSetupDuration,
    supervisors,
    setSupervisors,
    workers,
    setWorkers,
    venueNeeds,
    toggleVenueNeed,
    venueRequest,
    setVenueRequest,
    venueNeedsOptions,
}: Props) {
    const categories = eventCategories.split(',').map((category) => category.trim()).filter(Boolean);
    const [categoryInput, setCategoryInput] = React.useState('');

    const addCategory = () => {
        const nextCategory = categoryInput.trim();
        if (!nextCategory) return;
        if (!categories.includes(nextCategory)) {
            setEventCategories([...categories, nextCategory].join(', '));
        }
        setCategoryInput('');
    };

    const removeCategory = (categoryToRemove: string) => {
        setEventCategories(categories.filter((category) => category !== categoryToRemove).join(', '));
    };

    const addVenueRequest = () => {
        const request = venueRequest.trim();
        if (!request) return;
        if (!venueNeeds.includes(request)) {
            toggleVenueNeed(request);
        }
        setVenueRequest('');
    };

    return (
        <div className="flex flex-col gap-6 pb-40">
            <section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Basic Information*</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Name of the package</label>
                    <input
                        type="text"
                        placeholder="Package Name"
                        value={packageName}
                        onChange={(event) => setPackageName(event.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Select Categories of Events</label>
                    <div className="flex min-h-[56px] flex-col justify-center gap-2 rounded-[8px] border border-[#E4E4E7] bg-white p-3 focus-within:ring-1 focus-within:ring-gray-300">
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <span key={category} className="flex items-center gap-1.5 rounded-full bg-[#04222D] px-3 py-1 text-[14px] leading-[20px] text-white">
                                        {category}
                                        <button
                                            type="button"
                                            onClick={() => removeCategory(category)}
                                            aria-label={`Remove ${category}`}
                                            className="flex items-center justify-center text-white hover:text-gray-300"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder={categories.length > 0 ? 'Type more categories...' : 'Type Events Categories'}
                            value={categoryInput}
                            onChange={(event) => setCategoryInput(event.target.value)}
                            onBlur={addCategory}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    addCategory();
                                }
                            }}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="w-full bg-transparent text-[16px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none"
                        />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to Input field.</p>
                </div>
            </section>

            <section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Team</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>POC</label>
                    <div className="relative">
                        <select
                            value={poc}
                            onChange={(event) => setPoc(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} appearance-none pr-12 ${poc ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}
                        >
                            <option value="">Text + Dropdown</option>
                            {pocOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Duration of Setup</label>
                    <input
                        type="text"
                        placeholder="Placeholder"
                        value={setupDuration}
                        onChange={(event) => setSetupDuration(event.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of people in crew</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Supervisors"
                            value={supervisors}
                            onChange={(event) => setSupervisors(event.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                        <input
                            type="text"
                            placeholder="Workers"
                            value={workers}
                            onChange={(event) => setWorkers(event.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>
            </section>

            <section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Requirement-Focused*</h3>

                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Needs from the Venue</p>
                    <div className="flex flex-wrap gap-2.5">
                        {Array.from(new Set([...venueNeedsOptions, ...venueNeeds])).map((need) => {
                            const isSelected = venueNeeds.includes(need);
                            return (
                                <button
                                    key={need}
                                    type="button"
                                    onClick={() => toggleVenueNeed(need)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-normal leading-[20px] transition-all ${
                                        isSelected
                                            ? 'bg-[#04222D] text-white'
                                            : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-200'
                                    }`}
                                >
                                    {isSelected ? <Check size={14} /> : <Plus size={14} />}
                                    <span>{need}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <textarea
                        placeholder="Ask for your request here..."
                        value={venueRequest}
                        onChange={(event) => setVenueRequest(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                addVenueRequest();
                            }
                        }}
                        onBlur={addVenueRequest}
                        rows={4}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`${INPUT} resize-none`}
                    />
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to Input field.</p>
                </div>
            </section>
        </div>
    );
}
