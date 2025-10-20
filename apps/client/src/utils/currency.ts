export const CURRENCY_LABEL = 'د.ل'
export function formatCurrency(value: number): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return `0.00 ${CURRENCY_LABEL}`
  return `${n.toFixed(2)} ${CURRENCY_LABEL}`
}

