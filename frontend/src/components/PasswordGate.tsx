import { useState } from 'react'

interface Props {
  onSuccess: () => void
}

const C = {
  bg: '#F5F2EB',
  surface: '#FFFFFF',
  primary: '#1A1A2E',
  accent: '#E8531D',
  border: '2px solid #000',
  shadow: '4px 4px 0px #000',
  shadowSm: '2px 2px 0px #000',
  fontDisplay: "'Space Grotesk', sans-serif",
  fontBody: "'DM Sans', sans-serif",
}

export default function PasswordGate({ onSuccess }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [hover, setHover] = useState(false)

  const handleSubmit = () => {
    if (password === 'mindscribe2026') {
      onSuccess()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: C.bg,
      fontFamily: C.fontBody,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Clean top bar */}
      <div style={{
        borderBottom: C.border,
        backgroundColor: C.primary,
        padding: '14px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: C.fontDisplay,
          fontWeight: 800,
          fontSize: '18px',
          color: C.bg,
          letterSpacing: '-0.5px',
        }}>MindScribe</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#4ADE80',
            border: '1px solid #000',
          }} />
          <span style={{
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '10px',
            color: '#4ADE80',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>Online</span>
        </div>
      </div>

      {/* Center content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Accent tag */}
          <div style={{
            display: 'inline-block',
            backgroundColor: C.accent,
            border: C.border,
            boxShadow: C.shadowSm,
            padding: '4px 14px',
            marginBottom: '28px',
          }}>
            <span style={{
              fontFamily: C.fontDisplay,
              fontWeight: 700,
              fontSize: '11px',
              color: '#fff',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>Protected Access</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: C.fontDisplay,
            fontWeight: 800,
            fontSize: '48px',
            color: C.primary,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: '16px',
          }}>MindScribe</h1>

          <p style={{
            fontSize: '16px',
            color: C.primary,
            opacity: 0.5,
            marginBottom: '40px',
            lineHeight: 1.6,
          }}>
            Paste dense text. Generate visual concept maps. Click nodes to understand them.
          </p>

          {/* Card */}
          <div style={{
            backgroundColor: C.surface,
            border: C.border,
            boxShadow: C.shadow,
            padding: '32px',
          }}>
            <label style={{
              fontFamily: C.fontDisplay,
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: C.primary,
              display: 'block',
              marginBottom: '8px',
            }}>Password</label>

            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                border: error ? `2px solid ${C.accent}` : C.border,
                backgroundColor: C.bg,
                fontFamily: C.fontBody,
                fontSize: '15px',
                padding: '14px 16px',
                width: '100%',
                outline: 'none',
                color: C.primary,
                boxSizing: 'border-box',
                marginBottom: '16px',
                display: 'block',
              } as React.CSSProperties}
            />

            {error && (
              <div style={{
                backgroundColor: C.accent,
                border: C.border,
                padding: '12px 16px',
                marginBottom: '16px',
                boxShadow: C.shadowSm,
              }}>
                <span style={{
                  fontFamily: C.fontDisplay,
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#fff',
                }}>Incorrect password. Try again.</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                border: C.border,
                backgroundColor: C.primary,
                color: C.bg,
                fontFamily: C.fontDisplay,
                fontWeight: 700,
                fontSize: '15px',
                padding: '16px 24px',
                cursor: 'pointer',
                width: '100%',
                boxShadow: hover ? C.shadowSm : C.shadow,
                transform: hover ? 'translate(2px,2px)' : 'none',
                transition: 'all 0.1s ease',
                letterSpacing: '0.3px',
              } as React.CSSProperties}
            >
              Enter MindScribe →
            </button>
          </div>

          {/* Footer note */}
          <p style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: C.primary,
            opacity: 0.25,
            marginTop: '28px',
            textAlign: 'center',
            letterSpacing: '1px',
          }}>MINDSCRIBE v1.0 — AI POWERED</p>
        </div>
      </div>
    </div>
  )
}