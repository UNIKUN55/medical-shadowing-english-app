import { useState, useEffect } from 'react';
import { scenariosApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * フッターコンポーネント
 */
function Footer() {
  return (
     <footer className="mt-12 py-6 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
        <p className="mb-2">
          <strong>対応ブラウザ:</strong> Google Chrome / Microsoft Edge / Safari /ぽんころブラウザ
        </p>
        <p className="text-xs text-gray-500">
          本アプリはWeb Speech APIを使用しています。
        </p>
      </div>
    </footer>
  );
}

/**
 * ホーム画面（シナリオ一覧）
 */
export function HomePage({ onSelectScenario }) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scenariosApi.getAll();
      setScenarios(data.scenarios);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">エラーが発生しました: {error}</p>
          <button
            onClick={loadScenarios}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">シナリオ一覧</h2>
          <p className="text-gray-600">挑戦したいシナリオを選択してください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectScenario(scenario.id)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{scenario.title}</h3>
                  {scenario.attempted && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      挑戦済み
                    </span>
                  )}
                </div>

                {scenario.bestScore !== null && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">ベストスコア</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {scenario.bestScore}点
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${scenario.bestScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {!scenario.attempted && (
                  <div className="text-center py-4">
                    <span className="text-gray-400 text-sm">未挑戦</span>
                  </div>
                )}

                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScenario(scenario.id);
                  }}
                >
                  挑戦する
                </button>
              </div>
            </div>
          ))}
        </div>

        {scenarios.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">シナリオがありません</p>
          </div>
        )}
      </div>

      {/* フッター */}
      <Footer />
    </div>
  );
}