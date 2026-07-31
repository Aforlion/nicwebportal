import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, Circle, Lock, ArrowRight, BookOpen, Calendar, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CertificationPathwayProps {
  currentLevel: number;
  hasFundamental: boolean;
  hasSpecialized: boolean;
  hasInternship: boolean;
}

export function CertificationPathway({
  currentLevel,
  hasFundamental,
  hasSpecialized,
  hasInternship
}: CertificationPathwayProps) {
  
  const steps = [
    {
      id: 1,
      title: "Core Fundamentals",
      description: "Pass the core caregiver fundamentals curriculum",
      isCompleted: hasFundamental,
      isCurrent: !hasFundamental,
      isLocked: false,
      btnText: "Enroll in Fundamentals",
      btnHref: "/portal/student/courses",
      icon: BookOpen
    },
    {
      id: 2,
      title: "Area of Specialisation",
      description: "Complete your chosen specialized module",
      isCompleted: hasSpecialized,
      isCurrent: hasFundamental && !hasSpecialized,
      isLocked: !hasFundamental,
      btnText: "Select Specialisation",
      btnHref: "/programs",
      icon: Award
    },
    {
      id: 3,
      title: "Clinical Internship",
      description: "Complete practical hours at an accredited agency",
      isCompleted: hasInternship,
      isCurrent: hasFundamental && hasSpecialized && !hasInternship,
      isLocked: !hasSpecialized,
      btnText: "Apply for Internship",
      btnHref: "/portal/student/internship",
      icon: Calendar
    }
  ];

  const overallProgress = (hasFundamental ? 1 : 0) + (hasSpecialized ? 1 : 0) + (hasInternship ? 1 : 0);

  return (
    <Card className="border border-muted hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 bg-primary/[0.02] border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base font-bold text-secondary">Certification Journey</CardTitle>
            <CardDescription className="text-xs">Your path to the Nursing Assistant Certificate</CardDescription>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {overallProgress}/3 Completed
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-6">
        <div className="relative space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex flex-col gap-3">
                {/* Visual Line connector */}
                {i < steps.length - 1 && (
                  <div 
                    className={`absolute left-3.5 top-7 w-0.5 h-12 -z-10 ${
                      step.isCompleted ? 'bg-green-200' : 'bg-muted'
                    }`} 
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Status Indicator */}
                  <div className="mt-0.5 shrink-0">
                    {step.isCompleted ? (
                      <CheckCircle2 className="h-7 w-7 text-green-500 bg-white" />
                    ) : step.isCurrent ? (
                      <div className="h-7 w-7 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center animate-pulse">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full border border-muted bg-slate-50 flex items-center justify-center text-muted-foreground/40">
                        <Lock className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${
                        step.isCompleted ? 'text-secondary line-through opacity-70' : step.isCurrent ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        Step {step.id}: {step.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
                    
                    {/* Action Button for Current Step */}
                    {step.isCurrent && (
                      <div className="pt-2">
                        <Button size="sm" className="h-8 bg-primary hover:bg-primary/95 text-[11px] font-bold shadow-sm" asChild>
                          <Link href={step.btnHref}>
                            {step.btnText} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}

