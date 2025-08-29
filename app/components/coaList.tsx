"use client"

import { COA } from "../type"
import COARow from "./coaRow"

interface COAListProps {
  coas: COA[]
  setCOAs: (coas: COA[]) => void
}

export default function COAList({ coas, setCOAs }: COAListProps) {
  const updateCOA = (id: string, updates: Partial<COA>) => {
    const updatedCOAs = coas.map(coa => 
      coa.id === id ? { ...coa, ...updates } : coa
    )
    setCOAs(updatedCOAs)
  }

  if (coas.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No COA data available. Copy and paste your data to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {coas.map((coa) => (
        <COARow
          key={coa.id}
          coa={coa}
          onUpdate={(updates: Partial<COA>) => updateCOA(coa.id, updates)}
        />
      ))}
    </div>
  )
} 