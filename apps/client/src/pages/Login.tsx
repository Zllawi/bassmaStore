import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('auth', JSON.stringify(res.data.data))
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'ÊÚĞøÑ ÊÓÌíá ÇáÏÎæá¡ íÑÌì ÇáÊÍŞŞ ãä ÇáÈíÇäÇÊ æÇáãÍÇæáÉ ãÑÉ ÃÎÑì.')
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="card space-y-5 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">ÊÓÌíá ÇáÏÎæá Åáì ÍÓÇÈß</h1>
          <p className="text-sm text-white/60">ÊÇÈÚ ØáÈÇÊß æÇÍİÙ ÚäÇæíäß æÊãÊÚ ÈÊÌÑÈÉ ÊÓæŞ ÃÓåá.</p>
        </header>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="ÇáÈÑíÏ ÇáÅáßÊÑæäí"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="ßáãÉ ÇáãÑæÑ"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="btn w-full" type="submit">ÊÓÌíá ÇáÏÎæá</button>
        </form>
      </div>

      <p className="text-center text-sm text-white/70">
        ãÓÊÎÏã ÌÏíÏ¿{' '}
        <Link to="/register" className="text-accent hover:underline">ÃäÔÆ ÍÓÇÈß ÇáÂä</Link>
      </p>
    </section>
  )
}

