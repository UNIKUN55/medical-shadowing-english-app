import { useState, useEffect } from 'react';
import { scenariosApi, progressApi, bookmarksApi } from '../services/api';
import { TTSService, STTService } from '../utils/speech';
import { calculateScore } from '../utils/scoring';

const tts = new TTSService();
const stt = new STTService();

function Btn({ onClick, children, variant = 'primary', style = {}, disabled = false }) {
  const [h, setH] = useState(false);
  const base = {
    width: '100%', padding: '1rem 1.8rem', borderRadius: 12,
    fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: h ? 'linear-gradient(135deg,rgba(0,240,255,0.15),rgba(255,0,128,0.15))' : 'linear-gradient(135deg,rgba(0,240,255,0.08),rgba(255,0,128,0.08))', border: `1px solid ${h ? 'var(--cyan)' : 'rgba(0,240,255,0.35)'}`, color: 'var(--t1)', boxShadow: h ? '0 0 25px var(--glow-c)' : 'none', transform: h ? 'translateY(-2px)' : 'none' },
    success: { background: h ? 'rgba(0,255,136,0.15)' : 'rgba(0,255,136,0.07)', border: `1px solid ${h ? 'var(--green)' : 'rgba(0,255,136,0.35)'}`, color: 'var(--t1)', boxShadow: h ? '0 0 25px var(--glow-g)' : 'none', transform: h ? 'translateY(-2px)' : 'none' },
    ghost: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--t2)', width: 'auto', padding: '0.6rem 1.2rem', borderRadius: 50, fontSize: '0.82rem', fontFamily: 'var(--mono)', backdropFilter: 'blur(12px)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 18,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SecLabel({ children, color = 'var(--cyan)', style = {} }) {
  const rgb = color === 'var(--cyan)' ? '0,240,255' : color === 'var(--magenta)' ? '255,0,128' : '255,230,0';
  return (
    <span style={{
      display: 'block',
      padding: '0.48rem 0.72rem',
      background: `linear-gradient(90deg, rgba(${rgb},0.08), transparent)`,
      borderLeft: `2px solid ${color}`,
      borderRadius: '0 6px 6px 0',
      fontSize: '0.72rem', fontWeight: 600,
      fontFamily: 'var(--mono)', color,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: '0.85rem',
      ...style,
    }}>
      {children}
    </span>
  );
}

