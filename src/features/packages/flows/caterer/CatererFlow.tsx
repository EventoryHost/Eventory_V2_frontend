'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import { MenuData, GuestTier, PolicyFile, SampleMediaFile } from '../../shared/types';
import CatererStep1EventAndCrew from './Step1EventAndCrew';
import CatererStep2ProductsAndPricing from './Step2ProductsAndPricing';
import CatererStep3PoliciesAndCharges from './Step3PoliciesAndCharges';
import CatererStep4SampleAndMedia from './Step4SampleAndMedia';

const FLOW_CONFIG = { vendorName: 'Caterer', steps: ['Event and Crew', 'Products and Pricing', 'Policies and Charges', 'Sample and Media'] };
const VENUE_NEEDS_OPTIONS = ['Power', 'AC', 'Stage', 'Lighting', 'Security'];

export default function CatererFlow() {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // Step 1
    const [tastingSession, setTastingSession] = React.useState('Yes');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');
    const toggleVenueNeed = (need: string) => setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);

    // Step 2
    const [menus, setMenus] = React.useState<MenuData[]>([]);
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);
    const toggleMenuExpand = (id: string) => setMenus(prev => prev.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
    const deleteMenu = (id: string) => { setMenus(prev => prev.filter(m => m.id !== id)); setActiveMenuDropdown(null); };
    const handleAddMenu = () => {
        const newId = Math.random().toString(36).substring(7);
        setMenus(prev => [...prev, { id: newId, name: `Menu ${prev.length + 1}`, type: 'Breakfast', serviceStyles: ['Buffet'], inventory: { Starters: [], 'Main Course': [], Dessert: [], Drinks: [] }, priceModel: '', billingUnit: 'Per Plate', isExpanded: true }]);
    };

    // Step 3
    const [teamEquipmentPrice, setTeamEquipmentPrice] = React.useState('');
    const [teamEquipmentUnit, setTeamEquipmentUnit] = React.useState('Per hour');
    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    const [guestTiers, setGuestTiers] = React.useState<GuestTier[]>([{ range: 'Upto 50', price: '2000' }, { range: 'Upto 100', price: '4000' }, { range: 'Upto 200', price: '8000' }]);
    const addGuestTierOption = () => setGuestTiers(prev => [...prev, { range: 'Upto X', price: '' }]);
    const updateGuestTier = (i: number, f: 'range' | 'price', v: string) => setGuestTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [f]: v } : t));
    const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = React.useState(false);
    const [weekendPricing, setWeekendPricing] = React.useState(true);
    const [weekendIncreaseType, setWeekendIncreaseType] = React.useState('Fixed Price');
    const [weekendValue, setWeekendValue] = React.useState('');
    const [weekendDays, setWeekendDays] = React.useState<string[]>(['Saturday', 'Sunday']);
    const [weekendSeason, setWeekendSeason] = React.useState(true);
    const [seasonIncreaseType, setSeasonIncreaseType] = React.useState('Fixed Price');
    const [seasonValue, setSeasonValue] = React.useState('');
    const [festivalPricing, setFestivalPricing] = React.useState(true);
    const [festivalIncreaseType, setFestivalIncreaseType] = React.useState('Fixed Price');
    const [festivalValue, setFestivalValue] = React.useState('');
    const [selectedFestivals, setSelectedFestivals] = React.useState<string[]>(['Diwali', 'New Year']);
    const [availableFestivals, setAvailableFestivals] = React.useState<string[]>(['Diwali', 'New Year']);
    const [isAddingFestival, setIsAddingFestival] = React.useState(false);
    const [newFestivalName, setNewFestivalName] = React.useState('');
    const handleAddFestival = () => {
        if (newFestivalName.trim() && !availableFestivals.includes(newFestivalName.trim())) setAvailableFestivals(prev => [...prev, newFestivalName.trim()]);
        if (newFestivalName.trim() && !selectedFestivals.includes(newFestivalName.trim())) setSelectedFestivals(prev => [...prev, newFestivalName.trim()]);
        setNewFestivalName(''); setIsAddingFestival(false);
    };
    const [lastMinuteBooking, setLastMinuteBooking] = React.useState(true);
    const [lastMinuteDays, setLastMinuteDays] = React.useState('');
    const [lastMinuteIncreaseType, setLastMinuteIncreaseType] = React.useState('Fixed Price');
    const [lastMinuteValue, setLastMinuteValue] = React.useState('');
    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const policyInputRef = React.useRef<HTMLInputElement>(null);
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setPolicyFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size }))]);
        if (policyInputRef.current) policyInputRef.current.value = '';
    };

    // Step 4
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);
    const onSampleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setSampleMediaFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ file: f, name: f.name, size: f.size, preview: URL.createObjectURL(f) }))]);
        if (sampleMediaInputRef.current) sampleMediaInputRef.current.value = '';
    };
    const removeSampleMediaFile = (idx: number) => setSampleMediaFiles(prev => { const n = [...prev]; URL.revokeObjectURL(n[idx].preview); n.splice(idx, 1); return n; });

    const handleBack = () => { if (step > 1) setStep(step - 1); else router.push('/dashboard/inventory'); };

    return (
        <FlowShell
            config={FLOW_CONFIG} step={step} onBack={handleBack} onNext={() => step < 4 && setStep(step + 1)}
            variants={variants.variants} selectedVariant={variants.selectedVariant} onSelectVariant={variants.setSelectedVariant}
            isAddingVariant={variants.isAddingVariant} newVariantName={variants.newVariantName}
            onSetNewVariantName={variants.setNewVariantName} onAddVariant={variants.handleAddVariant}
            onStartAddingVariant={() => variants.setIsAddingVariant(true)}
            isVariantModalOpen={variants.isVariantModalOpen} variantToManage={variants.variantToManage}
            variantAction={variants.variantAction} renameVariantValue={variants.renameVariantValue}
            onSetRenameVariantValue={variants.setRenameVariantValue}
            onOpenVariantModal={(v) => { variants.setVariantToManage(v); variants.setIsVariantModalOpen(true); }}
            onCloseVariantModal={() => variants.setIsVariantModalOpen(false)}
            onSetVariantAction={variants.setVariantAction}
            onDuplicateVariant={variants.handleDuplicateVariant} onRenameVariant={variants.handleRenameVariant} onDeleteVariant={variants.handleDeleteVariant}
        >
            {step === 1 && <CatererStep1EventAndCrew tastingSession={tastingSession} setTastingSession={setTastingSession} venueNeeds={venueNeeds} toggleVenueNeed={toggleVenueNeed} venueRequest={venueRequest} setVenueRequest={setVenueRequest} venueNeedsOptions={VENUE_NEEDS_OPTIONS} />}
            {step === 2 && <CatererStep2ProductsAndPricing menus={menus} toggleMenuExpand={toggleMenuExpand} deleteMenu={deleteMenu} handleAddMenu={handleAddMenu} activeMenuDropdown={activeMenuDropdown} setActiveMenuDropdown={setActiveMenuDropdown} />}
            {step === 3 && <CatererStep3PoliciesAndCharges
                teamEquipmentPrice={teamEquipmentPrice} setTeamEquipmentPrice={setTeamEquipmentPrice}
                teamEquipmentUnit={teamEquipmentUnit} setTeamEquipmentUnit={setTeamEquipmentUnit}
                lastMinuteInputRef={lastMinuteInputRef}
                guestTiers={guestTiers} addGuestTierOption={addGuestTierOption} updateGuestTier={updateGuestTier}
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
                lastMinuteBooking={lastMinuteBooking} setLastMinuteBooking={setLastMinuteBooking}
                lastMinuteDays={lastMinuteDays} setLastMinuteDays={setLastMinuteDays}
                lastMinuteIncreaseType={lastMinuteIncreaseType} setLastMinuteIncreaseType={setLastMinuteIncreaseType}
                lastMinuteValue={lastMinuteValue} setLastMinuteValue={setLastMinuteValue}
                policyFiles={policyFiles} policyInputRef={policyInputRef} onPolicyUpload={onPolicyUpload}
                removePolicyFile={(i) => setPolicyFiles(prev => prev.filter((_, idx) => idx !== i))}
            />}
            {step === 4 && <CatererStep4SampleAndMedia sampleMediaFiles={sampleMediaFiles} sampleMediaInputRef={sampleMediaInputRef} onSampleMediaUpload={onSampleMediaUpload} removeSampleMediaFile={removeSampleMediaFile} />}
        </FlowShell>
    );
}
