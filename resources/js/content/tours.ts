export type TourPackage = {
    slug: string;
    title: string;
    destination: 'Thailand' | 'India';
    audienceTag: string;
    durationDays: number;
    durationNights: number;
    priceFrom: number;
    shortDescription: string;
    highlights: string[];
    itinerary: { day: number; title: string; description: string }[];
    inclusions: string[];
    exclusions: string[];
    galleryImages: string[];
    tags: string[];
    departureMonths: string[];
    isFeatured: boolean;
};

export const tours: TourPackage[] = [
    // THAILAND TOURS
    {
        slug: "phuket-phi-phi-escape",
        title: "Phuket & Phi Phi Island Escape",
        destination: "Thailand",
        audienceTag: "Couples & Friends",
        durationDays: 6,
        durationNights: 5,
        priceFrom: 185000,
        shortDescription: "Experience the ultimate tropical getaway with crystal clear waters, vibrant nightlife, and luxurious beachfront stays.",
        highlights: ["Phi Phi Island speedboat tour", "Phuket Old Town exploration", "Premium beachfront resort", "Sunset dinner cruise"],
        itinerary: [
            { day: 1, title: "Arrival in Phuket", description: "Welcome to Phuket! Transfer to your premium resort and relax." },
            { day: 2, title: "Phuket Old Town", description: "Explore the vibrant Sino-Portuguese architecture and local markets." },
            { day: 3, title: "Phi Phi Islands", description: "Full-day speedboat tour to the stunning Phi Phi Islands with snorkeling." },
            { day: 4, title: "Leisure & Spa", description: "Enjoy a traditional Thai massage and a free afternoon by the beach." },
            { day: 5, title: "Sunset Cruise", description: "A romantic sunset dinner cruise along the Phuket coastline." },
            { day: 6, title: "Departure", description: "Transfer to the airport for your flight home." }
        ],
        inclusions: ["5 Nights Accommodation", "Daily Breakfast", "Airport Transfers", "Phi Phi Island Tour", "Sunset Cruise"],
        exclusions: ["International Flights", "Personal Expenses", "Travel Insurance"],
        galleryImages: ["/images/thailand/phuket.jpg", "/images/thailand/island-hopping.jpg"],
        tags: ["Island", "Honeymoon", "Luxury"],
        departureMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        isFeatured: true
    },
    {
        slug: "bangkok-pattaya-city-lights",
        title: "Bangkok & Pattaya City Lights",
        destination: "Thailand",
        audienceTag: "Adults",
        durationDays: 5,
        durationNights: 4,
        priceFrom: 145000,
        shortDescription: "A fast-paced mix of Bangkok's incredible shopping and rooftop dining, paired with Pattaya's coastal vibrancy.",
        highlights: ["Chao Phraya River dinner", "Chatuchak weekend market", "Sanctuary of Truth in Pattaya", "Rooftop dining experience"],
        itinerary: [
            { day: 1, title: "Arrival & Rooftop Welcome", description: "Arrive in Bangkok and enjoy dinner at a stunning rooftop restaurant." },
            { day: 2, title: "City Wonders", description: "Visit the Grand Palace and Wat Arun, followed by river cruising." },
            { day: 3, title: "Transfer to Pattaya", description: "Travel to Pattaya and check into your ocean-view room." },
            { day: 4, title: "Sanctuary of Truth", description: "Explore this magnificent wooden structure and relax on the beach." },
            { day: 5, title: "Departure", description: "Morning shopping and transfer to the airport." }
        ],
        inclusions: ["4 Nights Accommodation", "Breakfast & 1 Dinner", "All transfers", "Temple tours"],
        exclusions: ["Flights", "Visas", "Optional tours"],
        galleryImages: ["/images/thailand/bangkok.jpg", "/images/thailand/rooftop.jpg"],
        tags: ["City", "Culture", "Shopping"],
        departureMonths: ["All Year"],
        isFeatured: false
    },
    {
        slug: "krabi-island-retreat",
        title: "Krabi Island Retreat",
        destination: "Thailand",
        audienceTag: "Couples & Friends",
        durationDays: 5,
        durationNights: 4,
        priceFrom: 165000,
        shortDescription: "A serene escape to Krabi's limestone cliffs and emerald waters, perfect for relaxation and soft adventure.",
        highlights: ["Four Islands tour", "Railay Beach", "Emerald Pool & Hot Springs", "Seafood dining"],
        itinerary: [
            { day: 1, title: "Welcome to Krabi", description: "Arrival and check-in to a peaceful resort." },
            { day: 2, title: "Four Islands Tour", description: "Hop between pristine islands via longtail boat." },
            { day: 3, title: "Emerald Pool", description: "Visit the natural hot springs and the stunning Emerald Pool." },
            { day: 4, title: "Railay Beach", description: "A day at leisure on the beautiful Railay Beach." },
            { day: 5, title: "Departure", description: "Transfer to Krabi Airport." }
        ],
        inclusions: ["4 Nights Accommodation", "Breakfast", "Island Tours", "Airport Transfers"],
        exclusions: ["Flights", "Meals not specified"],
        galleryImages: ["/images/thailand/krabi.jpg", "/images/thailand/food.jpg"],
        tags: ["Island", "Nature", "Relaxation"],
        departureMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        isFeatured: true
    },
    {
        slug: "koh-samui-wellness",
        title: "Koh Samui Wellness Retreat",
        destination: "Thailand",
        audienceTag: "Adults",
        durationDays: 6,
        durationNights: 5,
        priceFrom: 220000,
        shortDescription: "Rejuvenate your mind and body with premium spa treatments, yoga, and healthy cuisine in tropical Koh Samui.",
        highlights: ["Daily yoga sessions", "Premium spa packages", "Healthy gourmet dining", "Private beach access"],
        itinerary: [
            { day: 1, title: "Arrival", description: "Welcome and wellness consultation." },
            { day: 2, title: "Detox & Spa", description: "Morning yoga and a full afternoon of spa therapies." },
            { day: 3, title: "Island Nature", description: "A guided nature walk and healthy cooking class." },
            { day: 4, title: "Mindfulness", description: "Meditation sessions and beach relaxation." },
            { day: 5, title: "Rejuvenation", description: "Final spa treatments and a sunset farewell dinner." },
            { day: 6, title: "Departure", description: "Transfer to airport feeling refreshed." }
        ],
        inclusions: ["5 Nights Resort", "All Meals (Healthy Menu)", "Spa Treatments", "Yoga Classes"],
        exclusions: ["Flights", "Alcoholic Beverages"],
        galleryImages: ["/images/thailand/samui.jpg", "/images/thailand/spa.jpg"],
        tags: ["Wellness", "Luxury"],
        departureMonths: ["May", "Jun", "Jul", "Aug", "Sep"],
        isFeatured: false
    },
    {
        slug: "chiang-mai-culture",
        title: "Chiang Mai Culture & Nature",
        destination: "Thailand",
        audienceTag: "Explorers",
        durationDays: 5,
        durationNights: 4,
        priceFrom: 155000,
        shortDescription: "Discover the mountainous north with its rich Lanna culture, ancient temples, and ethical elephant sanctuaries.",
        highlights: ["Doi Suthep temple", "Ethical elephant care", "Lanna cooking class", "Night bazaar"],
        itinerary: [
            { day: 1, title: "Arrival in the North", description: "Check in and explore the Night Bazaar." },
            { day: 2, title: "Doi Suthep", description: "Visit the iconic mountaintop temple of Wat Phra That Doi Suthep." },
            { day: 3, title: "Elephant Sanctuary", description: "Spend a day ethically feeding and bathing rescued elephants." },
            { day: 4, title: "Cooking & Crafts", description: "Learn Lanna cooking and visit local artisan villages." },
            { day: 5, title: "Departure", description: "Transfer to Chiang Mai Airport." }
        ],
        inclusions: ["4 Nights Accommodation", "Breakfast", "Elephant Sanctuary fee", "Cooking Class"],
        exclusions: ["Flights", "Travel Insurance"],
        galleryImages: ["/images/thailand/chiangmai.jpg", "/images/thailand/food.jpg"],
        tags: ["Culture", "Nature"],
        departureMonths: ["Nov", "Dec", "Jan", "Feb"],
        isFeatured: false
    },

    // INDIA TOURS
    {
        slug: "buddhist-circuit-pilgrimage",
        title: "Buddhist Circuit Pilgrimage",
        destination: "India",
        audienceTag: "Seniors & Pilgrims",
        durationDays: 9,
        durationNights: 8,
        priceFrom: 245000,
        shortDescription: "A deeply spiritual, slow-paced journey covering Bodhgaya, Sarnath, Rajgir, Nalanda, and Lumbini with careful assistance.",
        highlights: ["Mahabodhi Temple", "Sarnath Deer Park", "Ruins of Nalanda", "Dedicated tour escort", "Sri Lankan style meals"],
        itinerary: [
            { day: 1, title: "Arrival in Varanasi", description: "Warm welcome, transfer to hotel. Rest and acclimatize." },
            { day: 2, title: "Sarnath & Ganga Aarti", description: "Visit Sarnath where Buddha gave his first sermon. Evening Aarti view." },
            { day: 3, title: "Travel to Bodhgaya", description: "Comfortable drive to Bodhgaya. Check into a senior-friendly hotel." },
            { day: 4, title: "Mahabodhi Temple", description: "Full day dedicated to meditation and visiting the Mahabodhi Temple." },
            { day: 5, title: "Rajgir & Nalanda", description: "Visit Vulture Peak (assisted) and the ancient Nalanda University." },
            { day: 6, title: "Travel to Kushinagar", description: "Journey to the site of Buddha's Mahaparinirvana." },
            { day: 7, title: "Lumbini (Nepal)", description: "Cross the border to visit the birthplace of Lord Buddha." },
            { day: 8, title: "Return to Varanasi", description: "Relaxing journey back to Varanasi." },
            { day: 9, title: "Departure", description: "Assisted transfer to the airport." }
        ],
        inclusions: ["8 Nights Accommodation", "All Meals (Sri Lankan/Veg)", "Tour Escort", "Wheelchair Assistance if needed", "Monument Fees"],
        exclusions: ["Flights", "Nepal Visa Fee", "Personal Offerings"],
        galleryImages: ["/images/india/buddhist-circuit.jpg", "/images/india/bodhgaya.jpg"],
        tags: ["Pilgrimage", "Senior friendly", "Culture"],
        departureMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        isFeatured: true
    },
    {
        slug: "golden-triangle-comfort",
        title: "Golden Triangle Comfort Tour",
        destination: "India",
        audienceTag: "Family Elders",
        durationDays: 7,
        durationNights: 6,
        priceFrom: 185000,
        shortDescription: "Experience Delhi, Agra, and Jaipur at a relaxed pace, with comfortable transport and pre-arranged accessibility.",
        highlights: ["Taj Mahal at sunrise", "Amber Fort (Jeep access)", "Delhi heritage tour", "Premium comfortable stays"],
        itinerary: [
            { day: 1, title: "Arrival in Delhi", description: "Assisted arrival and check-in to a central Delhi hotel." },
            { day: 2, title: "Delhi Heritage", description: "Relaxed tour of India Gate, Qutub Minar, and Lotus Temple." },
            { day: 3, title: "Drive to Agra", description: "Comfortable drive to Agra. Evening view of the Taj Mahal from Mehtab Bagh." },
            { day: 4, title: "Taj Mahal & Agra Fort", description: "Morning visit to the Taj Mahal with guided assistance." },
            { day: 5, title: "Drive to Jaipur", description: "Journey to the Pink City. Rest upon arrival." },
            { day: 6, title: "Jaipur Sights", description: "Visit Amber Fort (easy access via Jeep) and City Palace." },
            { day: 7, title: "Departure", description: "Drive back to Delhi for your onward flight." }
        ],
        inclusions: ["6 Nights Accommodation", "Breakfast & Dinner", "AC Transport", "Guide Services"],
        exclusions: ["Flights", "Lunches"],
        galleryImages: ["/images/india/golden-triangle.jpg", "/images/india/taj-mahal.jpg"],
        tags: ["Culture", "Senior friendly"],
        departureMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        isFeatured: true
    },
    {
        slug: "kerala-backwaters-comfort",
        title: "Kerala Backwaters & Comfort",
        destination: "India",
        audienceTag: "Seniors & Couples",
        durationDays: 8,
        durationNights: 7,
        priceFrom: 195000,
        shortDescription: "A soothing journey through God's Own Country, featuring a gentle houseboat cruise and Ayurvedic relaxation.",
        highlights: ["Premium Houseboat stay", "Munnar tea gardens", "Ayurvedic massage", "Fort Kochi heritage"],
        itinerary: [
            { day: 1, title: "Arrival in Kochi", description: "Welcome to Kerala and transfer to your hotel." },
            { day: 2, title: "Fort Kochi", description: "Explore the Chinese fishing nets and Jewish Synagogue at a slow pace." },
            { day: 3, title: "Drive to Munnar", description: "Scenic drive up to the cool climate of Munnar." },
            { day: 4, title: "Tea Gardens", description: "Visit a tea museum and enjoy the lush landscapes." },
            { day: 5, title: "Thekkady", description: "Drive to Thekkady. Enjoy a gentle boat ride on Periyar Lake." },
            { day: 6, title: "Houseboat Cruise", description: "Board a premium houseboat in Alleppey for a relaxing overnight cruise." },
            { day: 7, title: "Kumarakom", description: "Disembark and relax at a backwater resort. Enjoy an Ayurvedic massage." },
            { day: 8, title: "Departure", description: "Transfer to Kochi airport." }
        ],
        inclusions: ["7 Nights Accommodation", "Breakfast & Dinner", "Houseboat Stay (All Meals)", "Ayurvedic Session"],
        exclusions: ["Flights"],
        galleryImages: ["/images/india/kerala.jpg"],
        tags: ["Nature", "Relaxation", "Senior friendly"],
        departureMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        isFeatured: false
    },
    {
        slug: "south-india-temple-circuit",
        title: "South India Temple Circuit",
        destination: "India",
        audienceTag: "Pilgrims",
        durationDays: 10,
        durationNights: 9,
        priceFrom: 210000,
        shortDescription: "A devout journey through the magnificent temples of Tamil Nadu, designed for comfort and accessibility.",
        highlights: ["Meenakshi Temple, Madurai", "Rameshwaram", "Brihadeeswara Temple", "Special Darshan arrangements"],
        itinerary: [
            { day: 1, title: "Arrival in Chennai", description: "Welcome and rest." },
            { day: 2, title: "Mahabalipuram", description: "Visit the shore temples with minimal walking." },
            { day: 3, title: "Pondicherry", description: "Travel to Pondicherry, visit the Aurobindo Ashram." },
            { day: 4, title: "Thanjavur", description: "Visit the great Brihadeeswara Temple." },
            { day: 5, title: "Madurai", description: "Travel to Madurai and rest." },
            { day: 6, title: "Meenakshi Temple", description: "Special Darshan at the Meenakshi Amman Temple." },
            { day: 7, title: "Rameshwaram", description: "Drive to Rameshwaram, visit Ramanathaswamy Temple." },
            { day: 8, title: "Kanyakumari", description: "Travel to the southernmost tip of India." },
            { day: 9, title: "Trivandrum", description: "Drive to Trivandrum, visit Padmanabhaswamy Temple." },
            { day: 10, title: "Departure", description: "Transfer to Trivandrum airport." }
        ],
        inclusions: ["9 Nights Accommodation", "All Meals (Veg)", "AC Transport", "Special Darshan Tickets where available"],
        exclusions: ["Flights"],
        galleryImages: ["/images/india/temple-circuit.jpg"],
        tags: ["Pilgrimage", "Senior friendly"],
        departureMonths: ["All Year"],
        isFeatured: false
    },
    {
        slug: "varanasi-spiritual-journey",
        title: "Varanasi Spiritual Journey",
        destination: "India",
        audienceTag: "Seniors & Pilgrims",
        durationDays: 5,
        durationNights: 4,
        priceFrom: 135000,
        shortDescription: "A focused, short pilgrimage to the holy city of Varanasi and nearby Sarnath, with careful attention to elder comfort.",
        highlights: ["Morning boat ride on the Ganges", "Kashi Vishwanath Temple Darshan", "Sarnath excursions", "Evening Ganga Aarti"],
        itinerary: [
            { day: 1, title: "Arrival in Varanasi", description: "Assisted transfer to a comfortable hotel near the ghats." },
            { day: 2, title: "Ganges & Temples", description: "Early morning boat ride. Special assisted Darshan at Kashi Vishwanath." },
            { day: 3, title: "Sarnath", description: "Half-day excursion to Sarnath, where Buddha preached his first sermon." },
            { day: 4, title: "Culture & Aarti", description: "Explore the silk weaving culture. Evening special seating for the Ganga Aarti." },
            { day: 5, title: "Departure", description: "Morning at leisure, assisted transfer to the airport." }
        ],
        inclusions: ["4 Nights Accommodation", "Breakfast & Dinner (Veg)", "Boat Rides", "Guide Services"],
        exclusions: ["Flights"],
        galleryImages: ["/images/india/varanasi.jpg"],
        tags: ["Pilgrimage", "Senior friendly"],
        departureMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        isFeatured: false
    }
];
