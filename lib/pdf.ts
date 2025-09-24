import puppeteer from 'puppeteer'
import { COA } from '@/app/type'
import * as fs from 'fs'
import * as path from 'path'

export interface PDFTemplateOptions {
  includeImages?: boolean
  certifiedBy?: string
  projectName?: string
}

const generateAttachmentPageHTML = (coa: COA, logoBase64: string, certifiedBy: string) => {
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/')
  
    const enzymes = coa.recognitionSite
  
  // Generate lane descriptions based on cloning sites
  const laneDescriptions = [
    { lane: 'M', sample: 'DNA Ladder' },
    { lane: '1', sample: 'Undigested' },
    { lane: '2', sample: `${enzymes} digested` },
  ]

  const laneRowsHTML = laneDescriptions.map(row => `
    <tr>
      <td>${row.lane}</td>
      <td>${row.sample}</td>
    </tr>
  `).join('')

  return `
    <div class="page-break">
      <div class="page-content">
        <div class="header">
          <div class="company-info">
            <div class="company-name" style="display: flex; align-items: center;">
              ${logoBase64 ? `<img src="${logoBase64}" style="width: 24px; height: 24px; margin-right: 6px;" alt="Logo" />` : ''}
              ATANTARES
            </div>
            <div class="company-subtitle">苏州硅基生物科技有限公司</div>
          </div>
          <div class="slogan">The Molecular Passion</div>
        </div>
        
        <div class="title">ATTACHMENT: Restriction Digest Test Results</div>
        <div class="subtitle">Gene Synthesis Quality Control Analysis</div>
            
        
        <div class="section">
          <div class="section-title">Gel Electrophoresis Results</div>
          <div class="image-container">
            <div class="image-item">
              <div style="font-weight: 500; margin-bottom: 10px;">Restriction Digest Gel</div>
              ${coa.image1 ? `<img src="${coa.image1}" alt="Restriction Digest Gel" />` : '<div class="image-placeholder">Image not available</div>'}
            </div>
            <div class="image-item">
              <div style="font-weight: 500; margin-bottom: 10px;">DNA Ladder/Marker Reference</div>
              ${coa.image2 ? `<img src="${coa.image2}" alt="DNA Ladder Reference" />` : '<div class="image-placeholder">Image not available</div>'}
            </div>
          </div>
        </div>
        
        
        <div class="section">
          <div class="section-title">Lane Descriptions</div>
          <table class="attachment-table">
            <thead>
              <tr>
                <th>Lane</th>
                <th>Sample Description</th>
                
              </tr>
            </thead>
            <tbody>${laneRowsHTML}</tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="release-info" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0;">
            <div>
              <div style="font-weight:500;color:#333;font-size:11px;margin-bottom:2px;">Test Date</div>
              <div>${currentDate}</div>
            </div>
            <div>
              <div style="font-weight:500;color:#333;font-size:11px;margin-bottom:2px;">Signatory</div>
              <div>${certifiedBy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export const generateCOAHTML = (coa: COA, options: PDFTemplateOptions = {}) => {
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/')
  
  // Convert logo to base64
  let logoBase64 = ''
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch (error) {
    console.warn('Could not load logo:', error)
  }

  const headerInfo = [
    { label: 'Project Number', value: coa.orderId  },
    { label: 'Clone Number', value: coa.cloneName },
    { label: 'Gene Name', value: coa.sampleName  },
  ]

  const productSpecs = [
    { parameter: 'Vector', specification: coa.vector  },
    { parameter: 'Cloning Sites', specification: coa.clonePosition },
    { parameter: 'Resistance', specification: 'Ampicillin' },
    { parameter: 'Yield', specification: `≥ 2ug` },
    { parameter: 'Competence', specification: coa.competence  }
  ]

     const baseQcTests = [
     { test: 'Appearance', method: 'Visual inspection', acceptanceCriteria: 'Colorless, clear, free of precipitate or foreign particles', result: 'Pass' },
     { test: 'Sequence Verification', method: 'Sanger Sequencing', acceptanceCriteria: '100% match', result: 'Pass' },
     { test: 'Purity (A260/A280)', method: 'UV Spectrophotometry', acceptanceCriteria: '1.8 - 2.0', result: 'Pass' },
     { test: 'Integrity', method: 'Agarose Gel Electrophoresis', acceptanceCriteria: 'No secondary bands or smearing', result: 'Pass' },
     { test: 'Restriction Digest', method: 'Enzymatic Digestion + Gel Electrophoresis', acceptanceCriteria: 'Expected band pattern (See Attachment)', result: 'Pass' }
   ]

   const experimentTests = coa.experiments?.map(exp => ({
     test: exp.qcItems,
     method: exp.method,
     acceptanceCriteria: exp.acceptanceCriteria,
     result: exp.status === 'pass' ? 'Pass' : 'Fail'
   })) || []

   const qcTests = [...baseQcTests, ...experimentTests]

           const headerInfoHTML = `
      <div style="display: grid; grid-template-columns: 0.75fr 1.5fr 0.75fr 1.5fr; align-items: center;">
        <div style="font-weight: bold; color: #333;">Project Number:</div>
        <div style="color: #333;">${headerInfo[0].value}</div>
        <div style="font-weight: bold; color: #333;">Clone Number:</div>
        <div style="color: #333;">${headerInfo[1].value}</div>
        <div style="font-weight: bold; color: #333;">Gene Name:</div>
        <div style="color: #333;">${headerInfo[2].value}</div>

      </div>
    `

  const productSpecsHTML = productSpecs.map(spec => `
    <tr>
      <td>${spec.parameter}</td>
      <td>${spec.specification}</td>
    </tr>
  `).join('')

     const qcRowsHTML = qcTests.map(row => `
     <tr>
       <td>${row.test}</td>
       <td>${row.method}</td>
       <td>${row.acceptanceCriteria}</td>
       <td>${row.result}</td>
     </tr>
   `).join('')

  // Generate attachment page HTML if recognitionSite is not null
  const attachmentPageHTML = coa.recognitionSite !== null ? generateAttachmentPageHTML(coa, logoBase64, options.certifiedBy || 'Unknown') : ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate of Analysis</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; font-size: 12px; line-height: 1.4; color: #333; background-color: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; padding: 8px; }
        .company-info { flex: 1; }
        .company-name { font-size: 14px; font-weight: bold; margin-bottom: 6px; }
        .company-subtitle { font-size: 10px; color: #666; margin-bottom: 4px; }
        .slogan { font-size: 12px; font-style: italic; color: #666; margin-left: -10px; margin-top: 20px; }
        .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 8px; padding: 4px 0; }
        .subtitle { text-align: center; font-size: 14px; color: #666; margin-bottom: 8px; }
        .section { margin-bottom: 8px; padding: 4px 0; }
        .section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 2px solid #333; padding-bottom: 4px; width: 99%; text-align: left; }
        /* Product Specs table styled the same as QC table */
        .specs-table { width: 99%; border-collapse: collapse; margin-top: 8px; border: none; }
        .specs-table th { background: white; color: #333; font-weight: 700; padding: 6px 10px; border: none; border-bottom: 1px solid #d9d9d9; font-size: 12px; text-align: left; }
        .specs-table td { padding: 6px 10px; border: none; border-bottom: 1px solid #d9d9d9; vertical-align: top; font-size: 11px; }
                 /* QC table styles to match screenshot */
         .qc-table { width: 99%; border-collapse: collapse; margin-top: 8px; border: none; }
         .qc-table th { background: white; color: #333; font-weight: 700; padding: 6px 10px; border: none; border-bottom: 1px solid #d9d9d9; font-size: 12px; text-align: left; }
         .qc-table td { padding: 6px 10px; border: none; border-bottom: 1px solid #d9d9d9; vertical-align: top; font-size: 11px; }
         /* Bottom positioning */
         .page-content { min-height: calc(100vh - 200px); }
         .bottom-section {  }
         /* Page break for attachment */
         .page-break { page-break-before: always; }
         /* Attachment page styles */
         .attachment-table { width: 99%; border-collapse: collapse; margin-top: 8px; border: none; }
         .attachment-table th { background: white; color: #333; font-weight: 700; padding: 6px 10px; border: none; border-bottom: 1px solid #d9d9d9; font-size: 11px; text-align: left; }
         .attachment-table td { padding: 6px 10px; border: none; border-bottom: 1px solid #d9d9d9; vertical-align: top; font-size: 11px; }
         .image-placeholder { width: 300px; height: 225px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; background: #f9f9f9; margin: 10px auto; }
         .image-container { display: flex; gap: 20px; justify-content: space-between; margin: 15px 0; }
         .image-item { text-align: center; flex: 1; }
         .image-item img { max-width: 300px; max-height: 305px; border: 1px solid #ddd; }
         .analysis-box { border-left: 4px solid #3b82f6; padding-left: 15px; margin: 15px 0; background: #f8fafc; padding: 10px 15px; }
         .intended-use-footer { position: fixed; bottom: 5mm; right: 4mm; font-style: italic; font-weight: bold; font-size: 10px; color: #333; text-align: right; }
      </style>
</head>
<body style="display: flex; flex-direction: column; min-height: 100vh;">
  <div class="page-content">
    <div class="header">
      <div class="company-info">
        <div class="company-name" style="display: flex; align-items: center;">
          ${logoBase64 ? `<img src="${logoBase64}" style="width: 24px; height: 24px; margin-right: 6px;" alt="Logo" />` : ''}
          ATANTARES
        </div>
        <div class="company-subtitle">苏州硅基生物科技有限公司</div>
      </div>
      <div class="slogan"></div>
    </div>

    <div class="title">Certificate of Analysis</div>
    <div class="subtitle">Gene Synthesis - Reference Material</div>

    <div class="section">
      <div class="section-title">General Information</div>
      ${headerInfoHTML}
    </div>

    <div class="section">
      <div class="section-title">Product Specifications</div>
      <table class="specs-table">
        <thead>
          <tr><th>Parameter</th><th>Specification</th></tr>
        </thead>
        <tbody>${productSpecsHTML}</tbody>
      </table>
      <div class="storage-info">
        <strong>*Storage Information:</strong> Plasmid: -20°C, Stab culture: 4°C, Glycerol stock: -80°C
      </div>
    </div>

    <div class="section">
      <div class="section-title">Quality Control Analysis</div>
      <table class="qc-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Method</th>
            <th>Acceptance Criteria</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>${qcRowsHTML}</tbody>
      </table>
    </div>
  </div>

  <div class="bottom-section">
    <div class="section">
      <div class="section-title">Concluding Statement</div>
      <p>The document certifies that the gene product described has been manufactured and tested in accordance with established quality control procedures and meets the specifications outlined in this certificate.</p>
    </div>

    <div class="release-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
      <div>
        <div style="font-weight: 500; color: #333; font-size: 11px; margin-bottom: 2px;">Release Date</div>
        <div>${currentDate}</div>
      </div>
      <div>
        <div style="font-weight: 500; color: #333; font-size: 11px; margin-bottom: 2px;">Signatory</div>
        <div>${options.certifiedBy || 'Unknown'}</div>
      </div>
    </div>
  </div>

  <div class="intended-use-footer">
    *Intended Use: For research use only. Suitable for cloning, sequencing, and expression studies.
  </div>

  ${attachmentPageHTML && attachmentPageHTML.trim() !== '' ? attachmentPageHTML : ''}
</body>
    </html>
  `
}

