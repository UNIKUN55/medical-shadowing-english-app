import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function RegisterModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = mode === 'login' ? await login(email) : await register(email);
    if (res.success) { onClose(); setEmail(''); }
    else setError(res.error.message);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem,4vw,2rem)' }}
    >
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderRadius: 20, padding: 'clamp(1.8rem,5vw,2.8rem)', width: '100%', maxWidth: 420, position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.4s ease both' }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--cyan), var(--magenta), var(--cyan))', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }} />

        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: 'clamp(1.5rem,4vw,2.2rem)', background: 'rgba(255,255,255,0.025)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
          {[['login', 'LOGIN'], ['register', 'REGISTER']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: 'none', background: mode === m ? 'linear-gradient(135deg,rgba(0,240,255,0.12),rgba(255,0,128,0.12))' : 'transparent', color: mode === m ? 'var(--t1)' : 'var(--t3)', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--mono)', cursor: 'pointer', transition: 'all 0.28s ease', outline: mode === m ? '1px solid rgba(0,240,255,0.28)' : 'none', boxShadow: mode === m ? '0 0 14px var(--glow-c)' : 'none', letterSpacing: '0.06em' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 'clamp(1.2rem,3vw,1.8rem)' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem,4vw,1.7rem)', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            {mode === 'login' ? (
              <>Welcome{' '}<span style={{ background: 'linear-gradient(135deg,var(--cyan),var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Back</span></>
            ) : (
              <>Get{' '}<span style={{ background: 'linear-gradient(135deg,var(--cyan),var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Started</span></>
            )}
          </h2>
          <p style={{ color: 'var(--t3)', fontSize: '0.78rem', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>
            {mode === 'login' ? 'Enter your registered email address' : 'Enter your email to create account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
            <label style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'var(--mono)', color: 'var(--cyan)', letterSpacing: '0.12em', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required disabled={loading}
              style={{ width: '100%', padding: '0.95rem 1.1rem', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'var(--t1)', fontSize: '1rem', fontFamily: 'var(--font)', outline: 'none', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 18px var(--glow-c)'; e.target.style.background = 'rgba(0,240,255,0.03)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.035)'; }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,0,128,0.07)', border: '1px solid rgba(255,0,128,0.28)', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: 'clamp(1rem,3vw,1.4rem)' }}>
              <p style={{ color: '#ff6eb0', fontSize: '0.82rem', fontFamily: 'var(--mono)' }}>⚠ {error}</p>
            </div>
          )}

          <LoginBtn loading={loading} mode={mode} />
        </form>

        <p style={{ textAlign: 'center', marginTop: 'clamp(1.2rem,3vw,1.6rem)', fontSize: '0.7rem', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
          {mode === 'register' ? (
            'By registering, you agree to our Terms of Service'
          ) : (
            <>No account?{' '}
              <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.7rem', textDecoration: 'underline' }}>
                Register here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function LoginBtn({ loading, mode }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="submit" disabled={loading}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: '100%', padding: '1.05rem', borderRadius: 12, background: h ? 'linear-gradient(135deg,rgba(0,240,255,0.15),rgba(255,0,128,0.15))' : 'linear-gradient(135deg,rgba(0,240,255,0.08),rgba(255,0,128,0.08))', border: `1px solid ${h ? 'var(--cyan)' : 'rgba(0,240,255,0.35)'}`, color: 'var(--t1)', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', opacity: loading ? 0.6 : 1, boxShadow: h ? '0 0 25px var(--glow-c)' : 'none', letterSpacing: '0.02em' }}
    >
      {loading ? '...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
    </button>
  );
}