import { useState } from 'react'
import axios from 'axios'
import type { MindMapData } from '../App'
import { auth } from '../firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

interface Props {
  onGenerate: (data: MindMapData, text: string) => void
  onBack: () => void
}

export default function InputPage({ onGenerate, onBack }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [btnHover, setBtnHover] = useState(false)
  const [backHover, setBackHover] = useState(false)

  const handleGenerate = async () => {
    if (text.trim().length < 50) {
      setError('Please paste at least a paragraph of text.')
      return
    }
    if (text.length > 5000) {
      setError('Text too long. Max 5000 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(
        `${API_URL}/generate-mindmap`,
        { text },
        { headers: { Authorization: `Bearer ${await auth.currentUser?.getIdToken()}` } }
      )
      onGenerate(response.data, text)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: C.bg,
      fontFamily: C.fontBody,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
            {/* ── DOT BACKGROUND ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, rgba(26,26,46,0.22) 2px, transparent 2px)`,
        backgroundSize: '32px 32px',
      }} />

      

      {/* ── NAVBAR ── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={onBack}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            style={{
              border: '1px solid rgba(245,242,235,0.3)',
              backgroundColor: 'transparent',
              color: C.bg,
              fontFamily: C.fontDisplay,
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px',
              cursor: 'pointer',
              opacity: backHover ? 1 : 0.7,
              transition: 'all 0.1s ease',
              letterSpacing: '0.5px',
            }}
          >
            ← Back
          </button>
          <span style={{
            fontFamily: C.fontDisplay,
            fontWeight: 800,
            fontSize: '18px',
            color: C.bg,
            letterSpacing: '-0.5px',
          }}>MindScribe</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '11px',
            color: C.bg,
            opacity: 0.4,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>AI Powered</span>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#4ADE80',
            border: '1px solid #000',
          }} />
          <span style={{
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '11px',
            color: '#4ADE80',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>Live</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '860px',
        margin: '0 auto',
        width: '100%',
        padding: '0 40px',
      }}>

        {/* Header */}
        <div style={{ padding: '56px 0 36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: C.accent,
            border: C.border,
            boxShadow: C.shadowSm,
            padding: '5px 14px',
            marginBottom: '20px',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#fff',
              border: '1px solid #000',
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: C.fontDisplay,
              fontWeight: 700,
              fontSize: '11px',
              color: '#fff',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>Text to Mindmap</span>
          </div>

          <h1 style={{
            fontFamily: C.fontDisplay,
            fontWeight: 800,
            fontSize: '52px',
            color: C.primary,
            lineHeight: 1.0,
            letterSpacing: '-2.5px',
            marginBottom: '14px',
          }}>
            New Mindmap
          </h1>

          <p style={{
            fontSize: '16px',
            color: C.primary,
            opacity: 0.45,
            lineHeight: 1.7,
            maxWidth: '520px',
          }}>
            Paste any wall of text — lecture notes, articles, research papers —
            and AI instantly builds an interactive mindmap you can explore.
          </p>
        </div>

        {/* Input card */}
        <div style={{
          backgroundColor: C.surface,
          border: C.border,
          boxShadow: C.shadowLg,
          padding: '32px',
          marginBottom: '16px',
          position: 'relative',
        }}>
          {/* Corner accent */}
          <div style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: '32px',
            height: '32px',
            backgroundColor: C.accent,
            borderLeft: C.border,
            borderBottom: C.border,
            boxShadow: '-3px 3px 0px rgba(0,0,0,0.15)',
          }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}>
            <div>
              <div style={{
                fontFamily: C.fontDisplay,
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: C.primary,
                marginBottom: '4px',
              }}>Your Text</div>
              <div style={{
                fontSize: '13px',
                color: C.primary,
                opacity: 0.45,
              }}>Lecture notes, articles, textbook excerpts — anything works</div>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: text.length > 4000 ? C.accent : C.primary,
              opacity: text.length > 4000 ? 1 : 0.3,
              fontWeight: text.length > 4000 ? 700 : 400,
              transition: 'all 0.2s',
            }}>
              {text.length} / 5000
            </div>
          </div>

          <textarea
            rows={11}
            placeholder="Paste your lecture notes, article, or any wall of text here..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={5000}
            style={{
              border: C.border,
              backgroundColor: C.bg,
              fontFamily: C.fontBody,
              fontSize: '15px',
              padding: '16px',
              width: '100%',
              resize: 'none',
              outline: 'none',
              color: C.primary,
              lineHeight: 1.7,
              boxSizing: 'border-box',
              display: 'block',
              transition: 'box-shadow 0.15s ease',
            } as React.CSSProperties}
            onFocus={e => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000'
            }}
            onBlur={e => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: C.accent,
            border: C.border,
            boxShadow: C.shadowSm,
            padding: '12px 16px',
            marginBottom: '16px',
          }}>
            <span style={{
              fontFamily: C.fontDisplay,
              fontWeight: 700,
              fontSize: '13px',
              color: '#fff',
            }}>{error}</span>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            border: C.border,
            backgroundColor: loading ? C.primary : C.accent,
            color: '#fff',
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '16px',
            padding: '16px 32px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            boxShadow: btnHover && !loading ? C.shadowSm : C.shadow,
            transform: btnHover && !loading ? 'translate(2px,2px)' : 'none',
            transition: 'all 0.1s ease',
            letterSpacing: '0.3px',
            marginBottom: '48px',
            position: 'relative',
          } as React.CSSProperties}
        >
          {loading ? '⚙  Generating your mindmap...' : 'Generate Mindmap →'}
        </button>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          paddingBottom: '64px',
        }}>
          {[
            { step: '01', title: 'Paste Text', desc: 'Any lecture notes, article, or excerpt up to 5000 characters' },
            { step: '02', title: 'AI Extracts', desc: 'Key concepts and relationships identified instantly' },
            { step: '03', title: 'Explore Map', desc: 'Click any node to get a deeper AI-powered explanation' },
          ].map(item => (
            <div key={item.step} style={{
              backgroundColor: C.surface,
              border: C.border,
              boxShadow: C.shadow,
              padding: '28px 24px',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(2px, 2px)'
              e.currentTarget.style.boxShadow = C.shadowSm
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = C.shadow
            }}
            >
              <div style={{
                fontFamily: C.fontDisplay,
                fontWeight: 800,
                fontSize: '36px',
                color: C.accent,
                lineHeight: 1,
                marginBottom: '12px',
              }}>{item.step}</div>
              <div style={{
                fontFamily: C.fontDisplay,
                fontWeight: 700,
                fontSize: '15px',
                color: C.primary,
                marginBottom: '8px',
              }}>{item.title}</div>
              <div style={{
                fontSize: '13px',
                color: C.primary,
                opacity: 0.5,
                lineHeight: 1.6,
              }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}