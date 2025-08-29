import { COA } from "@/app/type"

export interface ExportOptions {
  includeImages?: boolean
  template?: 'default' | 'detailed' | 'minimal'
  filename?: string
  certifiedBy?: string
  projectName?: string
}

export const exportAllCOAs = async (coas: COA[], options: ExportOptions = {}) => {
  try {
    console.log(`Starting server-side export of ${coas.length} COAs`)
    
    // Call the server-side API
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coas,
        options: {
          includeImages: options.includeImages,
          certifiedBy: options.certifiedBy,
          projectName: options.projectName
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Export failed')
    }
    
    // Get the ZIP file as blob
    const zipBlob = await response.blob()
    
    // Download the ZIP file
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `COAs_Export_${new Date().toISOString().split('T')[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return {
      success: true,
      message: `Successfully exported ${coas.length} COAs`,
      filename: `COAs_Export_${new Date().toISOString().split('T')[0]}.zip`
    }
  } catch (error) {
    console.error('Export failed:', error)
    return {
      success: false,
      message: 'Export failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 