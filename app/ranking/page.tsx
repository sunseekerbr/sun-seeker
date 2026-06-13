'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { HunterRanking } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function RankingPage() {
  const [hunters, setHunters] = useState<HunterRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'sunsets' | 'rating'>('sunsets')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('hunter_ranking')
        .select('*')
        .order(tab === 'sunsets' ? 'sunset_count' : 'avg_rating', { ascending: false })
        .limit(50)
      setHunters(data ?? [])
      setLoading(false)
    }
    load()
  }, [tab])

  const top3 = hunters.slice(0, 3)
  const rest = hunters.slice(3)

  const medals = ['🥇', '🥈', '🥉']
  const podiumOrder = [top3[1], top3[0], top3[2]] // 2º, 1º, 3º

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-2xl font-extrabold text-white">Ranking</h1>
        <p className="text-sm mt-1" style={{ color: '#666' }}>Os maiores caçadores de pôr do sol 🌅</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mx-0 px-5 gap-0" style={{ borderColor: '#1e1e2e' }}>
        {(['sunsets', 'rating'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-sm font-semibold transition-colors border-b-2"
            style={{
              color: tab === t ? '#FF8C00' : '#555',
              borderColor: tab === t ? '#FF8C00' : 'transparent',
            }}>
            {t === 'sunsets' ? 'Mais pôres' : 'Melhor nota'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
        </div>
      )}

      {!loading && hunters.length === 0 && (
        <div className="text-center py-20" style={{ color: '#666' }}>
          <div className="text-4xl mb-3">🏆</div>
          <p>Ainda não há caçadores no ranking.</p>
        </div>
      )}

      {!loading && hunters.length > 0 && (
        <>
          {/* Pódio */}
          <div className="flex items-end justify-center gap-3 px-4 pt-6 pb-4">
            {podiumOrder.map((hunter, i) => {
              if (!hunter) return <div key={i} className="flex-1" />
              const realPos = [1, 0, 2][i] // posição real
              const heights = ['h-14', 'h-20', 'h-10']
              const sizes = ['w-14 h-14', 'w-16 h-16', 'w-12 h-12']
              return (
                <Link key={hunter.id} href={`/profile/${hunter.username}`}
                  className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xl">{realPos === 0 ? '👑' : ''}</span>
                  <div className={`${sizes[i]} rounded-full overflow-hidden flex-shrink-0`}
                    style={{ border: realPos === 0 ? '2px solid #FFD700' : '2px solid #2a2a3a', background: '#1e1e2e' }}>
                    {hunter.avatar_url ? (
                      <Image src={hunter.avatar_url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌅</div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white truncate max-w-[72px]">{hunter.username}</p>
                    <p className="text-xs font-bold" style={{ color: '#FF8C00' }}>
                      {tab === 'sunsets' ? `${hunter.sunset_count} 🌅` : `★ ${Number(hunter.avg_rating).toFixed(1)}`}
                    </p>
                  </div>
                  <div className={`${heights[i]} w-full rounded-t-lg flex items-center justify-center text-xl font-black`}
                    style={{
                      background: realPos === 0
                        ? 'rgba(255,215,0,0.12)'
                        : realPos === 1
                        ? 'rgba(180,180,180,0.08)'
                        : 'rgba(180,100,40,0.08)',
                      color: realPos === 0 ? 'rgba(255,215,0,0.4)' : 'rgba(150,150,150,0.3)',
                    }}>
                    {medals[realPos]}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Lista 4+ */}
          <div className="px-4">
            {rest.map((hunter, i) => (
              <Link key={hunter.id} href={`/profile/${hunter.username}`}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: '1px solid #1e1e2e' }}>
                <span className="text-sm font-bold w-6 text-center" style={{ color: '#555' }}>{i + 4}</span>
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                  style={{ background: '#1e1e2e', border: '1px solid #2a2a3a' }}>
                  {hunter.avatar_url ? (
                    <Image src={hunter.avatar_url} alt="" width={44} height={44} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">🌅</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{hunter.username}</p>
                  <p className="text-xs" style={{ color: '#666' }}>{hunter.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold" style={{ color: '#FF8C00' }}>
                    {tab === 'sunsets' ? hunter.sunset_count : Number(hunter.avg_rating).toFixed(1)}
                  </p>
                  <p className="text-[10px]" style={{ color: '#555' }}>
                    {tab === 'sunsets' ? 'pôres do sol' : 'nota média'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}
