export default function Footer() {
  const brand = (import.meta as any).env?.VITE_BRAND_NAME || 'متجر الأفق'
  return (
    <footer className="border-t border-white/10 bg-dark2" role="contentinfo">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-8 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
        <nav className="flex gap-4" aria-label="روابط التذييل">
          <a href="#" className="hover:text-accent">تواصل معنا</a>
          <a href="#" className="hover:text-accent">سياسة الخصوصية</a>
          <a href="#" className="hover:text-accent">الشروط والأحكام</a>
        </nav>
        <p>{'©'} {new Date().getFullYear()} {brand} - جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  )
}


