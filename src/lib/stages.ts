// Production stages an item moves through. Stored as free text in
// stage_tracking.current_stage, so this list can be adjusted any time.
export const PRODUCTION_STAGES = [
  'Pending',
  'Wood Cutting',
  'Assembly',
  'Finishing',
  'Polish',
  'QC',
  'Packing',
  'Dispatch',
] as const

export type ProductionStage = (typeof PRODUCTION_STAGES)[number]

// Stage → badge colour (last stage = done).
export function stageBadge(stage: string): string {
  if (stage === 'Dispatch') return 'bg-emerald-100 text-emerald-700'
  if (stage === 'Pending') return 'bg-stone-100 text-stone-600'
  return 'bg-amber-100 text-amber-800'
}