export function ShadowingPage({ scenarioId, onBack }) {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('initial');
  const [showEnglish, setShowEnglish] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [error, setError] = useState(null);
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());

  useEffect(() => { loadScenario(); }, [scenarioId]);

  const loadScenario = async () => {
    try {
      setLoading(true);
      const data = await scenariosApi.getById(scenarioId);
      setScenario(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handlePlay = async () => {
    try {
      setPhase('playing');
      await tts.speak(scenario.sentenceEn);
      setPhase('waiting');
    } catch (err) {
      setError('音声再生エラー: ' + err.message);
      setPhase('initial');
    }
  };

  const handleStartRecording = async () => {
    try {
      setPhase('recording');
      setRecognizedText('');
      const transcript = await stt.start();
      setRecognizedText(transcript);
      setPhase('evaluating');
      const result = calculateScore(scenario.sentenceEn, transcript);
      setScoreData(result);
      await progressApi.save(scenarioId, result.score);
      setPhase('result');
    } catch (err) {
      setError('音声認識エラー: ' + err.message);
      setPhase('waiting');
    }
  };

  const handleStopRecording = () => { stt.stop(); };

  const handleRetry = () => {
    setPhase('initial');
    setRecognizedText('');
    setScoreData(null);
    setError(null);
  };

  const handleBookmarkWord = async (wordId) => {
    if (bookmarkedWords.has(wordId)) return;
    try {
      await bookmarksApi.add(wordId, scenarioId);
      setBookmarkedWords(new Set([...bookmarkedWords, wordId]));
    } catch (err) {
      if (err.code === 'ALREADY_BOOKMARKED') {
        setBookmarkedWords(new Set([...bookmarkedWords, wordId]));
      }
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.4rem' }}>
      <div style={{ width: 44, height: 44, border: '2px solid rgba(0,240,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', boxShadow: '0 0 18px var(--glow-c)' }} />
      <p style={{ color: 'var(--t2)', fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>LOADING...</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem clamp(1rem,4vw,2rem)' }}>
      <div style={{ background: 'rgba(255,0,128,0.07)', border: '1px solid rgba(255,0,128,0.28)', borderRadius: 14, padding: '1rem 1.2rem', marginBottom: '1.2rem' }}>
        <p style={{ color: '#ff6eb0', fontFamily: 'var(--mono)', fontSize: '0.88rem' }}>{error}</p>
      </div>
      <Btn onClick={onBack} variant="ghost" style={{ width: 'auto' }}>← ホームに戻る</Btn>
    </div>
  );

  const sentenceStyle = {
    fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 300,
    lineHeight: 1.8, color: 'var(--t1)',
    padding: 'clamp(1.2rem,3vw,1.8rem) clamp(1rem,3vw,2rem)',
    background: 'rgba(0,240,255,0.03)',
    border: '1px solid rgba(0,240,255,0.1)',
    borderRadius: 14, textAlign: 'left',
    marginBottom: 'clamp(1.5rem,4vw,2.5rem)',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(6,8,15,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          padding: '0 clamp(1rem,4vw,2rem)',
          display: 'flex', alignItems: 'center',
          gap: 'clamp(0.8rem,2vw,1.4rem)', height: 62,
        }}>
          <Btn onClick={onBack} variant="ghost" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            ← 戻る
          </Btn>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.7rem', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.6rem', fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: '0.1em', flexShrink: 0 }}>SCENARIO</span>
            <span style={{ fontSize: 'clamp(0.88rem,2.5vw,1rem)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {scenario.title}
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--mono)', letterSpacing: '0.1em', flexShrink: 0 }}>
            {phase === 'initial' && <span style={{ color: 'var(--t3)' }}>READY</span>}
            {phase === 'playing' && <span style={{ color: 'var(--cyan)' }}>▶ PLAYING</span>}
            {phase === 'waiting' && <span style={{ color: 'var(--yellow)' }}>● STANDBY</span>}
            {phase === 'recording' && <span style={{ color: 'var(--magenta)', animation: 'pulse 1s ease-in-out infinite' }}>⬤ REC</span>}
            {phase === 'evaluating' && <span style={{ color: 'var(--t2)' }}>◌ ANALYZING</span>}
            {phase === 'result' && <span style={{ color: 'var(--green)' }}>✓ DONE</span>}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)' }}>

        {phase === 'initial' && (
          <GlassCard style={{ padding: 'clamp(1.5rem,4vw,3rem)', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <SecLabel style={{ display: 'inline-block', marginBottom: 'clamp(1.2rem,3vw,1.8rem)' }}>STEP 01 — LISTEN</SecLabel>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--t2)', fontFamily: 'var(--mono)' }}>
                <input type="checkbox" checked={showEnglish} onChange={e => setShowEnglish(e.target.checked)} style={{ accentColor: 'var(--cyan)', width: 14, height: 14 }} />
                英文を表示
              </label>
            </div>
            {showEnglish && <p style={sentenceStyle}>{scenario.sentenceEn}</p>}
            <Btn onClick={handlePlay} style={{ maxWidth: 260, margin: '0 auto' }}>🔊　音声を再生する</Btn>
            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>PRESS PLAY TO BEGIN</p>
          </GlassCard>
        )}

        {phase === 'playing' && (
          <GlassCard style={{ padding: '5rem', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 2rem', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 35px var(--glow-c)', animation: 'pulse 1.5s ease-in-out infinite' }}>
              🔊
            </div>
            <p style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>PLAYING...</p>
          </GlassCard>
        )}

        {phase === 'waiting' && (
          <GlassCard style={{ padding: 'clamp(1.5rem,4vw,3rem)', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <SecLabel style={{ display: 'inline-block', marginBottom: 'clamp(1.2rem,3vw,1.8rem)' }}>STEP 02 — SHADOW</SecLabel>
            {showEnglish && <p style={sentenceStyle}>{scenario.sentenceEn}</p>}
            <Btn onClick={handleStartRecording} variant="success" style={{ maxWidth: 260, margin: '0 auto' }}>🎤　録音開始</Btn>
            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>SPEAK INTO YOUR MICROPHONE</p>
          </GlassCard>
        )}

        {phase === 'recording' && (
          <GlassCard style={{ padding: 'clamp(2rem,5vw,4rem)', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto clamp(1.5rem,4vw,2.5rem)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 80 + i * 40, height: 80 + i * 40,
                  borderRadius: '50%',
                  border: `1px solid rgba(255,0,128,${0.35 - i * 0.1})`,
                  transform: 'translate(-50%,-50%)',
                  animation: `pulse 1.8s ease-in-out ${i * 0.35}s infinite`,
                }} />
              ))}
              <button
                onClick={handleStopRecording}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: 110, height: 110, borderRadius: '50%',
                  background: 'rgba(255,0,128,0.12)',
                  border: '1px solid rgba(255,0,128,0.55)',
                  color: 'var(--t1)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.3rem', animation: 'pulse 1.4s ease-in-out infinite',
                  fontSize: '0.72rem', fontFamily: 'var(--mono)',
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>🎤</span>
                <span style={{ letterSpacing: '0.05em', opacity: 0.8 }}>STOP</span>
              </button>
            </div>
            <p style={{ color: 'var(--magenta)', fontFamily: 'var(--mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>⬤ REC — SPEAK NOW</p>
            <p style={{ color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: '0.68rem', marginTop: '0.5rem' }}>2秒間の無音で自動停止</p>
          </GlassCard>
        )}

        {phase === 'evaluating' && (
          <GlassCard style={{ padding: '5rem', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ width: 44, height: 44, border: '2px solid rgba(0,240,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', boxShadow: '0 0 18px var(--glow-c)', margin: '0 auto 1.4rem' }} />
            <p style={{ color: 'var(--t2)', fontFamily: 'var(--mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ANALYZING...</p>
          </GlassCard>
        )}
        {phase === 'result' && scoreData && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <GlassCard style={{ padding: 'clamp(1.5rem,4vw,2.8rem)', textAlign: 'center', marginBottom: '1.2rem' }}>
              <p style={{ fontSize: '0.62rem', fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>PRONUNCIATION SCORE</p>
              <div style={{ fontSize: 'clamp(4rem,10vw,5.5rem)', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, background: 'linear-gradient(135deg,var(--cyan),var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 24px rgba(0,240,255,0.28))' }}>
                {scoreData.score}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--t2)', fontFamily: 'var(--mono)', marginTop: '0.7rem' }}>
                {scoreData.matchCount} / {scoreData.totalWords} words correct
              </p>
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
              <GlassCard style={{ padding: 'clamp(1.2rem,3vw,1.8rem)' }}>
                <SecLabel>CORRECT</SecLabel>
                <p style={{ fontSize: 'clamp(0.9rem,2.5vw,1rem)', lineHeight: 1.85, color: 'var(--t1)' }}>{scenario.sentenceEn}</p>
              </GlassCard>
              <GlassCard style={{ padding: 'clamp(1.2rem,3vw,1.8rem)' }}>
                <SecLabel color="var(--magenta)">YOUR SPEECH</SecLabel>
                <p style={{ fontSize: 'clamp(0.9rem,2.5vw,1rem)', lineHeight: 1.85, color: 'var(--t1)' }}>{recognizedText}</p>
              </GlassCard>
            </div>

            <GlassCard style={{ padding: 'clamp(1.2rem,3vw,1.8rem)', marginBottom: '1.2rem' }}>
              <SecLabel color="var(--yellow)">JAPANESE</SecLabel>
              <p style={{ fontSize: 'clamp(0.9rem,2.5vw,1rem)', lineHeight: 1.85, color: 'var(--t2)' }}>{scenario.sentenceJa}</p>
            </GlassCard>

            <GlassCard style={{ padding: 'clamp(1.2rem,3vw,1.8rem)', marginBottom: 'clamp(1.2rem,3vw,1.8rem)' }}>
              <SecLabel>VOCABULARY</SecLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {scenario.words.map(word => (
                  <WordItem key={word.id} word={word} bookmarked={bookmarkedWords.has(word.id)} onBookmark={() => handleBookmarkWord(word.id)} />
                ))}
              </div>
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
              <Btn onClick={handleRetry}>もう一度挑戦</Btn>
              <Btn onClick={onBack} variant="ghost" style={{ width: '100%', borderRadius: 12, padding: '1rem' }}>ホームに戻る</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WordItem({ word, bookmarked, onBookmark }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: 'clamp(0.65rem,2vw,0.85rem) clamp(0.8rem,2vw,1.1rem)', background: h ? 'rgba(0,240,255,0.04)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 10, transition: 'all 0.18s ease' }}
    >
      <div>
        <span style={{ fontWeight: 600, color: 'var(--t1)', marginRight: '0.9rem', fontSize: 'clamp(0.88rem,2.5vw,1rem)' }}>{word.word}</span>
        <span style={{ color: 'var(--t2)', fontSize: 'clamp(0.82rem,2.5vw,0.92rem)' }}>{word.meaning}</span>
      </div>
      <button
        onClick={onBookmark}
        style={{ padding: '0.32rem 0.85rem', borderRadius: 8, border: bookmarked ? '1px solid rgba(255,230,0,0.45)' : '1px solid rgba(255,255,255,0.08)', background: bookmarked ? 'rgba(255,230,0,0.1)' : 'transparent', color: bookmarked ? 'var(--yellow)' : 'var(--t3)', cursor: bookmarked ? 'default' : 'pointer', transition: 'all 0.18s', fontSize: '0.9rem', flexShrink: 0 }}
      >
        {bookmarked ? '★' : '☆'}
      </button>
    </div>
  );
}