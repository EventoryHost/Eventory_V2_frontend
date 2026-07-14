import React from 'react';
import { ArrowLeft, Upload, X, ChevronDown, RefreshCw, PlusCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Addon } from '../../components/AddonModal';
import { PolicyFile, SampleMediaFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

interface PAVAddonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addon: Addon) => void;
    addon?: Addon | null;
}

export function PAVAddonModal({ isOpen, onClose, onSave, addon }: PAVAddonModalProps) {
    const [name, setName] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [quantity, setQuantity] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [billingUnit, setBillingUnit] = React.useState('Per Event');
    
    // Custom Fields
    const [contentType, setContentType] = React.useState('');
    const [duration, setDuration] = React.useState('');
    const [pageCount, setPageCount] = React.useState('');
    const [coverType, setCoverType] = React.useState('');
    const [albumColors, setAlbumColors] = React.useState<string[]>([]);
    const [pageFinish, setPageFinish] = React.useState('');
    const [bindingType, setBindingType] = React.useState('');
    const [revisions, setRevisions] = React.useState('');
    const [noOfEditedPhotos, setNoOfEditedPhotos] = React.useState('');
    const [fileFormat, setFileFormat] = React.useState('');
    const [resolution, setResolution] = React.useState('');
    const [videoType, setVideoType] = React.useState('');

    const [policies, setPolicies] = React.useState<PolicyFile[]>([]);
    const [media, setMedia] = React.useState<SampleMediaFile[]>([]);
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
    const policyRef = React.useRef<HTMLInputElement>(null);
    const mediaRef = React.useRef<HTMLInputElement>(null);

    type FormTemplate = 'extra-crew' | 'social' | 'album' | 'photo' | 'video' | 'equipment' | 'standard';
    const [formTemplate, setFormTemplate] = React.useState<FormTemplate>('standard');

    React.useEffect(() => {
        if (isOpen && addon) {
            setName(addon.name);
            setCategory(addon.category);
            setQuantity(addon.quantity || '');
            setDescription(addon.description || '');
            setPrice(addon.price || '');
            setBillingUnit(addon.billingUnit || 'Per Event');
            
            setContentType(addon.contentType || '');
            setDuration(addon.duration || '');
            setPageCount(addon.pageCount || '');
            setCoverType(addon.coverType || '');
            setAlbumColors(addon.albumColors || []);
            setPageFinish(addon.pageFinish || '');
            setBindingType(addon.bindingType || '');
            setRevisions(addon.revisions || '');
            setNoOfEditedPhotos(addon.noOfEditedPhotos || '');
            setFileFormat(addon.fileFormat || '');
            setResolution(addon.resolution || '');
            setVideoType(addon.videoType || '');

            setPolicies(addon.policies || []);
            setMedia(addon.media || []);
            
            if (addon.name === 'Extra Crew') setFormTemplate('extra-crew');
            else if (addon.name === 'Same-day Edit') setFormTemplate('social');
            else if (addon.name === 'Photo Book') setFormTemplate('album');
            else if (addon.name === 'Engagement Shoot') setFormTemplate('photo');
            else if (addon.name === 'Cinematic Video') setFormTemplate('video');
            else if (addon.name === 'Equipment') setFormTemplate('equipment');
            else setFormTemplate('standard');
        } else if (isOpen) {
            setName(''); setCategory(''); setQuantity(''); setDescription(''); setPrice(''); setBillingUnit('Per Event');
            setContentType(''); setDuration(''); setPageCount(''); setCoverType(''); setAlbumColors([]); setPageFinish('');
            setBindingType(''); setRevisions(''); setNoOfEditedPhotos(''); setFileFormat(''); setResolution(''); setVideoType('');
            setPolicies([]); setMedia([]);
            setFormTemplate('standard');
        }
    }, [isOpen, addon]);

    if (typeof document === 'undefined') return null;

    const isExtraCrew = formTemplate === 'extra-crew';
    const isSocialContent = formTemplate === 'social';
    const isAlbum = formTemplate === 'album';
    const isPhoto = formTemplate === 'photo';
    const isVideo = formTemplate === 'video';
    const isEquipment = formTemplate === 'equipment';
    const isStandard = formTemplate === 'standard';

    const handleSave = () => {
        onSave({
            id: addon && addon.id && addon.id.length > 5 ? addon.id : Math.random().toString(36).substring(7),
            type: 'Service',
            name, category, subCategory: '', quantity, description, price, billingUnit, policies, media, 
            contentType, duration, pageCount, coverType, albumColors, pageFinish, bindingType, revisions, noOfEditedPhotos, fileFormat, resolution, videoType
        });
    };

    const handlePolicyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({ name: file.name, size: file.size, file: file }));
            setPolicies(prev => [...prev, ...filesArray]);
        }
        if (policyRef.current) policyRef.current.value = '';
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({ file, name: file.name, size: file.size, preview: URL.createObjectURL(file) }));
            setMedia(prev => [...prev, ...filesArray]);
        }
        if (mediaRef.current) mediaRef.current.value = '';
    };

    const Dropdown = ({ label, value, options, placeholder, onChange, dropdownId }: { label: string, value: string, options: string[], placeholder: string, onChange: (v: string) => void, dropdownId: string }) => (
        <div className="relative">
            {label && <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">{label}</label>}
            <button type="button" onClick={() => setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] font-normal text-left flex items-center justify-between" style={{ color: value ? '#030303' : '#9F9FA9' }}>
                {value || placeholder}
                <ChevronDown size={20} className="text-[#9F9FA9]" />
            </button>
            {activeDropdown === dropdownId && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2 max-h-[200px] overflow-y-auto">
                    {options.map(opt => (
                        <div key={opt} onClick={() => { onChange(opt); setActiveDropdown(null); }} className="px-4 py-3 cursor-pointer text-[14px] hover:bg-gray-50 text-[#030303]">{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed inset-0 bg-white z-[9999] overflow-y-auto"
                >
                    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-32 relative bg-white">
                        <div className="sticky top-0 bg-white z-10 flex items-center p-6 pb-2">
                            <button onClick={onClose} className="mr-4"><ArrowLeft size={24} className="text-[#030303]" /></button>
                            <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303]">Add-on</h2>
                        </div>

                        <div className="p-6 flex flex-col gap-6">
                            {/* Basic Details */}
                            <div className="bg-white border border-[#F4F4F5] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-4">Basic Details <span className="text-red-500">*</span></h3>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">
                                            {isSocialContent ? 'Add-on Name' : isEquipment ? 'Equipment Name' : isAlbum || isPhoto || isVideo ? 'Product Name' : 'Add-on name'}
                                        </label>
                                        {isExtraCrew ? (
                                            <Dropdown label="" value={name} options={['Extra Crew', 'Additional Shooter', 'Assistant']} placeholder="e.g" onChange={setName} dropdownId="name" />
                                        ) : (
                                            <input type="text" placeholder={isAlbum || isPhoto || isVideo ? "Product Name" : "Package Name"} value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                        )}
                                    </div>
                                    
                                    <Dropdown label="Category" value={category} options={['Drone', 'Video', 'Photo', 'Crew', 'Social', 'Other']} placeholder={isAlbum || isPhoto || isVideo || isEquipment ? "Choose" : "Dropdown + Text"} onChange={setCategory} dropdownId="category" />
                                    
                                    {isSocialContent && (
                                        <Dropdown label="Content type" value={contentType} options={['Reels', 'Teaser', 'Shorts', 'Highlights']} placeholder="Dropdown + Text" onChange={setContentType} dropdownId="contentType" />
                                    )}
                                    
                                    {(isExtraCrew || isAlbum || isPhoto || isVideo || isEquipment) && (
                                        <div>
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">Quantity</label>
                                            <input type="number" min="1" placeholder={isExtraCrew ? "No. of People" : "No. of Products"} value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                        </div>
                                    )}

                                    <div>
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">{isExtraCrew ? 'About this' : 'Description'}</label>
                                        <textarea placeholder="Add Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9] resize-none" />
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-1.5">Helper Text according to Input field.</p>
                                    </div>

                                    {isSocialContent && (
                                        <div>
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">Duration each</label>
                                            <input type="number" min="1" placeholder="Number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add-on specific (Album / Photo / Video) */}
                            {(isAlbum || isPhoto || isVideo) && (
                                <div className="bg-white border border-[#F4F4F5] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-4">Add-on specific</h3>
                                    <div className="flex flex-col gap-4">
                                        {isVideo && (
                                            <Dropdown label="Video Type" value={videoType} options={['Cinematic', 'Documentary', 'Highlight']} placeholder="Dropdown" onChange={setVideoType} dropdownId="videoType" />
                                        )}
                                        {isAlbum && (
                                            <>
                                                <div>
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">Page Count</label>
                                                    <input type="number" min="1" placeholder="Number of Pages" value={pageCount} onChange={e => setPageCount(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                                </div>
                                                <Dropdown label="Cover Type" value={coverType} options={['Leather', 'Linen', 'Custom']} placeholder="Dropdown" onChange={setCoverType} dropdownId="coverType" />
                                                <div>
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-2">COLOR</label>
                                                    <div className="flex items-center gap-4">
                                                        {['White', 'Red', 'Green'].map(color => {
                                                            const bgColor = color.toLowerCase() === 'white' ? '#FFFFFF' : color.toLowerCase() === 'red' ? '#EF4444' : '#22C55E';
                                                            return (
                                                                <div key={color} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setAlbumColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}>
                                                                    <div className={`w-[26px] h-[26px] rounded-full border-[2px] shadow-sm flex items-center justify-center transition-all ${albumColors.includes(color) ? 'border-gray-800 p-[2px]' : 'border-transparent'}`}>
                                                                        <div className="w-full h-full rounded-full border border-gray-200" style={{ backgroundColor: bgColor }} />
                                                                    </div>
                                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#3F3F47]">{color}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="flex flex-col items-center gap-1 cursor-pointer ml-2">
                                                            <div className="w-[26px] h-[26px] rounded-full border border-[#D4D4D8] flex items-center justify-center text-[#3F3F47]"><PlusCircle size={14}/></div>
                                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#3F3F47]">Add Color</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Dropdown label="Page Finish" value={pageFinish} options={['Matte', 'Glossy']} placeholder="Dropdown" onChange={setPageFinish} dropdownId="pageFinish" />
                                                <Dropdown label="Binding Type" value={bindingType} options={['Layflat', 'Standard']} placeholder="Dropdown" onChange={setBindingType} dropdownId="bindingType" />
                                                <div>
                                                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">Revisions</label>
                                                    <input type="number" min="0" placeholder="Eg - 3" value={revisions} onChange={e => setRevisions(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                                </div>
                                            </>
                                        )}
                                        {isPhoto && (
                                            <div>
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">No. of Edited Photos</label>
                                                <input type="number" min="0" placeholder="Number of edited photos" value={noOfEditedPhotos} onChange={e => setNoOfEditedPhotos(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                            </div>
                                        )}
                                        {(isPhoto || isVideo) && (
                                            <Dropdown label="File Format" value={fileFormat} options={['MP4', 'MOV', 'JPEG', 'RAW']} placeholder="Dropdown" onChange={setFileFormat} dropdownId="fileFormat" />
                                        )}
                                        {(isPhoto || isVideo) && (
                                            <Dropdown label="Resolution" value={resolution} options={['1080p', '4K', 'High-Res']} placeholder="Dropdown" onChange={setResolution} dropdownId="resolution" />
                                        )}
                                        {isVideo && (
                                            <div>
                                                <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">Duration</label>
                                                <input type="number" min="1" placeholder="Number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Pricing Details */}
                            <div className="bg-white border border-[#F4F4F5] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-4">{isEquipment ? 'Pricing Model' : 'Pricing Details'} <span className="text-red-500">*</span></h3>
                                <div className="flex flex-col gap-4">
                                    {(!isSocialContent && !isAlbum && !isPhoto && !isVideo && !isEquipment) && (
                                        <div>
                                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-2">How do you charge?</label>
                                            <div className="flex bg-[#F4F4F5] rounded-[8px] p-1 border border-[#E4E4E7]">
                                                <button onClick={() => setBillingUnit('Per Event')} className={`flex-1 py-2 text-[14px] font-medium rounded-[6px] transition-colors ${billingUnit === 'Per Event' ? 'bg-white text-[#030303] shadow-sm' : 'text-[#71717B]'}`}>Per Event</button>
                                                <button onClick={() => setBillingUnit('Per Hour')} className={`flex-1 py-2 text-[14px] font-medium rounded-[6px] transition-colors ${billingUnit === 'Per Hour' ? 'bg-white text-[#030303] shadow-sm' : 'text-[#71717B]'}`}>Per Hour</button>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] text-[#3F3F47] mb-1.5">{isSocialContent || isAlbum || isPhoto || isVideo || isEquipment ? 'Price Per Add-on' : 'Price'}</label>
                                        <div className="flex border border-[#E4E4E7] rounded-[8px] overflow-hidden focus-within:border-gray-400 transition-colors">
                                            <div className="flex items-center justify-center bg-[#F4F4F5] px-5 border-r border-[#E4E4E7]">
                                                <span className="text-[#3F3F47] text-[15px] font-medium">₹</span>
                                            </div>
                                            <input type="number" min="0" step="any" placeholder="0.0" value={price} onChange={e => setPrice(e.target.value)} className="flex-1 w-full min-w-0 p-4 bg-white text-[15px] focus:outline-none placeholder:text-[#9F9FA9]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Policies */}
                            <div>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-3">Policies and other documents <span className="text-red-500">*</span></h3>
                                {policies.length > 0 && (
                                    <div className="flex flex-col gap-3 mb-3">
                                        {policies.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 border border-[#F4F4F5] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                                <div className="flex items-center gap-2 text-[#D45900] flex-1 min-w-0 pr-2">
                                                    <span className="w-[18px] h-[18px] border-2 border-[#D45900] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0">i</span>
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-semibold text-[#030303] truncate">{file.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <button onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = '.pdf,.doc,.docx';
                                                        input.onchange = (e: any) => {
                                                            if (e.target.files && e.target.files.length > 0) {
                                                                const newFile = e.target.files[0];
                                                                setPolicies(prev => prev.map((p, i) => i === idx ? { name: newFile.name, size: newFile.size, file: newFile } : p));
                                                            }
                                                        };
                                                        input.click();
                                                    }} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3F3F47] hover:text-[#030303]">
                                                        Update <RefreshCw size={14} />
                                                    </button>
                                                    <button onClick={() => setPolicies(prev => prev.filter((_, i) => i !== idx))} className="text-[#9F9FA9] hover:text-[#3F3F47]">
                                                        <X size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => policyRef.current?.click()} className="w-full py-3 bg-[#E6E9EA] rounded-[8px] flex items-center justify-center gap-2 text-[14px] font-bold text-[#030303] transition-colors hover:bg-gray-200">
                                    Add <PlusCircle size={16} />
                                </button>
                                <input type="file" ref={policyRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handlePolicyUpload} multiple />
                            </div>

                            {/* Sample Media */}
                            <div>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-3">Sample Media <span className="text-red-500">*</span></h3>
                                <div className="bg-[#FAFAFA] border border-[#F4F4F5] rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                    <button onClick={() => mediaRef.current?.click()} className="w-full py-8 border border-dashed border-[#E4E4E7] bg-white rounded-[12px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-3 text-[#3F3F47]"><Upload size={20}/></div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303]">Tap to Upload media</span>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#9F9FA9] mt-1">Images and videos - Max 50 MB each</span>
                                    </button>
                                    <input type="file" ref={mediaRef} className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} multiple />
                                    
                                    {media.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            {media.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#E4E4E7] rounded-[12px] shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <img src={file.preview} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-semibold text-[#030303] truncate max-w-[150px]">{file.name}</span>
                                                            <span className="text-[11px] text-[#9F9FA9]">{formatFileSize(file.size)}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => {
                                                        setMedia(prev => {
                                                            const n = [...prev];
                                                            URL.revokeObjectURL(n[idx].preview);
                                                            n.splice(idx, 1);
                                                            return n;
                                                        });
                                                    }} className="text-[#3F3F47] p-2 hover:bg-gray-50 rounded-full"><X size={18}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-50 z-20 max-w-md mx-auto flex gap-4">
                            <button onClick={onClose} className="flex-1 py-4 border border-[#E4E4E7] text-[#030303] rounded-[12px] font-bold text-[15px] bg-white hover:bg-gray-50">Back</button>
                            <button onClick={handleSave} className="flex-1 py-4 bg-[#04222D] text-white rounded-[12px] font-bold text-[15px] hover:bg-[#031820]">Save Add-on</button>
                        </div>
                    </div>
                    {previewFile && <FilePreviewModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} fileUrl={previewFile.url} fileName={previewFile.name} />}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
