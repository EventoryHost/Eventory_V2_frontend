import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDateRangePickerProps {
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

export default function CustomDateRangePicker({ startDate, endDate, onDateChange }: CustomDateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [tempStart, setTempStart] = useState<Date | null>(startDate ? new Date(startDate) : null);
    const [tempEnd, setTempEnd] = useState<Date | null>(endDate ? new Date(endDate) : null);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTempStart(startDate ? new Date(startDate) : null);
            setTempEnd(endDate ? new Date(endDate) : null);
        }
    }, [isOpen, startDate, endDate]);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentYear, currentMonth, day);
        if (!tempStart || (tempStart && tempEnd)) {
            setTempStart(selectedDate);
            setTempEnd(null);
        } else {
            if (selectedDate < tempStart) {
                setTempEnd(tempStart);
                setTempStart(selectedDate);
            } else {
                setTempEnd(selectedDate);
            }
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    const handleOk = () => {
        if (tempStart) {
            const startStr = `${tempStart.getFullYear()}-${String(tempStart.getMonth() + 1).padStart(2, '0')}-${String(tempStart.getDate()).padStart(2, '0')}`;
            let endStr = '';
            if (tempEnd) {
                endStr = `${tempEnd.getFullYear()}-${String(tempEnd.getMonth() + 1).padStart(2, '0')}-${String(tempEnd.getDate()).padStart(2, '0')}`;
            }
            onDateChange(startStr, endStr);
        }
        setIsOpen(false);
    };

    const isDateInRange = (day: number) => {
        if (!tempStart || !tempEnd) return false;
        const current = new Date(currentYear, currentMonth, day);
        return current > tempStart && current < tempEnd;
    };

    const isDateStart = (day: number) => {
        if (!tempStart) return false;
        return tempStart.getDate() === day && tempStart.getMonth() === currentMonth && tempStart.getFullYear() === currentYear;
    };

    const isDateEnd = (day: number) => {
        if (!tempEnd) return false;
        return tempEnd.getDate() === day && tempEnd.getMonth() === currentMonth && tempEnd.getFullYear() === currentYear;
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const prevMonthDays = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
        
        const days = [];
        
        // Prev month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <div key={`prev-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] font-medium text-[#D4D4D8]">
                    {prevMonthDays - i}
                </div>
            );
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const isStart = isDateStart(i);
            const isEnd = isDateEnd(i);
            const inRange = isDateInRange(i);
            
            days.push(
                <div 
                    key={`curr-${i}`} 
                    onClick={() => handleDateClick(i)}
                    className={`w-8 h-8 flex items-center justify-center text-[12px] font-medium cursor-pointer transition-colors relative
                        ${isStart || isEnd ? 'bg-[#04222D] text-white rounded-full z-10' : ''}
                        ${!isStart && !isEnd && inRange ? 'bg-[#EAECEF] text-[#030303] z-0' : ''}
                        ${!isStart && !isEnd && !inRange ? 'text-[#030303] hover:bg-gray-100 rounded-full' : ''}
                    `}
                >
                    {/* Background extension for range connections */}
                    {isStart && tempEnd && <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#EAECEF] -z-10" />}
                    {isEnd && tempStart && <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#EAECEF] -z-10" />}
                    {i}
                </div>
            );
        }

        // Next month days
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push(
                <div key={`next-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] font-medium text-[#D4D4D8]">
                    {i}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="relative w-full" ref={pickerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 bg-white border border-[#D4D4D8] rounded-[16px] text-[14px] font-semibold text-gray-900 cursor-pointer flex justify-between items-center"
            >
                {startDate ? `${startDate} ${endDate ? `to ${endDate}` : ''}` : 'Select Custom Dates'}
                <ChevronDown size={18} className="text-[#9F9FA9]" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 p-5 bg-white rounded-[24px] shadow-lg border border-[#E4E4E7] w-[320px]">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative">
                            <select 
                                value={currentMonth} 
                                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                                className="appearance-none bg-transparent text-[14px] font-bold text-[#030303] pr-6 focus:outline-none cursor-pointer"
                            >
                                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select 
                                value={currentYear} 
                                onChange={(e) => setCurrentYear(Number(e.target.value))}
                                className="appearance-none bg-transparent text-[14px] font-bold text-[#030303] pr-6 focus:outline-none cursor-pointer"
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-2 place-items-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="w-8 h-8 flex items-center justify-center text-[12px] font-bold text-[#030303]">
                                {d}
                            </div>
                        ))}
                        {renderCalendarDays()}
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={handleCancel} className="text-[13px] font-bold text-[#030303] hover:text-gray-600">Cancel</button>
                        <button onClick={handleOk} className="text-[13px] font-bold text-[#030303] hover:text-gray-600">Ok</button>
                    </div>
                </div>
            )}
        </div>
    );
}
