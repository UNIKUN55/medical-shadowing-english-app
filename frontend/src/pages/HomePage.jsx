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
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.4rem' }}>
      <div style={{ width: 44, height: 44, border: '2px solid rgba(0,240,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', boxShadow: '0 0 18px var(--glow-c)' }} />
      <p style={{ color: 'var(--t2)', fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>LOADING...</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem clamp(1rem, 4vw, 2rem)' }}>
      <div style={{ background: 'rgba(255,0,128,0.07)', border: '1px solid rgba(255,0,128,0.28)', borderRadius: 14, padding: '1rem 1.2rem', marginBottom: '1rem' }}>
        <p style={{ color: '#ff6eb0', fontFamily: 'var(--mono)', fontSize: '0.88rem' }}>ERROR: {error}</p>
      </div>
      <Btn onClick={load} style={{ maxWidth: 180 }}>再読み込み</Btn>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem)' }}>

        <div style={{ marginBottom: 'clamp(1.8rem, 4vw, 2.8rem)', animation: 'fadeUp 0.55s ease both' }}>
          <p style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.15em', marginBottom: '0.7rem' }}>
            SCENARIO LIBRARY
            <span style={{ color: 'var(--cyan)', marginLeft: '0.6rem' }}>// {scenarios.length} scenarios</span>
          </p>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', fontWeight: 300, letterSpacing: '-0.03em' }}>
            挑戦する
            <span style={{ background: 'linear-gradient(135deg, var(--cyan), var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              シナリオ
            </span>
            を選択
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1rem, 3vw, 1.4rem)',
          marginBottom: '4rem',
        }}>
          {scenarios.map((s, i) => (
            <ScenarioCard key={s.id} scenario={s} index={i} onSelect={() => onSelectScenario(s.id)} />
          ))}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.8rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          Chrome / Edge / Safari · Powered by Web Speech API
        </p>
      </footer>
    </div>
  );
}

function ScenarioCard({ scenario, index, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(0,240,255,0.38)' : 'rgba(255,255,255,0.08)'}`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 18,
        padding: 'clamp(1.2rem, 3vw, 1.7rem)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-5px) scale(1.015)' : 'none',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.45), 0 0 35px var(--glow-c)' : 'none',
        animation: `fadeUp 0.55s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(255,0,128,0.05))',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease',
      }} />

      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 28, height: 28,
        borderTop: '1px solid rgba(0,240,255,0.3)',
        borderRight: '1px solid rgba(0,240,255,0.3)',
        borderRadius: '0 6px 0 0',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative' }}>
        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: '0.1em' }}>
          SCN_{String(index + 1).padStart(2, '0')}
        </span>
        {scenario.attempted ? (
          <span style={{ padding: '0.28rem 0.8rem', background: 'linear-gradient(135deg,rgba(0,240,255,0.12),rgba(255,0,128,0.12))', border: '1px solid rgba(0,240,255,0.45)', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: '0.07em', boxShadow: '0 0 10px var(--glow-c)' }}>
            BEST {scenario.bestScore}pt
          </span>
        ) : (
          <span style={{ padding: '0.28rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.07em' }}>
            UNTRIED
          </span>
        )}
      </div>

      <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.1rem', position: 'relative' }}>
        {scenario.title}
      </h3>

      <div style={{ marginBottom: '1.3rem', position: 'relative' }}>
        {scenario.bestScore !== null ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '0.07em' }}>BEST SCORE</span>
              <span style={{ fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.03em', background: 'linear-gradient(135deg,var(--cyan),var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {scenario.bestScore}
              </span>
            </div>
            <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${scenario.bestScore}%`, background: 'linear-gradient(90deg,var(--cyan),var(--magenta))', borderRadius: 10, boxShadow: '0 0 8px var(--glow-c)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)', animation: 'shimmer 2.5s infinite' }} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '0.9rem', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.67rem', color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '0.08em' }}>AWAITING FIRST ATTEMPT</span>
          </div>
        )}
      </div>

      <Btn onClick={onSelect} style={{ position: 'relative' }}>挑戦する</Btn>
    </div>
  );
}

function Btn({ onClick, children, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: '100%', padding: '1rem 1.8rem',
        borderRadius: 12, fontSize: '0.95rem',
        fontWeight: 600, fontFamily: 'var(--font)',
        cursor: 'pointer', transition: 'all 0.3s ease',
        background: h ? 'linear-gradient(135deg,rgba(0,240,255,0.15),rgba(255,0,128,0.15))' : 'linear-gradient(135deg,rgba(0,240,255,0.08),rgba(255,0,128,0.08))',
        border: `1px solid ${h ? 'var(--cyan)' : 'rgba(0,240,255,0.35)'}`,
        color: 'var(--t1)',
        boxShadow: h ? '0 0 25px var(--glow-c)' : 'none',
        transform: h ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}