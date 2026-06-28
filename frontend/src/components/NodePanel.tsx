import { useState } from 'react'
// import type { CSSProperties } from 'react'

interface QuizData {
    question: string
    options: string[]
    correct: string
    explanation: string
}

interface Props {
    node: string | null
    // nodeId: string | null
    parentLabel: string | null
    explanation: string
    loading: boolean
    rating: string | null
    relationship: string
    loadingRelationship: boolean
    quiz: QuizData | null
    quizAnswer: string | null
    loadingQuiz: boolean
    onClose: () => void
    onRate: (rating: string) => void
    onLoadQuiz: () => void
    onSelectAnswer: (answer: string) => void
    onLoadRelationship: () => void
}

const C = {
    bg: '#F5F2EB',
    surface: '#FFFFFF',
    primary: '#1A1A2E',
    accent: '#E8531D',
    border: '2px solid #000',
    shadowSm: '2px 2px 0px #000',
    shadow: '4px 4px 0px #000',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontBody: "'DM Sans', sans-serif",
}

const RATINGS = [
    { key: 'got_it', label: '✓ Got it',   bg: '#16A34A', hover: '#15803D' },
    { key: 'fuzzy',  label: '~ Fuzzy',    bg: '#CA8A04', hover: '#A16207' },
    { key: 'lost',   label: '✗ Lost',     bg: '#DC2626', hover: '#B91C1C' },
]



