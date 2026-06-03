export type POStatus =
  | 'Open'
  | 'In Progress'
  | 'Dispatched'
  | 'Awaiting BL'
  | 'Awaiting Payment'
  | 'Awaiting BRC'
  | 'Closed'

export type ProductionStage =
  | 'Procurement Complete'
  | 'Machining'
  | 'Assembly'
  | 'Polishing'
  | 'Packaging'
  | 'Dispatch Ready'

export interface Buyer {
  id: string
  name: string
  company: string
  contact: string
  phone: string
  email: string
  country: string
  address: string
}

export interface SKU {
  code: string
  name: string
  orderedQty: number
  stage: ProductionStage
  progress: number
  remarks: string
}

export interface ProcurementPO {
  id: string
  poNumber: string
  supplier: string
  category: string
  quantity: string
  expectedDate: string
  status: 'Pending' | 'Ordered' | 'Received'
}

export interface BuyerPO {
  id: string
  poNumber: string
  buyerId: string
  poDate: string
  deliveryDate: string
  supervisor: string
  status: POStatus
  remarks: string
  skus: SKU[]
  procurement: ProcurementPO[]
  blNumber?: string
  blDate?: string
  paymentStatus?: string
  paymentDate?: string
  brcStatus?: string
}

export const buyers: Buyer[] = [
  { id: 'b1', name: 'James Wilson', company: 'HomeDecor GmbH', contact: 'James Wilson', phone: '+49 30 1234567', email: 'james@homedecor.de', country: 'Germany', address: 'Berliner Str. 45, Berlin 10115' },
  { id: 'b2', name: 'Sophie Laurent', company: 'Maison Artisanat', contact: 'Sophie Laurent', phone: '+33 1 23456789', email: 'sophie@maisonart.fr', country: 'France', address: '12 Rue de la Paix, Paris 75001' },
  { id: 'b3', name: 'David Chen', company: 'Asia Crafts Ltd', contact: 'David Chen', phone: '+852 2234 5678', email: 'david@asiacrafts.hk', country: 'Hong Kong', address: '88 Queens Road, Central HK' },
  { id: 'b4', name: 'Emma Thompson', company: 'British Bazaar', contact: 'Emma Thompson', phone: '+44 20 7946 0958', email: 'emma@britishbazaar.co.uk', country: 'UK', address: '22 Oxford Street, London W1' },
  { id: 'b5', name: 'Carlos Mendoza', company: 'Artesania Export', contact: 'Carlos Mendoza', phone: '+34 91 234 5678', email: 'carlos@artesania.es', country: 'Spain', address: 'Calle Mayor 15, Madrid 28013' },
]

