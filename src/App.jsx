import React, { useState } from 'react';

export default function App() {
  const [step, setStep] = useState(0); 
  const [baseline, setBaseline] = useState({ idea: '', background: '', location: '' });
  const [questions, setQuestions] = useState({ market_question: '', tech_question: '', finance_question: '', critique_question: '' });
  const [answers, setAnswers] = useState({ market: '', tech: '', finance: '', critique: '' });
  const [results, setResults] = useState(null);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setStep(1);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseline)
      });
      const data = await res.json();
      setQuestions(data);
      setStep(2);
    } catch (err) {
      alert("Error initializing interview. Check server connection.");
      setStep(0);
    }
  };

  const handleCalculateReport = async (e) => {
    e.preventDefault();
    setStep(3);
    try {
      const res = await fetch('/api/evaluate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...baseline,
          market_answer: answers.market,
          tech_answer: answers.tech,
          finance_answer: answers.finance,
          critique_answer: answers.critique
        })
      });
      const data = await res.json();
      setResults(data);
      setStep(4);
    } catch (err) {
      alert("Error generating report.");
      setStep(2);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '700px', margin: '40px auto', padding: '20px', lineHeight: '1.6' }}>
      <h1 style={{ color: '#2d3748', textAlign: 'center' }}>🚀 AI Startup Idea Validator</h1>
      <p style={{ textAlign: 'center', color: '#718096' }}>Analyze viability through specialized AI agent evaluation.</p>
      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {/* Step 0: Initial Form */}
      {step === 0 && (
        <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>What is your startup idea?</label>
            <textarea required rows={3} style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="e.g., A peer-to-peer equipment rental marketplace for local filmmakers..." value={baseline.idea} onChange={e => setBaseline({...baseline, idea: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>What is your personal background?</label>
            <input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="e.g., Computer Science student" value={baseline.background} onChange={e => setBaseline({...baseline, background: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Where do you want to launch this?</label>
            <input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="e.g., Nagpur, Maharashtra" value={baseline.location} onChange={e => setBaseline({...baseline, location: e.target.value})} />
          </div>
          <button type="submit" style={{ padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Assemble Agent Panel</button>
        </form>
      )}

      {/* Step 1 & 3: Loading States */}
      {(step === 1 || step === 3) && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
          <p style={{ fontWeight: '500' }}>{step === 1 ? "Agents are evaluating your baseline parameters..." : "Compiling metrics and cross-referencing insights..."}</p>
        </div>
      )}

      {/* Step 2: The Agent Interview Panel */}
      {step === 2 && (
        <form onSubmit={handleCalculateReport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: '#2b6cb0' }}>📍 Specialized Panel Interview</h3>
          
          <div>
            <label style={{ fontWeight: '600', color: '#4a5568' }}>📊 Market & Location Agent:</label>
            <p style={{ margin: '4px 0', fontSize: '14px', fontStyle: 'italic' }}>"{questions.market_question}"</p>
            <input required type="text" style={{ width: '100%', padding: '8px' }} value={answers.market} onChange={e => setAnswers({...answers, market: e.target.value})} />
          </div>

          <div>
            <label style={{ fontWeight: '600', color: '#4a5568' }}>💻 Technical Feasibility Agent:</label>
            <p style={{ margin: '4px 0', fontSize: '14px', fontStyle: 'italic' }}>"{questions.tech_question}"</p>
            <input required type="text" style={{ width: '100%', padding: '8px' }} value={answers.tech} onChange={e => setAnswers({...answers, tech: e.target.value})} />
          </div>

          <div>
            <label style={{ fontWeight: '600', color: '#4a5568' }}>💰 Financial & Business Model Agent:</label>
            <p style={{ margin: '4px 0', fontSize: '14px', fontStyle: 'italic' }}>"{questions.finance_question}"</p>
            <input required type="text" style={{ width: '100%', padding: '8px' }} value={answers.finance} onChange={e => setAnswers({...answers, finance: e.target.value})} />
          </div>

          <div>
            <label style={{ fontWeight: '600', color: '#4a5568' }}>⚖️ The Challenger (Critique Agent):</label>
            <p style={{ margin: '4px 0', fontSize: '14px', fontStyle: 'italic' }}>"{questions.critique_question}"</p>
            <input required type="text" style={{ width: '100%', padding: '8px' }} value={answers.critique} onChange={e => setAnswers({...answers, critique: e.target.value})} />
          </div>

          <button type="submit" style={{ padding: '12px', background: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Generate Evaluation Metrics</button>
        </form>
      )}

      {/* Step 4: Final Diagnostic Evaluation */}
      {step === 4 && results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ color: '#2b6cb0' }}>📊 Final Diagnostic Report</h2>
          
          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #4299e1' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>📈 Market Assessment</h4>
            <p style={{ margin: 0 }}>{results.market_analysis}</p>
          </div>

          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #ed8936' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>🛠️ Technical Infrastructure Advice</h4>
            <p style={{ margin: 0 }}>{results.tech_analysis}</p>
          </div>

          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #48bb78' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>💵 Financial Strategy & Monetization</h4>
            <p style={{ margin: 0 }}>{results.finance_analysis}</p>
          </div>

          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #e53e3e' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>⚠️ Critical Risk Checklist</h4>
            <p style={{ margin: 0 }}>{results.critique_analysis}</p>
          </div>

          <div style={{ background: '#ebf8ff', padding: '15px', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2b6cb0' }}>🗺️ Recommended 3-Step Execution Blueprint</h4>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              {results.roadmap && results.roadmap.map((s, idx) => <li key={idx} style={{ marginBottom: '5px' }}>{s}</li>)}
            </ol>
          </div>

          <button onClick={() => { setStep(0); setAnswers({ market: '', tech: '', finance: '', critique: '' }); }} style={{ padding: '10px', background: '#4a5568', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Analyze Another Venture</button>
        </div>
      )}
    </div>
  );
}