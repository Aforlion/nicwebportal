import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartPulse, Accessibility, Home, BrainCircuit } from "lucide-react"

const tracks = [
  {
    title: "Elderly Care & Gerontology",
    description: "Specialized care for the aging population, focusing on chronic conditions and mobility.",
    icon: <HeartPulse className="h-8 w-8 text-red-500" />,
    color: "bg-red-50",
    border: "border-red-100"
  },
  {
    title: "Disability & Special Needs",
    description: "Supporting individuals with physical or cognitive disabilities to live independently.",
    icon: <Accessibility className="h-8 w-8 text-blue-500" />,
    color: "bg-blue-50",
    border: "border-blue-100"
  },
  {
    title: "Home Health & Chronic Care",
    description: "Providing clinical-level support in a home setting for long-term illnesses.",
    icon: <Home className="h-8 w-8 text-green-500" />,
    color: "bg-green-50",
    border: "border-green-100"
  },
  {
    title: "Mental Health & Psychosocial",
    description: "Support for mental well-being, cognitive care, and emotional stability.",
    icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
    color: "bg-purple-50",
    border: "border-purple-100"
  }
]

export function SpecializationTracks() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-secondary mb-4">Level 2 Specialization Tracks</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          At Level 2, caregivers can choose to specialize in specific areas to increase their technical expertise and earning potential.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {tracks.map((track) => (
          <Card key={track.title} className={`${track.color} ${track.border} border-2 hover:shadow-md transition-shadow`}>
            <CardHeader>
              <div className="mb-4 bg-white w-fit p-3 rounded-xl shadow-sm">
                {track.icon}
              </div>
              <CardTitle className="text-xl text-secondary">{track.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-balance leading-relaxed">
                {track.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
