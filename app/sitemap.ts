import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://deck.dionlabs.ai',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
