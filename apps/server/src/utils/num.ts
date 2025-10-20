export function parseMaybeNumber(v: any): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v !== 'string') return undefined
  let s = v.trim()
  if (!s) return undefined
  // Normalize Arabic-Indic digits to ASCII
  const map: Record<string, string> = {
    '٠': '0','١': '1','٢': '2','٣': '3','٤': '4','٥': '5','٦': '6','٧': '7','٨': '8','٩': '9',
    '۰': '0','۱': '1','۲': '2','۳': '3','۴': '4','۵': '5','۶': '6','۷': '7','۸': '8','۹': '9'
  }
  s = s.replace(/[٠-٩۰-۹]/g, (ch) => map[ch] ?? ch)
  // Handle decimal separators: if contains comma but no dot, treat comma as dot
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.')
  // Remove spaces as thousand separators
  s = s.replace(/\s+/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

