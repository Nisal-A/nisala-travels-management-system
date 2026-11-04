/**
 * Thailand Photo Set Configuration
 *
 * Centralized, typed constants mapping each Thailand image role to its normalized
 * kebab-case path under /images/thailand/.
 *
 * All pages and components import from this file.
 */

export interface ThailandImageItem {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export const THAILAND_IMAGES = {
  /**
   * Step 2: About Us page image
   * Dhammakaya Meditation Center, Ayutthaya, Thailand
   */
  aboutUs: {
    src: "/images/thailand/jpg/dhammakaya-03.jpg",
    alt: "Dhammakaya Meditation Center, Ayutthaya, Thailand.",
    width: 1200,
    height: 900,
  },

  /**
   * Step 3: Thailand memories gallery (Dhammakaya Meditation Center, Ayutthaya)
   * 5 images for responsive grid with lightbox dialog
   */
  memories: [
    {
      id: "thailand-dhammakaya-01",
      src: "/images/thailand/jpg/dhammakaya-01.jpg",
      alt: "Aerial perspective of Dhammakaya Meditation Center stupa and ceremonial plazas, Ayutthaya, Thailand",
      // TODO: Replace with verified caption for Dhammakaya Meditation Center photo 01
      caption: "TODO: Sunset prayer assembly grounds at Dhammakaya Meditation Center, Ayutthaya",
      width: 1200,
      height: 900,
    },
    {
      id: "thailand-dhammakaya-02",
      src: "/images/thailand/jpg/dhammakaya-02.jpg",
      alt: "Golden dome architecture and expansive assembly grounds at Dhammakaya Meditation Center, Ayutthaya",
      // TODO: Replace with verified caption for Dhammakaya Meditation Center photo 02
      caption: "TODO: Serene morning meditation reflections across the ceremonial grounds",
      width: 1200,
      height: 900,
    },
    {
      id: "thailand-dhammakaya-03",
      src: "/images/thailand/jpg/dhammakaya-03.jpg",
      alt: "Dhammakaya Meditation Center, Ayutthaya, Thailand.",
      // TODO: Replace with verified caption for Dhammakaya Meditation Center photo 03
      caption: "TODO: Monumental symmetry of the central Dhammakaya Cetiya stupa",
      width: 1200,
      height: 900,
    },
    {
      id: "thailand-dhammakaya-04",
      src: "/images/thailand/jpg/dhammakaya-04.jpg",
      alt: "Ceremonial procession pathways and sacred architecture at Dhammakaya temple complex, Ayutthaya",
      // TODO: Replace with verified caption for Dhammakaya Meditation Center photo 04
      caption: "TODO: Mindful walking meditation pathway at the historic Ayutthaya spiritual retreat",
      width: 1200,
      height: 900,
    },
    {
      id: "thailand-dhammakaya-05",
      src: "/images/thailand/jpg/dhammakaya-05.jpg",
      alt: "Architectural vista and tranquil open grounds of Dhammakaya Meditation Center, Ayutthaya",
      // TODO: Replace with verified caption for Dhammakaya Meditation Center photo 05
      caption: "TODO: Peaceful sanctuary panorama at Dhammakaya Meditation Center",
      width: 1200,
      height: 900,
    },
  ],

  /**
   * Step 4: Home page "Thailand photos" (3 images in exact order)
   */
  homeShowcase: [
    {
      src: "/images/thailand/jpg/iconsiam-skyline-night.png",
      alt: "Illuminated ICONSIAM waterfront skyline along the Chao Phraya River at night in Bangkok, Thailand",
      width: 1920,
      height: 1080,
    },
    {
      src: "/images/thailand/jpg/bridge-scenic.jpg",
      alt: "Scenic cable-stayed bridge and vibrant twilight cityscape in Bangkok, Thailand",
      width: 1920,
      height: 1280,
    },
    {
      src: "/images/thailand/webp/temple-sunset.webp",
      alt: "Historic Buddhist temple spire silhouetted against a radiant golden sunset sky in Thailand",
      width: 1920,
      height: 1080,
    },
  ],

  /**
   * Step 5: Hero slideshow (Destinations page and Thailand page) (6 images)
   */
  heroSlideshow: [
    {
      src: "/images/thailand/webp/hero-code-generated.webp",
      alt: "Breathtaking panoramic vista of tropical karst islands and turquoise waters in Thailand",
      eyebrow: "Tropical Wonder",
      headline: "Enchanting shores and emerald lagoons",
      width: 1920,
      height: 1080,
    },
    {
      src: "/images/thailand/webp/hero-roller-coaster.webp",
      alt: "Thrilling amusement park roller coaster ride surrounded by lush tropical greenery in Thailand",
      eyebrow: "High-Energy Adventures",
      headline: "Thrills, theme parks, and vibrant escapes",
      width: 1920,
      height: 1080,
    },
    {
      src: "/images/thailand/webp/hero-tuk-tuk.webp",
      alt: "Classic colorful Thai tuk-tuk cruising down a bustling city boulevard in Thailand",
      eyebrow: "Urban Energy",
      headline: "Lively streets, night markets, and city pulse",
      width: 1920,
      height: 1080,
    },
    {
      src: "/images/thailand/webp/hero-temple-tourists.webp",
      alt: "Travelers exploring an ornate gilded Buddhist temple sanctuary in Thailand",
      eyebrow: "Spiritual Heritage",
      headline: "Gilded sanctuaries and sacred cultural landmarks",
      width: 1920,
      height: 1080,
    },
    {
      src: "/images/thailand/webp/hero-island-hopping.webp",
      alt: "Longtail boat navigating through emerald Andaman lagoons and dramatic limestone cliffs in Thailand",
      eyebrow: "Andaman Expeditions",
      headline: "Island-hopping across pristine turquoise coves",
      width: 1920,
      height: 1080,
    },
    {
      src: "/images/thailand/webp/temple-sunset.webp",
      alt: "Historic Buddhist temple spire silhouetted against a radiant golden sunset sky in Thailand",
      eyebrow: "Golden Hour Serenity",
      headline: "Tranquil temple horizons bathed in dusk light",
      width: 1920,
      height: 1080,
    },
  ],

  /**
   * Step 6: Other heroes (maximum 2 photos)
   */
  otherHeroes: {
    tourPackages: {
      src: "/images/thailand/jpg/hero-city-night.jpg",
      alt: "Vibrant city night skyline with illuminated skyscrapers and expressways in Thailand",
      width: 1920,
      height: 1080,
    },
    tourFinder: {
      src: "/images/thailand/jpg/hero-pattaya-neon.png",
      alt: "Pattaya Bay neon lights illuminating the coastal shoreline at night in Thailand",
      width: 1920,
      height: 1080,
    },
  },
} as const;

export type ThailandImagesConfig = typeof THAILAND_IMAGES;
