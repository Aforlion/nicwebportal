"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users,
    Mail,
    Phone,
    ShieldCheck,
    MoreVertical,
    UserPlus,
    XCircle
} from "lucide-react"

export default function StaffDirectoryPage() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Get facility
            const { data: facility } = await supabase
                .from('facilities')
                .select('id')
                .eq('owner_id', user?.id)
                .single()

            if (facility) {
                const { data } = await supabase
                    .from('facility_staff')
                    .select(`
                        id,
                        position,
                        is_active,
                        created_at,
                        memberships (
                            id,
                            nic_id,
                            member_id,
                            compliance_status,
                            profiles (
                                full_name,
                                email,
                                phone
                            )
                        )
                    `)
                    .eq('facility_id', facility.id)
                    .eq('is_active', true)

                setStaff(data || [])
            }
        } catch (err) {
            console.error("Error fetching staff:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnlink = async (staffId: string) => {
        if (!confirm("Are you sure you want to remove this caregiver from your institution?")) return

        try {
            const { error } = await supabase
                .from('facility_staff')
                .update({ is_active: false, end_date: new Date().toISOString().split('T')[0] })
                .eq('id', staffId)

            if (error) throw error
            fetchStaff()
        } catch (err) {
            console.error("Error unlinking staff:", err)
            alert("Failed to remove staff.")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Institutional Staff Directory</h1>
                    <p className="text-muted-foreground">Manage and verify your registered caregivers.</p>
                </div>
                <Button className="bg-primary" asChild>
                    <a href="/portal/facility/link">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New Staff
                    </a>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Linked Caregivers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                                    <th className="p-4">Caregiver</th>
                                    <th className="p-4">Membership ID</th>
                                    <th className="p-4">Registry Status</th>
                                    <th className="p-4">Position</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading staff list...</td></tr>
                                ) : staff.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                            <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                            <p>No caregivers linked yet.</p>
                                            <Button variant="link" asChild><a href="/portal/facility/link">Link your first staff member</a></Button>
                                        </td>
                                    </tr>
                                ) : staff.map((member) => (
                                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                    {member.memberships.profiles.full_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-secondary">{member.memberships.profiles.full_name}</p>
                                                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {member.memberships.profiles.email}</span>
                                                        <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {member.memberships.profiles.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                {member.memberships.nic_id || member.memberships.member_id}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={
                                                member.memberships.compliance_status === 'compliant' ? 'bg-emerald-500' : 'bg-red-500'
                                            }>
                                                {member.memberships.compliance_status?.toUpperCase() || 'COMPLIANT'}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-medium">{member.position}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" title="Inquire / Notes">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() => handleUnlink(member.id)}
                                                    title="Remove from Institution"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 rounded-2xl border bg-emerald-50 border-emerald-100">
                <div className="flex gap-4">
                    <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-emerald-900">NIC Institutional Registry Assurance</h4>
                        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                            Linking caregivers to your facility ensures that parents and clinical partners can verify that your staff are indeed verified professionals by NIC. If a staff's registration is revoked or suspended at the national level, it will reflect here immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
