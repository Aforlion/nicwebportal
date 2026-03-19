import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight, ShieldCheck, Star, Award, Briefcase } from "lucide-react"

const levels = [
  {
    number: 1,
    title: "Foundation Caregiver",
    role: "Entry-level",
    focus: "Basic care, hygiene, safety",
    icon: <Star className="h-6 w-6 text-yellow-500" />,
    color: "bg-yellow-50",
    border: "border-yellow-200"
  },
  {
    number: 2,
    title: "Specialized Caregiver",
    role: "Skilled practitioner",
    focus: "Elderly, Disability, Mental Health",
    icon: <Briefcase className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-50",
    border: "border-blue-200"
  },
  {
    number: 3,
    title: "Advanced Care Practitioner",
    role: "Clinical-support",
    focus: "Clinical awareness, post-hospital care",
    icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
    color: "bg-green-50",
    border: "border-green-200"
  },
  {
    number: 4,
    title: "Care Supervisor / Manager",
    role: "Leadership & Regulation",
    focus: "Operations, compliance, inspections",
    icon: <Award className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-50",
    border: "border-purple-200"
  }
]

export function EducationPathway() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-secondary mb-4">NIC Educational Pathway</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our structured 4-level certification system builds your competency from foundation to industry leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((level) => (
          <Card key={level.number} className={`${level.color} ${level.border} relative overflow-hidden transition-all hover:scale-105`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="border-secondary/20 text-secondary font-bold">
                  Level {level.number}
                </Badge>
                {level.icon}
              </div>
              <CardTitle className="text-lg font-bold text-secondary">
                {level.title}
              </CardTitle>
              <CardDescription className="font-semibold text-primary">
                {level.role}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {level.focus}
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-primary uppercase tracking-wider group cursor-pointer">
                Learn More 
                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
