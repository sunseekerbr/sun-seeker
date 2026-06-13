'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Verifica se username já existe
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existing) {
      setError('Esse username já está em uso.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ background: '#0a0a0f' }}>
        <div className="text-5xl">📬</div>
        <h2 className="text-2xl font-bold text-white">Confirme seu email</h2>
        <p className="text-sm" style={{ color: '#888' }}>
          Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.<br/>
          Clique no link e depois faça login.
        </p>
        <Link href="/login" className="btn-primary mt-4" style={{ width: 'auto', padding: '12px 28px' }}>
          Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0f' }}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌅</div>
        <h1 className="text-3xl font-extrabold logo-gradient tracking-tight">SunSeeker</h1>
        <p className="text-sm mt-2" style={{ color: '#666' }}>Crie sua conta de caçador</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome completo"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="input-dark"
            required
          />
          <input
            type="text"
            placeholder="@username"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            className="input-dark"
            required
            minLength={3}
            maxLength={20}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-dark"
            required
          />
          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-dark"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm mt-2" style={{ color: '#666' }}>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold" style={{ color: '#FF8C00' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
