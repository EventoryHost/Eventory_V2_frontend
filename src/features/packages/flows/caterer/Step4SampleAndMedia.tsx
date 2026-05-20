'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';

interface Props {
    sampleMediaFiles: SampleMediaFile[];
    setSampleMediaFiles: React.Dispatch<React.SetStateAction<SampleMediaFile[]>>;
}

export default function CatererStep4SampleAndMedia({
    sampleMediaFiles,
    setSampleMediaFiles,
}: Props) {
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);

    const handleSampleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map((file) => ({
                file,
                name: file.name,
                size: file.size,
                preview: URL.createObjectURL(file),
            }));
            setSampleMediaFiles((prev) => [...prev, ...filesArray]);
        }
        if (sampleMediaInputRef.current) sampleMediaInputRef.current.value = '';
    };

    const removeSampleMedia = (indexToRemove: number) => {
        setSampleMediaFiles((prev) => {
            const newFiles = [...prev];
            const row = newFiles[indexToRemove];
            if (row?.preview.startsWith('blob:')) URL.revokeObjectURL(row.preview);
            newFiles.splice(indexToRemove, 1);
            return newFiles;
        });
    };

    return (
        <div className="flex flex-col gap-6 mt-6 pb-32">
            <div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#9F9FA9] uppercase tracking-wider mb-4">
                    SAMPLE MEDIA
                </p>
                <div className="bg-[#F4F4F5] p-4 rounded-[12px]">
                    <button
                        onClick={() => sampleMediaInputRef.current?.click()}
                        className="w-full py-10 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                            <Upload size={24} className="text-[#3F3F47] stroke-2" />
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Browse or Drop media</p>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">High-res images and videos ( max 50 MB )</p>
                    </button>
                    <input type="file" ref={sampleMediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleSampleMediaUpload} multiple />
                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {sampleMediaFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[8px]">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeSampleMedia(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3">
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
