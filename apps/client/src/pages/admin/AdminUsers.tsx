import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

type User = { _id: string; name: string; email: string; role: string; phone?: string; city?: string; region?: string; createdAt?: string }

export default function AdminUsers() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users')).data.data as User[]
  })

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/users/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] })
  })

  const onDelete = (u: User) => {
    if (u.role === 'admin') {
      alert('لا يمكن حذف حساب مشرف (admin).')
      return
    }
    if (confirm(`تأكيد حذف المستخدم: ${u.name} (${u.email})؟`)) {
      delMut.mutate(u._id)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">المستخدمون</h2>
      <div className="card p-4">
        {isLoading ? 'جاري التحميل...' : error ? 'فشل التحميل' : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-right p-2">#</th>
                  <th className="text-right p-2">الاسم</th>
                  <th className="text-right p-2">البريد</th>
                  <th className="text-right p-2">الدور</th>
                  <th className="text-right p-2">الهاتف</th>
                  <th className="text-right p-2">المدينة</th>
                  <th className="text-right p-2">المنطقة</th>
                  <th className="text-right p-2">إنشاء</th>
                  <th className="text-right p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((u, idx) => (
                  <tr key={u._id} className="border-t border-white/10">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{u.phone || '-'}</td>
                    <td className="p-2">{u.city || '-'}</td>
                    <td className="p-2">{u.region || '-'}</td>
                    <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="p-2">
                      <button className="btn bg-red-500/80" onClick={() => onDelete(u)} disabled={delMut.isPending}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

