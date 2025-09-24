

export interface Experiment {
  id: string
  qcItems: string 
  method: string 
  acceptanceCriteria: string 
  status: 'pass' | 'fail' 
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
  experiments?: Experiment[]
  image1?: string 
  image2?: string 
}


