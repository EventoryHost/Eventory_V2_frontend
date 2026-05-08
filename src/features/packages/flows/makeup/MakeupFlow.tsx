'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FlowShell from '../../shared/FlowShell';
import { useFlowVariants } from '../../shared/useFlowVariants';
import { AddonModal, Addon } from '../../components/AddonModal';
import { MakeupServiceItem, PolicyFile, SampleMediaFile } from '../../shared/types';
import MakeupStep1EventAndCrew from './Step1EventAndCrew';
import MakeupStep2PackageAndItems from './Step2PackageAndItems';
import MakeupStep3PriceAndPolicy, { defaultDynamicPricing, DynamicPricingState } from './Step3PriceAndPolicy';
import MakeupStep4SampleAndMedia from './Step4SampleAndMedia';

const FLOW_CONFIG = {
    vendorName: 'Makeup Artist',
    steps: ['Event and Crew', 'Package and Items', 'Package Price and Policy', 'Sample and Media'],
};

const VENUE_NEEDS_OPTIONS = ['Power', 'AC', 'Stage', 'Lighting', 'Security'];

export default function MakeupFlow() {
    const router = useRouter();
    const variants = useFlowVariants();
    const [step, setStep] = React.useState(1);

    // --- Step 1 State ---
    const [packageName, setPackageName] = React.useState('');
    const [eventCategories, setEventCategories] = React.useState('');
    const [teamDurationPerPerson, setTeamDurationPerPerson] = React.useState('');
    const [teamDurationOfSetup, setTeamDurationOfSetup] = React.useState('');
    const [teamMinPeople, setTeamMinPeople] = React.useState('');
    const [teamMaxPeople, setTeamMaxPeople] = React.useState('');
    const [trialOffered, setTrialOffered] = React.useState('Yes');
    const [parallelServicing, setParallelServicing] = React.useState('Yes');
    const [venueNeeds, setVenueNeeds] = React.useState<string[]>(['Power']);
    const [venueRequest, setVenueRequest] = React.useState('');

    const toggleVenueNeed = (need: string) =>
        setVenueNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);

    // --- Step 2 State ---
    const [makeupItems, setMakeupItems] = React.useState<MakeupServiceItem[]>([]);
    const [isItemTypeModalOpen, setIsItemTypeModalOpen] = React.useState(false);
    const [selectedItemType, setSelectedItemType] = React.useState<string | null>(null);
    const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);

    const handleAddMakeupItem = () => {
        if (!selectedItemType) return;
        const newItem: MakeupServiceItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedItemType,
            isExpanded: true,
            options: [
                { name: 'HD Makeup', price: 'Included' },
                { name: 'Air Brush', price: '800 Rs' },
                { name: 'Matte Finish', price: '400 Rs' },
            ],
            brands: [
                { name: 'MAC', price: 'Included' },
                { name: 'HUDA', price: '800 Rs' },
                { name: 'Loreal', price: '400 Rs' },
            ],
            allowCustomInput: 'Yes',
        };
        setMakeupItems(prev => [...prev, newItem]);
        setIsItemTypeModalOpen(false);
        setSelectedItemType(null);
    };

    const toggleMakeupItemExpand = (id: string) =>
        setMakeupItems(prev => prev.map(item => item.id === id ? { ...item, isExpanded: !item.isExpanded } : item));

    const updateMakeupItemType = (id: string, type: string) =>
        setMakeupItems(prev => prev.map(item => item.id === id ? { ...item, type } : item));

    const updateMakeupItem = (itemId: string, field: 'options' | 'brands', index: number, sub: 'name' | 'price', value: string) =>
        setMakeupItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const newList = [...item[field]];
            newList[index] = { ...newList[index], [sub]: value };
            return { ...item, [field]: newList };
        }));

    const handleMakeupPriceBlur = (itemId: string, field: 'options' | 'brands', index: number, value: string) => {
        const lower = value.toLowerCase();
        if (/^[\d\srs]+$/.test(lower)) {
            const digits = value.replace(/\D/g, '');
            if (digits) updateMakeupItem(itemId, field, index, 'price', `${digits} Rs`);
        }
    };

    const addMakeupItemOptionOrBrand = (itemId: string, field: 'options' | 'brands') =>
        setMakeupItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, [field]: [...item[field], { name: '', price: '' }] } : item
        ));

    const removeMakeupItemOptionOrBrand = (itemId: string, field: 'options' | 'brands', index: number) =>
        setMakeupItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const newList = [...item[field]];
            newList.splice(index, 1);
            return { ...item, [field]: newList };
        }));

    const setMakeupItemCustomInput = (itemId: string, value: 'Yes' | 'No') =>
        setMakeupItems(prev => prev.map(item => item.id === itemId ? { ...item, allowCustomInput: value } : item));

    const deleteMakeupItem = (id: string) =>
        setMakeupItems(prev => prev.filter(item => item.id !== id));

    // Addons
    const [addons, setAddons] = React.useState<Addon[]>([]);
    const [isAddingAddon, setIsAddingAddon] = React.useState(false);
    const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);

    const handleOpenAddonForm = () => { setEditingAddon(null); setIsAddingAddon(true); };
    const handleEditAddon = (addon: Addon) => { setEditingAddon(addon); setIsAddingAddon(true); setActiveMenuDropdown(null); };
    const handleSaveAddon = (saved: Addon) => {
        if (editingAddon) {
            setAddons(prev => prev.map(a => a.id === saved.id ? saved : a));
        } else {
            setAddons(prev => [...prev, saved]);
        }
        setIsAddingAddon(false);
        setEditingAddon(null);
    };
    const deleteAddon = (id: string) => setAddons(prev => prev.filter(a => a.id !== id));

    // --- Step 3 State ---
    const [packagePrice, setPackagePrice] = React.useState('');
    const [packageBillingUnit, setPackageBillingUnit] = React.useState('Per hour');
    const [overtimePrice, setOvertimePrice] = React.useState('');
    const [overtimeBillingUnit, setOvertimeBillingUnit] = React.useState('Per hour');
    const [teamPrice, setTeamPrice] = React.useState('');
    const [teamBillingUnit, setTeamBillingUnit] = React.useState('Per hour');
    const [dynamicPricing, setDynamicPricing] = React.useState(false);
    const [dynamicPricingState, setDynamicPricingState] = React.useState<DynamicPricingState>(defaultDynamicPricing());

    const [lastMinuteFiles, setLastMinuteFiles] = React.useState<PolicyFile[]>([]);
    const lastMinuteInputRef = React.useRef<HTMLInputElement>(null);
    const onLastMinuteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setLastMinuteFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size }))]);
        }
        if (lastMinuteInputRef.current) lastMinuteInputRef.current.value = '';
    };

    const [policyFiles, setPolicyFiles] = React.useState<PolicyFile[]>([]);
    const policyInputRef = React.useRef<HTMLInputElement>(null);
    const onPolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPolicyFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size }))]);
        }
        if (policyInputRef.current) policyInputRef.current.value = '';
    };

    // --- Step 4 State ---
    const [sampleMediaFiles, setSampleMediaFiles] = React.useState<SampleMediaFile[]>([]);
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);
    const onSampleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).map(file => ({
                file, name: file.name, size: file.size, preview: URL.createObjectURL(file),
            }));
            setSampleMediaFiles(prev => [...prev, ...files]);
        }
        if (sampleMediaInputRef.current) sampleMediaInputRef.current.value = '';
    };
    const removeSampleMediaFile = (idx: number) => {
        setSampleMediaFiles(prev => {
            const next = [...prev];
            URL.revokeObjectURL(next[idx].preview);
            next.splice(idx, 1);
            return next;
        });
    };

    // --- Navigation ---
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.push('/dashboard/inventory');
    };
    const handleNext = () => { if (step < 4) setStep(step + 1); };

    return (
        <>
            <FlowShell
                config={FLOW_CONFIG}
                step={step}
                onBack={handleBack}
                onNext={handleNext}
                variants={variants.variants}
                selectedVariant={variants.selectedVariant}
                onSelectVariant={variants.setSelectedVariant}
                isAddingVariant={variants.isAddingVariant}
                newVariantName={variants.newVariantName}
                onSetNewVariantName={variants.setNewVariantName}
                onAddVariant={variants.handleAddVariant}
                onStartAddingVariant={() => variants.setIsAddingVariant(true)}
                isVariantModalOpen={variants.isVariantModalOpen}
                variantToManage={variants.variantToManage}
                variantAction={variants.variantAction}
                renameVariantValue={variants.renameVariantValue}
                onSetRenameVariantValue={variants.setRenameVariantValue}
                onOpenVariantModal={(v) => { variants.setVariantToManage(v); variants.setIsVariantModalOpen(true); }}
                onCloseVariantModal={() => variants.setIsVariantModalOpen(false)}
                onSetVariantAction={variants.setVariantAction}
                onDuplicateVariant={variants.handleDuplicateVariant}
                onRenameVariant={variants.handleRenameVariant}
                onDeleteVariant={variants.handleDeleteVariant}
            >
                {step === 1 && (
                    <MakeupStep1EventAndCrew
                        packageName={packageName} setPackageName={setPackageName}
                        eventCategories={eventCategories} setEventCategories={setEventCategories}
                        teamDurationPerPerson={teamDurationPerPerson} setTeamDurationPerPerson={setTeamDurationPerPerson}
                        teamDurationOfSetup={teamDurationOfSetup} setTeamDurationOfSetup={setTeamDurationOfSetup}
                        teamMinPeople={teamMinPeople} setTeamMinPeople={setTeamMinPeople}
                        teamMaxPeople={teamMaxPeople} setTeamMaxPeople={setTeamMaxPeople}
                        trialOffered={trialOffered} setTrialOffered={setTrialOffered}
                        parallelServicing={parallelServicing} setParallelServicing={setParallelServicing}
                        venueNeeds={venueNeeds} toggleVenueNeed={toggleVenueNeed}
                        venueRequest={venueRequest} setVenueRequest={setVenueRequest}
                        venueNeedsOptions={VENUE_NEEDS_OPTIONS}
                    />
                )}

                {step === 2 && (
                    <MakeupStep2PackageAndItems
                        makeupItems={makeupItems}
                        isItemTypeModalOpen={isItemTypeModalOpen}
                        setIsItemTypeModalOpen={setIsItemTypeModalOpen}
                        selectedItemType={selectedItemType}
                        setSelectedItemType={setSelectedItemType}
                        handleAddMakeupItem={handleAddMakeupItem}
                        toggleMakeupItemExpand={toggleMakeupItemExpand}
                        updateMakeupItemType={updateMakeupItemType}
                        updateMakeupItem={updateMakeupItem}
                        handleMakeupPriceBlur={handleMakeupPriceBlur}
                        addMakeupItemOptionOrBrand={addMakeupItemOptionOrBrand}
                        removeMakeupItemOptionOrBrand={removeMakeupItemOptionOrBrand}
                        setMakeupItemCustomInput={setMakeupItemCustomInput}
                        deleteMakeupItem={deleteMakeupItem}
                        activeMenuDropdown={activeMenuDropdown}
                        setActiveMenuDropdown={setActiveMenuDropdown}
                        addons={addons}
                        handleOpenAddonForm={handleOpenAddonForm}
                        handleEditAddon={handleEditAddon}
                        deleteAddon={deleteAddon}
                    />
                )}

                {step === 3 && (
                    <MakeupStep3PriceAndPolicy
                        packagePrice={packagePrice} setPackagePrice={setPackagePrice}
                        packageBillingUnit={packageBillingUnit} setPackageBillingUnit={setPackageBillingUnit}
                        overtimePrice={overtimePrice} setOvertimePrice={setOvertimePrice}
                        overtimeBillingUnit={overtimeBillingUnit} setOvertimeBillingUnit={setOvertimeBillingUnit}
                        teamPrice={teamPrice} setTeamPrice={setTeamPrice}
                        teamBillingUnit={teamBillingUnit} setTeamBillingUnit={setTeamBillingUnit}
                        dynamicPricing={dynamicPricing} setDynamicPricing={setDynamicPricing}
                        dynamicPricingState={dynamicPricingState} setDynamicPricingState={setDynamicPricingState}
                        lastMinuteFiles={lastMinuteFiles}
                        lastMinuteInputRef={lastMinuteInputRef}
                        onLastMinuteUpload={onLastMinuteUpload}
                        removeLastMinuteFile={(idx) => setLastMinuteFiles(prev => prev.filter((_, i) => i !== idx))}
                        policyFiles={policyFiles}
                        policyInputRef={policyInputRef}
                        onPolicyUpload={onPolicyUpload}
                        removePolicyFile={(idx) => setPolicyFiles(prev => prev.filter((_, i) => i !== idx))}
                    />
                )}

                {step === 4 && (
                    <MakeupStep4SampleAndMedia
                        sampleMediaFiles={sampleMediaFiles}
                        sampleMediaInputRef={sampleMediaInputRef}
                        onSampleMediaUpload={onSampleMediaUpload}
                        removeSampleMediaFile={removeSampleMediaFile}
                    />
                )}
            </FlowShell>

            <AddonModal
                isOpen={isAddingAddon}
                onClose={() => setIsAddingAddon(false)}
                onSave={handleSaveAddon}
                vendorType="MAK"
                addon={editingAddon}
            />
        </>
    );
}
