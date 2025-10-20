import axios from 'axios'

const baseURL = (() => {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE
  return import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1'
})()

const api = axios.create({
  baseURL,
  withCredentials: true
})

api.interceptors.request.use(cfg => {
  const auth = localStorage.getItem('auth')
  if (auth) {
    const { accessToken } = JSON.parse(auth)
    if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`
  }
  return cfg
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const r = await api.post('/auth/refresh')
        const newAT = r?.data?.data?.accessToken
        if (newAT) {
          // persist new access token
          const raw = localStorage.getItem('auth')
          const current = raw ? JSON.parse(raw) : {}
          const next = { ...current, accessToken: newAT }
          localStorage.setItem('auth', JSON.stringify(next))
          // set header for retry explicitly (in case request interceptor doesn't run)
          original.headers = original.headers || {}
          original.headers.Authorization = `Bearer ${newAT}`
        }
        return api(original)
      } catch (e) {
        localStorage.removeItem('auth')
      }
    }
    return Promise.reject(err)
  }
)

export default api
