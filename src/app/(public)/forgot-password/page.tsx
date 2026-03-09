"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { requestPasswordResetAction } from "@/actions/auth/request-reset"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { success, error: resetError } = await requestPasswordResetAction(email)
            if (!success) {
                setError(resetError || "Failed to send reset email")
                return
            }
            setSuccess(true)
        } catch (error: any) {
            setError("An unexpected error occurred. Please try again.")
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
                        <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
                        <CardDescription>
                            {success
                                ? "Check your email for the reset link"
                                : "Enter your email to receive a password reset link"}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-600">
                                    We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    The link will expire in 1 hour. Please check your spam folder if you don't see it.
                                </p>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/login">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Link>
                            </Button>
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
                                <Label htmlFor="email">
                                    <Mail className="inline h-4 w-4 mr-2 text-muted-foreground" />
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
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary h-11 text-base font-semibold"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <div className="text-center pt-2">
                                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
