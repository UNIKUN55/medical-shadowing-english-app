import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * APIエラークラス
 */
class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * APIサービスクラス
 */
class ApiService {
  /**
   * 共通リクエスト処理
   */
  async request(endpoint, options = {}) {
    const token = tokenStorage.get();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // トークンがあれば自動付与
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || 'エラーが発生しました',
          response.status
        );
      }

      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // ネットワークエラーなど
      throw new ApiError(
        'NETWORK_ERROR',
        'ネットワークエラーが発生しました',
        0
      );
    }
  }

  /**
   * GETリクエスト
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POSTリクエスト
   */
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUTリクエスト
   */
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETEリクエスト
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();