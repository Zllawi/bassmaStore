import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  images?: string[]
  alt?: string
  className?: string
  loop?: boolean
  showThumbs?: boolean
  aspect?: string
  autoPlay?: boolean
  intervalMs?: number
  pauseOnHover?: boolean
}

export default function ImageCarousel({
  images,
  alt = '',
  className = '',
  loop = true,
  showThumbs = false,
  aspect = 'aspect-[4/3]',
  autoPlay = true,
  intervalMs = 3500,
  pauseOnHover = true
}: Props) {
  const slides = useMemo(() => (images && images.length ? images : ['/placeholder.svg']), [images])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)

  const go = (dir: 1 | -1) => {
    setDirection(dir)
    setIndex((i) => {
      const next = i + dir
      if (loop) return (next + slides.length) % slides.length
      return Math.min(Math.max(next, 0), slides.length - 1)
    })
  }

  const goto = (i: number) => {
    if (i === index) return
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return
    if (pauseOnHover && paused) return
    const id = setInterval(() => go(1), Math.max(1500, intervalMs))
    return () => clearInterval(id)
  }, [autoPlay, intervalMs, slides.length, paused])

  return (
    <div
      className={`select-none ${className}`}
      aria-roledescription="carousel"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <motion.div
          className={`${aspect} w-full`}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1)
            else if (info.offset.x > 50) go(-1)
          }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={slides[index]}
              src={slides[index]}
              alt={alt}
              className="h-full w-full object-cover"
              custom={direction}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </AnimatePresence>
        </motion.div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="السابق"
              className="btn-icon absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="التالي"
              className="btn-icon absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
              onClick={() => go(1)}
            >
              ›
            </button>
          </>
        )}
      </div>

      {showThumbs && slides.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto p-1">
          {slides.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`عرض الصورة ${i + 1}`}
              onClick={() => goto(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border ${
                i === index ? 'border-accent ring-2 ring-accent/60' : 'border-white/10'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
