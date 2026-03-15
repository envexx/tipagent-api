export interface RuleResult {
  allowed: boolean; rejectReason?: string
  minAmount: number; maxAmount: number; suggestedMin: number; suggestedMax: number
}
