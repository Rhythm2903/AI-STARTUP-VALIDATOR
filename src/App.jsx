import React, { useState, useEffect, useRef } from 'react';

const AGENTS = [
  { key: 'market',   label: 'Market & Location',         icon: '📊', color: '#6ee7b7', q_key: 'market_question',   a_key: 'market_answer'   },
  { key: 'tech',     label: 'Technical Feasibility',      icon: '💻', color: '#93c5fd', q_key: 'tech_question',     a_key: 'tech_answer'     },
  { key: 'finance',  label: 'Financial & Business Model', icon: '💰', color: '#fcd34d', q_key: 'finance_question',  a_key: 'finance_answer'  },
  { key: 'critique', label: 'The Challenger',             icon: '⚔️', color: '#fca5a5', q_key: 'critique_question', a_key: 'critique_answer' },
];

function TypewriterText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed('');
    idx.current = 0;
    setDone(false);
    if (!text) return;
    const interval = setInterval(() => {
      idx.current += 1;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone && onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}{!done && <span className="cursor">|</span>}</span>;
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Interview Progress</span>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{current}/{total}</span>
      </div>
      <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6ee7b7, #93c5fd)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function AgentBadge({ agent, active, done }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
      borderRadius: '8px', border: `1px solid ${active ? agent.color : done ? '#334155' : '#1e293b'}`,
      background: active ? `${agent.color}18` : 'transparent',
      transition: 'all 0.3s ease', opacity: done ? 0.5 : 1
    }}>
      <span style={{ fontSize: '16px' }}>{done ? '✅' : agent.icon}</span>
      <span style={{ fontSize: '12px', color: active ? agent.color : done ? '#64748b' : '#475569', fontWeight: active ? 700 : 400 }}>{agent.label}</span>
    </div>
  );
}

