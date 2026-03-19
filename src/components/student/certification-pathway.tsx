import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"

interface CertificationPathwayProps {
  currentLevel: number;
}

const levels = [
  { id: 1, title: "Foundation" },
  { id: 2, title: "Specialized" },
  { id: 3, title: "Advanced" },
  { id: 4, title: "Supervisor" }
];

export function CertificationPathway({ currentLevel }: CertificationPathwayProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-secondary">Professional Pathway</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-6">
        <div className="space-y-4">
          {levels.map((level, i) => {
            const isCompleted = level.id < currentLevel;
            const isCurrent = level.id === currentLevel;
            const isLocked = level.id > currentLevel;

            return (
              <div key={level.id} className="flex items-center gap-3">
                <div className="relative flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 bg-white" />
                  ) : isCurrent ? (
                    <Circle className="h-5 w-5 text-primary fill-primary/20 stroke-[3px]" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                  )}
                  {i < levels.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${isCompleted ? 'bg-green-200' : 'bg-muted'}`} />
                  )}
                </div>
                <div className="flex-grow flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isLocked ? 'text-muted-foreground' : 'text-secondary'}`}>
                    Level {level.id}: {level.title}
                  </span>
                  {isCurrent && <ChevronRight className="h-4 w-4 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
