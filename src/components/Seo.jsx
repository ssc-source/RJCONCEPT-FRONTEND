import Head from 'next/head';

export default function Seo({ title, description, path }) {
  const siteUrl = 'https://rjconcept.com';
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteUrl}${path}`} />
    </Head>
  );
}
