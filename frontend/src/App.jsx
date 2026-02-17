import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RegisterModal } from './components/RegisterModal';
import { HomePage } from './pages/HomePage';
import { ShadowingPage } from './pages/ShadowingPage';
import { WordListPage } from './pages/WordListPage';
import { WordDetailModal } from './components/WordDetailModal';

function BgLayer() {
  return (
    <div className="bg-layer">
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-noise" />
    </div>
  );
}

function Header({ user, currentPage, onNavigate, onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(6,8,15,0.82)',
      borderBottom: '1px solid rgba(255,255,255,0.055)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 2rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', height: 68,
      }}>
        {/* ロゴ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--cyan)',
            boxShadow: '0 0 8px var(--cyan), 0 0 16px var(--glow-c)',
            animation: 'recPulse 2.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--cyan), #fff 60%, var(--magenta))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Medical English Shadowing
          </span>
        </div>
        {/* ナビ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', marginRight: '1.2rem' }}>
            {[['home','シナリオ一覧'],['wordlist','単語リスト']].map(([p,label]) => (
              <button
                key={p}
                className={`tab ${currentPage === p ? 'on' : ''}`}
                onClick={() => onNavigate(p)}
              >
                {label}
              </button>
            ))}
          </div>
          <span style={{
            fontSize: '0.72rem', color: 'var(--text-3)',
            fontFamily: 'var(--mono)', marginRight: '0.8rem',
          }}>
            {user?.email}
          </span>
          <button className="btn-ghost" onClick={onLogout}>ログアウト</button>
        </div>
      </div>
    </header>
  );
}

function MainApp() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('home');
  const [scenarioId, setScenarioId] = useState(null);
  const [word, setWord] = useState(null);
  const [wordModal, setWordModal] = useState(false);

  return (
    <div className="app-root">
      <BgLayer />
      {page !== 'shadowing' && (
        <Header
          user={user} currentPage={page}
          onNavigate={setPage} onLogout={logout}
        />
      )}
      {page === 'home' && (
        <HomePage onSelectScenario={id => { setScenarioId(id); setPage('shadowing'); }} />
      )}
      {page === 'wordlist' && (
        <WordListPage onSelectWord={b => { setWord(b); setWordModal(true); }} />
      )}
      {page === 'shadowing' && scenarioId && (
        <ShadowingPage
          scenarioId={scenarioId}
          onBack={() => { setPage('home'); setScenarioId(null); }}
        />
      )}
      <WordDetailModal
        bookmark={word} isOpen={wordModal}
        onClose={() => setWordModal(false)}
        onDeleted={() => { setWordModal(false); setPage('wordlist'); }}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="app-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'1.4rem' }}>
      <BgLayer />
      <div className="spinner" />
      <p style={{ color:'var(--text-2)', fontFamily:'var(--mono)', fontSize:'0.8rem', letterSpacing:'0.1em' }}>
        INITIALIZING...
      </p>
    </div>
  );
}

function LoginScreen({ showModal, setShowModal }) {
  return (
    <div className="app-root">
      <BgLayer />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div className="fade-in" style={{ textAlign:'center', maxWidth:560 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            fontSize:'0.7rem', fontFamily:'var(--mono)', color:'var(--cyan)',
            background:'rgba(0,240,255,0.07)',
            border:'1px solid rgba(0,240,255,0.18)',
            padding:'0.38rem 1rem', borderRadius:'20px',
            marginBottom:'2rem', letterSpacing:'0.1em',
          }}>
            <span style={{
              width:5, height:5, borderRadius:'50%',
              background:'var(--cyan)', display:'inline-block',
              boxShadow:'0 0 6px var(--cyan)',
            }} />
            MEDICAL LEARNING PLATFORM
          </div>
          <h1 style={{
            fontSize:'clamp(2.8rem, 6vw, 4.8rem)',
            fontWeight: 300, letterSpacing:'-0.04em',
            lineHeight: 1.1, marginBottom:'1.4rem',
          }}>
            <span className="grad-text">Medical English</span>
            <br />
            <span style={{ color:'var(--text-2)', fontWeight:200 }}>Shadowing</span>
          </h1>
          <p style={{
            color:'var(--text-3)', fontFamily:'var(--mono)',
            fontSize:'0.85rem', letterSpacing:'0.06em', marginBottom:'3rem',
          }}>
            AI-POWERED PRONUNCIATION TRAINING
          </p>
          <button
            className="btn btn-primary"
            style={{ maxWidth:300, margin:'0 auto' }}
            onClick={() => setShowModal(true)}
          >
            ログイン / 新規登録
          </button>
        </div>
      </div>
      <RegisterModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  useEffect(() => { if (!loading && !user) setShowModal(true); }, [loading, user]);
  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen showModal={showModal} setShowModal={setShowModal} />;
  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}