export const generateCOAPDF = async (coa: COA, options: PDFTemplateOptions = {}) => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ] 
  })
  try {
    const page = await browser.newPage()
    
    // Optimize page settings for faster rendering
    await page.setViewport({ width: 794, height: 1123 }) // A4 size in pixels
    await page.setCacheEnabled(false)
    
    const htmlContent = generateCOAHTML(coa, options)
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' }) // Faster than networkidle0
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '12mm', bottom: '0mm', left: '12mm' },
      printBackground: true,
      preferCSSPageSize: true
    })
    
    await page.close()
    return pdf
  } finally {
    await browser.close()
  }
}

// Optimized batch PDF generation with shared browser instance
export const generateCOAPDFsBatch = async (coas: COA[], options: PDFTemplateOptions = {}) => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ] 
  })
  
  try {
    const pdfs = []
    
    for (let i = 0; i < coas.length; i++) {
      const coa = coas[i]
      const page = await browser.newPage()
      
      // Optimize page settings
      await page.setViewport({ width: 794, height: 1123 })
      await page.setCacheEnabled(false)
      
      const htmlContent = generateCOAHTML(coa, options)
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' })
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '12mm' },
        printBackground: true,
        preferCSSPageSize: true
      })
      
      const paddedIndex = String(i + 1).padStart(3, '0')
      const filename = `COA_${paddedIndex}_${coa.orderId}.pdf`
      
      pdfs.push({
        filename,
        data: pdf
      })
      
      await page.close()
    }
    
    return pdfs
  } finally {
    await browser.close()
  }
}


