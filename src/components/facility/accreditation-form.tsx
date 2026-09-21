"use client"

import { useState, useRef } from "react"
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
  Construction,
  FileBox,
  Upload,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

const STEPS = [
  { id: 1, title: "Governance", icon: Building2 },
  { id: 2, title: "Staffing", icon: Users },
  { id: 3, title: "Care Practice", icon: Heart },
  { id: 4, title: "Safety", icon: Construction },
  { id: 5, title: "Safeguarding", icon: ShieldCheck },
  { id: 6, title: "Documentation", icon: FileText },
]

// --- Validation Types ---
interface FieldError {
  [fieldName: string]: string
}

interface FormData {
  // Step 1: Governance
  legal_status: string
  org_structure_link: string
  org_structure_hardcopy: boolean
  org_structure_note: string
  governance_policy: boolean

  // Step 2: Staffing
  staff_ratio: string
  training_records_link: string
  training_records_hardcopy: boolean
  training_records_note: string
  staff_background_check: boolean

  // Step 3: Care Practice
  care_plan_process: string
  dignity_policy: boolean

  // Step 4: Safety
  risk_assessment_link: string
  risk_assessment_hardcopy: boolean
  risk_assessment_note: string
  fire_safety_date: string
  ipc_policy: boolean

  // Step 5: Safeguarding
  safeguarding_officer: string
  whistleblowing_policy: boolean

  // Step 6: Documentation
  audit_frequency: string
  quality_assurance_link: string
  quality_assurance_hardcopy: boolean
  quality_assurance_note: string
}

function isValidUrl(str: string): boolean {
  if (!str) return true // empty is handled by required checks
  try {
    new URL(str)
    return true
  } catch {
    // Also accept strings starting with common prefixes
    return /^https?:\/\/.+/i.test(str)
  }
}

// --- Per-step validation ---
function validateStep(step: number, data: FormData): FieldError {
  const errors: FieldError = {}

  switch (step) {
    case 1:
      if (!data.legal_status.trim()) errors.legal_status = "Legal entity status is required."
      if (!data.org_structure_hardcopy && !data.org_structure_link.trim()) {
        errors.org_structure_link = "Provide a link or select 'Hard copy available'."
      }
      if (!data.org_structure_hardcopy && data.org_structure_link.trim() && !isValidUrl(data.org_structure_link)) {
        errors.org_structure_link = "Please enter a valid URL (e.g. https://...)."
      }
      if (data.org_structure_hardcopy && !data.org_structure_note.trim()) {
        errors.org_structure_note = "Please describe the hard copy document."
      }
      if (!data.governance_policy) errors.governance_policy = "You must confirm a written Governance & Management Policy exists."
      break

    case 2:
      if (!data.staff_ratio.trim()) errors.staff_ratio = "Caregiver-to-patient ratio is required."
      if (!data.training_records_hardcopy && !data.training_records_link.trim()) {
        errors.training_records_link = "Provide a link or select 'Hard copy available'."
      }
      if (!data.training_records_hardcopy && data.training_records_link.trim() && !isValidUrl(data.training_records_link)) {
        errors.training_records_link = "Please enter a valid URL (e.g. https://...)."
      }
      if (data.training_records_hardcopy && !data.training_records_note.trim()) {
        errors.training_records_note = "Please describe the hard copy document."
      }
      if (!data.staff_background_check) errors.staff_background_check = "Background check confirmation is required."
      break

    case 3:
      if (!data.care_plan_process.trim()) errors.care_plan_process = "Care planning process description is required."
      if (!data.dignity_policy) errors.dignity_policy = "You must confirm a 'Dignity in Care' Policy exists."
      break

    case 4:
      if (!data.risk_assessment_hardcopy && !data.risk_assessment_link.trim()) {
        errors.risk_assessment_link = "Provide a link or select 'Hard copy available'."
      }
      if (!data.risk_assessment_hardcopy && data.risk_assessment_link.trim() && !isValidUrl(data.risk_assessment_link)) {
        errors.risk_assessment_link = "Please enter a valid URL (e.g. https://...)."
      }
      if (data.risk_assessment_hardcopy && !data.risk_assessment_note.trim()) {
        errors.risk_assessment_note = "Please describe the hard copy document."
      }
      if (!data.fire_safety_date) errors.fire_safety_date = "Last fire safety inspection date is required."
      if (!data.ipc_policy) errors.ipc_policy = "IPC protocol confirmation is required."
      break

    case 5:
      if (!data.safeguarding_officer.trim()) errors.safeguarding_officer = "Safeguarding lead name is required."
      if (!data.whistleblowing_policy) errors.whistleblowing_policy = "Whistleblowing policy confirmation is required."
      break

    case 6:
      if (!data.audit_frequency.trim()) errors.audit_frequency = "Audit frequency is required."
      if (!data.quality_assurance_hardcopy && !data.quality_assurance_link.trim()) {
        errors.quality_assurance_link = "Provide a link or select 'Hard copy available'."
      }
      if (!data.quality_assurance_hardcopy && data.quality_assurance_link.trim() && !isValidUrl(data.quality_assurance_link)) {
        errors.quality_assurance_link = "Please enter a valid URL (e.g. https://...)."
      }
      if (data.quality_assurance_hardcopy && !data.quality_assurance_note.trim()) {
        errors.quality_assurance_note = "Please describe the hard copy document."
      }
      break
  }

  return errors
}