export const buyerPOs: BuyerPO[] = [
  {
    id: 'po1',
    poNumber: 'PO-2024-001',
    buyerId: 'b1',
    poDate: '2024-01-10',
    deliveryDate: '2024-04-15',
    supervisor: 'Ramesh Kumar',
    status: 'In Progress',
    remarks: 'Priority order — rush delivery',
    skus: [
      { code: 'SKU-WC-001', name: 'Wooden Chair Carved', orderedQty: 500, stage: 'Polishing', progress: 75, remarks: '375 pcs completed' },
      { code: 'SKU-WT-002', name: 'Wooden Table 4-Seater', orderedQty: 200, stage: 'Assembly', progress: 60, remarks: '120 pcs in assembly' },
      { code: 'SKU-WS-003', name: 'Wall Shelf Antique', orderedQty: 300, stage: 'Machining', progress: 40, remarks: 'Machining in progress' },
    ],
    procurement: [
      { id: 'pr1', poNumber: 'PROC-001-W', supplier: 'Singh Timber Depot', category: 'Wood', quantity: '5000 CFT', expectedDate: '2024-01-20', status: 'Received' },
      { id: 'pr2', poNumber: 'PROC-001-H', supplier: 'Metro Hardware', category: 'Hardware', quantity: '2000 pcs', expectedDate: '2024-01-22', status: 'Received' },
      { id: 'pr3', poNumber: 'PROC-001-P', supplier: 'PackBox India', category: 'Packaging', quantity: '1000 boxes', expectedDate: '2024-03-01', status: 'Ordered' },
    ],
  },
  {
    id: 'po2',
    poNumber: 'PO-2024-002',
    buyerId: 'b2',
    poDate: '2024-01-18',
    deliveryDate: '2024-05-30',
    supervisor: 'Suresh Patel',
    status: 'In Progress',
    remarks: '',
    skus: [
      { code: 'SKU-MC-001', name: 'Mirror Frame Classic', orderedQty: 800, stage: 'Assembly', progress: 50, remarks: '400 pcs assembled' },
      { code: 'SKU-PF-002', name: 'Photo Frame Set', orderedQty: 1200, stage: 'Packaging', progress: 85, remarks: '1020 pcs packed' },
    ],
    procurement: [
      { id: 'pr4', poNumber: 'PROC-002-W', supplier: 'Singh Timber Depot', category: 'Wood', quantity: '3000 CFT', expectedDate: '2024-02-01', status: 'Received' },
      { id: 'pr5', poNumber: 'PROC-002-I', supplier: 'Iron Works Co', category: 'Iron', quantity: '500 kg', expectedDate: '2024-02-05', status: 'Received' },
    ],
  },
  {
    id: 'po3',
    poNumber: 'PO-2024-003',
    buyerId: 'b3',
    poDate: '2024-02-05',
    deliveryDate: '2024-06-10',
    supervisor: 'Ramesh Kumar',
    status: 'Open',
    remarks: 'New buyer — handle carefully',
    skus: [
      { code: 'SKU-BC-001', name: 'Bamboo Craft Set', orderedQty: 600, stage: 'Procurement Complete', progress: 10, remarks: '' },
      { code: 'SKU-RB-002', name: 'Rattan Basket Large', orderedQty: 400, stage: 'Procurement Complete', progress: 10, remarks: '' },
    ],
    procurement: [
      { id: 'pr6', poNumber: 'PROC-003-W', supplier: 'Green Bamboo Traders', category: 'Wood', quantity: '2000 kg', expectedDate: '2024-02-20', status: 'Ordered' },
    ],
  },
  {
    id: 'po4',
    poNumber: 'PO-2023-045',
    buyerId: 'b4',
    poDate: '2023-10-12',
    deliveryDate: '2024-01-30',
    supervisor: 'Vikram Singh',
    status: 'Awaiting Payment',
    remarks: '',
    blNumber: 'BLMUM240012345',
    blDate: '2024-02-01',
    paymentStatus: 'Invoice sent — awaiting remittance',
    skus: [
      { code: 'SKU-AW-001', name: 'Antique Writing Desk', orderedQty: 100, stage: 'Dispatch Ready', progress: 100, remarks: 'Dispatched' },
      { code: 'SKU-BC-002', name: 'Bookcase Colonial', orderedQty: 80, stage: 'Dispatch Ready', progress: 100, remarks: 'Dispatched' },
    ],
    procurement: [
      { id: 'pr7', poNumber: 'PROC-045-W', supplier: 'Singh Timber Depot', category: 'Wood', quantity: '4000 CFT', expectedDate: '2023-11-01', status: 'Received' },
    ],
  },
  {
    id: 'po5',
    poNumber: 'PO-2023-038',
    buyerId: 'b5',
    poDate: '2023-08-20',
    deliveryDate: '2023-12-15',
    supervisor: 'Suresh Patel',
    status: 'Closed',
    remarks: 'Completed successfully',
    blNumber: 'BLMUM230098765',
    blDate: '2023-12-20',
    paymentStatus: 'Received',
    paymentDate: '2024-01-10',
    brcStatus: 'BRC Filed',
    skus: [
      { code: 'SKU-DF-001', name: 'Decorative Frame Set', orderedQty: 1000, stage: 'Dispatch Ready', progress: 100, remarks: '' },
    ],
    procurement: [
      { id: 'pr8', poNumber: 'PROC-038-W', supplier: 'Singh Timber Depot', category: 'Wood', quantity: '2500 CFT', expectedDate: '2023-09-01', status: 'Received' },
    ],
  },
  {
    id: 'po6',
    poNumber: 'PO-2024-004',
    buyerId: 'b1',
    poDate: '2024-02-15',
    deliveryDate: '2024-07-01',
    supervisor: 'Vikram Singh',
    status: 'Dispatched',
    remarks: '',
    blNumber: 'BLMUM240056789',
    blDate: '2024-03-05',
    skus: [
      { code: 'SKU-CB-001', name: 'Cabinet Wardrobe', orderedQty: 50, stage: 'Dispatch Ready', progress: 100, remarks: '' },
      { code: 'SKU-ND-002', name: 'Nightstand Duo', orderedQty: 120, stage: 'Dispatch Ready', progress: 100, remarks: '' },
    ],
    procurement: [
      { id: 'pr9', poNumber: 'PROC-004-W', supplier: 'Singh Timber Depot', category: 'Wood', quantity: '6000 CFT', expectedDate: '2024-02-25', status: 'Received' },
      { id: 'pr10', poNumber: 'PROC-004-H', supplier: 'Metro Hardware', category: 'Hardware', quantity: '3000 pcs', expectedDate: '2024-02-28', status: 'Received' },
    ],
  },
]

export const supervisors = ['Ramesh Kumar', 'Suresh Patel', 'Vikram Singh']

export const PRODUCTION_STAGES: ProductionStage[] = [
  'Procurement Complete',
  'Machining',
  'Assembly',
  'Polishing',
  'Packaging',
  'Dispatch Ready',
]

export function getBuyer(id: string) {
  return buyers.find(b => b.id === id)
}

export function getStatusColor(status: POStatus) {
  switch (status) {
    case 'Open': return 'bg-blue-100 text-blue-700'
    case 'In Progress': return 'bg-amber-100 text-amber-700'
    case 'Dispatched': return 'bg-purple-100 text-purple-700'
    case 'Awaiting BL': return 'bg-orange-100 text-orange-700'
    case 'Awaiting Payment': return 'bg-red-100 text-red-700'
    case 'Awaiting BRC': return 'bg-pink-100 text-pink-700'
    case 'Closed': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function getStageIndex(stage: ProductionStage) {
  return PRODUCTION_STAGES.indexOf(stage)
}
