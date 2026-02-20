import { useState } from 'react';
import { TTSService, STTService } from '../utils/speech';
import { bookmarksApi } from '../services/api';

const tts = new TTSService();
const stt = new STTService();

function SecLabel({ children, color = 'var(--cyan)' }) {
  const rgb = color === 'var(--cyan)' ? '0,240,255' : color === 'var(--magenta)' ? '255,0,128' : '255,230,0';
  return (
    <span style={{ display: 'block', padding: '0.48rem 0.72rem', background: `linear-gradient(90deg, rgba(${rgb},0.08), transparent)`, borderLeft: `2px solid ${color}`, borderRadius: '0 6px 6px 0', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--mono)', color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.85rem' }}>
      {children}
    </span>
  );
}

export function WordDetailModal({ bookmark, isOpen, onClose, onDeleted }) {
  const [recording, setRecording] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !bookmark) return null;

  const handlePlay = async () => {
    try { setError(''); await tts.speak(bookmark.word); }
    catch (e) { setError('再生エラー: ' + e.message); }
  };

  const handleRecord = async () => {
    try { setError(''); setRecording(true); setRecognized(''); const t = await stt.start(); setRecognized(t); }
    catch (e) { setError(e.message); }
    finally { setRecording(false); }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    try { await bookmarksApi.delete(bookmark.id); onDeleted(bookmark.id); onClose(); }
    catch (e) { setError('削除失敗: ' + e.message); }
  };

  const highlight = (sentence, word) => {
    if (!sentence || !word) return sentence;
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    const parts = sentence.split(re);
    const matches = sentence.match(re) || [];
    return parts.map((p, i) => (
      <span key={i}>{p}{matches[i] && <span style={{ background: 'rgba(255,230,0,0.18)', borderRadius: 3, padding: '0 3px', color: 'var(--yellow)', fontWeight: 700 }}>{matches[i]}</span>}</span>
    ));
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem,4vw,2rem)' }}
    >
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', animation: 'fadeUp 0.4s ease both' }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--cyan), var(--magenta))' }} />

        <div style={{ padding: 'clamp(1.5rem,4vw,2rem) clamp(1.5rem,4vw,2rem) clamp(1rem,3vw,1.4rem)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: '0.45rem' }}>
              {bookmark.wordType === 'phrase' ? 'PHRASE' : 'WORD'}
              <span style={{ color: 'var(--t3)', margin: '0 0.4rem' }}>//</span>
              <span style={{ color: 'var(--t3)' }}>{bookmark.scenarioTitle}</span>
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem,5vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, var(--cyan), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bookmark.word}
            </h2>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={{ padding: 'clamp(1.2rem,3vw,1.6rem) clamp(1.5rem,4vw,2rem) clamp(1.5rem,4vw,2rem)', overflowY: 'auto', flex: 1 }}>

          <div style={{ marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
            <SecLabel>MEANING</SecLabel>
            <p style={{ fontSize: 'clamp(1.1rem,3vw,1.25rem)', fontWeight: 300, lineHeight: 1.65 }}>{bookmark.meaning}</p>
          </div>

          <div style={{ marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
            <SecLabel color="var(--yellow)">EXAMPLE</SecLabel>
            <p style={{ fontSize: 'clamp(0.88rem,2.5vw,0.98rem)', lineHeight: 1.9, color: 'var(--t2)', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 10, padding: 'clamp(0.9rem,2.5vw,1.1rem)' }}>
              {highlight(bookmark.exampleSentence, bookmark.word)}
            </p>
          </div>

          <div style={{ marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
            <SecLabel>PRONUNCIATION</SecLabel>
            <ActionBtn onClick={handlePlay} color="cyan">🔊　音声再生</ActionBtn>
          </div>

          <div style={{ marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
            <SecLabel color="var(--magenta)">PRACTICE</SecLabel>
            {recording ? (
              <button
                onClick={() => stt.stop()}
                style={{ width: '100%', padding: '1rem', borderRadius: 12, background: 'rgba(255,0,128,0.12)', border: '1px solid rgba(255,0,128,0.55)', color: 'var(--t1)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font)', animation: 'pulse 1.4s ease-in-out infinite' }}
              >
                🎤　録音中...（クリックで停止）
              </button>
            ) : (
              <ActionBtn onClick={handleRecord} color="green">🎤　録音開始</ActionBtn>
            )}
            {recognized && (
              <div style={{ marginTop: '0.9rem', padding: '1.1rem', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.18)', borderRadius: 10 }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>RECOGNIZED</p>
                <p style={{ color: 'var(--t1)', fontSize: 'clamp(0.9rem,2.5vw,1rem)' }}>{recognized}</p>
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(255,0,128,0.07)', border: '1px solid rgba(255,0,128,0.28)', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
              <p style={{ color: '#ff6eb0', fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>⚠ {error}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.9rem' }}>
            <ActionBtn onClick={handleDelete} color="magenta">★ ブックマーク解除</ActionBtn>
            <CloseActionBtn onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, children, color }) {
  const [h, setH] = useState(false);
  const map = { cyan: { rgb: '0,240,255', glow: 'var(--glow-c)' }, green: { rgb: '0,255,136', glow: 'var(--glow-g)' }, magenta: { rgb: '255,0,128', glow: 'var(--glow-m)' } };
  const c = map[color];
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: '100%', padding: '1rem', borderRadius: 12, background: h ? `rgba(${c.rgb},0.15)` : `rgba(${c.rgb},0.07)`, border: `1px solid rgba(${c.rgb},${h ? 0.55 : 0.35})`, color: 'var(--t1)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font)', transition: 'all 0.3s ease', boxShadow: h ? `0 0 24px ${c.glow}` : 'none', transform: h ? 'translateY(-2px)' : 'none' }}
    >
      {children}
    </button>
  );
}

function CloseActionBtn({ onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: '100%', padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${h ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`, color: 'var(--t2)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font)', transition: 'all 0.3s ease' }}
    >
      閉じる
    </button>
  );
}

function CloseBtn({ onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${h ? 'var(--magenta)' : 'rgba(255,255,255,0.1)'}`, color: h ? 'var(--magenta)' : 'var(--t2)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
    >
      ✕
    </button>
  );
}