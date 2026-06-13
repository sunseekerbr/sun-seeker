'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Location } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selected, setSelected] = useState<Location | null>(null)
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadLocations() {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .order('avg_rating', { ascending: false })
        .limit(100)
      setLocations(data ?? [])
      setLoading(false)
    }
    loadLocations()
  }, [])

  const filters = ['todos', 'praia', 'montanha', 'cidade', 'campo']

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Search bar */}
      <div className="px-4 pt-14 pb-3 sticky top-0 z-20"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e2e' }}>
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

      {/* Mapa placeholder */}
      <div className="relative flex items-center justify-center"
        style={{ height: '38vh', background: '#0d1117', borderBottom: '1px solid #1e1e2e' }}>
        {/* Grid decorativo */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,140,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,0,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
          <div className="text-5xl">🗺️</div>
          <p className="text-base font-bold text-white">Mapa interativo</p>
          <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
            Configure o token do Mapbox no painel da Vercel{'\n'}em Environment Variables para ativar o mapa.
          </p>
        </div>

        {/* Pins decorativos */}
        {[
          { top: '28%', left: '20%', rating: '9.8' },
          { top: '45%', left: '55%', rating: '9.4' },
          { top: '62%', left: '35%', rating: '9.1' },
          { top: '30%', left: '72%', rating: '8.9' },
        ].map((pin, i) => (
          <div key={i} className="absolute flex flex-col items-center"
            style={{ top: pin.top, left: pin.left, transform: 'translate(-50%,-100%)' }}>
            <div className="px-2 py-1 rounded-full text-xs font-bold"
              style={{ background: '#FF8C00', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,0,0.4)' }}>
              ★ {pin.rating}
            </div>
            <div className="w-0.5 h-2" style={{ background: '#FF8C00' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF8C00' }} />
          </div>
        ))}
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
      <div className="px-4 mt-4 pb-28 flex-1">
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#555' }}>
          Melhores avaliados
        </p>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
          </div>
        )}

        {!loading && locations.length === 0 && (
          <div className="text-center py-12" style={{ color: '#555' }}>
            <div className="text-4xl mb-3">📍</div>
            <p className="text-sm">Nenhum local cadastrado ainda.</p>
            <p className="text-xs mt-1">Poste um pôr do sol com localização!</p>
          </div>
        )}

        {locations.map((loc) => (
          <div key={loc.id}
            onClick={() => setSelected(loc)}
            className="flex items-center gap-3 p-3 mb-2 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
            style={{ background: '#1a1a28', border: `1px solid ${selected?.id === loc.id ? '#FF8C00' : '#2a2a3a'}` }}>
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
                <span className="text-xs font-bold" style={{ color: '#FF8C00' }}>
                  ★ {Number(loc.avg_rating).toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: '#555' }}>
                  {loc.photo_count} fotos
                </span>
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
