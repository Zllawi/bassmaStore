import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { useState } from 'react'
import AdminProducts from './admin/AdminProducts'
import AdminOrders from './admin/AdminOrders'
import AdminUsers from './admin/AdminUsers'

export default function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: async () => (await api.get('/orders', { params: { stats: 1 } })).data })
  const { data: dbHealth } = useQuery({ queryKey: ['db-health'], queryFn: async () => (await api.get('/health/db')).data })
  const [tab, setTab] = useState<'products'|'orders'|'users'>('products')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4"><div className="text-white/60">إجمالي المبيعات</div><div className="text-2xl">{stats?.sales ?? 0}</div></div>
        <div className="card p-4"><div className="text-white/60">أعلى منتج مبيعًا</div><div className="text-2xl">{stats?.top ?? 0}</div></div>
        <div className="card p-4"><div className="text-white/60">عدد الطلبات</div><div className="text-2xl">{stats?.count ?? 0}</div></div>
      </div>

      <div className="card p-4">
        <div className="text-white/60">حالة قاعدة البيانات</div>
        <div className="mt-1">
          {dbHealth?.ok && dbHealth?.db?.state === 'connected' ? (
            <span className="text-green-400">متصل</span>
          ) : (
            <span className="text-red-400">غير متصل</span>
          )}
          <span className="text-white/60 ml-2">({dbHealth?.db?.vendor || 'n/a'} - {dbHealth?.db?.state || 'unknown'})</span>
        </div>
        {dbHealth && !dbHealth.ok && dbHealth.db?.error && (
          <div className="text-red-400 text-sm mt-1">{String(dbHealth.db.error)}</div>
        )}
      </div>

      <div className="flex gap-2">
        <button className={`btn ${tab==='products'?'':'bg-white/10'}`} onClick={()=>setTab('products')}>المنتجات</button>
        <button className={`btn ${tab==='orders'?'':'bg-white/10'}`} onClick={()=>setTab('orders')}>الطلبات</button>
        <button className={`btn ${tab==='users'?'':'bg-white/10'}`} onClick={()=>setTab('users')}>المستخدمون</button>
      </div>

      {tab === 'products' ? <AdminProducts /> : tab === 'orders' ? <AdminOrders /> : <AdminUsers />}
    </div>
  )
}

