import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> { }

export default function Card({ className = '', children, ...rest }: Props) {
    return (
        <div
            className={`rounded-2xl border border-ink/15 bg-white/60 p-6 ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
}