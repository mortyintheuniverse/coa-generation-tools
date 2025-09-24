"use client"

import { useState, useRef } from "react"
import { COA, Experiment } from "../type"
import { Upload, X, Plus, Eye } from "lucide-react"
import { getPreviewPdfUrl } from "@/lib/exportUtils"

interface COARowProps {
  coa: COA
  onUpdate: (updates: Partial<COA>) => void
  certifiedBy?: string
}

export default function COARow({ coa, onUpdate, certifiedBy }: COARowProps) {
  const [showImage1, setShowImage1] = useState(false)
  const [showImage2, setShowImage2] = useState(false)
  const [dragOver1, setDragOver1] = useState(false)
  const [dragOver2, setDragOver2] = useState(false)
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)

  const handleImageUpload = (file: File, setImage: (data: string) => void) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImage(result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (setImage: (data: string | undefined) => void) => {
    setImage(undefined)
  }

  const openFileDialog = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click()
  }

  const handleDragOver = (e: React.DragEvent, setDragOver: (value: boolean) => void) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent, setDragOver: (value: boolean) => void) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent, setImage: (data: string) => void, setDragOver: (value: boolean) => void) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file, setImage)
    }
  }

  const addExperiment = () => {
    const newExperiment: Experiment = {
      id: Date.now().toString(),
      qcItems: `QC Item ${(coa.experiments?.length || 0) + 1}`,
      method: '',
      acceptanceCriteria: '',
      status: 'pass'
    }

    const updatedExperiments = [...(coa.experiments || []), newExperiment]
    onUpdate({ experiments: updatedExperiments })
  }

  const updateExperiment = (experimentId: string, updates: Partial<Experiment>) => {
    const updatedExperiments = coa.experiments?.map(exp =>
      exp.id === experimentId ? { ...exp, ...updates } : exp
    ) || []
    onUpdate({ experiments: updatedExperiments })
  }

  const removeExperiment = (experimentId: string) => {
    const updatedExperiments = coa.experiments?.filter(exp => exp.id !== experimentId) || []
    onUpdate({ experiments: updatedExperiments })
  }

  const handlePreview = async () => {
    try {
      const url = await getPreviewPdfUrl(coa, { 
        includeImages: true,
        certifiedBy: certifiedBy || 'Unknown'
      })
      window.open(url, '_blank')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="border-b border-gray-200 bg-white relative">
      {/* Main COA Data Block - 3 Rows */}
      <div className="p-6 w-full">
        {/* Row 1: Preview + Order ID, Sample, Clone, Vector */}
        <div className="grid grid-cols-4 gap-4 mb-3 items-start">
          <div className="flex items-center pt-5">
            <button
              onClick={handlePreview}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              title="Preview PDF"
            >
              <Eye size={14} />
              Preview
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-3 items-start">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Order ID</span>
            <span className="text-sm font-semibold text-gray-900">{coa.orderId}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Sample</span>
            <span className="text-sm text-gray-700">{coa.sampleName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Clone</span>
            <span className="text-sm text-gray-700">{coa.cloneName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Vector</span>
            <span className="text-sm text-gray-700">{coa.vector}</span>
          </div>
        </div>

        {/* Row 2: Resistance, Position, Length, Competence */}
        <div className="grid grid-cols-4 gap-4 mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Resistance</span>
            <span className="text-sm text-gray-700">{coa.resistance}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Cloning Site</span>
            <span className="text-sm text-gray-700">{coa.clonePosition || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Length</span>
            <span className="text-sm text-gray-700">{coa.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Competence</span>
            <span className="text-sm text-gray-700">{coa.competence}</span>
          </div>
        </div>

        {/* Row 3: Specifications, Label, Recognition Site, Actions */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Specifications</span>
            <span className="text-sm text-gray-700 truncate" title={coa.specifications}>
              {coa.specifications}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Label</span>
            <span className="text-sm text-gray-700">{coa.label || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 mb-1">Recognition Site</span>
            <span className="text-sm text-gray-700">{coa.recognitionSite || "N/A"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-500 mb-1">额外检测</span>
            <div className="flex gap-2">
              <button
                onClick={addExperiment}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors"
              >
                <Plus size={12} />
                新增检测
                {coa.experiments?.length || 0}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Image Upload Areas positioned outside the row */}
      {coa.recognitionSite && (
        <div className="absolute -right-24 top-0 flex flex-col ">
          {/* Image 1 */}
          <div className="relative">
            {coa.image1 ? (
              <div className="w-22 h-22 rounded border overflow-hidden bg-white shadow-sm">
                <img
                  src={coa.image1}
                  alt="Recognition site 1"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImage1(true)}
                />
                <button
                  onClick={() => removeImage((data) => onUpdate({ image1: data }))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => handleDragOver(e, setDragOver1)}
                onDragLeave={(e) => handleDragLeave(e, setDragOver1)}
                onDrop={(e) => handleDrop(e, (data) => onUpdate({ image1: data }), setDragOver1)}
                className={`w-22 h-22 border-2 border-dashed rounded flex items-center justify-center transition-colors cursor-pointer bg-white shadow-sm ${
                  dragOver1
                    ? 'border-blue-400 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                }`}
                onClick={() => openFileDialog(fileInput1Ref)}
                title="Click or drag to upload Image 1"
              >
                <Upload size={20} />
              </div>
            )}
            <input
              ref={fileInput1Ref}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, (data) => onUpdate({ image1: data }))
              }}
              className="hidden"
            />
          </div>

          {/* Image 2 */}
          <div className="relative">
            {coa.image2 ? (
              <div className="w-22 h-22 rounded border overflow-hidden bg-white shadow-sm">
                <img
                  src={coa.image2}
                  alt="Recognition site 2"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImage2(true)}
                />
                <button
                  onClick={() => removeImage((data) => onUpdate({ image2: data }))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => handleDragOver(e, setDragOver2)}
                onDragLeave={(e) => handleDragLeave(e, setDragOver2)}
                onDrop={(e) => handleDrop(e, (data) => onUpdate({ image2: data }), setDragOver2)}
                className={`w-22 h-22 border-2 border-dashed rounded flex items-center justify-center transition-colors cursor-pointer bg-white shadow-sm ${
                  dragOver2
                    ? 'border-blue-400 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                }`}
                onClick={() => openFileDialog(fileInput2Ref)}
                title="Click or drag to upload Image 2"
              >
                <Upload size={20} />
              </div>
            )}
            <input
              ref={fileInput2Ref}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, (data) => onUpdate({ image2: data }))
              }}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Experiment Rows */}
      {coa.experiments && coa.experiments.length > 0 && (
        <div className="border-t border-gray-200 bg-blue-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">额外检测</h3>
            <div className="space-y-3">
              {coa.experiments.map((experiment, index) => (
                <div key={experiment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 mb-1">QC项目</span>
                      <input
                        type="text"
                        value={experiment.qcItems}
                        onChange={(e) => updateExperiment(experiment.id, { qcItems: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="QC Items"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 mb-1">测试方法</span>
                      <input
                        type="text"
                        value={experiment.method}
                        onChange={(e) => updateExperiment(experiment.id, { method: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Specifications"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 mb-1">测试标准</span>
                      <input
                        type="text"
                        value={experiment.acceptanceCriteria}
                        onChange={(e) => updateExperiment(experiment.id, { acceptanceCriteria: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Acceptance Criteria"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 mb-1">结果</span>
                      <div className="flex gap-2">
                        <select
                          value={experiment.status}
                          onChange={(e) => updateExperiment(experiment.id, { status: e.target.value as any })}
                          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pass">PASS</option>
                          <option value="fail">FAIL</option>
                        </select>
                        <button
                          onClick={() => removeExperiment(experiment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {showImage1 && coa.image1 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setShowImage1(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={coa.image1}
              alt="Recognition site 1"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {showImage2 && coa.image2 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setShowImage2(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={coa.image2}
              alt="Recognition site 2"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
} 