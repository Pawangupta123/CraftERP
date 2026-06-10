// CFT (cubic feet) calculation for wood volume.
// Unit is configurable; default is inches (most common for handicraft/furniture).
// Per-piece wood volume = sum of (L × T × B × qty) across the SKU's wood rows.
// Total CFT for a PO line = per-piece volume ÷ divisor × ordered quantity.

export type CftUnit = 'inches' | 'feet' | 'cm'

export const CFT_DIVISOR: Record<CftUnit, number> = {
  inches: 1728, // 12³
  feet: 1,
  cm: 28316.846592, // 1 ft³ in cm³
}

export const DEFAULT_CFT_UNIT: CftUnit = 'inches'

type WoodDims = {
  length: number | null
  thickness: number | null
  breadth: number | null
  quantity: number | null
}

/** Volume of one finished SKU piece, summed across its wood rows (in unit³). */
export function piecewiseVolume(wood: WoodDims[]): number {
  return wood.reduce((sum, w) => {
    const l = w.length ?? 0
    const t = w.thickness ?? 0
    const b = w.breadth ?? 0
    const q = w.quantity ?? 0
    return sum + l * t * b * q
  }, 0)
}

/** Total CFT for an ordered quantity of a SKU. */
export function totalCft(wood: WoodDims[], orderedQty: number, unit: CftUnit = DEFAULT_CFT_UNIT): number {
  const perPiece = piecewiseVolume(wood) / CFT_DIVISOR[unit]
  return perPiece * orderedQty
}

/** Round to 3 decimals for display. */
export function roundCft(value: number): number {
  return Math.round(value * 1000) / 1000
}
