'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'
import type { Post } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

const MapLeaflet = dynamic(() => import('@/components/MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
    </div>
  ),
})

export default function MapPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Busca posts que têm coordenadas geográficas
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('avg_rating', { ascending: false })
        .limit(200)
      setPosts(data ?? [])
      setLoading(false)
    }
    load()
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
      <div className="relative" style={{ height: '45vh', zIndex: 10 }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d1117' }}>
            <div className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: '#0d1117' }}>
            <div className="text-4xl">🗺️</div>
            <p className="text-sm font-semibold text-white">Nenhum pôr do sol no mapa ainda</p>
            <p className="text-xs text-center px-8" style={{ color: '#555' }}>
              Poste fotos com localização para aparecerem aqui
            </p>
          </div>
        ) : (
          <MapLeaflet posts={posts} />
        )}
      </div>

      {/* Card do post selecionado (reservado para futuro click na lista) */}
      {selected && (
        <div className="mx-4 mt-3 p-4 rounded-2xl flex items-center gap-3"
          style={{ background: '#1a1a28', border: '1px solid #FF8C00' }}>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{selected.location_name ?? 'Sem nome'}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>@{selected.profiles?.username}</p>
            {selected.avg_rating > 0 && (
              <span className="text-xs font-bold mt-1 inline-block"
                style={{ color: '#FF8C00' }}>
                ★ {Number(selected.avg_rating).toFixed(1)}
              </span>
            )}
          </div>
          <button onClick={() => setSelected(null)} style={{ color: '#555', fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Lista de posts com localização */}
      <div className="px-4 mt-4 pb-28 flex-1">
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#555' }}>
          {posts.length > 0 ? `${posts.length} pôres do sol no mapa` : 'Nenhum local ainda'}
        </p>

        {posts.map((post) => (
          <a key={post.id} href={`/post/${post.id}`}
            className="flex items-center gap-3 p-3 mb-2 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: '#1a1a28', border: '1px solid #2a2a3a', textDecoration: 'none' }}>
            <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden">
              <img src={post.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {post.location_name ?? 'Local não informado'}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: '#888' }}>
                @{post.profiles?.username}
              </p>
              <div className="flex gap-2 mt-1.5">
                {post.avg_rating > 0 && (
                  <span className="text-xs font-bold" style={{ color: '#FF8C00' }}>
                    ★ {Number(post.avg_rating).toFixed(1)}
                  </span>
                )}
                <span className="text-xs" style={{ color: '#555' }}>
                  {post.likes_count} ❤️
                </span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
