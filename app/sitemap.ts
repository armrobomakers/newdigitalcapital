import { getEventSlugs } from '@/data/events';

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7485';
  return getEventSlugs().map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: new Date()
  }));
}
