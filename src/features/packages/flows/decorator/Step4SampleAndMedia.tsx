'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

interface Props {
    sampleMediaFiles: SampleMediaFile[];
    sampleMediaInputRef: React.RefObject<HTMLInputElement | null>;
    onSampleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeSampleMediaFile: (idx: number) => void;
}

export default function DecoratorStep4SampleAndMedia({
    sampleMediaFiles,
    sampleMediaInputRef,
    onSampleMediaUpload,
    removeSampleMediaFile,
}: Props) {
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return 'Existing Document';
        return `${formatFileSize(bytes)}`;
    };

    return (
        <div className="flex flex-col gap-4 pb-32">
            <div>
                {/* Heading matching design screenshot */}
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-4">
                    Sample Media <span className="text-red-500">*</span>
                </h3>

                {/* Outer Container Card */}
                <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[16px] p-5 flex flex-col gap-4">
                    {/* Inner Upload Dropzone Card */}
                    <div
                        onClick={() => sampleMediaInputRef.current?.click()}
                        className="w-full py-8 px-4 bg-white border-2 border-dashed border-[#E4E4E7] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50/80 transition-colors text-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                            <Upload size={22} className="text-[#030303] stroke-[2]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303]">
                                Tap to Upload media
                            </p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#71717B]">
                                Images and videos · Max 50 MB each
                            </p>
                        </div>
                        <input
                            type="file"
                            ref={sampleMediaInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={onSampleMediaUpload}
                        />
                    </div>

                    {/* Dynamic List of Uploaded Media Rows with Thumbnails */}
                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {sampleMediaFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-white border border-[#E4E4E7] rounded-[12px] shadow-xs"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div 
                                            className="w-12 h-12 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer border border-gray-100"
                                            onClick={() => {
                                                const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                if (url) setPreviewFile({ url, name: file.name });
                                            }}
                                        >
                                            {file.preview ? (
                                                <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-amber-500 text-white font-bold text-[10px]">
                                                    IMG
                                                </div>
                                            )}
                                        </div>
                                        <div 
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => {
                                                const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                if (url) setPreviewFile({ url, name: file.name });
                                            }}
                                        >
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] truncate">
                                                {file.name}
                                            </p>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-medium text-[#71717B]">
                                                {formatFileSizeLocal(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSampleMediaFile(idx)}
                                        className="text-[#030303] hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                                        title="Remove media"
                                    >
                                        <X size={18} />
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
