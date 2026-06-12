'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import splashData from '../../public/splash-screen.json';
export default function SplashScreen() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#FAF9F6] z-[9999] flex flex-col items-center justify-center"
        >
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <Lottie 
                    animationData={splashData} 
                    loop={true} 
                    style={{ width: '100%', height: '100%' }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
                />
            </div>
            <p className="absolute bottom-16 text-[#F0596F] text-sm font-medium tracking-wide z-10">
                A Place for all your event needs
            </p>
        </motion.div>
    );
}
