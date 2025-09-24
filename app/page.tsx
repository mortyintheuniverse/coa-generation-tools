"use client"

import { useState } from "react"
import { toast } from "sonner"
import ClipboardParser from "./components/clickboardParser"
import COAList from "./components/coaList"
import ExportButton from "./components/exportButton"
import { COA } from "./type"
import { Label } from "@/components/ui/label"
import { Edit2, Check, X } from "lucide-react"

export default function Home() {
  const [coas, setCOAs] = useState<COA[]>([])
  const [name, setName] = useState<string>("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")

  const handleParseSuccess = (count: number) => {
    toast.success(`成功读取 ${count} 条COA数据📋!`)
  }

  const handleParseError = (error: string) => {
    toast.error(error)
  }

  const startEditingName = () => {
    setTempName(name)
    setIsEditingName(true)
  }

  const saveName = () => {
    setName(tempName)
    setIsEditingName(false)
  }

  const cancelEditingName = () => {
    setTempName(name)
    setIsEditingName(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Elegant Name Display/Edit */}
        <div className="mb-6 flex items-center gap-3">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter name..."
                className="px-3 py-1 text-lg font-semibold border-0 bg-transparent focus:outline-none focus:ring-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') cancelEditingName()
                }}
              />
              <button
                onClick={saveName}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                title="Save"
              >
                <Check size={16} />
              </button>
              <button
                onClick={cancelEditingName}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
              onClick={startEditingName}
            >
              <Label className="text-lg font-semibold text-gray-900">
              {name || ("操作员名称")} 
                
              </Label>
              <Edit2 size={14} className="text-gray-400" />
            </div>
          )}
        </div>
        
        <ClipboardParser
          coas={coas}
          setCOAs={setCOAs}
          onParseSuccess={handleParseSuccess}
          onParseError={handleParseError}
        />
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <COAList coas={coas} setCOAs={setCOAs} certifiedBy={name} />
        </div>
      </div>
      
      <ExportButton coas={coas} certifiedBy={name} />
    </div>
  )
}
