import React from 'react';
import { Landmark } from 'lucide-react';

interface BankIconProps {
  bankName: string;
  className?: string;
  iconClassName?: string;
}

export const getBankIconUrl = (bankName: string) => {
    if (!bankName) return null;
    const name = bankName.toLowerCase();
    if (name.includes('hdfc')) return '/images/banks/hdfc.png';
    if (name.includes('sbi') || name.includes('state bank')) return '/images/banks/sbi.png';
    if (name.includes('icici')) return '/images/banks/icici.png';
    if (name.includes('pnb') || name.includes('punjab')) return '/images/banks/pnb.png';
    if (name.includes('axis')) return '/images/banks/axis.png';
    if (name.includes('kotak')) return '/images/banks/kotak.png';
    if (name.includes('baroda') || name.includes('bob')) return '/images/banks/bob.png';
    if (name.includes('yes')) return '/images/banks/yes.png';
    if (name.includes('indusind')) return '/images/banks/indusind.png';
    if (name.includes('idfc')) return '/images/banks/idfc.png';
    return null;
};

export default function BankIcon({ bankName, className = "", iconClassName = "w-5 h-5" }: BankIconProps) {
    const iconUrl = getBankIconUrl(bankName);
    
    if (iconUrl) {
        return (
            <div className={`overflow-hidden flex items-center justify-center bg-white ${className}`}>
                <img src={iconUrl} alt={bankName} className="w-full h-full object-contain" />
            </div>
        );
    }
    
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Landmark className={iconClassName} strokeWidth={2} />
        </div>
    );
}
