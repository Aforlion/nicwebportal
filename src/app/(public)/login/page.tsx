"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, AlertCircle } from "lucide-react"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/portal/member'

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Check if user has a profile and membership
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            // Redirect based on role
            if (profile?.role === 'admin') {
                router.push('/admin/members')
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
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={async () => {
                                const supabase = createClient()
                                await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`
                                    }
                                })
                            }}
                        >
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Google Account
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Not a member yet? </span>
                            <Link href="/join" className="text-primary hover:underline font-medium">
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
