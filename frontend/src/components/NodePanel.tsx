import type { CSSProperties } from 'react'

interface Props {
  node: string | null
  explanation: string
  loading: boolean
  onClose: () => void
}

const C = {
  bg: '#F5F2EB',
  primary: '#1A1A2E',
  accent: '#E8531D',
  border: '2px solid #000',
  shadowSm: '2px 2px 0px #000',
  fontDisplay: "'Space Grotesk', sans-serif",
  fontBody: "'DM Sans', sans-serif",
}

const styles: Record<string, CSSProperties> = {
  panel: {
    width: '320px',
    borderLeft: C.border,
    backgroundColor: C.bg,
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 77px)',
    flexShrink: 0,
  },
  header: {
    borderBottom: C.border,
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.primary,
  },
  headerText: {
    fontFamily: C.fontDisplay,
    fontWeight: 700,
    color: C.bg,
    fontSize: '13px',
    letterSpacing: '1px',
  },
  closeButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: C.bg,
    cursor: 'pointer',
    fontFamily: C.fontDisplay,
    fontSize: '20px',
    fontWeight: 800,
    lineHeight: 1,
    padding: '2px 6px',
  },
  content: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  },
  nodeBadge: {
    border: C.border,
    backgroundColor: C.accent,
    padding: '8px 14px',
    marginBottom: '24px',
    boxShadow: C.shadowSm,
    display: 'inline-block',
  },
  nodeText: {
    fontFamily: C.fontDisplay,
    fontWeight: 700,
    color: '#fff',
    fontSize: '14px',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingBlock: {
    width: '12px',
    height: '12px',
    border: '1px solid #000',
  },
  explanation: {
    color: C.primary,
    fontFamily: C.fontBody,
    fontSize: '14px',
    lineHeight: 1.7,
    margin: 0,
  },
  footer: {
    borderTop: C.border,
    padding: '16px',
  },
  footerText: {
    color: C.primary,
    fontSize: '12px',
    opacity: 0.45,
    lineHeight: 1.5,
    margin: 0,
  },
}

export default function NodePanel({ node, explanation, loading, onClose }: Props) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerText}>CONCEPT EXPLAINER</span>
        <button onClick={onClose} style={styles.closeButton} aria-label="Close concept panel">
          x
        </button>
      </div>

      <div style={styles.content}>
        {node && (
          <div style={styles.nodeBadge}>
            <span style={styles.nodeText}>{node}</span>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingRow} aria-label="Loading explanation">
            <div style={{ ...styles.loadingBlock, backgroundColor: C.accent }} />
            <div style={{ ...styles.loadingBlock, backgroundColor: C.primary }} />
            <div style={{ ...styles.loadingBlock, backgroundColor: C.accent }} />
          </div>
        ) : (
          <p style={styles.explanation}>{explanation}</p>
        )}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>Click any node on the map to explore it.</p>
      </div>
    </div>
  )
}
