'use client';

import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import splashData from '../../public/splash-screen.json';

interface LottieSplashScreenProps {
    onComplete: () => void;
}

export default function LottieSplashScreen({ onComplete }: LottieSplashScreenProps) {
    const [phase, setPhase] = useState<'lottie' | 'zoom' | 'fade'>('lottie');

    return (
        <AnimatePresence>
            {phase !== 'fade' && (
                <motion.div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#FAF9F6] overflow-hidden"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {phase === 'lottie' && (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                            <Lottie 
                                animationData={splashData} 
                                loop={false} 
                                onComplete={() => setPhase('zoom')}
                                style={{ width: '100%', height: '100%' }}
                                rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
                            />
                        </div>
                    )}
                    
                    {phase === 'zoom' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 150 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            onAnimationComplete={() => {
                                setPhase('fade');
                                setTimeout(onComplete, 500);
                            }}
                            className="absolute w-20 h-20 rounded-[1001px] bg-[#F0596F]"
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
