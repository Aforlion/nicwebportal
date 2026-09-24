import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 86400 // Revalidate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'

  // 1. Static core marketing and public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/join/facility`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join/graduates`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/programs/cpd`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/registry`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/regulatory`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // 2. Dynamic database content (Courses, News, Regulatory docs)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return staticPages
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Dynamic Course Enrollments / Landing Pages
  let coursePages: MetadataRoute.Sitemap = []
  try {
    const { data: courses } = await supabase.from('courses').select('id, title, updated_at')
    if (courses) {
      coursePages = courses.map((c) => ({
        url: `${baseUrl}/portal/student/enroll/${c.id}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch (err) {
    console.error('[sitemap] Failed fetching course routes:', err)
  }

  // Dynamic News Articles
  let newsPages: MetadataRoute.Sitemap = []
  try {
    const { data: news } = await supabase.from('news').select('slug, updated_at').not('slug', 'is', null)
    if (news) {
      newsPages = news.map((n) => ({
        url: `${baseUrl}/news/${n.slug}`,
        lastModified: n.updated_at ? new Date(n.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (err) {
    console.error('[sitemap] Failed fetching news routes:', err)
  }

  // Dynamic Regulatory Documents
  let regulatoryPages: MetadataRoute.Sitemap = []
  try {
    const { data: docs } = await supabase.from('regulatory_documents').select('slug, updated_at').not('slug', 'is', null)
    if (docs) {
      regulatoryPages = docs.map((d) => ({
        url: `${baseUrl}/regulatory/${d.slug}`,
        lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }))
    }
  } catch (err) {
    console.error('[sitemap] Failed fetching regulatory routes:', err)
  }

  return [...staticPages, ...coursePages, ...newsPages, ...regulatoryPages]
}
