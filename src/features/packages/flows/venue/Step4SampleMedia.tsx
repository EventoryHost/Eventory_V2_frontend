'use client';

import React from 'react';
import { Upload, X, Trash2, FileText } from 'lucide-react';
import { SampleMediaFile, formatFileSize } from '../../shared/types';
import { FilePreviewModal } from '../../components/FilePreviewModal';
import { VenueSpace } from './Step2SpacesAndItems';

interface Props {
    spaces: VenueSpace[];
    spaceMedia: Record<string, SampleMediaFile[]>;
    setSpaceMedia: React.Dispatch<React.SetStateAction<Record<string, SampleMediaFile[]>>>;
}

export default function VenueStep4SampleMedia({
    spaces, spaceMedia, setSpaceMedia
}: Props) {
    const [previewFile, setPreviewFile] = React.useState<{ url: string | null; name: string } | null>(null);

    // Create refs for each space dynamically
    const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, spaceId: string) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files).map(file => ({
                file,
                name: file.name,
                size: file.size,
                preview: URL.createObjectURL(file)
            }));
            
            setSpaceMedia(prev => ({
                ...prev,
                [spaceId]: [...(prev[spaceId] || []), ...filesArray]
            }));
        }
        
        if (fileInputRefs.current[spaceId]) {
            fileInputRefs.current[spaceId]!.value = '';
        }
    };

    const removeFile = (spaceId: string, indexToRemove: number) => {
        setSpaceMedia(prev => {
            const currentFiles = prev[spaceId] || [];
            const newFiles = [...currentFiles];
            if (newFiles[indexToRemove].preview && !newFiles[indexToRemove].preview!.startsWith('http')) {
                URL.revokeObjectURL(newFiles[indexToRemove].preview!);
            }
            newFiles.splice(indexToRemove, 1);
            return {
                ...prev,
                [spaceId]: newFiles
            };
        });
    };

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return 'Existing Document';
        return `${formatFileSize(bytes)} _ Uploaded`;
    };

    return (
        <div className="flex flex-col gap-8 pb-32">
            {spaces.length === 0 ? (
                <div className="bg-white p-6 rounded-[12px] border border-[#E4E4E7] text-center">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[#3F3F47]">No spaces added yet. Please go back to Step 2 to add spaces.</p>
                </div>
            ) : (
                <>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-[12px] mb-2 flex items-start gap-3">
                        <div className="text-blue-500 mt-0.5">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-blue-900">Minimum 3 Images Required</h4>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-blue-700 font-medium mt-0.5">You must upload at least 3 images in total across your spaces to complete this step.</p>
                        </div>
                    </div>
                    {spaces.map((space, idx) => {
                        const files = spaceMedia[space.id] || [];
                        
                        return (
                        <div key={space.id} className="flex flex-col gap-3">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#9F9FA9] uppercase tracking-wider pl-2">
                                {space.name || `SPACE ${idx + 1}`} SAMPLE MEDIA
                            </span>
                            
                            <button 
                                onClick={() => fileInputRefs.current[space.id]?.click()} 
                                className="w-full py-10 px-4 rounded-[16px] border border-dashed border-[#E4E4E7] bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-4">
                                    <Upload size={20} className="text-[#3F3F47] stroke-[2]" />
                                </div>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] mb-1">Tap to Upload media</p>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#71717B]">Images and videos - Max 50 MB each</p>
                            </button>
                            
                            <input 
                                type="file" 
                                ref={el => { fileInputRefs.current[space.id] = el; }} 
                                className="hidden" 
                                accept="image/*,video/*" 
                                onChange={(e) => handleFileUpload(e, space.id)} 
                                multiple 
                            />
                            
                            {files.length > 0 && (
                                <div className="flex flex-col gap-3 mt-2">
                                    {files.map((file, fIdx) => (
                                        <div key={fIdx} className="flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-[8px]">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div 
                                                    className="w-12 h-12 rounded-[4px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                                                    onClick={() => {
                                                        const url = file.preview || (file.file ? URL.createObjectURL(file.file) : null);
                                                        if (url) setPreviewFile({ url, name: file.name });
                                                    }}
                                                >
                                                    <img src={file.preview || '/placeholder.png'} alt={file.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
                                            <button onClick={() => removeFile(space.id, fIdx)} className="text-[#3F3F47] hover:text-[#030303] ml-3">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                </>
            )}

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
