import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authApi } from '../services/api';

export function LoginPage({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // IDトークンを取得
      const idToken = await user.getIdToken();
      
      // バックエンドにトークンを送信してユーザー登録/ログイン
      const response = await authApi.googleLogin(idToken);
      
      // ローカルストレージにトークンを保存
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      onLoginSuccess(response.user);
    } catch (err) {
      console.error('Google login error:', err);
      setError('ログインに失敗しました。もう一度お試しください。');
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
      background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f2e 100%)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 450,
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        borderRadius: 24,
        padding: '3rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          fontWeight: 700,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #00f0ff, #ff0080)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Medical English
        </h1>
        
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '3rem',
        }}>
          医療英語シャドウイング学習アプリ
        </p>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            background: 'rgba(255,0,128,0.1)',
            border: '1px solid rgba(255,0,128,0.3)',
            borderRadius: 12,
            color: '#ff6eb0',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.2rem',
            background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: 12,
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1a1f2e',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            transition: 'all 0.3s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 20,
                height: 20,
                border: '2px solid rgba(0,0,0,0.1)',
                borderTopColor: '#1a1f2e',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              ログイン中...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleでログイン
            </>
          )}
        </button>

        <p style={{
          marginTop: '2rem',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.6,
        }}>
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}