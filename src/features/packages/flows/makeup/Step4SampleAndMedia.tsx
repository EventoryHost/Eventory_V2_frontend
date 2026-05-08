'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';

interface Props {
    sampleMediaFiles: SampleMediaFile[];
    sampleMediaInputRef: React.RefObject<HTMLInputElement | null>;
    onSampleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeSampleMediaFile: (idx: number) => void;
}

export default function MakeupStep4SampleAndMedia({
    sampleMediaFiles,
    sampleMediaInputRef,
    onSampleMediaUpload,
    removeSampleMediaFile,
}: Props) {
    return (
        <div className="flex flex-col gap-6 pb-32">
            <div>
                {/* Section label — same token as Step3 upload zones */}
                <p
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] uppercase tracking-wide mb-4"
                >
                    Sample Media
                </p>

                {/* Upload zone — white card, 24 px padding, 12 px radius */}
                <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-6 flex flex-col gap-4">
                    <button
                        onClick={() => sampleMediaInputRef.current?.click()}
                        className="w-full py-10 px-4 rounded-[12px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-[#FAFAFA] transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                            <Upload size={24} className="text-[#3F3F47] stroke-2" />
                        </div>
                        <p
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="text-[16px] font-medium text-[#030303] mb-1 leading-[24px]"
                        >
                            Browse or Drop media
                        </p>
                        <p
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="text-[12px] font-normal text-[#9F9FA9] leading-[18px]"
                        >
                            High-res images and videos ( max 50 MB )
                        </p>
                    </button>

                    <input
                        type="file"
                        ref={sampleMediaInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                        onChange={onSampleMediaUpload}
                    />

                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {sampleMediaFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[8px]"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="text-[14px] font-medium text-[#030303] truncate leading-[20px]"
                                            >
                                                {file.name}
                                            </p>
                                            <p
                                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                                className="text-[12px] font-normal text-[#9F9FA9] leading-[18px]"
                                            >
                                                {formatFileSize(file.size)} · Uploaded
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeSampleMediaFile(idx)}
                                        className="text-[#3F3F47] hover:text-[#030303] ml-3 transition-colors"
                                    >
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
