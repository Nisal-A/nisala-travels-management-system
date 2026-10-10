export type Testimonial = {
    id: string;
    name: string;
    trip: string;
    rating: number;
    text: string;
};

export const testimonials: Testimonial[] = [
    // SAMPLE: replace with real
    {
        id: "1",
        name: "Samantha & Ruwan",
        trip: "Thailand Escape",
        rating: 5,
        text: "Our honeymoon in Phuket and Phi Phi was absolute perfection. Nisala Travels handled every single detail, from the romantic rooftop dinners to the private island hops. A truly premium experience!"
    },
    {
        id: "2",
        name: "Mr. & Mrs. Perera",
        trip: "Buddhist Circuit, India",
        rating: 5,
        text: "As senior travellers, we were worried about the pace in India, but the team at Nisala made it incredibly comfortable. The Sinhala speaking guide and Sri Lankan style meals made us feel right at home."
    },
    {
        id: "3",
        name: "The Fernando Family",
        trip: "Golden Triangle",
        rating: 4,
        text: "A wonderful family trip to Delhi, Agra, and Jaipur. The hotels were top-notch and the itinerary was balanced perfectly between sightseeing and relaxation. Highly recommended."
    },
    {
        id: "4",
        name: "Dilini S.",
        trip: "Koh Samui Wellness",
        rating: 5,
        text: "I needed a relaxing break and the Koh Samui wellness retreat suggested by Nisala was exactly what I was looking for. The spa treatments and the calm environment were rejuvenating."
    }
];
