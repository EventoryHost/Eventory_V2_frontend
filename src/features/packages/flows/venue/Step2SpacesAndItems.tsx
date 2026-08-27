'use client';

import React from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Info, X, MoreHorizontal, ShieldAlert } from 'lucide-react';
import { AddonModal, Addon } from '../../components/AddonModal';
import { VariantManager } from '../../components/VariantManager';

export interface VenueSpace {
    id: string;
    isExpanded: boolean;
    name: string;
    type: string;
    area: string;
    areaUnit: string;
    height: string;
    heightUnit: string;
    layout: string;
    capacityStanding: string;
    capacitySitting: string;
    capacityDining: string;
    environment: 'Indoor' | 'Outdoor';
    activities: string[];
    amenities: string[];
    price: string;
    billingUnit: string;
    numberOfRooms: string;
    isMandatory: boolean;
    roomIncluded: boolean;
    parkingFourWheeler: string;
    parkingTwoWheeler: string;
    valetService: boolean;
}

interface Props {
    packageId?: string | null;
    packageGroupId?: string | null;
    spaces: VenueSpace[];
    setSpaces: React.Dispatch<React.SetStateAction<VenueSpace[]>>;
    inHouseServices: Addon[];
    setInHouseServices: React.Dispatch<React.SetStateAction<Addon[]>>;
    addons: Addon[];
    setAddons: React.Dispatch<React.SetStateAction<Addon[]>>;
    providedDetails: string; setProvidedDetails: (v: string) => void;
    notProvidedDetails: string; setNotProvidedDetails: (v: string) => void;
    activeMenuDropdown: string | null;
    setActiveMenuDropdown: (id: string | null) => void;
}

