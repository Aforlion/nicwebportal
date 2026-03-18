"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    User, Mail, Phone, MapPin, Calendar,
    Briefcase, Edit, Save, X, Camera, Loader2
} from "lucide-react"
import { updateMemberProfile } from "@/actions/member/profile"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"

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
        photoUrl?: string
    }
}

export default function MemberProfileClient({ initialData }: MemberProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [profileData, setProfileData] = useState(initialData)
    const [photoUrl, setPhotoUrl] = useState<string | null>(initialData.photoUrl || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

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
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setProfileData(initialData)
        setIsEditing(false)
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB.")
            return
        }

        setIsUploadingPhoto(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to upload a photo.")
                return
            }

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/avatar.${fileExt}`

            // Upload to Supabase Storage bucket: avatars
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                console.error("Photo upload error:", uploadError)
                toast.error("Failed to upload photo. Please try again.")
                return
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update Profiles table (avatar_url)
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (profileUpdateError) {
                console.error("Profile avatar_url update error:", profileUpdateError)
                // Continue anyway as we'll try membership next
            }

            // Update Memberships table (photo_url)
            const { error: membershipUpdateError } = await supabase
                .from('memberships')
                .update({ photo_url: publicUrl })
                .eq('user_id', user.id)

            if (membershipUpdateError) {
                console.error("Membership photo_url update error:", membershipUpdateError)
                toast.error("Photo uploaded but failed to save to membership. Please contact support.")
                return
            }

            setPhotoUrl(publicUrl)
            toast.success("Profile photo updated successfully!")
        } catch (err) {
            console.error("Unexpected error during photo upload:", err)
            toast.error("An unexpected error occurred.")
        } finally {
            setIsUploadingPhoto(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">My Profile</h1>
                    <p className="text-muted-foreground">View and manage your membership information</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-primary">
                        <Edit className="mr-2 h-4 w-4" />Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="bg-primary" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                            <X className="mr-2 h-4 w-4" />Cancel
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Profile Photo & Status */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Avatar */}
                            <div className="relative">
                                {photoUrl ? (
                                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20">
                                        <Image
                                            src={photoUrl}
                                            alt={profileData.fullName}
                                            width={128}
                                            height={128}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-32 w-32 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-4xl">
                                        {getInitials(profileData.fullName)}
                                    </div>
                                )}

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />

                                {/* Camera button — always visible */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    title="Change profile photo"
                                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 shadow-lg transition-colors disabled:opacity-60"
                                >
                                    {isUploadingPhoto
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <Camera className="h-5 w-5" />
                                    }
                                </button>
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
                                    <User className="inline h-4 w-4 mr-2 text-muted-foreground" />Full Name
                                </Label>
                                <Input id="fullName" value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    disabled={!isEditing} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    <Mail className="inline h-4 w-4 mr-2 text-muted-foreground" />Email Address
                                </Label>
                                <Input id="email" type="email" value={profileData.email} disabled className="bg-muted/50" />
                                <p className="text-[10px] text-muted-foreground italic">Contact support to change your email</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    <Phone className="inline h-4 w-4 mr-2 text-muted-foreground" />Phone Number
                                </Label>
                                <Input id="phone" value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    disabled={!isEditing} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">
                                    <Calendar className="inline h-4 w-4 mr-2 text-muted-foreground" />Date of Birth
                                </Label>
                                <Input id="dateOfBirth" type="date" value={profileData.dateOfBirth}
                                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                    disabled={!isEditing} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">
                                    <MapPin className="inline h-4 w-4 mr-2 text-muted-foreground" />Address
                                </Label>
                                <Input id="address" value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    disabled={!isEditing} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <select
                                    value={profileData.gender}
                                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                    disabled={!isEditing}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">
                                    <Briefcase className="inline h-4 w-4 mr-2 text-muted-foreground" />Years of Experience
                                </Label>
                                <Input id="experience" type="number" value={profileData.experience}
                                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                    disabled={!isEditing} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="qualification">Qualifications</Label>
                                <Input id="qualification" value={profileData.qualification}
                                    placeholder="e.g. HCA Certificate, BSc Nursing"
                                    onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                                    disabled={!isEditing} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
