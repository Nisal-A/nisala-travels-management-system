const fs = require('fs');
const files = {
  'resources/js/Pages/Public/Home.tsx': [/<Head title="Premium.*?" \/>/g, '<SEOHead title="Premium Travel & Tour Packages to Thailand & India" description="Creating unforgettable travel experiences tailored to your dreams. We handle the details, you enjoy the journey." url="/" image="/images/hero/hero-poster.jpg" />'],
  'resources/js/Pages/Public/Contact.tsx': [
     [/<Head title="Thank You \| Nisala Travels" \/>/g, '<SEOHead title="Thank You" description="Thank you for inquiring with Nisala Travels. We will get back to you soon." url="/contact" />'],
     [/<Head title="Contact Us \| Nisala Travels" \/>/g, '<SEOHead title="Contact Us" description="Get in touch with Nisala Travels to plan your next dream vacation to Thailand, India or beyond." url="/contact" />']
  ],
  'resources/js/Pages/Public/Destinations/Index.tsx': [/<Head title="Destinations \| Nisala Travels" \/>/g, '<SEOHead title="Destinations" description="Explore our curated destinations across Asia including Thailand and India. Discover where your next journey will take you." url="/our-destinations" />'],
  'resources/js/Pages/Public/Tours/Index.tsx': [/<Head title="Tour Packages \| Nisala Travels" \/>/g, '<SEOHead title="Tour Packages" description="Browse and filter our premium tour packages to find your perfect getaway. Explore our hand-picked selections." url="/our-tours" />'],
  'resources/js/Pages/Public/Tours/Interactive.tsx': [/<Head title="Interactive Tours Showcase \| Nisala Travels" \/>/g, '<SEOHead title="Interactive Tours Showcase" description="Explore our tour packages on an interactive map. Find the perfect location for your next luxury travel." url="/interactive-tours" />'],
  'resources/js/Pages/Public/Tours/Show.tsx': [/<Head title=\{.*\} \/>/g, '<SEOHead title={tour.package_name} description={tour.short_description || tour.description.substring(0, 150)} image={tour.hero_image} url={`/our-tours/${tour.slug}`} />']
};

for (const [file, rules] of Object.entries(files)) {
  let content = fs.readFileSync(file, 'utf8');
  if (Array.isArray(rules[0])) {
     rules.forEach(rule => {
         content = content.replace(rule[0], rule[1]);
     });
  } else {
     content = content.replace(rules[0], rules[1]);
  }
  fs.writeFileSync(file, content);
}
console.log('Replaced all Head components!');
