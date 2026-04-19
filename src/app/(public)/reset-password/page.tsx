"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const supabase = createClient()
        let timeoutId: NodeJS.Timeout

        async function verifySession() {
            try {
                // 1. Check current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                
                if (session) {
                    console.log("[ResetPassword] Session detected via getSession")
                    setVerifying(false)
                    return
                }

                // 2. Fallback: Manual hash parsing (Implicit Grant)
                // This is needed if the client hasn't processed the hash yet
                const hash = window.location.hash
                if (hash && hash.includes('access_token=')) {
                    console.log("[ResetPassword] Access token found in hash, attempting manual setSession")
                    const params = new URLSearchParams(hash.substring(1))
                    const access_token = params.get('access_token')
                    const refresh_token = params.get('refresh_token')

                    if (access_token) {
                        const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token: refresh_token || "",
                        })
                        
                        if (setSessionData.session) {
                            console.log("[ResetPassword] Session established via manual setSession")
                            setVerifying(false)
                            return
                        }
                    }
                }

                if (sessionError) {
                    console.error("[ResetPassword] Session check error:", sessionError)
                }
            } catch (err: any) {
                console.error("[ResetPassword] Unexpected error during verification:", err)
            }
        }

        // 3. Listen for auth state changes (covers race conditions)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[ResetPassword] Auth event: ${event}`)
            if (session) {
                setVerifying(false)
                setError("") // Clear any previous missing session error
            }
        })

        verifySession()

        // 4. Safety timeout: if no session found after 3 seconds, show error
        timeoutId = setTimeout(() => {
            setVerifying(prev => {
                if (prev) {
                    setError("Auth session missing! Your link may have expired or is invalid. Please request a new password reset link.")
                }
                return false
            })
        }, 3000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeoutId)
        }
    }, [])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()
            
            // 1. Re-verify session before update
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                throw new Error("Auth session missing! Please refresh and try again or request a new link.")
            }

            // 2. Wrap update in a 10s timeout to prevent hanging
            const updatePromise = supabase.auth.updateUser({
                password: password
            })

            const timeoutPromise = new Promise<{ error: any }>((_, reject) => 
                setTimeout(() => reject(new Error("Update service timed out. Please try again or check your internet connection.")), 10000)
            )

            const { error: updateError } = await Promise.race([updatePromise, timeoutPromise]) as { error: any }

            if (updateError) {
                throw new Error(updateError.message)
            }

            setSuccess(true)
            // Redirect to login after a short delay
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (error: any) {
            console.error("[ResetPassword] Final error:", error)
            setError(error.message || "Failed to update password. Your link may have expired.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
            <CardHeader className="space-y-4 text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center p-3">
                    <Image src="/logo.jpg" alt="NIC Logo" width={64} height={64} className="h-full w-auto" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-serif">Create New Password</CardTitle>
                    <CardDescription>
                        Please enter a secure password for your NIC account.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="space-y-6 text-center py-4">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold text-slate-900">Password Updated!</p>
                            <p className="text-slate-600">
                                Your password has been successfully reset. Redirecting you to login...
                            </p>
                        </div>
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                <Lock className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                <Lock className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary h-11 text-base font-semibold mt-2"
                            disabled={loading || verifying}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : verifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying session...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50/50">
            <Suspense fallback={
                <Card className="w-full max-w-md p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-muted-foreground">Preparing reset form...</p>
                </Card>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