// --- Hard Copy Toggle Component ---
function HardCopyToggle({
  id,
  checked,
  onChange,
  noteValue,
  onNoteChange,
  noteError,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  noteValue: string
  onNoteChange: (value: string) => void
  noteError?: string
}) {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
        <input
          type="checkbox"
          id={`${id}_hardcopy`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <Label htmlFor={`${id}_hardcopy`} className="text-xs font-semibold text-amber-800 cursor-pointer flex items-center gap-1.5">
          <FileBox className="h-3.5 w-3.5" />
          Hard copy available (no digital link)
        </Label>
      </div>
      {checked && (
        <div className="space-y-1 pl-2 border-l-2 border-amber-200">
          <Label htmlFor={`${id}_note`} className="text-xs text-muted-foreground">
            Briefly describe the document and where it can be found during inspection
          </Label>
          <Input
            id={`${id}_note`}
            placeholder="e.g. Filed in admin office, cabinet 3, folder 'Governance'"
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            className={noteError ? "border-destructive" : ""}
          />
          {noteError && <p className="text-xs text-destructive">{noteError}</p>}
        </div>
      )}
    </div>
  )
}

// --- Inline Error Component ---
function FieldErrorMessage({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </p>
  )
}

// --- Direct Document Uploader with Self-Hosted Storage & External Fallback ---
function DirectDocumentUploader({
  facilityId,
  label,
  value,
  onChange,
  error,
  hardcopyChecked,
  onHardcopyChange,
  noteValue,
  onNoteChange,
  noteError,
  id
}: {
  facilityId: string
  label: string
  value: string
  onChange: (val: string) => void
  error?: string
  hardcopyChecked: boolean
  onHardcopyChange: (checked: boolean) => void
  noteValue: string
  onNoteChange: (val: string) => void
  noteError?: string
  id: string
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB")
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = `accreditation/${facilityId}/${Date.now()}_${cleanName}`
      const { error: uploadErr } = await supabase.storage
        .from('member-documents')
        .upload(path, file, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('member-documents')
        .getPublicUrl(path)

      onChange(publicUrl)
      toast.success("Document uploaded directly to NIC Cloud Storage!")
    } catch (err: any) {
      console.error("Upload error:", err)
      toast.error(err.message || "Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label} {!hardcopyChecked && <span className="text-destructive">*</span>}
      </Label>

      {!hardcopyChecked && (
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
          />

          {value ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 truncate">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="truncate">Uploaded to NIC Cloud Storage</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Preview Document
                </a>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-7 text-slate-600 hover:text-slate-900"
                >
                  Replace File
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5 font-semibold text-xs h-10 shadow-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading to NIC Cloud..." : "Upload Document (PDF / DOCX up to 25MB)"}
              </Button>
              <span className="text-xs text-muted-foreground">or</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-slate-600 hover:text-primary h-8"
              >
                {showUrlInput ? "Hide External Link" : "Paste External Cloud Link"}
              </Button>
            </div>
          )}

          {showUrlInput && (
            <div className="pt-2 border-t space-y-1">
              <Input
                name={id}
                placeholder="https://drive.google.com/... or https://..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`text-xs font-mono ${error ? "border-destructive" : ""}`}
              />
            </div>
          )}

          <FieldErrorMessage error={error} />
        </div>
      )}

      <HardCopyToggle
        id={id}
        checked={hardcopyChecked}
        onChange={(checked) => {
          onHardcopyChange(checked)
          if (checked) onChange("")
        }}
        noteValue={noteValue}
        onNoteChange={onNoteChange}
        noteError={noteError}
      />
    </div>
  )
}

export function AccreditationForm({ facilityId }: { facilityId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [attempted, setAttempted] = useState(false) // tracks if user tried to advance
  
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Governance
    legal_status: "",
    org_structure_link: "",
    org_structure_hardcopy: false,
    org_structure_note: "",
    governance_policy: false,
    
    // Step 2: Staffing
    staff_ratio: "",
    training_records_link: "",
    training_records_hardcopy: false,
    training_records_note: "",
    staff_background_check: false,
    
    // Step 3: Care Practice
    care_plan_process: "",
    dignity_policy: false,
    
    // Step 4: Safety
    risk_assessment_link: "",
    risk_assessment_hardcopy: false,
    risk_assessment_note: "",
    fire_safety_date: "",
    ipc_policy: false,
    
    // Step 5: Safeguarding
    safeguarding_officer: "",
    whistleblowing_policy: false,
    
    // Step 6: Documentation
    audit_frequency: "",
    quality_assurance_link: "",
    quality_assurance_hardcopy: false,
    quality_assurance_note: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    const val = type === 'checkbox' ? (e.target as any).checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }
  }

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }
  }

  const tryNextStep = () => {
    setAttempted(true)
    const stepErrors = validateStep(step, formData)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length === 0) {
      setStep(prev => Math.min(prev + 1, 6))
      setAttempted(false)
      setErrors({})
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    setAttempted(false)
    setErrors({})
  }

  const handleSubmit = async () => {
    // Validate final step
    const stepErrors = validateStep(step, formData)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
      setAttempted(true)
      return
    }

    setLoading(true)
    setError("")
    const supabase = createClient()
    
    try {
      // 1. Insert application record
      const { error: insertError } = await supabase
        .from('accreditation_applications')
        .insert({
          facility_id: facilityId,
          application_data: formData,
          status: 'submitted'
        })

      // If the table doesn't exist yet, fall back silently
      if (insertError && !insertError.message.includes('does not exist')) {
        console.warn('Could not save application data:', insertError.message)
      }

      // 2. Update facility status
      const { error: updateError } = await supabase
        .from('facilities')
        .update({ 
          status: 'pending_inspection'
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
  const hasErrors = Object.keys(errors).length > 0

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

          {attempted && hasErrors && (
            <div className="p-3 bg-destructive/5 text-destructive text-xs rounded-lg border border-destructive/10 font-medium">
              Please complete all required fields before continuing.
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal_status">Legal Entity Status (CAC/Trust/etc) <span className="text-destructive">*</span></Label>
                <Input name="legal_status" placeholder="e.g. Private Limited Company" value={formData.legal_status} onChange={handleChange} className={errors.legal_status ? "border-destructive" : ""} />
                <FieldErrorMessage error={errors.legal_status} />
              </div>
              <DirectDocumentUploader
                facilityId={facilityId}
                id="org_structure"
                label="Organizational Structure Document"
                value={formData.org_structure_link}
                onChange={(url) => updateField('org_structure_link', url)}
                error={errors.org_structure_link}
                hardcopyChecked={formData.org_structure_hardcopy}
                onHardcopyChange={(c) => updateField('org_structure_hardcopy', c)}
                noteValue={formData.org_structure_note}
                onNoteChange={(v) => updateField('org_structure_note', v)}
                noteError={errors.org_structure_note}
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="governance_policy" name="governance_policy" checked={formData.governance_policy} onChange={handleChange} className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${errors.governance_policy ? 'ring-2 ring-destructive' : ''}`} />
                  <Label htmlFor="governance_policy" className="text-sm font-medium">We have a written Governance & Management Policy <span className="text-destructive">*</span></Label>
                </div>
                <FieldErrorMessage error={errors.governance_policy} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff_ratio">Current Caregiver-to-Patient Ratio <span className="text-destructive">*</span></Label>
                <Input name="staff_ratio" placeholder="e.g. 1:5" value={formData.staff_ratio} onChange={handleChange} className={errors.staff_ratio ? "border-destructive" : ""} />
                <FieldErrorMessage error={errors.staff_ratio} />
              </div>
              <DirectDocumentUploader
                facilityId={facilityId}
                id="training_records"
                label="Staff Training Matrix & Records"
                value={formData.training_records_link}
                onChange={(url) => updateField('training_records_link', url)}
                error={errors.training_records_link}
                hardcopyChecked={formData.training_records_hardcopy}
                onHardcopyChange={(c) => updateField('training_records_hardcopy', c)}
                noteValue={formData.training_records_note}
                onNoteChange={(v) => updateField('training_records_note', v)}
                noteError={errors.training_records_note}
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="staff_background_check" name="staff_background_check" checked={formData.staff_background_check} onChange={handleChange} className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${errors.staff_background_check ? 'ring-2 ring-destructive' : ''}`} />
                  <Label htmlFor="staff_background_check" className="text-sm font-medium">All clinical staff have verified background checks & NIC IDs <span className="text-destructive">*</span></Label>
                </div>
                <FieldErrorMessage error={errors.staff_background_check} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="care_plan_process">Describe your Individualized Care Planning process <span className="text-destructive">*</span></Label>
                <Textarea name="care_plan_process" placeholder="How are care plans created, reviewed, and updated?" value={formData.care_plan_process} onChange={handleChange} className={errors.care_plan_process ? "border-destructive" : ""} />
                <FieldErrorMessage error={errors.care_plan_process} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="dignity_policy" name="dignity_policy" checked={formData.dignity_policy} onChange={handleChange} className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${errors.dignity_policy ? 'ring-2 ring-destructive' : ''}`} />
                  <Label htmlFor="dignity_policy" className="text-sm font-medium">We have a formal &apos;Dignity in Care&apos; Policy <span className="text-destructive">*</span></Label>
                </div>
                <FieldErrorMessage error={errors.dignity_policy} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <DirectDocumentUploader
                facilityId={facilityId}
                id="risk_assessment"
                label="Facility Risk Assessment Registry"
                value={formData.risk_assessment_link}
                onChange={(url) => updateField('risk_assessment_link', url)}
                error={errors.risk_assessment_link}
                hardcopyChecked={formData.risk_assessment_hardcopy}
                onHardcopyChange={(c) => updateField('risk_assessment_hardcopy', c)}
                noteValue={formData.risk_assessment_note}
                onNoteChange={(v) => updateField('risk_assessment_note', v)}
                noteError={errors.risk_assessment_note}
              />
              <div className="space-y-2">
                <Label htmlFor="fire_safety_date">Last Fire Safety Equipment Inspection Date <span className="text-destructive">*</span></Label>
                <Input name="fire_safety_date" type="date" value={formData.fire_safety_date} onChange={handleChange} className={errors.fire_safety_date ? "border-destructive" : ""} />
                <FieldErrorMessage error={errors.fire_safety_date} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="ipc_policy" name="ipc_policy" checked={formData.ipc_policy} onChange={handleChange} className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${errors.ipc_policy ? 'ring-2 ring-destructive' : ''}`} />
                  <Label htmlFor="ipc_policy" className="text-sm font-medium">Infection Prevention & Control (IPC) protocols are active <span className="text-destructive">*</span></Label>
                </div>
                <FieldErrorMessage error={errors.ipc_policy} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="safeguarding_officer">Designated Safeguarding Lead (Name) <span className="text-destructive">*</span></Label>
                <Input name="safeguarding_officer" placeholder="Enter name of the officer" value={formData.safeguarding_officer} onChange={handleChange} className={errors.safeguarding_officer ? "border-destructive" : ""} />
                <FieldErrorMessage error={errors.safeguarding_officer} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="whistleblowing_policy" name="whistleblowing_policy" checked={formData.whistleblowing_policy} onChange={handleChange} className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${errors.whistleblowing_policy ? 'ring-2 ring-destructive' : ''}`} />
                  <Label htmlFor="whistleblowing_policy" className="text-sm font-medium">Whistleblowing and Complaint procedures are displayed publicly <span className="text-destructive">*</span></Label>
                </div>
                <FieldErrorMessage error={errors.whistleblowing_policy} />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audit_frequency">Internal Quality Audit Frequency <span className="text-destructive">*</span></Label>
                <Input name="audit_frequency" placeholder="e.g. Quarterly" value={formData.audit_frequency} onChange={handleChange} className={errors.audit_frequency ? "border-destructive" : ""} />
                <FieldErrorMessage error={errors.audit_frequency} />
              </div>
              <DirectDocumentUploader
                facilityId={facilityId}
                id="quality_assurance"
                label="Latest Internal Quality & Compliance Report"
                value={formData.quality_assurance_link}
                onChange={(url) => updateField('quality_assurance_link', url)}
                error={errors.quality_assurance_link}
                hardcopyChecked={formData.quality_assurance_hardcopy}
                onHardcopyChange={(c) => updateField('quality_assurance_hardcopy', c)}
                noteValue={formData.quality_assurance_note}
                onNoteChange={(v) => updateField('quality_assurance_note', v)}
                noteError={errors.quality_assurance_note}
              />
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
              <Button onClick={tryNextStep} disabled={loading}>
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
