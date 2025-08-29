"use client"

import { useEffect, useRef } from "react"
import { COA } from "@/app/type"

interface ClipboardParserProps {
  coas: COA[]
  setCOAs: (coas: COA[]) => void
  onParseSuccess?: (count: number) => void
  onParseError?: (error: string) => void
}

export default function ClipboardParser({ 
  coas, 
  setCOAs, 
  onParseSuccess, 
  onParseError 
}: ClipboardParserProps) {
  const idCounterRef = useRef(1)

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Check for Ctrl+V (or Cmd+V on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        try {
          // Read clipboard text
          const clipboardText = await navigator.clipboard.readText()

          if (!clipboardText.trim()) {
            console.log("Clipboard is empty")
            return
          }

          // Parse TSV data for COA
          const rows = clipboardText.trim().split("\n")
          const parsedCOAs: COA[] = []
          let currentId = idCounterRef.current
          let hasValidationErrors = false
          let errorMessages: string[] = []

          rows.forEach((row, rowIndex) => {
            const columns = row.split("\t")

            // Check for empty rows
            if (!row.trim()) {
              hasValidationErrors = true
              errorMessages.push(`第 ${rowIndex + 1}行: 为空`)
              return
            }

            // Debug: Log column count and content for each row
            console.log(`Row ${rowIndex + 1}: ${columns.length} columns`)
            console.log(`Row ${rowIndex + 1} content:`, columns.map((col, i) => `[${i}]: "${col}"`).join(', '))

            // Handle rows with fewer than 11 columns by padding with empty strings
            if (columns.length < 11) {
              console.log(`Row ${rowIndex + 1}: Padding ${11 - columns.length} missing columns`)
              while (columns.length < 11) {
                columns.push("")
              }
            } else if (columns.length > 11) {
              hasValidationErrors = true
              errorMessages.push(`第 ${rowIndex + 1} 行: 需要11列，但找到 ${columns.length} 列`)
              return
            }

                        // Extract COA data from columns
            const [
              orderId,
              cloneName,
              sampleName,
             
              vector,
              resistance,
              clonePosition,
            
              length,
              specifications,
              label,
              competence,
              
              recognitionSite
            ] = columns.map(col => col.trim())

            // Validate required fields
            if (!orderId || !sampleName || !cloneName || !vector || !resistance || !length || !specifications || !competence) {
              hasValidationErrors = true
              errorMessages.push(`第 ${rowIndex + 1} 行: 必填字段为空`)
              return
            }

            // Debug: Log recognition site value
            console.log(`Row ${rowIndex + 1} - Recognition Site: "${recognitionSite}" (length: ${recognitionSite.length})`)

            // Create COA object
            const coa: COA = {
              id: currentId.toString(),
              orderId,
              sampleName,
              cloneName,
              vector,
              resistance,
              length,
              specifications,
              competence,
              clonePosition: clonePosition,
              label: label,
              recognitionSite: recognitionSite.trim() || null, // Set to null if empty after trimming
              state: 'unused',
              plateId: undefined
            }

            parsedCOAs.push(coa)
            console.log(`Row ${rowIndex + 1} - Final COA recognitionSite:`, coa.recognitionSite)
            currentId++
          })

          // If there are validation errors, show them and prevent action
          if (hasValidationErrors) {
            const errorMsg = `数据格式错误，共 ${errorMessages.length} 个问题`
            console.warn("Validation errors:", errorMessages)
            onParseError?.(errorMsg)
            return
          }

          // Update the ID counter ref
          idCounterRef.current = currentId

          console.log("Parsed COAs:", parsedCOAs)

          if (parsedCOAs.length > 0) {
            // Update COAs in parent component
            setCOAs(parsedCOAs)
            
            // Call success callback
            onParseSuccess?.(parsedCOAs.length)
            
            console.log(`Successfully updated COA list with ${parsedCOAs.length} entries`)
          } else {
            const errorMsg = "Clipboard 中没有找到合规数据"
            console.warn(errorMsg)
            onParseError?.(errorMsg)
          }
        } catch (error) {
          const errorMsg = `Error reading clipboard: ${error}`
          console.error(errorMsg)
          onParseError?.(errorMsg)
        }
      }
    }

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [setCOAs, onParseSuccess, onParseError])

  // This component is invisible - it doesn't render anything
  return null
}
