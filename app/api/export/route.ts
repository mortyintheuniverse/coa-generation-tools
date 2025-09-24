import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { COA } from '@/app/type'
import { generateCOAPDFsBatch } from '@/lib/pdf'

export async function POST(request: NextRequest) {
  try {
    const { coas, options } = await request.json()
    
    if (!coas || !Array.isArray(coas) || coas.length === 0) {
      return NextResponse.json(
        { error: 'No COAs provided' },
        { status: 400 }
      )
    }
    
    console.log(`Starting server-side export of ${coas.length} COAs`)
    
    // Generate all PDFs using optimized batch function with shared browser instance
    const pdfs = await generateCOAPDFsBatch(coas, options)
    console.log(`Generated ${pdfs.length} PDFs`)
    
    // Create ZIP file
    const zip = new JSZip()
    pdfs.forEach(({ filename, data }) => {
      zip.file(filename, data)
    })
    
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const zipFilename = `COAs_Export_${new Date().toISOString().split('T')[0]}.zip`
    
    console.log(`Created ZIP file: ${zipFilename}`)
    
    // Return the ZIP file as a response
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('Server-side export failed:', error)
    return NextResponse.json(
      { error: 'Export failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 