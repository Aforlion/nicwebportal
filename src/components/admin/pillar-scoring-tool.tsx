"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Users, 
  Heart, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Construction,
  Save,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { submitInspectionAction } from "@/actions/admin/inspection-scoring"
import { useRouter } from "next/navigation"

const PILLARS = [
  { name: "Governance", icon: Building2, desc: "Leadership, policies, and organizational structure." },
  { name: "Staffing", icon: Users, desc: "Qualification levels, ratios, and training compliance." },
  { name: "Care Practice", icon: Heart, desc: "Personalized care plans and patient dignity." },
  { name: "Environment", icon: Construction, desc: "Facility safety, risk assessment, and cleanliness." },
  { name: "Safeguarding", icon: ShieldCheck, desc: "Vulnerable adult protection and reporting." },
  { name: "Documentation", icon: FileText, desc: "Record keeping, audits, and quality assurance." },
]

export function PillarScoringTool({ facilityId, inspectorId }: { facilityId: string, inspectorId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [error, setError] = useState("")
  
  const [scores, setScores] = useState<any>(
    PILLARS.reduce((acc, p) => ({ ...acc, [p.name]: { score: 70, comments: "" } }), {})
  )

  const handleScoreChange = (pillar: string, value: number) => {
    setScores((prev: any) => ({
      ...prev,
      [pillar]: { ...prev[pillar], score: Math.min(100, Math.max(0, value)) }
    }))
  }

  const handleCommentChange = (pillar: string, value: string) => {
    setScores((prev: any) => ({
      ...prev,
      [pillar]: { ...prev[pillar], comments: value }
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    
    const scoreData = PILLARS.map(p => ({
      pillar_name: p.name,
      score: scores[p.name].score,
      comments: scores[p.name].comments
    }))

    const result = await submitInspectionAction(facilityId, inspectorId, scoreData)
    
    if (result.success) {
      setSuccess(result)
    } else {
      setError(result.error || "Failed to submit inspection")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/20 text-center py-12">
        <CardContent>
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl text-emerald-900 mb-2">Inspection Complete!</CardTitle>
          <div className="space-y-1 mb-8">
             <p className="text-emerald-700 text-lg">Result: <strong>Grade {success.grade}</strong></p>
             <p className="text-emerald-600 text-sm">Accreditation Level {success.accreditationLevel} granted.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/admin/inspections')}>Return to List</Button>
            <Button variant="outline">Print Certificate</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPillar = PILLARS[step]
  const Icon = currentPillar.icon

  const avgScore = (Object.values(scores) as any[]).reduce((acc: any, curr: any) => acc + curr.score, 0) / PILLARS.length

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                   <CardTitle className="text-lg">Assessment: {currentPillar.name}</CardTitle>
                   <CardDescription className="text-xs">{currentPillar.desc}</CardDescription>
                </div>
             </div>
             <span className="text-xs font-bold text-muted-foreground">Pillar {step + 1} of 6</span>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Performance Score (%)</Label>
                  <span className="text-2xl font-black text-primary">{scores[currentPillar.name].score}%</span>
               </div>
               <Input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={scores[currentPillar.name].score} 
                 onChange={(e) => handleScoreChange(currentPillar.name, parseInt(e.target.value))}
                 className="h-2 bg-muted accent-primary cursor-pointer w-full p-0 border-none"
               />
               <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                  <span>Critical Fail</span>
                  <span>Minimum Pass (60%)</span>
                  <span>Excellence</span>
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-sm font-bold">Observations & Comments</Label>
               <Textarea 
                 placeholder={`Note any issues or highlights regarding ${currentPillar.name.toLowerCase()}...`}
                 className="min-h-[150px]"
                 value={scores[currentPillar.name].comments}
                 onChange={(e) => handleCommentChange(currentPillar.name, e.target.value)}
               />
            </div>

            <div className="flex justify-between pt-4 border-t">
               <Button variant="outline" onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
               </Button>
               {step < 5 ? (
                 <Button onClick={() => setStep(s => Math.min(5, s+1))}>
                    Next Pillar <ChevronRight className="ml-2 h-4 w-4" />
                 </Button>
               ) : (
                 <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Finalize Inspection"}
                 </Button>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle className="text-sm">Real-time Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="text-center py-4 border-b">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Projected Average</p>
                  <p className="text-3xl font-black text-secondary">{Math.round(avgScore)}%</p>
                  <Badge className={`mt-2 ${avgScore >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'} border-none`}>
                    {avgScore >= 90 ? 'Grade A (Advanced)' : avgScore >= 75 ? 'Grade B (Standard)' : avgScore >= 60 ? 'Grade C (Basic)' : 'FAIL'}
                  </Badge>
               </div>
               <div className="space-y-3">
                  {PILLARS.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                       <span className={`font-medium ${step === i ? 'text-primary' : 'text-muted-foreground'}`}>{p.name}</span>
                       <div className="flex items-center gap-2">
                          <Progress value={scores[p.name].score} className="w-16 h-1.5" />
                          <span className="font-bold">{scores[p.name].score}%</span>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Inspection Protocol
               </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] text-amber-700 space-y-2 leading-relaxed">
               <p>• Ensure all scores are backed by physical evidence or documentation.</p>
               <p>• Comments are mandatory for any score below 60%.</p>
               <p>• Submitting this report will immediately update the facility's public status and license date.</p>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
