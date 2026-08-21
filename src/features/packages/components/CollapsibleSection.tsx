import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CollapsibleSection({ 
    title, 
    required = false, 
    children, 
    defaultOpen = false,
    isOpen,
    onToggle,
    icon,
    subtitle,
    summary
}: { 
    title: string; 
    required?: boolean; 
    children: React.ReactNode; 
    defaultOpen?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    icon?: React.ReactNode;
    subtitle?: string;
    summary?: React.ReactNode;
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
        <div className="px-5 mt-5">
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full flex items-center justify-between text-left ${open || !summary ? 'mb-4' : 'mb-1'}`}
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="flex-shrink-0">{icon}</span>}
                    <span className="text-[16px] font-bold text-[#04222D] m-0" style={{ fontFamily: 'Figtree, sans-serif' }}>{title}</span>
                    {required && <span className="text-red-500 font-bold">*</span>}
                </div>
                <div className="flex items-center gap-3">
                    {subtitle && <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#A1A1AA]">{subtitle}</span>}
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A1A1AA]">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </motion.div>
                </div>
            </button>
            {!open && summary && (
                <div className="mb-4 cursor-pointer" onClick={handleToggle}>
                    {summary}
                </div>
            )}
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
