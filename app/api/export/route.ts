import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import JSZip from 'jszip'
import { COA } from '@/app/type'

interface PDFTemplateOptions {
  includeImages?: boolean
  certifiedBy?: string
  projectName?: string
}

const generateCOAHTML = (coa: COA, options: PDFTemplateOptions = {}) => {
  const { certifiedBy = '', projectName = '' } = options
  
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/')
  
  const qcItems = [
    { item: 'Appearance', spec: 'Colorless, clear, free of precipitate or foreign particles', result: 'Pass' },
    { item: 'Sequence Accuracy', spec: 'Sequencing verification match the order requirements', result: 'Pass' },
    { item: 'Restriction Digests', spec: 'Expected size bands detected in agarose gel electrophoresis', result: 'Pass' },
    { item: 'A260/280', spec: '1.8~2.0', result: '1.91' },
    { item: 'Quantity', spec: coa.specifications || '2~5ug液体质粒+1管BL21(DE3)穿刺菌', result: '4.1ug' }
  ]
  
  if (coa.experiments && coa.experiments.length > 0) {
    coa.experiments.forEach(exp => {
      qcItems.push({
        item: exp.qcItems,
        spec: exp.specifications,
        result: exp.status === 'pass' ? 'Pass' : 'Fail'
      })
    })
  }
  
  const qcItemsHTML = qcItems.map(qc => `
    <tr>
      <td style="padding: 4px 8px; border-bottom: 1px solid #eee;">${qc.item}</td>
      <td style="padding: 4px 8px; border-bottom: 1px solid #eee;">${qc.spec}</td>
      <td style="padding: 4px 8px; border-bottom: 1px solid #eee; text-align: center;">${qc.result}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate of Analysis</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
        
        body {
          font-family: 'Noto Sans SC', Arial, sans-serif;
          margin: 0;
          padding: 15px;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding: 8px 0;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        
        .company-subtitle {
          font-size: 10px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .slogan {
          font-size: 12px;
          font-style: italic;
          color: #666;
        }
        
        .title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          padding: 8px 0;
          margin-top: -10px;
        }
        
        .section {
          margin-bottom: 15px;
          padding: 8px 0;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
          border-bottom: 2px solid #333;
          padding-bottom: 4px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .info-label {
          font-weight: bold;
        }
        
        .info-value {
          color: #555;
        }
        
        .qc-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        
        .qc-table th {
          padding: 8px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #333;
        }
        
        .qc-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #eee;
        }
        
        .storage-info {
          margin-top: 8px;
        }
        
        .storage-item {
          margin-bottom: 4px;
          padding: 2px 0;
        }
        
        .footer {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          margin-top: 15px;
        }
        
        .certified-by {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .page-number {
          text-align: center;
        }
        
        .date {
          text-align: right;
        }
        
        .image-placeholder {
          width: 120px;
          height: 80px;
          background-color: #f0f0f0;
          border: 2px dashed #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 10px;
          margin: 10px 0;
        }
        
        .image-container {
          margin: 10px 0;
          height: 100%;
        }
        
        .image-container img {
          width: 150px;
          height: 100%;
          object-fit: contain;
          border: 1px solid #ccc;
        }
        
                 .images-container {
           display: flex;
           gap: 20px;
           justify-content: center;
           margin-top: 15px;
           margin-bottom: 12px;
         }
         
         .page-break {
           page-break-before: always;
           break-before: page;
         }
         
         .attachment-page {
           margin-top: 20px;
           padding: 12px 0;
         }
         
         .image-caption {
           text-align: center;
           font-size: 10px;
           margin-top: 6px;
           color: #666;
         }
         
         .placeholder-text {
           text-align: center;
           line-height: 1.2;
         }
         
         @media print {
           body {
             margin: 0;
             padding: 15px;
           }
           
           .footer {
             position: fixed;
             bottom: 15px;
           }
           
           .page-break {
             page-break-before: always;
           }
         }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">ATANTARIS</div>
          <div class="company-subtitle">苏州硅基生物科技有限公司</div>
        </div>
        <div class="slogan">Transform Medicine with Smart Chips</div>
      </div>
      
      <div class="title">Certificate of Analysis</div>
      
      <div class="section">
        <div class="section-title">Construct Information</div>
        <div class="info-grid">
          <div class="info-label">Project ID:</div>
          <div class="info-value">${coa.orderId || 'N/A'}</div>
          
          <div class="info-label">Gene Name:</div>
          <div class="info-value">${coa.sampleName || 'N/A'}</div>
          
          <div class="info-label">Gene Length(bp):</div>
          <div class="info-value">${coa.length || 'N/A'}</div>
          
          <div class="info-label">Cloning Vector:</div>
          <div class="info-value">${coa.vector || 'N/A'}</div>
          
          <div class="info-label">Cloning Strategy:</div>
          <div class="info-value">${coa.specifications || 'N/A'}</div>
          
          <div class="info-label">Competent cell:</div>
          <div class="info-value">${coa.competence || 'N/A'}</div>
          
          <div class="info-label">Cloning Sites:</div>
          <div class="info-value">${coa.recognitionSite || 'N/A'}</div>
        </div>
      </div>
      
      <div class="section">
        <table class="qc-table">
          <thead>
            <tr>
              <th>QC Items</th>
              <th>Specifications</th>
              <th>Results</th>
            </tr>
          </thead>
          <tbody>
            ${qcItemsHTML}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <div class="section-title">Storage Information</div>
        <div class="storage-info">
          <div class="storage-item">Plasmid Stored at: -20°C</div>
          <div class="storage-item">Bacterial Stored at: 4°C</div>
          <div class="storage-item">Glycerol Stock Stored at: -80°C</div>
        </div>
      </div>
      
             ${coa.recognitionSite ? `
         <div class="page-break"></div>
         <div class="section attachment-page">
           <div class="section-title">Attachment 1 - Enzyme Digestion</div>
           <div class="images-container">
             ${coa.image1 ? `
               <div class="image-container">
                 <img src="${coa.image1}" alt="Lane 1: undigested" />
                 <div class="image-caption">Lane 1: undigested</div>
               </div>
             ` : `
               <div class="image-placeholder">
                 <div class="placeholder-text">Image 1<br>Lane 1: undigested</div>
               </div>
             `}
             
             ${coa.image2 ? `
               <div class="image-container">
                 <img src="${coa.image2}" alt="Lane 2: digested with HindIII" />
                 <div class="image-caption">Lane 2: digested with HindIII</div>
               </div>
             ` : `
               <div class="image-placeholder">
                 <div class="placeholder-text">Image 2<br>Lane 2: digested with HindIII</div>
               </div>
             `}
             
             <div class="image-placeholder">
               <div class="placeholder-text">Lane M: Ladder</div>
             </div>
           </div>
         </div>
       ` : ''}
      
      <div class="footer">
        <div>www.atantares.com</div>
        <div class="page-number">1/1</div>
        <div class="certified-by">
          <span>Certified by:</span>
          <span>${certifiedBy || 'Unknown'}</span>
        </div>
        <div class="date">Date: ${currentDate}</div>
        <div>技术支持: atgene@atantares.com</div>
      </div>
    </body>
    </html>
  `
}

const generateCOAPDF = async (coa: COA, options: PDFTemplateOptions = {}) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Generate HTML content
    const htmlContent = generateCOAHTML(coa, options)
    
    // Set content and wait for fonts to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '20mm',
        bottom: '10mm',
        left: '20mm'
      },
      printBackground: true
    })
    
    return pdf
  } finally {
    await browser.close()
  }
}

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
    
    // Generate individual PDFs for each COA
    const pdfPromises = coas.map(async (coa: COA) => {
      const pdfBuffer = await generateCOAPDF(coa, options)
      
      return {
        filename: `COA_${coa.orderId}_${Date.now()}.pdf`,
        data: pdfBuffer
      }
    })
    
    const pdfs = await Promise.all(pdfPromises)
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