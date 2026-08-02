'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X, Upload, Plus, ChevronRight, ChevronDown, RefreshCw, PlusCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Addon } from '../../components/AddonModal';
import { formatFileSize, SampleMediaFile } from '../../shared/types';

const PRESET_ADDONS = [
    { name: 'Photo Booth', type: 'Service' as const },
    { name: 'Neon Sign Custom', type: 'Product' as const },
    { name: 'Car Decor', type: 'Service' as const },
    { name: 'Imported Flowers Upgrade', type: 'Product' as const },
    { name: 'LED Wall', type: 'Product' as const },
];

// Options now managed in component state to allow additions
const CATEGORY_OPTIONS = ['Floral', 'Lighting', 'Furniture', 'Signage', 'Backdrop', 'Other'];

interface PolicyFile { name: string; size: number; file?: File; preview?: string; }
interface Color { hex: string; label: string; }

const PRESET_COLORS: Color[] = [
    { hex: '#FFFFFF', label: 'White' },
    { hex: '#EF4444', label: 'Red' },
    { hex: '#22C55E', label: 'Green' },
];

interface Props { isOpen: boolean; onClose: () => void; onSave: (addon: Addon) => void; addon?: Addon | null; }
type Stage = 'PICK' | 'FORM';
const FF = { fontFamily: 'Figtree, sans-serif' };
const LABEL = 'block text-[13px] text-[#3F3F47] mb-1.5';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]';
const SECTION_CARD = 'bg-white border border-[#F4F4F5] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]';

