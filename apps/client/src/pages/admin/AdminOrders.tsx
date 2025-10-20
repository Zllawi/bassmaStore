import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { formatCurrency } from '../../utils/currency'

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
      <td className="p-2 min-w-[170px]">
        <div className="flex items-center gap-2">
          <input className="input" placeholder="رقم الفاتورة" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          <button className="btn" onClick={() => onInvoice(invoice)}>حفظ</button>
        </div>
      </td>
      <td className="p-2 max-w-[320px]">
        <div className="text-xs text-white/80 break-words">{o.address}</div>
        <div className="text-[11px] text-white/50 mt-1">{[o.city, o.region, o.addressDescription].filter(Boolean).join(' - ')}</div>
      </td>
      <td className="p-2">{new Date(o.createdAt).toLocaleString('ar-sa')}</td>
      <td className="p-2">
        <button className="btn bg-red-500/80" onClick={onDelete}>حذف</button>
      </td>
    </tr>
  )
}

