import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../features/cart/useCart'
import { formatCurrency } from '../utils/currency'

export default function CartDrawer() {
  const { drawerOpen, toggleDrawer, items, total, inc, dec, remove, clear } = useCart()
  const navigate = useNavigate()

  const goCheckout = () => {
    toggleDrawer()
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div aria-live="polite" aria-label="سلة المشتريات">
          <motion.div
            className="fixed inset-0 bg-black/60"
            onClick={toggleDrawer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="fixed right-0 top-0 h-full w-full overflow-auto border-l border-white/10 bg-dark2 p-4 sm:w-[420px]"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">سلة المشتريات</h2>
              <button
                type="button"
                className="btn-icon h-10 w-10"
                onClick={toggleDrawer}
                aria-label="سلة المشتريات"
              >
                X
              </button>
            </div>

            <ul className="space-y-3">
              {items.map(item => (
                <li key={item.id} className="card p-3">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-white/60">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-ghost h-10 w-10"
                        onClick={() => dec(item.id)}
                        aria-label="سلة المشتريات"
                      >
                        -
                      </button>
                      <span aria-live="polite" className="w-6 text-center text-white">
                        {item.qty}
                      </span>
                      <button
                        className="btn-ghost h-10 w-10"
                        onClick={() => inc(item.id)}
                        aria-label="سلة المشتريات"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn-ghost bg-red-500/80 text-light hover:bg-red-500/90"
                      onClick={() => remove(item.id)}
                      aria-label="سلة المشتريات"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-white/80">
                الإجمالي: <span className="text-accent font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={clear}>
                  تفريغ
                </button>
                <button className="btn" onClick={goCheckout}>
                  إتمام الشراء
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}




