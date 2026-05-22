"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { loginAction } from "@/lib/actions/auth"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/portal/member'
    const expired = searchParams.get('expired')

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (expired === 'true') {
            toast.error("Session Expired", {
                description: "You have been logged out due to inactivity."
            })
            // Remove the param from the URL visually without triggering a reload
            router.replace('/login', { scroll: false })
        }
    }, [expired, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("email", email)
            formData.append("password", password)

            const result = await loginAction(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            // Redirect based on role and category
            const adminRoles = ['admin', 'super_admin', 'registry_officer', 'inspector', 'auditor', 'instructor']
            const isStudent = result.role === 'student' || result.category === 'student'
            const isMember = result.role === 'member' || 
                           ['professional', 'full', 'associate'].includes(result.category || '')

            if (result.role && adminRoles.includes(result.role)) {
                router.push('/admin')
            } else if (isStudent) {
                router.push('/portal/student')
            } else if (isMember) {
                router.push('/portal/member')
            } else {
                router.push(redirect)
            }
            router.refresh()
        } catch (error: any) {
            setError(error.message || "Failed to login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center p-3">
                        <Image src="/logo.jpg" alt="NIC Logo" width={64} height={64} className="h-full w-auto" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to access your NIC portal
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                <Lock className="inline h-4 w-4 mr-2" />
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>



                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Not a member yet? </span>
                            <Link href={`/join${redirect && redirect !== '/portal/member' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-primary hover:underline font-medium">
                                Become a Member
                            </Link>
                        </div>
                        <div className="text-center">
                            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                                Forgot password?
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Image src="/logo.jpg" alt="Logo" width={48} height={48} className="mx-auto mb-4 animate-pulse rounded" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
