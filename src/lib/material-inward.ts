export type MaterialType = 'iron' | 'hardware' | 'packaging' | 'other'

export type ColKey = 'name' | 'description' | 'section' | 'length' | 'width' | 'qty' | 'unit' | 'remark'

export type ColDef = { key: ColKey; label: string; numeric?: boolean; width?: string }

export const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: 'iron', label: 'Iron' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
]

// Column layout per material type — mirrors the master-measurement formats,
// but the values entered here are the RECEIVED quantities.
export const MATERIAL_COLUMNS: Record<MaterialType, ColDef[]> = {
  iron: [
    { key: 'description', label: 'Description' },
    { key: 'section', label: 'Section', width: '8rem' },
    { key: 'length', label: 'L', numeric: true, width: '5rem' },
    { key: 'width', label: 'W', numeric: true, width: '5rem' },
    { key: 'qty', label: 'Pieces', numeric: true, width: '6rem' },
    { key: 'remark', label: 'Remark', width: '10rem' },
  ],
  hardware: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'qty', label: 'Qty', numeric: true, width: '7rem' },
    { key: 'unit', label: 'Unit', width: '6rem' },
  ],
  packaging: [
    { key: 'name', label: 'Material' },
    { key: 'description', label: 'Specification' },
    { key: 'qty', label: 'Qty', numeric: true, width: '7rem' },
  ],
  other: [
    { key: 'name', label: 'Item' },
    { key: 'description', label: 'Specification' },
    { key: 'qty', label: 'Qty', numeric: true, width: '6rem' },
    { key: 'unit', label: 'Unit', width: '6rem' },
    { key: 'remark', label: 'Remark', width: '10rem' },
  ],
}

export const MATERIAL_LABEL: Record<string, string> = {
  wood: 'Wood',
  iron: 'Iron',
  hardware: 'Hardware',
  packaging: 'Packaging',
  other: 'Other',
}
