/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://rjconcept.in',

  generateRobotsTxt: true,

  generateIndexSitemap: false,

  sitemapSize: 5000,

  changefreq: 'weekly',

  priority: 0.7,

  exclude: [
    '/admin/*',
    '/dashboard/*',
    '/login',
    '/register',
    '/checkout',
    '/cart',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};

export default config;