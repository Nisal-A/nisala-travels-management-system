import { MessageCircle } from 'lucide-react';
import { company } from '@/config/company';

interface WhatsAppButtonProps {
    text?: string;
    label?: string;
    className?: string;
    variant?: 'floating' | 'inline' | 'button';
}

export function WhatsAppButton({
    text = '',
    label = 'Chat with us',
    className = '',
    variant = 'floating',
}: WhatsAppButtonProps) {
    const encodedText = encodeURIComponent(text);
    const href = `https://wa.me/${company.whatsapp}${text ? `?text=${encodedText}` : ''}`;

    if (variant === 'button') {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all ${className}`}
            >
                <MessageCircle className="w-5 h-5" />
                {label}
            </a>
        );
    }

    if (variant === 'inline') {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] font-medium transition-colors ${className}`}
            >
                <MessageCircle className="w-5 h-5" />
                {label}
            </a>
        );
    }

    // floating
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_10px_40px_rgba(37,211,102,0.6)] hover:scale-110 transition-all focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 flex items-center justify-center group ${className}`}
            aria-label="Chat with us on WhatsApp"
        >
            <MessageCircle className="w-7 h-7" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-3 font-semibold">
                {label}
            </span>
        </a>
    );
}
