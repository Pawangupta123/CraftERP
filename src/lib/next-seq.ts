// Next sequential code like PO-0007 / SKU-0042, based on the HIGHEST existing one.
// Using the max (not the row count) keeps it correct after deletions — counting rows
// would re-issue a number that still exists and hit the unique constraint.
export function nextSeq(existing: (string | null)[], prefix: string): string {
  const re = new RegExp(`^${prefix}-(\\d+)$`)
  let max = 0
  for (const v of existing) {
    const m = v ? re.exec(v) : null
    if (m) max = Math.max(max, Number(m[1]))
  }
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}
