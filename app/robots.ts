export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7485';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`
  };
}
