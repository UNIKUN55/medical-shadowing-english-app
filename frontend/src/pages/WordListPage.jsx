import { useState, useEffect } from 'react';
import { bookmarksApi } from '../services/api';
import { TTSService } from '../utils/speech';

const tts = new TTSService();

export function WordListPage({ onSelectWord }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const data = await bookmarksApi.getAll();
      setBookmarks(data.bookmarks);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handlePlay = async (word, e) => {
    e.stopPropagation();
    try { await tts.speak(word); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('削除しますか？')) return;
    try {
      await bookmarksApi.delete(id);
      setBookmarks(b => b.filter(x => x.id !== id));
    } catch (e) { alert('削除失敗: ' + e.message); }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.4rem' }}>
      <div style={{ width: 44, height: 44, border: '2px solid rgba(0,240,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', boxShadow: '0 0 18px var(--glow-c)' }} />
      <p style={{ color: 'var(--t2)', fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>LOADING...</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem clamp(1rem,4vw,2rem)' }}>
      <div style={{ background: 'rgba(255,0,128,0.07)', border: '1px solid rgba(255,0,128,0.28)', borderRadius: 14, padding: '1rem 1.2rem', marginBottom: '1rem' }}>
        <p style={{ color: '#ff6eb0', fontFamily: 'var(--mono)', fontSize: '0.88rem' }}>ERROR: {error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,2rem)' }}>

        <div style={{ marginBottom: 'clamp(1.8rem,4vw,2.8rem)', animation: 'fadeUp 0.55s ease both' }}>
          <p style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.15em', marginBottom: '0.7rem' }}>
            VOCABULARY LIBRARY
            <span style={{ color: 'var(--cyan)', marginLeft: '0.6rem' }}>// {bookmarks.length} words</span>
          </p>
          <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.8rem)', fontWeight: 300, letterSpacing: '-0.03em' }}>
            あなたの
            <span style={{ background: 'linear-gradient(135deg,var(--cyan),var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              単語リスト
            </span>
          </h2>
        </div>

        {bookmarks.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 18, padding: 'clamp(3rem,8vw,5rem)', textAlign: 'center', animation: 'fadeUp 0.55s ease both 0.1s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1.2rem', opacity: 0.35 }}>📚</div>
            <p style={{ color: 'var(--t2)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>ブックマークがありません</p>
            <p style={{ color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>シャドウイング後に単語を追加してください</p>
          </div>
        ) : (
          window.innerWidth < 640 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', animation: 'fadeUp 0.55s ease both 0.1s' }}>
              {bookmarks.map(b => (
                <MobileWordCard key={b.id} bookmark={b} onSelect={onSelectWord} onPlay={handlePlay} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 18, overflow: 'hidden', animation: 'fadeUp 0.55s ease both 0.1s' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['WORD / PHRASE', 'MEANING', 'SCENARIO', 'ACTIONS'].map((h, i) => (
                      <th key={h} style={{ padding: '0.9rem 1.4rem', textAlign: i === 3 ? 'right' : 'left', fontSize: '0.65rem', fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,240,255,0.025)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookmarks.map(b => (
                    <WordRow key={b.id} bookmark={b} onSelect={onSelectWord} onPlay={handlePlay} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function WordRow({ bookmark, onSelect, onPlay, onDelete }) {
  const [h, setH] = useState(false);
  return (
    <tr
      onClick={() => onSelect(bookmark)}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ cursor: 'pointer', borderLeft: `2px solid ${h ? 'var(--cyan)' : 'transparent'}`, transition: 'all 0.18s', background: h ? 'rgba(0,240,255,0.035)' : 'transparent' }}
    >
      <td style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.035)' }}>
        <div style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: '0.15rem' }}>{bookmark.word}</div>
        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.06em' }}>
          {bookmark.wordType === 'phrase' ? 'PHRASE' : 'WORD'}
        </div>
      </td>
      <td style={{ padding: '1.1rem 1.4rem', color: 'var(--t2)', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.035)' }}>{bookmark.meaning}</td>
      <td style={{ padding: '1.1rem 1.4rem', color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.035)' }}>{bookmark.scenarioTitle}</td>
      <td style={{ padding: '1.1rem 1.4rem', textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.035)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
          <ActionBtn color="cyan" onClick={e => onPlay(bookmark.word, e)}>🔊</ActionBtn>
          <ActionBtn color="magenta" onClick={e => onDelete(bookmark.id, e)}>🗑️</ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function MobileWordCard({ bookmark, onSelect, onPlay, onDelete }) {
  return (
    <div
      onClick={() => onSelect(bookmark)}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 14, padding: '1.1rem', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '1rem' }}>{bookmark.word}</span>
          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--t3)', marginLeft: '0.6rem', letterSpacing: '0.06em' }}>
            {bookmark.wordType === 'phrase' ? 'PHRASE' : 'WORD'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <ActionBtn color="cyan" onClick={e => onPlay(bookmark.word, e)}>🔊</ActionBtn>
          <ActionBtn color="magenta" onClick={e => onDelete(bookmark.id, e)}>🗑️</ActionBtn>
        </div>
      </div>
      <p style={{ color: 'var(--t2)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{bookmark.meaning}</p>
      <p style={{ color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: '0.7rem' }}>{bookmark.scenarioTitle}</p>
    </div>
  );
}

function ActionBtn({ color, onClick, children }) {
  const [h, setH] = useState(false);
  const isCyan = color === 'cyan';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: '0.42rem 0.82rem', borderRadius: 8, background: h ? (isCyan ? 'rgba(0,240,255,0.18)' : 'rgba(255,0,128,0.18)') : (isCyan ? 'rgba(0,240,255,0.07)' : 'rgba(255,0,128,0.07)'), border: `1px solid ${isCyan ? 'rgba(0,240,255,0.3)' : 'rgba(255,0,128,0.3)'}`, cursor: 'pointer', transition: 'all 0.18s', boxShadow: h ? (isCyan ? '0 0 12px var(--glow-c)' : '0 0 12px var(--glow-m)') : 'none', fontSize: '0.85rem' }}
    >
      {children}
    </button>
  );
}