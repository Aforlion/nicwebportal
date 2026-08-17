"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Eye, Printer, ShieldCheck, Sparkles, Building2, CheckCircle2 } from "lucide-react"
import PremiumCertificateView from "@/components/certificate/premium-certificate-view"
import { PremiumCertificateData } from "@/types/certificate"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FacilityCertificateCardProps {
  certificateData: PremiumCertificateData
  facilityName: string
  facilityType: string
  registrationNumber: string
}

export default function FacilityCertificateCard({
  certificateData,
  facilityName,
  facilityType,
  registrationNumber,
}: FacilityCertificateCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-[#FAF9F6] via-white to-amber-50/20 shadow-md relative overflow-hidden">
      {/* Top Accent Gradient Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-slate-900 via-[#D97706] to-amber-400" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100/80 text-amber-900 border-amber-300 text-[10px] font-bold tracking-wider">
                OFFICIAL CREDENTIAL
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                ACTIVE MEMBERSHIP
              </Badge>
            </div>
            <CardTitle className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#D97706]" />
              Facility Membership Certificate
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Institutional membership credential and verification badge for {facilityName}.
            </CardDescription>
          </div>

          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D97706]">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/80 rounded-lg border border-slate-200 text-xs">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Certificate No.</p>
            <p className="font-mono font-bold text-slate-800">{certificateData.certificateNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Facility Type</p>
            <p className="font-semibold text-slate-800 capitalize">{facilityType.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Membership Duration</p>
            <p className="font-semibold text-amber-700">{certificateData.duration}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs font-bold shadow-sm">
                <Eye className="mr-2 h-4 w-4" /> Preview Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6 bg-slate-900 border-slate-800 text-white">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-serif font-bold text-amber-400 flex items-center justify-between">
                  <span>Official Membership Certificate Preview</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={handlePrint} variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-xs">
                      <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save as PDF
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Render Premium Certificate Component */}
              <div className="flex justify-center p-2 bg-slate-800/50 rounded-xl border border-slate-700">
                <PremiumCertificateView data={certificateData} />
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => setIsPreviewOpen(true)}
            className="border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-bold"
          >
            <Download className="mr-2 h-4 w-4 text-[#D97706]" /> Download Certificate
          </Button>

          <a 
            href={certificateData.verificationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-amber-700 font-medium ml-auto flex items-center gap-1"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verify Authenticity Online
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
