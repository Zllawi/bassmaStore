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
      alert('ظ„ط§ ظٹظ…ظƒظ† ط­ط°ظپ ط­ط³ط§ط¨ ظ…ط´ط±ظپ (admin).')
      return
    }
    if (confirm(`هل أنت متأكد من حذف هذا المستخدم: ${u.name} (${u.email})؟`)) {
      delMut.mutate(u._id)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">ط§ظ„ظ…ط³طھط®ط¯ظ…ظˆظ†</h2>
      <div className="card p-4">
        {isLoading ? 'ط¬ط§ط±ظٹ ط§ظ„طھط­ظ…ظٹظ„...' : error ? 'ظپط´ظ„ ط§ظ„طھط­ظ…ظٹظ„' : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-right p-2">#</th>
                  <th className="text-right p-2">ط§ظ„ط§ط³ظ…</th>
                  <th className="text-right p-2">ط§ظ„ط¨ط±ظٹط¯</th>
                  <th className="text-right p-2">ط§ظ„ط¯ظˆط±</th>
                  <th className="text-right p-2">ط§ظ„ظ‡ط§طھظپ</th>
                  <th className="text-right p-2">ط§ظ„ظ…ط¯ظٹظ†ط©</th>
                  <th className="text-right p-2">ط§ظ„ظ…ظ†ط·ظ‚ط©</th>
                  <th className="text-right p-2">ط¥ظ†ط´ط§ط،</th>
                  <th className="text-right p-2">ط¥ط¬ط±ط§ط،ط§طھ</th>
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
                      <button className="btn bg-red-500/80" onClick={() => onDelete(u)} disabled={delMut.isPending}>ط­ط°ظپ</button>
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



