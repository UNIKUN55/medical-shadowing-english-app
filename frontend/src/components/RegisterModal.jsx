import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * ログイン/登録モーダル
 */
export function RegisterModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // login or register
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'login' 
      ? await login(email)
      : await register(email);

    if (result.success) {
      onClose();
      setEmail('');
    } else {
      setError(result.error.message);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {/* タブ切り替え */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 pb-3 font-semibold transition-colors ${
              mode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 pb-3 font-semibold transition-colors ${
              mode === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* ログインモード */}
        {mode === 'login' && (
          <>
            <h2 className="text-2xl font-bold mb-2">おかえりなさい！</h2>
            <p className="text-gray-600 mb-6">
              登録したメールアドレスを入力してください
            </p>
          </>
        )}

        {/* 登録モード */}
        {mode === 'register' && (
          <>
            <h2 className="text-2xl font-bold mb-2">ようこそ！</h2>
            <p className="text-gray-600 mb-6">
              学習を始めるためにメールアドレスを入力してください
            </p>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading 
              ? (mode === 'login' ? 'ログイン中...' : '登録中...')
              : (mode === 'login' ? 'ログイン' : '始める')
            }
          </button>
        </form>

        {mode === 'register' && (
          <p className="text-xs text-gray-500 mt-4 text-center">
            登録することで、利用規約に同意したものとみなされます
          </p>
        )}

        {mode === 'login' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:underline font-medium"
              >
                新規登録
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}