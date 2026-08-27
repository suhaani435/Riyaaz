import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

export default function Button({ variant = 'primary', disabled, className = '', children, ...rest }: Props) {
    const base = 'w-full py-3 rounded-xl font-semibold transition-colors';

    const variantStyles: Record<Variant, string> = {
        primary: 'bg-ink text-cream',
        secondary: 'bg-transparent text-ink border border-gold',
    };

    const disabledStyles = 'bg-ink/20 text-ink/50 cursor-not-allowed border-none';

    return (
        <button
            disabled={disabled}
            className={`${base} ${disabled ? disabledStyles : variantStyles[variant]} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}