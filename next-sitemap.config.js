import axios from 'axios';

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://rjconcept.in',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin',
    '/admin/*',
    '/dashboard',
    '/dashboard/*',
    '/login',
    '/register',
    '/checkout',
    '/cart',
    '/orders',
    '/orders/*',
    '/test-attempt',
    '/test-result',
    '/test-result/*',
    '/test-ranking/*',
    '/course/[id]/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/login',
          '/register',
          '/checkout',
          '/cart',
          '/orders',
          '/orders/*',
          '/test-attempt',
          '/test-result',
          '/test-result/*',
          '/test-ranking/*',
          '/course/[id]/*',
        ],
      },
    ],
  },
  additionalPaths: async (config) => {
    const paths = [];
    const apiBase = 'https://api.rjconcept.in/api';
    
    // 1. Fetch Products for /store/[id]
    try {
      console.log('Fetching products for sitemap from:', `${apiBase}/products`);
      const res = await axios.get(`${apiBase}/products`, { timeout: 5000 });
      const products = res.data?.data || [];
      console.log(`Found ${products.length} products for sitemap.`);
      products.forEach((p) => {
        if (p.id) {
          paths.push({
            loc: `/store/${p.id}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          });
        }
      });
    } catch (e) {
      console.warn('Failed to fetch products for sitemap:', e.message);
    }

    // 2. Fetch Test Series for /test-series/[id]
    try {
      console.log('Fetching test-series for sitemap from:', `${apiBase}/test-series`);
      const res = await axios.get(`${apiBase}/test-series`, { timeout: 5000 });
      const series = res.data?.data || [];
      console.log(`Found ${series.length} test-series for sitemap.`);
      series.forEach((s) => {
        if (s.id) {
          paths.push({
            loc: `/test-series/${s.id}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          });
        }
      });
    } catch (e) {
      console.warn('Failed to fetch test-series for sitemap:', e.message);
    }

    // 3. Fetch Study Materials for /study-material/[id]
    try {
      console.log('Fetching study materials for sitemap from:', `${apiBase}/study-materials/public`);
      const res = await axios.get(`${apiBase}/study-materials/public`, { timeout: 5000 });
      const materials = res.data?.data || [];
      console.log(`Found ${materials.length} study materials for sitemap.`);
      materials.forEach((m) => {
        if (m.id) {
          paths.push({
            loc: `/study-material/${m.id}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          });
        }
      });
    } catch (e) {
      console.warn('Failed to fetch study-materials for sitemap:', e.message);
    }

    return paths;
  },
};

export default config;