export function DecoratorAddonModal({ isOpen, onClose, onSave, addon }: Props) {
    const [stage, setStage] = React.useState<Stage>('PICK');
    const [addonType, setAddonType] = React.useState<'Service' | 'Product'>('Service');
    const [addonName, setAddonName] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [subCategory, setSubCategory] = React.useState('');
    const [quantity, setQuantity] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [billingUnit, setBillingUnit] = React.useState<'Per Event' | 'Per Hour'>('Per Event');
    const [price, setPrice] = React.useState('');
    const [setupEnv, setSetupEnv] = React.useState<'Indoor' | 'Outdoor' | 'Both'>('Indoor');
    const [colors, setColors] = React.useState<Color[]>([...PRESET_COLORS]);
    const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
    const [customColorHex, setCustomColorHex] = React.useState('#000000');
    const [dimensions, setDimensions] = React.useState({ L: '', B: '', H: '', unit: 'CM' });
    const [policies, setPolicies] = React.useState<PolicyFile[]>([]);
    const [policyOptions, setPolicyOptions] = React.useState<string[]>(['Cancellation Policy', 'Last Minute Charges', 'General Policy', 'General Policy']);
    const [mediaFiles, setMediaFiles] = React.useState<SampleMediaFile[]>([]);
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

    const policyInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const mediaInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            if (addon) {
                setStage('FORM');
                setAddonType(addon.type === 'Product' ? 'Product' : 'Service');
                setAddonName(addon.name);
                setCategory(addon.category || '');
                setSubCategory(addon.subCategory || '');
                setQuantity(addon.quantity || '');
                setDescription(addon.description || '');
                setBillingUnit((addon.billingUnit as 'Per Event' | 'Per Hour') || 'Per Event');
                setPrice(addon.price || '');
                setPolicies(addon.policies || []);
                setMediaFiles(addon.media || []);
            } else {
                setStage('PICK');
                setAddonType('Service');
                setAddonName('');
                setCategory('');
                setSubCategory('');
                setQuantity('');
                setDescription('');
                setBillingUnit('Per Event');
                setPrice('');
                setPolicies([]);
                setMediaFiles([]);
                setSelectedColors([]);
                setDimensions({ L: '', B: '', H: '', unit: 'CM' });
            }
        }
    }, [isOpen, addon]);

    if (!isOpen || typeof document === 'undefined') return null;

    const pickPreset = (p: { name: string; type: 'Service' | 'Product' }) => {
        setAddonName(p.name); setAddonType(p.type); setStage('FORM');
    };

    const handleSave = () => {
        const dimStr = (dimensions.L || dimensions.B || dimensions.H) 
            ? `${dimensions.L || 0} x ${dimensions.B || 0} x ${dimensions.H || 0} ${dimensions.unit}` 
            : '';
        const colorLabels = selectedColors.map(hex => {
            const found = colors.find(c => c.hex === hex);
            return found ? found.label : hex;
        });

        const saved: Addon = {
            id: addon?.id || Math.random().toString(36).substring(7),
            type: addonType, name: addonName, category, subCategory,
            quantity, description, price, billingUnit, policies, media: mediaFiles,
            colors: colorLabels.length > 0 ? colorLabels : undefined,
            dimensions: dimStr ? dimStr : undefined
        };
        onSave(saved);
    };

    const handlePolicyUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setPolicies(prev => { const u = [...prev]; u[idx] = { name: file.name, size: file.size, file }; return u; });
        }
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, file: f, preview: URL.createObjectURL(f) }));
            setMediaFiles(prev => [...prev, ...files]);
        }
        if (mediaInputRef.current) mediaInputRef.current.value = '';
    };

    const toggleColor = (hex: string) => setSelectedColors(prev => prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]);
    const addCustomColor = () => {
        if (colors.find(c => c.hex === customColorHex)) return;
        setColors(prev => [...prev, { hex: customColorHex, label: 'Custom' }]);
        setSelectedColors(prev => [...prev, customColorHex]);
    };

    const PickStage = (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md mx-auto bg-white rounded-t-[24px] flex flex-col max-h-[90vh] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            >
                <div className="w-full flex items-center justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-[#E4E4E7] rounded-full" />
                </div>

                <div className="flex items-start justify-between px-6 pt-2 pb-5">
                    <div className="flex flex-col gap-1.5">
                        <h2 style={FF} className="text-[22px] font-bold text-[#030303] leading-none">Add an Add-on</h2>
                        <p style={FF} className="text-[14px] text-[#71717B]">Pick one to start, or build your own</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#3F3F47] hover:bg-gray-200 transition-colors mt-[-4px]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 flex flex-col gap-3 overflow-y-auto pb-10">
                    {PRESET_ADDONS.map(p => (
                        <button
                            key={p.name}
                            type="button"
                            onClick={() => pickPreset(p)}
                            className="w-full p-4 border border-[#E4E4E7] rounded-[16px] flex items-center justify-between cursor-pointer hover:border-[#D4D4D8] hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span style={FF} className="text-[15px] font-bold text-[#030303]">{p.name}</span>
                                <span style={FF} className="text-[12px] text-[#9F9FA9]">{p.type}</span>
                            </div>
                            <ChevronRight size={20} className="text-[#04222D] flex-shrink-0" />
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => { setAddonName(''); setStage('FORM'); }}
                        className="w-full p-4 border border-[#E4E4E7] rounded-[16px] flex items-center gap-4 cursor-pointer hover:border-[#D4D4D8] hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-2 text-left"
                    >
                        <div className="w-10 h-10 rounded-[12px] bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                            <Plus size={20} className="text-[#030303]" />
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span style={FF} className="text-[15px] font-bold text-[#030303]">Add a custom add-on</span>
                            <span style={FF} className="text-[12px] text-[#9F9FA9]">e.g. Drone shot, Live streaming</span>
                        </div>
                        <ChevronRight size={20} className="text-[#04222D] flex-shrink-0" />
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const FormStage = (
        <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-32">
                <div className="sticky top-0 bg-white z-10 flex items-center p-6 pb-2">
                    <button type="button" onClick={() => addon ? onClose() : setStage('PICK')} className="mr-4">
                        <ArrowLeft size={24} className="text-[#030303]" />
                    </button>
                    <h2 style={FF} className="text-[20px] font-bold text-[#030303]">Add-on</h2>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* ADD-ON TYPE */}
                    <div>
                        <p style={FF} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-3">ADD-ON TYPE</p>
                        <div className="flex bg-[#F4F4F5] rounded-[12px] p-1 relative">
                            {(['Service', 'Product'] as const).map(t => (
                                <button key={t} type="button" onClick={() => setAddonType(t)} style={FF}
                                    className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-colors relative z-10 ${addonType === t ? 'text-white' : 'text-[#71717B]'}`}>
                                    {t}
                                </button>
                            ))}
                            <div className="absolute top-1 bottom-1 bg-[#030303] rounded-[10px] transition-all duration-300 ease-in-out"
                                style={{ width: 'calc(50% - 4px)', left: '4px', transform: addonType === 'Service' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }} />
                        </div>
                    </div>

                    {/* Basic Details */}
                    <div className={SECTION_CARD}>
                        <h3 style={FF} className="text-[14px] font-bold text-[#030303] mb-4">
                            Basic Details <span className="text-red-500">*</span>
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label style={FF} className={LABEL}>
                                    {addonType === 'Service' ? 'Service Name' : 'Product Name'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={addonType === 'Service' ? 'Package Name' : 'Product Name'}
                                    value={addonName}
                                    onChange={e => setAddonName(e.target.value)}
                                    style={FF}
                                    className={INPUT}
                                />
                            </div>

                            {addonType === 'Service' ? (
                                <div>
                                    <label style={FF} className={LABEL}>Category</label>
                                    <input
                                        type="text"
                                        placeholder="Name Category"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        style={FF}
                                        className={INPUT}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <label style={FF} className={LABEL}>Category</label>
                                        <button
                                            type="button"
                                            onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] text-left flex items-center justify-between"
                                            style={{ color: category ? '#030303' : '#9F9FA9' }}
                                        >
                                            {category || 'Name Category'}
                                            <ChevronDown size={20} className="text-[#9F9FA9]" />
                                        </button>
                                        {activeDropdown === 'category' && (
                                            <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg z-20 py-2 max-h-[200px] overflow-y-auto">
                                                {CATEGORY_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setCategory(opt); setActiveDropdown(null); }}
                                                        className="w-full px-4 py-3 text-left text-[14px] text-[#030303] hover:bg-gray-50"
                                                        style={FF}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={FF} className={LABEL}>Sub-Category</label>
                                        <input
                                            type="text"
                                            placeholder="Sub Category"
                                            value={subCategory}
                                            onChange={e => setSubCategory(e.target.value)}
                                            style={FF}
                                            className={INPUT}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label style={FF} className={LABEL}>Quantity</label>
                                <input
                                    type="text"
                                    placeholder="No. of Products"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value.replace(/\D/g, ''))}
                                    style={FF}
                                    className={INPUT}
                                />
                            </div>

                            <div>
                                <label style={FF} className={LABEL}>Description</label>
                                <textarea
                                    placeholder="Add Description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={FF}
                                    rows={3}
                                    className={`${INPUT} resize-none`}
                                />
                                <p style={FF} className="text-[11px] text-[#9F9FA9] mt-1.5">Helper Text according to Input field.</p>
                            </div>
                        </div>
                    </div>

                    {/* Physical Specification – Product only */}
                    {addonType === 'Product' && (
                        <div className={SECTION_CARD}>
                            <h3 style={FF} className="text-[14px] font-bold text-[#030303] mb-4">Physical Specification</h3>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label style={FF} className={LABEL}>Color</label>
                                    <div className="flex items-start gap-3 flex-wrap">
                                        {colors.map(c => (
                                            <button key={c.hex} type="button" onClick={() => toggleColor(c.hex)} className="flex flex-col items-center gap-1">
                                                <div
                                                    className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColors.includes(c.hex) ? 'border-[#030303] scale-110' : 'border-[#E4E4E7]'}`}
                                                    style={{ backgroundColor: c.hex }}
                                                />
                                                <span style={FF} className="text-[10px] text-[#9F9FA9]">{c.label}</span>
                                            </button>
                                        ))}
                                        <div className="flex flex-col items-center gap-1">
                                            <label className="w-9 h-9 rounded-full border-2 border-dashed border-[#9F9FA9] flex items-center justify-center cursor-pointer hover:border-[#030303] transition-colors">
                                                <Plus size={16} className="text-[#9F9FA9]" />
                                                <input type="color" className="hidden" value={customColorHex} onChange={e => setCustomColorHex(e.target.value)} onBlur={addCustomColor} />
                                            </label>
                                            <span style={FF} className="text-[10px] text-[#9F9FA9]">Add Color</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label style={FF} className={LABEL}>Dimension (L x B x H)</label>
                                    <div className="flex gap-2 items-center">
                                        {(['L', 'B', 'H'] as const).map(dim => (
                                            <input
                                                key={dim}
                                                type="text"
                                                placeholder={dim}
                                                value={dimensions[dim]}
                                                onChange={e => setDimensions(prev => ({ ...prev, [dim]: e.target.value.replace(/\D/g, '') }))}
                                                style={FF}
                                                className="flex-1 min-w-0 px-3 py-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] text-center focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                                            />
                                        ))}
                                        <select
                                            value={dimensions.unit}
                                            onChange={e => setDimensions(prev => ({ ...prev, unit: e.target.value }))}
                                            style={FF}
                                            className="px-2 py-3 bg-white border border-[#E4E4E7] rounded-[8px] text-[13px] focus:outline-none flex-shrink-0"
                                        >
                                            {['CM', 'FT', 'IN', 'M'].map(u => <option key={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Model */}
                    <div className={SECTION_CARD}>
                        <h3 style={FF} className="text-[14px] font-bold text-[#030303] mb-4">
                            Pricing Model <span className="text-red-500">*</span>
                        </h3>
                        <div className="flex flex-col gap-4">
                            {addonType === 'Service' && (
                                <div>
                                    <label style={FF} className={LABEL}>How do you charge?</label>
                                    <div className="flex bg-[#F4F4F5] rounded-[8px] p-1 border border-[#E4E4E7]">
                                        {(['Per Event', 'Per Hour'] as const).map(u => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setBillingUnit(u)}
                                                style={FF}
                                                className={`flex-1 py-2 text-[14px] font-medium rounded-[6px] transition-colors ${billingUnit === u ? 'bg-white text-[#030303] shadow-sm' : 'text-[#71717B]'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label style={FF} className={LABEL}>
                                    {addonType === 'Service' ? 'Add-on Price' : 'Price Per Event'}
                                </label>
                                <div className="flex border border-[#E4E4E7] rounded-[8px] overflow-hidden focus-within:border-gray-400 transition-colors">
                                    <div className="flex items-center justify-center bg-[#F4F4F5] px-5 border-r border-[#E4E4E7]">
                                        <span style={FF} className="text-[15px] font-medium text-[#3F3F47]">₹</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="0.0"
                                        value={price}
                                        onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                                        style={FF}
                                        className="flex-1 w-full min-w-0 p-4 bg-white text-[15px] focus:outline-none placeholder:text-[#9F9FA9]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Type of Setup – Product only */}
                    {addonType === 'Product' && (
                        <div>
                            <h3 style={FF} className="text-[14px] font-bold text-[#030303] mb-3">Type of Setup</h3>
                            <div className="flex gap-2">
                                {(['Indoor', 'Outdoor', 'Both'] as const).map(env => (
                                    <button
                                        key={env}
                                        type="button"
                                        onClick={() => setSetupEnv(env)}
                                        style={FF}
                                        className={`flex-1 py-2.5 rounded-full text-[14px] font-medium border transition-colors ${setupEnv === env ? 'bg-[#030303] text-white border-[#030303]' : 'bg-white text-[#3F3F47] border-[#E4E4E7]'}`}
                                    >
                                        {env}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Policies */}
                    <div>
                        <h3 style={FF} className="text-[14px] font-bold text-[#030303] mb-3">
                            Policies and other documents <span className="text-red-500">*</span>
                        </h3>
                        <div className={`${SECTION_CARD} flex flex-col gap-3`}>
                            {policyOptions.map((pName, idx) => {
                                const uploaded = policies[idx];
                                return (
                                    <div key={`${pName}-${idx}`} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {uploaded ? (
                                                <div className="w-9 h-9 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                                                    <svg width="14" height="10" viewBox="0 0 10 8" fill="none">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
                                                    <Info size={18} className="text-[#D45900]" />
                                                </div>
                                            )}
                                            <span style={FF} className="text-[14px] font-semibold text-[#030303] truncate">{pName}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => policyInputRefs.current[idx]?.click()}
                                            style={FF}
                                            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3F3F47] hover:text-[#030303] flex-shrink-0"
                                        >
                                            {uploaded ? (
                                                <>Update <RefreshCw size={14} /></>
                                            ) : (
                                                <>Upload <Upload size={14} /></>
                                            )}
                                        </button>
                                        <input
                                            ref={el => { policyInputRefs.current[idx] = el; }}
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={e => handlePolicyUpload(idx, e)}
                                        />
                                    </div>
                                );
                            })}
                            <button
                                type="button"
                                onClick={() => setPolicyOptions(prev => [...prev, 'General Policy'])}
                                className="w-full py-3 bg-[#E6E9EA] rounded-[8px] flex items-center justify-center gap-2 text-[14px] font-bold text-[#030303] transition-colors hover:bg-gray-200"
                            >
                                Add <PlusCircle size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Sample Media */}
                    <div>
                        <h3 style={FF} className="text-[14px] font-bold text-[#030303] mb-3">
                            Sample Media <span className="text-red-500">*</span>
                        </h3>
                        <div className="bg-[#FAFAFA] border border-[#F4F4F5] rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <button
                                type="button"
                                onClick={() => mediaInputRef.current?.click()}
                                className="w-full py-8 border border-dashed border-[#E4E4E7] bg-white rounded-[12px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-3 text-[#3F3F47]">
                                    <Upload size={20} />
                                </div>
                                <span style={FF} className="text-[14px] font-bold text-[#030303]">Tap to Upload media</span>
                                <span style={FF} className="text-[11px] text-[#9F9FA9] mt-1">Images and videos - Max 50 MB each</span>
                            </button>
                            <input ref={mediaInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />

                            {mediaFiles.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {mediaFiles.map((f, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#E4E4E7] rounded-[12px] shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {f.preview && (
                                                    <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span style={FF} className="text-[13px] font-semibold text-[#030303] truncate">{f.name}</span>
                                                    <span style={FF} className="text-[11px] text-[#9F9FA9]">
                                                        {f.size ? formatFileSize(f.size) : 'Uploaded'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-[#3F3F47] p-2 hover:bg-gray-50 rounded-full flex-shrink-0"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-50 z-20 max-w-md mx-auto flex gap-4">
                    <button
                        type="button"
                        onClick={() => addon ? onClose() : setStage('PICK')}
                        style={FF}
                        className="flex-1 py-4 border border-[#E4E4E7] text-[#030303] rounded-[12px] font-bold text-[15px] bg-white hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!addonName.trim()}
                        style={FF}
                        className={`flex-1 py-4 rounded-[12px] font-bold text-[15px] text-white transition-colors ${addonName.trim() ? 'bg-[#04222D] hover:bg-[#031820]' : 'bg-[#829296] cursor-not-allowed'}`}
                    >
                        Save Add-on
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(stage === 'PICK' ? PickStage : FormStage, document.body);
}
