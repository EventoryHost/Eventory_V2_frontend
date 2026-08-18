'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ArrowLeft, XCircle, Upload, Camera, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = apiUrl('');

function AadhaarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [aadhaar, setAadhaar] = useState('');
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [loading, setLoading] = useState(false);
    const [digilockerLoading, setDigilockerLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(true);
    const [isVerifyingReturn, setIsVerifyingReturn] = useState(false);
    const [lastVerificationId, setLastVerificationId] = useState('');

    const aadhaarInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    // Handle DigiLocker return
    useEffect(() => {
        const vId = searchParams.get('verification_id');
        const status = searchParams.get('status');
        if (vId && status === 'SUCCESS') {
            setShowPopup(false);
            setIsVerifyingReturn(true);
            verifyStatus(vId);
        }
    }, [searchParams]);

    const verifyStatus = async (id: string) => {
        try {
            const vendorId = localStorage.getItem('vendor_id');
            const res = await fetch(`${API_BASE}/verification/digilocker/document/${id}?vendor_id=${vendorId}`);
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                router.push('/dashboard/documents/pan');
            }
        } catch (err) {
            setError('Verification failed');
            setIsVerifyingReturn(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'selfie') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        if (type === 'aadhaar') {
            setAadhaarFile(file);
            setAadhaarPreview(url);
        } else {
            setSelfieFile(file);
            setSelfiePreview(url);
        }
        setError('');
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (err) {
            console.error("Camera access denied or unavailable", err);
            setError("Camera access is required. Please grant camera permissions in your browser.");
            setIsCameraOpen(false);
        }
    };

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Mirror the canvas context since the video is mirrored
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                        setSelfieFile(file);
                        setSelfiePreview(URL.createObjectURL(file));
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleFaceMatchContinue = async () => {
        if (aadhaar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar number.');
            return;
        }
        if (!aadhaarFile) {
            setError('Please upload the front image of your Aadhaar card.');
            return;
        }
        if (!selfieFile) {
            setError('Please take a selfie to verify your identity.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const vendorId = localStorage.getItem('vendor_id') || '';
            const formData = new FormData();
            formData.append('first_image', aadhaarFile);
            formData.append('second_image', selfieFile);
            // Include vendor_id so backend can update the isFaceMatchVerified
            
            const res = await fetch(`${API_BASE}/verification/face-match?vendor_id=${vendorId}`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.status === 'SUCCESS' && data.face_match_result === 'YES') {
                // Also save the aadhaar number specifically and mark verified
                await fetch(`${API_BASE}/vendors/${vendorId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        aadharNumber: aadhaar,
                        isAadharVerified: true 
                    })
                });
                router.push('/dashboard/documents/pan');
            } else if (data.status === 'SUCCESS' && data.face_match_result === 'NO') {
                setError('Face match failed. The faces do not match. Please try again.');
            } else {
                setError(data.message || 'Face match verification failed.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDigilocker = async () => {
        if (aadhaar.length !== 12) {
            setError('Please enter your Aadhaar number before proceeding with DigiLocker.');
            return;
        }
        setDigilockerLoading(true);

        if (/^0+$/.test(aadhaar)) {
            console.log("🟡 Dummy Aadhaar detected → Bypassing URL generation");
            setLastVerificationId('dummy_v_id');
            const vendorId = localStorage.getItem('vendor_id');
            await fetch(`${API_BASE}/verification/digilocker/document/dummy_v_id?vendor_id=${vendorId}&aadhar_number=${aadhaar}`);
            setDigilockerLoading(false);
            router.push('/dashboard/documents/pan');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/verification/digilocker/generate-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    redirect_url: `${window.location.origin}/dashboard/documents/aadhaar`,
                    aadhaar_number: aadhaar
                })
            });
            const data = await res.json();
            if (data.url) {
                // Redirect current window to DigiLocker
                window.location.href = data.url;
            } else {
                setError('Failed to start DigiLocker verification');
                setDigilockerLoading(false);
            }
        } catch (err) {
            setError('Failed to start DigiLocker verification');
            setDigilockerLoading(false);
        }
    };

    const formatAadhaar = (val: string) => val.replace(/\D/g, '').substring(0, 12);
    const isValid = aadhaar.length === 12 && aadhaarFile && selfieFile;

    if (isVerifyingReturn) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[16px] font-bold text-[#030303]">Verifying with DigiLocker...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree relative overflow-x-hidden">
            {/* ─── BASE LAYER: Aadhaar Input Form ──────────────────────────────── */}
            <div className={`flex-1 flex flex-col transition-all duration-500 pb-32 ${showPopup ? 'blur-sm grayscale-[0.2] brightness-90' : 'blur-0'}`}>
                {/* Top Nav */}
                <div className="px-6 pt-12">
                    <div className="w-full h-[6px] rounded-full bg-[#E5E5E5] mb-6 overflow-hidden">
                        <div className="h-full w-[40%] bg-[#031B24] rounded-full" />
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[#030303] text-[16px] font-semibold mb-8">
                        <ChevronLeft size={20} />
                        <span>Save & Exit</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6">
                    <h1 className="text-[#030303] text-[28px] font-bold leading-tight mb-2">
                        Verify your Aadhaar
                    </h1>
                    <p className="text-[#71717B] text-[15px] mb-8">
                        Enter your Aadhaar number and verify your identity securely.
                    </p>

                    <div className="space-y-6">
                        {/* 1. Aadhaar Number */}
                        <div>
                            <label className="block text-[14px] font-bold text-[#030303] mb-2">Aadhaar Number</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0000 1111 2222"
                                value={aadhaar.replace(/(.{4})/g, '$1 ').trim()}
                                onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                                className="w-full px-5 py-4 border border-[#E4E4E7] bg-[#FAFAFA] rounded-2xl outline-none text-[18px] font-bold tracking-[2px] text-[#030303] focus:border-[#030303] focus:bg-white transition-all placeholder:tracking-normal placeholder:text-[#A1A1AA] placeholder:font-medium"
                            />
                        </div>

                        {/* 2. Aadhaar Document Upload */}
                        <div>
                            <label className="block text-[14px] font-bold text-[#030303] mb-2">Upload Aadhaar Front</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={aadhaarInputRef} 
                                className="hidden" 
                                onChange={(e) => handleFileChange(e, 'aadhaar')}
                            />
                            <div 
                                onClick={() => aadhaarInputRef.current?.click()}
                                className={`w-full aspect-[2/1] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all relative ${aadhaarPreview ? 'border-transparent' : 'border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#F4F4F5]'}`}
                            >
                                {aadhaarPreview ? (
                                    <>
                                        <img src={aadhaarPreview} alt="Aadhaar Front" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-bold text-[14px] flex items-center gap-2"><Upload size={18}/> Replace Image</p>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white text-green-600 rounded-full p-1 shadow-md">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center p-6 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                            <FileText className="text-[#04222D]" size={24} />
                                        </div>
                                        <span className="text-[15px] font-bold text-[#030303] mb-1">Tap to upload</span>
                                        <span className="text-[13px] text-[#71717B]">Clear photo of Aadhaar front</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Selfie Capture */}
                        <div>
                            <label className="block text-[14px] font-bold text-[#030303] mb-2">Take a Selfie</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="user"
                                ref={selfieInputRef} 
                                className="hidden" 
                                onChange={(e) => handleFileChange(e, 'selfie')}
                            />
                            <div 
                                onClick={() => {
                                    // Detect if it's a mobile device to decide between native input or custom camera UI
                                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                                    if (isMobile) {
                                        selfieInputRef.current?.click();
                                    } else {
                                        startCamera();
                                    }
                                }}
                                className={`w-full aspect-square border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all relative ${selfiePreview ? 'border-transparent' : 'border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#F4F4F5]'}`}
                            >
                                {selfiePreview ? (
                                    <>
                                        <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover transform scale-x-[-1]" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-bold text-[14px] flex items-center gap-2"><Camera size={18}/> Retake Selfie</p>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white text-green-600 rounded-full p-1 shadow-md">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center p-6 text-center">
                                        <div className="w-14 h-14 bg-[#04222D] text-white rounded-full flex items-center justify-center shadow-md mb-4">
                                            <Camera size={26} />
                                        </div>
                                        <span className="text-[16px] font-bold text-[#030303] mb-1">Open Camera</span>
                                        <span className="text-[13px] text-[#71717B]">Take a selfie to match with Aadhaar</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 p-4 rounded-[12px]">
                                <XCircle className="text-[#E11D48] shrink-0 mt-[2px]" size={18} />
                                <p className="text-[14px] font-medium text-[#E11D48] leading-tight">{error}</p>
                            </div>
                        )}
                        
                        {/* Alternative DigiLocker Flow */}
                        <div className="pt-4 border-t border-[#E4E4E7] flex flex-col items-center">
                            <p className="text-[13px] text-[#71717B] mb-4">Or verify without taking photos</p>
                            <button
                                onClick={lastVerificationId ? () => verifyStatus(lastVerificationId) : handleDigilocker}
                                disabled={digilockerLoading || loading}
                                className="w-full h-14 border-2 border-[#E4E4E7] bg-white rounded-[16px] font-bold text-[#030303] text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                {digilockerLoading ? (
                                    <span className="w-5 h-5 border-2 border-[#030303] border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <ShieldCheck size={20} className="text-[#3B82F6]"/>
                                )}
                                {lastVerificationId ? 'Check DigiLocker Status' : 'Continue with DigiLocker'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar for Face Match */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-6 py-5 flex items-center gap-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                    <button
                        onClick={() => router.back()}
                        className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-[#F3F4F6] border border-[#E5E7EB] active:scale-95 transition-all"
                    >
                        <ArrowLeft size={24} className="text-[#030303]" />
                    </button>
                    <button
                        disabled={!isValid || loading || digilockerLoading}
                        onClick={handleFaceMatchContinue}
                        className={`flex-1 h-16 rounded-[20px] font-bold text-[18px] flex items-center justify-center transition-all ${
                            isValid && !loading ? 'bg-[#04222D] text-white shadow-[0_8px_20px_rgba(4,34,45,0.2)] active:scale-[0.98]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Verifying...' : 'Verify Identity'}
                    </button>
                </div>
            </div>

            {/* ─── OVERLAY LAYER: Bottom Sheet Popup ─────────────────────────── */}
            <AnimatePresence>
                {showPopup && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-[90]"
                        />
                        
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[48px] px-8 pt-10 pb-8 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-[18px] font-bold text-[#030303] mb-1">
                                        For easy form filling process
                                    </h2>
                                    <p className="text-[14px] text-[#71717B] font-medium">
                                        Please keep the following documents handy
                                    </p>
                                </div>
                                <div className="text-[40px] leading-none transform rotate-12 relative -top-2">
                                    📝
                                </div>
                            </div>

                            <div className="w-full h-[1px] bg-[#F0F0F0] mb-8" />

                            <ul className="space-y-5 mb-10 pl-1">
                                {['Aadhar Card', 'PAN CARD', 'GSTIN Number', 'Bank Details'].map(item => (
                                    <li key={item} className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                                        <span className="text-[16px] font-bold text-[#030303]">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setShowPopup(false)}
                                className="w-full h-[60px] bg-[#04222D] text-white rounded-[16px] font-semibold text-[16px] flex items-center justify-center active:scale-[0.98] transition-all shadow-lg"
                            >
                                Let&apos;s Begin
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Custom Camera Overlay for Desktop */}
            <AnimatePresence>
                {isCameraOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 bg-black z-[200] flex flex-col font-figtree"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 pt-12">
                            <button onClick={stopCamera} className="text-white p-2 active:scale-95">
                                <ChevronLeft size={28} />
                            </button>
                            <span className="text-white font-bold text-[18px]">Position Your Face</span>
                            <div className="w-11"></div>
                        </div>
                        
                        {/* Camera Viewfinder */}
                        <div className="flex-1 relative flex items-center justify-center overflow-hidden px-6 pb-6">
                            <div className="relative w-full max-w-sm aspect-[3/4] rounded-[32px] overflow-hidden border-2 border-white/20">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                                />
                                {/* Face Guide Overlay */}
                                <div className="absolute inset-0 border-[4px] border-white/40 rounded-[32px] m-4 pointer-events-none"></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-48 h-64 border-2 border-dashed border-white/70 rounded-[100px]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="h-32 bg-black flex flex-col items-center justify-center pb-8">
                            <button 
                                onClick={captureSelfie}
                                className="w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <div className="w-[66px] h-[66px] bg-white rounded-full"></div>
                            </button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AadhaarPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AadhaarContent />
        </Suspense>
    );
}
