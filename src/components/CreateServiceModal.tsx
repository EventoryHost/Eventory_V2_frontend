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
    { name: "Photographer", imageUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/photographer.png" },
    { name: "Decorator", imageUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/decorator.png" },
    { name: "DJ Artist", imageUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/dj%20artist.png" },
    { name: "Venue Provider", imageUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/venue%20provider.png" },
    { name: "Caterer", imageUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/caterer.png" },
    { name: "Makeup Artist", imageUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create_package/makeup.png" },
];

const packageVendorPrefixes: Record<string, string> = {
    Caterer: 'CAT',
    Decorator: 'DEC',
    'Makeup Artist': 'MAK',
    'DJ Artist': 'DJA',
    Photographer: 'PAV',
    'Venue Provider': 'VEN',
};

const options = [
    {
        title: "Create a package",
        description: "Bundled services and products",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create%20package%20pop%20up%20/package.png",
        isPackageTrigger: true,
        action: () => console.log("Create package")
    },
    {
        title: "Create a product",
        description: "Physical or digital goods to sell",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create%20package%20pop%20up%20/product.png",
        action: () => console.log("Create product")
    },
    {
        title: "Create a service",
        description: "Bookable time-based expertise",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create%20package%20pop%20up%20/service.png",
        action: () => console.log("Create service")
    },
    {
        title: "Use a template",
        description: "Start with a pre-made design",
        iconUrl: "https://dkuacgndftndz.cloudfront.net/inventory-page/create%20package%20pop%20up%20/template.png",
        isDashed: true,
        action: () => console.log("Use template")
    }
];

type CreateOption = (typeof options)[number];

export default function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
    const router = useRouter();
    const [step, setStep] = React.useState<ModalStep>('MAIN');
    const [selectedVendor, setSelectedVendor] = React.useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);
    // Separate visible state so we can animate out before unmounting
    const [visible, setVisible] = React.useState(false);
    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
    const [hoveredGridIdx, setHoveredGridIdx] = React.useState<number | null>(null);

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
        const prefix = packageVendorPrefixes[vendorName];
        if (prefix) {
            // crypto.randomUUID is only available in secure contexts (HTTPS/localhost)
            let randomPart = '';
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                try {
                    randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();
                } catch (e) {
                    randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
                }
            } else {
                randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
            }

            localStorage.setItem('service_id', `${prefix}${randomPart}`);
            localStorage.setItem('selected_package_id', 'new');
            setTimeout(() => {
                onClose();
                router.push('/dashboard/packages/new');
            }, 300);
        }
    };

    const handleOptionClick = (option: CreateOption) => {
        if (option.isPackageTrigger) {
            setStep('SELECT_VENDOR');
        } else if (option.title === "Use a template") {
            onClose();
            router.push('/dashboard/inventory/templates');
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
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px',
                                        padding: '20px 24px',
                                        borderRadius: '16px',
                                        border: option.isDashed
                                            ? (hoveredIdx === idx ? '1.5px dashed #04222D' : '1.5px dashed var(--Border-Neutral-default, #D4D4D8)')
                                            : (hoveredIdx === idx ? '1px solid #04222D' : 'var(--Border-border-thin, 0.5px) solid var(--Border-Neutral-default, #D4D4D8)'),
                                        backgroundColor: hoveredIdx === idx ? '#F4F4F5' : 'var(--surface-Neutral-subtle, #FAFAFA)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: hoveredIdx === idx ? 'translateY(-2px)' : 'translateY(0)',
                                        boxShadow: hoveredIdx === idx ? '0 8px 16px rgba(0, 0, 0, 0.04)' : 'none',
                                    }}
                                >
                                    <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <img 
                                            src={option.iconUrl} 
                                            alt={option.title} 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'contain',
                                                transition: 'transform 0.2s ease',
                                                transform: hoveredIdx === idx ? 'scale(1.08)' : 'scale(1)'
                                            }} 
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#000', fontFamily: 'Figtree, sans-serif', letterSpacing: '-0.3px' }}>{option.title}</div>
                                        <div style={{ fontSize: '14px', color: '#71717B', fontWeight: 400, fontFamily: 'Figtree, sans-serif' }}>{option.description}</div>
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
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleVendorSelect(vendor.name)}
                                        onMouseEnter={() => setHoveredGridIdx(idx)}
                                        onMouseLeave={() => setHoveredGridIdx(null)}
                                        style={{
                                            borderRadius: '24px',
                                            padding: '32px 16px 24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '16px',
                                            border: isSelected 
                                                ? '1.5px solid #000000' 
                                                : (hoveredGridIdx === idx ? '1.5px solid #04222D' : 'var(--Border-border-thin, 0.5px) solid var(--Border-Neutral-default, #D4D4D8)'),
                                            backgroundColor: isSelected 
                                                ? '#EAECEF' 
                                                : (hoveredGridIdx === idx ? '#F4F4F5' : 'var(--surface-Neutral-subtle, #FAFAFA)'),
                                            cursor: 'pointer',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: hoveredGridIdx === idx ? 'translateY(-2px)' : 'translateY(0)',
                                            boxShadow: hoveredGridIdx === idx ? '0 6px 12px rgba(0,0,0,0.03)' : 'none',
                                        }}
                                    >
                                        <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img 
                                                src={vendor.imageUrl} 
                                                alt={vendor.name} 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'contain',
                                                    transition: 'transform 0.2s ease',
                                                    transform: hoveredGridIdx === idx || isSelected ? 'scale(1.08)' : 'scale(1)'
                                                }} 
                                            />
                                        </div>
                                        <span style={{ 
                                            fontSize: '16px', 
                                            fontWeight: 800, 
                                            color: '#000', 
                                            fontFamily: 'Figtree, sans-serif',
                                            letterSpacing: '-0.3px',
                                            textAlign: 'center'
                                        }}>
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
