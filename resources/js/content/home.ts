export interface WhyChooseItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface CommitmentItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface FeaturedPackage {
    slug: string;
    title: string;
    summary?: string | null;
    destination?: {
        slug?: string | null;
        name?: string | null;
        country?: string | null;
    } | null;
    duration_days: number;
    duration_nights?: number | null;
    price: number;
    price_from_label?: boolean;
    currency?: string;
    hero_image_url?: string | null;
    tags?: string[];
    featured?: boolean;
    tier?: string | null;
    tier_label?: string | null;
    group_min?: number | null;
    group_max?: number | null;
}

export interface DestinationItem {
    slug: string;
    name: string;
    country?: string | null;
    region?: string | null;
    tagline?: string | null;
    overview?: string | null;
    hero_image_url?: string | null;
    tour_count?: number;
    best_months?: string | null;
    highlights?: string[];
}

export const heroContent = {
    badge: 'Bespoke Travel in Sri Lanka & Beyond',
    title: 'Thoughtfully Crafted Journeys Across Sri Lanka & Beyond',
    description:
        'Personal travel guidance, transparent itineraries, and authentic experiences crafted to match your preferences and budget.',
    primaryCta: {
        label: 'Explore Tour Packages',
        href: '/our-tours',
    },
    secondaryCta: {
        label: 'Plan Your Journey',
        href: '/contact',
    },
    panelNotice: 'Official Nisala Travels travel services. Real trip photography and verified memories coming soon.',
    trustPills: [
        'Personal Travel Guidance',
        'Transparent Pricing',
        'Direct WhatsApp Support',
    ],
};

export const whyChooseItems: WhyChooseItem[] = [
    {
        id: 'guidance',
        title: 'Personal travel guidance',
        description:
            'Direct consultation and tailored advice from dedicated specialists who take time to understand your pace, interests, and expectations.',
        icon: 'Compass',
    },
    {
        id: 'pricing',
        title: 'Clear package information and pricing',
        description:
            'Upfront pricing with detailed breakdowns of inclusions, route distances, accommodation standards, and zero surprise fees.',
        icon: 'ReceiptText',
    },
    {
        id: 'support',
        title: 'Helpful customer support',
        description:
            'Attentive, dependable assistance before your departure, throughout your travels, and after you return home safely.',
        icon: 'Headphones',
    },
    {
        id: 'options',
        title: 'Options for different preferences and budgets',
        description:
            'Flexible tour tiers and customizable itineraries tailored for solo adventurers, couples, families, and private small groups.',
        icon: 'SlidersHorizontal',
    },
];

export const commitmentItems: CommitmentItem[] = [
    {
        id: 'communication',
        title: 'Clear communication',
        description:
            'Prompt, honest, and direct communication before, during, and after booking, ensuring complete clarity without guesswork.',
        icon: 'MessageSquareCheck',
    },
    {
        id: 'accuracy',
        title: 'Accurate package information',
        description:
            'Truthful accommodation descriptions, verified itineraries, and realistic travel times for every day of your itinerary.',
        icon: 'FileCheck2',
    },
    {
        id: 'respect',
        title: 'Respectful service',
        description:
            'Courteous, thoughtful care that values your time, cultural considerations, personal space, and distinct travel requirements.',
        icon: 'HeartHandshake',
    },
    {
        id: 'security',
        title: 'Responsible handling of customer information',
        description:
            'Strict confidentiality and secure practices ensuring your personal, passport, and booking information are always protected.',
        icon: 'ShieldCheck',
    },
    {
        id: 'guidance-promise',
        title: 'Helpful travel guidance',
        description:
            'Practical advice on travel timing, visa requirements, packing tips, and local insights to make every leg of your journey smooth.',
        icon: 'Compass',
    },
];

export const finalCtaContent = {
    badge: 'Start Planning Today',
    title: 'Ready to Plan Your Sri Lankan Journey?',
    description:
        'Connect with our team directly on WhatsApp for immediate guidance or submit an inquiry with your travel preferences.',
    whatsappLabel: 'Chat on WhatsApp',
    inquiryLabel: 'Send Travel Inquiry',
    inquiryHref: '/contact',
    footnote:
        'Free travel advice with zero booking obligation. We respond promptly during standard business hours.',
};
