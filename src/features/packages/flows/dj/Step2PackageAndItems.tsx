'use client';

import React from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Check, Info, MoreHorizontal, Pencil } from 'lucide-react';
import { AddonModal, Addon } from '../../components/AddonModal';

export interface DJItem {
    id: string;
    name: string;
    genres: string[];
    languages: string[];
    description: string;
    isExpanded: boolean;
}

export interface Song {
    id: string;
    name: string;
    artist: string;
    duration: string;
    url?: string;
}

export interface Playlist {
    id: string;
    name: string;
    type: 'Curated' | 'Custom' | 'Upload';
    playlistType: string;
    songs: Song[];
    isExpanded: boolean;
}

export interface Equipment {
    id: string;
    name: string;
    quantity: string;
    category: string;
    subCategory: string;
}

interface Props {
    djItems: DJItem[];
    handleAddDJItem: () => void;
    updateDJItem: (id: string, field: keyof DJItem, value: any) => void;
    toggleDJItemExpand: (id: string) => void;
    deleteDJItem: (id: string) => void;

    playlists: Playlist[];
    handleAddPlaylist: () => void;
    updatePlaylist: (id: string, field: keyof Playlist, value: any) => void;
    togglePlaylistExpand: (id: string) => void;
    deletePlaylist: (id: string) => void;
    addSongToPlaylist: (playlistId: string, song: Song) => void;
    removeSongFromPlaylist: (playlistId: string, songId: string) => void;
    
    customerPlaylistAllowed: boolean; setCustomerPlaylistAllowed: (v: boolean) => void;
    guestRequestsAllowed: boolean; setGuestRequestsAllowed: (v: boolean) => void;

    equipments: Equipment[];
    handleAddEquipment: (e: Equipment) => void;
    deleteEquipment: (id: string) => void;
    hasBackupEquipment: boolean; setHasBackupEquipment: (v: boolean) => void;

    addons: Addon[];
    handleOpenAddonForm: () => void;
    handleEditAddon: (addon: Addon) => void;
    deleteAddon: (id: string) => void;
    activeMenuDropdown: string | null;
    setActiveMenuDropdown: (id: string | null) => void;

    providedDetails: string; setProvidedDetails: (v: string) => void;
    notProvidedDetails: string; setNotProvidedDetails: (v: string) => void;
}

/* ── Shared token classes ── */
const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-normal text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD = 'text-[18px] font-bold text-[#030303] leading-[24px] uppercase tracking-wider';

