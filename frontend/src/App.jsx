import { useRef, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RegisterModal } from './components/RegisterModal';
import { HomePage } from './pages/HomePage';
import { ShadowingPage } from './pages/ShadowingPage';
import { WordListPage } from './pages/WordListPage';
import { WordDetailModal } from './components/WordDetailModal';
import { useInteractiveBackground } from './hooks/useInteractiveBackground';

function Header({ user, currentPage, onNavigate, onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(6,8,15,0.88)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        height: 'clamp(56px, 8vw, 68px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--cyan)',
            boxShadow: '0 0 8px var(--cyan)',
            animation: 'glowPulse 2.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            fontWeight: 700, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--cyan), #fff 60%, var(--magenta))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', whiteSpace: 'nowrap',
          }}>
            Medical English Shadowing
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {[['home','シナリオ一覧'],['wordlist','単語リスト']].map(([p, label]) => (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              style={{
                padding: 'clamp(0.5rem, 1.5vw, 0.7rem) clamp(0.8rem, 2vw, 1.5rem)',
                borderRadius: 10,
                border: currentPage === p
                  ? '1px solid rgba(0,240,255,0.45)'
                  : '1px solid rgba(255,255,255,0.08)',
                background: currentPage === p
                  ? 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,0,128,0.1))'
                  : 'rgba(255,255,255,0.04)',
                color: currentPage === p ? 'var(--t1)' : 'var(--t2)',
                fontSize: 'clamp(0.78rem, 1.8vw, 0.9rem)',
                fontWeight: 500,
                fontFamily: 'var(--mono)',
                cursor: 'pointer',
                transition: 'all 0.28s ease',
                boxShadow: currentPage === p ? '0 0 20px var(--glow-c)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
          <span style={{
            fontSize: '0.7rem', color: 'var(--t3)',
            fontFamily: 'var(--mono)', margin: '0 0.5rem',
            display: window.innerWidth < 480 ? 'none' : 'block',
            maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {user?.email}
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 50, color: 'var(--t2)',
              fontSize: '0.82rem', fontWeight: 500,
              fontFamily: 'var(--mono)', cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.28s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.color = 'var(--t1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--t2)';
            }}
          >
            ログアウト
          </button>
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
    <>
      {page !== 'shadowing' && (
        <Header user={user} currentPage={page} onNavigate={setPage} onLogout={logout} />
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
    </>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1.4rem',
    }}>
      <div style={{
        width: 44, height: 44,
        border: '2px solid rgba(0,240,255,0.15)',
        borderTopColor: 'var(--cyan)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        boxShadow: '0 0 18px var(--glow-c)',
      }} />
      <p style={{ color: 'var(--t2)', fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
        INITIALIZING...
      </p>
    </div>
  );
}

function LoginScreen({ showModal, setShowModal }) {
  return (
    <>
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 560, animation: 'fadeUp 0.6s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.68rem', fontFamily: 'var(--mono)', color: 'var(--cyan)',
            background: 'rgba(0,240,255,0.07)',
            border: '1px solid rgba(0,240,255,0.18)',
            padding: '0.38rem 1rem', borderRadius: 20,
            marginBottom: '2rem', letterSpacing: '0.1em',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--cyan)', display: 'inline-block',
              boxShadow: '0 0 6px var(--cyan)',
            }} />
            MEDICAL LEARNING PLATFORM
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 7vw, 4.8rem)',
            fontWeight: 300, letterSpacing: '-0.04em',
            lineHeight: 1.1, marginBottom: '1.4rem',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--cyan) 0%, #fff 55%, var(--magenta) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Medical English
            </span>
            <br />
            <span style={{ color: 'var(--t2)', fontWeight: 200 }}>Shadowing</span>
          </h1>

          <p style={{
            color: 'var(--t3)', fontFamily: 'var(--mono)',
            fontSize: 'clamp(0.72rem, 2vw, 0.88rem)',
            letterSpacing: '0.06em', marginBottom: '3rem',
          }}>
            AI-POWERED PRONUNCIATION TRAINING
          </p>

          <button
            onClick={() => setShowModal(true)}
            style={{
              width: '100%', maxWidth: 300,
              padding: '1.1rem 2rem',
              background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,0,128,0.1))',
              border: '1px solid rgba(0,240,255,0.38)',
              borderRadius: 14, color: 'var(--t1)',
              fontSize: '1rem', fontWeight: 600,
              fontFamily: 'var(--font)', cursor: 'pointer',
              transition: 'all 0.3s ease',
              margin: '0 auto', display: 'block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.boxShadow = '0 0 28px var(--glow-c)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.38)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            ログイン / 新規登録
          </button>
        </div>
      </div>
      <RegisterModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
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
  const canvasRef = useRef(null);
  useInteractiveBackground(canvasRef);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg)' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 0, pointerEvents: 'none', display: 'block',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </div>
  );
}