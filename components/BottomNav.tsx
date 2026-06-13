'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/',
    label: 'Feed',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#FF8C00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/map',
    label: 'Mapa',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#FF8C00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  },
  {
    href: '/upload',
    label: '',
    icon: () => (
      <div className="w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FF8C00, #FF4D6D)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    ),
  },
  {
    href: '/ranking',
    label: 'Ranking',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#FF8C00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    href: '/profile/me',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#FF8C00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{ background: 'rgba(17,17,24,0.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid #2a2a3a' }}>
      <div className="flex justify-around items-end px-2 pt-2 pb-6">
        {tabs.map((tab) => {
          const active = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all">
              {tab.icon(active)}
              {tab.label && (
                <span className="text-[10px] font-semibold tracking-wide"
                  style={{ color: active ? '#FF8C00' : '#555' }}>
                  {tab.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
