import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { formatCurrency } from '../../utils/currency'
import Modal from '../../components/Modal'

type OrderItem = { productId: string; name?: string; qty: number; price: number }
type Order = {
  _id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'canceled'
  address: string
  customerName?: string
  customerPhone?: string
  city?: string
  region?: string
  addressDescription?: string
  invoiceRef?: string
  createdAt: string
}

const statusOptions: { value: Order['status']; label: string }[] = [
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'canceled', label: 'ملغي' }
]

export default function AdminOrders() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get('/orders')).data.data as Order[]
  })

  const orders = useMemo(() => data || [], [data])

  const updateStatus = useMutation({
    mutationFn: async (p: { id: string; status: Order['status'] }) =>
      (await api.patch(`/orders/${p.id}/status`, { status: p.status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  })

  const updateInvoice = useMutation({
    mutationFn: async (p: { id: string; invoiceRef?: string }) =>
      (await api.patch(`/orders/${p.id}`, { invoiceRef: p.invoiceRef ?? '' })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  })

  const delOrder = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/orders/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  })

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">الطلبات</h2>
      <div className="card p-4">
        {isLoading ? (
          <div className="text-white/70">جاري تحميل الطلبات...</div>
        ) : error ? (
          <div className="text-red-300">حدث خطأ أثناء جلب الطلبات</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">العميل</th>
                  <th className="p-2 text-right">الهاتف</th>
                  <th className="p-2 text-right">الإجمالي</th>
                  <th className="p-2 text-right">الحالة</th>
                  <th className="p-2 text-right">الفاتورة</th>
                  <th className="p-2 text-right">العنوان</th>
                  <th className="p-2 text-right">التاريخ</th>
                  <th className="p-2 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <Row
                    key={o._id}
                    o={o}
                    idx={idx}
                    onStatus={(status) => updateStatus.mutate({ id: o._id, status })}
                    onInvoice={(invoiceRef) => updateInvoice.mutate({ id: o._id, invoiceRef })}
                    onDelete={() => delOrder.mutate(o._id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

function Row({ o, idx, onStatus, onInvoice, onDelete }: {
  o: Order
  idx: number
  onStatus: (s: Order['status']) => void
  onInvoice: (i?: string) => void
  onDelete: () => void
}) {
  const [invoice, setInvoice] = useState(o.invoiceRef || '')
  const [showInvoice, setShowInvoice] = useState(false)
  const brandName = (import.meta as any).env?.VITE_BRAND_NAME || 'متجر بسمة'

  const openPrint = () => {
    const rows = (o.items || [])
      .map(
        (it) => `
      <tr>
        <td style="padding:6px 8px;text-align:right">${it.name || ''}</td>
        <td style="padding:6px 8px;text-align:center">${it.qty}</td>
        <td style="padding:6px 8px;text-align:left">${formatCurrency(it.price)}</td>
        <td style="padding:6px 8px;text-align:left">${formatCurrency(it.price * it.qty)}</td>
      </tr>`
      )
      .join('')

    const html = `<!doctype html><html lang="ar" dir="rtl"><head>
      <meta charset="utf-8" />
      <title>فاتورة ${invoice || o.invoiceRef || o._id.slice(-6)}</title>
      <style>
        body{font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#fff; color:#111}
        .wrap{max-width:780px;margin:20px auto;padding:16px;border:1px solid #ddd;border-radius:12px}
        .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
        .title{font-size:20px;font-weight:700}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        thead th{background:#f3f3f3}
        th,td{border:1px solid #e5e5e5}
        .muted{color:#666;font-size:12px}
        .total{font-weight:700}
        .row{display:flex;gap:12px;flex-wrap:wrap}
        .card{border:1px solid #eee;border-radius:10px;padding:10px;flex:1}
        @media print{ .no-print{display:none} .wrap{border:none} }
      </style>
    </head><body>
      <div class="wrap">
        <div class="head">
          <div class="title">${brandName}</div>
          <div>
            <div class="muted">رقم الفاتورة</div>
            <div>${invoice || o.invoiceRef || o._id}</div>
          </div>
        </div>
        <div class="row">
          <div class="card">
            <div class="muted">العميل</div>
            <div>${o.customerName || '-'}</div>
            <div class="muted">الهاتف: ${o.customerPhone || '-'}</div>
          </div>
          <div class="card">
            <div class="muted">التاريخ</div>
            <div>${new Date(o.createdAt).toLocaleString('ar-LY')}</div>
            <div class="muted">الحالة: ${statusOptions.find(s=>s.value===o.status)?.label || o.status}</div>
          </div>
          <div class="card" style="flex-basis:100%">
            <div class="muted">العنوان</div>
            <div>${o.address}</div>
            <div class="muted">${[o.city,o.region,o.addressDescription].filter(Boolean).join(' - ')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="padding:8px">المنتج</th>
              <th style="padding:8px">الكمية</th>
              <th style="padding:8px">السعر</th>
              <th style="padding:8px">الإجمالي</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:8px;text-align:right" class="total">المجموع</td>
              <td style="padding:8px" class="total">${formatCurrency(o.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </body></html>`

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 300)
    }
  }

  return (
    <tr className="border-t border-white/10 align-top">
      <td className="p-2">{String(o._id).slice(-6)}</td>
      <td className="p-2">
        <div className="leading-tight">{o.customerName || '-'}</div>
      </td>
      <td className="p-2">{o.customerPhone || '-'}</td>
      <td className="p-2 text-accent">{formatCurrency(o.total)}</td>
      <td className="p-2 min-w-[160px]">
        <select className="input" value={o.status} onChange={(e) => onStatus(e.target.value as Order['status'])}>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </td>
      <td className="p-2 min-w-[260px]">
        <div className="flex flex-wrap items-center gap-2">
          <input className="input" placeholder="رقم الفاتورة" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          <button className="btn" onClick={() => onInvoice(invoice)}>حفظ</button>
          <button className="btn bg-white/10" onClick={() => setShowInvoice(true)}>عرض</button>
          <button className="btn bg-white/10" onClick={openPrint}>طباعة</button>
        </div>
      </td>
      <td className="p-2 max-w-[320px]">
        <div className="text-xs text-white/80 break-words">{o.address}</div>
        <div className="text-[11px] text-white/50 mt-1">{[o.city, o.region, o.addressDescription].filter(Boolean).join(' - ')}</div>
      </td>
      <td className="p-2">{new Date(o.createdAt).toLocaleString('ar-LY')}</td>
      <td className="p-2">
        <button className="btn bg-red-500/80" onClick={onDelete}>حذف</button>
      </td>
      <Modal open={showInvoice} onClose={() => setShowInvoice(false)} ariaLabel="معاينة الفاتورة">
        <div className="space-y-4">
          <header className="flex items-center justify-between">
            <div className="text-lg font-semibold">{brandName}</div>
            <div>
              <div className="text-white/60 text-sm">رقم الفاتورة</div>
              <div>{invoice || o.invoiceRef || o._id}</div>
            </div>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-3">
              <div className="text-white/60 text-sm">العميل</div>
              <div>{o.customerName || '-'}</div>
              <div className="text-white/60 text-sm">الهاتف: {o.customerPhone || '-'}</div>
            </div>
            <div className="card p-3">
              <div className="text-white/60 text-sm">التاريخ</div>
              <div>{new Date(o.createdAt).toLocaleString('ar-LY')}</div>
              <div className="text-white/60 text-sm">الحالة: {statusOptions.find(s=>s.value===o.status)?.label || o.status}</div>
            </div>
            <div className="card p-3 sm:col-span-2">
              <div className="text-white/60 text-sm">العنوان</div>
              <div>{o.address}</div>
              <div className="text-white/60 text-sm mt-1">{[o.city,o.region,o.addressDescription].filter(Boolean).join(' - ')}</div>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 text-right">المنتج</th>
                  <th className="p-2 text-center">الكمية</th>
                  <th className="p-2 text-left">السعر</th>
                  <th className="p-2 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {(o.items||[]).map((it, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="p-2 text-right">{it.name || ''}</td>
                    <td className="p-2 text-center">{it.qty}</td>
                    <td className="p-2 text-left">{formatCurrency(it.price)}</td>
                    <td className="p-2 text-left">{formatCurrency(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="p-2 text-right font-semibold" colSpan={3}>المجموع</td>
                  <td className="p-2 text-left font-semibold">{formatCurrency(o.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn bg-white/10" onClick={() => setShowInvoice(false)}>إغلاق</button>
            <button className="btn" onClick={openPrint}>طباعة</button>
          </div>
        </div>
      </Modal>
    </tr>
  )
}

