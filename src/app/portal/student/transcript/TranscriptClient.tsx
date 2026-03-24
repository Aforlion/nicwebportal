'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, BookOpen, CheckCircle2, Clock, Mail, User as UserIcon } from "lucide-react"
import Image from "next/image"

interface TranscriptProps {
    data: {
        enrollments: any[]
        submissions: any[]
        user: {
            full_name: string
            email: string
        }
    }
}

export default function TranscriptClient({ data }: TranscriptProps) {
    const { enrollments, submissions, user } = data

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header / Actions */}
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Academic Transcript</h1>
                    <p className="text-muted-foreground">Official record of your learning progress and achievements.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print Transcript
                    </Button>
                </div>
            </div>

            {/* Transcript Document */}
            <Card className="border-t-8 border-t-secondary shadow-lg print:shadow-none print:border-none relative overflow-hidden">
                {/* Background Watermark Coat of Arms */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                    <Image src="/coat-of-arm.png" alt="" width={600} height={600} />
                </div>

                <CardHeader className="border-b pb-8 relative z-10 bg-white/50 backdrop-blur-[1px]">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-4">
                                <Image src="/logo.jpg" alt="NIC" width={48} height={48} className="rounded-lg shadow-sm" />
                                <span className="text-2xl font-black tracking-tighter text-slate-900">
                                    National Institute Content
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Official Academic Record</h2>
                        </div>
                        <div className="text-right text-sm text-muted-foreground space-y-1">
                            <p>Date Issued: {new Date().toLocaleDateString()}</p>
                            <p>Verification Code: TR-{user.full_name?.substring(0, 3).toUpperCase()}-{new Date().getTime().toString().slice(-6)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <UserIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student Name</p>
                                    <p className="font-bold text-slate-800 text-lg">{user.full_name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</p>
                                    <p className="font-bold text-slate-800 text-lg">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-10 space-y-12">
                    {/* Courses Table */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-primary pl-4">
                            Course Enrollment History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-y border-slate-100">
                                        <th className="text-left p-4">Course Title</th>
                                        <th className="text-left p-4">Enrolled Date</th>
                                        <th className="text-center p-4">Status</th>
                                        <th className="text-center p-4">Progress</th>
                                        <th className="text-right p-4">Completion Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-800">{enrollment.courses?.title}</td>
                                            <td className="p-4 text-slate-500">{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-center">
                                                {enrollment.status === 'completed' ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200">In Progress</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-mono font-bold">{Math.round(enrollment.progress)}%</td>
                                            <td className="p-4 text-right text-slate-500">
                                                {enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : '---'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Assessment Scores */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-primary pl-4">
                            Detailed Assessment Performance
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {submissions.map((sub, idx) => (
                                <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter truncate" title={sub.assessment?.title}>
                                            {sub.assessment?.title}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-slate-900">{sub.score !== null ? `${sub.score}%` : '---'}</p>
                                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
                                            {sub.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <div className="p-10 bg-slate-900 text-white rounded-b-lg flex justify-between items-center print:bg-white print:text-slate-900 print:border-t">
                    <div className="space-y-1">
                        <p className="text-lg font-bold">National Institute Content Registry</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Valid academic record - NIC/REG/2024</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs italic text-slate-400">Electronic verification is recommended for all NIC transcripts.</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
