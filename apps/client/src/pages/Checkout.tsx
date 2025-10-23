import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../features/cart/useCart'
import api from '../services/api'
import { formatCurrency } from '../utils/currency'

export default function Checkout() {
  const { items, total, clear } = useCart()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      const u = raw ? JSON.parse(raw) : null
      if (!u?.accessToken) navigate('/login')
    } catch {
      navigate('/login')
    }
  }, [navigate])

  const canSubmit = useMemo(() => items.length > 0, [items])

  const  placeOrder  =  async  ()  =>  {
    setError('')
    setSuccess('')
    try  {
      const  payload  =  {
        items:  items.map(i  =>  ({  productId:  i.id,  qty:  i.qty,  price:  i.price  })),
        total
      }
      await  api.post('/orders',  payload)
      clear()
      setSuccess('تم  إرسال  طلبك  بنجاح،  سيتم  تحويلك  إلى  صفحة  الطلبات.')
      setTimeout(()  =>  navigate('/me/orders'),  800)
    }  catch  (e:  any)  {
      setError(e?.response?.data?.message  ||  'تعذّر  تنفيذ  الطلب،  يرجى  المحاولة  مجدداً.')
    }
  }

  return  (
    <div  className="mx-auto  max-w-2xl  space-y-4">
      <h1  className="text-2xl font-bold text-white">إتمام الشراء</h1>
      {items.length === 0 ? (
        <div  className="card  p-4">
          لا  توجد  منتجات  في  سلة  التسوق  حالياً.{'  '}
          <Link  to="/"  className="text-accent">تسوّق  الآن</Link>
        </div>
      )  :  (
        <>
          <div  className="card  p-4">
            <h2  className="mb-2  font-semibold  text-white">ملخص  الطلب</h2>
            <ul  className="space-y-2  text-sm  text-white/80">
              {items.map(item  =>  (
                <li  key={item.id}  className="flex  justify-between">
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatCurrency(item.price  *  item.qty)}</span>
                </li>
              ))}
            </ul>
            <div  className="mt-3  flex  justify-between  font-medium">
              <span>الإجمالي  الكلي</span>
              <span  className="text-accent">{formatCurrency(total)}</span>
            </div>
          </div>

          <div  className="card  space-y-3  p-4">
            <h2  className="font-semibold  text-white">تأكيد  البيانات</h2>
            <div  className="text-sm  text-white/70">
              سيتم  استخدام  معلوماتك  المحفوظة  لإكمال  الشحن  والدفع.  يرجى  التأكد  من  تحديث  العناوين  قبل  إرسال  الطلب.
            </div>
            {error  &&  <div  className="text-sm  text-red-400">{error}</div>}
            {success  &&  <div  className="text-sm  text-green-400">{success}</div>}
            <button  className="btn  w-full"  disabled={!canSubmit}  onClick={placeOrder}>
              تأكيد  وإرسال  الطلب
            </button>
          </div>
        </>
      )}
    </div>
  )
}












