'use client';

import React from 'react';
import { motion } from 'framer-motion';
import EventoryLogo from './icons/EventoryLogo';

export default function SplashScreen() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
            >
                <EventoryLogo className="w-32 h-32" />
            </motion.div>
        </motion.div>
    );
}
