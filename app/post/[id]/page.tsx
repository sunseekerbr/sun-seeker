'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string; avatar_url: string | null }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `há ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  return `há ${Math.floor(hours / 24)}d`
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const commentRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const [{ data: { user } }, { data: postData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('posts').select('*, profiles(*)').eq('id', id).single(),
      ])

      if (!postData) { setLoading(false); return }
      setPost(postData)
      setLikesCount(postData.likes_count ?? 0)
      setAvgRating(postData.avg_rating ?? 0)
      setCurrentUserId(user?.id ?? null)

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('post_id', id)
        .order('created_at', { ascending: true })
      setComments(commentsData ?? [])

      if (user) {
        const [{ data: likeData }, { data: savedData }, { data: ratingData }] = await Promise.all([
          supabase.from('likes').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle(),
          supabase.from('saved_posts').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle(),
          supabase.from('ratings').select('rating').eq('post_id', id).eq('user_id', user.id).maybeSingle(),
        ])
        setLiked(!!likeData)
        setSaved(!!savedData)
        if (ratingData) setUserRating(ratingData.rating)
      }

      setLoading(false)
    }
    load()
  }, [id])

  async function handleLike() {
    if (!currentUserId) { router.push(`/login?next=/post/${id}`); return }
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', id).eq('user_id', currentUserId)
      setLikesCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: id, user_id: currentUserId })
      setLikesCount(c => c + 1)
    }
    setLiked(!liked)
  }

  async function handleSave() {
    if (!currentUserId) { router.push(`/login?next=/post/${id}`); return }
    if (saved) {
      await supabase.from('saved_posts').delete().eq('post_id', id).eq('user_id', currentUserId)
    } else {
      await supabase.from('saved_posts').insert({ post_id: id, user_id: currentUserId })
    }
    setSaved(!saved)
  }

  async function handleRate(stars: number) {
    if (!currentUserId) { router.push(`/login?next=/post/${id}`); return }
    const rating = stars * 2 // 1-5 stars → 1-10 rating
    await supabase.from('ratings').upsert(
      { post_id: id, user_id: currentUserId, rating },
      { onConflict: 'post_id,user_id' }
    )
    setUserRating(rating)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) { router.push(`/login?next=/post/${id}`); return }
    if (!comment.trim()) return
    setSubmitting(true)
    const { data: newComment } = await supabase
      .from('comments')
      .insert({ post_id: id, user_id: currentUserId, content: comment.trim() })
      .select('*, profiles(username, avatar_url)')
      .single()
    if (newComment) setComments(c => [...c, newComment as Comment])
    setComment('')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: '#2a2a3a', borderTopColor: '#FF8C00' }} />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-8"
        style={{ background: '#0a0a0f' }}>
        <div className="text-4xl">😔</div>
        <p className="text-white font-bold">Post não encontrado</p>
        <button onClick={() => router.back()} className="btn-primary"
          style={{ width: 'auto', padding: '10px 24px' }}>
          Voltar
        </button>
      </div>
    )
  }

  const activeStars = hoverRating || Math.ceil(userRating / 2)

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e2e' }}>
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ color: '#aaa' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <Link href={`/profile/${post.profiles?.username}`} className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: '#1e1e2e', border: '1.5px solid #2a2a3a' }}>
            {post.profiles?.avatar_url ? (
              <Image src={post.profiles.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">🌅</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-none truncate">{post.profiles?.username}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#555' }}>{timeAgo(post.created_at)}</p>
          </div>
        </Link>
      </div>

      {/* Foto */}
      <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#1a1a2e' }}>
        <Image
          src={post.image_url}
          alt={post.caption ?? 'Pôr do sol'}
          fill
          className="object-cover"
          sizes="480px"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end gap-2 p-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}>
          {post.location_name && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#FF8C00' }}>
              📍 {post.location_name}
            </span>
          )}
          {post.sunset_time && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#FFD580' }}>
              ⏱ {post.sunset_time.slice(0, 5)}
            </span>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-2">
        <button onClick={handleLike}
          className="flex items-center gap-1.5 transition-transform active:scale-90">
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={liked ? '#FF4D6D' : 'none'}
            stroke={liked ? '#FF4D6D' : '#888'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span className="text-[13px] font-medium" style={{ color: liked ? '#FF4D6D' : '#888' }}>
            {likesCount.toLocaleString('pt-BR')}
          </span>
        </button>

        <button onClick={() => commentRef.current?.focus()}
          className="flex items-center gap-1.5 transition-transform active:scale-90">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span className="text-[13px] font-medium" style={{ color: '#888' }}>{comments.length}</span>
        </button>

        <div className="flex-1" />

        {avgRating > 0 && (
          <span className="text-sm font-bold px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,140,0,0.12)', color: '#FF8C00' }}>
            ★ {Number(avgRating).toFixed(1)}
          </span>
        )}

        <button onClick={handleSave} className="transition-transform active:scale-90">
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={saved ? '#FF8C00' : 'none'}
            stroke={saved ? '#FF8C00' : '#888'} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <span className="text-sm font-semibold text-white">{post.profiles?.username} </span>
          <span className="text-sm" style={{ color: '#bbb' }}>{post.caption}</span>
        </div>
      )}

      {/* Avaliação */}
      <div className="mx-4 mb-4 p-4 rounded-2xl" style={{ background: '#111118', border: '1px solid #1e1e2e' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#666' }}>
          {userRating > 0 ? `Sua avaliação: ${userRating}/10` : 'Avalie este pôr do sol'}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-xl transition-all active:scale-90"
                style={{ opacity: star <= activeStars ? 1 : 0.2 }}>
                🌅
              </button>
            ))}
          </div>
          {userRating > 0 && (
            <span className="text-xs font-bold ml-1" style={{ color: '#FF8C00' }}>
              ✓ Avaliado
            </span>
          )}
        </div>
      </div>

      {/* Comentários */}
      <div className="px-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#444' }}>
          Comentários ({comments.length})
        </p>

        {comments.length === 0 && (
          <p className="text-sm py-6 text-center" style={{ color: '#333' }}>
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}

        {comments.map(c => (
          <div key={c.id} className="flex gap-3 mb-4">
            <Link href={`/profile/${c.profiles?.username}`} className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden"
                style={{ background: '#1e1e2e', border: '1.5px solid #2a2a3a' }}>
                {c.profiles?.avatar_url ? (
                  <Image src={c.profiles.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">🌅</div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="inline-block px-3 py-2 rounded-2xl rounded-tl-sm max-w-full"
                style={{ background: '#1a1a28' }}>
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: '#FF8C00' }}>
                  {c.profiles?.username}
                </p>
                <p className="text-[13px] text-white break-words">{c.content}</p>
              </div>
              <p className="text-[10px] mt-1 px-1" style={{ color: '#333' }}>{timeAgo(c.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input comentário sticky */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-3 py-3"
        style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1e1e2e' }}>
        {currentUserId ? (
          <form onSubmit={handleComment} className="flex items-center gap-2">
            <input
              ref={commentRef}
              type="text"
              placeholder="Escreva um comentário..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
              style={{
                background: '#1a1a28',
                border: '1px solid #2a2a3a',
                color: '#f0f0f0',
              }}
            />
            <button
              type="submit"
              disabled={!comment.trim() || submitting}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: comment.trim()
                  ? 'linear-gradient(90deg, #FF8C00, #FF4D6D)'
                  : '#1a1a28',
                border: '1px solid #2a2a3a',
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={comment.trim() ? 'white' : '#555'} strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        ) : (
          <Link href={`/login?next=/post/${id}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold w-full"
            style={{ background: '#1a1a28', border: '1px solid #2a2a3a', color: '#666' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Faça login para comentar
          </Link>
        )}
      </div>
    </div>
  )
}
