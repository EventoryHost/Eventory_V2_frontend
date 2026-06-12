'use client';
import { motion } from 'framer-motion';
import { FormData, AVATARS } from './types';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

interface Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    tempImage: string | null;
    setTempImage: (v: string | null) => void;
    zoom: number;
    setZoom: (v: number) => void;
    showZoomView: boolean;
    showProfileSheet: boolean;
    setShowProfileSheet: (v: boolean) => void;
    uploadingCover: boolean;
    coverProgress: number;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepProfileCover({
    formData, setFormData, tempImage, setTempImage,
    zoom, setZoom, showZoomView, showProfileSheet, setShowProfileSheet,
    uploadingCover, coverProgress, handleFileChange, handleCoverUpload,
}: Props) {
    return (
        <>
            <motion.div key="step9" {...sv} className="space-y-8 pb-10">
                {showZoomView ? (
                    <div className="space-y-8 flex flex-col items-center">
                        <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree w-full">
                            Uploaded profile picture
                        </h1>
                        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#04222D]/10 shadow-xl bg-gray-50">
                            <motion.img src={tempImage!} alt="Profile Preview"
                                className="w-full h-full object-cover" style={{ scale: zoom }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        </div>
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-medium font-figtree">Zoom</span>
                                <span className="text-xs text-gray-400 font-figtree">{Math.round(zoom * 100)}%</span>
                            </div>
                            <input type="range" min="1" max="3" step="0.01" value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#04222D]" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Profile Picture */}
                        <div className="space-y-2">
                            <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">Profile Picture</h1>
                            <p className="text-[#3F3F47] text-[14px] font-figtree">Choose a photo that represents you!</p>
                            <div className="relative w-[80px] h-[80px] mt-3">
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#E6E9EA] flex items-center justify-center border border-gray-200">
                                    {formData.profilePicture ? (
                                        <img src={formData.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.5">
                                            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                        </svg>
                                    )}
                                </div>
                                <button onClick={() => setShowProfileSheet(true)}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#04222D] rounded-full flex items-center justify-center shadow-md">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="h-[1px] bg-[#F4F4F5]" />

                        {/* Cover Photo */}
                        <div className="space-y-2">
                            <h2 className="text-[#030303] text-[24px] font-semibold font-figtree">Cover Photo</h2>
                            <p className="text-[#3F3F47] text-[14px] font-figtree">Choose a cover photo for your business profile</p>
                            <div className="relative mt-3">
                                <div className={`w-full h-[160px] rounded-[12px] flex items-center justify-center overflow-hidden bg-[#F0F0F0] border border-[#E4E4E7]`}>
                                    {formData.coverImage ? (
                                        <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                                    ) : (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    )}
                                </div>
                                <label className="absolute top-3 right-3 w-8 h-8 bg-[#04222D] rounded-full flex items-center justify-center cursor-pointer shadow-md">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                                </label>
                                {uploadingCover && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[12px] flex flex-col items-center justify-center gap-2 p-4">
                                        <span className="text-[12px] font-bold text-[#04222D]">Uploading... {coverProgress}%</span>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#04222D] transition-all duration-300" style={{ width: coverProgress + '%' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Profile Picture Bottom Sheet */}
            {showProfileSheet && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowProfileSheet(false)} />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] p-6 pb-28 shadow-2xl"
                    >
                        <div className="w-10 h-1 bg-[#E4E4E7] rounded-full mx-auto mb-6" />
                        <h2 className="text-[18px] font-bold text-[#030303] font-figtree mb-5">Edit Profile Picture</h2>

                        <p className="text-[13px] font-semibold text-[#71717B] font-figtree mb-3">Choose from Gallery</p>
                        <div className="flex gap-3 mb-4">
                            <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                                <div className="w-[64px] h-[64px] rounded-[12px] bg-[#F4F4F5] flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#71717B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                </div>
                                <span className="text-[11px] text-[#71717B] font-figtree">Open camera</span>
                                <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
                            </label>
                            {[0, 1, 2].map((i) => (
                                <label key={i} className="cursor-pointer">
                                    <div className="w-[64px] h-[64px] rounded-[12px] bg-[#F4F4F5] flex items-center justify-center">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-[1px] bg-[#E4E4E7]" />
                            <span className="text-[12px] text-[#A1A1AA] font-medium">or</span>
                            <div className="flex-1 h-[1px] bg-[#E4E4E7]" />
                        </div>

                        <p className="text-[13px] font-semibold text-[#71717B] font-figtree mb-3">Choose an Avatar</p>
                        <div className="flex gap-4 mb-6">
                            {AVATARS.map((url: string, idx: number) => (
                                <button key={idx} onClick={() => setTempImage(url)}
                                    className={`w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] transition-all ${tempImage === url ? 'border-[#04222D]' : 'border-transparent'}`}>
                                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (tempImage) setFormData((prev: FormData) => ({ ...prev, profilePicture: tempImage }));
                                setShowProfileSheet(false);
                            }}
                            className={`w-full h-[56px] rounded-[12px] font-bold text-[16px] font-figtree transition-all ${tempImage ? 'bg-[#04222D] text-white' : 'bg-[#E6E9EA] text-[#A1A1AA]'}`}>
                            Save
                        </button>
                    </motion.div>
                </>
            )}
        </>
    );
}
