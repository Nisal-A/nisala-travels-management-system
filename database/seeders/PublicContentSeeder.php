<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Database\Seeder;

/**
 * PLACEHOLDER seed content. Replace in the admin before launch.
 */
class PublicContentSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            [
                'slug' => 'sri-lanka',
                'name' => 'Sri Lanka',
                'country' => 'Sri Lanka',
                'tagline' => 'An island of ancient ruins, misty highlands, and golden shores.',
                'image' => '/images/hero/Golden Hour Over a Tropical Temple Bay-1.png',
                'highlights' => ['Sigiriya Rock Fortress', 'Tea Country Scenic Train', 'Yala Wildlife Safari'],
                'region' => 'south-asia',
                'best_months' => 'December to April',
                'facts' => [
                    ['label' => 'Time zone', 'value' => 'UTC+05:30'],
                    ['label' => 'Currency', 'value' => 'Sri Lankan Rupee (LKR)'],
                    ['label' => 'International airport', 'value' => 'Bandaranaike (CMB)'],
                ],
                'gallery' => [
                    '/images/destinations/sri-lanka-1.jpg',
                    '/images/destinations/sri-lanka-2.jpg',
                    '/images/destinations/sri-lanka-3.jpg',
                ],
                'sort_order' => 1,
            ],
            [
                'slug' => 'thailand',
                'name' => 'Thailand',
                'country' => 'Thailand',
                'tagline' => 'Vibrant floating markets, ornate temples, and tranquil island hideaways.',
                'image' => '/images/hero/Dream Destinations Travel Collage-4_edited.png',
                'highlights' => ['Bangkok Grand Palace', 'Phi Phi Islands Cruise', 'Chiang Mai Mountain Sanctuaries'],
                'region' => 'southeast-asia',
                'best_months' => 'November to March',
                'facts' => [
                    ['label' => 'Time zone', 'value' => 'UTC+07:00'],
                    ['label' => 'Currency', 'value' => 'Thai Baht (THB)'],
                    ['label' => 'International airport', 'value' => 'Suvarnabhumi (BKK)'],
                ],
                'gallery' => [
                    '/images/destinations/thailand-1.jpg',
                    '/images/destinations/thailand-2.jpg',
                    '/images/destinations/thailand-3.jpg',
                ],
                'sort_order' => 2,
            ],
            [
                'slug' => 'india',
                'name' => 'India',
                'country' => 'India',
                'tagline' => 'A kaleidoscope of royal palaces, spiritual rivers, and timeless culture.',
                'image' => '/images/hero/Gemini_Generated_Image_ikhiefikhiefikhi.jpeg',
                'highlights' => ['Taj Mahal & Agra Fort', 'Kerala Houseboat Backwaters', 'Jaipur Royal Palaces'],
                'region' => 'south-asia',
                'best_months' => 'October to March',
                'facts' => [
                    ['label' => 'Time zone', 'value' => 'UTC+05:30'],
                    ['label' => 'Currency', 'value' => 'Indian Rupee (INR)'],
                    ['label' => 'International airport', 'value' => 'Indira Gandhi (DEL)'],
                ],
                'gallery' => [
                    '/images/destinations/india-1.jpg',
                    '/images/destinations/india-2.jpg',
                    '/images/destinations/india-3.jpg',
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($destinations as $dest) {
            Destination::updateOrCreate(
                ['slug' => $dest['slug']],
                [
                    'country' => $dest['country'],
                    'city_region' => $dest['name'],
                    'description' => $dest['tagline'],
                    'region' => $dest['region'],
                    'tagline' => $dest['tagline'],
                    'best_months' => $dest['best_months'],
                    'facts' => $dest['facts'],
                    'highlights' => $dest['highlights'],
                    'hero_image' => $dest['image'],
                    'gallery' => $dest['gallery'],
                    'sort_order' => $dest['sort_order'],
                    'status' => 'active',
                ]
            );
        }

        $tours = [
            [
                'slug' => 'cultural-triangle-discovery',
                'title' => 'Cultural Triangle Discovery',
                'destinationSlug' => 'sri-lanka',
                'durationDays' => 5,
                'durationNights' => 4,
                'priceLKR' => 185000,
                'priceFromLabel' => true,
                'image' => '/images/tours/cultural-triangle-discovery.jpg',
                'summary' => 'Journey through the ancient royal kingdoms of Sigiriya, Polonnaruwa, and Dambulla with private guided excursions and luxury heritage stays.',
                'highlights' => ['Sigiriya Fortress Climb', 'Cave Temples of Dambulla', 'Minneriya Elephant Safari'],
                'featured' => true,
                'tags' => ['Culture', 'Heritage', 'Family'],
                'startingMonths' => ['November', 'December', 'January', 'February', 'March', 'April'],
                'included' => [
                    'Chauffeured private air-conditioned vehicle',
                    '4-star & boutique heritage accommodations',
                    'Daily breakfast & select traditional dinners',
                    'Site entrance fees (Sigiriya, Polonnaruwa, Dambulla)',
                    'Dedicated English-speaking chauffeur-guide',
                ],
                'excluded' => [
                    'International flights to/from Colombo',
                    'Entry visa fees',
                    'Travel insurance coverage',
                    'Personal expenses, drinks & gratuities',
                ],
                'gallery' => [
                    '/images/tours/cultural-triangle-discovery-1.jpg',
                    '/images/tours/cultural-triangle-discovery-2.jpg',
                    '/images/tours/cultural-triangle-discovery-3.jpg',
                    '/images/tours/cultural-triangle-discovery-4.jpg',
                ],
                'overview' => 'Immerse yourself in the ancient heart of Sri Lanka, where centuries-old kingdoms, sacred cave temples, and towering rock fortresses reveal a civilisation that shaped the island\'s identity. This five-day journey weaves through UNESCO World Heritage sites, lush wildlife reserves, and serene village landscapes. Ideal for history lovers and families seeking a cultural adventure beyond the ordinary.',
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival and transfer to the Cultural Triangle', 'description' => 'Meet your chauffeur-guide at the airport and transfer to your heritage hotel near Dambulla. Settle in and enjoy a welcome dinner featuring traditional Sri Lankan cuisine.'],
                    ['day' => 2, 'title' => 'Dambulla Cave Temples and Sigiriya Rock Fortress', 'description' => 'Begin the morning at the Dambulla Cave Temples, home to ancient murals and over a hundred Buddha statues. After lunch, ascend the iconic Sigiriya Rock Fortress for panoramic views across the jungle canopy.'],
                    ['day' => 3, 'title' => 'Polonnaruwa ancient city and Minneriya safari', 'description' => 'Explore the ruins of Polonnaruwa, the medieval capital with its royal palace complex and sacred quadrangle. In the afternoon, embark on a 4x4 safari in Minneriya National Park to witness elephant herds gathering at the reservoir.'],
                    ['day' => 4, 'title' => 'Village experience and Kandy transfer', 'description' => 'Start with a traditional village walk including an ox-cart ride and a cooking demonstration. Transfer to Kandy in the afternoon and visit the Temple of the Sacred Tooth Relic before an evening cultural performance.'],
                    ['day' => 5, 'title' => 'Departure transfer', 'description' => 'After breakfast, your chauffeur-guide transfers you to Bandaranaike International Airport or your onward destination. Optional stop at a spice garden en route.'],
                ],
                'accommodation' => 'Boutique heritage hotels, 3 to 4 star equivalent',
                'groupSize' => ['min' => 2, 'max' => 12],
                'faqs' => [
                    ['question' => 'How difficult is the Sigiriya climb?', 'answer' => 'The climb involves approximately 1,200 steps and takes most visitors around 90 minutes. A reasonable level of fitness is recommended. Your guide will set a comfortable pace with rest stops along the way.'],
                    ['question' => 'Is this tour suitable for children?', 'answer' => 'Yes. Families with children aged 6 and above regularly enjoy this itinerary. The safari and village experience are particularly popular with younger travellers.'],
                ],
            ],
            [
                'slug' => 'southern-coast-and-wildlife',
                'title' => 'Southern Coast and Wildlife',
                'destinationSlug' => 'sri-lanka',
                'durationDays' => 6,
                'durationNights' => 5,
                'priceLKR' => 220000,
                'priceFromLabel' => true,
                'image' => '/images/tours/southern-coast-and-wildlife.jpg',
                'summary' => 'Combine golden palm-fringed beaches and historic Galle Fort with heart-pounding 4x4 leopard safaris in Yala National Park.',
                'highlights' => ['Yala National Park Safari', 'Galle Fort Historic Walk', 'Mirissa Whale Watching'],
                'featured' => true,
                'tags' => ['Wildlife', 'Beach', 'Honeymoon'],
                'startingMonths' => ['November', 'December', 'January', 'February', 'March', 'April'],
                'included' => [
                    'Private luxury transfers throughout itinerary',
                    'Boutique beachfront resort & safari camp stays',
                    'Daily breakfast and picnic breakfasts',
                    'Yala 4x4 safari with certified naturalist',
                    'Galle Fort guided heritage walking tour',
                ],
                'excluded' => [
                    'International flight tickets',
                    'Sri Lanka electronic travel authorization',
                    'Comprehensive travel insurance',
                    'Alcoholic beverages & laundry',
                ],
                'gallery' => [
                    '/images/tours/southern-coast-and-wildlife-1.jpg',
                    '/images/tours/southern-coast-and-wildlife-2.jpg',
                    '/images/tours/southern-coast-and-wildlife-3.jpg',
                    '/images/tours/southern-coast-and-wildlife-4.jpg',
                ],
                'overview' => 'Discover Sri Lanka\'s sun-kissed southern coastline where golden beaches meet colonial history and untamed wilderness. From the ramparts of Galle Fort to the leopard-roaming scrublands of Yala, this six-day journey blends relaxation with adventure. Perfect for couples and wildlife enthusiasts seeking both serenity and excitement.',
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival and coastal transfer to Galle', 'description' => 'Arrive at the airport and transfer along the scenic coastal highway to Galle. Check in to your boutique hotel within the historic fort walls and explore the atmospheric streets at sunset.'],
                    ['day' => 2, 'title' => 'Galle Fort heritage walk and beach time', 'description' => 'Join a guided walking tour of Galle Fort, a UNESCO World Heritage Site with Dutch colonial architecture, artisan boutiques, and ocean-side ramparts. Afternoon at leisure on nearby beaches.'],
                    ['day' => 3, 'title' => 'Mirissa whale watching excursion', 'description' => 'Early-morning boat trip from Mirissa harbour to spot blue whales, dolphins, and sea turtles in their natural habitat. Return for a relaxed afternoon by the coast.'],
                    ['day' => 4, 'title' => 'Transfer to Yala and afternoon safari', 'description' => 'Drive east to Yala National Park and check in to your safari lodge. In the late afternoon, embark on your first 4x4 safari to spot leopards, elephants, and a wealth of birdlife.'],
                    ['day' => 5, 'title' => 'Full-day Yala safari experience', 'description' => 'Dawn and dusk game drives through Yala with a certified naturalist guide. Between drives, relax at your lodge or enjoy a bush lunch in the wilderness.'],
                    ['day' => 6, 'title' => 'Departure transfer', 'description' => 'After a final sunrise moment, transfer to the airport or your next Sri Lankan destination. Your guide can arrange stops at Tangalle or Hambantota attractions en route.'],
                ],
                'accommodation' => 'Beachfront boutique resorts and safari eco-lodges, 4 star equivalent',
                'groupSize' => ['min' => 2, 'max' => 8],
                'faqs' => [
                    ['question' => 'When is the best time for whale watching in Mirissa?', 'answer' => 'The whale watching season typically runs from November to April, with peak sightings in January and February. Conditions are weather-dependent and your guide will advise on the best day during your visit.'],
                ],
            ],
            [
                'slug' => 'hill-country-and-tea-trails',
                'title' => 'Hill Country and Tea Trails',
                'destinationSlug' => 'sri-lanka',
                'durationDays' => 4,
                'durationNights' => 3,
                'priceLKR' => 155000,
                'priceFromLabel' => true,
                'image' => '/images/tours/hill-country-and-tea-trails.jpg',
                'summary' => 'Ride the world-renowned panoramic train to Ella, wander emerald tea plantations, and unwind in cool mountain climate and colonial bungalows.',
                'highlights' => ['Scenic Kandy-Ella Train', 'Tea Factory Tasting Tour', 'Little Adam\'s Peak Hike'],
                'featured' => true,
                'tags' => ['Nature', 'Scenic', 'Culture'],
                'startingMonths' => ['December', 'January', 'February', 'March', 'July', 'August'],
                'included' => [
                    'Reserved 1st-class scenic train tickets (Kandy-Ella)',
                    'Colonial tea bungalow stays with mountain views',
                    'Daily breakfast & plantation high tea experience',
                    'Private guided tea factory tour & tasting',
                    'Dedicated private scenic vehicle and driver',
                ],
                'excluded' => [
                    'International airfare',
                    'Personal travel insurance',
                    'Meals not specified in the itinerary',
                    'Tips and porterage',
                ],
                'gallery' => [
                    '/images/tours/hill-country-and-tea-trails-1.jpg',
                    '/images/tours/hill-country-and-tea-trails-2.jpg',
                    '/images/tours/hill-country-and-tea-trails-3.jpg',
                    '/images/tours/hill-country-and-tea-trails-4.jpg',
                ],
                'overview' => 'Escape into Sri Lanka\'s emerald highlands where misty tea plantations carpet rolling hills and colonial-era bungalows offer a window into the island\'s aromatic heritage. This four-day escape includes one of the world\'s most scenic train rides and immersive plantation experiences. A rejuvenating retreat for nature lovers and those seeking cooler climes.',
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Kandy and Temple of the Tooth', 'description' => 'Arrive in Kandy and check in to your lakeside hotel. Visit the Temple of the Sacred Tooth Relic and stroll around Kandy Lake as evening falls over the hills.'],
                    ['day' => 2, 'title' => 'Scenic train to Nuwara Eliya and tea plantation', 'description' => 'Board the iconic blue train for the journey through tea country to Nuwara Eliya. Visit a working tea factory for a guided tour and tasting. Settle into your colonial bungalow.'],
                    ['day' => 3, 'title' => 'Ella and Little Adam\'s Peak hike', 'description' => 'Continue by train or road to Ella. Hike Little Adam\'s Peak for sweeping views of the valley and visit the Nine Arches Bridge. Enjoy a traditional lunch at a local eatery.'],
                    ['day' => 4, 'title' => 'Departure from Ella', 'description' => 'After a leisurely breakfast with mountain views, your driver transfers you to the airport or your next destination. Optional stops at Ravana Falls or a spice garden.'],
                ],
                'accommodation' => 'Colonial tea bungalows and boutique hill-country lodges, 3 to 4 star equivalent',
                'groupSize' => ['min' => 2, 'max' => 10],
                'faqs' => [],
            ],
            [
                'slug' => 'thailand-island-escape',
                'title' => 'Thailand Island Escape',
                'destinationSlug' => 'thailand',
                'durationDays' => 7,
                'durationNights' => 6,
                'priceLKR' => 320000,
                'priceFromLabel' => true,
                'image' => '/images/tours/thailand-island-escape.jpg',
                'summary' => 'Unwind across Phuket and Koh Samui with luxury beachfront villas, private catamaran cruises, and vibrant night bazaars.',
                'highlights' => ['Phi Phi Speedboat Tour', 'James Bond Island Cruise', 'Phuket Old Town Walk'],
                'featured' => true,
                'tags' => ['Beach', 'Honeymoon', 'Relaxation'],
                'startingMonths' => ['November', 'December', 'January', 'February', 'March', 'April'],
                'included' => [
                    'Luxury 5-star beachfront resort stays in Phuket & Samui',
                    'Inter-island ferry & speedboat transfers',
                    'Daily gourmet breakfast buffet',
                    'Phi Phi Islands full-day luxury catamaran cruise',
                    'Private airport arrival and departure transfers',
                ],
                'excluded' => [
                    'International flights to/from Thailand',
                    'Tourist visa fees',
                    'Marine national park fees (payable locally in THB)',
                    'Travel medical insurance',
                ],
                'gallery' => [
                    '/images/tours/thailand-island-escape-1.jpg',
                    '/images/tours/thailand-island-escape-2.jpg',
                    '/images/tours/thailand-island-escape-3.jpg',
                    '/images/tours/thailand-island-escape-4.jpg',
                ],
                'overview' => 'Surrender to turquoise waters and powdery beaches as you island-hop across Thailand\'s most stunning coastlines. From the dramatic limestone karsts of Phang Nga Bay to the tranquil shores of Koh Samui, this seven-day escape is designed for pure relaxation and tropical indulgence. Ideal for honeymooners and couples seeking a premium beach getaway.',
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Phuket', 'description' => 'Arrive at Phuket International Airport and transfer to your beachfront resort. Spend the evening exploring nearby restaurants and the night bazaar.'],
                    ['day' => 2, 'title' => 'Phuket Old Town and Patong Beach', 'description' => 'Discover the Sino-Portuguese architecture of Phuket Old Town and browse local markets. Relax at Patong Beach in the afternoon with optional water activities.'],
                    ['day' => 3, 'title' => 'Phi Phi Islands catamaran cruise', 'description' => 'Full-day luxury catamaran cruise to the Phi Phi Islands. Snorkel in crystal-clear coves, visit Maya Bay, and enjoy a gourmet lunch on board.'],
                    ['day' => 4, 'title' => 'James Bond Island and Phang Nga Bay', 'description' => 'Speedboat excursion to the iconic James Bond Island and the sea caves of Phang Nga Bay. Kayak through hidden lagoons surrounded by towering limestone cliffs.'],
                    ['day' => 5, 'title' => 'Transfer to Koh Samui', 'description' => 'Fly or ferry to Koh Samui and check in to your oceanfront villa. Spend the afternoon at leisure exploring the island\'s coconut-fringed coastline.'],
                    ['day' => 6, 'title' => 'Koh Samui island exploration', 'description' => 'Visit the Big Buddha Temple, explore the Namuang waterfalls, and enjoy a traditional Thai cooking class. Evening spa treatment and farewell dinner.'],
                    ['day' => 7, 'title' => 'Departure from Koh Samui', 'description' => 'After a final breakfast by the sea, transfer to Koh Samui Airport for your departure flight. Optional morning yoga session on the beach.'],
                ],
                'accommodation' => 'Luxury 5-star beachfront resorts and oceanfront villas',
                'groupSize' => ['min' => 2, 'max' => 6],
                'faqs' => [
                    ['question' => 'Do I need a visa to visit Thailand?', 'answer' => 'Visa requirements depend on your nationality. Many nationalities receive visa-free entry for stays of up to 30 days. We will advise on the specific requirements for your passport when you enquire.'],
                    ['question' => 'Can the itinerary be customised for a honeymoon?', 'answer' => 'Absolutely. We can arrange private candlelit dinners, couples\' spa experiences, and upgraded suite accommodations. Let us know your preferences when you contact us.'],
                ],
            ],
            [
                'slug' => 'golden-triangle-india',
                'title' => 'Golden Triangle India',
                'destinationSlug' => 'india',
                'durationDays' => 8,
                'durationNights' => 7,
                'priceLKR' => 295000,
                'priceFromLabel' => true,
                'image' => '/images/tours/golden-triangle-india.jpg',
                'summary' => 'Explore Delhi, Agra, and Jaipur in regal splendor with visits to the Taj Mahal, Amber Fort, and royal bazaars with private chauffeur service.',
                'highlights' => ['Sunrise at Taj Mahal', 'Amber Fort Elephant Corridor', 'Delhi Old Quarter Rickshaw'],
                'featured' => false,
                'tags' => ['Culture', 'Heritage', 'History'],
                'startingMonths' => ['October', 'November', 'December', 'January', 'February', 'March'],
                'included' => [
                    'Private luxury chauffeur-driven vehicle throughout',
                    'Palatial 5-star heritage hotel stays',
                    'Daily buffet breakfast',
                    'Skip-the-line Taj Mahal sunrise tour with scholar guide',
                    'All monument entry tickets and rickshaw ride in Delhi',
                ],
                'excluded' => [
                    'International flights to India',
                    'Indian tourist e-Visa fees',
                    'Personal travel & medical insurance',
                    'Still & video camera monument permits',
                ],
                'gallery' => [
                    '/images/tours/golden-triangle-india-1.jpg',
                    '/images/tours/golden-triangle-india-2.jpg',
                    '/images/tours/golden-triangle-india-3.jpg',
                    '/images/tours/golden-triangle-india-4.jpg',
                ],
                'overview' => 'Trace the legendary Golden Triangle circuit connecting India\'s three most iconic cities — Delhi, Agra, and Jaipur. Over eight days, witness the ethereal beauty of the Taj Mahal at sunrise, wander the regal corridors of Amber Fort, and lose yourself in the vibrant bazaars of the Pink City. A quintessential introduction to India\'s royal heritage and living culture.',
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Delhi', 'description' => 'Arrive at Delhi airport and transfer to your heritage hotel. Evening at leisure to recover from your journey.'],
                    ['day' => 2, 'title' => 'Old Delhi exploration', 'description' => 'Full-day guided tour of Old Delhi including a rickshaw ride through Chandni Chowk, visits to Jama Masjid and the Red Fort, and a street food walk.'],
                    ['day' => 3, 'title' => 'New Delhi landmarks', 'description' => 'Visit India Gate, Humayun\'s Tomb, and the Qutub Minar complex. Afternoon at leisure to explore Lodhi Garden or Khan Market.'],
                    ['day' => 4, 'title' => 'Transfer to Agra', 'description' => 'Drive to Agra and check in to your hotel with views of the Taj Mahal. Afternoon visit to Agra Fort and Mehtab Bagh for sunset views of the monument.'],
                    ['day' => 5, 'title' => 'Sunrise at the Taj Mahal', 'description' => 'Early-morning skip-the-line visit to the Taj Mahal at sunrise. Return for breakfast and visit the Itimad-ud-Daulah (Baby Taj). Afternoon at leisure.'],
                    ['day' => 6, 'title' => 'Fatehpur Sikri and transfer to Jaipur', 'description' => 'Stop at the abandoned Mughal city of Fatehpur Sikri en route to Jaipur. Check in and enjoy an evening at the vibrant Johari Bazaar.'],
                    ['day' => 7, 'title' => 'Jaipur royal city tour', 'description' => 'Visit Amber Fort, the City Palace, Jantar Mantar observatory, and Hawa Mahal. Afternoon free for shopping in the bazaars of the Pink City.'],
                    ['day' => 8, 'title' => 'Departure from Jaipur', 'description' => 'After breakfast, transfer to Jaipur Airport or Delhi for your departure flight. Optional morning visit to a local textile workshop.'],
                ],
                'accommodation' => 'Palatial 5-star heritage hotels and royal haveli conversions',
                'groupSize' => ['min' => 2, 'max' => 10],
                'faqs' => [
                    ['question' => 'What is the best time to visit the Taj Mahal?', 'answer' => 'The Taj Mahal is most spectacular at sunrise when the marble changes colour with the light and crowds are smallest. Your tour includes a dedicated sunrise visit with skip-the-line access.'],
                ],
            ],
            [
                'slug' => 'kerala-backwaters-retreat',
                'title' => 'Kerala Backwaters Retreat',
                'destinationSlug' => 'india',
                'durationDays' => 5,
                'durationNights' => 4,
                'priceLKR' => 210000,
                'priceFromLabel' => true,
                'image' => '/images/tours/kerala-backwaters-retreat.jpg',
                'summary' => 'Cruise through Alleppey on a private traditional houseboat, indulge in Ayurvedic wellness therapies, and walk through Kochi\'s colonial harbor.',
                'highlights' => ['Alleppey Houseboat Cruise', 'Ayurvedic Spa Treatments', 'Fort Kochi Sunset Stroll'],
                'featured' => false,
                'tags' => ['Wellness', 'Nature', 'Relaxation'],
                'startingMonths' => ['October', 'November', 'December', 'January', 'February', 'March'],
                'included' => [
                    'Private traditional Kettuvallam houseboat stay with full crew',
                    'All traditional Kerala meals prepared fresh on board',
                    'Authentic Ayurvedic spa consultation and massage session',
                    'Colonial boutique hotel in historic Fort Kochi',
                    'Private Cochin airport roundtrip transfers',
                ],
                'excluded' => [
                    'International flights',
                    'India visa fees',
                    'Travel insurance coverage',
                    'Personal tipping and discretionary expenses',
                ],
                'gallery' => [
                    '/images/tours/kerala-backwaters-retreat-1.jpg',
                    '/images/tours/kerala-backwaters-retreat-2.jpg',
                    '/images/tours/kerala-backwaters-retreat-3.jpg',
                    '/images/tours/kerala-backwaters-retreat-4.jpg',
                ],
                'overview' => 'Drift through Kerala\'s tranquil palm-fringed backwaters on a private houseboat, where time slows to the rhythm of the water. Combine the serenity of Alleppey\'s canals with the colonial charm of Fort Kochi and the healing traditions of Ayurveda. An ideal wellness retreat for travellers seeking rest, rejuvenation, and authentic South Indian culture.',
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Kochi and Fort Kochi walk', 'description' => 'Arrive at Cochin International Airport and transfer to your boutique hotel in historic Fort Kochi. Explore the Chinese fishing nets, St. Francis Church, and the spice markets on a guided evening walk.'],
                    ['day' => 2, 'title' => 'Kochi heritage and Ayurvedic spa', 'description' => 'Morning visit to the Mattancherry Palace and the Jewish Quarter. Afternoon Ayurvedic consultation and traditional massage at a certified wellness centre.'],
                    ['day' => 3, 'title' => 'Transfer to Alleppey and houseboat cruise', 'description' => 'Drive to Alleppey and board your private Kettuvallam houseboat. Cruise through the serene backwater canals as your on-board chef prepares fresh Kerala cuisine. Overnight on the water.'],
                    ['day' => 4, 'title' => 'Backwaters and village exploration', 'description' => 'Continue cruising through quiet waterways with stops at coir-making villages and paddy fields. Enjoy a cooking demonstration of traditional dishes. Disembark in the afternoon and transfer to Kochi.'],
                    ['day' => 5, 'title' => 'Departure from Kochi', 'description' => 'After a leisurely breakfast, transfer to Cochin International Airport for your departure. Optional early-morning visit to the Ernakulam market.'],
                ],
                'accommodation' => 'Colonial boutique hotel and premium private houseboat with full crew',
                'groupSize' => ['min' => 2, 'max' => 8],
                'faqs' => [
                    ['question' => 'What is a Kettuvallam houseboat?', 'answer' => 'A Kettuvallam is a traditional Kerala rice barge converted into a floating accommodation with bedrooms, a kitchen, and a sundeck. Your houseboat comes with a dedicated crew including a captain and chef.'],
                ],
            ],
        ];

        $sortOrder = 1;
        foreach ($tours as $t) {
            $destModel = Destination::where('slug', $t['destinationSlug'])->first();

            if (! $destModel) {
                continue;
            }

            TourPackage::updateOrCreate(
                ['slug' => $t['slug']],
                [
                    'destination_id' => $destModel->id,
                    'package_name' => $t['title'],
                    'short_description' => $t['summary'],
                    'description' => $t['overview'],
                    'duration_days' => $t['durationDays'],
                    'duration_nights' => $t['durationNights'],
                    'price' => $t['priceLKR'],
                    'price_from' => $t['priceFromLabel'] ? $t['priceLKR'] : null,
                    'currency' => 'LKR',
                    'capacity' => $t['groupSize']['max'] ?? null,
                    'group_min' => $t['groupSize']['min'] ?? null,
                    'hotel_information' => $t['accommodation'],
                    'included_items' => implode("\n", $t['included']),
                    'excluded_items' => implode("\n", $t['excluded']),
                    'itinerary' => $t['itinerary'],
                    'highlights' => $t['highlights'],
                    'hero_image' => $t['image'],
                    'gallery' => $t['gallery'],
                    'tags' => $t['tags'],
                    'departure_months' => $t['startingMonths'],
                    'faqs' => $t['faqs'],
                    'is_featured' => $t['featured'],
                    'is_active' => true,
                    'status' => 'active',
                    'sort_order' => $sortOrder++,
                ]
            );
        }
    }
}
