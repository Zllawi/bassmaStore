import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatCurrency } from '../utils/currency'
import ImageCarousel from '../components/ImageCarousel'
import { useCart } from '../features/cart/useCart'

export default function ProductDetails() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data,
    enabled: !!id
  })

  if (isLoading) return <div>جاري تحميل تفاصيل المنتج...</div>
  const product = data?.data
  if (!product) return <div>لم يتم العثور على المنتج المطلوب.</div>

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ImageCarousel images={product.images} alt={product.name} className="w-full" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">{product.name}</h1>
        <p className="text-accent text-2xl">{formatCurrency(product.price)}</p>
        <p className="text-white/70">{product.description || 'لا يتوفر وصف لهذا المنتج.'}</p>
        <button
          className="btn"
          onClick={() => addItem({ id: product._id, name: product.name, price: product.price, image: product.images?.[0] })}
        >
          أضف للسلة
        </button>
      </div>
    </div>
  )
}




