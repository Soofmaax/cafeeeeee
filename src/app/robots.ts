import type { MetadataRoute } from 'next';
import { getPublicAppUrl } from '@/lib/app-url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicAppUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/account', '/checkout', '/order-success'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
