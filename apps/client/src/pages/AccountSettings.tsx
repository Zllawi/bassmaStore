import { useEffect } from 'react'

export default function AccountSettings() {
  useEffect(() => {
    document.title = 'إعدادات الحساب'
  }, [])

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">إعدادات الحساب</h1>
      <div className="card space-y-3 p-4 text-white/70">
        <p>هذه الصفحة قيد التطوير حالياً.</p>
        <p>نعمل على إضافة نماذج آمنة لتحديث بيانات الاتصال والعناوين وكلمة المرور قريباً.</p>
      </div>
    </section>
  )
}
