'use client';

import React from 'react';
import { Upload, X, FileVideo } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

interface Props {
    sampleMediaFiles: SampleMediaFile[];
    setSampleMediaFiles: React.Dispatch<React.SetStateAction<SampleMediaFile[]>>;
}

export default function CatererStep4SampleAndMedia({
    sampleMediaFiles,
    setSampleMediaFiles,
}: Props) {
    const sampleMediaInputRef = React.useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

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
            if (row?.preview && row.preview.startsWith('blob:')) URL.revokeObjectURL(row.preview);
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
                <div className="bg-[#F4F4F5] p-4 rounded-[24px] border border-[#D4D4D8]">
                    <label className="w-full py-12 px-4 rounded-[16px] border border-dashed border-[#D4D4D8] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-4 cursor-pointer text-center block">
                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                            <Upload size={24} className="text-[#3F3F47] stroke-[2]" />
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] mb-1">Tap to Upload media</p>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B] mb-6">Images and videos · Min 3 required · Max 50 MB each</p>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#3F3F47] uppercase tracking-wide underline">BROWSE FILES</span>
                        <input type="file" ref={sampleMediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleSampleMediaUpload} multiple />
                    </label>
                    
                    {sampleMediaFiles.length > 0 && sampleMediaFiles.length < 3 && (
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-red-500 mb-3 ml-2">
                            Please upload at least {3 - sampleMediaFiles.length} more media file{3 - sampleMediaFiles.length > 1 ? 's' : ''} to continue.
                        </p>
                    )}
                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {sampleMediaFiles.map((file, idx) => {
                                const isVideo = file.name.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || (file.file && file.file.type.startsWith('video/'));
                                return (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[16px] shadow-xs">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div 
                                                className="w-12 h-12 rounded-[12px] border border-[#E4E4E7] overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer flex items-center justify-center"
                                                onClick={() => {
                                                    const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                    if (url) setPreviewFile({ url, name: file.name });
                                                }}
                                            >
                                                {isVideo ? (
                                                    <FileVideo size={24} className="text-gray-500" />
                                                ) : (
                                                    <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div 
                                                className="flex-1 min-w-0 cursor-pointer hover:underline"
                                                onClick={() => {
                                                    const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                    if (url) setPreviewFile({ url, name: file.name });
                                                }}
                                            >
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] truncate">{file.name}</p>
                                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B]">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeSampleMedia(idx)} className="text-gray-400 hover:text-[#030303] ml-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                );
                            })}
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
