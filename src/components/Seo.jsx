import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Seo({
  title,
  description,
  keywords,
  path,
  image = '/logo_rj.png',
  noindex = false,
  ogType = 'website',
  schema,
  author = 'RJ Concept',
  publisher = 'RJ Concept'
}) {
  const router = useRouter();
  const siteUrl = 'https://rjconcept.in';
  
  // Title Template:
  // Home: RJ Concept | Best Coaching Institute for UPSC, BPSC, SSC, Banking & Defence Exams
  // Other Pages: <Page Name> | RJ Concept
  const isHome = router.pathname === '/' || path === '/';
  const defaultHomeTitle = 'RJ Concept | Best Coaching Institute for UPSC, BPSC, SSC, Banking & Defence Exams';
  
  const displayTitle = isHome 
    ? defaultHomeTitle 
    : (title ? `${title} | RJ Concept` : defaultHomeTitle);

  // Default Description
  const displayDescription = description || "RJ Concept is Bihar's trusted coaching institute for UPSC, BPSC, SSC, Banking, Railway, Defence, CTET, STET and other competitive examinations with experienced faculty, affordable fees and proven results.";
  
  // Default Keywords containing SEO phrases for Purnia/Bihar rankings
  const displayKeywords = keywords || "RJ Concept, RJ Concept Bihar, RJ Concept Purnia, UPSC Coaching Purnia, BPSC Coaching Bihar, SSC Coaching Purnia, Best Coaching Institute in Purnia, Banking coaching Purnia, Defence exams prep Bihar, Railway coaching Purnia";

  const canonicalUrl = `${siteUrl}${path || router.asPath.split('?')[0]}`;
  
  // Social Image
  const absoluteImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{displayTitle}</title>
      <meta name="title" content={displayTitle} />
      <meta name="description" content={displayDescription} />
      {displayKeywords && <meta name="keywords" content={displayKeywords} />}
      <meta name="author" content={author} />
      <meta name="publisher" content={publisher} />
      
      {/* Search Engine Robots Indexing Policy */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / LinkedIn / WhatsApp */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={displayTitle} />
      <meta property="og:site_name" content="RJ Concept" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Cards / Telegram / Discord */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={displayTitle} />
      <meta name="twitter:creator" content="@RJConcept" />
      
      {/* Mobile, Theme & Referrer Options */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="application-name" content="RJ Concept" />
      <meta name="apple-mobile-web-app-title" content="RJ Concept" />
      <meta name="generator" content="Next.js" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Favicons & Manifest Link */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/logo_rj.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* JSON-LD Structured Data Injection */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  );
}
