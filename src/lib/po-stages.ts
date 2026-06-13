// Production stages for a SKU within a PO. Order matters — it drives the
// "max stage" rollup shown on the PO list and the per-SKU pipeline on the detail page.
// Stored in stage_tracking.current_stage as the stage `key` (or null = not started).
import { ShoppingCart, Hammer, Sparkles, Package, Truck, type LucideIcon } from 'lucide-react'

export type StageKey = 'procurement' | 'production' | 'polishing' | 'packing' | 'shipping'

export type StageMeta = {
  key: StageKey
  label: string
  short: string
  icon: LucideIcon
  /** classes for the filled/active circle */
  fill: string
  /** classes for the connector line once this stage is reached */
  line: string
  /** soft badge colour */
  badge: string
}

export const PRODUCTION_STAGES: StageMeta[] = [
  { key: 'procurement', label: 'Procurement', short: 'Procure', icon: ShoppingCart, fill: 'bg-amber-500',   line: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-800' },
  { key: 'production',  label: 'Production',  short: 'Prod',    icon: Hammer,       fill: 'bg-orange-500',  line: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-800' },
  { key: 'polishing',   label: 'Polishing',   short: 'Polish',  icon: Sparkles,     fill: 'bg-violet-500',  line: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-800' },
  { key: 'packing',     label: 'Packing',     short: 'Pack',    icon: Package,      fill: 'bg-blue-500',    line: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-800' },
  { key: 'shipping',    label: 'Shipping',    short: 'Ship',    icon: Truck,        fill: 'bg-emerald-600', line: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
]

export const STAGE_KEYS: StageKey[] = PRODUCTION_STAGES.map((s) => s.key)

/** Index of a stage in the ordered flow; -1 when not started / unknown. */
export function stageIndex(stage: string | null | undefined): number {
  if (!stage) return -1
  return STAGE_KEYS.indexOf(stage as StageKey)
}

export function stageMeta(stage: string | null | undefined): StageMeta | null {
  const i = stageIndex(stage)
  return i >= 0 ? PRODUCTION_STAGES[i] : null
}

/** The furthest (max) stage across a set of per-SKU stages — the PO rollup rule. */
export function maxStage(stages: (string | null | undefined)[]): StageKey | null {
  let best = -1
  for (const s of stages) best = Math.max(best, stageIndex(s))
  return best >= 0 ? STAGE_KEYS[best] : null
}

// High-level pipeline shown at the top of the PO detail: Procure → Prod → Shipping.
// The five granular stages roll up into these three phases.
export type PhaseKey = 'procure' | 'prod' | 'shipping'

export const OVERALL_PHASES: { key: PhaseKey; label: string; stages: StageKey[] }[] = [
  { key: 'procure', label: 'Procure', stages: ['procurement'] },
  { key: 'prod', label: 'Prod', stages: ['production', 'polishing', 'packing'] },
  { key: 'shipping', label: 'Shipping', stages: ['shipping'] },
]

/** Which of the three high-level phases a stage belongs to (0..2); -1 if not started. */
export function phaseIndex(stage: string | null | undefined): number {
  const i = stageIndex(stage)
  if (i < 0) return -1
  return OVERALL_PHASES.findIndex((p) => p.stages.includes(STAGE_KEYS[i]))
}
