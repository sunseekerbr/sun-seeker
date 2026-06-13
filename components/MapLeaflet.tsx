'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Location } from '@/lib/supabase'
import Link from 'next/link'

// Fix Leaflet default icon bug with webpack
function FixLeafletIcons() {
  const map = useMap()
  useEffect(() => {
    // Supress the missing icon warning
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
  locations: Location[]
  onSelect: (loc: Location) => void
}

export default function MapLeaflet({ locations, onSelect }: Props) {
  // Centro do Brasil como default; se tiver locations, centra na primeira
  const center: [number, number] = locations.length > 0 && locations[0].lat && locations[0].lng
    ? [locations[0].lat, locations[0].lng]
    : [-15.7801, -47.9292]

  const zoom = locations.length > 0 ? 5 : 4

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
      {locations.map(loc => (
        loc.lat && loc.lng ? (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={createSunsetPin(loc.avg_rating)}
            eventHandlers={{ click: () => onSelect(loc) }}
          >
            <Popup>
              <div style={{ minWidth: 160, fontFamily: 'sans-serif' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 4px' }}>{loc.name}</p>
                <p style={{ color: '#888', fontSize: 11, margin: '0 0 6px' }}>
                  {loc.city}{loc.state ? `, ${loc.state}` : ''}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {loc.avg_rating > 0 && (
                    <span style={{ background: '#FF8C00', color: '#fff', padding: '2px 7px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                      ★ {Number(loc.avg_rating).toFixed(1)}
                    </span>
                  )}
                  <span style={{ background: '#1e1e2e', color: '#aaa', padding: '2px 7px', borderRadius: 8, fontSize: 11 }}>
                    {loc.photo_count} fotos
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  )
}
