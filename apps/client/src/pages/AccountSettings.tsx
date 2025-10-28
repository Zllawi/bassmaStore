import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

type Address = {
  id: string
  label?: string
  name: string
  phone: string
  city: string
  region: string
  address: string
  addressDescription?: string
  isDefault?: boolean
}

const KEY = 'my-addresses'

export default function AccountSettings() {
  const [list, setList] = useState<Address[]>([])
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState<Address>({ id: '', label: '', name: '', phone: '', city: '', region: '', address: '', addressDescription: '' } as Address)

  useEffect(() => { document.title = 'إعدادات الحساب' }, [])
  useEffect(() => { (async()=>{ try { const r = await api.get('/users/me/addresses'); setList(r.data?.data||[]) } catch { try { setList(JSON.parse(localStorage.getItem(KEY)||'[]')) } catch {} } })() }, [])
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(list)) }, [list])

  const defaultId = useMemo(() => list.find(a => a.isDefault)?.id, [list])

  const startAdd = () => { setEditing({ id: '', name: '', phone: '', city: '', region: '', address: '', addressDescription: '', label: '' } as Address); setForm({ id: '', name: '', phone: '', city: '', region: '', address: '', addressDescription: '', label: '' } as Address) }
  const startEdit = (a: Address) => { setEditing(a); setForm(a) }
  const cancel = () => { setEditing(null) }
  const save = async () => {
    try {
      if (!form.name || !form.phone || !form.city || !form.region || !form.address) return
      if (!form.id) {
        const r = await api.post('/users/me/addresses', { ...form })
        setList(r.data?.data || [])
      } else {
        const r = await api.patch(`/users/me/addresses/${form.id}`, { ...form })
        setList(r.data?.data || [])
      }
      setEditing(null)
    } catch (e) {
      // swallow to avoid unhandled promise rejection; optionally log
      console.error('Failed to save address', e)
    }
  }
  const del = async (id: string) => {
    if (!id) { console.warn('Skip delete: missing id'); return }
    try {
      const r = await api.delete(`/users/me/addresses/${id}`)
      setList(r.data?.data || [])
    } catch (e) {
      console.error('Failed to delete address', e)
    }
  }
  const makeDefault = async (id: string) => {
    if (!id) { console.warn('Skip makeDefault: missing id'); return }
    try {
      const r = await api.patch(`/users/me/addresses/${id}/default`)
      setList(r.data?.data || [])
    } catch (e) {
      console.error('Failed to set default address', e)
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">إعدادات الحساب</h1>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">عناويني</h2>
          {!editing && (
            <button className="btn" onClick={startAdd}>إضافة عنوان</button>
          )}
        </div>

        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="اسم مستعار (اختياري)" value={form.label || ''} onChange={e => setForm(s => ({ ...s, label: e.target.value }))} />
            <input className="input" placeholder="الاسم" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
            <input className="input" placeholder="الهاتف" value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
            <input className="input" placeholder="المدينة" value={form.city} onChange={e => setForm(s => ({ ...s, city: e.target.value }))} />
            <input className="input" placeholder="المنطقة" value={form.region} onChange={e => setForm(s => ({ ...s, region: e.target.value }))} />
            <input className="input sm:col-span-2" placeholder="العنوان التفصيلي" value={form.address} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} />
            <input className="input sm:col-span-2" placeholder="وصف إضافي (اختياري)" value={form.addressDescription || ''} onChange={e => setForm(s => ({ ...s, addressDescription: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button className="btn bg-white/10" onClick={cancel}>إلغاء</button>
              <button className="btn" onClick={save}>حفظ</button>
            </div>
          </div>
        )}

        {!editing && (
          <ul className="space-y-3">
            {list.map(a => (
              <li key={a.id} className="card p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-white font-medium">{a.label || 'عنوان'} {a.isDefault ? <span className="text-xs text-accent">(افتراضي)</span> : null}</div>
                    <div className="text-sm text-white/70">{a.name} • {a.phone}</div>
                    <div className="text-sm text-white/70">{[a.city, a.region, a.address].filter(Boolean).join(' - ')}</div>
                    {a.addressDescription && <div className="text-xs text-white/50">{a.addressDescription}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!a.isDefault && <button className="btn bg-white/10" disabled={!a.id} onClick={() => a.id && makeDefault(a.id)}>تعيين افتراضي</button>}
                    <button className="btn bg-white/10" onClick={() => startEdit(a)}>تعديل</button>
                    <button className="btn bg-red-500/80" onClick={() => del(a.id)}>حذف</button>
                  </div>
                </div>
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-white/70">لا توجد عناوين محفوظة بعد.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  )
}
