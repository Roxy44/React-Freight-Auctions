type AppLogoProps = {
    size?: number;
    className?: string;
    /** `mark` — light gavel for dark header; `badge` — filled square for light surfaces */
    variant?: 'mark' | 'badge';
};

export function AppLogo({ size = 28, className, variant = 'mark' }: AppLogoProps) {
    if (variant === 'badge') {
        return (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 64 64'
                width={size}
                height={size}
                className={className}
                role='img'
                aria-label='Логотип Freight Auctions'
            >
                <rect width='64' height='64' rx='14' fill='#0B3D32' />
                <rect x='14' y='46' width='36' height='6' rx='2' fill='#F5FAF8' />
                <rect x='26' y='40' width='12' height='8' rx='1.5' fill='#7BC4A8' />
                <g transform='rotate(-38 34 28)'>
                    <rect x='28' y='14' width='22' height='12' rx='3' fill='#F5FAF8' />
                    <rect x='30' y='16' width='18' height='3' rx='1' fill='#7BC4A8' opacity='0.85' />
                    <rect x='36' y='24' width='6' height='18' rx='2' fill='#D4EDE3' />
                </g>
            </svg>
        );
    }

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 64 64'
            width={size}
            height={size}
            className={className}
            role='img'
            aria-label='Логотип Freight Auctions'
        >
            <rect x='12' y='48' width='40' height='6' rx='2' fill='#F5FAF8' />
            <rect x='26' y='41' width='12' height='9' rx='1.5' fill='#7BC4A8' />
            <g transform='rotate(-38 34 28)'>
                <rect x='26' y='12' width='24' height='13' rx='3' fill='#F5FAF8' />
                <rect x='28' y='14.5' width='20' height='3' rx='1' fill='#7BC4A8' opacity='0.9' />
                <rect x='35' y='23' width='6' height='20' rx='2' fill='#D4EDE3' />
            </g>
        </svg>
    );
}
