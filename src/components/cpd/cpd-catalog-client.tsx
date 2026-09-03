'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Award, Clock, Sparkles, BookOpen, CheckCircle2, ShieldCheck, Download, ArrowRight } from "lucide-react"
import Link from 'next/link'

export interface CPDCourseItem {
  sort_order: number
  title: string
  short_title: string
  slug: string
  tier: string
  level: string
  cpd_points: number
  duration_hours: number
  price_ngn: number
  member_price_ngn: number
  description: string
  filename: string
  pages_count: number
}

interface CPDCatalogClientProps {
  courses: CPDCourseItem[]
}

export default function CPDCatalogClient({ courses }: CPDCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.short_title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTier = selectedTier === 'all' || 
                        (selectedTier === 'tier1' && course.tier.includes('Tier 1')) ||
                        (selectedTier === 'tier2' && course.tier.includes('Tier 2')) ||
                        (selectedTier === 'tier3' && course.tier.includes('Tier 3'))

    return matchesSearch && matchesTier
  })

  return (
    <div className="space-y-8">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text"
            placeholder="Search CPD micro-credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 text-slate-800"
          />
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button 
            variant={selectedTier === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTier('all')}
            className={selectedTier === 'all' ? 'bg-[#0f172a] text-white font-bold' : 'text-slate-700 font-semibold'}
          >
            All Courses ({courses.length})
          </Button>
          <Button 
            variant={selectedTier === 'tier1' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTier('tier1')}
            className={selectedTier === 'tier1' ? 'bg-amber-600 text-white font-bold' : 'text-slate-700 font-semibold'}
          >
            Tier 1: Essential Standards
          </Button>
          <Button 
            variant={selectedTier === 'tier2' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTier('tier2')}
            className={selectedTier === 'tier2' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-700 font-semibold'}
          >
            Tier 2: Specialized
          </Button>
          <Button 
            variant={selectedTier === 'tier3' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTier('tier3')}
            className={selectedTier === 'tier3' ? 'bg-rose-600 text-white font-bold' : 'text-slate-700 font-semibold'}
          >
            Tier 3: Clinical
          </Button>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No CPD courses found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or filter selection.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.slug} className="flex flex-col overflow-hidden border-slate-200 hover:border-amber-500/50 hover:shadow-lg transition-all bg-white relative">
              <div className="h-2.5 w-full bg-gradient-to-r from-slate-900 via-amber-600 to-amber-400" />
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] font-bold tracking-wider ${
                    course.tier.includes('Tier 3') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    course.tier.includes('Tier 2') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {course.tier}
                  </Badge>

                  <Badge className="bg-slate-900 text-amber-400 font-mono font-bold text-[10px] px-2 py-0.5">
                    +{course.cpd_points} CPD Points
                  </Badge>
                </div>

                <CardTitle className="text-lg font-serif font-bold text-slate-900 leading-snug line-clamp-2">
                  {course.title.replace('NIC CPD Micro-Credential: ', '')}
                </CardTitle>

                <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 pb-4">
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{course.duration_hours} Learning Hrs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{course.pages_count} Pg Handbook</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Non-Member Fee</span>
                    <span className="text-sm font-bold text-slate-700 font-mono line-through opacity-70">
                      ₦{course.price_ngn.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-amber-700 uppercase flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Member Special
                    </span>
                    <span className="text-xl font-bold text-slate-900 font-mono">
                      ₦{course.member_price_ngn.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-4">
                <Link href={`/portal/member/cpd`} className="w-full">
                  <Button className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2">
                    <span>Enrol & Claim CPD Points</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}
