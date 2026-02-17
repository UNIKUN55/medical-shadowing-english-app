import { useState } from 'react';
import { TTSService, STTService } from '../utils/speech';
import { bookmarksApi } from '../services/api';

const tts = new TTSService();
const stt = new STTService();

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
    try {
      setError(''); setRecording(true); setRecognized('');
      const t = await stt.start();
      setRecognized(t);
    } catch (e) { setError(e.message); }
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
      <span key={i}>{p}{matches[i] && <span className="hl-word">{matches[i]}</span>}</span>
    ));
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.88)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'2rem',
    }}>
      <div className="glass fade-in" style={{
        borderRadius:'var(--radius)', width:'100%', maxWidth:660,
        maxHeight:'90vh', overflow:'hidden',
        display:'flex', flexDirection:'column',
        position:'relative',
      }}>
        {/* トップバー */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:2,
          background:'linear-gradient(90deg, var(--cyan), var(--magenta))',
        }} />

        {/* ヘッダー */}
        <div style={{
          padding:'2rem 2rem 1.4rem',
          borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        }}>
          <div>
            <p style={{ fontSize:'0.62rem', fontFamily:'var(--mono)', color:'var(--cyan)', letterSpacing:'0.1em', marginBottom:'0.45rem' }}>
              {bookmark.wordType === 'phrase' ? 'PHRASE' : 'WORD'}
              <span style={{ color:'var(--text-3)', margin:'0 0.45rem' }}>//</span>
              <span style={{ color:'var(--text-3)' }}>{bookmark.scenarioTitle}</span>
            </p>
            <h2 style={{
              fontSize:'2.4rem', fontWeight:700, letterSpacing:'-0.03em',
              background:'linear-gradient(135deg, var(--cyan), #fff)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>
              {bookmark.word}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width:38, height:38, borderRadius:'50%',
              background:'var(--glass)', border:'1px solid var(--border)',
              color:'var(--text-2)', cursor:'pointer', fontSize:'1rem',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s', flexShrink:0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--magenta)'; e.currentTarget.style.color='var(--magenta)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; }}
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{ padding:'1.6rem 2rem 2rem', overflowY:'auto', flex:1 }}>
          {/* 意味 */}
          <div style={{ marginBottom:'1.4rem' }}>
            <span className="sec-label">MEANING</span>
            <p style={{ fontSize:'1.25rem', fontWeight:300, lineHeight:1.65 }}>{bookmark.meaning}</p>
          </div>

          {/* 例文 */}
          <div style={{ marginBottom:'1.4rem' }}>
            <span className="sec-label" style={{ borderLeftColor:'var(--yellow)', color:'var(--yellow)', background:'linear-gradient(90deg, rgba(255,230,0,0.07), transparent)' }}>
              EXAMPLE
            </span>
            <p style={{
              fontSize:'0.98rem', lineHeight:1.9, color:'var(--text-2)',
              background:'rgba(255,255,255,0.025)',
              border:'1px solid rgba(255,255,255,0.055)',
              borderRadius:10, padding:'1.1rem',
            }}>
              {highlight(bookmark.exampleSentence, bookmark.word)}
            </p>
          </div>

          {/* 発音 */}
          <div style={{ marginBottom:'1.4rem' }}>
            <span className="sec-label">PRONUNCIATION</span>
            <button className="btn btn-primary" onClick={handlePlay}>🔊　音声再生</button>
          </div>

          {/* 録音 */}
          <div style={{ marginBottom:'1.4rem' }}>
            <span className="sec-label" style={{ borderLeftColor:'var(--magenta)', color:'var(--magenta)', background:'linear-gradient(90deg, rgba(255,0,128,0.07), transparent)' }}>
              PRACTICE
            </span>
            {recording ? (
              <button className="btn btn-rec" onClick={() => stt.stop()} style={{ borderRadius:'var(--radius-sm)' }}>
                🎤　録音中...（クリックで停止）
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleRecord}>🎤　録音開始</button>
            )}
            {recognized && (
              <div style={{
                marginTop:'0.9rem', padding:'1.1rem',
                background:'rgba(0,255,136,0.05)',
                border:'1px solid rgba(0,255,136,0.18)',
                borderRadius:10,
              }}>
                <p style={{ fontSize:'0.62rem', fontFamily:'var(--mono)', color:'var(--green)', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>RECOGNIZED</p>
                <p style={{ color:'var(--text-1)' }}>{recognized}</p>
              </div>
            )}
          </div>

          {/* エラー */}
          {error && (
            <div className="err-box" style={{ marginBottom:'1.4rem' }}>
              <p style={{ color:'#ff6eb0', fontFamily:'var(--mono)', fontSize:'0.82rem' }}>⚠ {error}</p>
            </div>
          )}

          {/* アクション */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem' }}>
            <button className="btn btn-danger" onClick={handleDelete}>★ ブックマーク解除</button>
            <button className="btn-ghost" onClick={onClose} style={{ width:'100%', textAlign:'center', borderRadius:'var(--radius-sm)', padding:'1.05rem' }}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}