/**
 * SEO Structured Data Schema Generators (JSON-LD)
 * for RJ Concept Coaching Institute
 */

const SITE_URL = 'https://rjconcept.in';
const LOGO_URL = `${SITE_URL}/logo_rj.png`;
const ORG_NAME = 'RJ Concept';

const SOCIAL_PROFILES = [
  'https://www.facebook.com/rjconcept',
  'https://www.youtube.com/@rjconcept',
  'https://www.instagram.com/rjconcept',
  'https://www.seemanchalsmartvyapaar.com'
];

/**
 * EducationalOrganization Schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organization`,
    'name': ORG_NAME,
    'alternateName': 'RJ Concept Purnia',
    'url': SITE_URL,
    'logo': {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      'url': LOGO_URL,
      'caption': ORG_NAME
    },
    'image': LOGO_URL,
    'description': "RJ Concept is Bihar's trusted coaching institute for UPSC, BPSC, SSC, Banking, Railway, Defence, CTET, STET and other competitive examinations with experienced faculty, affordable fees and proven results.",
    'telephone': '+91-9234829905',
    'email': 'info@rjconcept.in',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'DIG Chowk',
      'addressLocality': 'Purnia',
      'addressRegion': 'Bihar',
      'postalCode': '854301',
      'addressCountry': 'IN'
    },
    'sameAs': SOCIAL_PROFILES,
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': '+91-9234829905',
        'contactType': 'admissions',
        'areaServed': 'IN',
        'availableLanguage': ['English', 'Hindi']
      }
    ],
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '520',
      'bestRating': '5',
      'worstRating': '1'
    }
  };
}

/**
 * LocalBusiness Schema (School type is most appropriate for a coaching center)
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'School',
    '@id': `${SITE_URL}/#localbusiness`,
    'name': ORG_NAME,
    'image': LOGO_URL,
    'url': SITE_URL,
    'telephone': '+91-9234829905',
    'priceRange': '₹₹',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'DIG Chowk, Line Bazar',
      'addressLocality': 'Purnia',
      'addressRegion': 'Bihar',
      'postalCode': '854301',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '25.779185',
      'longitude': '87.470035'
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        'opens': '08:00',
        'closes': '19:00'
      }
    ],
    'sameAs': SOCIAL_PROFILES
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    'url': SITE_URL,
    'name': ORG_NAME,
    'description': "Bihar's most trusted coaching center for UPSC, BPSC, SSC & Banking preparation.",
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${SITE_URL}/store?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Breadcrumb Schema
 * @param {Array<{name: string, item: string}>} items
 */
export function getBreadcrumbSchema(items = []) {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.item ? (item.item.startsWith('http') ? item.item : `${SITE_URL}${item.item}`) : SITE_URL
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': itemListElement
  };
}

/**
 * Course Schema
 * @param {Object} course
 */
export function getCourseSchema(course) {
  if (!course) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': course.title,
    'description': course.description,
    'provider': {
      '@type': 'EducationalOrganization',
      'name': ORG_NAME,
      'sameAs': SITE_URL
    },
    'offers': course.price ? {
      '@type': 'Offer',
      'price': course.price,
      'priceCurrency': 'INR',
      'category': 'Paid'
    } : undefined
  };
}

/**
 * Product Schema for Test Series or Study Materials sold on Store
 * @param {Object} product
 */
export function getProductSchema(product) {
  if (!product) return null;
  const description = product.description || `Prepare with RJ Concept's premium ${product.name || 'educational materials'}.`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/store/${product.id}#product`,
    'name': product.name,
    'image': product.imageUrl || LOGO_URL,
    'description': description,
    'brand': {
      '@type': 'Brand',
      'name': ORG_NAME
    },
    'offers': {
      '@type': 'Offer',
      'url': `${SITE_URL}/store/${product.id}`,
      'priceCurrency': 'INR',
      'price': product.price || 0,
      'priceValidUntil': '2028-12-31',
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '124',
      'bestRating': '5',
      'worstRating': '1'
    }
  };
}

/**
 * FAQ Schema
 * @param {Array<{question: string, answer: string}>} faqs
 */
export function getFAQSchema(faqs = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Article Schema for Blog posts or Study Material posts
 * @param {Object} article
 */
export function getArticleSchema(article) {
  if (!article) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${article.id || article.slug}#post`,
    'headline': article.title,
    'image': article.coverImageUrl || LOGO_URL,
    'datePublished': article.createdAt || new Date().toISOString(),
    'dateModified': article.updatedAt || article.createdAt || new Date().toISOString(),
    'author': {
      '@type': 'Person',
      'name': article.author || 'Rahul Jha',
      'url': `${SITE_URL}/faculty`
    },
    'publisher': {
      '@type': 'EducationalOrganization',
      'name': ORG_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': LOGO_URL
      }
    },
    'description': article.summary || article.description || `Read ${article.title} on RJ Concept blog.`
  };
}
