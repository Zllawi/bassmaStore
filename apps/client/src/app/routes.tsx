import React, { Suspense, lazy } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import CartDrawer from "../components/CartDrawer"

const Home = lazy(() => import("../pages/Home"))
const ProductDetails = lazy(() => import("../pages/ProductDetails"))
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"))
const Login = lazy(() => import("../pages/Login"))
const Register = lazy(() => import("../pages/Register"))
const Checkout = lazy(() => import("../pages/Checkout"))
const MyOrders = lazy(() => import("../pages/MyOrders"))
const AccountSettings = lazy(() => import("../pages/AccountSettings"))

function AdminRoute({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem("auth")
  const user = auth ? JSON.parse(auth) : null
  if (!user?.accessToken || user?.role !== "admin") return <Navigate to="/login" replace />
  return <>{children}</>
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem("auth")
  const user = auth ? JSON.parse(auth) : null
  if (!user?.accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <CartDrawer />
      <main className="container mx-auto flex-1 px-4 py-6">
        <Suspense fallback={<div role="status" aria-live="polite">جاري تحميل المحتوى...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
            <Route path="/me/orders" element={<UserRoute><MyOrders /></UserRoute>} />
            <Route path="/me/settings" element={<UserRoute><AccountSettings /></UserRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}