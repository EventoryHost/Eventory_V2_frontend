'use client';
import { motion } from 'framer-motion';
import { X, Plus, Image as ImageIcon } from 'lucide-react';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

interface GuidelinesProps { stepKey: string; }
export function StepGuidelines({ stepKey }: GuidelinesProps) {
    return (
        <motion.div key={stepKey} {...sv} className="space-y-8 pb-10">
            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">Uploading images guidelines</h1>
            <div className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-[14px] font-bold text-[#3F3F47] uppercase tracking-wider font-figtree">SUITABLE</h2>
                    <div className="w-full h-48 rounded-2xl overflow-hidden">
                        <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/correctguidelineimage.png"
                            alt="Suitable example" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-3">
                        {['Clear images of your space', 'At least 5 Images', 'Images should be high resolution'].map(t => (
                            <div key={t} className="flex items-center gap-3 text-green-600">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                <span className="text-[14px] font-medium font-figtree">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4 pt-6">
                    <h2 className="text-[14px] font-bold text-[#3F3F47] uppercase tracking-wider font-figtree">UNSUITABLE</h2>
                    <div className="w-full h-40 rounded-2xl overflow-hidden">
                        <img src="https://dkuacgndftndz.cloudfront.net/inventory-page/wrongguidelineimage.png"
                            alt="Unsuitable example" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-3">
                        {['Stock Image', 'Logos and brand Image'].map(t => (
                            <div key={t} className="flex items-center gap-3 text-rose-500">
                                <X size={18} />
                                <span className="text-[14px] font-medium font-figtree">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface CarouselProps {
    businessPhotos: string[];
    uploadingPhotos: boolean;
    photosProgress: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (idx: number) => void;
}
export function StepCarousel({ businessPhotos, uploadingPhotos, photosProgress, onUpload, onRemove }: CarouselProps) {
    return (
        <motion.div key="step12" {...sv} className="space-y-8 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">Upload images for carousel</h1>
                <p className="text-[#3F3F47] text-[15px] font-figtree leading-relaxed">
                    Add 3 to 10 images of your location to your profile for the carousel. Drag and drop to reorder them.
                </p>
            </div>
            <div className="space-y-4">
                <div className="w-full p-8 rounded-[8px] bg-[#E6E9EA] flex flex-col items-center justify-center gap-4 border border-[#71717B]/20 relative overflow-hidden">
                    {uploadingPhotos && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
                            <div className="w-full max-w-[250px] space-y-2">
                                <div className="flex justify-between text-[12px] font-bold text-[#04222D]">
                                    <span>Uploading Photos...</span><span>{photosProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#04222D] transition-all duration-300" style={{ width: photosProgress + '%' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#04222D]">
                        <ImageIcon size={24} />
                    </div>
                    <label className="bg-white text-[#04222d] border border-[#04222d] px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-gray-50 shadow-sm">
                        Choose a File
                        <input type="file" className="hidden" accept="image/*" multiple onChange={onUpload} />
                    </label>
                    <div className="text-center">
                        <p className="text-[16px] font-semibold text-[#04222D] font-figtree">Add your images</p>
                        <p className="text-[12px] text-gray-500 mt-1 font-figtree">Max size 10 MB</p>
                    </div>
                </div>
                {businessPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {businessPhotos.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                                <img src={photo} className="w-full h-full object-cover" />
                                <button onClick={() => onRemove(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {businessPhotos.length < 10 && (
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:border-[#04222D] hover:text-[#04222D] cursor-pointer transition-all">
                                <Plus size={32} />
                                <input type="file" className="hidden" accept="image/*" multiple onChange={onUpload} />
                            </label>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
