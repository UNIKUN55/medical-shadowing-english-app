import { useState } from 'react';
import { TTSService, STTService } from '../utils/speech';
import { bookmarksApi } from '../services/api';

const tts = new TTSService();
const stt = new STTService();

/**
 * 単語詳細モーダル
 */
export function WordDetailModal({ bookmark, isOpen, onClose, onDeleted }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !bookmark) return null;

  const handlePlayWord = async () => {
    try {
      setError('');
      await tts.speak(bookmark.word);
    } catch (err) {
      setError('音声再生エラー: ' + err.message);
    }
  };

  const handleStartRecording = async () => {
    try {
      setError('');
      setIsRecording(true);
      setRecognizedText('');
      
      const transcript = await stt.start();
      setRecognizedText(transcript);
    } catch (err) {
      setError('音声認識エラー: ' + err.message);
    } finally {
      setIsRecording(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このブックマークを削除しますか？')) {
      return;
    }

    try {
      await bookmarksApi.delete(bookmark.id);
      onDeleted(bookmark.id);
      onClose();
    } catch (err) {
      setError('削除に失敗しました: ' + err.message);
    }
  };

  // 例文内の単語をハイライト
  const highlightWord = (sentence, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const parts = sentence.split(regex);
    const matches = sentence.match(regex) || [];

    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {matches[index] && (
          <span className="bg-yellow-200 font-bold">
            {matches[index]}
          </span>
        )}
      </span>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {bookmark.word}
              </h2>
              <span className="text-sm text-gray-500">
                {bookmark.wordType === 'phrase' ? '熟語' : '単語'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* 意味 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">【意味】</h3>
            <p className="text-xl text-gray-800">{bookmark.meaning}</p>
          </div>

          {/* 例文 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">【例文】</h3>
            <p className="text-lg text-gray-800 leading-relaxed">
              {highlightWord(bookmark.exampleSentence, bookmark.word)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              シナリオ: {bookmark.scenarioTitle}
            </p>
          </div>

          {/* 音声再生セクション */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">【発音練習】</h3>
            <button
              onClick={handlePlayWord}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-3"
            >
              🔊 再生
            </button>
          </div>

          {/* 録音セクション */}
          <div className="mb-6 bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">【録音練習】</h3>
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRecording ? '🎤 録音中...' : '🎤 録音'}
            </button>

            {recognizedText && (
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1">認識結果:</p>
                <p className="text-lg font-medium">{recognizedText}</p>
              </div>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex space-x-4">
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              ★ ブックマーク解除
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}