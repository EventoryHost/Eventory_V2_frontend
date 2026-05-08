// Shared types used across all vendor package flows

export interface MakeupServiceItem {
    id: string;
    type: string;
    isExpanded: boolean;
    options: { name: string; price: string }[];
    brands: { name: string; price: string }[];
    allowCustomInput: 'Yes' | 'No';
}

export interface MenuData {
    id: string;
    name: string;
    type: string;
    serviceStyles: string[];
    inventory: Record<string, string[]>;
    priceModel: string;
    billingUnit: string;
    isExpanded: boolean;
}

export interface GuestTier {
    range: string;
    price: string;
}

export interface PolicyFile {
    name: string;
    size: number;
}

export interface SampleMediaFile {
    file: File;
    name: string;
    size: number;
    preview: string;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatPricePlaceholder(type: string): string {
    return type === 'Percentage' ? '0 %' : '₹ 0';
}

export function formatPriceValue(val: string, type: string): string {
    if (!val) return '';
    return type === 'Percentage' ? `${val} %` : `₹ ${val}`;
}
