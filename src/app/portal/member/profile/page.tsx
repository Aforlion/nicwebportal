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
    Camera
} from "lucide-react"

export default function MemberProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        fullName: "Grace Obi",
        email: "grace.obi@example.com",
        phone: "08034753055",
        address: "Suit S9, 2nd Floor, Ocean Center, Gudu District, FCT, Abuja",
        dateOfBirth: "1990-05-15",
        gender: "female",
        qualification: "HCA Certificate, BSc Nursing",
        experience: "5",
        membershipCategory: "full",
        memberID: "NIC-MEM-5502",
        joinedDate: "March 2024",
        expiryDate: "March 30, 2025",
        status: "Active"
    })

    const handleSave = () => {
        // TODO: Save to database
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
        // TODO: Reset to original data
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
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
                        <Button onClick={handleSave} className="bg-primary">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline">
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
                                    GO
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90">
                                        <Camera className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-secondary">{profileData.fullName}</h2>
                                <p className="text-sm text-muted-foreground">{profileData.memberID}</p>
                            </div>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                {profileData.status}
                            </Badge>
                            <div className="w-full pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium">Full Member (MNIC)</span>
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
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    disabled={!isEditing}
                                />
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
                                    onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Membership History</CardTitle>
                    <CardDescription>Your membership timeline and activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 pb-4 border-b">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-secondary">Membership Activated</p>
                                <p className="text-sm text-muted-foreground">March 15, 2024</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 pb-4 border-b">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-5 w-5 text-accent" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-secondary">Upgraded to Full Member</p>
                                <p className="text-sm text-muted-foreground">March 15, 2024</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Save className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-secondary">Annual Dues Paid</p>
                                <p className="text-sm text-muted-foreground">March 15, 2024 - ₦25,000</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
