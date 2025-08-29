"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { COA } from "../type"
import { exportAllCOAs, ExportOptions } from "@/lib/exportUtils"

interface ExportButtonProps {
  coas: COA[]
  certifiedBy?: string
}

export default function ExportButton({ coas, certifiedBy }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (coas.length === 0) {
      toast.error("No COAs to export")
      return
    }

    setIsExporting(true)
    
    try {
      const options: ExportOptions = {
        includeImages: true,
        template: 'default',
        filename: `COAs_Export_${new Date().toISOString().split('T')[0]}`,
        certifiedBy: certifiedBy || 'Unknown'
      }

      const result = await exportAllCOAs(coas, options)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message || "Export failed")
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        onClick={handleExport}
        disabled={isExporting || coas.length === 0}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200
          ${isExporting || coas.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-400 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'
          }
        `}
        title={coas.length === 0 ? "No COAs to export" : "Export all COAs to PDF"}
      >
        {isExporting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Download size={20} />
        )}
        <span className="font-medium">
          {isExporting ? "Exporting..." : `Export (${coas.length})`}
        </span>
      </button>
    </div>
  )
} 