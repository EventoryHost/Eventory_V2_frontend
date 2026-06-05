'use client';

import React from 'react';
import CatererFlow from './flows/caterer/CatererFlow';
import MakeupFlow from './flows/makeup/MakeupFlow';
import DecoratorFlow from './flows/decorator/DecoratorFlow';
import DJFlow from './flows/dj/DJFlow';

interface Props {
    vendorType: string;
}

export default function PackageFlowManager({ vendorType }: Props) {
    switch (vendorType) {
        case 'CAT':
            return <CatererFlow />;
        case 'MAK':
            return <MakeupFlow />;
        case 'DEC':
            return <DecoratorFlow />;
        case 'DJA':
            return <DJFlow />;
        default:
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-gray-400 font-medium">
                        Unknown vendor type: {vendorType}
                    </p>
                </div>
            );
    }
}
