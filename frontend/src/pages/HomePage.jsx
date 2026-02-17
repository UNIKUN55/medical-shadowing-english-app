import { useState, useEffect } from 'react';
import { scenariosApi } from '../services/api';

export function HomePage({ onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const data = await scenariosApi.getAll();
      setScenarios(data.scenarios);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1.4rem' }}>
      <div className="spinner" />
      <p style={{ color:'var(--text-2)', fontFamily:'var(--mono)', fontSize:'0.78rem', letterSpacing:'0.1em' }}>LOADING...</p>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="err-box" style={{ marginBottom:'1rem' }}>
        <p style={{ color:'#ff6eb0', fontFamily:'var(--mono)', fontSize:'0.88rem' }}>ERROR: {error}</p>
      </div>
      <button className="btn btn-primary" style={{ maxWidth:180 }} onClick={load}>再読み込み</button>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh' }}>
      <div className="page">
        {/* タイトル */}
        <div className="fade-in d1" style={{ marginBottom:'2.8rem' }}>
          <p style={{ fontSize:'0.68rem', fontFamily:'var(--mono)', color:'var(--text-3)', letterSpacing:'0.15em', marginBottom:'0.75rem' }}>
            SCENARIO LIBRARY
            <span style={{ color:'var(--cyan)', marginLeft:'0.6rem' }}>// {scenarios.length} scenarios</span>
          </p>
          <h2 style={{ fontSize:'clamp(1.8rem, 4vw, 2.8rem)', fontWeight:300, letterSpacing:'-0.03em' }}>
            挑戦する<span className="grad-cm">シナリオ</span>を選択
          </h2>
        </div>

        {/* グリッド */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'1.4rem', marginBottom:'4rem' }}>
          {scenarios.map((s, i) => (
            <ScenarioCard key={s.id} scenario={s} index={i} onSelect={() => onSelectScenario(s.id)} />
          ))}
        </div>
      </div>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'2rem', textAlign:'center' }}>
        <p style={{ color:'var(--text-3)', fontFamily:'var(--mono)', fontSize:'0.72rem', letterSpacing:'0.05em' }}>
          SUPPORTED: Chrome / Edge / Safari (Latest) · Powered by Web Speech API
        </p>
      </footer>
    </div>
  );
}

function ScenarioCard({ scenario, index, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`glass fade-in d${index + 2}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 'var(--radius)',
        padding: '1.7rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-5px) scale(1.015)' : 'none',
        borderColor: hovered ? 'rgba(0,240,255,0.38)' : 'var(--border)',
        boxShadow: hovered
          ? '0 20px 50px rgba(0,0,0,0.45), 0 0 35px var(--glow-c), inset 0 0 25px rgba(0,240,255,0.04)'
          : 'none',
      }}
    >
      {/* ホバーグラデーション */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'var(--radius)',
        background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(255,0,128,0.05))',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
      }} />

      {/* コーナー装飾 */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 32, height: 32,
        borderTop: '1px solid rgba(0,240,255,0.28)',
        borderRight: '1px solid rgba(0,240,255,0.28)',
        borderRadius: '0 6px 0 0',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
      }} />

      {/* ヘッダー */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.1rem', position:'relative' }}>
        <span style={{ fontSize:'0.65rem', fontFamily:'var(--mono)', color:'var(--cyan)', letterSpacing:'0.1em' }}>
          SCN_{String(index + 1).padStart(2,'0')}
        </span>
        {scenario.attempted
          ? <span className="badge-on">BEST {scenario.bestScore}pt</span>
          : <span className="badge-off">UNTRIED</span>
        }
      </div>

      {/* タイトル */}
      <h3 style={{ fontSize:'1.25rem', fontWeight:600, letterSpacing:'-0.02em', marginBottom:'1.2rem', position:'relative' }}>
        {scenario.title}
      </h3>

      {/* スコア */}
      <div style={{ marginBottom:'1.4rem', position:'relative' }}>
        {scenario.bestScore !== null ? (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.55rem' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:'var(--mono)', letterSpacing:'0.07em' }}>BEST SCORE</span>
              <span style={{
                fontSize:'1.9rem', fontWeight:700, letterSpacing:'-0.03em',
                background:'linear-gradient(135deg, var(--cyan), var(--magenta))',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>
                {scenario.bestScore}
              </span>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width:`${scenario.bestScore}%` }} />
            </div>
          </>
        ) : (
          <div style={{
            padding:'1rem', borderRadius:10,
            border:'1px dashed rgba(255,255,255,0.07)',
            textAlign:'center',
          }}>
            <span style={{ fontSize:'0.7rem', color:'var(--text-3)', fontFamily:'var(--mono)', letterSpacing:'0.08em' }}>
              AWAITING FIRST ATTEMPT
            </span>
          </div>
        )}
      </div>

      {/* ボタン */}
      <button className="btn btn-primary" onClick={onSelect} style={{ position:'relative' }}>
        挑戦する
      </button>
    </div>
  );
}