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
      <h1 className="text-2xl font-bold">ظ„ظˆط­ط© ط§ظ„ط¥ط¯ط§ط±ط©</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4"><div className="text-white/60">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط¨ظٹط¹ط§طھ</div><div className="text-2xl">{stats?.sales ?? 0}</div></div>
        <div className="card p-4"><div className="text-white/60">ط§ظ„ط£ظƒط«ط± ظ…ط¨ظٹط¹ط§ظ‹</div><div className="text-2xl">{stats?.top ?? 0}</div></div>
        <div className="card p-4"><div className="text-white/60">ط¹ط¯ط¯ ط§ظ„ط·ظ„ط¨ط§طھ</div><div className="text-2xl">{stats?.count ?? 0}</div></div>
      </div>

      <div className="card p-4">
        <div className="text-white/60">ط­ط§ظ„ط© ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ</div>
        <div className="mt-1">
          {dbHealth?.ok && dbHealth?.db?.state === 'connected' ? (
            <span className="text-green-400">ظ…طھطµظ„</span>
          ) : (
            <span className="text-red-400">ط؛ظٹط± ظ…طھطµظ„</span>
          )}
          <span className="text-white/60 ml-2">({dbHealth?.db?.vendor || 'n/a'} - {dbHealth?.db?.state || 'unknown'})</span>
        </div>
        {dbHealth && !dbHealth.ok && dbHealth.db?.error && (
          <div className="text-red-400 text-sm mt-1">{String(dbHealth.db.error)}</div>
        )}
      </div>

      <div className="flex gap-2">
        <button className={`btn ${tab==='products'?'':'bg-white/10'}`} onClick={()=>setTab('products')}>ط§ظ„ظ…ظ†طھط¬ط§طھ</button>
        <button className={`btn ${tab==='orders'?'':'bg-white/10'}`} onClick={()=>setTab('orders')}>ط§ظ„ط·ظ„ط¨ط§طھ</button>
        <button className={`btn ${tab==='users'?'':'bg-white/10'}`} onClick={()=>setTab('users')}>ط§ظ„ظ…ط³طھط®ط¯ظ…ظˆظ†</button>
      </div>

      {tab === 'products' ? <AdminProducts /> : tab === 'orders' ? <AdminOrders /> : <AdminUsers />}
    </div>
  )
}


