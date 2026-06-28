import { useCallback, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useMaps } from '../hooks/useMaps'
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import axios from 'axios'
import type { MindMapData, MindNode } from '../App'
import NodePanel from './NodePanel'
import { toPng } from 'html-to-image'
import { auth } from '../firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

// Rating colors applied to nodes on the map
const RATING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    got_it: { bg: '#16A34A', text: '#fff', border: '#000' },
    fuzzy: { bg: '#CA8A04', text: '#fff', border: '#000' },
    lost: { bg: '#DC2626', text: '#fff', border: '#000' },
}

const NODE_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    0: { bg: C.primary, border: '#000', text: C.bg },
    1: { bg: C.accent, border: '#000', text: '#fff' },
    2: { bg: C.surface, border: '#000', text: C.primary },
}

function buildNodesAndEdges(data: MindMapData): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const centerX = 600
    const centerY = 300

    nodes.push({
        id: 'root',
        position: { x: centerX - 100, y: centerY - 25 },
        data: { label: data.title, depth: 0 },
        style: {
            background: NODE_COLORS[0].bg,
            border: `2px solid ${NODE_COLORS[0].border}`,
            color: NODE_COLORS[0].text,
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '14px',
            padding: '12px 20px',
            boxShadow: C.shadow,
            minWidth: '140px',
            textAlign: 'center',
        },
    })

    const totalLevel1 = data.nodes.length
    const level1AngleStep = (2 * Math.PI) / totalLevel1
    const level1Radius = 220

    data.nodes.forEach((node: MindNode, i: number) => {
        const angle = i * level1AngleStep - Math.PI / 2
        const x = centerX + level1Radius * Math.cos(angle) - 80
        const y = centerY + level1Radius * Math.sin(angle) - 20

        nodes.push({
            id: node.id,
            position: { x, y },
            data: { label: node.label, depth: 1 },
            style: {
                background: NODE_COLORS[1].bg,
                border: `2px solid ${NODE_COLORS[1].border}`,
                color: NODE_COLORS[1].text,
                fontFamily: C.fontDisplay,
                fontWeight: 700,
                fontSize: '13px',
                padding: '10px 16px',
                boxShadow: '3px 3px 0px #000',
                minWidth: '120px',
                textAlign: 'center',
            },
        })

        edges.push({
            id: `root-${node.id}`,
            source: 'root',
            target: node.id,
            style: { stroke: '#000', strokeWidth: 2 },
        })

        if (node.children) {
            const totalLevel2 = node.children.length
            node.children.forEach((child: MindNode, j: number) => {
                const childAngle = angle + (j - (totalLevel2 - 1) / 2) * 0.4
                const cx = x + 80 + 180 * Math.cos(childAngle)
                const cy = y + 20 + 180 * Math.sin(childAngle)

                nodes.push({
                    id: child.id,
                    position: { x: cx, y: cy },
                    data: { label: child.label, depth: 2 },
                    style: {
                        background: NODE_COLORS[2].bg,
                        border: `2px solid ${NODE_COLORS[2].border}`,
                        color: NODE_COLORS[2].text,
                        fontFamily: C.fontBody,
                        fontWeight: 500,
                        fontSize: '12px',
                        padding: '8px 14px',
                        boxShadow: C.shadowSm,
                        minWidth: '100px',
                        textAlign: 'center',
                    },
                })

                edges.push({
                    id: `${node.id}-${child.id}`,
                    source: node.id,
                    target: child.id,
                    style: { stroke: '#000', strokeWidth: 1.5 },
                })
            })
        }
    })

    return { nodes, edges }
}

// Build a flat parent map: childId → parentLabel
function buildParentMap(data: MindMapData): Record<string, string> {
    const map: Record<string, string> = {}
    data.nodes.forEach(node => {
        node.children?.forEach(child => {
            map[child.id] = node.label
        })
        map[node.id] = data.title // level-1 parent is root
    })
    return map
}

