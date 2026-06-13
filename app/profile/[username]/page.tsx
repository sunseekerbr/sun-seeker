'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Profile, Post } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user?.id ?? null)

      // Se for /profile/me, redireciona pro username real
      if (username === 'me' && user) {
        const { data: p } = await supabase
          .from('profiles').select('username').eq('id', user.id).single()
        if (p) { router.replace(`/profile/${p.username}`); return }
        router.replace('/login')
        return
      }

      const { data: p } = await supabase
        .from('profiles').select('*').eq('username', username).single()
      if (!p) { setLoading(false); return }
      setProfile(p)
      setFollowersCount(p.followers_count ?? 0)

      const { data: userPosts } = await supabase
        .from('posts').select('*')
        .eq('user_id', p.id)
        .order('created_at', { ascending: false })
      setPosts(userPosts ?? [])

      // Checa se usuário logado já segue este perfil
      if (user && user.id !== p.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', p.id)
          .maybeSingle()
        setIsFollowing(!!followData)
      }

      setLoading(false)
    }
    load()
  }, [username])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleFollow() {
    if (!currentUser) { router.push(`/login?next=/profile/${username}`); return }
    if (!profile) return

    if (isFollowing) {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUser)
        .eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowersCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('follows')
        .insert({ follower_id: currentUser, following_id: profile.id })
      setIsFollowing(true)
      setFollowersCount(c => c + 1)
    }
  }

  const isOwn = currentUser === profile?.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-8"
        style={{ background: '#0a0a0f' }}>
        <div className="text-4xl">😔</div>
        <p className="text-white font-bold">Caçador não encontrado</p>
        <Link href="/" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Voltar</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0f' }}>
      {/* Capa */}
      <div className="w-full h-44 relative"
        style={{ background: 'linear-gradient(180deg, #4a1560 0%, #c44d32 50%, #f5a623 100%)' }}>
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0a0a0f 0%, transparent 60%)' }} />

        {/* Botão voltar / logout */}
        <div className="absolute top-12 left-4 right-4 flex justify-between">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          {isOwn && (
            <button onClick={handleLogout} className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
              Sair
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
          <div className="story-ring p-0.5" style={{ display: 'inline-block', borderRadius: '50%' }}>
            <div className="w-20 h-20 rounded-full overflow-hidden"
              style={{ background: '#1e1e2e', border: '3px solid #0a0a0f' }}>
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🌅</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-center px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-white">{profile.full_name || profile.username}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#FF8C00' }}>@{profile.username}</p>
        {profile.bio && <p className="text-sm mt-2 leading-relaxed" style={{ color: '#888' }}>{profile.bio}</p>}
      </div>

      {/* Stats */}
      <div className="flex" style={{ borderTop: '1px solid #1e1e2e', borderBottom: '1px solid #1e1e2e' }}>
        {[
          { num: profile.sunset_count, label: 'Pôres do sol' },
          { num: followersCount, label: 'Seguidores' },
          { num: Number(profile.avg_rating).toFixed(1), label: 'Nota média' },
        ].map((s, i) => (
          <div key={i} className="flex-1 py-4 text-center"
            style={{ borderRight: i < 2 ? '1px solid #1e1e2e' : 'none' }}>
            <div className="text-xl font-bold text-white">{s.num}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#555' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex gap-2 px-4 py-3">
        {isOwn ? (
          <Link href="/upload" className="btn-primary text-center text-sm" style={{ padding: '10px' }}>
            + Novo pôr do sol
          </Link>
        ) : (
          <>
            <button
              onClick={handleFollow}
              className="text-sm font-bold flex-1 py-2.5 rounded-full transition-all"
              style={{
                background: isFollowing ? 'transparent' : 'linear-gradient(90deg, #FF8C00, #FF4D6D)',
                border: isFollowing ? '1px solid #2a2a3a' : 'none',
                color: isFollowing ? '#888' : 'white',
              }}>
              {isFollowing ? 'Seguindo ✓' : 'Seguir'}
            </button>
          </>
        )}
      </div>

      {/* Grid de fotos */}
      {posts.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#555' }}>
          <div className="text-4xl mb-3">📷</div>
          <p className="text-sm">Nenhum pôr do sol postado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0.5">
          {posts.map((post) => (
            <div key={post.id} className="relative" style={{ aspectRatio: '1' }}>
              <Image
                src={post.image_url}
                alt={post.caption ?? ''}
                fill
                className="object-cover"
                sizes="200px"
              />
              <div className="absolute bottom-1 right-2 text-xs font-bold text-white"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {post.avg_rating > 0 ? `★ ${Number(post.avg_rating).toFixed(1)}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
