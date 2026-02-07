import { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { api } from '../services/api';

const AuthContext = createContext();

/**
 * 認証コンテキストプロバイダー
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初期化：LocalStorageからトークンを読み込み
  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      // トークンがあればユーザー情報をセット
      // 実際のアプリではトークンをデコードしてユーザー情報を取得
      setUser({ token });
    }
    setLoading(false);
  }, []);

  /**
   * ユーザー登録
   */
  const register = async (email) => {
    try {
      const data = await api.post('/api/auth/register', { email });
      
      // トークンを保存
      tokenStorage.set(data.token);
      
      // ユーザー情報をセット
      setUser({
        userId: data.userId,
        email: data.email,
        token: data.token
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  };

  /**
   * ログアウト
   */
  const logout = () => {
    tokenStorage.remove();
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};