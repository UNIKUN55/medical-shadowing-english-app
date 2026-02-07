import { useState, useEffect } from 'react';
import { bookmarksApi } from '../services/api';
import { TTSService } from '../utils/speech';

const tts = new TTSService();

/**
 * 単語リスト画面
 */
export function WordListPage({ onSelectWord }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookmarksApi.getAll();
      setBookmarks(data.bookmarks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayWord = async (word, e) => {
    e.stopPropagation();
    try {
      await tts.speak(word);
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId, e) => {
    e.stopPropagation();
    
    if (!confirm('このブックマークを削除しますか？')) {
      return;
    }

    try {
      await bookmarksApi.delete(bookmarkId);
      // リストから削除
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      alert('削除に失敗しました: ' + err.message);
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
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">エラーが発生しました: {error}</p>
          <button
            onClick={loadBookmarks}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">あなたの単語リスト</h2>
        <p className="text-gray-600">
          {bookmarks.length}個の単語・熟語
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            ブックマークがありません
          </h3>
          <p className="text-gray-600">
            シャドウイング画面で単語をブックマークすると、ここに表示されます
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  単語・熟語
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  意味
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  シナリオ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookmarks.map((bookmark) => (
                <tr
                  key={bookmark.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectWord(bookmark)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {bookmark.word}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({bookmark.wordType === 'phrase' ? '熟語' : '単語'})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{bookmark.meaning}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {bookmark.scenarioTitle}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={(e) => handlePlayWord(bookmark.word, e)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      title="再生"
                    >
                      🔊
                    </button>
                    <button
                      onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}