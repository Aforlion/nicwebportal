import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'Page Not Found (404) | National Institute of Caregivers Nigeria',
  description: 'The page you are looking for does not exist or has been moved.',
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-6">
          Error 404
        </div>

        <h1 className="text-6xl sm:text-8xl font-serif font-black tracking-tight text-white mb-4">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-4">
          Page Not Found
        </h2>

        <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
          We couldn&apos;t find the page you were looking for. The link may be broken, or the page has been updated or moved to a new destination.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Button asChild className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 shadow-lg">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white px-6 py-3">
            <Link href="/programs" className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span>Browse Programs</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full sm:w-auto text-slate-400 hover:text-white px-4 py-3">
            <Link href="/contact" className="flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer Minimal Notice */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 relative z-10">
        &copy; {new Date().getFullYear()} National Institute of Caregivers (NIC Nigeria). All rights reserved.
      </footer>
    </div>
  )
}
