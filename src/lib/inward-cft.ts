// Wood "Naapi" measurement grid: Width (rows, inches) × Length (cols, feet),
// each cell holds pieces; CFT = (width × thickness × length × pieces) / 144.

export const LENGTH_COLS: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

export const WIDTH_ROWS: number[] = (() => {
  const rows: number[] = []
  for (let w = 1.5; w <= 15.0001; w += 0.25) rows.push(Math.round(w * 100) / 100)
  return rows
})()

export function cellCft(width: number, thickness: number, length: number, pieces: number): number {
  if (!pieces || pieces <= 0 || !thickness) return 0
  return (width * thickness * length * pieces) / 144
}

export function roundCft(value: number): number {
  return Math.round(value * 100) / 100
}

const FRACTIONS: Record<number, string> = { 0: '', 25: '¼', 50: '½', 75: '¾' }

/** 1.5 → "1½", 2.25 → "2¼", 3 → "3". */
export function formatWidth(width: number): string {
  const whole = Math.floor(width)
  const dec = Math.round((width - whole) * 100)
  const frac = FRACTIONS[dec] ?? ''
  return whole === 0 ? frac : `${whole}${frac}`
}
