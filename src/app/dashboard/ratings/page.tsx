'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Star, Filter } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function RatingsPage() {
    const router = useRouter();
    const [showMockData, setShowMockData] = useState(false);
    const [ratingsData, setRatingsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const mockData = {
        average: 4.9,
        totalReviews: 124,
        distribution: { 5: 85, 4: 15, 3: 5, 2: 2, 1: 2 },
        reviews: [
            { id: 1, name: "Priya Sharma", date: "May 02", rating: 5, text: "Amazing work! Very professional.", avatar: "A" },
            { id: 2, name: "Priya Sharma", date: "May 02", rating: 5, text: "Amazing work! Very professional.", avatar: "A" },
            { id: 3, name: "Priya Sharma", date: "May 02", rating: 5, text: "Amazing work! Very professional.", avatar: "A" }
        ]
    };

    const emptyData = {
        average: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: []
    };

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const res = await fetch(`${baseUrl}/vendors/${vendorId}/reviews`);
                if (res.ok) {
                    const responseJson = await res.json();
                    setRatingsData(responseJson.data || responseJson);
                } else {
                    setRatingsData(emptyData);
                }
            } catch (error) {
                console.error("Failed to fetch ratings", error);
                setRatingsData(emptyData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRatings();
    }, []);

    const data = showMockData ? mockData : (ratingsData || emptyData);

    // Helper to calculate percentage for progress bars
    const getPercentage = (count: number) => {
        if (!data.totalReviews) return 0;
        return (count / data.totalReviews) * 100;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-[#F4F4F5] dark:border-[#27272A]">
                <h1 
                    onDoubleClick={() => setShowMockData(!showMockData)}
                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                    className="text-[24px] font-bold text-[#030303] dark:text-white cursor-pointer select-none"
                    title="Double click to toggle real/mock data"
                >
                    Ratings
                </h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            {isLoading && !showMockData ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    {/* Big Rating Section */}
                    <div className="flex flex-col items-center justify-center mt-10 mb-10">
                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[72px] font-bold text-[#030303] dark:text-white leading-none mb-3">
                            {data.average.toFixed(1)}
                        </h2>
                        <div className="flex items-center gap-1.5 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-[22px] h-[22px] ${star <= Math.round(data.average) ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-[#FBBF24]'}`} 
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47] dark:text-[#A1A1AA] font-medium">
                            {data.average >= 4.5 ? 'Excellent' : data.average >= 4.0 ? 'Great' : data.average >= 3.0 ? 'Good' : 'Needs Improvement'} • Based on {data.totalReviews} Reviews
                        </p>
                    </div>

                    {/* Overall Ratings Bars */}
                    <div className="px-5 mb-10">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-white mb-5">Overall Ratings</h3>
                        <div className="flex flex-col gap-3">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center gap-4">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-medium text-[#030303] dark:text-white w-2">{rating}</span>
                                    <div className="flex-1 h-[6px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#04222D] dark:bg-[#60A5FA] rounded-full"
                                            style={{ width: `${getPercentage(data.distribution[rating])}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Feedback */}
                    <div className="px-5 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[18px] font-medium text-[#030303] dark:text-white">Customer Feedback</h3>
                            <button className="w-[36px] h-[36px] border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[10px] flex items-center justify-center bg-white dark:bg-[#18181B] active:scale-95 transition-transform">
                                <Filter className="w-[18px] h-[18px] text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex flex-col">
                            {data.reviews.map((review: any, index: number) => (
                                <React.Fragment key={review.id}>
                                    <div className="py-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[42px] h-[42px] rounded-full bg-[#18181B] dark:bg-[#27272A] flex items-center justify-center text-white font-serif text-[18px]">
                                                    {review.avatar}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-white">{review.name}</span>
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">{review.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star 
                                                        key={star} 
                                                        className={`w-[14px] h-[14px] ${star <= review.rating ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-[#FBBF24]'}`} 
                                                        strokeWidth={1.5}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] text-[#3F3F47] dark:text-[#E4E4E7] leading-relaxed ml-[54px]">
                                            "{review.text}"
                                        </p>
                                    </div>
                                    {index < data.reviews.length - 1 && (
                                        <div className="w-full h-[1px] bg-[#F4F4F5] dark:bg-[#27272A]"></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </>
            )}
            
            <BottomNav />
        </div>
    );
}