const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[13px] font-semibold text-[#3F3F47] pl-1';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]';
const DROPDOWN_BTN = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300';
const HELPER = 'text-[11px] text-[#9F9FA9] mt-1 pl-1';

const LAYOUT_OPTIONS = ['Theater', 'Classroom', 'Banquet', 'Reception', 'U-Shape', 'Boardroom', 'Hollow Square'];
const ACTIVITY_SUGGESTIONS = ['Weddings', 'Corporate Events', 'Workshops', 'Product Launches', 'Art Gallery'];
const AMENITY_SUGGESTIONS = [
    'Power', 'Generator Backup', 'Smoking Zone', 'Pantry/Kitchen',
    "Kids' Play Area", 'Wi-Fi', 'Lawn', 'Elevator', 'Poolside Access',
    'Projector & Screen', 'Parking', 'Wheelchair Access', 'Swimming Pool',
    'In-house Sound', 'Helipad', 'CCTV', 'Changing Rooms', 'Security',
    'Centralised AC', 'AC', 'Fire Safety'
];
const EXTENDED_ACTIVITY_SUGGESTIONS = [ ...ACTIVITY_SUGGESTIONS, 'Cocktail Parties', 'Birthday Celebrations', 'Fashion Shows', 'Exhibitions & Fairs', 'Concerts & Musical Events', 'Private Dinners', 'Photo / Video Shoots', 'Yoga & Wellness Retreats', 'Charity Fundraisers', 'Engagement Parties', 'Sangeet & Mehendi'];
const EXTENDED_AMENITY_SUGGESTIONS = [ ...AMENITY_SUGGESTIONS, 'Valet Parking', 'Bridal Suite / Restrooms', 'Bar License', 'Outdoor Mist Fans' ];

const SPACE_TYPES = [
    'Banquet Hall', '5-Star Hotel', 'Fort', 'Boutique Hotel', 'Hotel BallRoom',
    'Conference Hall', 'Resort', 'Farmhouse', 'Lawn', 'Garden',
    'Rooftop Venue', 'Poolside Venue', 'Beach Venue', 'Heritage Property',
    'Convention Center', 'Club', 'Lounge', 'Restaurant', 'Marriage Garden',
    'Temple Venue', 'Religious Hall', 'Community Hall', 'Destination Venue',
    'Houseboat', 'Vineyard', 'Haveli'
];

export default function VenueStep2SpacesAndItems({
    packageId,
    packageGroupId,
    spaces, setSpaces,
    inHouseServices, setInHouseServices,
    addons, setAddons,
    providedDetails, setProvidedDetails,
    notProvidedDetails, setNotProvidedDetails,
    activeMenuDropdown, setActiveMenuDropdown
}: Props) {
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

    const [isAddingInHouse, setIsAddingInHouse] = React.useState(false);
    const [editingInHouse, setEditingInHouse] = React.useState<Addon | null>(null);

    const [isAddingAddon, setIsAddingAddon] = React.useState(false);
    const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);

    const [isChoosingSpaceType, setIsChoosingSpaceType] = React.useState(false);
    const [selectedSpaceType, setSelectedSpaceType] = React.useState('');
    const [editingSpaceId, setEditingSpaceId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const handleClickOutside = () => {
            if (activeMenuDropdown) setActiveMenuDropdown(null);
            if (activeDropdown) setActiveDropdown(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenuDropdown, activeDropdown, setActiveMenuDropdown]);

    const handleAddSpace = () => {
        setIsChoosingSpaceType(true);
    };

    const confirmAddSpace = () => {
        if (!selectedSpaceType) return;
        const newSpace: VenueSpace = {
            id: Math.random().toString(36).substr(2, 9),
            isExpanded: true,
            name: selectedSpaceType,
            type: selectedSpaceType,
            area: '',
            areaUnit: 'Sq. Ft.',
            height: '',
            heightUnit: 'M',
            layout: '',
            capacityStanding: '',
            capacitySitting: '',
            capacityDining: '',
            environment: 'Indoor',
            activities: [],
            amenities: [],
            price: '',
            billingUnit: 'Per hour',
            numberOfRooms: '',
            isMandatory: false,
            roomIncluded: false,
            parkingFourWheeler: '',
            parkingTwoWheeler: '',
            valetService: false
        };
        setSpaces(prev => [...prev, newSpace]);
        setIsChoosingSpaceType(false);
        setSelectedSpaceType('');
        setEditingSpaceId(newSpace.id);
    };

    const updateSpace = (id: string, field: keyof VenueSpace, value: any) => {
        setSpaces(prev => prev.map(sp => sp.id === id ? { ...sp, [field]: value } : sp));
    };

    const toggleSpaceExpand = (id: string) => {
        setSpaces(prev => prev.map(sp => sp.id === id ? { ...sp, isExpanded: !sp.isExpanded } : sp));
    };

    const deleteSpace = (id: string) => {
        setSpaces(prev => prev.filter(sp => sp.id !== id));
    };

    const handleSaveInHouse = (saved: Addon) => {
        if (editingInHouse) setInHouseServices(prev => prev.map(a => a.id === saved.id ? saved : a));
        else setInHouseServices(prev => [...prev, saved]);
        setIsAddingInHouse(false);
        setEditingInHouse(null);
    };

    const handleSaveAddonLocal = (saved: Addon) => {
        if (editingAddon) setAddons(prev => prev.map(a => a.id === saved.id ? saved : a));
        else setAddons(prev => [...prev, saved]);
        setIsAddingAddon(false);
        setEditingAddon(null);
    };

    const DropdownField = ({ value, options, placeholder, onChange, dropdownId }: { value: string, options: string[], placeholder: string, onChange: (v: string) => void, dropdownId: string }) => (
        <div className="relative w-full">
            <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId); }}
                className={DROPDOWN_BTN}
                style={{ fontFamily: 'Figtree, sans-serif', color: value ? '#030303' : '#9F9FA9' }}
            >
                {value || placeholder}
                <ChevronDown size={20} className="text-[#9F9FA9]" />
            </button>
            {activeDropdown === dropdownId && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 max-h-[220px] overflow-y-auto py-2">
                    {options.map((opt) => (
                        <div 
                            key={opt}
                            onClick={(e) => { e.stopPropagation(); onChange(opt); setActiveDropdown(null); }}
                            className="px-4 py-3 cursor-pointer text-[14px] text-[#3F3F47] hover:bg-[#F4F4F5] transition-colors"
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const TagSection = ({ title, options, selected, onChange }: { title: string, options: string[], selected: string[], onChange: (vals: string[]) => void }) => {
        const [customVal, setCustomVal] = React.useState('');
        const [showSuggestions, setShowSuggestions] = React.useState(false);

        const toggleTag = (val: string) => {
            if (selected.includes(val)) {
                onChange(selected.filter(v => v !== val));
            } else {
                onChange([...selected, val]);
            }
        };

        const addCustom = (valToAdd?: string) => {
            const target = valToAdd !== undefined ? valToAdd : customVal;
            if (target.trim() && !selected.includes(target.trim())) {
                onChange([...selected, target.trim()]);
            }
            setCustomVal('');
            setShowSuggestions(false);
        };

        const extendedList = title === "Amenities" ? EXTENDED_AMENITY_SUGGESTIONS : EXTENDED_ACTIVITY_SUGGESTIONS;
        const availableSuggestions = (title === "Amenities" ? EXTENDED_AMENITY_SUGGESTIONS : EXTENDED_ACTIVITY_SUGGESTIONS).filter(s => !selected.includes(s) && s.toLowerCase().includes(customVal.toLowerCase()));
        const allTags = Array.from(new Set([...options, ...selected]));
        const hasUnselectedCustom = customVal.trim().length > 0 && !selected.includes(customVal.trim());

        return (
            <fieldset className="flex flex-col gap-2">
                <legend style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>{title}</legend>
                <div className="flex flex-wrap gap-2 mt-1">
                    {allTags.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggleTag(opt)}
                            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors flex items-center justify-center ${selected.includes(opt) ? 'bg-[#04222D] text-white' : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-[#E4E4E7]'}`}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                        >
                            <span>{opt}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-2 relative">
                    <input
                        type="text"
                        placeholder="Custom......"
                        value={customVal}
                        onChange={(e) => { setCustomVal(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                        className="flex-1 bg-[#F4F4F5] border-none rounded-full px-4 py-2.5 text-[13px] text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]"
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                    />
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); addCustom(); }}
                        onClick={() => addCustom()}
                        disabled={!customVal.trim()}
                        className="text-[14px] font-medium text-[#030303] disabled:text-[#9F9FA9] px-2 transition-colors cursor-pointer"
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                    >
                        Add
                    </button>

                    {showSuggestions && customVal.trim().length > 0 && (availableSuggestions.length > 0 || hasUnselectedCustom) && (
                        <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg max-h-48 overflow-y-auto z-50 py-1 text-left w-[calc(100%-60px)]">
                            {hasUnselectedCustom && !availableSuggestions.includes(customVal.trim()) && (
                                <div
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        addCustom(customVal);
                                    }}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="px-4 py-2.5 cursor-pointer text-[13px] text-[#04222D] font-medium bg-[#F4F4F5]/70 hover:bg-[#F4F4F5] transition-colors border-b border-[#E4E4E7]/40 last:border-b-0"
                                >
                                    <span>+ Add "{customVal.trim()}"</span>
                                </div>
                            )}
                            {availableSuggestions.map(opt => (
                                <div
                                    key={opt}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        addCustom(opt);
                                    }}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="px-4 py-2.5 cursor-pointer text-[13px] text-[#3F3F47] hover:bg-[#F4F4F5] transition-colors"
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </fieldset>
        );
    };

    const renderSpaceForm = (space: VenueSpace) => (
        <div className="flex flex-col gap-6 mt-2 pb-2">
            {/* About Space */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-4 shadow-sm">
                <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">About Space</h5>
                
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Space Name</label>
                        <input type="text" placeholder="Package Name" value={space.name === `Space ${spaces.findIndex(s => s.id === space.id) + 1}` ? '' : space.name} onChange={(e) => updateSpace(space.id, 'name', e.target.value)} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Space Types</label>
                        <DropdownField value={space.type} options={['Room', 'Banquet Hall', 'Lawn', 'Conference Room', 'Poolside', 'Other']} placeholder="e.g., Bridal HD Makeup" onChange={(v) => updateSpace(space.id, 'type', v)} dropdownId={`${space.id}-type`} />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of Rooms</label>
                    <input type="text" placeholder="Enter Number of Rooms" value={space.numberOfRooms} onChange={(e) => updateSpace(space.id, 'numberOfRooms', e.target.value.replace(/\D/g, ''))} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                </div>
                
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Area of the Venue</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Area" value={space.area} onChange={(e) => updateSpace(space.id, 'area', e.target.value.replace(/\D/g, ''))} className={`${INPUT} flex-[2]`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            <div className="flex-1">
                                <DropdownField value={space.areaUnit} options={['Sq. Ft.', 'Sq. M.']} placeholder="Unit" onChange={(v) => updateSpace(space.id, 'areaUnit', v)} dropdownId={`${space.id}-area-unit`} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Height of the Venue</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Height" value={space.height} onChange={(e) => updateSpace(space.id, 'height', e.target.value.replace(/[^0-9.]/g, ''))} className={`${INPUT} flex-[2]`} style={{ fontFamily: 'Figtree, sans-serif' }} />
                            <div className="flex-1">
                                <DropdownField value={space.heightUnit} options={['M', 'Ft']} placeholder="Unit" onChange={(v) => updateSpace(space.id, 'heightUnit', v)} dropdownId={`${space.id}-height-unit`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Per Hour Price</label>
                    <div className="flex items-stretch w-full border border-[#E4E4E7] rounded-[8px] overflow-hidden">
                        <div className="bg-[#F4F4F5] px-5 py-4 flex items-center justify-center border-r border-[#E4E4E7]">
                            <span className="text-[15px] font-medium text-[#3F3F47]">₹</span>
                        </div>
                        <input type="text" placeholder="0.0" value={space.price} onChange={(e) => updateSpace(space.id, 'price', e.target.value.replace(/[^0-9.]/g, ''))} className="flex-1 px-4 py-4 bg-white text-[15px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9]" style={{ fontFamily: 'Figtree, sans-serif' }} />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Mandatory with the package</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] mt-0.5">Customers can't opt out of it when they book this package.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={space.isMandatory} onChange={(e) => updateSpace(space.id, 'isMandatory', e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04222D]"></div>
                    </label>
                </div>
            </div>

            {/* Layout and Capacity */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-4 shadow-sm">
                <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Layout and Capacity</h5>
                <div className="flex flex-col gap-1">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Layout</label>
                    <DropdownField value={space.layout} options={LAYOUT_OPTIONS} placeholder="Placeholder" onChange={(v) => updateSpace(space.id, 'layout', v)} dropdownId={`${space.id}-layout`} />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="flex flex-col items-center p-3 bg-[#F9F9F9] border border-[#E4E4E7] rounded-[12px]">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase mb-1">STANDING</span>
                        <input type="text" placeholder="300" value={space.capacityStanding} onChange={(e) => updateSpace(space.id, 'capacityStanding', e.target.value.replace(/\D/g, ''))} className="w-full text-center bg-transparent text-[16px] font-bold text-[#030303] focus:outline-none" />
                    </div>
                    <div className="flex flex-col items-center p-3 bg-[#F9F9F9] border border-[#E4E4E7] rounded-[12px]">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase mb-1">SITTING</span>
                        <input type="text" placeholder="150" value={space.capacitySitting} onChange={(e) => updateSpace(space.id, 'capacitySitting', e.target.value.replace(/\D/g, ''))} className="w-full text-center bg-transparent text-[16px] font-bold text-[#030303] focus:outline-none" />
                    </div>
                    <div className="flex flex-col items-center p-3 bg-[#F9F9F9] border border-[#E4E4E7] rounded-[12px]">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase mb-1">DINNING</span>
                        <input type="text" placeholder="120" value={space.capacityDining} onChange={(e) => updateSpace(space.id, 'capacityDining', e.target.value.replace(/\D/g, ''))} className="w-full text-center bg-transparent text-[16px] font-bold text-[#030303] focus:outline-none" />
                    </div>
                </div>
            </div>

            {/* Room Included */}
            {space.type !== 'Room' && (
                <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Room Included</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">Customers can't opt out of it when they book this package.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={space.roomIncluded} onChange={(e) => updateSpace(space.id, 'roomIncluded', e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04222D]"></div>
                    </label>
                </div>
            )}

            {/* Space features */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-4 shadow-sm">
                <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Space features</h5>
                
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Space environment</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`env-${space.id}`} checked={space.environment === 'Indoor'} onChange={() => updateSpace(space.id, 'environment', 'Indoor')} className="w-4 h-4 accent-[#030303]" />
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#3F3F47] font-medium">Indoor</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`env-${space.id}`} checked={space.environment === 'Outdoor'} onChange={() => updateSpace(space.id, 'environment', 'Outdoor')} className="w-4 h-4 accent-[#030303]" />
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#3F3F47] font-medium">Outdoor</span>
                        </label>
                    </div>
                </div>

                <TagSection title="What can be done in this Space" options={ACTIVITY_SUGGESTIONS} selected={space.activities} onChange={(vals) => updateSpace(space.id, 'activities', vals)} />
                <TagSection title="Amenities" options={AMENITY_SUGGESTIONS} selected={space.amenities} onChange={(vals) => updateSpace(space.id, 'amenities', vals)} />
            </div>

            {/* Parking */}
            {space.amenities.includes('Parking') && (
                <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-4 shadow-sm">
                    <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Parking</h5>
                    
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Four Wheeler Capacity</label>
                        <input type="text" placeholder="Placeholder" value={space.parkingFourWheeler} onChange={(e) => updateSpace(space.id, 'parkingFourWheeler', e.target.value.replace(/\D/g, ''))} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Two Wheeler Capacity</label>
                        <input type="text" placeholder="Placeholder" value={space.parkingTwoWheeler} onChange={(e) => updateSpace(space.id, 'parkingTwoWheeler', e.target.value.replace(/\D/g, ''))} className={INPUT} style={{ fontFamily: 'Figtree, sans-serif' }} />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Valet Service</span>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">Professional parking assistance</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={space.valetService} onChange={(e) => updateSpace(space.id, 'valetService', e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04222D]"></div>
                        </label>
                    </div>
                </div>
            )}

            <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingSpaceId(null); }} 
                style={{ fontFamily: 'Figtree, sans-serif' }} 
                className="w-full py-4 mt-2 text-white rounded-[12px] sm:rounded-full font-semibold text-[16px] tracking-wide transition-colors shadow-sm bg-[#04222D] hover:bg-[#031820]"
            >
                Save Space
            </button>
        </div>
    );

    const renderAddonItem = (item: Addon, onEdit: () => void, onDelete: () => void) => (
        <div key={item.id} className="p-4 bg-white border border-[#FCE8EB] rounded-[16px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={onEdit}>
                <div className="w-[60px] h-[60px] rounded-[8px] bg-gray-200 overflow-hidden flex-shrink-0 relative">
                        {item.media && item.media[0]?.preview ? (
                            <img src={item.media[0].preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#E4E4E7] to-[#D4D4D8]"></div>
                        )}
                </div>
                <div className="flex flex-col truncate pr-2">
                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] leading-tight truncate">{item.name}</h4>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-1">
                        {item.type === 'Space' ? `Space / ${item.spaceType || 'Type'}` : 
                         item.type === 'Assets' ? `Asset / ${item.spaceType || 'Type'}` : 
                         item.type === 'Product' ? `${item.productType || 'Product'} / ${item.category || 'Category'}` : 
                         `Service / ${item.category || 'Category'}`}
                    </p>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mt-1">₹ {item.price}</p>
                </div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-6 h-6 rounded-full border border-[#9F9FA9] flex items-center justify-center text-[#3F3F47] hover:bg-gray-50 flex-shrink-0">
                <div className="w-[10px] h-[1.5px] bg-[#3F3F47]"></div>
            </button>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 pb-32">
            <VariantManager 
                packageId={packageId || ''} 
                packageGroupId={packageGroupId || ''} 
                vendorType="Venue"
                onVariantChange={(newId) => {
                    localStorage.setItem('selected_package_id', newId);
                    window.dispatchEvent(new Event('refresh_package_flow'));
                }}
            />
            {/* ── Spaces ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">SPACES</span>
                    <button type="button" onClick={handleAddSpace} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add Space <Plus size={16} />
                    </button>
                </div>

                {spaces.length === 0 ? (
                    <div onClick={handleAddSpace} className="w-full h-[250px] bg-white border border-dashed border-[#E4E4E7] rounded-[24px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="text-center flex flex-col gap-1.5 items-center">
                            <img src="/images/venue/empty_spaces.jpg" alt="No Spaces" className="w-32 h-32 object-contain mb-2 rounded-xl mix-blend-multiply" />
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">No Spaces added</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-[18px]">To add a space click Add space on<br />top or in this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {spaces.map((space) => (
                            <div key={space.id} className="bg-[#F9F9F9] border border-[#E4E4E7] rounded-[16px] flex flex-col transition-all">
                                <div className="p-5 flex items-center justify-between cursor-pointer rounded-[16px]" onClick={() => setEditingSpaceId(space.id)}>
                                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{space.name || `Space ${spaces.findIndex(s => s.id === space.id) + 1}`}</h4>
                                    <div className="flex items-center gap-4 text-[#3F3F47]">
                                        <div className="relative">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuDropdown(activeMenuDropdown === space.id ? null : space.id); }} className="hover:text-[#030303] transition-colors flex items-center justify-center">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            {activeMenuDropdown === space.id && (
                                                <div className="absolute right-0 top-8 w-32 bg-white border border-[#E4E4E7] rounded-[8px] shadow-lg py-1 z-10" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); deleteSpace(space.id); setActiveMenuDropdown(null); }}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button type="button" className="hover:text-[#030303] transition-colors flex items-center justify-center">
                                            <ChevronDown size={20} className="-rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── In-House Services ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">IN-HOUSE SERVICES</span>
                    <button type="button" onClick={() => { setEditingInHouse(null); setIsAddingInHouse(true); }} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add <Plus size={16} />
                    </button>
                </div>

                {inHouseServices.length === 0 ? (
                    <div onClick={() => { setEditingInHouse(null); setIsAddingInHouse(true); }} className="w-full h-[250px] bg-white border border-dashed border-[#E4E4E7] rounded-[24px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="text-center flex flex-col gap-1.5 items-center">
                            <img src="/images/venue/empty_services.jpg" alt="No In-House Services" className="w-32 h-32 object-contain mb-2 rounded-xl mix-blend-multiply" />
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">No In-House services added</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-[18px]">To add an service click Add on top or in<br />this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {inHouseServices.map((item) => renderAddonItem(item, () => { setEditingInHouse(item); setIsAddingInHouse(true); }, () => setInHouseServices(prev => prev.filter(s => s.id !== item.id))))}
                    </div>
                )}
            </div>

            {/* ── Add-Ons ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD-ONS</span>
                    <button type="button" onClick={() => { setEditingAddon(null); setIsAddingAddon(true); }} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add <Plus size={16} />
                    </button>
                </div>

                {addons.length === 0 ? (
                    <div onClick={() => { setEditingAddon(null); setIsAddingAddon(true); }} className="w-full h-[250px] bg-white border border-dashed border-[#E4E4E7] rounded-[24px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="text-center flex flex-col gap-1.5 items-center">
                            <img src="/images/venue/empty_addons.jpg" alt="No Add-ons" className="w-32 h-32 object-contain mb-2 rounded-xl mix-blend-multiply" />
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47]">No Add-ons</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-[18px]">To add an add-on click Add on top or in<br />this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {addons.map((item) => renderAddonItem(item, () => { setEditingAddon(item); setIsAddingAddon(true); }, () => setAddons(prev => prev.filter(s => s.id !== item.id))))}
                    </div>
                )}
            </div>

            {/* ── Whats Included ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-[-12px]">About The Package</h3>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47]">List everything a customer gets when they book this package</p>
                <textarea
                    placeholder="Enter details"
                    value={providedDetails}
                    onChange={(e) => {
                        if (e.target.value.length === 1 && e.target.value !== '•') {
                            setProvidedDetails('• ' + e.target.value);
                        } else {
                            setProvidedDetails(e.target.value);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLTextAreaElement;
                            const start = target.selectionStart;
                            const val = target.value;
                            setProvidedDetails(val.substring(0, start) + '\n• ' + val.substring(target.selectionEnd));
                            setTimeout(() => { target.selectionStart = target.selectionEnd = start + 3; }, 0);
                        }
                    }}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* ── Whats Not Included ── */}
            <div className={CARD}>
                <div className="flex items-center gap-2 mb-[-12px]">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">What's Not Included</h3>
                    <ShieldAlert size={20} fill="#EF4444" stroke="white" />
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47]">Help customers know what they'll need to arrange separately</p>
                <textarea
                    placeholder="Entre Details..."
                    value={notProvidedDetails}
                    onChange={(e) => {
                        if (e.target.value.length === 1 && e.target.value !== '•') {
                            setNotProvidedDetails('• ' + e.target.value);
                        } else {
                            setNotProvidedDetails(e.target.value);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLTextAreaElement;
                            const start = target.selectionStart;
                            const val = target.value;
                            setNotProvidedDetails(val.substring(0, start) + '\n• ' + val.substring(target.selectionEnd));
                            setTimeout(() => { target.selectionStart = target.selectionEnd = start + 3; }, 0);
                        }
                    }}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {isAddingInHouse && (
                <AddonModal
                    isOpen={isAddingInHouse}
                    vendorType="VEN"
                    addon={editingInHouse}
                    onClose={() => { setIsAddingInHouse(false); setEditingInHouse(null); }}
                    onSave={handleSaveInHouse}
                />
            )}

            {isAddingAddon && (
                <AddonModal
                    isOpen={isAddingAddon}
                    vendorType="VEN"
                    addon={editingAddon}
                    onClose={() => { setIsAddingAddon(false); setEditingAddon(null); }}
                    onSave={handleSaveAddonLocal}
                />
            )}

            {isChoosingSpaceType && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 transition-opacity">
                    <div className="bg-white w-full sm:w-[400px] h-[85vh] sm:h-[80vh] rounded-t-[24px] sm:rounded-b-[24px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-[#E4E4E7] flex items-center justify-between shrink-0">
                            <div>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-bold text-[#030303]">Choose Space Types</h3>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9]">Pick space types that will be provided</p>
                            </div>
                            <button type="button" onClick={() => setIsChoosingSpaceType(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                <X size={16} className="text-[#3F3F47]" />
                            </button>
                        </div>
                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {SPACE_TYPES.map(type => (
                                <div 
                                    key={type} 
                                    onClick={() => setSelectedSpaceType(type)}
                                    className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7] cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                            <img src="/images/venue/empty_spaces.jpg" alt="Space" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">{type}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedSpaceType === type ? 'border-[#04222D]' : 'border-gray-300'}`}>
                                        {selectedSpaceType === type && <div className="w-2.5 h-2.5 bg-[#04222D] rounded-full" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Footer */}
                        <div className="p-4 pb-24 sm:pb-4 shrink-0 bg-white border-t border-[#E4E4E7]">
                            <button 
                                type="button"
                                onClick={confirmAddSpace}
                                disabled={!selectedSpaceType}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`w-full py-3.5 rounded-[12px] text-[15px] font-bold transition-colors ${selectedSpaceType ? 'bg-[#04222D] text-white hover:bg-[#031820]' : 'bg-[#04222D]/50 text-white/70 cursor-not-allowed'}`}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingSpaceId && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right overflow-hidden">
                    <div className="flex-1 overflow-y-auto pb-8">
                        <div className="px-6 pt-12 pb-4 border-b border-[#E4E4E7] flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303]">Space {spaces.findIndex(s => s.id === editingSpaceId) + 1}</h2>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#9F9FA9] mt-1">Fill out the details about the item you chose.</p>
                            </div>
                            <button onClick={() => {
                                deleteSpace(editingSpaceId);
                                setEditingSpaceId(null);
                            }} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-6 max-w-2xl mx-auto">
                            {renderSpaceForm(spaces.find(s => s.id === editingSpaceId)!)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
