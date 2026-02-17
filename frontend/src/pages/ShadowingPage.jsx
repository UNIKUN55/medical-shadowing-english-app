import { useState, useEffect } from 'react';
import { scenariosApi, progressApi, bookmarksApi } from '../services/api';
import { TTSService, STTService } from '../utils/speech';
import { calculateScore, generateDiff } from '../utils/scoring';

const tts = new TTSService();
const stt = new STTService();

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    try {
      if (bookmarkedWords.has(wordId)) return;
      await bookmarksApi.add(wordId, scenarioId);
      setBookmarkedWords(new Set([...bookmarkedWords, wordId]));
    } catch (err) {
      if (err.code === 'ALREADY_BOOKMARKED') {
        setBookmarkedWords(new Set([...bookmarkedWords, wordId]));
      }
    }
  };

  // ---- ローディング ----
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1.4rem' }}>
      <div className="spinner" />
      <p style={{ color:'var(--text-2)', fontFamily:'var(--mono)', fontSize:'0.78rem', letterSpacing:'0.1em' }}>
        LOADING...
      </p>
    </div>
  );

  // ---- エラー ----
  if (error) return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'4rem 2rem' }}>
      <div className="err-box" style={{ marginBottom:'1.2rem' }}>
        <p style={{ color:'#ff6eb0', fontFamily:'var(--mono)', fontSize:'0.88rem' }}>{error}</p>
      </div>
      <button className="btn-ghost" onClick={onBack}>← ホームに戻る</button>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh' }}>

      {/* ---- ヘッダー ---- */}
      <div style={{
        position:'sticky', top:0, zIndex:200,
        background:'rgba(6,8,15,0.85)',
        borderBottom:'1px solid rgba(255,255,255,0.055)',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
      }}>
        <div style={{
          maxWidth:900, margin:'0 auto', padding:'0 2rem',
          display:'flex', alignItems:'center', gap:'1.4rem', height:62,
        }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding:'0.5rem 1rem', fontSize:'0.82rem' }}>
            ← 戻る
          </button>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <span style={{ fontSize:'0.62rem', fontFamily:'var(--mono)', color:'var(--cyan)', letterSpacing:'0.1em' }}>
              SCENARIO
            </span>
            <span style={{ fontSize:'1rem', fontWeight:600, color:'var(--text-1)' }}>
              {scenario.title}
            </span>
          </div>
          {/* フェーズ表示 */}
          <span style={{ fontSize:'0.65rem', fontFamily:'var(--mono)', letterSpacing:'0.1em' }}>
            {phase === 'initial'    && <span style={{ color:'var(--text-3)' }}>READY</span>}
            {phase === 'playing'    && <span style={{ color:'var(--cyan)' }}>▶ PLAYING</span>}
            {phase === 'waiting'    && <span style={{ color:'var(--yellow)' }}>● STANDBY</span>}
            {phase === 'recording'  && <span style={{ color:'var(--magenta)', animation:'recPulse 1s ease-in-out infinite' }}>⬤ REC</span>}
            {phase === 'evaluating' && <span style={{ color:'var(--text-2)' }}>◌ ANALYZING</span>}
            {phase === 'result'     && <span style={{ color:'var(--green)' }}>✓ COMPLETE</span>}
          </span>
        </div>
      </div>

      {/* ---- メイン ---- */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 2rem' }}>

        {/* ======== INITIAL ======== */}
        {phase === 'initial' && (
          <div className="glass fade-in" style={{ borderRadius:'var(--radius)', padding:'3rem', textAlign:'center' }}>
            <span className="sec-label" style={{ display:'inline-block', marginBottom:'1.8rem' }}>
              STEP 01 — LISTEN
            </span>

            <div style={{ marginBottom:'1.8rem' }}>
              <label style={{
                display:'inline-flex', alignItems:'center', gap:'0.6rem',
                cursor:'pointer', fontSize:'0.85rem', color:'var(--text-2)',
                fontFamily:'var(--mono)',
              }}>
                <input
                  type="checkbox"
                  checked={showEnglish}
                  onChange={e => setShowEnglish(e.target.checked)}
                  style={{ accentColor:'var(--cyan)', width:14, height:14 }}
                />
                英文を表示
              </label>
            </div>

            {showEnglish && (
              <p style={{
                fontSize:'1.45rem', fontWeight:300, lineHeight:1.75,
                color:'var(--text-1)', marginBottom:'2.8rem',
                padding:'1.8rem 2rem',
                background:'rgba(0,240,255,0.035)',
                border:'1px solid rgba(0,240,255,0.1)',
                borderRadius:14, textAlign:'left',
              }}>
                {scenario.sentenceEn}
              </p>
            )}

            <button
              className="btn btn-primary"
              onClick={handlePlay}
              style={{ maxWidth:260, margin:'0 auto' }}
            >
              🔊　音声を再生する
            </button>
            <p style={{ marginTop:'1.2rem', fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--mono)', letterSpacing:'0.05em' }}>
              PRESS PLAY TO BEGIN
            </p>
          </div>
        )}

        {/* ======== PLAYING ======== */}
        {phase === 'playing' && (
          <div className="glass fade-in" style={{ borderRadius:'var(--radius)', padding:'5rem', textAlign:'center' }}>
            <div style={{
              width:80, height:80, borderRadius:'50%', margin:'0 auto 2rem',
              background:'rgba(0,240,255,0.08)',
              border:'1px solid rgba(0,240,255,0.28)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'2rem',
              boxShadow:'0 0 35px var(--glow-c)',
              animation:'recPulse 1.5s ease-in-out infinite',
            }}>
              🔊
            </div>
            <p style={{ fontFamily:'var(--mono)', color:'var(--cyan)', letterSpacing:'0.1em', fontSize:'0.88rem' }}>
              PLAYING...
            </p>
          </div>
        )}

        {/* ======== WAITING ======== */}
        {phase === 'waiting' && (
          <div className="glass fade-in" style={{ borderRadius:'var(--radius)', padding:'3rem', textAlign:'center' }}>
            <span className="sec-label" style={{ display:'inline-block', marginBottom:'1.8rem' }}>
              STEP 02 — SHADOW
            </span>

            {showEnglish && (
              <p style={{
                fontSize:'1.45rem', fontWeight:300, lineHeight:1.75,
                color:'var(--text-1)', marginBottom:'2.8rem',
                padding:'1.8rem 2rem',
                background:'rgba(0,240,255,0.035)',
                border:'1px solid rgba(0,240,255,0.1)',
                borderRadius:14, textAlign:'left',
              }}>
                {scenario.sentenceEn}
              </p>
            )}

            <button
              className="btn btn-success"
              onClick={handleStartRecording}
              style={{ maxWidth:260, margin:'0 auto' }}
            >
              🎤　録音開始
            </button>
            <p style={{ marginTop:'1.2rem', fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--mono)', letterSpacing:'0.05em' }}>
              SPEAK INTO YOUR MICROPHONE
            </p>
          </div>
        )}

        {/* ======== RECORDING ======== */}
        {phase === 'recording' && (
          <div className="glass fade-in" style={{ borderRadius:'var(--radius)', padding:'4rem', textAlign:'center' }}>
            <div style={{ position:'relative', width:180, height:180, margin:'0 auto 2.5rem' }}>
              {/* 波紋 */}
              {[0,1,2].map(i => (
                <div key={i} style={{
                  position:'absolute', top:'50%', left:'50%',
                  width: 80 + i*40, height: 80 + i*40,
                  borderRadius:'50%',
                  border:`1px solid rgba(255,0,128,${0.35 - i*0.1})`,
                  transform:'translate(-50%,-50%)',
                  animation:`recPulse 1.8s ease-in-out ${i*0.35}s infinite`,
                }} />
              ))}
              {/* 録音ボタン */}
              <button
                onClick={handleStopRecording}
                className="btn btn-rec"
                style={{
                  position:'absolute', top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)',
                  width:110, height:110, borderRadius:'50%',
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center',
                  gap:'0.3rem', padding:0, fontSize:'0.75rem',
                }}
              >
                <span style={{ fontSize:'1.8rem' }}>🎤</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', letterSpacing:'0.05em', opacity:0.8 }}>
                  STOP
                </span>
              </button>
            </div>
            <p style={{ color:'var(--magenta)', fontFamily:'var(--mono)', fontSize:'0.82rem', letterSpacing:'0.1em' }}>
              ⬤ REC — SPEAK NOW
            </p>
            <p style={{ color:'var(--text-3)', fontFamily:'var(--mono)', fontSize:'0.7rem', marginTop:'0.5rem' }}>
              2秒間の無音で自動停止
            </p>
          </div>
        )}

        {/* ======== EVALUATING ======== */}
        {phase === 'evaluating' && (
          <div className="glass fade-in" style={{ borderRadius:'var(--radius)', padding:'5rem', textAlign:'center' }}>
            <div className="spinner" style={{ margin:'0 auto 1.4rem' }} />
            <p style={{ color:'var(--text-2)', fontFamily:'var(--mono)', fontSize:'0.82rem', letterSpacing:'0.1em' }}>
              ANALYZING...
            </p>
          </div>
        )}

        {/* ======== RESULT ======== */}
        {phase === 'result' && scoreData && (
          <div className="fade-in">

            {/* スコアカード */}
            <div className="glass" style={{ borderRadius:'var(--radius)', padding:'2.8rem', textAlign:'center', marginBottom:'1.2rem' }}>
              <p style={{ fontSize:'0.65rem', fontFamily:'var(--mono)', color:'var(--text-3)', letterSpacing:'0.15em', marginBottom:'0.8rem' }}>
                PRONUNCIATION SCORE
              </p>
              <div className="score-num">{scoreData.score}</div>
              <p style={{ fontSize:'0.82rem', color:'var(--text-2)', fontFamily:'var(--mono)', marginTop:'0.7rem' }}>
                {scoreData.matchCount} / {scoreData.totalWords} words correct
              </p>
            </div>

            {/* 正解 / 発音 */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem', marginBottom:'1.2rem' }}>
              <div className="glass" style={{ borderRadius:'var(--radius)', padding:'1.8rem' }}>
                <span className="sec-label">CORRECT</span>
                <p style={{ fontSize:'0.98rem', lineHeight:1.85, color:'var(--text-1)' }}>
                  {scenario.sentenceEn}
                </p>
              </div>
              <div className="glass" style={{ borderRadius:'var(--radius)', padding:'1.8rem' }}>
                <span className="sec-label" style={{
                  borderLeftColor:'var(--magenta)', color:'var(--magenta)',
                  background:'linear-gradient(90deg, rgba(255,0,128,0.08), transparent)',
                }}>
                  YOUR SPEECH
                </span>
                <p style={{ fontSize:'0.98rem', lineHeight:1.85, color:'var(--text-1)' }}>
                  {recognizedText}
                </p>
              </div>
            </div>

            {/* 日本語訳 */}
            <div className="glass" style={{ borderRadius:'var(--radius)', padding:'1.8rem', marginBottom:'1.2rem' }}>
              <span className="sec-label" style={{
                borderLeftColor:'var(--yellow)', color:'var(--yellow)',
                background:'linear-gradient(90deg, rgba(255,230,0,0.07), transparent)',
              }}>
                JAPANESE
              </span>
              <p style={{ fontSize:'0.98rem', lineHeight:1.85, color:'var(--text-2)' }}>
                {scenario.sentenceJa}
              </p>
            </div>

            {/* 単語リスト */}
            <div className="glass" style={{ borderRadius:'var(--radius)', padding:'1.8rem', marginBottom:'1.8rem' }}>
              <span className="sec-label">VOCABULARY</span>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {scenario.words.map(word => (
                  <WordItem
                    key={word.id}
                    word={word}
                    bookmarked={bookmarkedWords.has(word.id)}
                    onBookmark={() => handleBookmarkWord(word.id)}
                  />
                ))}
              </div>
            </div>

            {/* アクション */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <button className="btn btn-primary" onClick={handleRetry}>
                もう一度挑戦
              </button>
              <button
                className="btn-ghost"
                onClick={onBack}
                style={{ width:'100%', textAlign:'center', borderRadius:'var(--radius-sm)', padding:'1.05rem' }}
              >
                ホームに戻る
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function WordItem({ word, bookmarked, onBookmark }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'0.85rem 1.1rem',
        background: hovered ? 'rgba(0,240,255,0.04)' : 'rgba(255,255,255,0.02)',
        border:'1px solid rgba(255,255,255,0.055)',
        borderRadius:10,
        transition:'all 0.18s ease',
      }}
    >
      <div>
        <span style={{ fontWeight:600, color:'var(--text-1)', marginRight:'1rem' }}>
          {word.word}
        </span>
        <span style={{ color:'var(--text-2)', fontSize:'0.92rem' }}>
          {word.meaning}
        </span>
      </div>
      <button
        onClick={onBookmark}
        style={{
          padding:'0.35rem 0.9rem', borderRadius:8,
          border: bookmarked ? '1px solid rgba(255,230,0,0.45)' : '1px solid var(--border)',
          background: bookmarked ? 'rgba(255,230,0,0.1)' : 'transparent',
          color: bookmarked ? 'var(--yellow)' : 'var(--text-3)',
          cursor: bookmarked ? 'default' : 'pointer',
          transition:'all 0.18s ease',
          fontSize:'0.9rem',
        }}
      >
        {bookmarked ? '★' : '☆'}
      </button>
    </div>
  );
}