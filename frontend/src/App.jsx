import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RegisterModal } from './components/RegisterModal';
import { HomePage } from './pages/HomePage';
import { ShadowingPage } from './pages/ShadowingPage';
import { WordListPage } from './pages/WordListPage';
import { WordDetailModal } from './components/WordDetailModal';

/**
 * メインアプリコンポーネント（認証後）
 */
function MainApp() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home'); // home, shadowing, wordlist
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWordModal, setShowWordModal] = useState(false);

  const handleSelectScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setCurrentPage('shadowing');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedScenarioId(null);
  };

  const handleSelectWord = (bookmark) => {
    setSelectedWord(bookmark);
    setShowWordModal(true);
  };

  const handleWordDeleted = (bookmarkId) => {
    // 単語リストページをリロード（簡易実装）
    setShowWordModal(false);
    setCurrentPage('wordlist');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      {currentPage !== 'shadowing' && (
        <div className="bg-blue-600 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold">Medical English Shadowing</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="flex space-x-1 border-b border-blue-700">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-6 py-3 font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-white text-blue-600 rounded-t-lg'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700'
                }`}
              >
                シナリオ一覧
              </button>
              <button
                onClick={() => setCurrentPage('wordlist')}
                className={`px-6 py-3 font-medium transition-colors ${
                  currentPage === 'wordlist'
                    ? 'bg-white text-blue-600 rounded-t-lg'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700'
                }`}
              >
                単語リスト
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ページコンテンツ */}
      {currentPage === 'home' && (
        <HomePage onSelectScenario={handleSelectScenario} />
      )}

      {currentPage === 'wordlist' && (
        <WordListPage onSelectWord={handleSelectWord} />
      )}

      {currentPage === 'shadowing' && selectedScenarioId && (
        <ShadowingPage 
          scenarioId={selectedScenarioId} 
          onBack={handleBackToHome}
        />
      )}

      {/* 単語詳細モーダル */}
      <WordDetailModal
        bookmark={selectedWord}
        isOpen={showWordModal}
        onClose={() => setShowWordModal(false)}
        onDeleted={handleWordDeleted}
      />
    </div>
  );
}

/**
 * アプリケーションルート
 */
function AppContent() {
  const { user, loading } = useAuth();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowRegisterModal(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
              Medical English Shadowing
            </h1>
            <p className="text-gray-600">
              ログインしてください
            </p>
          </div>
        </div>
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      </>
    );
  }

  return <MainApp />;
}

/**
 * ルートコンポーネント
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;