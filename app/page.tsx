'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Post } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)

      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(20)

      setPosts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0f' }}>
      {/* Top Nav */}
      <div className="sticky top-0 z-40 flex justify-between items-center px-4 py-3"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e2e' }}>
        <span className="text-xl font-extrabold tracking-tight logo-gradient">☀ SunSeeker</span>
        <div className="flex gap-3">
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#1e1e2e', border: '1px solid #2a2a3a' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#1e1e2e', border: '1px solid #2a2a3a' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#FF8C00] animate-spin"
            style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
        </div>
      )}

      {/* Feed vazio */}
      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-4">
          <div className="text-6xl">🌅</div>
          <h2 className="text-xl font-bold text-white">Nenhum pôr do sol ainda</h2>
          <p className="text-sm" style={{ color: '#666' }}>
            Seja o primeiro caçador! Poste o seu pôr do sol agora.
          </p>
          <Link href="/upload" className="btn-primary mt-2" style={{ width: 'auto', padding: '12px 28px' }}>
            Postar agora
          </Link>
        </div>
      )}

      {/* Posts */}
      {!loading && posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={userId} />
      ))}

      <BottomNav />
    </div>
  )
}
