'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

interface Props {
    youtubeLink: string; setYoutubeLink: (v: string) => void;
    instagramLink: string; setInstagramLink: (v: string) => void;
    spotifyLink: string; setSpotifyLink: (v: string) => void;
    facebookLink: string; setFacebookLink: (v: string) => void;
    otherLink: string; setOtherLink: (v: string) => void;

    sampleMediaFiles: SampleMediaFile[];
    setSampleMediaFiles: React.Dispatch<React.SetStateAction<SampleMediaFile[]>>;
}

export default function DJStep4SampleAndMedia({
    youtubeLink, setYoutubeLink,
    instagramLink, setInstagramLink,
    spotifyLink, setSpotifyLink,
    facebookLink, setFacebookLink,
    otherLink, setOtherLink,
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
            {/* Social Media Links */}
            <div className="p-5 bg-white border border-[#E4E4E7] rounded-[16px] flex flex-col gap-6">
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303]">Social Media Links</h3>
                
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-normal text-[#3F3F47]">Youtube</label>
                    <input 
                        type="text" 
                        placeholder="Please enter your YouTube Link here." 
                        value={youtubeLink} 
                        onChange={(e) => setYoutubeLink(e.target.value)} 
                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                        className="w-full p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-normal text-[#3F3F47]">Instagram</label>
                    <input 
                        type="text" 
                        placeholder="Please enter your Instagram Link here." 
                        value={instagramLink} 
                        onChange={(e) => setInstagramLink(e.target.value)} 
                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                        className="w-full p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-normal text-[#3F3F47]">Spotify</label>
                    <input 
                        type="text" 
                        placeholder="Please enter your Spotify Link here." 
                        value={spotifyLink} 
                        onChange={(e) => setSpotifyLink(e.target.value)} 
                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                        className="w-full p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-normal text-[#3F3F47]">Facebook</label>
                    <input 
                        type="text" 
                        placeholder="Please enter your Facebook Link here." 
                        value={facebookLink} 
                        onChange={(e) => setFacebookLink(e.target.value)} 
                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                        className="w-full p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[13px] font-normal text-[#3F3F47]">Other</label>
                    <input 
                        type="text" 
                        placeholder="Paste Link" 
                        value={otherLink} 
                        onChange={(e) => setOtherLink(e.target.value)} 
                        style={{ fontFamily: 'Figtree, sans-serif' }} 
                        className="w-full p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] text-[14px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-1 focus:ring-gray-300" 
                    />
                </div>
            </div>

            {/* Sample Media */}
            <div>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-4">Sample Media <span className="text-red-500">*</span></h3>
                <div className="bg-[#F4F4F5] p-5 rounded-[16px] flex flex-col gap-3 border border-[#E4E4E7]/40">
                    <label className="w-full py-8 px-4 rounded-[12px] border border-dashed border-[#D4D4D8] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-center block">
                        <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-3 mx-auto">
                            <Upload size={18} className="text-[#3F3F47] stroke-[2.5]" />
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Tap to Upload media</p>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold text-[#71717B]">Images and videos · Max 50 MB each</p>
                        <input type="file" ref={sampleMediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleSampleMediaUpload} multiple />
                    </label>
                    {sampleMediaFiles.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {sampleMediaFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#E4E4E7] rounded-[8px]">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div 
                                            className="w-10 h-10 rounded-[6px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
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
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-bold text-[#71717B]">{formatFileSizeLocal(file.size)}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeSampleMedia(idx)} className="text-[#3F3F47] hover:text-[#030303] ml-3">
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
