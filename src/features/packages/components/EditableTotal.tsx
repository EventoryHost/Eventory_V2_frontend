import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface EditableTotalProps {
    packageId: string;
    vendorType: 'Decorator' | 'DJ' | 'Caterer' | 'Venue' | 'PAV' | 'Makeup';
    initialPrice: number;
}

export const EditableTotal: React.FC<EditableTotalProps> = ({ packageId, vendorType, initialPrice }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(initialPrice.toString());
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const numericPrice = Number(price);
        
        let payload = {};
        let step = 3;

        // Build the correct payload based on vendorType
        if (vendorType === 'Decorator') {
            payload = { basePrice: numericPrice };
        } else if (vendorType === 'DJ') {
            payload = { price: numericPrice };
        } else if (vendorType === 'Caterer') {
            payload = {
                teamAndEquipment: { price: numericPrice },
                overallPriceOfPackage: { price: numericPrice }
            };
        } else if (vendorType === 'Venue') {
            payload = {
                overallPriceOfPackage: { price: numericPrice }
            };
        } else if (vendorType === 'PAV') {
            payload = {
                packagePricing: { price: numericPrice }
            };
        } else if (vendorType === 'Makeup') {
            payload = {
                packagePricing: { price: numericPrice }
            };
        }

        try {
            const res = await fetch(apiUrl(`/packages/${packageId}/step/${step}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsEditing(false);
                window.location.reload(); // Refresh to get the updated data
            } else {
                console.error("Failed to update price");
            }
        } catch (error) {
            console.error("Error updating price:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[20px] font-extrabold text-[#000000]">₹</span>
                <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-[100px] border border-gray-300 rounded px-2 py-1 text-[16px] font-bold outline-none focus:border-black"
                    autoFocus
                />
                <button onClick={handleSave} disabled={isSaving} className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                    <Check size={16} />
                </button>
                <button onClick={() => { setIsEditing(false); setPrice(initialPrice.toString()); }} disabled={isSaving} className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <span className="text-[20px] font-extrabold text-[#000000]" style={{ fontFamily: 'Figtree, sans-serif' }}>
                ₹{initialPrice?.toLocaleString('en-IN')}
            </span>
            <button className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <Pencil size={14} />
            </button>
        </div>
    );
};
