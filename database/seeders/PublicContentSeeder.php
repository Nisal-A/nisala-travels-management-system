<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Database\Seeder;

/**
 * PLACEHOLDER seed content.
 * Note: Image paths reference existing placeholder assets and are placeholders until owner photos are supplied.
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
                // Image is a placeholder until owner photos are supplied
                'image' => null,
                'highlights' => ['Sigiriya Rock Fortress', 'Tea Country Scenic Train', 'Yala Wildlife Safari'],
                'region' => 'south-asia',
                'best_months' => 'December to April',
                'facts' => [
                    ['label' => 'Time zone', 'value' => 'UTC+05:30'],
                    ['label' => 'Currency', 'value' => 'Sri Lankan Rupee (LKR)'],
                    ['label' => 'International airport', 'value' => 'Bandaranaike (CMB)'],
                ],
                // Placeholder gallery until owner photos are supplied
                'gallery' => null,
                'sort_order' => 1,
                'listing_state' => 'coming_soon',
            ],
            [
                'slug' => 'thailand',
                'name' => 'Thailand',
                'country' => 'Thailand',
                'tagline' => 'Vibrant floating markets, ornate temples, and tranquil island hideaways.',
                // Existing placeholder image
                'image' => '/images/thailand/phuket.jpg',
                'highlights' => ['Bangkok Grand Palace', 'Phi Phi Islands Cruise', 'Chiang Mai Mountain Sanctuaries'],
                'region' => 'southeast-asia',
                'best_months' => 'November to March',
                'facts' => [
                    ['label' => 'Time zone', 'value' => 'UTC+07:00'],
                    ['label' => 'Currency', 'value' => 'Thai Baht (THB)'],
                    ['label' => 'International airport', 'value' => 'Suvarnabhumi (BKK)'],
                ],
                // Existing placeholder gallery images
                'gallery' => [
                    '/images/thailand/krabi.jpg',
                    '/images/thailand/island-hopping.jpg',
                ],
                'sort_order' => 2,
                'listing_state' => 'live',
            ],
            [
                'slug' => 'india',
                'name' => 'India',
                'country' => 'India',
                'tagline' => 'A kaleidoscope of royal palaces, spiritual rivers, and timeless culture.',
                // Existing placeholder image
                'image' => '/images/india/taj-mahal.jpg',
                'highlights' => ['Taj Mahal & Agra Fort', 'Kerala Houseboat Backwaters', 'Jaipur Royal Palaces'],
                'region' => 'south-asia',
                'best_months' => 'October to March',
                'facts' => [
                    ['label' => 'Time zone', 'value' => 'UTC+05:30'],
                    ['label' => 'Currency', 'value' => 'Indian Rupee (INR)'],
                    ['label' => 'International airport', 'value' => 'Indira Gandhi (DEL)'],
                ],
                // Existing placeholder gallery images
                'gallery' => [
                    '/images/india/bodhgaya.jpg',
                ],
                'sort_order' => 3,
                'listing_state' => 'live',
            ],
        ];

        foreach ($destinations as $dest) {
            Destination::updateOrCreate(
                ['slug' => $dest['slug']],
                [
                    'country' => $dest['country'],
                    'city_region' => $dest['name'],
                    'tagline' => $dest['tagline'],
                    'hero_image' => $dest['image'],
                    'highlights' => $dest['highlights'],
                    'region' => $dest['region'],
                    'best_months' => $dest['best_months'],
                    'facts' => $dest['facts'],
                    'gallery' => $dest['gallery'],
                    'sort_order' => $dest['sort_order'],
                    'status' => 'active',
                    'listing_state' => $dest['listing_state'],
                ]
            );
        }

        $tours = [
            [
                'slug' => 'cultural-triangle-discovery',
                'title' => 'Cultural Triangle Discovery',
                'destinationSlug' => 'sri-lanka',
                'durationDays' => 7,
                'durationNights' => 6,
                'priceLKR' => 145000,
                'priceFromLabel' => true,
                'featured' => true,
                'tags' => ['Culture', 'Heritage', 'UNESCO'],
                'startingMonths' => ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
                'summary' => 'Journey through Sri Lanka\'s ancient kingdoms, sacred temples, and UNESCO World Heritage sites.',
                'overview' => 'Explore the heart of Sri Lankan civilization across the Cultural Triangle. Ascend the legendary Sigiriya Rock Fortress, wander the cave shrines of Dambulla, marvel at the ancient ruins of Polonnaruwa, and soak in the spiritual serenity of Kandy.',
                'image' => null, // Placeholder until owner photos are supplied
                'gallery' => null,
                'highlights' => [
                    'Climb the 5th-century Sigiriya Rock Fortress at sunrise',
                    'Explore the gilded Dambulla Cave Temple complex',
                    'Cycle through the ancient capital ruins of Polonnaruwa',
                    'Visit the sacred Temple of the Tooth Relic in Kandy',
                    'Scenic village bullock cart ride with traditional lunch',
                ],
                'included' => [
                    '6 nights\' boutique hotel accommodation with breakfast',
                    'Private air-conditioned vehicle with English-speaking chauffeur-guide',
                    'All entrance fees to listed monuments and UNESCO sites',
                    'Traditional village lunch experience in Habarana',
                    'All government taxes and service charges',
                ],
                'excluded' => [
                    'International flights and Sri Lanka visa fees',
                    'Lunches and dinners not specified in the itinerary',
                    'Travel insurance and personal expenses',
                    'Optional activities and camera/video permits',
                    'Gratuities for guides and drivers',
                ],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival & transfer to Habarana', 'description' => 'Arrive at Bandaranaike International Airport. Meet your chauffeur-guide and travel to Habarana in the Cultural Triangle. Relax and enjoy a welcome dinner.'],
                    ['day' => 2, 'title' => 'Sigiriya Rock & Minneriya Safari', 'description' => 'Early morning ascent of Sigiriya Lion Rock Fortress. Afternoon 4x4 safari in Minneriya National Park to witness the famous elephant gathering.'],
                    ['day' => 3, 'title' => 'Polonnaruwa Ancient City', 'description' => 'Explore the medieval capital of Polonnaruwa by bicycle, including the Gal Vihara rock sculptures and the Royal Palace ruins.'],
                    ['day' => 4, 'title' => 'Dambulla Caves & Spice Gardens', 'description' => 'Visit the Dambulla Cave Temples with over 150 Buddha statues. Continue to Matale spice garden and arrive in the hill capital of Kandy.'],
                    ['day' => 5, 'title' => 'Temple of the Tooth & Cultural Show', 'description' => 'Visit the revered Sri Dalada Maligawa (Temple of the Tooth). Afternoon stroll around Kandy Lake and an evening traditional dance performance.'],
                    ['day' => 6, 'title' => 'Royal Botanical Gardens & Colombo', 'description' => 'Explore the sprawling Peradeniya Botanical Gardens. Transfer to Colombo for an evening orientation drive along Galle Face Green.'],
                    ['day' => 7, 'title' => 'Departure', 'description' => 'Leisure time for last-minute shopping in Colombo before your airport transfer for your departure flight.'],
                ],
                'accommodation' => 'Boutique eco-resort in Habarana and colonial hill country hotel in Kandy',
                'groupSize' => ['min' => 2, 'max' => 12],
                'faqs' => [
                    ['question' => 'Is climbing Sigiriya difficult?', 'answer' => 'Sigiriya involves approximately 1,200 steps with handrails. Most visitors with reasonable fitness manage it comfortably in about 45-60 minutes.'],
                ],
            ],
            [
                'slug' => 'southern-coast-and-wildlife',
                'title' => 'Southern Coast & Wildlife Safari',
                'destinationSlug' => 'sri-lanka',
                'durationDays' => 6,
                'durationNights' => 5,
                'priceLKR' => 165000,
                'priceFromLabel' => true,
                'featured' => false,
                'tags' => ['Wildlife', 'Beaches', 'Adventure'],
                'startingMonths' => ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
                'summary' => 'Experience thrilling leopard safaris in Yala, colonial charm in Galle Fort, and pristine southern beaches.',
                'overview' => 'An unforgettable blend of untamed wilderness and tropical coastal leisure. Track elusive leopards and sloth bears in Yala National Park, stroll cobblestone alleys of 17th-century Dutch Galle Fort, and unwind on sun-drenched beaches.',
                'image' => null, // Placeholder until owner photos are supplied
                'gallery' => null,
                'highlights' => [
                    'Two private game drives in Yala National Park with expert naturalist',
                    'Walking tour of UNESCO-listed Galle Dutch Fort with a local historian',
                    'Whale watching excursion off the coast of Mirissa',
                    'Relaxation on palm-fringed Mirissa and Bentota beaches',
                ],
                'included' => [
                    '5 nights\' accommodation in 4-star beach and safari resorts',
                    'Private air-conditioned vehicle throughout the journey',
                    'All park entrance fees and private 4x4 safari jeep hire',
                    'Daily breakfast and two bush dinners at Yala',
                    'Bottled mineral water during transfers and game drives',
                ],
                'excluded' => [
                    'International airfare and travel insurance',
                    'Meals and beverages not specified',
                    'Camera and video permits at parks',
                    'Personal expenses and laundry',
                    'Driver and guide tips',
                ],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival & transfer to Yala', 'description' => 'Meet your guide at Colombo Airport and drive south along the coastline toward Yala. Check into your safari lodge.'],
                    ['day' => 2, 'title' => 'Full-day Yala Safari', 'description' => 'Morning and afternoon game drives through Yala National Park searching for leopards, sloth bears, elephants, and abundant birdlife.'],
                    ['day' => 3, 'title' => 'Yala to Mirissa & Whale Watching', 'description' => 'Morning drive to Mirissa. Afternoon free for beach relaxation, surfing, or an optional sunset catamaran cruise.'],
                    ['day' => 4, 'title' => 'Whale Watching & Galle Fort', 'description' => 'Early morning boat excursion to spot blue whales and dolphins. Afternoon transfer to Galle Fort for a guided sunset heritage walk.'],
                    ['day' => 5, 'title' => 'Bentota Beach Day', 'description' => 'Transfer to the golden shores of Bentota. Enjoy water sports, a Madu River boat safari through mangroves, or relax at the spa.'],
                    ['day' => 6, 'title' => 'Departure via Colombo', 'description' => 'Leisurely breakfast before transferring along the Southern Expressway directly to Bandaranaike International Airport.'],
                ],
                'accommodation' => 'Luxury safari lodge near Yala and beachfront boutique hotel in Mirissa/Bentota',
                'groupSize' => ['min' => 2, 'max' => 10],
                'faqs' => [
                    ['question' => 'When is the best time for whale watching?', 'answer' => 'The prime whale watching season on the southern coast runs from November to April when seas are calm and blue whales migrate close to shore.'],
                ],
            ],
            [
                'slug' => 'hill-country-and-tea-trails',
                'title' => 'Hill Country & Tea Trails',
                'destinationSlug' => 'sri-lanka',
                'durationDays' => 5,
                'durationNights' => 4,
                'priceLKR' => 125000,
                'priceFromLabel' => true,
                'featured' => false,
                'tags' => ['Nature', 'Scenic', 'Tea'],
                'startingMonths' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jul', 'Aug', 'Sep', 'Dec'],
                'summary' => 'Ride the famous scenic train through misty tea estates, hike Little Adam\'s Peak, and explore colonial Nuwara Eliya.',
                'overview' => 'Escape into the cool, emerald-green highlands of Sri Lanka. Ride one of the world\'s most beautiful train routes from Nuwara Eliya to Ella, walk among manicured tea plantations, and marvel at dramatic mountain vistas.',
                'image' => null, // Placeholder until owner photos are supplied
                'gallery' => null,
                'highlights' => [
                    'Iconic scenic train journey between Nanu Oya and Ella',
                    'Visit a working tea factory with tea tasting session',
                    'Sunrise hike to Little Adam\'s Peak overlooking Ella Gap',
                    'Photograph the famous Nine Arch Bridge in Ella',
                ],
                'included' => [
                    '4 nights\' accommodation in heritage colonial bungalows and boutique stays',
                    'Reserved 1st or 2nd class scenic train tickets',
                    'Private transport with dedicated chauffeur-guide',
                    'All tea factory tours, tastings, and site entry tickets',
                    'Daily breakfast and afternoon high tea at a historic estate',
                ],
                'excluded' => [
                    'International flights and visa fees',
                    'Lunches and alcoholic beverages',
                    'Travel and medical insurance',
                    'Personal expenses and shopping',
                    'Tips for guides, drivers, and porters',
                ],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Colombo to Nuwara Eliya', 'description' => 'Drive through winding mountain roads past cascading waterfalls to "Little England" — Nuwara Eliya. Visit an iconic tea estate.'],
                    ['day' => 2, 'title' => 'Scenic Train to Ella', 'description' => 'Board the scenic highland train winding through misty valleys, tunnels, and tea terraces. Arrive in Ella and check into your mountain-view lodge.'],
                    ['day' => 3, 'title' => 'Nine Arch Bridge & Little Adam\'s Peak', 'description' => 'Early morning hike to Little Adam\'s Peak for sweeping views. Walk along the railway line to see a train cross the iconic Nine Arch Bridge.'],
                    ['day' => 4, 'title' => 'Ravana Falls & Highland Leisure', 'description' => 'Visit Ravana Falls and explore local cafes in Ella village. Afternoon optional zip-lining or cooking masterclass.'],
                    ['day' => 5, 'title' => 'Return to Colombo', 'description' => 'Scenic descent from the hill country back to Colombo or international airport with stops at scenic viewpoints.'],
                ],
                'accommodation' => 'Colonial tea planter\'s bungalow in Nuwara Eliya and scenic mountain resort in Ella',
                'groupSize' => ['min' => 2, 'max' => 8],
                'faqs' => [
                    ['question' => 'How cold does it get in Nuwara Eliya?', 'answer' => 'Nuwara Eliya sits at 1,868m elevation. Daytime temperatures average 15-20°C, but nights can drop to 10°C. Warm layers are recommended.'],
                ],
            ],
            [
                'slug' => 'thailand-island-escape',
                'title' => 'Thailand Island & Culture Escape',
                'destinationSlug' => 'thailand',
                'durationDays' => 8,
                'durationNights' => 7,
                'priceLKR' => 280000,
                'priceFromLabel' => true,
                'featured' => true,
                'tags' => ['Beaches', 'Culture', 'Islands'],
                'startingMonths' => ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                'summary' => 'From bustling Bangkok street food and ornate temples to the turquoise waters and limestone karsts of Phuket and Phi Phi.',
                'overview' => 'The ultimate Thai getaway combining vibrant urban energy with idyllic island paradise. Marvel at Bangkok\'s Grand Palace, cruise along the Chao Phraya River, then fly south to Phuket for island hopping across Maya Bay and Phi Phi.',
                // Existing placeholder image
                'image' => '/images/thailand/island-hopping.jpg',
                'gallery' => [
                    '/images/thailand/krabi.jpg',
                    '/images/thailand/phuket.jpg',
                ],
                'highlights' => [
                    'Private guided tour of Bangkok\'s Grand Palace and Wat Pho',
                    'Evening street food tuk-tuk adventure through Chinatown',
                    'Speedboat island-hopping tour to Phi Phi and Maya Bay',
                    'Sunset sea kayaking through limestone caves in Phang Nga Bay',
                ],
                'included' => [
                    '7 nights\' accommodation in 4-star and 5-star handpicked hotels',
                    'Domestic flight: Bangkok to Phuket with luggage allowance',
                    'All airport transfers by private air-conditioned vehicle',
                    'Full-day Phi Phi speedboat tour including buffet lunch and snorkel gear',
                    'Daily breakfast and curated culinary experiences',
                ],
                'excluded' => [
                    'International flights to/from Thailand',
                    'National park entry fees (approx. 400 THB paid locally)',
                    'Travel and health insurance',
                    'Personal expenses and shopping',
                    'Discretionary tips for guides and boat crew',
                ],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Bangkok', 'description' => 'Arrive at Suvarnabhumi Airport. Private transfer to your riverside hotel. Rest after your flight or take an optional evening river dinner cruise.'],
                    ['day' => 2, 'title' => 'Bangkok Palaces & Temples', 'description' => 'Visit the majestic Grand Palace, Temple of the Emerald Buddha, and the giant Reclining Buddha at Wat Pho. Long-tail boat canal tour.'],
                    ['day' => 3, 'title' => 'Markets & Street Food', 'description' => 'Morning visit to the Maeklong Railway Market. Evening tuk-tuk food tour sampling Michelin-recommended street food.'],
                    ['day' => 4, 'title' => 'Bangkok to Phuket', 'description' => 'Transfer to the airport for your short flight to Phuket. Private transfer to your beachfront resort. Free afternoon to relax by the Andaman Sea.'],
                    ['day' => 5, 'title' => 'Phi Phi Islands & Maya Bay', 'description' => 'Full-day speedboat excursion to Phi Phi Don, Phi Phi Leh, Maya Bay, and Pileh Lagoon. Snorkeling among tropical coral reefs.'],
                    ['day' => 6, 'title' => 'Phang Nga Bay & James Bond Island', 'description' => 'Cruise into Phang Nga Bay. Kayak through sea caves (hongs) and see the iconic needle-shaped James Bond Island.'],
                    ['day' => 7, 'title' => 'Phuket Leisure Day', 'description' => 'Free day for shopping in Phuket Old Town, visiting a hillside viewpoint, or indulging in a traditional Thai spa treatment.'],
                    ['day' => 8, 'title' => 'Departure', 'description' => 'Transfer to Phuket International Airport for your onward flight, or extend your stay with an optional Krabi add-on.'],
                ],
                'accommodation' => 'Riverside luxury hotel in Bangkok and beachfront resort on Phuket\'s west coast',
                'groupSize' => ['min' => 2, 'max' => 14],
                'faqs' => [
                    ['question' => 'Do I need a visa for Thailand?', 'answer' => 'Citizens of many countries receive a visa exemption or Visa on Arrival for stays up to 30 or 60 days. Check your passport\'s eligibility before travel.'],
                ],
            ],
            [
                'slug' => 'golden-triangle-india',
                'title' => 'The Golden Triangle — Delhi, Agra & Jaipur',
                'destinationSlug' => 'india',
                'durationDays' => 6,
                'durationNights' => 5,
                'priceLKR' => 210000,
                'priceFromLabel' => true,
                'featured' => true,
                'tags' => ['Heritage', 'Palaces', 'Culture'],
                'startingMonths' => ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                'summary' => 'Witness the world-famous Taj Mahal at sunrise, explore royal Rajasthani forts in Jaipur, and experience Delhi\'s rich history.',
                'overview' => 'India\'s quintessential introduction. Stand in awe before the Taj Mahal in Agra, discover the sandstone splendour of Jaipur\'s Amber Fort and City Palace, and explore the contrasting energy of Old and New Delhi.',
                // Existing placeholder image
                'image' => '/images/india/taj-mahal.jpg',
                'gallery' => [
                    '/images/india/bodhgaya.jpg',
                ],
                'highlights' => [
                    'Sunrise visit to the Taj Mahal with expert monument guide',
                    'Elephant-hilltop ascent or 4x4 jeep to Jaipur\'s Amber Fort',
                    'Rickshaw ride through the bustling bazaars of Chandni Chowk, Delhi',
                    'Visit the Palace of Winds (Hawa Mahal) and royal observatory in Jaipur',
                ],
                'included' => [
                    '5 nights\' accommodation in heritage havelis and 5-star hotels',
                    'Private air-conditioned chauffeur-driven vehicle for the entire circuit',
                    'Government-approved local monument guides in each city',
                    'All monument entry tickets with skip-the-line privileges',
                    'Daily buffet breakfast and a special Rajasthani cultural dinner',
                ],
                'excluded' => [
                    'International flights to/from Delhi',
                    'India e-Visa fees',
                    'Meals other than specified',
                    'Camera and professional video fees at monuments',
                    'Driver and guide gratuities',
                ],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Delhi', 'description' => 'Arrive in New Delhi. Private airport transfer to your hotel. Afternoon orientation drive past India Gate and Rashtrapati Bhavan.'],
                    ['day' => 2, 'title' => 'Old & New Delhi Sightseeing', 'description' => 'Explore Jama Masjid, take a cycle-rickshaw through Chandni Chowk, visit Raj Ghat, and marvel at Qutub Minar.'],
                    ['day' => 3, 'title' => 'Delhi to Agra & Agra Fort', 'description' => 'Drive along the Yamuna Expressway to Agra. Check into your hotel. Afternoon tour of the majestic red sandstone Agra Fort.'],
                    ['day' => 4, 'title' => 'Taj Mahal at Sunrise & on to Jaipur', 'description' => 'Early morning sunrise visit to the Taj Mahal. Return for breakfast, then drive to Jaipur with a stop at Fatehpur Sikri.'],
                    ['day' => 5, 'title' => 'Jaipur Forts & Palaces', 'description' => 'Ascend to Amber Fort, photograph Hawa Mahal, explore the City Palace museum, and see the instruments of Jantar Mantar.'],
                    ['day' => 6, 'title' => 'Return to Delhi & Departure', 'description' => 'Drive back to Delhi International Airport for your evening departure flight, or transfer to your hotel for an extension.'],
                ],
                'accommodation' => '5-star heritage hotel in Delhi, boutique property with Taj views in Agra, and heritage palace in Jaipur',
                'groupSize' => ['min' => 2, 'max' => 12],
                'faqs' => [
                    ['question' => 'Is the Taj Mahal open every day?', 'answer' => 'The Taj Mahal is closed to visitors every Friday. Our itineraries are specifically planned to ensure you visit on an open day.'],
                ],
            ],
            [
                'slug' => 'kerala-backwaters-retreat',
                'title' => 'Kerala Backwaters & Spice Trails',
                'destinationSlug' => 'india',
                'durationDays' => 5,
                'durationNights' => 4,
                'priceLKR' => 185000,
                'priceFromLabel' => true,
                'featured' => false,
                'tags' => ['Nature', 'Wellness', 'Cruises'],
                'startingMonths' => ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                'summary' => 'Glide through palm-fringed lagoons aboard a private Kettuvallam houseboat and unwind with authentic Ayurvedic wellness.',
                'overview' => 'Surrender to the tranquil pace of "God\'s Own Country." Board a luxury private houseboat in Alleppey, feast on fresh Keralan cuisine, explore historic Fort Kochi with its Chinese fishing nets, and rejuvenate your senses.',
                // Existing placeholder image
                'image' => '/images/india/bodhgaya.jpg',
                'gallery' => [
                    '/images/india/taj-mahal.jpg',
                ],
                'highlights' => [
                    'Overnight cruise on a private Kettuvallam houseboat through Alleppey',
                    'Walking tour of historic Fort Kochi and Chinese fishing nets',
                    'Authentic Ayurvedic wellness consultation and rejuvenation massage',
                    'Traditional Kathakali classical dance and martial arts performance',
                ],
                'included' => [
                    '3 nights\' luxury boutique hotel stay and 1 night private houseboat cruise',
                    'All meals included during the houseboat cruise prepared by private chef',
                    'Dedicated private vehicle and chauffeur throughout Kerala',
                    'All entry tickets, Kathakali show tickets, and local guide fees',
                    'Daily breakfast at hotels',
                ],
                'excluded' => [
                    'Flights to/from Kochi International Airport',
                    'Lunches and dinners when not on the houseboat',
                    'Ayurvedic treatments beyond the included session',
                    'Personal expenses and laundry',
                    'Driver and crew gratuities',
                ],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival in Kochi', 'description' => 'Arrive at Cochin International Airport. Transfer to Fort Kochi. Evening stroll along the promenade to view the iconic Chinese fishing nets.'],
                    ['day' => 2, 'title' => 'Fort Kochi Heritage & Culture', 'description' => 'Visit St. Francis Church, the Jewish Synagogue in Mattancherry, and the Dutch Palace. Evening Kathakali dance performance.'],
                    ['day' => 3, 'title' => 'Board Alleppey Houseboat', 'description' => 'Drive to Alleppey and board your traditional luxury houseboat. Cruise through peaceful lagoons, canals, and rural villages. Chef-prepared Keralan dinner on board.'],
                    ['day' => 4, 'title' => 'Backwaters and village exploration', 'description' => 'Continue cruising through quiet waterways with stops at coir-making villages and paddy fields. Disembark in the afternoon and transfer to Kochi.'],
                    ['day' => 5, 'title' => 'Departure from Kochi', 'description' => 'After breakfast, transfer to Cochin International Airport for your departure flight.'],
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

            // The seeder must not mark any Sri Lanka tour as active
            $isSriLanka = ($t['destinationSlug'] === 'sri-lanka');
            $isActive = ! $isSriLanka;
            $status = $isActive ? 'active' : 'draft';

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
                    'is_active' => $isActive,
                    'status' => $status,
                    'sort_order' => $sortOrder++,
                ]
            );
        }
    }
}
