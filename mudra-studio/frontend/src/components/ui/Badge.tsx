import type { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'gold';

interface Props extends HTMLAttributes<HTMLSpanElement> {
    tone?: Tone;
}

export default function Badge({
    tone = 'neutral',
    className = '',
    children,
    ...rest
}: Props) {
    const toneStyles: Record<Tone, string> = {
        neutral: 'bg-ink/10 text-ink/60',
        gold: 'bg-gold/20 text-inkDeep',
    };

    return (
        <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${toneStyles[tone]} ${className}`}
            {...rest}
        >
            {children}
        </span>
    );
}