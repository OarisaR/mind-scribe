import { useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
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

const NODE_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    0: { bg: C.primary, border: '#000', text: C.bg },
    1: { bg: C.accent, border: '#000', text: '#fff' },
    2: { bg: C.surface, border: '#000', text: C.primary },
}

const styles: Record<string, CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: C.bg,
        color: C.primary,
        fontFamily: C.fontBody,
        display: 'flex',
        flexDirection: 'column',
    },
    toolbar: {
        borderBottom: C.border,
        backgroundColor: C.bg,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
    },
    toolbarGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
    },
    title: {
        fontFamily: C.fontDisplay,
        fontWeight: 800,
        fontSize: '22px',
        color: C.primary,
        lineHeight: 1.1,
        margin: 0,
        letterSpacing: '-0.5px',
    },
    secondaryButton: {
        border: C.border,
        backgroundColor: C.bg,
        color: C.primary,
        fontFamily: C.fontDisplay,
        fontWeight: 700,
        fontSize: '14px',
        padding: '10px 18px',
        cursor: 'pointer',
        boxShadow: C.shadow,
        transition: 'all 0.1s ease',
    },
    actionButton: {
        border: C.border,
        backgroundColor: C.accent,
        color: '#fff',
        fontFamily: C.fontDisplay,
        fontWeight: 700,
        fontSize: '14px',
        padding: '10px 18px',
        cursor: 'pointer',
        boxShadow: C.shadow,
        transition: 'all 0.1s ease',
    },
    hint: {
        border: C.border,
        backgroundColor: C.primary,
        padding: '10px 14px',
        boxShadow: C.shadowSm,
    },
    hintText: {
        fontFamily: C.fontDisplay,
        fontWeight: 700,
        color: C.bg,
        fontSize: '12px',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
    },
    mainArea: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
    },
    mapArea: {
        flex: 1,
        height: 'calc(100vh - 77px)',
        minWidth: 0,
        backgroundColor: C.bg,
    },
}

function buttonMotion(active: boolean): CSSProperties {
    return {
        boxShadow: active ? C.shadowSm : C.shadow,
        transform: active ? 'translate(2px, 2px)' : 'none',
    }
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

interface Props {
    data: MindMapData
    originalText: string
    onBack: () => void
}

export default function MindMapPage({ data, originalText, onBack }: Props) {
    const { nodes: initialNodes, edges: initialEdges } = buildNodesAndEdges(data)
    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, , onEdgesChange] = useEdgesState(initialEdges)
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [explanation, setExplanation] = useState('')
    const [loadingExplanation, setLoadingExplanation] = useState(false)
    const [panelOpen, setPanelOpen] = useState(false)
    const [backHover, setBackHover] = useState(false)
    const [exportHover, setExportHover] = useState(false)

    const onNodeClick = useCallback(async (_: unknown, node: Node) => {
        const label = node.data.label as string
        setSelectedNode(label)
        setPanelOpen(true)
        setLoadingExplanation(true)
        setExplanation('')

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

    return (
        <div style={styles.page}>
            <div style={styles.toolbar}>
                <div style={styles.toolbarGroup}>
                    <button
                        onClick={onBack}
                        onMouseEnter={() => setBackHover(true)}
                        onMouseLeave={() => setBackHover(false)}
                        style={{
                            ...styles.secondaryButton,
                            backgroundColor: backHover ? C.primary : C.bg,
                            color: backHover ? C.bg : C.primary,
                            ...buttonMotion(backHover),
                        }}
                    >
                        New Map
                    </button>
                    <h1 style={styles.title}>{data.title}</h1>
                </div>

                <div style={styles.toolbarGroup}>
                    <button
                        onClick={handleExport}
                        onMouseEnter={() => setExportHover(true)}
                        onMouseLeave={() => setExportHover(false)}
                        style={{
                            ...styles.actionButton,
                            ...buttonMotion(exportHover),
                        }}
                    >
                        Export PNG
                    </button>
                    <div style={styles.hint}>
                        <span style={styles.hintText}>Click any node to explore</span>
                    </div>
                </div>
            </div>

            <div style={styles.mainArea}>
                <div style={styles.mapArea}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                    >
                        <Background color={C.primary} gap={20} size={1} style={{ opacity: 0.05 }} />
                        <Controls />
                    </ReactFlow>
                </div>

                {panelOpen && (
                    <NodePanel
                        node={selectedNode}
                        explanation={explanation}
                        loading={loadingExplanation}
                        onClose={() => setPanelOpen(false)}
                    />
                )}
            </div>
        </div>
    )
}
