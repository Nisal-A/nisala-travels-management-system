export type Destination = {
    id: string;
    name: string;
    description: string;
    slug: string;
    image: string;
};

export const destinations: Destination[] = [
    {
        id: "thailand",
        name: "Thailand",
        slug: "thailand",
        description: "Escape in style to pristine beaches, vibrant culture, and world-class culinary experiences.",
        image: "/images/thailand/phuket.jpg"
    },
    {
        id: "india",
        name: "India",
        slug: "india",
        description: "Journeys made comfortable. Discover the spiritual heartlands and ancient wonders at a relaxed pace.",
        image: "/images/india/taj-mahal.jpg"
    }
];
