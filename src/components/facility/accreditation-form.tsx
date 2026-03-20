"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea"
import { 
  Building2, 
  Users, 
  Heart, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Construction
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Governance", icon: Building2 },
  { id: 2, title: "Staffing", icon: Users },
  { id: 3, title: "Care Practice", icon: Heart },
  { id: 4, title: "Safety", icon: Construction },
  { id: 5, title: "Safeguarding", icon: ShieldCheck },
  { id: 6, title: "Documentation", icon: FileText },
]

export function AccreditationForm({ facilityId }: { facilityId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<any>({
    // Step 1: Governance
    legal_status: "",
    org_structure_link: "",
    governance_policy: false,
    
    // Step 2: Staffing
    staff_ratio: "",
    training_records_link: "",
    staff_background_check: false,
    
    // Step 3: Care Practice
    care_plan_process: "",
    dignity_policy: false,
    
    // Step 4: Safety
    risk_assessment_link: "",
    fire_safety_date: "",
    ipc_policy: false,
    
    // Step 5: Safeguarding
    safeguarding_officer: "",
    whistleblowing_policy: false,
    
    // Step 6: Documentation
    audit_frequency: "",
    quality_assurance_link: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    const val = type === 'checkbox' ? (e.target as any).checked : value
    setFormData((prev: any) => ({ ...prev, [name]: val }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 6))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    const supabase = createClient()
    
    try {
      // In a real implementation, we would save this to an 'accreditation_applications' table
      // and update the 'facilities' status to 'pending_accreditation'.
      // For now, we'll simulate success.
      
      const { error: updateError } = await supabase
        .from('facilities')
        .update({ 
          status: 'pending_inspection',
          last_accreditation_attempt: new Date().toISOString()
        })
        .eq('id', facilityId)

      if (updateError) throw updateError
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/20 text-center py-12">
        <CardContent>
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-emerald-900 mb-2">Application Submitted!</CardTitle>
          <CardDescription className="text-emerald-700 mb-6">
            Your accreditation application has been received. An NIC inspector will be assigned to review your documentation and schedule a site visit.
          </CardDescription>
          <Button onClick={() => router.push('/portal/facility')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    )
  }

  const CurrentIcon = STEPS[step - 1].icon

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-8">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative">
            <div className={`z-10 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              step >= s.id ? 'bg-primary border-primary text-white' : 'bg-white border-muted text-muted-foreground'
            }`}>
              {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
            </div>
            <span className={`text-[10px] font-bold uppercase hidden md:block ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
              {s.title}
            </span>
            {s.id < 6 && (
              <div className={`absolute left-1/2 top-4 w-full h-0.5 -z-0 ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-white">
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Step {step}: {STEPS[step-1].title}</CardTitle>
              <CardDescription>Comprehensive assessment of {STEPS[step-1].title.toLowerCase()} standards.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2 border border-destructive/20 font-medium">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal_status">Legal Entity Status (CAC/Trust/etc)</Label>
                <Input name="legal_status" placeholder="e.g. Private Limited Company" value={formData.legal_status} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org_structure_link">Organizational Structure (Link to PDF/Cloud)</Label>
                <Input name="org_structure_link" placeholder="https://..." value={formData.org_structure_link} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="governance_policy" name="governance_policy" checked={formData.governance_policy} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="governance_policy" className="text-sm font-medium">We have a written Governance & Management Policy</Label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff_ratio">Current Caregiver-to-Patient Ratio</Label>
                <Input name="staff_ratio" placeholder="e.g. 1:5" value={formData.staff_ratio} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="training_records_link">Staff Training Matrix (Link)</Label>
                <Input name="training_records_link" placeholder="https://..." value={formData.training_records_link} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="staff_background_check" name="staff_background_check" checked={formData.staff_background_check} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="staff_background_check" className="text-sm font-medium">All clinical staff have verified background checks & NIC IDs</Label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="care_plan_process">Describe your Individualized Care Planning process</Label>
                <Textarea name="care_plan_process" placeholder="How are care plans created and reviewed?" value={formData.care_plan_process} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="dignity_policy" name="dignity_policy" checked={formData.dignity_policy} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="dignity_policy" className="text-sm font-medium">We have a formal 'Dignity in Care' Policy</Label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="risk_assessment_link">Facility Risk Assessment Registry (Link)</Label>
                <Input name="risk_assessment_link" placeholder="https://..." value={formData.risk_assessment_link} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fire_safety_date">Last Fire Safety Equipment Inspection Date</Label>
                <Input name="fire_safety_date" type="date" value={formData.fire_safety_date} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="ipc_policy" name="ipc_policy" checked={formData.ipc_policy} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="ipc_policy" className="text-sm font-medium">Infection Prevention & Control (IPC) protocols are active</Label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="safeguarding_officer">Designated Safeguarding Lead (Name)</Label>
                <Input name="safeguarding_officer" placeholder="Enter name of the officer" value={formData.safeguarding_officer} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="whistleblowing_policy" name="whistleblowing_policy" checked={formData.whistleblowing_policy} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="whistleblowing_policy" className="text-sm font-medium">Whistleblowing and Complaint procedures are displayed publicly</Label>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audit_frequency">Internal Quality Audit Frequency</Label>
                <Input name="audit_frequency" placeholder="e.g. Quarterly" value={formData.audit_frequency} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality_assurance_link">Latest Internal Quality Report (Link)</Label>
                <Input name="quality_assurance_link" placeholder="https://..." value={formData.quality_assurance_link} onChange={handleChange} />
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                By submitting this final step, you authorize NIC to verify all uploaded documents and conduct an unannounced site inspection.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={prevStep} disabled={step === 1 || loading}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {step < 6 ? (
              <Button onClick={nextStep} disabled={loading}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-white font-bold">
                {loading ? "Submitting..." : "Submit Accreditation Application"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
