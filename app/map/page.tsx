'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Location } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selected, setSelected] = useState<Location | null>(null)
  const [filter, setFilter] = useState('todos')
  const supabase = createClient()

  useEffect(() => {
    async function loadLocations() {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .order('avg_rating', { ascending: false })
        .limit(100)
      setLocations(data ?? [])
    }
    loadLocations()
  }, [])

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || token === 'COLE_SEU_TOKEN_DO_MAPBOX_AQUI') return

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css')
      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-48.5, -15.8],
        zoom: 4,
      })

      locations.forEach((loc) => {
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="background:#FF8C00;color:#fff;font-size:11px;font-weight:700;
            padding:4px 8px;border-radius:20px;white-space:nowrap;cursor:pointer;
            box-shadow:0 2px 8px rgba(255,140,0,0.4)">
            ★ ${Number(loc.avg_rating).toFixed(1)}
          </div>
        `
        el.addEventListener('click', () => setSelected(loc))

        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map)
      })

      return () => map.remove()
    })
  }, [locations])

  const filters = ['todos', 'praia', 'montanha', 'cidade', 'campo']

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Search bar */}
      <div className="px-4 pt-14 pb-3 sticky top-0 z-20"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-full"
          style={{ background: '#1a1a28', border: '1px solid #2a2a3a' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-sm" style={{ color: '#555' }}>Buscar locais de pôr do sol...</span>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 capitalize transition-all"
              style={{
                background: filter === f ? 'rgba(255,140,0,0.15)' : '#1a1a28',
                border: `1px solid ${filter === f ? '#FF8C00' : '#2a2a3a'}`,
                color: filter === f ? '#FF8C00' : '#888',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="relative flex-1" style={{ height: '42vh' }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Placeholder se Mapbox não configurado */}
        {(!process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN === 'COLE_SEU_TOKEN_DO_MAPBOX_AQUI') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: '#0d1117' }}>
            <div className="text-4xl">🗺️</div>
            <p className="text-sm font-semibold text-white">Mapa em breve</p>
            <p className="text-xs text-center px-8" style={{ color: '#555' }}>
              Configure o token do Mapbox no .env.local
            </p>
          </div>
        )}
      </div>

      {/* Card do local selecionado */}
      {selected && (
        <div className="mx-4 mt-3 p-4 rounded-2xl flex items-center gap-3"
          style={{ background: '#1a1a28', border: '1px solid #FF8C00' }}>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{selected.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>{selected.city}, {selected.state}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,140,0,0.15)', color: '#FF8C00' }}>
                ★ {Number(selected.avg_rating).toFixed(1)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,77,109,0.15)', color: '#FF4D6D' }}>
                {selected.photo_count} fotos
              </span>
            </div>
          </div>
          <button onClick={() => setSelected(null)} style={{ color: '#555' }}>✕</button>
        </div>
      )}

      {/* Lista de locais */}
      <div className="px-4 mt-4 pb-28">
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#555' }}>
          Melhores avaliados
        </p>
        {locations.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#555' }}>
            Nenhum local cadastrado ainda. Poste um pôr do sol com localização!
          </p>
        )}
        {locations.map((loc) => (
          <div key={loc.id}
            onClick={() => setSelected(loc)}
            className="flex items-center gap-3 p-3 mb-2 rounded-2xl cursor-pointer transition-all"
            style={{ background: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #c44d32, #f5a623)' }}>
              🌅
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{loc.name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: '#888' }}>
                {loc.city}{loc.state ? `, ${loc.state}` : ''}
              </p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-xs font-bold" style={{ color: '#FF8C00' }}>★ {Number(loc.avg_rating).toFixed(1)}</span>
                <span className="text-xs" style={{ color: '#555' }}>{loc.photo_count} fotos</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
