import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
}

export default function Modal({ open, onClose, children, ariaLabel = '‰«›–… ÕÊ«—' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div aria-modal="true" role="dialog" aria-label={ariaLabel}>
          <motion.div
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="card relative w-full max-w-2xl p-4">
              <button
                type="button"
                className="btn-icon absolute right-4 top-4 h-10 w-10"
                aria-label="≈€·«ﬁ «·‰«›–…"
                onClick={onClose}
              >
                X
              </button>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

