import { Head, usePage } from '@inertiajs/react';
import { site as company } from '@/content/site';

interface SEOHeadProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
}

export function SEOHead({ title, description, image, url }: SEOHeadProps) {
    const { url: currentUrl } = usePage();
    const baseUrl = 'https://nisalatravels.lk';

    const defaultImage = `${baseUrl}/images/nisala-travels-logo.png`;
    const ogImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : defaultImage;
    const pageUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : `${baseUrl}${currentUrl}`;
    const fullTitle = `${title} | ${company.name}`;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta head-key="description" name="description" content={description} />
            
            {/* Open Graph */}
            <meta head-key="og:title" property="og:title" content={fullTitle} />
            <meta head-key="og:description" property="og:description" content={description} />
            <meta head-key="og:image" property="og:image" content={ogImage} />
            <meta head-key="og:url" property="og:url" content={pageUrl} />
            <meta head-key="og:type" property="og:type" content="website" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </Head>
    );
}
