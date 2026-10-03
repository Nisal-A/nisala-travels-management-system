/**
 * Props for the MoneyText component
 */
export interface MoneyTextProps {
    amount: number;
    currency?: 'LKR' | 'USD';
    size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    className?: string;
}

/**
 * MoneyText formats and displays currency amounts securely and consistently.
 *
 * @example
 * <MoneyText amount={15000} currency="LKR" weight="bold" />
 */
export function MoneyText({
    amount,
    currency = 'LKR',
    size = 'base',
    weight = 'normal',
    className = '',
}: MoneyTextProps) {
    // Always use standard locales for currency formatting
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return <span className={`text-${size} font-${weight} tabular-nums ${className}`}>{formatted}</span>;
}
