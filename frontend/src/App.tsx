import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebase'
import { useMaps } from './hooks/useMaps'
import AuthPage from './components/AuthPage'
import InputPage from './components/InputPage'
import MindMapPage from './components/MindMapPage'

export interface MindMapData {
  title: string
  nodes: MindNode[]
}

export interface MindNode {
  id: string
  label: string
  children?: MindNode[]
}

export interface SavedMap {
  id: string
  title: string
  data: MindMapData
  originalText: string
  createdAt: string
}

const C = {
  bg: '#F5F2EB',
  surface: '#FFFFFF',
  primary: '#1A1A2E',
  accent: '#E8531D',
  border: '2px solid #000',
  shadow: '4px 4px 0px #000',
  shadowLg: '6px 6px 0px #000',
  shadowSm: '2px 2px 0px #000',
  fontDisplay: "'Space Grotesk', sans-serif",
  fontBody: "'DM Sans', sans-serif",
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mindmapData, setMindmapData] = useState<MindMapData | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [view, setView] = useState<'dashboard' | 'input' | 'mindmap'>('dashboard')
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)

  const { maps, loading: mapsLoading, saveMap, deleteMap } = useMaps(user?.uid ?? null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  const handleGenerate = async (data: MindMapData, text: string) => {
    const id = await saveMap(data, text)   // persist to Firestore
    setCurrentMapId(id)
    setMindmapData(data)
    setOriginalText(text)
    setView('mindmap')
  }

  const handleOpenMap = (map: SavedMap) => {
    setCurrentMapId(map.id)
    setMindmapData(map.data)
    setOriginalText(map.originalText)
    setView('mindmap')
  }

  const handleDeleteMap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteMap(id)
  }

  const handleSignOut = () => {
    signOut(auth)
    setView('dashboard')
    setMindmapData(null)
    setOriginalText('')
    setCurrentMapId(null)
  }


  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: C.fontDisplay,
      }}>
        <div style={{
          backgroundColor: C.surface,
          border: C.border,
          boxShadow: C.shadow,
          padding: '32px 48px',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 800, fontSize: '20px', color: C.primary, marginBottom: '8px' }}>
            MindScribe
          </div>
          <div style={{ fontSize: '13px', color: C.primary, opacity: 0.4 }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  if (view === 'mindmap' && mindmapData) {
    const currentMap = maps.find(m => m.id === currentMapId)
    return (
      <MindMapPage
        data={mindmapData}
        originalText={originalText}
        mapId={currentMapId}
        savedVisitedIds={currentMap?.visitedIds ?? []}
        savedRatings={currentMap?.ratings ?? {}}
        onBack={() => { setMindmapData(null); setView('dashboard'); setCurrentMapId(null); }}
      />
    )
  }

  if (view === 'input') {
    return (
      <InputPage
        onGenerate={handleGenerate}
        onBack={() => setView('dashboard')}
      // savedCount={maps.length}
      />
    )
  }

  // ── Dashboard ──
  return <Dashboard
    user={user}
    maps={maps}
    mapsLoading={mapsLoading}
    onNewMap={() => setView('input')}
    onOpenMap={handleOpenMap}
    onDeleteMap={handleDeleteMap}
    onSignOut={handleSignOut}
  />
}

