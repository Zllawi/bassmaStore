import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatCurrency } from '../utils/currency'

type Order = { _id: string; total: number; status: string; address: string; invoiceRef?: string; createdAt: string }

const statusMap: Record<string, string> = {
  pending: 'قيد المعالجة',
  paid: 'مدفوع',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  canceled: 'ملغي'
}

export default function MyOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get('/orders/me')).data.data as Order[]
  })

  const orders = useMemo(() => data || [], [data])

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">طلباتي</h1>
      <div className="card p-4">
        {isLoading ? (
          <div className="text-white/70">جاري تحميل الطلبات...</div>
        ) : orders.length ? (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">الإجمالي</th>
                  <th className="p-2 text-right">الحالة</th>
                  <th className="p-2 text-right">تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-t border-white/10">
                    <td className="p-2">{order._id.slice(-6)}</td>
                    <td className="p-2 text-accent">{formatCurrency(order.total)}</td>
                    <td className="p-2">{statusMap[order.status] || order.status}</td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleString('ar-sa')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-white/60">لا توجد طلبات حتى الآن.</div>
        )}
      </div>
    </section>
  )
}




