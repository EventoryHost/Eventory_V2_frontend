'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import CreateServiceModal from '@/components/CreateServiceModal';

export default function InventoryPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        // Dead simple wrapper — no height tricks, no overflow, no relative/stacking
        <div style={{ backgroundColor: 'white', paddingBottom: '96px' }}>

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px' }}>
                <img
                    src="https://dkuacgndftndz.cloudfront.net/inventory-page/new-logo.jpg"
                    alt="Eventory"
                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '50%' }}
                />
                <button style={{ padding: '8px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                    <Bell size={24} color="#111" />
                </button>
            </div>

            {/* Page Title */}
            <div style={{ padding: '0 24px 24px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#000', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>Services</h1>
                <p style={{ fontSize: '18px', color: '#9f9fa9', fontWeight: 400 }}>View and manage your services</p>
            </div>

            {/* Segmented Control Tabs */}
            <div style={{ padding: '0 24px 32px' }}>
                <div style={{ display: 'flex', backgroundColor: '#f4f4f5', borderRadius: '10px', padding: '6px', gap: '2px' }}>
                    <button style={{ flex: 1, backgroundColor: '#0a0a0a', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                        Created
                    </button>
                    <button style={{ flex: 1, color: '#a1a1aa', padding: '10px', fontSize: '14px', fontWeight: 500, border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                        Drafts
                    </button>
                    <button style={{ flex: 1, color: '#a1a1aa', padding: '10px', fontSize: '14px', fontWeight: 500, border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                        Deleted
                    </button>
                </div>
            </div>

            {/* Empty State */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 24px 48px', textAlign: 'center' }}>
                <img
                    src="https://dkuacgndftndz.cloudfront.net/inventory-page/services_home_page.jpg"
                    alt="Welcome"
                    style={{ width: '200px', height: '180px', objectFit: 'contain', marginBottom: '24px' }}
                />

                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#030303', marginBottom: '12px', lineHeight: 1.3 }}>
                    Hey Vyom, Welcome to Eventory
                </h2>
                <p style={{ fontSize: '14px', color: '#3f3f47', marginBottom: '32px', lineHeight: 1.6, maxWidth: '280px' }}>
                    To Start getting your bookings you will have to list your service
                </p>

                {/* 
                    Using a plain <button> with inline styles only.
                    No Tailwind transitions, no transforms, no active:scale — 
                    all of which can interfere with iOS touch handling.
                */}
                <div className='w-[fit-content] h-[fit-content] ' onClick={() => setIsCreateModalOpen(true)}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                            width: '280px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#09090b',
                            color: '#fafafa',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            // The only iOS-specific override needed
                            WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
                        }}
                    >
                        Add
                    </button>
                </div>

            </div>

            <CreateServiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
