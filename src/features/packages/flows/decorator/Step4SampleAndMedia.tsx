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

// ── Figma Design Tokens & Typography Styles ──
const INPUT_STYLE = {
    color: 'var(--Input-text-value, #030303)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const SUBTEXT_STYLE = {
    color: 'var(--Text-Neutral-secondary, #3F3F47)',
    fontFamily: 'var(--Font-family-San-serif, Figtree)',
    fontSize: 'var(--S-Font-size, 16px)',
    fontStyle: 'normal',
    fontWeight: 'var(--font-weight, 400)',
    lineHeight: 'var(--S-Line-height, 24px)',
    letterSpacing: 'var(--S-Letter-spacing, 0)',
};

const SECTION_LABEL = 'text-[12px] font-bold text-[#9F9FA9] leading-[18px] uppercase tracking-[0.05em]';

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
        <div className="flex flex-col gap-6 pb-32">
            <div>
                {/* Section label */}
                <p className={`${SECTION_LABEL} mb-4`}>
                    Sample Media
                </p>

                {/* Upload container exactly as Page 4 screenshot */}
                <div className="bg-[#F4F4F5]/60 border border-[#E4E4E7]/60 rounded-[12px] p-6 flex flex-col gap-4">
                    <label className="w-full py-10 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-[#FAFAFA] transition-colors cursor-pointer text-center block shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4 mx-auto">
                            <Upload size={24} className="text-[#3F3F47] stroke-[2.5]" />
                        </div>
                        <p style={INPUT_STYLE} className="font-bold text-[#030303] mb-1">
                            Browse or Drop media
                        </p>
                        <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717B]">
                            High-res images and videos ( max 50 MB )
                        </p>
                        <input
                            type="file"
                            ref={sampleMediaInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={onSampleMediaUpload}
                        />
                    </label>

                    {/* Dynamic List of Uploaded Media Rows with Thumbnails */}
                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {sampleMediaFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-white border border-[#E4E4E7]/60 rounded-[12px] shadow-xs"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div 
                                            className="w-12 h-12 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer border border-[#E4E4E7]/40"
                                            onClick={() => {
                                                const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                if (url) setPreviewFile({ url, name: file.name });
                                            }}
                                        >
                                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div 
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => {
                                                const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                if (url) setPreviewFile({ url, name: file.name });
                                            }}
                                        >
                                            <p style={INPUT_STYLE} className="font-bold text-[#030303] truncate text-[14px]">
                                                {file.name}
                                            </p>
                                            <p style={SUBTEXT_STYLE} className="text-[12px] text-[#71717B]">
                                                {formatFileSizeLocal(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSampleMediaFile(idx)}
                                        className="text-[#3F3F47] hover:text-red-500 ml-3 transition-colors p-1.5 rounded-full hover:bg-gray-100"
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
