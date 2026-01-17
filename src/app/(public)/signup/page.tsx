"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()

            // Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // Create profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        role: 'member', // Default role
                    })

                if (profileError) throw profileError

                setSuccess(true)
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (error: any) {
            setError(error.message || "Failed to create account")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary">Account Created!</h2>
                        <p className="text-muted-foreground">
                            Your account has been created successfully. Redirecting to login...
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Create Account</CardTitle>
                        <CardDescription>
                            Join the National Institute of Caregivers
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName">
                                <User className="inline h-4 w-4 mr-2" />
                                Full Name
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                <Phone className="inline h-4 w-4 mr-2" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+234 xxx xxx xxxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                <Lock className="inline h-4 w-4 mr-2" />
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
