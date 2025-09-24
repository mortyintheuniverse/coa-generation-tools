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

  // Check if export should be disabled
  const isExportDisabled = () => {
    if (coas.length === 0) return true
    if (!certifiedBy || certifiedBy.trim() === '') return true
    
    // Check if any COA with recognitionSite is missing required images
    const coasWithRecognitionSite = coas.filter(coa => coa.recognitionSite !== null)
    const hasMissingImages = coasWithRecognitionSite.some(coa => !coa.image1 || !coa.image2)
    
    return hasMissingImages
  }

  const getDisabledReason = () => {
    if (coas.length === 0) return "No COAs to export"
    if (!certifiedBy || certifiedBy.trim() === '') return "Please enter operator name"
    
    const coasWithRecognitionSite = coas.filter(coa => coa.recognitionSite !== null)
    const hasMissingImages = coasWithRecognitionSite.some(coa => !coa.image1 || !coa.image2)
    
    if (hasMissingImages) return "Upload required images for COAs with cloning sites"
    
    return "Export all COAs to PDF"
  }

  const handleExport = async () => {
    if (coas.length === 0) {
      toast.error("No COAs to export")
      return
    }

    setIsExporting(true)
    
    try {
      const options: ExportOptions = {
        includeImages: true,
        filename: `COAs_Export_${new Date().toISOString().split('T')[0]}`,
        certifiedBy: certifiedBy || 'Unknown'
      }

      const result = await exportAllCOAs(coas, options)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message || "导出失败")
      }
    } catch (error) {
      console.error("导出失败:", error)
      toast.error("导出失败. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        onClick={handleExport}
        disabled={isExporting || isExportDisabled()}
        className={`
          flex items-center gap-2 px-2 py-1 rounded-sm shadow-lg transition-all duration-200
          ${isExporting || isExportDisabled()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-400 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'
          }
        `}
        title={getDisabledReason()}
      >
        {isExporting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Download size={20} />
        )}
        <span className="font-medium">
          {isExporting ? "导出中..." : `导出为PDF (${coas.length})`}
        </span>
      </button>
    </div>
  )
} 