function ScoreBar({ label, score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(score), 100); }, [score]);
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '13px', color, fontFamily: 'monospace', fontWeight: 700 }}>{score}/10</span>
      </div>
      <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width * 10}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: '3px', transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [baseline, setBaseline] = useState({ idea: '', background: '', location: '' });
  const [questions, setQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [agentIndex, setAgentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionReady, setQuestionReady] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentAgent = AGENTS[agentIndex];

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');
    setStep(1);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseline)
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setQuestions(data);
      setAgentIndex(0);
      setQuestionReady(false);
      setCurrentAnswer('');
      setStep(2);
    } catch (err) {
      setError(err.message);
      setStep(0);
    }
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;
    const agent = AGENTS[agentIndex];
    const newAnswers = { ...answers, [agent.a_key]: currentAnswer };
    setAnswers(newAnswers);

    if (agentIndex < AGENTS.length - 1) {
      setAgentIndex(prev => prev + 1);
      setCurrentAnswer('');
      setQuestionReady(false);
    } else {
      submitEvaluation(newAnswers);
    }
  };

  const submitEvaluation = async (finalAnswers) => {
    setStep(3);
    try {
      const res = await fetch('/api/evaluate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseline, ...finalAnswers })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResults(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
      setStep(2);
    }
  };

  const reset = () => {
    setStep(0); setBaseline({ idea: '', background: '', location: '' });
    setQuestions({}); setAnswers({}); setAgentIndex(0);
    setCurrentAnswer(''); setResults(null); setError('');
  };

  const styles = {
    page: { minHeight: '100vh', background: '#020917', color: '#e2e8f0', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: '0' },
    grid: { position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff08 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' },
    glow: { position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, #6ee7b718 0%, transparent 70%)', pointerEvents: 'none' },
    wrap: { maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px' },
    logo: { textAlign: 'center', marginBottom: '48px' },
    logoTitle: { fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #6ee7b7, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' },
    logoSub: { fontSize: '13px', color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' },
    card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px 14px', background: '#020917', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'inherit' },
    textarea: { width: '100%', padding: '12px 14px', background: '#020917', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
    btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #059669, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', transition: 'opacity 0.2s, transform 0.1s' },
    question: { fontSize: '17px', lineHeight: '1.7', color: '#cbd5e1', fontStyle: 'italic', minHeight: '60px', padding: '16px', background: '#020917', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '16px' },
    agentHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' },
    errorBox: { background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', fontSize: '14px', marginTop: '12px' },
    loadingDot: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#6ee7b7', animation: 'pulse 1s ease-in-out infinite' }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .cursor { animation: blink 1s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        input:focus, textarea:focus { border-color: #6ee7b7 !important; }
        button:hover { opacity: 0.9; }
        button:active { transform: scale(0.98); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.wrap}>
        <div style={styles.logo}>
          <div style={styles.logoTitle}>AI Startup Validator</div>
          <div style={styles.logoSub}>Multi-Agent Advisory Board</div>
        </div>

        {/* STEP 0: Onboarding Form */}
        {step === 0 && (
          <div className="fade-up">
            <div style={styles.card}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Brief your idea</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>4 specialist agents will cross-examine your startup across market, tech, finance, and risk.</div>
              </div>
              <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={styles.label}>Your Startup Idea *</label>
                  <textarea required rows={4} style={styles.textarea} placeholder="Describe your idea clearly — what problem it solves, who it's for..." value={baseline.idea} onChange={e => setBaseline({...baseline, idea: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={styles.label}>Your Background *</label>
                    <input required type="text" style={styles.input} placeholder="e.g., CS student, ex-banker" value={baseline.background} onChange={e => setBaseline({...baseline, background: e.target.value})} />
                  </div>
                  <div>
                    <label style={styles.label}>Target Location *</label>
                    <input required type="text" style={styles.input} placeholder="e.g., Mumbai, India" value={baseline.location} onChange={e => setBaseline({...baseline, location: e.target.value})} />
                  </div>
                </div>
                <button type="submit" style={styles.btn}>Assemble Agent Panel →</button>
              </form>
              {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            </div>
          </div>
        )}

        {/* STEP 1: Loading questions */}
        {step === 1 && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #1e293b', borderTopColor: '#6ee7b7', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>Assembling your expert panel...</div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px' }}>Agents are analyzing your idea</div>
          </div>
        )}

        {/* STEP 2: Sequential Agent Interview */}
        {step === 2 && questions[currentAgent?.q_key] !== undefined && (
          <div className="fade-up">
            <ProgressBar current={agentIndex} total={AGENTS.length} />

            {/* Agent roster */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {AGENTS.map((a, i) => (
                <AgentBadge key={a.key} agent={a} active={i === agentIndex} done={i < agentIndex} />
              ))}
            </div>

            <div style={styles.card}>
              <div style={styles.agentHeader}>
                <div style={{ fontSize: '28px' }}>{currentAgent.icon}</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Agent {agentIndex + 1} of {AGENTS.length}</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: currentAgent.color }}>{currentAgent.label}</div>
                </div>
              </div>

              <div style={styles.question}>
                {questions[currentAgent.q_key]
                  ? <TypewriterText key={currentAgent.key} text={`"${questions[currentAgent.q_key]}"`} onDone={() => setQuestionReady(true)} />
                  : <span style={{ color: '#475569' }}>Loading question...</span>
                }
              </div>

              <form onSubmit={handleAnswerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Your Answer</label>
                  <textarea
                    required rows={3} style={{ ...styles.textarea, opacity: questionReady ? 1 : 0.4, transition: 'opacity 0.5s' }}
                    placeholder={questionReady ? "Type your answer here..." : "Wait for the question..."}
                    value={currentAnswer}
                    disabled={!questionReady}
                    onChange={e => setCurrentAnswer(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={!questionReady || !currentAnswer.trim()} style={{ ...styles.btn, background: agentIndex === AGENTS.length - 1 ? 'linear-gradient(135deg, #dc2626, #7c3aed)' : 'linear-gradient(135deg, #059669, #2563eb)' }}>
                  {agentIndex === AGENTS.length - 1 ? 'Generate Final Report →' : `Next Agent →`}
                </button>
              </form>
              {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            </div>
          </div>
        )}

        {/* STEP 3: Generating report */}
        {step === 3 && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #1e293b', borderTopColor: '#fcd34d', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>Compiling diagnostic report...</div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px' }}>Cross-referencing all 4 agent insights</div>
          </div>
        )}

        {/* STEP 4: Results */}
        {step === 4 && results && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Diagnostic Complete</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Here's what your agent panel found</div>
            </div>

            {/* Score bars */}
            {results.scores && (
              <div style={{ ...styles.card, marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Viability Scores</div>
                <ScoreBar label="Market Opportunity" score={results.scores.market || 7} color="#6ee7b7" />
                <ScoreBar label="Technical Feasibility" score={results.scores.tech || 7} color="#93c5fd" />
                <ScoreBar label="Financial Viability" score={results.scores.finance || 6} color="#fcd34d" />
                <ScoreBar label="Risk Profile" score={results.scores.risk || 5} color="#fca5a5" />
              </div>
            )}

            {[
              { key: 'market_analysis', label: 'Market Assessment', icon: '📊', color: '#6ee7b7' },
              { key: 'tech_analysis', label: 'Technical Infrastructure', icon: '🛠️', color: '#93c5fd' },
              { key: 'finance_analysis', label: 'Financial Strategy', icon: '💰', color: '#fcd34d' },
              { key: 'critique_analysis', label: 'Critical Risk Checklist', icon: '⚠️', color: '#fca5a5' },
            ].map(({ key, label, icon, color }) => (
              results[key] && (
                <div key={key} style={{ ...styles.card, borderLeft: `3px solid ${color}`, marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color }}>{label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: '1.75' }}>{results[key]}</p>
                </div>
              )
            ))}

            {results.roadmap && (
              <div style={{ ...styles.card, background: '#0c1a2e', border: '1px solid #1e3a5f' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🗺️ 3-Step Execution Blueprint</div>
                {results.roadmap.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < results.roadmap.length - 1 ? '16px' : 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>{step}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={reset} style={{ ...styles.btn, marginTop: '24px', background: '#1e293b', border: '1px solid #334155' }}>← Validate Another Idea</button>
          </div>
        )}
      </div>
    </div>
  );
}