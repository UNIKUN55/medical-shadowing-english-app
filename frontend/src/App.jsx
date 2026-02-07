import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RegisterModal } from './components/RegisterModal';
import { HomePage } from './pages/HomePage';
import { ShadowingPage } from './pages/ShadowingPage';

/**
 * メインアプリコンポーネント（認証後）
 */
function MainApp() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home'); // home, shadowing
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  const handleSelectScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setCurrentPage('shadowing');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedScenarioId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー（ホーム画面のみ表示） */}
      {currentPage === 'home' && (
        <div className="bg-blue-600 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
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
        </div>
      )}

      {/* ページコンテンツ */}
      {currentPage === 'home' && (
        <HomePage onSelectScenario={handleSelectScenario} />
      )}

      {currentPage === 'shadowing' && selectedScenarioId && (
        <ShadowingPage 
          scenarioId={selectedScenarioId} 
          onBack={handleBackToHome}
        />
      )}
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