interface Props {
    data: MindMapData
    originalText: string
    mapId: string | null
    savedVisitedIds?: string[]
    savedRatings?: Record<string, string>
    onBack: () => void
}

export default function MindMapPage({ 
    data, 
    originalText, 
    mapId, 
    savedVisitedIds = [], 
    savedRatings = {}, 
    onBack 
}: Props) {
    const { nodes: initialNodes, edges: initialEdges } = buildNodesAndEdges(data)
    const parentMap = buildParentMap(data)

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, , onEdgesChange] = useEdgesState(initialEdges)
    const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set(savedVisitedIds))
    const [ratings, setRatings] = useState<Record<string, string>>(savedRatings)

    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [explanation, setExplanation] = useState('')
    const [loadingExplanation, setLoadingExplanation] = useState(false)
    const [panelOpen, setPanelOpen] = useState(false)
    const [quiz, setQuiz] = useState<null | {
        question: string
        options: string[]
        correct: string
        explanation: string
    }>(null)
    const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
    const [loadingQuiz, setLoadingQuiz] = useState(false)

    const [relationship, setRelationship] = useState('')
    const [loadingRelationship, setLoadingRelationship] = useState(false)

    const [backHover, setBackHover] = useState(false)
    const [exportHover, setExportHover] = useState(false)

    const totalNodes = initialNodes.length
    const { updateMapProgress } = useMaps(auth.currentUser?.uid ?? null)
    useEffect(() => {
        if (!mapId) return
        const timer = setTimeout(() => {
            updateMapProgress(mapId, Array.from(visitedIds), ratings)
        }, 800) // debounce 800ms
        return () => clearTimeout(timer)
    }, [visitedIds, ratings, mapId, updateMapProgress])

    
    useEffect(() => {
        setNodes(nds => nds.map(n => {
            const depth = n.data.depth as number
            const isVisited = visitedIds.has(n.id)
            const rating = ratings[n.id]

    
            if (rating && RATING_COLORS[rating]) {
                return {
                    ...n,
                    style: {
                        ...n.style,
                        background: RATING_COLORS[rating].bg,
                        color: RATING_COLORS[rating].text,
                        border: `2px solid ${RATING_COLORS[rating].border}`,
                    }
                }
            }

            if (isVisited && depth !== 0) {
                return {
                    ...n,
                    style: {
                        ...n.style,
                        background: '#DCFCE7',
                        color: '#14532D',
                        border: '2px solid #16A34A',
                    }
                }
            }

 
            const col = NODE_COLORS[depth] ?? NODE_COLORS[2]
            return {
                ...n,
                style: {
                    ...n.style,
                    background: col.bg,
                    color: col.text,
                    border: `2px solid ${col.border}`,
                }
            }
        }))
    }, [visitedIds, ratings])

    // ── Node click ──
    const onNodeClick = useCallback(async (_: unknown, node: Node) => {
        const label = node.data.label as string

        setSelectedNode(label)
        setSelectedNodeId(node.id)
        setPanelOpen(true)
        setLoadingExplanation(true)
        setExplanation('')
        setQuiz(null)
        setQuizAnswer(null)
        setRelationship('')

        // Mark visited
        setVisitedIds(prev => new Set([...prev, node.id]))

        try {
            const token = await auth.currentUser?.getIdToken()
            const response = await axios.post(
                `${API_URL}/explain-node`,
                { node: label, context: originalText },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setExplanation(response.data.explanation)
        } catch {
            setExplanation('Could not load explanation. Try again.')
        } finally {
            setLoadingExplanation(false)
        }
    }, [originalText])

    // ── Feature 2: Rating handler ──
    const handleRating = useCallback((rating: string) => {
        if (!selectedNodeId) return
        setRatings(prev => ({ ...prev, [selectedNodeId]: rating }))
    }, [selectedNodeId])

    // ── Feature 3: Load quiz ──
    const handleLoadQuiz = useCallback(async () => {
        if (!selectedNode) return
        setLoadingQuiz(true)
        setQuiz(null)
        setQuizAnswer(null)
        try {
            const token = await auth.currentUser?.getIdToken()
            const response = await axios.post(
                `${API_URL}/quiz-node`,
                { node: selectedNode, context: originalText },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setQuiz(response.data)
        } catch {
            setQuiz(null)
        } finally {
            setLoadingQuiz(false)
        }
    }, [selectedNode, originalText])

    // ── Feature 4: Relationship explainer ──
    const handleRelationship = useCallback(async () => {
        if (!selectedNode || !selectedNodeId) return
        const parentLabel = parentMap[selectedNodeId]
        if (!parentLabel || parentLabel === selectedNode) return

        setLoadingRelationship(true)
        setRelationship('')
        try {
            const token = await auth.currentUser?.getIdToken()
            const response = await axios.post(
                `${API_URL}/relate-nodes`,
                { node_a: selectedNode, node_b: parentLabel, context: originalText },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setRelationship(response.data.relationship)
        } catch {
            setRelationship('Could not load relationship. Try again.')
        } finally {
            setLoadingRelationship(false)
        }
    }, [selectedNode, selectedNodeId, originalText, parentMap])

    const handleExport = () => {
        const el = document.querySelector('.react-flow') as HTMLElement
        if (!el) return
        toPng(el, { backgroundColor: C.bg }).then(dataUrl => {
            const link = document.createElement('a')
            link.download = 'mindscribe-map.png'
            link.href = dataUrl
            link.click()
        })
    }

        const handleClosePanel = () => {
        setPanelOpen(false)
        setQuiz(null)
        setQuizAnswer(null)
        setRelationship('')
        // Save progress immediately on close
        if (mapId) {
            updateMapProgress(mapId, Array.from(visitedIds), ratings)
        }
    }

    const exploredCount = visitedIds.size
    const progressPct = Math.round((exploredCount / totalNodes) * 100)

    const styles: Record<string, CSSProperties> = {
        page: {
            minHeight: '100vh',
            backgroundColor: C.bg,
            color: C.primary,
            fontFamily: C.fontBody,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
        },
        toolbar: {
            backgroundColor: C.primary,
            borderBottom: C.border,
            padding: '0 28px',
            height: '58px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexShrink: 0,
            position: 'sticky' as const,
            top: 0,
            zIndex: 100,
        },
        toolbarLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        } as CSSProperties,
        toolbarRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        } as CSSProperties,
        logo: {
            fontFamily: C.fontDisplay,
            fontWeight: 800,
            fontSize: '16px',
            color: C.bg,
            letterSpacing: '-0.5px',
        } as CSSProperties,
        sep: {
            width: '1px',
            height: '18px',
            backgroundColor: 'rgba(245,242,235,0.2)',
        } as CSSProperties,
        mapTitle: {
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '14px',
            color: C.bg,
            opacity: 0.8,
            margin: 0,
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px',
        },
        progressWrap: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        } as CSSProperties,
        progressBar: {
            width: '80px',
            height: '6px',
            backgroundColor: 'rgba(245,242,235,0.15)',
            border: '1px solid rgba(245,242,235,0.2)',
            overflow: 'hidden',
        } as CSSProperties,
        progressFill: {
            height: '100%',
            backgroundColor: '#4ADE80',
            transition: 'width 0.4s ease',
            width: `${progressPct}%`,
        } as CSSProperties,
        progressText: {
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '10px',
            color: '#4ADE80',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap' as const,
        },
        hint: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(245,242,235,0.12)',
            padding: '5px 10px',
        } as CSSProperties,
        hintDot: {
            width: '5px',
            height: '5px',
            backgroundColor: '#4ADE80',
            flexShrink: 0,
        } as CSSProperties,
        hintText: {
            fontFamily: C.fontDisplay,
            fontWeight: 600,
            color: 'rgba(245,242,235,0.4)',
            fontSize: '10px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase' as const,
        },
        exportBtn: {
            border: '2px solid #000',
            backgroundColor: C.accent,
            color: '#fff',
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '12px',
            padding: '7px 14px',
            cursor: 'pointer',
            boxShadow: exportHover ? C.shadowSm : C.shadow,
            transform: exportHover ? 'translate(2px,2px)' : 'none',
            transition: 'all 0.1s ease',
        } as CSSProperties,
        backBtn: {
            border: '1px solid rgba(245,242,235,0.25)',
            backgroundColor: backHover ? 'rgba(245,242,235,0.1)' : 'transparent',
            color: C.bg,
            fontFamily: C.fontDisplay,
            fontWeight: 700,
            fontSize: '12px',
            padding: '7px 14px',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
        } as CSSProperties,
        mainArea: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            minHeight: 0,
        },
        mapArea: {
            flex: 1,
            height: 'calc(100vh - 58px)',
            minWidth: 0,
            backgroundColor: C.bg,
        },
    }

    return (
        <div style={styles.page}>

            {/* ── TOOLBAR ── */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div style={styles.toolbar}>
                    <div style={styles.toolbarLeft}>
                        <span style={styles.logo}>MindScribe</span>
                        <div style={styles.sep} />
                        <h1 style={styles.mapTitle}>{data.title}</h1>
                        <div style={styles.sep} />
                        {/* Progress bar */}
                        <div style={styles.progressWrap}>
                            <div style={styles.progressBar}>
                                <div style={styles.progressFill} />
                            </div>
                            <span style={styles.progressText}>
                                {exploredCount}/{totalNodes} explored
                            </span>
                        </div>
                    </div>

                    <div style={styles.toolbarRight}>
                        <div style={styles.hint}>
                            <div style={styles.hintDot} />
                            <span style={styles.hintText}>Click any node to explore</span>
                        </div>
                        <button
                            style={styles.exportBtn}
                            onClick={handleExport}
                            onMouseEnter={() => setExportHover(true)}
                            onMouseLeave={() => setExportHover(false)}
                        >
                            Export PNG
                        </button>
                        <button
                            style={styles.backBtn}
                            onClick={() => {
                                    if (mapId) {
                                        updateMapProgress(mapId, Array.from(visitedIds), ratings)
                                    }
                                    onBack()
                                }}
                            onMouseEnter={() => setBackHover(true)}
                            onMouseLeave={() => setBackHover(false)}
                        >
                            ← Dashboard
                        </button>
                    </div>
                </div>

                {/* ── MAIN ── */}
                <div style={styles.mainArea}>
                    <div style={{ ...styles.mapArea, position: 'relative' }}>
                        {/* Dot overlay - sits above React Flow's default background but below nodes */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1,
                            pointerEvents: 'none',
                            backgroundImage: `radial-gradient(circle, rgba(26,26,46,0.20) 2px, transparent 2px)`,
                            backgroundSize: '30px 30px',
                        }} />
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeClick={onNodeClick}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            style={{ zIndex: 0 }}
                        >
                            <Background color={C.primary} gap={24} size={1} style={{ opacity: 0 }} />
                            <Controls />
                        </ReactFlow>
                    </div>

                    {panelOpen && (
                        <NodePanel
                            node={selectedNode}
                            // nodeId={selectedNodeId}
                            parentLabel={selectedNodeId ? parentMap[selectedNodeId] : null}
                            explanation={explanation}
                            loading={loadingExplanation}
                            rating={selectedNodeId ? ratings[selectedNodeId] ?? null : null}
                            relationship={relationship}
                            loadingRelationship={loadingRelationship}
                            quiz={quiz}
                            quizAnswer={quizAnswer}
                            loadingQuiz={loadingQuiz}
                            onClose={handleClosePanel}
                            onRate={handleRating}
                            onLoadQuiz={handleLoadQuiz}
                            onSelectAnswer={setQuizAnswer}
                            onLoadRelationship={handleRelationship}
                        />
                    )}
                </div>
            </div>
        </div>

    )
}