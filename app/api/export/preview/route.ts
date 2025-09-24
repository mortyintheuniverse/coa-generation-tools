import { NextRequest, NextResponse } from 'next/server'
import { COA } from '@/app/type'
import { generateCOAPDF } from '@/lib/pdf'

// generation moved to lib/pdf

export async function POST(request: NextRequest) {
  try {
    const { coa, options } = await request.json()
    if (!coa) {
      return NextResponse.json({ error: 'No COA provided' }, { status: 400 })
    }
    const pdfBuffer = await generateCOAPDF(coa, options)
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="COA_Preview.pdf"'
      }
    })
  } catch (error) {
    console.error('Preview generation failed:', error)
    return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 })
  }
}


