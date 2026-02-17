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
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.82)',
      backdropFilter:'blur(16px)',
      WebkitBackdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'2rem',
    }}>
      <div className="glass fade-in" style={{
        borderRadius:'var(--radius)', padding:'2.8rem',
        width:'100%', maxWidth:420, position:'relative', overflow:'hidden',
      }}>
        {/* トップバー */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:2,
          background:'linear-gradient(90deg, var(--cyan), var(--magenta), var(--cyan))',
          backgroundSize:'200% 100%',
          animation:'shimmer 3s linear infinite',
        }} />

        {/* タブ */}
        <div style={{
          display:'flex', gap:'0.4rem', marginBottom:'2.2rem',
          background:'rgba(255,255,255,0.025)',
          borderRadius:12, padding:4,
          border:'1px solid var(--border)',
        }}>
          {[['login','LOGIN'],['register','REGISTER']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex:1, padding:'0.75rem',
                borderRadius:9, border:'none',
                background: mode===m
                  ? 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(255,0,128,0.12))'
                  : 'transparent',
                color: mode===m ? 'var(--text-1)' : 'var(--text-3)',
                fontWeight:600, fontSize:'0.82rem',
                fontFamily:'var(--mono)', cursor:'pointer',
                transition:'all 0.28s ease',
                boxShadow: mode===m ? '0 0 16px var(--glow-c)' : 'none',
                outline: mode===m ? '1px solid rgba(0,240,255,0.28)' : 'none',
                letterSpacing:'0.06em',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* タイトル */}
        <div style={{ marginBottom:'1.8rem' }}>
          <h2 style={{ fontSize:'1.7rem', fontWeight:300, letterSpacing:'-0.03em', marginBottom:'0.4rem' }}>
            {mode === 'login'
              ? <>Welcome <span className="grad-cm">Back</span></>
              : <>Get <span className="grad-cm">Started</span></>
            }
          </h2>
          <p style={{ color:'var(--text-3)', fontSize:'0.8rem', fontFamily:'var(--mono)', letterSpacing:'0.03em' }}>
            {mode === 'login' ? 'Enter your registered email address' : 'Enter your email to create account'}
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'1.4rem' }}>
            <label style={{
              display:'block', fontSize:'0.65rem', fontFamily:'var(--mono)',
              color:'var(--cyan)', letterSpacing:'0.12em',
              marginBottom:'0.65rem', textTransform:'uppercase',
            }}>
              EMAIL ADDRESS
            </label>
            <input
              className="input"
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required disabled={loading}
            />
          </div>

          {error && (
            <div className="err-box" style={{ marginBottom:'1.4rem' }}>
              <p style={{ color:'#ff6eb0', fontSize:'0.82rem', fontFamily:'var(--mono)' }}>⚠ {error}</p>
            </div>
          )}

          <button
            className="btn btn-primary" type="submit"
            disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.6rem', fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--mono)' }}>
          {mode === 'register' ? (
            'By registering, you agree to our Terms of Service'
          ) : (
            <>No account?{' '}
              <button onClick={() => setMode('register')} style={{
                background:'none', border:'none', color:'var(--cyan)',
                cursor:'pointer', fontFamily:'var(--mono)', fontSize:'0.72rem',
                textDecoration:'underline',
              }}>
                Register here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}