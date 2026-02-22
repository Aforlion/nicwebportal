"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Edit,
    Save,
    X,
    Camera,
    Loader2
} from "lucide-react"
import { updateMemberProfile } from "@/actions/member/profile"
import { toast } from "sonner"

interface MemberProfileClientProps {
    initialData: {
        fullName: string
        email: string
        phone: string
        address: string
        dateOfBirth: string
        gender: string
        qualification: string
        experience: string
        membershipCategory: string
        memberID: string
        joinedDate: string
        expiryDate: string
        status: string
    }
}

export default function MemberProfileClient({ initialData }: MemberProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [profileData, setProfileData] = useState(initialData)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateMemberProfile(profileData)
            if (result.success) {
                toast.success("Profile updated successfully")
                setIsEditing(false)
            } else {
                toast.error(result.error || "Failed to update profile")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setProfileData(initialData)
        setIsEditing(false)
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">My Profile</h1>
                    <p className="text-muted-foreground">View and manage your membership information</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-primary">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="bg-primary" disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Profile Photo & Status */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-4xl">
                                    {getInitials(profileData.fullName)}
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 shadow-lg">
                                        <Camera className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-secondary">{profileData.fullName}</h2>
                                <p className="text-sm text-muted-foreground">{profileData.memberID}</p>
                            </div>
                            <Badge className={`${profileData.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'} border-none`}>
                                {profileData.status.toUpperCase()}
                            </Badge>
                            <div className="w-full pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium capitalize">{profileData.membershipCategory} Member</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Joined:</span>
                                    <span className="font-medium">{profileData.joinedDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Expires:</span>
                                    <span className="font-medium">{profileData.expiryDate}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Your contact and professional details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">
                                    <User className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    <Mail className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    disabled={true} // Email should usually be read-only as it's the identifier
                                    className="bg-muted/50"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Contact support to change your email</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    <Phone className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">
                                    <Calendar className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                    Date of Birth
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={profileData.dateOfBirth}
                                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">
                                    <MapPin className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    value={profileData.gender}
                                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                    disabled={!isEditing}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">
                                    <Briefcase className="inline h-4 w-4 mr-2 text-muted-foreground" />
                                    Years of Experience
                                </Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={profileData.experience}
                                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="qualification">Qualifications</Label>
                                <Input
                                    id="qualification"
                                    value={profileData.qualification}
                                    placeholder="e.g. HCA Certificate, BSc Nursing"
                                    onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
