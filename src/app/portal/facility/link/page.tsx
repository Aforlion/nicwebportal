"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Search,
    UserPlus,
    ShieldCheck,
    AlertCircle,
    Loader2,
    CheckCircle2
} from "lucide-react"

export default function StaffLinkingPage() {
    const [id, setId] = useState("")
    const [loading, setLoading] = useState(false)
    const [caregiver, setCaregiver] = useState<any>(null)
    const [error, setError] = useState("")
    const [linking, setLinking] = useState(false)
    const [success, setSuccess] = useState(false)

    const supabase = createClient()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setCaregiver(null)
        setError("")
        setSuccess(false)

        try {
            const { data, error } = await supabase
                .from('memberships')
                .select('*, profiles(full_name, email)')
                .or(`nic_id.eq."${id}",member_id.eq."${id}"`)
                .filter('is_active', 'eq', true)
                .single()

            if (error) {
                if (error.code === 'PGRST116') setError("No active caregiver found with this ID.")
                else throw error
            }

            if (data) {
                setCaregiver(data)
            }
        } catch (err) {
            console.error("Staff lookup error:", err)
            setError("Failed to search for caregiver. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleLinkStaff = async () => {
        if (!caregiver) return
        setLinking(true)
        setError("")

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Get facility for this user
            const { data: facility } = await supabase
                .from('facilities')
                .select('id')
                .eq('owner_id', user?.id)
                .single()

            if (!facility) throw new Error("No facility found for your account.")

            const { error: linkError } = await supabase
                .from('facility_staff')
                .insert({
                    facility_id: facility.id,
                    membership_id: caregiver.id,
                    position: 'Caregiver', // Default
                    added_by: user?.id,
                    is_active: true
                })

            if (linkError) {
                if (linkError.code === '23505') throw new Error("This caregiver is already linked to your facility.")
                throw linkError
            }

            setSuccess(true)
            setCaregiver(null)
            setId("")
        } catch (err: any) {
            console.error("Staff linking error:", err)
            setError(err.message || "Failed to link caregiver.")
        } finally {
            setLinking(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Link Staff Caregiver</h1>
                <p className="text-muted-foreground">Add verified NIC caregivers to your facility's registered staff list.</p>
            </div>

            <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Caregiver Search
                    </CardTitle>
                    <CardDescription>Search by NIC Membership ID to verify and link a caregiver.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="e.g. NIC-MEM-5502"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="h-12 text-lg uppercase"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="h-12 px-8 bg-primary" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Lookup"}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-100 p-4 text-emerald-800 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <p className="text-sm font-medium">Caregiver successfully linked to your facility!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {caregiver && (
                <Card className="border-emerald-200 bg-emerald-50/30 animate-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle className="text-emerald-900 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            Verified Record Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center font-bold text-2xl text-slate-500">
                                {caregiver.profiles.full_name[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-secondary leading-none">{caregiver.profiles.full_name}</h3>
                                <p className="text-emerald-600 font-bold text-sm mt-1 uppercase tracking-widest">{caregiver.compliance_status || 'COMPLIANT'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-lg border text-sm">
                                <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider mb-1">NIC ID</p>
                                <p className="font-mono text-secondary">{caregiver.nic_id || caregiver.member_id}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border text-sm">
                                <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider mb-1">Category</p>
                                <p className="capitalize text-secondary">{caregiver.category}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-emerald-100">
                            <Button
                                className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleLinkStaff}
                                disabled={linking}
                            >
                                {linking ? "Linking Staff..." : "Link to My Facility"}
                                <UserPlus className="ml-2 h-5 w-5" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                                By linking this caregiver, you confirm they are currently in your employment.
                                Their profile will show your facility as their current employer.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
