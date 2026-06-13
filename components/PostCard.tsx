'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Post } from '@/lib/supabase'

type Props = {
  post: Post
  currentUserId?: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  return `há ${Math.floor(hours / 24)} dias`
}

export default function PostCard({ post, currentUserId }: Props) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const supabase = createClient()

  async function handleLike() {
    if (!currentUserId) return
    if (liked) {
      await supabase.from('likes').delete()
        .eq('post_id', post.id).eq('user_id', currentUserId)
      setLikesCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUserId })
      setLikesCount(c => c + 1)
    }
    setLiked(!liked)
  }

  async function handleSave() {
    if (!currentUserId) return
    if (saved) {
      await supabase.from('saved_posts').delete()
        .eq('post_id', post.id).eq('user_id', currentUserId)
    } else {
      await supabase.from('saved_posts').insert({ post_id: post.id, user_id: currentUserId })
    }
    setSaved(!saved)
  }

  return (
    <article className="mb-6" style={{ background: '#111118' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <Link href={`/profile/${post.profiles?.username}`}>
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: '#1e1e2e', border: '1.5px solid #2a2a3a' }}>
            {post.profiles?.avatar_url ? (
              <Image src={post.profiles.avatar_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base">🌅</div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.profiles?.username}`}
            className="text-[13px] font-semibold text-white hover:underline">
            {post.profiles?.username ?? 'caçador'}
          </Link>
          {post.location_name && (
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#FF8C00">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              <span className="text-[11px]" style={{ color: '#FF8C00' }}>{post.location_name}</span>
            </div>
          )}
        </div>
        <button className="text-[#555] text-lg px-1">···</button>
      </div>

      {/* Foto */}
      <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#1a1a2e' }}>
        <Image
          src={post.image_url}
          alt={post.caption ?? 'Pôr do sol'}
          fill
          className="object-cover"
          sizes="480px"
        />
        {/* Overlay com horário e nota */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 p-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}>
          {post.sunset_time && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#FFD580' }}>
              ⏱ {post.sunset_time.slice(0,5)}
            </span>
          )}
          {post.avg_rating > 0 && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#FF8C00' }}>
              ★ {post.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-2">
        <button onClick={handleLike} className="flex items-center gap-1.5 text-[13px] font-medium transition-transform active:scale-90">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={liked ? '#FF4D6D' : 'none'}
            stroke={liked ? '#FF4D6D' : '#888'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span style={{ color: liked ? '#FF4D6D' : '#888' }}>{likesCount.toLocaleString('pt-BR')}</span>
        </button>

        <button className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: '#888' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {post.comments_count}
        </button>

        <div className="flex-1" />

        <button onClick={handleSave} className="transition-transform active:scale-90">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={saved ? '#FF8C00' : 'none'}
            stroke={saved ? '#FF8C00' : '#888'} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-1">
        <span className="text-[13px] font-semibold text-white">{post.profiles?.username} </span>
        <span className="text-[13px]" style={{ color: '#bbb' }}>{post.caption}</span>
      </div>
      <div className="px-4 pb-3 text-[11px]" style={{ color: '#444' }}>{timeAgo(post.created_at)}</div>
    </article>
  )
}
