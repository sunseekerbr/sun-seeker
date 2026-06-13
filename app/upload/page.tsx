'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [locationName, setLocationName] = useState('')
  const [sunsetTime, setSunsetTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function getLocation() {
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGettingLocation(false)
      },
      () => {
        setError('Não foi possível obter sua localização.')
        setGettingLocation(false)
      }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Escolha uma foto.'); return }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Upload da foto
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('sunset-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError('Erro ao enviar a foto. Tente novamente.')
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('sunset-photos')
      .getPublicUrl(path)

    // Salva o post
    const { error: postError } = await supabase.from('posts').insert({
      user_id: user.id,
      image_url: publicUrl,
      caption: caption || null,
      location_name: locationName || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      sunset_time: sunsetTime || null,
    })

    if (postError) {
      setError('Erro ao publicar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid #1e1e2e' }}>
        <button onClick={() => router.back()} style={{ color: '#888' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-base font-bold text-white">Novo pôr do sol</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        {/* Foto */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl overflow-hidden cursor-pointer relative"
          style={{ aspectRatio: '4/3', background: '#1a1a28', border: '2px dashed #2a2a3a' }}>
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="text-4xl">🌅</div>
              <p className="text-sm font-semibold" style={{ color: '#FF8C00' }}>Toque para escolher a foto</p>
              <p className="text-xs" style={{ color: '#555' }}>JPG ou PNG</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {/* Legenda */}
        <textarea
          placeholder="Conta como foi esse pôr do sol... 🌅"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={3}
          className="input-dark resize-none"
          style={{ borderRadius: '12px' }}
        />

        {/* Local */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome do local (ex: Praia do Rosa, SC)"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            className="input-dark flex-1"
          />
          <button
            type="button"
            onClick={getLocation}
            disabled={gettingLocation}
            className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
            style={{ background: '#1a1a28', border: '1px solid #2a2a3a' }}
            title="Usar minha localização">
            {gettingLocation ? (
              <div className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={coords ? '#FF8C00' : '#888'} strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            )}
          </button>
        </div>
        {coords && (
          <p className="text-xs" style={{ color: '#FF8C00' }}>
            📍 Localização capturada
          </p>
        )}

        {/* Horário */}
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: '#888' }}>
            Horário do pôr do sol
          </label>
          <input
            type="time"
            value={sunsetTime}
            onChange={e => setSunsetTime(e.target.value)}
            className="input-dark"
          />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading || !file}>
          {loading ? 'Publicando...' : '🌅 Publicar pôr do sol'}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
