import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import api from "../services/api"
import ProductCard, { Product } from "../components/ProductCard"
import ImageCarousel from "../components/ImageCarousel"
import { formatCurrency } from "../utils/currency"
import Modal from "../components/Modal"

export default function Home() {
  const [params] = useSearchParams()
  const [quick, setQuick] = useState<Product | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ["products", params.toString()],
    queryFn: async () => (await api.get("/products", { params: Object.fromEntries(params.entries()) })).data
  })

  const brandName = (import.meta as any).env?.VITE_BRAND_NAME as string | undefined
  useEffect(() => {
    document.title = brandName || "متجر بسمة"
  }, [brandName])

  const products = useMemo<Product[]>(() => data?.data || [], [data])
  const heroImages = useMemo(() => (products || []).map(p => p.images?.[0]).filter(Boolean) as string[], [products])

  return (
    <div className="space-y-10 px-2 pb-12 sm:px-0">
      {!!heroImages.length && (
        <section className="container mx-auto max-w-4xl">
          <ImageCarousel images={heroImages} alt="" className="w-full" aspect="aspect-[21/9]" fit="contain" />
        </section>
      )}
      <section className="card bg-gradient-to-br from-accent/15 via-transparent to-dark2/40 p-6 text-center sm:p-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">عناية متكاملة لجمالك اليومي</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          استكشف مجموعة منتقاة بعناية من المنتجات التي تلائم مختلف احتياجات العناية. {brandName ? `${brandName} يهتم بتجديد روتينك كل يوم.` : "ابدأ يومك بروتين متكامل بخطوات بسيطة."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a className="btn w-full max-w-[220px] sm:w-auto" href="/?category=hair">تسوق منتجات الشعر</a>
          <a className="btn w-full max-w-[220px] bg-white/10 text-light hover:bg-white/20 sm:w-auto" href="/?category=skin">تسوق منتجات البشرة</a>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
          <span className="font-medium text-white">تصفية سريعة</span>
          <div className="flex flex-wrap gap-2">
            <a className="btn bg-white/10 text-light hover:bg-white/20" href="?sort=price">الأقل سعراً</a>
            <a className="btn bg-white/10 text-light hover:bg-white/20" href="?sort=-createdAt">الأحدث</a>
          </div>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-dark2/60 px-4 py-6 text-center text-white/60">جار تحميل المنتجات...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product._id} product={product} onQuick={setQuick} />
            ))}
          </div>
        )}
      </section>

      <Modal open={!!quick} onClose={() => setQuick(null)} ariaLabel="نظرة سريعة على المنتج">
        {quick && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="sm:w-72 w-full">
              <ImageCarousel images={quick.images} alt={quick.name} aspect="aspect-square" fit="contain" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">{quick.name}</h3>
              <p className="text-accent text-lg">{formatCurrency(quick.price)}</p>
              <p className="text-white/60">استعرض تفاصيل المنتج بسرعة قبل إضافته لسلة مشترياتك.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}





