import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Zap, Award, CheckCircle2, Building2, Users2, Heart, ShieldAlert, FileSearch, ClipboardCheck } from "lucide-react"

const levels = [
  {
    level: 1,
    title: "Basic License (Provisional)",
    description: "Ideal for startups and small care homes establishing their foundation.",
    validity: "1 Year",
    requirements: ["Minimum safety compliance", "At least one NIC-certified caregiver", "Basic documentation system"],
    color: "bg-blue-50",
    icon: <Zap className="h-6 w-6 text-blue-600" />
  },
  {
    level: 2,
    title: "Standard Accreditation",
    description: "For established facilities meeting national caregivers standards.",
    validity: "2 Years",
    requirements: ["Majority staff NIC-certified", "Structured care plans", "Incident reporting system"],
    color: "bg-green-50",
    icon: <ShieldCheck className="h-6 w-6 text-green-600" />
  },
  {
    level: 3,
    title: "Advanced / Premium",
    description: "Highest level of certification for institutional excellence.",
    validity: "3 Years",
    requirements: ["Certified supervisory staff", "Full audit & documentation system", "Emergency preparedness systems"],
    color: "bg-purple-50",
    icon: <Award className="h-6 w-6 text-purple-600" />
  }
]

const pillars = [
  { title: "Governance", icon: <Building2 />, description: "Management competence & policy frameworks" },
  { title: "Staffing", icon: <Users2 />, description: "Qualifications & caregiver-to-client ratios" },
  { title: "Care Practice", icon: <Heart />, description: "Dignity, nutrition, & care quality" },
  { title: "Safety", icon: <ShieldAlert />, description: "Environment safety & infection control" },
  { title: "Safeguarding", icon: <FileSearch />, description: "Protection from abuse & ethics" },
  { title: "Documentation", icon: <ClipboardCheck />, description: "Records, reports, & audit trails" }
]

export function AccreditationSystem() {
  return (
    <div className="space-y-16">
      {/* Levels */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary mb-3">Accreditation Levels</h2>
          <p className="text-muted-foreground">NIC grades facilities based on rigorous compliance standards.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {levels.map((l) => (
            <Card key={l.level} className={`${l.color} border-none shadow-sm overflow-hidden`}>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary" className="bg-white/80 font-bold">Level {l.level}</Badge>
                  {l.icon}
                </div>
                <CardTitle className="text-xl text-secondary">{l.title}</CardTitle>
                <CardDescription className="text-slate-600 italic">Validity: {l.validity}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{l.description}</p>
                <ul className="space-y-2">
                  {l.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-secondary/50 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-secondary mb-3">The 6 Pillars of Assessment</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Facilities are scored across these domains to determine their accreditation grade (A, B, or C).
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {p.icon}
              </div>
              <div>
                <h3 className="font-bold text-secondary">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
