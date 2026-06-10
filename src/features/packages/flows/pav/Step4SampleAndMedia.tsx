'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

interface Props {
    sampleMediaFiles: SampleMediaFile[];
    setSampleMediaFiles: React.Dispatch<React.SetStateAction<SampleMediaFile[]>>;
}

export default function PAVStep4SampleAndMedia({
    sampleMediaFiles,
    setSampleMediaFiles,
}: Props) {
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return 'Existing Document';
        return `${formatFileSize(bytes)}`;
    };

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
        <div className="flex flex-col gap-8 w-full pb-32">
            {/* Sample Media */}
            <div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#9F9FA9] uppercase tracking-wide mb-4 px-2">
                    SAMPLE MEDIA
                </p>
                <div className="bg-[#F4F4F5] p-5 rounded-[24px] flex flex-col gap-3 border border-[#E4E4E7]/40">
                    <label className="w-full py-10 px-4 rounded-[16px] border border-dashed border-[#D4D4D8] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-center block">
                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                            <Upload size={20} className="text-[#3F3F47] stroke-[2]" />
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Tap to Upload media</p>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">Images and videos · Max 50 MB each</p>
                        <input type="file" ref={sampleMediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleSampleMediaUpload} multiple />
                    </label>
                    
                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                            {sampleMediaFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#E4E4E7] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div 
                                            className="w-[48px] h-[48px] rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                                            onClick={() => {
                                                const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                if (url) setPreviewFile({ url, name: file.name });
                                            }}
                                        >
                                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div 
                                            className="flex-1 min-w-0 cursor-pointer hover:underline"
                                            onClick={() => {
                                                const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                if (url) setPreviewFile({ url, name: file.name });
                                            }}
                                        >
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] truncate">{file.name}</p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B] mt-0.5">{formatFileSizeLocal(file.size)}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeSampleMedia(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3 p-1">
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    fileUrl={previewFile.url}
                    fileName={previewFile.name}
                />
            )}
        </div>
    );
}
