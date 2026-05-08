import React from 'react';

export interface VariantState {
    variants: string[];
    selectedVariant: string;
    isAddingVariant: boolean;
    newVariantName: string;
    isVariantModalOpen: boolean;
    variantToManage: string;
    variantAction: 'none' | 'rename' | 'delete';
    renameVariantValue: string;
}

export interface VariantHandlers {
    setSelectedVariant: (v: string) => void;
    setIsAddingVariant: (v: boolean) => void;
    setNewVariantName: (v: string) => void;
    handleAddVariant: (e?: React.KeyboardEvent) => void;
    setIsVariantModalOpen: (v: boolean) => void;
    setVariantToManage: (v: string) => void;
    setVariantAction: (a: 'none' | 'rename' | 'delete') => void;
    setRenameVariantValue: (v: string) => void;
    handleDuplicateVariant: () => void;
    handleRenameVariant: () => void;
    handleDeleteVariant: () => void;
}

export function useFlowVariants(): VariantState & VariantHandlers {
    const [variants, setVariants] = React.useState(['Premium', 'Standard']);
    const [selectedVariant, setSelectedVariant] = React.useState('Premium');
    const [isAddingVariant, setIsAddingVariant] = React.useState(false);
    const [newVariantName, setNewVariantName] = React.useState('');
    const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false);
    const [variantToManage, setVariantToManage] = React.useState('');
    const [variantAction, setVariantAction] = React.useState<'none' | 'rename' | 'delete'>('none');
    const [renameVariantValue, setRenameVariantValue] = React.useState('');

    const handleAddVariant = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (newVariantName.trim()) {
            setVariants(prev => [...prev, newVariantName.trim()]);
            setSelectedVariant(newVariantName.trim());
            setNewVariantName('');
            setIsAddingVariant(false);
        } else {
            setIsAddingVariant(false);
        }
    };

    const handleDuplicateVariant = () => {
        const newName = `${variantToManage} Copy`;
        setVariants(prev => [...prev, newName]);
        setIsVariantModalOpen(false);
    };

    const handleRenameVariant = () => {
        if (!renameVariantValue.trim()) return;
        setVariants(prev => prev.map(v => v === variantToManage ? renameVariantValue.trim() : v));
        if (selectedVariant === variantToManage) setSelectedVariant(renameVariantValue.trim());
        setVariantAction('none');
        setIsVariantModalOpen(false);
    };

    const handleDeleteVariant = () => {
        const newVariants = variants.filter(v => v !== variantToManage);
        setVariants(newVariants);
        if (selectedVariant === variantToManage) setSelectedVariant(newVariants[0] || '');
        setVariantAction('none');
        setIsVariantModalOpen(false);
    };

    return {
        variants,
        selectedVariant,
        isAddingVariant,
        newVariantName,
        isVariantModalOpen,
        variantToManage,
        variantAction,
        renameVariantValue,
        setSelectedVariant,
        setIsAddingVariant,
        setNewVariantName,
        handleAddVariant,
        setIsVariantModalOpen,
        setVariantToManage,
        setVariantAction,
        setRenameVariantValue,
        handleDuplicateVariant,
        handleRenameVariant,
        handleDeleteVariant,
    };
}
