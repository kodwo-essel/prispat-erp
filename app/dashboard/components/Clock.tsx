"use client";

import { useState, useEffect } from "react";

export default function Clock() {
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!mounted) {
        return (
            <div className="text-right hidden md:block">
                <div className="text-[10px] font-black text-primary uppercase tracking-tighter opacity-0">
                    00 XXX 0000
                </div>
                <div className="text-[9px] text-secondary font-bold uppercase tracking-widest whitespace-nowrap opacity-0">
                    00:00:00 XX XXX
                </div>
            </div>
        );
    }

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-GB', options).toUpperCase();
    };

    const formatTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };
        return date.toLocaleTimeString('en-US', options).toUpperCase();
    };

    return (
        <div className="text-right hidden md:block">
            <div className="text-[10px] font-black text-primary uppercase tracking-tighter">
                {formatDate(time)}
            </div>
            <div className="text-[9px] text-secondary font-bold uppercase tracking-widest whitespace-nowrap">
                {formatTime(time)}
            </div>
        </div>
    );
}
