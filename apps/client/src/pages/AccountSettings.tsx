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

// removed local cache key

export default function AccountSettings() {
  const [list, setList] = useState<Address[]>([])
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState<Address>({ id: '', label: '', name: '', phone: '', city: '', region: '', address: '', addressDescription: '' } as Address)

  useEffect(() => { document.title = 'ÅÚÏÇÏÇÊ ÇáÍÓÇÈ' }, [])
  useEffect(() => { (async()=>{ try { const r = await api.get('/users/me/addresses'); setList(r.data?.data||[]) } catch { /* no local cache fallback */ } })() }, [])
  /* no local cache write */

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
      <h1 className="text-2xl font-semibold text-white">ÅÚÏÇÏÇÊ ÇáÍÓÇÈ</h1>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">ÚäÇæíäí</h2>
          {!editing && (
            <button className="btn" onClick={startAdd}>ÅÖÇİÉ ÚäæÇä</button>
          )}
        </div>

        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="ÇÓã ãÓÊÚÇÑ (ÇÎÊíÇÑí)" value={form.label || ''} onChange={e => setForm(s => ({ ...s, label: e.target.value }))} />
            <input className="input" placeholder="ÇáÇÓã" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
            <input className="input" placeholder="ÇáåÇÊİ" value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
            <input className="input" placeholder="ÇáãÏíäÉ" value={form.city} onChange={e => setForm(s => ({ ...s, city: e.target.value }))} />
            <input className="input" placeholder="ÇáãäØŞÉ" value={form.region} onChange={e => setForm(s => ({ ...s, region: e.target.value }))} />
            <input className="input sm:col-span-2" placeholder="ÇáÚäæÇä ÇáÊİÕíáí" value={form.address} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} />
            <input className="input sm:col-span-2" placeholder="æÕİ ÅÖÇİí (ÇÎÊíÇÑí)" value={form.addressDescription || ''} onChange={e => setForm(s => ({ ...s, addressDescription: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button className="btn bg-white/10" onClick={cancel}>ÅáÛÇÁ</button>
              <button className="btn" onClick={save}>ÍİÙ</button>
            </div>
          </div>
        )}

        {!editing && (
          <ul className="space-y-3">
            {list.map(a => (
              <li key={a.id} className="card p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-white font-medium">{a.label || 'ÚäæÇä'} {a.isDefault ? <span className="text-xs text-accent">(ÇİÊÑÇÖí)</span> : null}</div>
                    <div className="text-sm text-white/70">{a.name} • {a.phone}</div>
                    <div className="text-sm text-white/70">{[a.city, a.region, a.address].filter(Boolean).join(' - ')}</div>
                    {a.addressDescription && <div className="text-xs text-white/50">{a.addressDescription}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!a.isDefault && <button className="btn bg-white/10" disabled={!a.id} disabled={!a.id} onClick={() => a.id && makeDefault(a.id)}>ÊÚííä ÇİÊÑÇÖí</button>}
                    <button className="btn bg-white/10" onClick={() => startEdit(a)}>ÊÚÏíá</button>
                    <button className="btn bg-red-500/80" disabled={!a.id} onClick={() => a.id && del(a.id)}>ÍĞİ</button>
                  </div>
                </div>
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-white/70">áÇ ÊæÌÏ ÚäÇæíä ãÍİæÙÉ ÈÚÏ.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  )
}


