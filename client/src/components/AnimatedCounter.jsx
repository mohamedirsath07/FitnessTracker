import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({
    value = 0,
    duration = 800,
    className = '',
    prefix = '',
    suffix = '',
    formatFn,
}) {
    const [display, setDisplay] = useState(0);
    const prevValue = useRef(0);
    const rafRef = useRef(null);

    useEffect(() => {
        const start = prevValue.current;
        const end = Number(value) || 0;
        if (start === end) return;

        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            setDisplay(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                prevValue.current = end;
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    }, [value, duration]);

    const formatted = formatFn ? formatFn(display) : display.toLocaleString();

    return (
        <span className={`font-mono tabular-nums ${className}`}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
