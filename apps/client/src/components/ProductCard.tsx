import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useCart } from "../features/cart/useCart"
import { formatCurrency } from "../utils/currency"

export type Product = {
  _id: string
  name: string
  price: number
  images: string[]
  slug: string
}

export default function ProductCard({ product, onQuick }: { product: Product; onQuick?: (p: Product) => void }) {
  const { addItem } = useCart()

  return (
    <motion.div
      layout
      className="card flex h-full flex-col gap-4 p-4 sm:p-5"
      aria-label="بطاقة منتج"
    >
      <Link to={`/product/${product._id}`} aria-label="تفاصيل المنتج" className="block overflow-hidden rounded-xl">
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-tight text-white sm:text-lg">{product.name}</h3>
          <p className="text-sm text-white/60 sm:text-base">تسوقه الآن بسعر خاص</p>
          <p className="text-lg font-semibold text-accent sm:text-xl">{formatCurrency(product.price)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="btn w-full sm:flex-1"
            onClick={() => addItem({ id: product._id, name: product.name, price: product.price, image: product.images?.[0] })}
          >
            أضف إلى السلة
          </button>
          <button
            className="btn bg-white/10 text-light hover:bg-white/20 sm:w-36"
            onClick={() => onQuick?.(product)}
            aria-label="نظرة سريعة"
          >
            نظرة سريعة
          </button>
        </div>
      </div>
    </motion.div>
  )
}






