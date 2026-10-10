const fs = require('fs');
const files = [
  'resources/js/Pages/Public/Home.tsx',
  'resources/js/Pages/Public/Contact.tsx',
  'resources/js/Pages/Public/Destinations/Index.tsx',
  'resources/js/Pages/Public/Tours/Index.tsx',
  'resources/js/Pages/Public/Tours/Show.tsx',
  'resources/js/Pages/Public/Tours/Interactive.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+\{.*?\bHead\b.*?\}\s+from\s+['"]@inertiajs\/react['"];/, (match) => {
    let replaced = match.replace(/\bHead\b,?/, '');
    replaced = replaced.replace(/\{\s*,\s*/, '{').replace(/,\s*\}/, '}').replace(/,\s*,/, ',');
    if (replaced.includes('{  }') || replaced.includes('{}') || replaced.includes('{ }')) {
      return '';
    }
    return replaced;
  });
  if (!content.includes('import { SEOHead }')) {
    content = "import { SEOHead } from '@/components/public/SEOHead';\n" + content;
  }
  fs.writeFileSync(file, content);
});
