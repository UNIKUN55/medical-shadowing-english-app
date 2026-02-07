const TOKEN_KEY = 'authToken';

/**
 * LocalStorageでJWTトークンを管理
 */
export const tokenStorage = {
  /**
   * トークンを取得
   */
  get: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * トークンを保存
   */
  set: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * トークンを削除
   */
  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * トークンが存在するか確認
   */
  exists: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};