export default function DJStep2PackageAndItems({
    djItems, handleAddDJItem, updateDJItem, toggleDJItemExpand, deleteDJItem,
    playlists, handleAddPlaylist, updatePlaylist, togglePlaylistExpand, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist,
    customerPlaylistAllowed, setCustomerPlaylistAllowed,
    guestRequestsAllowed, setGuestRequestsAllowed,
    equipments, handleAddEquipment, deleteEquipment,
    hasBackupEquipment, setHasBackupEquipment,
    addons, handleOpenAddonForm, handleEditAddon, deleteAddon,
    activeMenuDropdown, setActiveMenuDropdown,
    providedDetails, setProvidedDetails,
    notProvidedDetails, setNotProvidedDetails
}: Props) {
    const [songInput, setSongInput] = React.useState<{ [key: string]: string }>({});
    const [isUploadModalOpen, setIsUploadModalOpen] = React.useState<string | null>(null); // Stores playlist id
    const uploadInputRef = React.useRef<HTMLInputElement>(null);

    const [isAddingEquipment, setIsAddingEquipment] = React.useState(false);
    const [newEquipment, setNewEquipment] = React.useState({ name: '', quantity: '', category: '', subCategory: '' });

    const handleSongInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, playlistId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = (songInput[playlistId] || '').trim();
            if (val) {
                addSongToPlaylist(playlistId, {
                    id: Math.random().toString(36).substr(2, 9),
                    name: val,
                    artist: 'Unknown Artist',
                    duration: '3:30'
                });
                setSongInput(prev => ({ ...prev, [playlistId]: '' }));
            }
        }
    };

    const GENRE_SUGGESTIONS = ["Bollywood", "Pop", "Classical", "Hip Hop", "EDM", "House", "Techno", "R&B", "Jazz", "Rock"];
    const LANGUAGE_SUGGESTIONS = ["Hindi", "English", "Punjabi", "Tamil", "Telugu", "Marathi", "Gujarati", "Bengali"];

    // Helper for tag inputs in DJ Item
    const TagInput = ({ itemId, field, values, placeholder }: { itemId: string, field: 'genres' | 'languages', values: string[], placeholder: string }) => {
        const [inputValue, setInputValue] = React.useState('');
        const [isFocused, setIsFocused] = React.useState(false);
        const [hoveredSuggestion, setHoveredSuggestion] = React.useState<string | null>(null);

        const suggestionsList = field === 'genres' ? GENRE_SUGGESTIONS : LANGUAGE_SUGGESTIONS;
        
        const filteredSuggestions = suggestionsList.filter(s => 
            !values.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
        );

        const handleAdd = (valToUse?: string) => {
            const val = (valToUse !== undefined ? valToUse : inputValue).trim();
            if (val && !values.includes(val)) {
                updateDJItem(itemId, field, [...values, val]);
            }
            setInputValue('');
        };

        const handleRemove = (tag: string) => {
            updateDJItem(itemId, field, values.filter(v => v !== tag));
        };

        return (
            <div className="flex flex-col gap-2 relative">
                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#3F3F47] pl-1">{field === 'genres' ? 'Music genre' : 'Music languages'}</label>
                <div className={`flex flex-col gap-2 p-3 bg-white border border-[#E4E4E7] rounded-[8px] focus-within:ring-1 focus-within:ring-gray-300 min-h-[56px] justify-center`}>
                    {values.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {values.map(tag => (
                                <div key={tag} className="flex items-center gap-1.5 bg-[#04222D] text-white px-3 py-1.5 rounded-full text-[12px]">
                                    <span>{tag}</span>
                                    <button type="button" onClick={() => handleRemove(tag)} className="hover:text-gray-300 flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder={values.length === 0 ? placeholder : ""}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setTimeout(() => {
                                handleAdd();
                                setIsFocused(false);
                            }, 150);
                        }}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full text-[14px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9] bg-transparent"
                    />
                </div>

                {isFocused && filteredSuggestions.length > 0 && (
                    <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 max-h-[220px] overflow-y-auto py-2">
                        {filteredSuggestions.map((s) => (
                            <div 
                                key={s}
                                onMouseDown={(e) => { e.preventDefault(); handleAdd(s); }}
                                onMouseEnter={() => setHoveredSuggestion(s)}
                                onMouseLeave={() => setHoveredSuggestion(null)}
                                className={`px-4 py-3 cursor-pointer text-[14px] text-[#3F3F47] transition-colors ${hoveredSuggestion === s ? 'bg-[#E4E4E7]' : 'bg-white'}`}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const Toggle = ({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) => (
        <button 
            type="button" 
            onClick={onToggle} 
            className={`w-[44px] h-[24px] flex items-center rounded-full p-[2px] cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${isOn ? 'bg-[#04222D]' : 'bg-[#E4E4E7]'}`}
        >
            <div 
                className={`bg-white w-[20px] h-[20px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isOn ? 'translate-x-[20px]' : 'translate-x-0'}`}
            />
        </button>
    );

    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* ── Items ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">ITEMS</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); handleAddDJItem(); }} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add Item <Plus size={16} />
                    </button>
                </div>

                {djItems.length === 0 ? (
                    <div onClick={handleAddDJItem} className="w-full h-[220px] bg-white border border-dashed border-[#E4E4E7] rounded-[16px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="w-[80px] h-[80px] flex items-center justify-center mb-[-8px]">
                            <img src="/images/dj/empty_turntable.png" alt="Empty Items" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="text-center flex flex-col gap-1">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">No items</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] leading-[16px]">To add an item click on Add Item on top<br />or in this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {djItems.map((item, index) => {
                            const isFilled = item.genres.length > 0 && item.languages.length > 0 && item.description.trim().length > 0;
                            return (
                            <div key={item.id} className="bg-[#F9F9F9] rounded-[16px] flex flex-col transition-all">
                                <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => toggleDJItemExpand(item.id)}>
                                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">{item.name || `DJ Item ${index + 1}`}</h4>
                                    <div className="flex items-center gap-4 text-[#030303]">
                                        <div className="relative">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuDropdown(activeMenuDropdown === item.id ? null : item.id); }} className="text-[#3F3F47] hover:text-[#030303] transition-colors p-1 rounded-md hover:bg-gray-100">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                                            </button>
                                            {activeMenuDropdown === item.id && (
                                                <div className="absolute right-0 top-8 w-32 bg-white border border-[#E4E4E7] rounded-[8px] shadow-lg py-1 z-10" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { deleteDJItem(item.id); setActiveMenuDropdown(null); }}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleDJItemExpand(item.id); }} className="text-[#3F3F47] hover:text-[#030303] transition-colors p-1 rounded-md hover:bg-gray-100">
                                            {item.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>
                                {item.isExpanded && (
                                    <div className="px-5 pb-5 flex flex-col gap-4">
                                        <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-5 flex flex-col gap-6">
                                            <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Content Details</h5>
                                            
                                            <TagInput itemId={item.id} field="genres" values={item.genres} placeholder="" />
                                            
                                            <TagInput itemId={item.id} field="languages" values={item.languages} placeholder="" />

                                            <div className="flex flex-col gap-2">
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#3F3F47] pl-1">About this</label>
                                                <textarea
                                                    placeholder="An explosive, high-octane musical experience tailored for elite dance floors. Features a seamless blend..."
                                                    value={item.description}
                                                    onChange={(e) => updateDJItem(item.id, 'description', e.target.value)}
                                                    rows={3}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] resize-none"
                                                />
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] leading-[16px] pl-1 mt-0.5">This appears on your public listing — keep it customer-friendly</p>
                                            </div>
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDJItemExpand(item.id); }} 
                                            style={{ fontFamily: 'Figtree, sans-serif' }} 
                                            className={`w-full py-4 mt-2 text-white rounded-full font-semibold text-[16px] tracking-wide transition-colors shadow-sm ${isFilled ? 'bg-[#04222D] hover:bg-[#031820]' : 'bg-[#8B9A9F]'}`}>
                                            Save Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        )})}
                    </div>
                )}
            </div>

            {/* ── Add-Ons ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD-ONS</span>
                    <button type="button" onClick={handleOpenAddonForm} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add <Plus size={16} />
                    </button>
                </div>

                {addons.length === 0 ? (
                    <div onClick={handleOpenAddonForm} className="w-full h-[220px] bg-white border border-dashed border-[#E4E4E7] rounded-[16px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                        <div className="w-[80px] h-[80px] flex items-center justify-center mb-[-8px]">
                            <img src="/images/dj/empty_headphones.png" alt="Empty Addons" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="text-center flex flex-col gap-1">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">No Add-ons</p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] leading-[16px]">To add an add-on click Add on top or in<br />this box</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {addons.map((addon) => (
                            <div 
                                key={addon.id} 
                                onClick={() => handleEditAddon(addon)}
                                className="p-4 bg-white border border-[#FCE8EB] rounded-[16px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-gray-50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-[60px] h-[60px] rounded-[8px] bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                         {addon.media && addon.media[0]?.preview ? (
                                             <img src={addon.media[0].preview} alt="" className="w-full h-full object-cover" />
                                         ) : (
                                             <div className="w-full h-full bg-gradient-to-br from-[#E4E4E7] to-[#D4D4D8]"></div>
                                         )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] leading-tight">{addon.name}</h4>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-1">{addon.productType || 'Product'}/{addon.category || 'Category'}</p>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mt-1">₹ {addon.price}</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAddon(addon.id);
                                    }} 
                                    className="w-6 h-6 rounded-full border border-[#9F9FA9] flex items-center justify-center text-[#3F3F47] hover:bg-gray-50 flex-shrink-0"
                                >
                                    <div className="w-[10px] h-[1.5px] bg-[#3F3F47]"></div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Playlist ── */}
            <div className={CARD}>
                <div className="flex items-center justify-between mb-6">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#3F3F47] uppercase tracking-widest">PLAYLIST</span>
                    <button type="button" onClick={handleAddPlaylist} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Create Playlist <Plus size={16} />
                    </button>
                </div>
                
                {playlists.length > 0 && (
                    <div className="flex flex-col gap-6 mb-6">
                        {playlists.map((playlist) => {
                            const totalSongs = playlist.songs.length;
                            return (
                                <div key={playlist.id} className="flex flex-col">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            {/* Playlist Image */}
                                            <div className="w-[72px] h-[72px] rounded-[8px] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-[12px] overflow-hidden flex-shrink-0 shadow-sm">
                                                MIX
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] leading-tight mb-1">{playlist.name}</h4>
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] leading-tight mb-3">{totalSongs > 0 ? totalSongs : 50} songs - 3h Duration</p>
                                                <div className="flex items-center gap-5">
                                                    <button type="button" onClick={() => setIsUploadModalOpen(playlist.id)} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] hover:underline">Edit Playlist</button>
                                                    <button type="button" onClick={() => deletePlaylist(playlist.id)} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-normal text-red-500 hover:underline">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => togglePlaylistExpand(playlist.id)} className="text-[#3F3F47] hover:text-[#030303] mt-2 p-1">
                                            {playlist.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                    
                                    {playlist.isExpanded && (
                                        <div className="flex flex-col mt-6">
                                            <div className="relative mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Search song name.."
                                                    value={songInput[playlist.id] || ''}
                                                    onChange={(e) => setSongInput(prev => ({ ...prev, [playlist.id]: e.target.value }))}
                                                    onKeyDown={(e) => handleSongInputKeyDown(e, playlist.id)}
                                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                                    className="w-full p-[14px] bg-[#F4F4F5] rounded-[8px] text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-300 pr-12 text-[#030303] placeholder:text-[#9F9FA9]"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-200">
                                                {['Type 1', 'Type 2', 'Type 3'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => updatePlaylist(playlist.id, 'playlistType', type)}
                                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                                        className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${playlist.playlistType === type ? 'bg-[#04222D] text-white' : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-200'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>

                                            {playlist.songs.length > 0 && (
                                                <div className="flex flex-col gap-0 max-h-[220px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#F4F4F5] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                                                    {playlist.songs.map((song: any, i: number) => (
                                                        <div key={song.id} className={`flex items-center justify-between py-4 ${i !== 0 ? 'border-t border-[#E4E4E7]' : ''}`}>
                                                            <div className="flex flex-col">
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#030303] leading-snug">{song.name}</span>
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9] mt-0.5">{song.artist || 'Genre'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#3F3F47] mt-0.5">{song.duration || '4:22'}</span>
                                                                <button type="button" onClick={() => removeSongFromPlaylist(playlist.id, song.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {playlist.songs.length === 0 && (
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-gray-400 text-center py-4">No songs added. Click 'Upload Music' above or type a name to add.</p>
                                            )}
                                            
                                            <button type="button" onClick={() => togglePlaylistExpand(playlist.id)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-[14px] mt-2 bg-[#04222D] text-white rounded-[8px] font-medium text-[14px] hover:bg-opacity-90 transition-colors">
                                                Save Playlist
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="h-[1px] w-full bg-[#E4E4E7] mb-6"></div>

                <div className="flex flex-col gap-6 mb-2">
                    <div className="flex items-center justify-between gap-4">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-normal text-[#3F3F47] leading-snug">Allow customers share their<br />own playlist</span>
                        <Toggle isOn={customerPlaylistAllowed} onToggle={() => setCustomerPlaylistAllowed(!customerPlaylistAllowed)} />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-normal text-[#3F3F47] leading-snug">Allow guests to request songs<br />during the event</span>
                        <Toggle isOn={guestRequestsAllowed} onToggle={() => setGuestRequestsAllowed(!guestRequestsAllowed)} />
                    </div>
                </div>
            </div>

            {/* ── Equipment ── */}
            <div className={CARD}>
                <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#3F3F47] uppercase tracking-widest">EQUIPMENT</span>
                    <button type="button" onClick={() => setIsAddingEquipment(true)} style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] flex items-center gap-2 hover:text-[#04222D]">
                        Add Equipment <Plus size={16} />
                    </button>
                </div>

                {equipments.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4 mb-2">
                        {equipments.map((eq) => (
                            <div key={eq.id} className="flex items-center justify-between p-[18px] bg-white border border-[#E4E4E7] rounded-[8px] shadow-sm">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-semibold text-[#030303]">{eq.name}</span>
                                <button type="button" onClick={() => deleteEquipment(eq.id)} className="text-red-500 hover:text-red-600"><Trash2 size={20} strokeWidth={1.5} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-[1px] w-full bg-[#E4E4E7] my-4"></div>

                <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-normal text-[#3F3F47]">I carry backup equipment</span>
                    <Toggle isOn={hasBackupEquipment} onToggle={() => setHasBackupEquipment(!hasBackupEquipment)} />
                </div>
            </div>

            {/* ── Whats Included ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider mb-[-12px]">WHATS INCLUDED</h3>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">List everything a customer gets when they book this package</p>
                <textarea
                    placeholder="Enter Details..."
                    value={providedDetails}
                    onChange={(e) => setProvidedDetails(e.target.value)}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* ── Whats Not Included ── */}
            <div className={CARD}>
                <div className="flex items-center gap-2 mb-[-12px]">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] uppercase tracking-wider">WHATS NOT INCLUDED</h3>
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"><Info size={12} className="text-red-600" /></div>
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#9F9FA9]">Help customers know what they'll need to arrange separately</p>
                <textarea
                    placeholder="Enter Details..."
                    value={notProvidedDetails}
                    onChange={(e) => setNotProvidedDetails(e.target.value)}
                    rows={4}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className={`${INPUT} resize-none`}
                />
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white w-full max-w-sm rounded-[16px] overflow-hidden flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Upload your music</h3>
                            <button onClick={() => setIsUploadModalOpen(null)} className="p-1 text-gray-400 hover:text-gray-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div 
                                className="w-full h-32 border-2 border-dashed border-[#D4D4D8] rounded-[12px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => uploadInputRef.current?.click()}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9F9FA9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#3F3F47]">Upload Music Files or Playlist</p>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#9F9FA9]">MP3, WAV, PDF, CSV, TXT up to 50MB</p>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#04222D] mt-2 tracking-wider">BROWSE FILES</p>
                                <input type="file" className="hidden" ref={uploadInputRef} onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        Array.from(e.target.files).forEach(file => {
                                            if (isUploadModalOpen) {
                                                const fileName = file.name.toLowerCase();
                                                if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const text = event.target?.result as string;
                                                        if (text) {
                                                            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                                                            const startIdx = (lines.length > 0 && (lines[0].toLowerCase().includes('song') || lines[0].toLowerCase().includes('artist'))) ? 1 : 0;
                                                            for (let i = startIdx; i < lines.length; i++) {
                                                                const line = lines[i];
                                                                const separator = line.includes(',') ? ',' : '-';
                                                                const parts = line.split(separator);
                                                                if (parts.length > 0 && parts[0].trim()) {
                                                                    addSongToPlaylist(isUploadModalOpen, {
                                                                        id: Math.random().toString(36).substr(2, 9),
                                                                        name: parts[0].trim(),
                                                                        artist: parts.length > 1 ? parts[1].trim() : 'Unknown Artist',
                                                                        duration: parts.length > 2 ? parts[2].trim() : '-'
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    };
                                                    reader.readAsText(file);
                                                } else {
                                                    addSongToPlaylist(isUploadModalOpen, {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        name: file.name.replace(/\.[^/.]+$/, ""),
                                                        artist: 'Uploaded File',
                                                        duration: '-'
                                                    });
                                                }
                                            }
                                        });
                                        setIsUploadModalOpen(null);
                                    }
                                }} accept="audio/*,.pdf,.csv,.txt,.xlsx" multiple />
                            </div>
                            <button onClick={() => setIsUploadModalOpen(null)} style={{ fontFamily: 'Figtree, sans-serif' }} className="w-full py-3.5 bg-[#04222D] text-white rounded-[12px] font-semibold text-[15px] hover:bg-opacity-90 transition-colors mt-2">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Equipment Modal */}
            {isAddingEquipment && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white w-full max-w-[400px] rounded-[16px] overflow-hidden flex flex-col shadow-xl">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 relative">
                            <div className="flex flex-col">
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#9F9FA9] uppercase tracking-wider">ADD EQUIPMENT</span>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Equipment 1</h3>
                            </div>
                            <button onClick={() => setIsAddingEquipment(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors absolute right-4 top-4">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 bg-white">
                            <div className="flex flex-col gap-2">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#3F3F47]">Equipment Name</label>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newEquipment.name}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#3F3F47]">Equipment Quantity</label>
                                <input
                                    type="number"
                                    placeholder="No."
                                    value={newEquipment.quantity}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, quantity: e.target.value })}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#3F3F47]">Equipment Category</label>
                                <div className="relative">
                                    <select
                                        value={newEquipment.category}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-300 appearance-none ${!newEquipment.category ? 'text-[#9F9FA9]' : 'text-[#030303]'}`}
                                    >
                                        <option value="" disabled hidden>Placeholder</option>
                                        <option value="Sound" className="text-[#030303]">Sound</option>
                                        <option value="Lighting" className="text-[#030303]">Lighting</option>
                                        <option value="Visuals" className="text-[#030303]">Visuals</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-semibold text-[#3F3F47]">Equipment Sub-category</label>
                                <div className="relative">
                                    <select
                                        value={newEquipment.subCategory}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, subCategory: e.target.value })}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`w-full p-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-300 appearance-none ${!newEquipment.subCategory ? 'text-[#9F9FA9]' : 'text-[#030303]'}`}
                                    >
                                        <option value="" disabled hidden>Placeholder</option>
                                        <option value="Speakers" className="text-[#030303]">Speakers</option>
                                        <option value="Mixers" className="text-[#030303]">Mixers</option>
                                        <option value="Microphones" className="text-[#030303]">Microphones</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (newEquipment.name) {
                                        handleAddEquipment({ ...newEquipment, id: '' });
                                        setNewEquipment({ name: '', quantity: '', category: '', subCategory: '' });
                                        setIsAddingEquipment(false);
                                    }
                                }} 
                                style={{ fontFamily: 'Figtree, sans-serif' }} 
                                className="flex justify-center items-center gap-4 w-full mt-4 py-[16px] px-[32px] bg-[#04222D] border border-transparent text-white rounded-[52px] font-semibold text-[16px] hover:bg-opacity-90 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
