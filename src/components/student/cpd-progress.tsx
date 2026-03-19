import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface CPDProgressProps {
  currentCredits: number;
  level: number;
}

export function CPDProgress({ currentCredits, level }: CPDProgressProps) {
  // Goals based on policy
  const goals = [15, 30, 40, 50];
  const target = goals[level - 1] || 15;
  const progress = Math.min((currentCredits / target) * 100, 100);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-secondary">
            <Sparkles className="h-4 w-4 text-primary" />
            CPD Progress {new Date().getFullYear()}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-white border-primary/20 text-primary uppercase font-extrabold">
            Level {level}
          </Badge>
        </div>
        <CardDescription className="text-xs">Continuous Professional Development</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-secondary">{currentCredits} <span className="text-xs font-normal text-muted-foreground">/ {target} Credits</span></div>
            <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/50" />
          <p className="text-[10px] text-muted-foreground leading-tight">
            You need {target - currentCredits > 0 ? target - currentCredits : 0} more credits to meet your annual requirement for Level {level}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