export default function NodePanel({
    node, parentLabel, explanation, loading,
    rating, relationship, loadingRelationship,
    quiz, quizAnswer, loadingQuiz,
    onClose, onRate, onLoadQuiz, onSelectAnswer, onLoadRelationship,
}: Props) {
    const [copied, setCopied] = useState(false)
    const [tab, setTab] = useState<'explain' | 'relate' | 'quiz'>('explain')

    const handleCopy = () => {
        if (!explanation) return
        navigator.clipboard.writeText(explanation).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const isCorrect = quizAnswer !== null && quiz !== null && quizAnswer === quiz.correct

    return (
        <>
            <style>{`
                .np-panel {
                    width: 340px;
                    border-left: 2px solid #000;
                    background-color: #F5F2EB;
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 58px);
                    flex-shrink: 0;
                    overflow: hidden;
                    animation: npSlide 0.18s ease;
                }

                @keyframes npSlide {
                    from { transform: translateX(40px); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }

                /* Header */
                .np-header {
                    background-color: #1A1A2E;
                    border-bottom: 2px solid #000;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }

                .np-header-label {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 10px;
                    color: #F5F2EB;
                    opacity: 0.45;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }

                .np-close {
                    background: none;
                    border: 1px solid rgba(245,242,235,0.2);
                    color: #F5F2EB;
                    cursor: pointer;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 13px;
                    width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.1s ease;
                }

                .np-close:hover {
                    background: #E8531D;
                    border-color: transparent;
                }

                /* Node badge row */
                .np-node-row {
                    padding: 14px 16px 0;
                    flex-shrink: 0;
                }

                .np-node-badge {
                    background-color: #E8531D;
                    border: 2px solid #000;
                    box-shadow: 3px 3px 0px #000;
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .np-node-name {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    color: #fff;
                }

                .np-parent-chip {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 600;
                    font-size: 10px;
                    color: rgba(255,255,255,0.6);
                    background: rgba(0,0,0,0.2);
                    padding: 2px 8px;
                    white-space: nowrap;
                }

                /* Tabs */
                .np-tabs {
                    display: flex;
                    border-bottom: 2px solid #000;
                    flex-shrink: 0;
                    margin-top: 14px;
                }

                .np-tab {
                    flex: 1;
                    border: none;
                    border-right: 1px solid rgba(0,0,0,0.15);
                    background: transparent;
                    padding: 10px 4px;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 10px;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    cursor: pointer;
                    color: #1A1A2E;
                    opacity: 0.4;
                    transition: all 0.1s ease;
                }

                .np-tab:last-child { border-right: none; }

                .np-tab.active {
                    opacity: 1;
                    background: #1A1A2E;
                    color: #F5F2EB;
                }

                .np-tab:hover:not(.active) {
                    opacity: 0.7;
                    background: rgba(26,26,46,0.06);
                }

                /* Body */
                .np-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 18px 16px;
                }

                /* Explanation tab */
                .np-explanation-wrap {
                    border-left: 3px solid #E8531D;
                    padding-left: 14px;
                    margin-bottom: 20px;
                }

                .np-explanation {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1A1A2E;
                    line-height: 1.8;
                    margin: 0;
                }

                .np-section-label {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 10px;
                    color: #1A1A2E;
                    opacity: 0.3;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }

                /* Loading */
                .np-loading {
                    display: flex;
                    gap: 6px;
                    align-items: flex-end;
                    height: 22px;
                }

                .np-dot {
                    width: 8px;
                    height: 8px;
                    border: 2px solid #000;
                }

                .np-dot:nth-child(1) { background: #E8531D; animation: npBounce 0.9s infinite 0s; }
                .np-dot:nth-child(2) { background: #1A1A2E; animation: npBounce 0.9s infinite 0.15s; }
                .np-dot:nth-child(3) { background: #E8531D; animation: npBounce 0.9s infinite 0.3s; }

                @keyframes npBounce {
                    0%, 100% { transform: translateY(0); }
                    45%       { transform: translateY(-6px); }
                }

                /* Rating buttons */
                .np-rating-row {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                .np-rating-btn {
                    flex: 1;
                    border: 2px solid #000;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 11px;
                    padding: 8px 4px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                    color: #fff;
                    box-shadow: 2px 2px 0px #000;
                    text-align: center;
                }

                .np-rating-btn:hover {
                    transform: translate(1px, 1px);
                    box-shadow: 1px 1px 0px #000;
                }

                .np-rating-btn.selected {
                    transform: translate(2px, 2px);
                    box-shadow: none;
                    outline: 2px solid #000;
                    outline-offset: 2px;
                }

                /* Relate tab */
                .np-relate-info {
                    background: rgba(26,26,46,0.05);
                    border: 1px solid rgba(26,26,46,0.1);
                    padding: 12px 14px;
                    margin-bottom: 14px;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 12px;
                    color: #1A1A2E;
                    opacity: 0.6;
                    line-height: 1.5;
                }

                .np-relate-btn {
                    border: 2px solid #000;
                    background: #1A1A2E;
                    color: #F5F2EB;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 12px;
                    padding: 10px 16px;
                    cursor: pointer;
                    box-shadow: 3px 3px 0px #000;
                    transition: all 0.1s ease;
                    width: 100%;
                    text-align: center;
                    margin-bottom: 16px;
                }

                .np-relate-btn:hover {
                    transform: translate(2px, 2px);
                    box-shadow: 1px 1px 0px #000;
                }

                .np-relate-result {
                    border-left: 3px solid #1A1A2E;
                    padding-left: 14px;
                }

                .np-relate-text {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1A1A2E;
                    line-height: 1.8;
                    margin: 0;
                }

                /* Quiz tab */
                .np-quiz-btn {
                    border: 2px solid #000;
                    background: #E8531D;
                    color: #fff;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 12px;
                    padding: 10px 16px;
                    cursor: pointer;
                    box-shadow: 3px 3px 0px #000;
                    transition: all 0.1s ease;
                    width: 100%;
                    text-align: center;
                    margin-bottom: 16px;
                }

                .np-quiz-btn:hover:not(:disabled) {
                    transform: translate(2px, 2px);
                    box-shadow: 1px 1px 0px #000;
                }

                .np-quiz-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .np-question {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    color: #1A1A2E;
                    line-height: 1.5;
                    margin-bottom: 14px;
                }

                .np-option {
                    border: 2px solid #000;
                    background: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    color: #1A1A2E;
                    padding: 10px 14px;
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    margin-bottom: 8px;
                    transition: all 0.1s ease;
                    box-shadow: 2px 2px 0px #000;
                    line-height: 1.4;
                }

                .np-option:hover:not(.answered) {
                    background: #F5F2EB;
                    transform: translate(1px, 1px);
                    box-shadow: 1px 1px 0px #000;
                }

                .np-option.correct {
                    background: #DCFCE7;
                    border-color: #16A34A;
                    box-shadow: 2px 2px 0px #16A34A;
                    color: #14532D;
                }

                .np-option.wrong {
                    background: #FEE2E2;
                    border-color: #DC2626;
                    box-shadow: 2px 2px 0px #DC2626;
                    color: #7F1D1D;
                }

                .np-option.answered {
                    cursor: default;
                }

                .np-quiz-feedback {
                    border: 2px solid #000;
                    padding: 12px 14px;
                    margin-top: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .np-quiz-feedback.correct-fb {
                    background: #DCFCE7;
                    color: #14532D;
                    border-color: #16A34A;
                }

                .np-quiz-feedback.wrong-fb {
                    background: #FEF3C7;
                    color: #78350F;
                    border-color: #CA8A04;
                }

                /* Footer */
                .np-footer {
                    border-top: 2px solid #000;
                    padding: 10px 16px;
                    background: #fff;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .np-footer-hint {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 10px;
                    color: #1A1A2E;
                    opacity: 0.3;
                    margin: 0;
                }

                .np-copy-btn {
                    border: 1px solid #000;
                    background: #F5F2EB;
                    color: #1A1A2E;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 10px;
                    padding: 5px 10px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                }

                .np-copy-btn:hover { background: #1A1A2E; color: #F5F2EB; }
                .np-copy-btn.copied { background: #16A34A; color: #fff; border-color: #16A34A; }
            `}</style>

            <div className="np-panel">
                {/* Header */}
                <div className="np-header">
                    <span className="np-header-label">Concept Explainer</span>
                    <button className="np-close" onClick={onClose}>✕</button>
                </div>

                {/* Node badge */}
                <div className="np-node-row">
                    <div className="np-node-badge">
                        <span className="np-node-name">{node}</span>
                        {parentLabel && parentLabel !== node && (
                            <span className="np-parent-chip">↑ {parentLabel}</span>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="np-tabs">
                    <button
                        className={`np-tab ${tab === 'explain' ? 'active' : ''}`}
                        onClick={() => setTab('explain')}
                    >Explain</button>
                    <button
                        className={`np-tab ${tab === 'relate' ? 'active' : ''}`}
                        onClick={() => setTab('relate')}
                    >Relate</button>
                    <button
                        className={`np-tab ${tab === 'quiz' ? 'active' : ''}`}
                        onClick={() => setTab('quiz')}
                    >Quiz me</button>
                </div>

                {/* Body */}
                <div className="np-body">

                    {/* ── TAB: Explain ── */}
                    {tab === 'explain' && (
                        <>
                            <div className="np-section-label">AI Explanation</div>
                            {loading ? (
                                <div className="np-loading">
                                    <div className="np-dot" />
                                    <div className="np-dot" />
                                    <div className="np-dot" />
                                </div>
                            ) : (
                                <div className="np-explanation-wrap">
                                    <p className="np-explanation">{explanation}</p>
                                </div>
                            )}

                            {/* Self-rating */}
                            {!loading && explanation && (
                                <>
                                    <div className="np-section-label" style={{ marginTop: '20px' }}>
                                        How well do you understand this?
                                    </div>
                                    <div className="np-rating-row">
                                        {RATINGS.map(r => (
                                            <button
                                                key={r.key}
                                                className={`np-rating-btn ${rating === r.key ? 'selected' : ''}`}
                                                style={{ backgroundColor: r.bg }}
                                                onClick={() => onRate(r.key)}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                    {rating && (
                                        <div style={{
                                            marginTop: '10px',
                                            fontSize: '11px',
                                            fontFamily: C.fontDisplay,
                                            color: C.primary,
                                            opacity: 0.5,
                                            letterSpacing: '0.3px',
                                        }}>
                                            {rating === 'got_it' && '✓ Marked green on the map'}
                                            {rating === 'fuzzy'  && '~ Marked yellow on the map'}
                                            {rating === 'lost'   && '✗ Marked red on the map'}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* ── TAB: Relate ── */}
                    {tab === 'relate' && (
                        <>
                            {parentLabel && parentLabel !== node ? (
                                <>
                                    <div className="np-relate-info">
                                        How does <strong>{node}</strong> connect to its parent concept <strong>{parentLabel}</strong>?
                                    </div>
                                    <button
                                        className="np-relate-btn"
                                        onClick={onLoadRelationship}
                                        disabled={loadingRelationship}
                                    >
                                        {loadingRelationship ? 'Analysing...' : 'Explain the connection →'}
                                    </button>
                                    {loadingRelationship && (
                                        <div className="np-loading">
                                            <div className="np-dot" />
                                            <div className="np-dot" />
                                            <div className="np-dot" />
                                        </div>
                                    )}
                                    {relationship && !loadingRelationship && (
                                        <div className="np-relate-result">
                                            <p className="np-relate-text">{relationship}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="np-relate-info">
                                    This is the root concept — it has no parent to relate to.
                                    Click a topic or subtopic node to see relationship analysis.
                                </div>
                            )}
                        </>
                    )}

                    {/* ── TAB: Quiz ── */}
                    {tab === 'quiz' && (
                        <>
                            <button
                                className="np-quiz-btn"
                                onClick={onLoadQuiz}
                                disabled={loadingQuiz}
                            >
                                {loadingQuiz
                                    ? 'Generating question...'
                                    : quiz
                                        ? 'New question →'
                                        : 'Test my understanding →'}
                            </button>

                            {loadingQuiz && (
                                <div className="np-loading">
                                    <div className="np-dot" />
                                    <div className="np-dot" />
                                    <div className="np-dot" />
                                </div>
                            )}

                            {quiz && !loadingQuiz && (
                                <>
                                    <p className="np-question">{quiz.question}</p>
                                    {quiz.options.map(opt => {
                                        let cls = 'np-option'
                                        if (quizAnswer) {
                                            cls += ' answered'
                                            if (opt === quiz.correct) cls += ' correct'
                                            else if (opt === quizAnswer && opt !== quiz.correct) cls += ' wrong'
                                        }
                                        return (
                                            <button
                                                key={opt}
                                                className={cls}
                                                onClick={() => !quizAnswer && onSelectAnswer(opt)}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}

                                    {quizAnswer && (
                                        <div className={`np-quiz-feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}`}>
                                            <strong>{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
                                            {quiz.explanation}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="np-footer">
                    <p className="np-footer-hint">Press a tab to explore features</p>
                    {tab === 'explain' && (
                        <button
                            className={`np-copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopy}
                            disabled={loading || !explanation}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}