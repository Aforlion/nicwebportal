"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building2, ShieldCheck, Filter } from "lucide-react"

interface Facility {
  id: string;
  name: string;
  registration_number: string;
  city: string;
  state: string;
  accreditation_level: number;
  grade: string;
}

export function RegistryClient({ initialFacilities }: { initialFacilities: Facility[] }) {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<number>(0)

  const filtered = initialFacilities.filter(f => {
    const matchesSearch = !search || 
      f.name.toLowerCase().includes(search.toLowerCase()) || 
      f.city.toLowerCase().includes(search.toLowerCase()) ||
      f.registration_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesLevel = levelFilter === 0 || f.accreditation_level === levelFilter;
    
    return matchesSearch && matchesLevel;
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by facility name, city, or Reg ID..." 
            className="pl-10 h-12 border-primary/20 bg-primary/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            className="h-12 px-4 rounded-md border border-primary/20 bg-primary/5 text-sm font-medium"
            value={levelFilter}
            onChange={(e) => setLevelFilter(parseInt(e.target.value))}
          >
            <option value={0}>All Levels</option>
            <option value={1}>Level 1: Basic</option>
            <option value={2}>Level 2: Standard</option>
            <option value={3}>Level 3: Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
             <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
             <p className="text-secondary font-bold">No accredited facilities found</p>
             <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((fac) => (
            <Card key={fac.id} className="group hover:shadow-xl transition-all border-primary/10 overflow-hidden">
               <div className={`h-2 w-full ${
                 fac.accreditation_level === 3 ? 'bg-indigo-600' : 
                 fac.accreditation_level === 2 ? 'bg-primary' : 'bg-secondary'
               }`} />
               <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                     <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-primary/20 text-primary bg-primary/5">
                        LEVEL {fac.accreditation_level}
                     </Badge>
                     <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center font-black text-xs">
                        {fac.grade}
                     </div>
                  </div>
                  <CardTitle className="text-lg text-secondary group-hover:text-primary transition-colors leading-tight mt-2">
                    {fac.name}
                  </CardTitle>
                  <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase opacity-60 tracking-wider">
                    {fac.registration_number}
                  </p>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                     <MapPin className="h-3.5 w-3.5 text-primary" />
                     {fac.city}, {fac.state}
                  </div>
                  <div className="pt-4 border-t flex items-center justify-between">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        NIC ACCREDITED
                     </div>
                     <span className="text-[10px] font-bold text-muted-foreground uppercase">Verified 2024</span>
                  </div>
               </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
