'use client';

import React from 'react';
import CatererFlow from './flows/caterer/CatererFlow';
import MakeupFlow from './flows/makeup/MakeupFlow';
import DecoratorFlow from './flows/decorator/DecoratorFlow';
import DJFlow from './flows/dj/DJFlow';
import PAVFlow from './flows/pav/PAVFlow';
import VenueFlow from './flows/venue/VenueFlow';

interface Props {
    vendorType: string;
    onExitFlow?: () => void;
}

export default function PackageFlowManager({ vendorType, onExitFlow }: Props) {
    switch (vendorType) {
        case 'CAT':
            return <CatererFlow onExitFlow={onExitFlow} />;
        case 'MAK':
            return <MakeupFlow onExitFlow={onExitFlow} />;
        case 'DEC':
            return <DecoratorFlow onExitFlow={onExitFlow} />;
        case 'DJA':
            return <DJFlow onExitFlow={onExitFlow} />;
        case 'PAV':
            return <PAVFlow onExitFlow={onExitFlow} />;
        case 'VEN':
            return <VenueFlow onExitFlow={onExitFlow} />;
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
