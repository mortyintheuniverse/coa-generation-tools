

export interface Experiment {
  id: string
  qcItems: string // QC Items
  specifications: string // Specifications
  resultDescription: string // Result Description
  status: 'pass' | 'fail' // PASS | FAIL
}

export interface COA {
  id: string
  orderId: string
  cloneName: string
  sampleName: string
  vector: string
  resistance: string
  clonePosition: string
  length: string
  specifications: string
  label: string
  competence: string
  recognitionSite: string | null
  state: 'unused' | 'used'
  plateId?: string
  experiments?: Experiment[]
  // Image data for PDF generation
  image1?: string // Base64 encoded image data
  image2?: string // Base64 encoded image data
}


