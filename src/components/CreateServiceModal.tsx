'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Flower2, Music, Home, CookingPot, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalStep = 'MAIN' | 'SELECT_VENDOR';

const vendors = [
    { name: "Photographer", icon: Camera },
    { name: "Decorator", icon: Flower2 },
    { name: "DJ Artist", icon: Music },
    { name: "Venue Provider", icon: Home },
    { name: "Caterer", icon: CookingPot },
    { name: "Makeup Artist", icon: Sparkles },
];

const options = [
    {
        title: "Create a product",
        description: "Physical or digital goods to sell",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create-product-icon.jpg",
        action: () => console.log("Create product")
    },
    {
        title: "Create a service",
        description: "Bookable time-based expertise",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create-service-icon.jpg",
        action: () => console.log("Create service")
    },
    {
        title: "Create a package",
        description: "Bundled services and products",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create-package-icon.jpg",
        isPackageTrigger: true,
        action: () => console.log("Create package")
    },
    {
        title: "Use a template",
        description: "Start with a pre-made design",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/use-template-icon.jpg",
        isDashed: true,
        action: () => console.log("Use template")
    }
];

export default function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
    const router = useRouter();
    const [step, setStep] = React.useState<ModalStep>('MAIN');
    const [selectedVendor, setSelectedVendor] = React.useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);
    // Separate visible state so we can animate out before unmounting
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Drive the CSS transition from isOpen
    React.useEffect(() => {
        if (isOpen) {
            // Small delay so the element is in DOM before opacity kicks in
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            // Reset step after transition completes (300ms)
            const t = setTimeout(() => {
                setStep('MAIN');
                setSelectedVendor(null);
            }, 300);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    const handleVendorSelect = (vendorName: string) => {
        setSelectedVendor(vendorName);
        if (vendorName === 'Caterer' || vendorName === 'Makeup Artist') {
            const prefix = vendorName === 'Caterer' ? 'CAT' : 'MAK';
            localStorage.setItem('service_id', prefix + Math.random().toString(36).substring(7).toUpperCase());
            setTimeout(() => {
                onClose();
                router.push('/dashboard/packages/new');
            }, 300);
        }
    };

    const handleOptionClick = (option: any) => {
        if (option.isPackageTrigger) {
            setStep('SELECT_VENDOR');
        } else {
            option.action();
        }
    };

    if (!mounted) return null;

    // When not open AND not visible (transition done), render nothing at all
    // This is critical — no invisible overlay in the DOM at all
    if (!isOpen && !visible) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                // Opacity drives the whole wrapper transition
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.25s ease',
                // When not visible, pointer-events must be none so touches pass through
                pointerEvents: visible ? 'auto' : 'none',
            }}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }}
            />

            {/* Bottom Sheet */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '448px',
                    backgroundColor: 'white',
                    borderRadius: '32px 32px 0 0',
                    padding: '24px 24px 48px',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
                    maxHeight: '90dvh',
                    overflowY: 'auto',
                    // Slide up transition
                    transform: visible ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                {step === 'MAIN' ? (
                    <div>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', marginTop: '8px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111', lineHeight: 1.2, paddingRight: '48px' }}>
                                What would you<br />like to do?
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: '#f4f4f5', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                    color: '#1a1c1c'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px',
                                        padding: '20px 24px',
                                        borderRadius: '16px',
                                        border: option.isDashed
                                            ? '1.5px dashed #d4d4d8'
                                            : '1px solid #d4d4d8',
                                        backgroundColor: option.isDashed ? '#fff' : '#fafafa',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f4f4f5' }}>
                                        <img src={option.iconUrl} alt={option.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1c1c' }}>{option.title}</div>
                                        <div style={{ fontSize: '14px', color: '#1a1c1c', opacity: 0.7, marginTop: '4px' }}>{option.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', marginTop: '8px' }}>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Create a Package</h2>
                                <div style={{ marginTop: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>Select Vendor</h3>
                                    <p style={{ fontSize: '13px', color: '#71717b', fontWeight: 500 }}>Choose a service to continue</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: '#f4f4f5', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                    color: '#1a1c1c'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Vendor Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {vendors.map((vendor, idx) => {
                                const isSelected = selectedVendor === vendor.name;
                                const Icon = vendor.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleVendorSelect(vendor.name)}
                                        style={{
                                            borderRadius: '16px',
                                            padding: '24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            border: isSelected ? '1.5px solid #1a2c2c' : '1.5px solid transparent',
                                            backgroundColor: isSelected ? '#f0f4f8' : '#f9fafb',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div style={{ color: isSelected ? '#1a2c2c' : '#9ca3af' }}>
                                            <Icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: isSelected ? '#1a2c2c' : '#4b5563' }}>
                                            {vendor.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setStep('MAIN')}
                            style={{
                                width: '100%', marginTop: '32px', padding: '8px',
                                fontSize: '15px', fontWeight: 700, color: '#9ca3af',
                                backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                            }}
                        >
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
