'use client';
import { motion } from 'framer-motion';
import { X, Plus, Image as ImageIcon } from 'lucide-react';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

const s3Base = "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package";

const guidelineSections = [
    {
        title: "Clear, In-focus photos",
        correctLabel: "Sharp",
        correctImg: `${s3Base}/sharpfood.svg`,
        incorrectLabel: "Blurry",
        incorrectImg: `${s3Base}/blurryfood.svg`,
        description: "Keep photos sharp and in focus. Blurry shots are hard to trust."
    },
    {
        title: "No Branding text or watermarks",
        correctLabel: "Clean",
        correctImg: `${s3Base}/cleandj.svg`,
        incorrectLabel: "Has watermark",
        incorrectImg: `${s3Base}/watermarkdj.svg`,
        description: "Skip photos with logos, prices, or watermarks. These can get your listing removed."
    },
    {
        title: "Your own work only",
        correctLabel: "Real",
        correctImg: `${s3Base}/realwork.svg`,
        incorrectLabel: "From the internet",
        incorrectImg: `${s3Base}/internetwork.svg`,
        description: "Upload photos of your actual work. Never use images from the internet."
    },
    {
        title: "Good lighting",
        correctLabel: "Bright",
        correctImg: `${s3Base}/bright.svg`,
        incorrectLabel: "Too dark",
        incorrectImg: `${s3Base}/dark.svg`,
        description: "Shoot in bright, even light so your work is easy to see."
    },
    {
        title: "Clean background",
        correctLabel: "Tidy",
        correctImg: `${s3Base}/tidyfood.svg`,
        incorrectLabel: "Cluttered",
        incorrectImg: `${s3Base}/clutteredfood.svg`,
        description: "Clear the space around your subject. A messy background distracts from your work."
    }
];

interface GuidelinesProps { stepKey: string; }
export function StepGuidelines({ stepKey }: GuidelinesProps) {
    return (
        <motion.div key={stepKey} {...sv} className="space-y-8 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">Uploading images guidelines</h1>
                <p className="text-[#3F3F47] text-[15px] font-figtree leading-relaxed">
                    A few things to check before you upload — better photos get more bookings.
                </p>
            </div>
            
            <div className="space-y-8">
                {guidelineSections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                        <h2 className="text-[16px] font-bold text-[#030303] font-figtree">{section.title}</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <img src={section.correctImg} alt={section.correctLabel} className="w-full object-contain" />
                            <img src={section.incorrectImg} alt={section.incorrectLabel} className="w-full object-contain" />
                        </div>

                        <p className="text-[13px] text-[#3F3F47] font-figtree leading-relaxed">{section.description}</p>
                    </div>
                ))}
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
