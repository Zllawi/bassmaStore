import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import api from "../../services/api"

type Prod = { _id: string; name: string; price: number; stock: number; category: string; images: string[] }

type FormState = { name: string; price: string; stock: string; category: string; description: string }

type NumericParser = (value: string) => number | null

const digitMap: Record<string, string> = {
  '٠': '0','١': '1','٢': '2','٣': '3','٤': '4','٥': '5','٦': '6','٧': '7','٨': '8','٩': '9',
  '0': '0','1': '1','2': '2','3': '3','4': '4','5': '5','6': '6','7': '7','8': '8','9': '9'
}
export default function AdminProducts() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await api.get("/products")).data.data as Prod[]
  })
  const categories = useMemo(() => [
    { value: "general", label: "عام" },
    { value: "hair", label: "منتجات الشعر" },
    { value: "skin", label: "منتجات البشرة" },
    { value: "electronics", label: "إلكترونيات" },
    { value: "fashion", label: "أزياء" },
    { value: "home", label: "منزل" }
  ], [])
  const initialForm: FormState = { name: "", price: "", stock: "", category: "general", description: "" }
  const [form, setForm] = useState<FormState>(initialForm)
  const [files, setFiles] = useState<FileList | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: async () => {
      setError(null)
      const name = form.name.trim()
      const priceValue = parseNumberInput(form.price)
      const stockValue = parseNumberInput(form.stock)

      if (!name || priceValue === null || stockValue === null) {
        throw new Error("الرجاء إدخال الاسم والسعر والمخزون بأرقام صحيحة.")
      }

      const fd = new FormData()
      fd.append("name", name)
      fd.append("price", String(priceValue))
      fd.append("stock", String(Math.max(0, Math.floor(stockValue))))
      fd.append("category", form.category)
      fd.append("description", form.description.trim())
      if (files) Array.from(files).forEach((f) => fd.append("images", f))
      return (await api.post("/products", fd)).data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] })
      setForm(initialForm)
      setFiles(null)
    },
    onError: (err: any) => {
      const issues = err?.response?.data?.issues as { message?: string }[] | undefined
      const serverMsg = err?.response?.data?.message
      if (issues?.length) {
        setError(issues.map((i) => i.message).filter(Boolean).join(" • ") || serverMsg || "تعذّر إنشاء المنتج.")
      } else {
        setError(serverMsg || err?.message || "تعذّر إنشاء المنتج.")
      }
    }
  })

  const updateMut = useMutation({
    mutationFn: async (p: { id: string; patch: Partial<Prod>; images?: FileList | null; replace?: boolean }) => {
      const fd = new FormData()
      Object.entries(p.patch).forEach(([k, v]) => v != null && fd.append(k, String(v)))
      if (p.images) Array.from(p.images).forEach((f) => fd.append("images", f))
      const q = p.replace ? "?imagesAction=replace" : "?imagesAction=append"
      return (await api.patch(`/products/${p.id}${q}`, fd)).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] })
  })

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/products/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] })
  })

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">إدارة المنتجات</h2>

      <div className="card p-4">
        <h3 className="font-medium mb-2">إضافة منتج</h3>
        {error && <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          <input className="input" placeholder="السعر" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
          <input className="input" placeholder="المخزون" value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))} />
          <select className="input" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <textarea className="input sm:col-span-2" placeholder="الوصف (اختياري)" rows={3} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="sm:col-span-2" />
        </div>
        <div className="mt-3">
          <button className="btn" onClick={() => createMut.mutate()} disabled={createMut.isPending}>حفظ المنتج</button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-3">قائمة المنتجات</h3>
        {isLoading ? 'جار التحميل...' : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">الاسم</th>
                  <th className="p-2 text-right">السعر</th>
                  <th className="p-2 text-right">المخزون</th>
                  <th className="p-2 text-right">الصور</th>
                  <th className="p-2 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((p) => (
                  <Row key={p._id} p={p} parseNumber={parseNumberInput} onUpdate={(patch, images, replace) => updateMut.mutate({ id: p._id, patch, images, replace })} onDelete={() => delMut.mutate(p._id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

type RowProps = {
  p: Prod
  parseNumber: NumericParser
  onUpdate: (patch: Partial<Prod>, images?: FileList | null, replace?: boolean) => void
  onDelete: () => void
}

function Row({ p, parseNumber, onUpdate, onDelete }: RowProps) {
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(p.name)
  const [price, setPrice] = useState(String(p.price))
  const [stock, setStock] = useState(String(p.stock))
  const [files, setFiles] = useState<FileList | null>(null)
  const [replace, setReplace] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)

  const handleSave = () => {
    const priceValue = parseNumber(price)
    const stockValue = parseNumber(stock)
    if (!name.trim() || priceValue === null || stockValue === null) {
      setRowError("يرجى إدخال اسم وسعر ومخزون صالحين.")
      return
    }
    setRowError(null)
    onUpdate({ name: name.trim(), price: priceValue, stock: Math.max(0, Math.floor(stockValue)) } as any, files, replace)
    setEdit(false)
  }

  return (
    <tr className="border-t border-white/10">
      <td className="p-2">{p._id.slice(-6)}</td>
      <td className="p-2">{edit ? <input className="input" value={name} onChange={(e) => setName(e.target.value)} /> : p.name}</td>
      <td className="p-2">{edit ? <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} /> : p.price}</td>
      <td className="p-2">{edit ? <input className="input" value={stock} onChange={(e) => setStock(e.target.value)} /> : p.stock}</td>
      <td className="p-2">
        <div className="flex max-w-[220px] gap-1 overflow-x-auto">
          {p.images?.slice(0, 4).map((src, idx) => (
            <img key={idx} src={src} alt="" className="h-10 w-10 rounded object-cover" />
          ))}
        </div>
      </td>
      <td className="p-2">
        {!edit ? (
          <div className="flex gap-2">
            <button className="btn bg-white/10" onClick={() => setEdit(true)}>تعديل</button>
            <button className="btn bg-red-500/80" onClick={onDelete}>حذف</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rowError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300">{rowError}</div>}
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} /> استبدال الصور الحالية
            </label>
            <div className="flex gap-2">
              <button className="btn" onClick={handleSave}>حفظ</button>
              <button className="btn bg-white/10" onClick={() => { setEdit(false); setRowError(null) }}>إلغاء</button>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}




