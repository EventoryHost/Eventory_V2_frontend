import React from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string | null;
    fileName: string;
}

export function FilePreviewModal({ isOpen, onClose, fileUrl, fileName }: FilePreviewModalProps) {
    if (!isOpen || !fileUrl || typeof document === 'undefined') return null;

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) || /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(fileUrl) || fileUrl.startsWith('blob:');
    const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(fileName) || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(fileUrl);
    const isPdf = /\.(pdf)$/i.test(fileName) || /\.(pdf)(\?|#|$)/i.test(fileUrl) || fileName.toLowerCase().includes('policy'); // often policy files without extension are PDFs

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8">
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-lg font-bold text-gray-900 truncate pr-4">{fileName}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4 min-h-[50vh]">
                    {isImage ? (
                        <img src={fileUrl} alt={fileName} className="max-w-full max-h-[75vh] object-contain rounded" />
                    ) : isVideo ? (
                        <video src={fileUrl} controls className="max-w-full max-h-[75vh] rounded-lg shadow-lg" />
                    ) : isPdf ? (
                        <iframe src={fileUrl} title={fileName} className="w-full h-[75vh] rounded border border-gray-300" />
                    ) : (
                        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-gray-600 mb-4 font-medium">Preview not available for this file type in the browser.</p>
                            <a href={fileUrl} download target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Figtree, sans-serif' }} className="inline-block px-6 py-3 bg-[#04222D] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors">
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
