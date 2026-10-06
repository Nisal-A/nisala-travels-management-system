export type FAQ = {
    question: string;
    answer: string;
    category?: string;
};

export const faqs: FAQ[] = [
    {
        question: "Do you arrange visas for Thailand and India?",
        answer: "Yes, we handle all visa arrangements for our travellers. For Thailand, Sri Lankan citizens can often get visas processed quickly, and for India, we assist with the e-Visa or regular visa application depending on your tour type.",
        category: "Visas & Documentation"
    },
    {
        question: "How do payments and deposits work?",
        answer: "We require a 30% deposit to secure your booking and confirm flights/hotels. The remaining balance is typically due 30 days before departure. We accept bank transfers and major credit cards.",
        category: "Payments"
    },
    {
        question: "What is your cancellation policy?",
        answer: "Cancellations made 45 days or more before departure receive a full refund minus a small administrative fee. Cancellations within 30-45 days receive a 50% refund, and within 30 days are non-refundable. We strongly recommend travel insurance.",
        category: "Payments"
    },
    {
        question: "Are your India tours suitable for senior citizens?",
        answer: "Absolutely. Our India itineraries, especially the Buddhist circuit and temple tours, are designed with seniors in India. We ensure a slow pace, comfortable vehicles, wheelchair-accessible hotels where possible, and provide an accompanying tour escort for assistance.",
        category: "Senior Travel"
    },
    {
        question: "What kind of meals are provided?",
        answer: "For our India tours, we ensure high-quality vegetarian meals, often prepared in Sri Lankan style. For Thailand, we provide a mix of safe, mild local delicacies and international cuisine, catering to all dietary requirements upon request.",
        category: "General"
    },
    {
        question: "Do I need travel insurance?",
        answer: "We highly recommend comprehensive travel insurance for all our packages. It covers unforeseen medical emergencies, trip cancellations, and lost baggage. We can assist you in purchasing a suitable policy.",
        category: "General"
    }
];
