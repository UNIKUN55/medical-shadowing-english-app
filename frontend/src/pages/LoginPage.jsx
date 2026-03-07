import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authApi } from '../services/api';
import { tokenStorage } from '../utils/tokenStorage';

const LoginPage = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const idToken = await result.user.getIdToken();
      const response = await authApi.googleLogin(idToken);
      
      if (response.success) {
        const { userId, email, displayName, photoUrl, token } = response.data;
        tokenStorage.set(token);
        onLoginSuccess({ id: userId, email, displayName, photoUrl, token });
      } else {
        setError(response.error?.message || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 560,
        animation: 'fadeUp 0.6s ease both',
      }}>
        {/* ステータスバッジ */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.68rem',
          fontFamily: 'var(--mono)',
          color: 'var(--cyan)',
          background: 'rgba(0,240,255,0.07)',
          border: '1px solid rgba(0,240,255,0.18)',
          padding: '0.38rem 1rem',
          borderRadius: 20,
          marginBottom: '2rem',
          letterSpacing: '0.1em',
        }}>
          <span style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--cyan)',
            display: 'inline-block',
            boxShadow: '0 0 6px var(--cyan)',
            animation: 'glowPulse 2.5s ease-in-out infinite',
          }} />
          MEDICAL LEARNING PLATFORM
        </div>

        {/* タイトル */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 7vw, 4.8rem)',
          fontWeight: 300,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: '1.4rem',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--cyan) 0%, #fff 55%, var(--magenta) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Medical English
          </span>
          <br />
          <span style={{ color: 'var(--t2)', fontWeight: 200 }}>Shadowing</span>
        </h1>

        {/* サブタイトル */}
        <p style={{
          color: 'var(--t3)',
          fontFamily: 'var(--mono)',
          fontSize: 'clamp(0.72rem, 2vw, 0.88rem)',
          letterSpacing: '0.06em',
          marginBottom: '3rem',
        }}>
          AI-POWERED PRONUNCIATION TRAINING
        </p>

        {/* エラーメッセージ */}
        {error && (
          <div style={{
            background: 'rgba(255,0,128,0.08)',
            border: '1px solid rgba(255,0,128,0.3)',
            color: 'var(--magenta)',
            padding: '0.8rem 1.2rem',
            borderRadius: 10,
            marginBottom: '1.5rem',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.02em',
          }}>
            {error}
          </div>
        )}

        {/* Googleログインボタン */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            maxWidth: 380,
            padding: '1.1rem 2rem',
            background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,0,128,0.1))',
            border: '1px solid rgba(0,240,255,0.38)',
            borderRadius: 14,
            color: 'var(--t1)',
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            opacity: loading ? 0.6 : 1,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.boxShadow = '0 0 28px var(--glow-c)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,240,255,0.38)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(0,240,255,0.2)',
                borderTopColor: 'var(--cyan)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                AUTHENTICATING...
              </span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>SIGN IN WITH GOOGLE</span>
            </>
          )}
        </button>

        {/* フッター */}
        <p style={{
          marginTop: '2.5rem',
          color: 'var(--t3)',
          fontFamily: 'var(--mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
        }}>
          SECURE AUTHENTICATION • PRIVACY PROTECTED
        </p>
      </div>
    </div>
  );
};

export default LoginPage;