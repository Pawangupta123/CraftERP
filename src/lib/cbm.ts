// CBM (cubic metre) calculation from carton/packing dimensions.
// Dimensions are entered in centimetres; 1 m³ = 1,000,000 cm³.

export const CBM_DIVISOR = 1_000_000 // cm³ → m³

export type CartonDims = {
  length: number | null
  width: number | null
  height: number | null
  pcs_per_carton: number | null
}

/** Volume of one carton, in m³. */
export function cartonCbm(c: CartonDims): number {
  const l = c.length ?? 0
  const w = c.width ?? 0
  const h = c.height ?? 0
  return (l * w * h) / CBM_DIVISOR
}

/**
 * CBM contributed by ONE ordered piece, summed across the SKU's cartons.
 * Each carton holds `pcs_per_carton` pieces (default 1), so a piece carries
 * cartonVolume ÷ pcs of that carton. Total PO CBM = perPieceCbm × ordered qty.
 */
export function perPieceCbm(cartons: CartonDims[]): number {
  return cartons.reduce((sum, c) => {
    const pcs = c.pcs_per_carton && c.pcs_per_carton > 0 ? c.pcs_per_carton : 1
    return sum + cartonCbm(c) / pcs
  }, 0)
}

/** Round to 3 decimals for display. */
export const roundCbm = (v: number): number => Math.round(v * 1000) / 1000
