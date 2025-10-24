import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'

type SideMenuProps = {
  open: boolean
  onClose: () => void
  user: any
  onLogout: () => void
}

export default function SideMenu({ open, onClose, user, onLogout }: SideMenuProps) {
  const navigate = useNavigate()
  const brandName = (import.meta as any).env?.VITE_BRAND_NAME as string | undefined

  const handleNavigate = (path: string) => {
    onClose()
    navigate(path)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div aria-live="polite" aria-label="قائمة جانبية">
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs sm:max-w-sm flex-col gap-6 overflow-y-auto border-l border-white/10 bg-dark2 p-6"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wide text-white/50">مرحبًا بك</p>
                <p className="text-lg font-semibold text-white">{brandName || 'متجر بسمة'}</p>
              </div>
              <button type="button" className="btn-icon" onClick={onClose} aria-label="إغلاق القائمة">X</button>
            </div>

            <nav className="space-y-4" aria-label="روابط القائمة">
              <div className="space-y-2">
                <Link
                  to="/?category=hair"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:text-accent"
                >
                  <span>العناية بالشعر</span>
                  <span className="text-white/40">&gt;</span>
                </Link>
                <Link
                  to="/?category=skin"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:text-accent"
                >
                  <span>العناية بالبشرة</span>
                  <span className="text-white/40">&gt;</span>
                </Link>
              </div>

              {!user && (
                <div className="space-y-2">
                  <button type="button" className="btn w-full" onClick={() => handleNavigate('/login')}>
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    className="btn w-full bg-white/10 text-light hover:bg-white/20"
                    onClick={() => handleNavigate('/register')}
                  >
                    إنشاء حساب
                  </button>
                </div>
              )}

              {user && (
                <div className="space-y-2">
                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      className="btn w-full"
                      onClick={() => handleNavigate('/admin')}
                    >
                      لوحة الإدارة
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn w-full bg-white/10 text-light hover:bg-white/20"
                    onClick={() => handleNavigate('/me/orders')}
                  >
                    طلباتي
                  </button>
                  <button
                    type="button"
                    className="btn w-full bg-white/10 text-light hover:bg-white/20"
                    onClick={() => handleNavigate('/me/settings')}
                  >
                    إعدادات الحساب
                  </button>
                  <button
                    type="button"
                    className="btn w-full bg-red-500/80 text-light hover:bg-red-500/90"
                    onClick={() => { onLogout(); onClose() }}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

