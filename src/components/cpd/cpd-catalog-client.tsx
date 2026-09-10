'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Search, Award, Clock, Sparkles, BookOpen, CheckCircle2, ShieldCheck, Download, ArrowRight, Loader2, CreditCard, Lock } from "lucide-react"
import { initializeTransaction } from '@/lib/payments/paystack'
import { toast } from 'sonner'

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

  // Checkout modal state
  const [selectedCourse, setSelectedCourse] = useState<CPDCourseItem | null>(null)
  const [isAnnualPass, setIsAnnualPass] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [nicId, setNicId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const openCheckout = (course: CPDCourseItem) => {
    setSelectedCourse(course)
    setIsAnnualPass(false)
  }

  const openAnnualPassCheckout = () => {
    setSelectedCourse({
      sort_order: 0,
      title: 'NIC Annual CPD All-Access Subscription Pass (12 Months)',
      short_title: 'Annual CPD All-Access Pass',
      slug: 'annual-cpd-all-access-pass',
      tier: 'All Tiers Access',
      level: 'All Levels',
      cpd_points: 100,
      duration_hours: 100,
      price_ngn: 75000,
      member_price_ngn: 45000,
      description: 'Unlimited 12-month access to all 15 CPD micro-credentials, annual credit compliance logging, and verification certificates.',
      filename: 'annual_pass',
      pages_count: 500
    })
    setIsAnnualPass(true)
  }

  const handlePaystackCheckout = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (!selectedCourse) return

    setIsSubmitting(true)

    const finalPrice = isMember ? selectedCourse.member_price_ngn : selectedCourse.price_ngn

    try {
      const result = await initializeTransaction(
        email.trim(),
        finalPrice,
        {
          payment_type: 'cpd_microcredential',
          cpd_slug: selectedCourse.slug,
          cpd_title: selectedCourse.title,
          full_name: fullName.trim(),
          email: email.trim(),
          is_member: isMember,
          nic_id: isMember ? nicId.trim() : undefined,
          amount_paid: finalPrice
        }
      )

      if (result.success && result.authorization_url) {
        toast.success('Redirecting to Paystack secure checkout...')
        window.location.href = result.authorization_url
      } else {
        toast.error(result.error || 'Failed to initialize Paystack payment. Please try again.')
        setIsSubmitting(false)
      }
    } catch (err: any) {
      console.error('Payment Error:', err)
      toast.error(err.message || 'An unexpected error occurred.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* Annual Pass Banner Option Trigger */}
      <div className="flex justify-end">
        <Button 
          onClick={openAnnualPassCheckout}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Get Annual All-Access Pass (₦45,000 / Member)</span>
        </Button>
      </div>
      
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
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Standard Fee</span>
                    <span className="text-sm font-bold text-slate-700 font-mono">
                      ₦{course.price_ngn.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-amber-700 uppercase flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> NIC Member Rate
                    </span>
                    <span className="text-xl font-bold text-amber-600 font-mono">
                      ₦{course.member_price_ngn.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-4">
                <Button 
                  onClick={() => openCheckout(course)}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Enrol & Buy Micro-Credential</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Checkout Modal (Public Access - Name & Email) */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => { if (!open) setSelectedCourse(null) }}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-bold text-[10px]">
                CPD CHECKOUT
              </Badge>
              {selectedCourse && (
                <span className="text-xs text-slate-500 font-mono font-bold">
                  +{selectedCourse.cpd_points} CPD Points
                </span>
              )}
            </div>
            <DialogTitle className="text-xl font-serif font-bold text-slate-900 leading-snug">
              {selectedCourse?.title.replace('NIC CPD Micro-Credential: ', '')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Enter your Name & Email below to complete instant enrolment via Paystack. Open to all practitioners!
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4 py-2">
              
              {/* Name Input */}
              <div className="space-y-1">
                <Label htmlFor="checkout-name" className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="checkout-name"
                  type="text"
                  placeholder="e.g. Florence Sunmola"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <Label htmlFor="checkout-email" className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="e.g. florence@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-sm"
                />
                <p className="text-[11px] text-slate-400">Your study handbook & official certificate will be delivered to this email.</p>
              </div>

              {/* Member Discount Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Are you an active NIC Member?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMember(!isMember)}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isMember ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isMember ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isMember && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <Label htmlFor="checkout-nicid" className="text-[11px] font-semibold text-slate-600">
                      NIC Membership ID (Optional)
                    </Label>
                    <Input
                      id="checkout-nicid"
                      type="text"
                      placeholder="e.g. NIC/MEM/2026/1042"
                      value={nicId}
                      onChange={(e) => setNicId(e.target.value)}
                      className="bg-white text-xs h-8"
                    />
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Member discount applied! You save ₦{(selectedCourse.price_ngn - selectedCourse.member_price_ngn).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Price Calculation Box */}
              <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Total Payable</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    ₦{(isMember ? selectedCourse.member_price_ngn : selectedCourse.price_ngn).toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="border-amber-400/30 text-amber-300 bg-amber-500/10 text-[10px]">
                  Paystack Secured
                </Badge>
              </div>

            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedCourse(null)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaystackCheckout}
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting Paystack...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₦{(selectedCourse ? (isMember ? selectedCourse.member_price_ngn : selectedCourse.price_ngn) : 0).toLocaleString()} with Paystack</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

