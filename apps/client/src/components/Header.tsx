import { FormEvent, useEffect, useRef, useState } from "react"
import { Link, createSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useCart } from "../features/cart/useCart"
import SideMenu from "./SideMenu"

type IconProps = { className?: string }

function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1 3m2 10h10a1 1 0 0 0 .96-.72L21 8H6" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="18" cy="19" r="1.4" />
    </svg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="6" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  )
}

function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 7.07-1.41-1.41M6.34 6.34 4.93 4.93m12.73 0-1.41 1.41M6.34 17.66l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

const categories = [
  { label: "منتجات الشعر", value: "hair" },
  { label: "منتجات البشرة", value: "skin" }
]

export default function Header() {
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("theme") as "dark" | "light") || "dark")
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { totalQty, toggleDrawer } = useCart()
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const desktopInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (!searchOpen || typeof window === "undefined") return
    const target = window.matchMedia("(max-width: 767px)").matches ? mobileInputRef.current : desktopInputRef.current
    target?.focus()
  }, [searchOpen])

  useEffect(() => {
    try { localStorage.setItem("theme", theme) } catch {}
    const body = document.body
    if (theme === "light") body.classList.add("theme-light")
    else body.classList.remove("theme-light")
  }, [theme])

  let user: any = null
  try {
    const raw = localStorage.getItem("auth")
    user = raw ? JSON.parse(raw) : null
  } catch {}

  const isAdmin = !!user && user.role === "admin"

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate({ pathname: "/", search: createSearchParams({ q: query }).toString() })
    setSearchOpen(false)
  }

  const onLogout = () => {
    try { localStorage.removeItem("auth") } catch {}
    navigate("/login")
  }

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"))

  const handleSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!searchOpen) {
      e.preventDefault()
      setSearchOpen(true)
    }
  }

  const renderSearchForm = (variant: "mobile" | "desktop") => {
    const isMobile = variant === "mobile"
    const inputRef = isMobile ? mobileInputRef : desktopInputRef

    return (
      <motion.form
        key={variant}
        onSubmit={onSubmit}
        initial={false}
        animate={{
          width: searchOpen ? (isMobile ? "100%" : "320px") : "44px",
          paddingLeft: searchOpen ? 12 : 0,
          paddingRight: searchOpen ? 44 : 0
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={`relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-dark1/80 shadow-sm backdrop-blur-sm ${isMobile ? "flex md:hidden" : "hidden md:flex"} ${searchOpen ? "ring-1 ring-accent/40" : ""}`}
        style={isMobile ? { flexGrow: searchOpen ? 1 : 0 } : undefined}
        aria-expanded={searchOpen}
      >
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-white placeholder:text-white/60 focus:outline-none transition-all duration-200 pr-12"
          style={{
            opacity: searchOpen ? 1 : 0,
            width: searchOpen ? "100%" : "0%",
            marginInlineStart: searchOpen ? "0.75rem" : "0",
            pointerEvents: searchOpen ? "auto" : "none"
          }}
          placeholder="ابحث عن منتج أو فئة"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-hidden={!searchOpen}
          tabIndex={searchOpen ? 0 : -1}
        />
        <button
          type="submit"
          className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition-colors ${searchOpen ? "bg-accent/20 text-accent" : "text-white/70 hover:text-accent"}`}
          aria-label="تنفيذ البحث"
          onClick={handleSearchButtonClick}
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </motion.form>
    )
  }

  const logo = (import.meta as any).env?.VITE_BRAND_LOGO as string | undefined
  const brandName = (import.meta as any).env?.VITE_BRAND_NAME as string | undefined
  const brandLabel = brandName || "متجر الأفق"
  const logoSrc = logo || "/logo.png"

  return (
    <header className="bg-dark2/80 backdrop-blur border-b border-white/10 sticky top-0 z-40" role="banner">
      <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-4 md:flex-nowrap">
        <div className="flex w-full items-center gap-3">
          <div className="flex items-center gap-3 md:w-auto">
            <button type="button" className="btn-icon md:hidden" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة الجانبية">
              <MenuIcon className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-3" aria-label="العودة للصفحة الرئيسية">
              <img src={logoSrc} alt={brandLabel} className="h-11 w-auto rounded-xl border border-white/10 bg-white/10 p-2" />
              <span className="whitespace-nowrap text-base font-semibold text-white sm:text-lg">{brandLabel}</span>
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            {renderSearchForm("mobile")}
            <button type="button" className="btn-icon" onClick={toggleDrawer} aria-label="فتح سلة المشتريات">
              <CartIcon className="h-5 w-5" />
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-dark2">
                  {totalQty}
                </span>
              )}
            </button>
            <button type="button" className="btn-icon" aria-label="تبديل نمط الواجهة" onClick={toggleTheme}>
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="hidden w-auto gap-6 text-sm font-medium text-white md:flex" aria-label="روابط الأقسام">
          {categories.map(cat => (
            <Link
              key={cat.value}
              to={`/?category=${cat.value}`}
              className="whitespace-nowrap rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-accent"
            >
              {cat.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="whitespace-nowrap rounded-xl bg-white/10 px-3 py-2 text-light transition hover:bg-white/15">
              لوحة التحكم
            </Link>
          )}
        </nav>

        <div className="order-last hidden items-center gap-2 md:order-none md:flex">
          {renderSearchForm("desktop")}
          <button type="button" className="btn-icon" aria-label="تبديل نمط الواجهة" onClick={toggleTheme}>
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <button type="button" className="btn whitespace-nowrap bg-white/10 px-5 text-sm text-light" onClick={onLogout}>
              تسجيل خروج
            </button>
          ) : (
            <>
              <Link to="/login" className="btn whitespace-nowrap bg-white/10 px-5 text-sm text-light">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="btn whitespace-nowrap px-5 text-sm">
                إنشاء حساب
              </Link>
            </>
          )}

          <button type="button" className="btn-icon" onClick={toggleDrawer} aria-label="فتح سلة المشتريات">
            <CartIcon className="h-5 w-5" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-dark2">
                {totalQty}
              </span>
            )}
          </button>
        </div>
      </div>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} />
    </header>
  )
}
