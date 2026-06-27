'use client'

import * as React from 'react'
import { LENGTH_COLS, WIDTH_ROWS, cellCft, formatWidth, roundCft } from '@/lib/inward-cft'

export type Cells = Record<string, number> // key `${width}_${length}` -> pieces

type CellChange = (sectionId: string, key: string, pieces: number) => void

const NaapiCell = React.memo(function NaapiCell({
  sectionId,
  cellKey,
  value,
  onCellChange,
}: {
  sectionId: string
  cellKey: string
  value: number
  onCellChange: CellChange
}) {
  return (
    <input
      inputMode="numeric"
      value={value || ''}
      onChange={(e) => onCellChange(sectionId, cellKey, Math.max(0, parseInt(e.target.value, 10) || 0))}
      className="block h-7 w-full bg-transparent text-center text-xs tabular-nums outline-none focus:bg-primary/10 focus:ring-1 focus:ring-primary/40 focus:ring-inset"
    />
  )
})

export function NaapiGrid({
  sectionId,
  thickness,
  cells,
  onCellChange,
}: {
  sectionId: string
  thickness: number
  cells: Cells
  onCellChange: CellChange
}) {
  const colPieces: Record<number, number> = {}
  const rowCft: Record<number, number> = {}
  let grandCft = 0
  let grandPieces = 0
  for (const w of WIDTH_ROWS) {
    let rc = 0
    for (const l of LENGTH_COLS) {
      const pcs = cells[`${w}_${l}`] ?? 0
      rc += cellCft(w, thickness, l, pcs)
      colPieces[l] = (colPieces[l] ?? 0) + pcs
      grandPieces += pcs
    }
    rowCft[w] = rc
    grandCft += rc
  }

  return (
    <div className="max-h-[62vh] w-full overflow-auto rounded-lg border">
      <table className="w-full border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            <th className="sticky top-0 left-0 z-30 border-r border-b bg-muted px-2 py-1.5 text-left font-medium whitespace-nowrap">
              W＼L
            </th>
            {LENGTH_COLS.map((l) => (
              <th key={l} className="sticky top-0 z-20 border-r border-b bg-muted px-1 py-1.5 text-center font-medium">
                {l}
              </th>
            ))}
            <th className="sticky top-0 z-20 border-b bg-muted px-2 py-1.5 text-right font-medium whitespace-nowrap">
              CFT
            </th>
          </tr>
        </thead>
        <tbody>
          {WIDTH_ROWS.map((w) => (
            <tr key={w} className="even:bg-muted/30">
              <th className="sticky left-0 z-10 border-r border-b bg-card px-2 py-0 text-left font-medium whitespace-nowrap even:bg-muted/30">
                {formatWidth(w)}&quot;
              </th>
              {LENGTH_COLS.map((l) => (
                <td key={l} className="border-r border-b p-0">
                  <NaapiCell
                    sectionId={sectionId}
                    cellKey={`${w}_${l}`}
                    value={cells[`${w}_${l}`] ?? 0}
                    onCellChange={onCellChange}
                  />
                </td>
              ))}
              <td className="border-b px-2 text-right tabular-nums text-muted-foreground">
                {rowCft[w] ? roundCft(rowCft[w]) : ''}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <th className="sticky bottom-0 left-0 z-30 border-t border-r bg-muted px-2 py-1.5 text-left">Pcs</th>
            {LENGTH_COLS.map((l) => (
              <td key={l} className="sticky bottom-0 z-20 border-t border-r bg-muted py-1.5 text-center tabular-nums">
                {colPieces[l] || ''}
              </td>
            ))}
            <td className="sticky bottom-0 z-20 border-t bg-muted px-2 py-1.5 text-right tabular-nums">
              {grandPieces ? `${roundCft(grandCft)}` : '0'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
