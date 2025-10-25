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
        <div aria-live="polite" aria-label="ظ‚ط§ط¦ظ…ط© ط¬ط§ظ†ط¨ظٹط©">
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
                <p className="text-xs tracking-wide text-white/50">ظ…ط±ط­ط¨ظ‹ط§ ط¨ظƒ</p>
                <p className="text-lg font-semibold text-white">{brandName || 'ظ…طھط¬ط± ط¨ط³ظ…ط©'}</p>
              </div>
              <button type="button" className="btn-icon" onClick={onClose} aria-label="ط¥ط؛ظ„ط§ظ‚ ط§ظ„ظ‚ط§ط¦ظ…ط©">X</button>
            </div>

            <nav className="space-y-4" aria-label="ط±ظˆط§ط¨ط· ط§ظ„ظ‚ط§ط¦ظ…ط©">
              <div className="space-y-2">\r\n                <Link to="/" onClick={onClose} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:text-accent">\r\n                  <span>الكل</span>\r\n                  <span className="text-white/40">&gt;</span>\r\n                </Link>
                <Link
                  to="/?category=hair"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:text-accent"
                >
                  <span>ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط´ط¹ط±</span>
                  <span className="text-white/40">&gt;</span>
                </Link>
                <Link
                  to="/?category=skin"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:text-accent"
                >
                  <span>ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ط´ط±ط©</span>
                  <span className="text-white/40">&gt;</span>
                </Link>
              </div>

              {!user && (
                <div className="space-y-2">
                  <button type="button" className="btn w-full" onClick={() => handleNavigate('/login')}>
                    طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
                  </button>
                  <button
                    type="button"
                    className="btn w-full bg-white/10 text-light hover:bg-white/20"
                    onClick={() => handleNavigate('/register')}
                  >
                    ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨
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
                      ظ„ظˆط­ط© ط§ظ„ط¥ط¯ط§ط±ط©
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn w-full bg-white/10 text-light hover:bg-white/20"
                    onClick={() => handleNavigate('/me/orders')}
                  >
                    ط·ظ„ط¨ط§طھظٹ
                  </button>
                  <button
                    type="button"
                    className="btn w-full bg-white/10 text-light hover:bg-white/20"
                    onClick={() => handleNavigate('/me/settings')}
                  >
                    ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط­ط³ط§ط¨
                  </button>
                  <button
                    type="button"
                    className="btn w-full bg-red-500/80 text-light hover:bg-red-500/90"
                    onClick={() => { onLogout(); onClose() }}
                  >
                    طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬
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


