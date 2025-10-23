import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [addressDescription, setAddressDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/register', { name, email, password, phone, city, region, addressDescription })
      localStorage.setItem('auth', JSON.stringify(res.data.data))
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || '����� ����� �����ȡ ���� ������ �� �������� ��������� �� ����.')
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div className="card space-y-5 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">����� ���� ����</h1>
          <p className="text-sm text-white/60">���� ������ ������ ����� ������� ������ ������ �����.</p>
        </header>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <input className="input" placeholder="����� ������" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input" placeholder="������ ����������" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" placeholder="���� ������" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <input className="input" placeholder="��� ������" value={phone} onChange={e => setPhone(e.target.value)} required />
          <input className="input" placeholder="�������" value={city} onChange={e => setCity(e.target.value)} required />
          <input className="input" placeholder="���� / �������" value={region} onChange={e => setRegion(e.target.value)} required />
          <textarea className="input sm:col-span-2" placeholder="������ �������" rows={3} value={addressDescription} onChange={e => setAddressDescription(e.target.value)} required />
          <button className="btn sm:col-span-2" type="submit">����� ������</button>
        </form>
      </div>

      <p className="text-center text-sm text-white/70">
        ���� ���� ������{' '}
        <Link to="/login" className="text-accent hover:underline">���� ������ ����</Link>
      </p>
    </section>
  )
}

