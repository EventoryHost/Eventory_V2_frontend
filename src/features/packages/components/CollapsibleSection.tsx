import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CollapsibleSection({ 
    title, 
    required = false, 
    children, 
    defaultOpen = false,
    isOpen,
    onToggle
}: { 
    title: string; 
    required?: boolean; 
    children: React.ReactNode; 
    defaultOpen?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
}) {
    const [localOpen, setLocalOpen] = useState(defaultOpen);
    
    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : localOpen;

    const handleToggle = () => {
        if (isControlled && onToggle) {
            onToggle();
        } else {
            setLocalOpen(!localOpen);
        }
    };

    return (
        <div className="px-5 mt-8">
            <button
                type="button"
                onClick={handleToggle}
                className="w-full flex items-center justify-between text-left mb-4"
            >
                <div className="flex items-center gap-1">
                    <span className="text-[14px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{title}</span>
                    {required && <span className="text-red-500 font-bold">*</span>}
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#04222D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
