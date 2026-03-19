import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PillarScore {
  name: string;
  score: number;
}

interface AccreditationTrackerProps {
  level: string;
  grade: string;
  expiryDate?: string;
  pillarScores?: PillarScore[];
}

const pillars = [
  "Governance", "Staffing", "Care Practice", "Environment", "Safeguarding", "Documentation"
];

export function AccreditationTracker({ level, grade, expiryDate, pillarScores }: AccreditationTrackerProps) {
  const isAccredited = !!level;
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-secondary">
            <Building2 className="h-4 w-4 text-primary" />
            NIC Accreditation Status
          </CardTitle>
          {isAccredited ? (
            <Badge className="bg-emerald-600 font-bold uppercase">Level: {level}</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 font-extrabold uppercase outline-none">NOT ACCREDITED</Badge>
          )}
        </div>
        <CardDescription className="text-xs">National Institutional Certification Program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {isAccredited ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Overall Performance</p>
                <p className="text-2xl font-black text-secondary">Grade {grade || 'Pending'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">License Expiry</p>
                <p className="text-xs font-bold text-secondary">{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Pillar Assessment Progress</p>
              <div className="grid grid-cols-2 gap-2">
                {pillars.map((p) => {
                  const score = pillarScores?.find(s => s.name === p)?.score || 0;
                  return (
                    <div key={p} className="flex items-center justify-between p-2 rounded bg-white/50 border border-primary/5">
                      <span className="text-[10px] font-medium">{p}</span>
                      <span className="text-[10px] font-bold text-primary">{score}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-secondary text-[12px]">Accreditation Required</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  To host certified caregivers and appear in the National Registry, your facility must be accredited.
                </p>
              </div>
            </div>
            <Button className="w-full text-xs font-bold" size="sm" asChild>
              <a href="/portal/facility/accreditation">Apply for Accreditation</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
