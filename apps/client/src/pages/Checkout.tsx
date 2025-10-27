import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../features/cart/useCart'
import api from '../services/api'
import { formatCurrency } from '../utils/currency'

export default function Checkout() {
  const { items, total, clear } = useCart()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [addresses, setAddresses] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('my-addresses') || '[]') } catch { return [] }
  })
  const defaultAddressId = useMemo(() => addresses.find((a:any)=>a.isDefault)?.id as string|undefined, [addresses])
  const [selectedAddr, setSelectedAddr] = useState<string | undefined>(defaultAddressId)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      const u = raw ? JSON.parse(raw) : null
      if (!u?.accessToken) navigate('/login')
    } catch {
      navigate('/login')
    }
  }, [navigate])

  const canSubmit = useMemo(() => items.length > 0, [items])

  const placeOrder = async () => {
    setError('')
    setSuccess('')
    try {
      const chosen = addresses.find((a:any)=>a.id===selectedAddr) || addresses.find((a:any)=>a.isDefault)
      const payload = {
        items: items.map(i => ({ productId: i.id, qty: i.qty, price: i.price })),
        total,
        ...(chosen ? {
          customerName: chosen.name,
          customerPhone: chosen.phone,
          city: chosen.city,
          region: chosen.region,
          address: [chosen.city, chosen.region, chosen.address].filter(Boolean).join(' - '),
          addressDescription: chosen.addressDescription || ''
        } : {})
      }
      await api.post('/orders', payload)
      clear()
      setSuccess('تم إرسال طلبك بنجاح! سيتم التواصل معك لتأكيد الطلب.')
      setTimeout(() => navigate('/me/orders'), 800)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر إرسال الطلب. يرجى المحاولة لاحقاً.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-white">الدفع</h1>
      {items.length === 0 ? (
        <div className="card p-4">
          لا توجد منتجات في السلة{' '}
          <Link to="/" className="text-accent">العودة للمتجر</Link>
        </div>
      ) : (
        <>
          <div className="card p-4">
            <h2 className="mb-2 font-semibold text-white">ملخص الطلب</h2>
            <ul className="space-y-2 text-sm text-white/80">
              {items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatCurrency(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between font-medium">
              <span>الإجمالي الكلي</span>
              <span className="text-accent">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="card space-y-3 p-4">
            <h2 className="font-semibold text-white">اختيار العنوان</h2>
            <div className="text-sm text-white/70">
              يمكنك اختيار عنوان محفوظ من إعدادات الحساب. في حال عدم اختيار عنوان، سيُستخدم العنوان الموجود في ملفك الشخصي.
            </div>
            <div className="space-y-2">
              {addresses.length === 0 ? (
                <div className="text-white/70 text-sm">لا توجد عناوين محفوظة. يمكنك إضافة عناوين من <a className="text-accent" href="/me/settings">إعدادات الحساب</a>.</div>
              ) : (
                addresses.map((a:any)=> (
                  <label key={a.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-sm text-white/80 hover:bg-white/5">
                    <input type="radio" name="addr" checked={selectedAddr===a.id} onChange={()=>setSelectedAddr(a.id)} />
                    <span>
                      <div className="text-white">{a.label || 'عنوان'} {a.isDefault && <span className="text-xs text-accent">(افتراضي)</span>}</div>
                      <div className="text-white/70">{a.name} • {a.phone}</div>
                      <div className="text-white/70">{[a.city,a.region,a.address].filter(Boolean).join(' - ')}</div>
                    </span>
                  </label>
                ))
              )}
            </div>
            {error && <div className="text-sm text-red-400">{error}</div>}
            {success && <div className="text-sm text-green-400">{success}</div>}
            <button className="btn w-full" disabled={!canSubmit} onClick={placeOrder}>
              تأكيد الطلب
            </button>
          </div>
        </>
      )}
    </div>
  )
}
