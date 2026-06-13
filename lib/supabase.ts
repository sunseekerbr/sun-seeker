import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Tipos principais do banco
export type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  sunset_count: number
  followers_count: number
  following_count: number
  avg_rating: number
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  location_id: string | null
  location_name: string | null
  lat: number | null
  lng: number | null
  sunset_time: string | null
  likes_count: number
  comments_count: number
  avg_rating: number
  ratings_count: number
  created_at: string
  profiles?: Profile
}

export type Location = {
  id: string
  name: string
  city: string | null
  state: string | null
  country: string
  lat: number
  lng: number
  photo_count: number
  avg_rating: number
  type?: string | null
}

export type HunterRanking = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  sunset_count: number
  avg_rating: number
  followers_count: number
  position: number
}