function Dashboard({
  user, maps, mapsLoading, onNewMap, onOpenMap, onDeleteMap, onSignOut,
}: {
  user: User
  maps: SavedMap[]
  mapsLoading: boolean
  onNewMap: () => void
  onOpenMap: (map: SavedMap) => void
  onDeleteMap: (id: string, e: React.MouseEvent) => void
  onSignOut: () => void
}) {
  const [hoverNew, setHoverNew] = useState(false)
  const [hoverSignOut, setHoverSignOut] = useState(false)

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: C.bg, 
      fontFamily: C.fontBody, 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',  // ← ADD THIS
    }}>
      {/* ── DOT BACKGROUND ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, rgba(26,26,46,0.20) 2px, transparent 2px)`,
        backgroundSize: '32px 32px',
      }} />

      {/* ── CONTENT WRAPPER ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <div style={{
          borderBottom: C.border,
          backgroundColor: C.primary,
          padding: '14px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <span style={{ fontFamily: C.fontDisplay, fontWeight: 800, fontSize: '18px', color: C.bg, letterSpacing: '-0.5px' }}>
            MindScribe
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: C.fontDisplay, fontSize: '12px', color: C.bg, opacity: 0.45 }}>
              {user.email ?? user.displayName}
            </span>
            <button
              onClick={onSignOut}
              onMouseEnter={() => setHoverSignOut(true)}
              onMouseLeave={() => setHoverSignOut(false)}
              style={{
                border: '1px solid rgba(245,242,235,0.3)',
                backgroundColor: hoverSignOut ? 'rgba(232,83,29,0.9)' : 'transparent',
                color: C.bg,
                fontFamily: C.fontDisplay,
                fontWeight: 700,
                fontSize: '12px',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                letterSpacing: '0.5px',
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '0 40px' }}>
          {/* Header row */}
          <div style={{ padding: '48px 0 32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{
                display: 'inline-block',
                backgroundColor: C.accent,
                border: C.border,
                boxShadow: C.shadowSm,
                padding: '4px 14px',
                marginBottom: '20px',
              }}>
                <span style={{ fontFamily: C.fontDisplay, fontWeight: 700, fontSize: '11px', color: '#fff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  ✦ Your Workspace
                </span>
              </div>
              <h1 style={{ fontFamily: C.fontDisplay, fontWeight: 800, fontSize: '42px', color: C.primary, lineHeight: 1.0, letterSpacing: '-1.5px' }}>
                Your Mindmaps
              </h1>
              <p style={{ fontSize: '16px', color: C.primary, opacity: 0.45, marginTop: '8px', lineHeight: 1.6 }}>
                {mapsLoading ? 'Loading...' : maps.length === 0 ? 'No mindmaps yet.' : `${maps.length} map${maps.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>

            <button
              onClick={onNewMap}
              onMouseEnter={() => setHoverNew(true)}
              onMouseLeave={() => setHoverNew(false)}
              style={{
                border: C.border,
                backgroundColor: C.accent,
                color: '#fff',
                fontFamily: C.fontDisplay,
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px 28px',
                cursor: 'pointer',
                boxShadow: hoverNew ? C.shadowSm : C.shadow,
                transform: hoverNew ? 'translate(2px,2px)' : 'none',
                transition: 'all 0.1s ease',
                whiteSpace: 'nowrap',
              } as React.CSSProperties}
            >
              + New Mindmap
            </button>
          </div>

          {/* Loading state */}
          {mapsLoading ? (
            <div style={{
              backgroundColor: C.surface,
              border: C.border,
              boxShadow: C.shadow,
              padding: '40px',
              textAlign: 'center',
              marginBottom: '64px',
            }}>
              <span style={{ fontFamily: C.fontDisplay, fontWeight: 700, fontSize: '14px', color: C.primary, opacity: 0.4 }}>
                Loading your maps...
              </span>
            </div>
          ) : maps.length === 0 ? (
            /* Empty state */
            <div style={{
              backgroundColor: C.surface,
              border: C.border,
              boxShadow: C.shadowLg,
              padding: '64px 40px',
              textAlign: 'center',
              marginBottom: '64px',
            }}>
              <div style={{ fontFamily: C.fontDisplay, fontWeight: 800, fontSize: '64px', color: C.primary, opacity: 0.08, lineHeight: 1, marginBottom: '20px' }}>01</div>
              <h2 style={{ fontFamily: C.fontDisplay, fontWeight: 700, fontSize: '22px', color: C.primary, marginBottom: '8px' }}>No mindmaps yet</h2>
              <p style={{ fontSize: '15px', color: C.primary, opacity: 0.4, lineHeight: 1.6, marginBottom: '28px' }}>
                Paste your first wall of text and let AI build your visual knowledge map.
              </p>
              <button
                onClick={onNewMap}
                style={{
                  border: C.border,
                  backgroundColor: C.accent,
                  color: '#fff',
                  fontFamily: C.fontDisplay,
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '14px 28px',
                  cursor: 'pointer',
                  boxShadow: C.shadow,
                }}
              >
                Create your first mindmap →
              </button>
            </div>
          ) : (
            /* Maps grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              paddingBottom: '64px',
            }}>
              {maps.map(map => (
                <div
                  key={map.id}
                  onClick={() => onOpenMap(map)}
                  style={{
                    backgroundColor: C.surface,
                    border: C.border,
                    boxShadow: C.shadow,
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = C.shadowSm
                    e.currentTarget.style.transform = 'translate(2px, 2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = C.shadow
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: C.fontDisplay, fontWeight: 700, fontSize: '17px', color: C.primary, lineHeight: 1.3, margin: 0, wordBreak: 'break-word' }}>
                      {map.title}
                    </h3>
                    <button
                      onClick={e => onDeleteMap(map.id, e)}
                      style={{
                        border: C.border,
                        backgroundColor: C.bg,
                        color: C.primary,
                        fontFamily: C.fontDisplay,
                        fontWeight: 700,
                        fontSize: '12px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        opacity: 0.6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.accent; e.currentTarget.style.color = '#fff'; e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.bg; e.currentTarget.style.color = C.primary; e.currentTarget.style.opacity = '0.6' }}
                    >×</button>
                  </div>
                  <div style={{ fontSize: '12px', color: C.primary, opacity: 0.4, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {formatDate(map.createdAt)}
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: C.accent, border: '1px solid #000' }} />
                    <span style={{ fontFamily: C.fontDisplay, fontWeight: 700, fontSize: '11px', color: C.primary, opacity: 0.5, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      {map.data.nodes.length} topic{map.data.nodes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}