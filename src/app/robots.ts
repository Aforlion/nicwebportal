import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/portal/',
        '/admin/',
        '/api/',
        '/auth/',
        '/onboard/',
        '/payment/',
        '/reset-password',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
