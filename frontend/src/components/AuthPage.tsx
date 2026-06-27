import { useState } from 'react'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'


const NODES = [
    {
        label: 'Light Reactions',
        light: false,
        children: ['ATP Synthesis', 'Photosystem II'],
    },
    {
        label: 'Calvin Cycle',
        light: true,
        children: ['CO₂ Fixation', 'G3P Production'],
    },
    {
        label: 'Chlorophyll',
        light: false,
        children: ['Light Absorption', 'Electron Donor'],
    },
]

function MockupMap() {
    const [openIndex, setOpenIndex] = useState<number | null>(1)

    const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

    return (
        <div className="auth-mockup">
            {/* Root node */}
            <div className="auth-mockup-root">
                Photosynthesis
            </div>

            {/* Line from root down */}
            <div className="auth-vline" />

            {/* Level 1 row */}
            <div className="auth-mockup-l1-row">
                {NODES.map((node, i) => (
                    <div key={i} className="auth-mockup-l1-col">
                        {/* Node */}
                        <div
                            className={`auth-mockup-l1-node ${node.light ? 'light' : 'dark'}`}
                            onClick={() => toggle(i)}
                        >
                            {node.label}
                        </div>

                        {/* Expandable children */}
                        <div className={`auth-mockup-l2-wrapper ${openIndex === i ? 'open' : ''}`}>
                            <div className="auth-vline" style={{ height: '12px' }} />
                            {node.children.map((child, j) => (
                                <div key={j} className="auth-mockup-l2-node">
                                    {child}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleGoogle = async () => {
        setError('')
        setLoading(true)
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (e: any) {
            setError(e.message ?? 'Google sign-in failed.')
        } finally {
            setLoading(false)
        }
    }

    const handleEmailAuth = async () => {
        setError('')
        if (!email || !password) { setError('Enter your email and password.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setLoading(true)
        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password)
            } else {
                await createUserWithEmailAndPassword(auth, email, password)
            }
        } catch (e: any) {
            const msg: Record<string, string> = {
                'auth/user-not-found': 'No account with that email.',
                'auth/wrong-password': 'Wrong password.',
                'auth/email-already-in-use': 'Email already in use. Sign in instead.',
                'auth/invalid-email': 'Invalid email address.',
                'auth/invalid-credential': 'Wrong email or password.',
            }
            setError(msg[e.code] ?? e.message ?? 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background-color: #F5F2EB;
        }

        /* ── LEFT PANEL ── */
       

        .auth-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(245,242,235,0.08) 1px, transparent 1px);
          background-size: 26px 26px;
          pointer-events: none;
        }

        .auth-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 19px;
          color: #F5F2EB;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }

            .auth-left {
  width: 52%;
  background-color: #1A1A2E;
  border-right: 2px solid #000;
  display: flex;
  flex-direction: column;
  padding: 44px 56px;
  position: relative;
  overflow: hidden;
  height: 100vh;        /* ← was min-height, change to height */
  overflow-y: auto;     /* ← in case content ever exceeds viewport */
}

.auth-root {
  min-height: 100vh;
  display: flex;
  font-family: 'DM Sans', sans-serif;
  background-color: #F5F2EB;
  align-items: stretch;  /* ← add this */
}

    .auth-mockup-root {
    background-color: #1A1A2E;
    border: 2px solid #F5F2EB;
    box-shadow: 4px 4px 0px rgba(245,242,235,0.2);
    padding: 13px 32px;
    font-size: 15px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    color: #F5F2EB;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
    position: relative;
    z-index: 2;
    background-color: #E8531D;
    border-color: #000;
    }

.auth-mockup-root:hover {
  box-shadow: 2px 2px 0px rgba(245,242,235,0.2);
  transform: translate(1px, 1px);
}

.auth-vline {
  width: 2px;
  background-color: rgba(245,242,235,0.25);
  margin: 0 auto;
  height: 26px;
}

.auth-mockup-l1-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
}

.auth-mockup-l1-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.auth-mockup-l1-node {
  border: 2px solid rgba(245,242,235,0.25);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  padding: 10px 18px;
  font-size: 12px;
}

.auth-mockup-l1-node.light {
  background-color: #F5F2EB;
  color: #1A1A2E;
  border-color: #000;
}

.auth-mockup-l1-node.dark {
  background-color: rgba(245,242,235,0.07);
  color: rgba(245,242,235,0.8);
}

.auth-mockup-l1-node:hover {
  background-color: rgba(232,83,29,0.25);
  border-color: rgba(232,83,29,0.6);
  color: #F5F2EB;
}

.auth-mockup-l2-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.25s ease;
}

.auth-mockup-l2-wrapper.open {
  max-height: 200px;
  opacity: 1;
}

.auth-mockup-l2-node {
  background-color: rgba(232,83,29,0.12);
  border: 1px solid rgba(232,83,29,0.3);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  color: rgba(245,242,235,0.6);
  white-space: nowrap;
  margin-top: 6px;
  text-align: center;
  width: fit-content;
  padding: 7px 13px;
  font-size: 11px;
}

        .auth-tagline {
          position: relative;
          z-index: 1;
        }

        .auth-pill {
          display: inline-block;
          background-color: #E8531D;
          border: 2px solid #000;
          box-shadow: 2px 2px 0px #000;
          padding: 4px 14px;
          margin-bottom: 18px;
        }

        .auth-pill span {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 10px;
          color: #fff;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .auth-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 42px;
          color: #F5F2EB;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin: 0 0 14px;
        }

        .auth-subline {
          font-size: 14px;
          color: #F5F2EB;
          opacity: 0.4;
          line-height: 1.75;
          max-width: 100%;
          margin: 0;
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          width: 48%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
          background-color: #F5F2EB;
        }

        .auth-form {
          width: 100%;
          max-width: 360px;
        }

        .auth-form-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 28px;
          color: #1A1A2E;
          letter-spacing: -1px;
          margin: 0 0 6px;
        }

        .auth-form-sub {
          font-size: 14px;
          color: #1A1A2E;
          opacity: 0.4;
          margin: 0 0 28px;
          line-height: 1.5;
        }

        /* Google button */
        .auth-google-btn {
          border: 2px solid #000;
          background-color: #fff;
          color: #1A1A2E;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 14px;
          padding: 13px 20px;
          cursor: pointer;
          width: 100%;
          box-shadow: 4px 4px 0px #000;
          transition: all 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .auth-google-btn:hover:not(:disabled) {
          background-color: #1A1A2E;
          color: #F5F2EB;
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }

        .auth-google-btn:active:not(:disabled) {
          transform: translate(4px, 4px);
          box-shadow: none;
        }

        .auth-google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .auth-divider-line {
          flex: 1;
          height: 2px;
          background-color: rgba(0,0,0,0.12);
        }

        .auth-divider-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 11px;
          color: #1A1A2E;
          opacity: 0.3;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Field */
        .auth-field {
          margin-bottom: 14px;
        }

        .auth-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #1A1A2E;
          display: block;
          margin-bottom: 6px;
        }

        .auth-input {
          border: 2px solid #000;
          background-color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 12px 14px;
          width: 100%;
          outline: none;
          color: #1A1A2E;
          box-sizing: border-box;
          display: block;
          transition: box-shadow 0.1s ease;
        }

        .auth-input:focus {
          box-shadow: 4px 4px 0px #000;
        }

        .auth-input::placeholder {
          color: #1A1A2E;
          opacity: 0.3;
        }

        /* Error */
        .auth-error {
          background-color: #E8531D;
          border: 2px solid #000;
          box-shadow: 2px 2px 0px #000;
          padding: 10px 14px;
          margin-bottom: 14px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
        }

        /* Submit */
        .auth-submit-btn {
          border: 2px solid #000;
          background-color: #E8531D;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 20px;
          cursor: pointer;
          width: 100%;
          box-shadow: 4px 4px 0px #000;
          transition: all 0.1s ease;
          letter-spacing: 0.3px;
          margin-bottom: 18px;
          margin-top: 6px;
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translate(4px, 4px);
          box-shadow: none;
        }

        .auth-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Toggle */
        .auth-toggle {
          font-size: 13px;
          color: #1A1A2E;
          opacity: 0.5;
          text-align: center;
          line-height: 1.5;
          margin: 0;
        }

        .auth-toggle-btn {
          background: none;
          border: none;
          color: #E8531D;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .auth-toggle-btn:hover {
          opacity: 0.8;
        }

        /* Features strip */
        .auth-features {
          display: flex;
          gap: 20px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(245,242,235,0.1);
          position: relative;
          z-index: 1;
        }

        .auth-feature {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-feature-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 11px;
          color: #F5F2EB;
          opacity: 0.9;
          letter-spacing: 0.3px;
        }

        .auth-feature-sub {
          font-size: 11px;
          color: #F5F2EB;
          opacity: 0.35;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .auth-root { flex-direction: column; }
          .auth-left { width: 100%; min-height: auto; padding: 36px 28px; }
          .auth-right { width: 100%; padding: 36px 28px; }
          .auth-mockup { display: none; }
          .auth-headline { font-size: 28px; }
        }
      `}</style>

            <div className="auth-root">
                {/* ── LEFT ── */}
                <div className="auth-left">
                    <div className="auth-dot-grid" />

                    {/* Top: logo */}
                    <div className="auth-logo">MindScribe</div>

                    {/* Middle: mockup — takes all remaining space and centers content */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px 0',
                    }}>
                        <MockupMap />
                    </div>

                    {/* Bottom: tagline */}
                    <div className="auth-tagline">
                        <div className="auth-pill"><span>AI-Powered Learning</span></div>
                        <h1 className="auth-headline">Turn dense text into visual maps.</h1>
                        <p className="auth-subline">
                        Paste lecture notes or articles. Get an interactive concept map. Click any node to understand it deeper.
                        </p>
                        <div className="auth-features">
                        {[
                            { label: 'Instant maps', sub: 'From any text' },
                            { label: 'Click to explore', sub: 'AI explanations' },
                            { label: 'Saved forever', sub: 'Synced to cloud' },
                        ].map((f, i) => (
                            <div key={i} className="auth-feature">
                            <span className="auth-feature-label">✦ {f.label}</span>
                            <span className="auth-feature-sub">{f.sub}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                    </div>

                {/* ── RIGHT ── */}
                <div className="auth-right">
                    <div className="auth-form">
                        <h2 className="auth-form-title">
                            {mode === 'login' ? 'Welcome back.' : 'Create account.'}
                        </h2>
                        <p className="auth-form-sub">
                            {mode === 'login'
                                ? 'Sign in to access your mindmaps.'
                                : 'Start building your knowledge library.'}
                        </p>

                        {/* Google */}
                        <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="auth-divider">
                            <div className="auth-divider-line" />
                            <span className="auth-divider-text">or</span>
                            <div className="auth-divider-line" />
                        </div>

                        {/* Email */}
                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                            />
                        </div>

                        {/* Password */}
                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                            />
                        </div>

                        {/* Error */}
                        {error && <div className="auth-error">{error}</div>}

                        {/* Submit */}
                        <button className="auth-submit-btn" onClick={handleEmailAuth} disabled={loading}>
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
                        </button>

                        {/* Toggle */}
                        <p className="auth-toggle">
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                className="auth-toggle-btn"
                                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}