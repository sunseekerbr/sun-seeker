'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Post } from '@/lib/supabase'

function FixLeafletIcons() {
  useMap()
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])
  return null
}

function createSunsetPin(rating: number) {
  const label = rating > 0 ? `★ ${Number(rating).toFixed(1)}` : '🌅'
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #FF8C00, #FF4D6D);
      color: white;
      padding: 4px 9px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 10px rgba(255,140,0,0.5);
      border: 1.5px solid rgba(255,255,255,0.25);
      cursor: pointer;
    ">${label}</div>`,
    className: '',
    iconAnchor: [22, 10],
    popupAnchor: [0, -14],
  })
}

type Props = {
  posts: Post[]
}

export default function MapLeaflet({ posts }: Props) {
  const postsWithCoords = posts.filter(p => p.lat && p.lng)

  const center: [number, number] = postsWithCoords.length > 0
    ? [postsWithCoords[0].lat!, postsWithCoords[0].lng!]
    : [-15.7801, -47.9292]

  const zoom = postsWithCoords.length > 0 ? 8 : 4

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <FixLeafletIcons />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {postsWithCoords.map(post => (
        <Marker
          key={post.id}
          position={[post.lat!, post.lng!]}
          icon={createSunsetPin(post.avg_rating)}
        >
          <Popup>
            <div style={{ minWidth: 160, fontFamily: 'sans-serif', padding: '2px 0' }}>
              {/* Thumbnail */}
              <a href={`/post/${post.id}`} style={{ display: 'block', marginBottom: 8 }}>
                <img
                  src={post.image_url}
                  alt=""
                  style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }}
                />
              </a>
              {post.location_name && (
                <p style={{ fontWeight: 700, fontSize: 12, margin: '0 0 3px', color: '#111' }}>
                  📍 {post.location_name}
                </p>
              )}
              <p style={{ color: '#888', fontSize: 11, margin: '0 0 6px' }}>
                @{post.profiles?.username}
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {post.avg_rating > 0 && (
                  <span style={{ background: '#FF8C00', color: '#fff', padding: '2px 7px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                    ★ {Number(post.avg_rating).toFixed(1)}
                  </span>
                )}
                <a href={`/post/${post.id}`}
                  style={{ color: '#FF8C00', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                  Ver post →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
