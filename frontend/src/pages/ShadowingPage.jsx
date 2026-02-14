import { useState, useEffect } from 'react';
import { scenariosApi, progressApi, bookmarksApi } from '../services/api';
import { TTSService, STTService } from '../utils/speech';
import { calculateScore, generateDiff } from '../utils/scoring';

const tts = new TTSService();
const stt = new STTService();

/**
 * シャドウイング画面
 */
export function ShadowingPage({ scenarioId, onBack }) {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('initial'); // initial, playing, waiting, recording, evaluating, result
  const [showEnglish, setShowEnglish] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [error, setError] = useState(null);
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());

  useEffect(() => {
    loadScenario();
  }, [scenarioId]);

  const loadScenario = async () => {
    try {
      setLoading(true);
      const data = await scenariosApi.getById(scenarioId);
      setScenario(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    try {
      setPhase('playing');
      await tts.speak(scenario.sentenceEn);
      setPhase('waiting');
    } catch (err) {
      setError('音声再生エラー: ' + err.message);
      setPhase('initial');
    }
  };

  const handleStartRecording = async () => {
    try {
      setPhase('recording');
      setRecognizedText('');
      const transcript = await stt.start();
      setRecognizedText(transcript);
      setPhase('evaluating');
      
      // 採点
      const result = calculateScore(scenario.sentenceEn, transcript);
      setScoreData(result);
      
      // 進捗保存
      await progressApi.save(scenarioId, result.score);
      
      setPhase('result');
    } catch (err) {
      setError('音声認識エラー: ' + err.message);
      setPhase('waiting');
    }
  };

  const handleStopRecording = () => {
    stt.stop();
  };

  const handleRetry = () => {
    setPhase('initial');
    setRecognizedText('');
    setScoreData(null);
    setError(null);
  };

  const handleBookmarkWord = async (wordId) => {
    try {
      if (bookmarkedWords.has(wordId)) {
        alert('既にブックマークされています');
        return;
      }

      await bookmarksApi.add(wordId, scenarioId);
      setBookmarkedWords(new Set([...bookmarkedWords, wordId]));
      alert('ブックマークに追加しました');
    } catch (err) {
      if (err.code === 'ALREADY_BOOKMARKED') {
        setBookmarkedWords(new Set([...bookmarkedWords, wordId]));
      }
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          <p className="text-red-600">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            ← 戻る
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {scenario.title}
          </h1>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 初期状態・再生前 */}
        {phase === 'initial' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">シナリオ: {scenario.title}</h2>
            
            <div className="mb-6">
              <label className="flex items-center justify-center space-x-2">
                <input
                  type="checkbox"
                  checked={showEnglish}
                  onChange={(e) => setShowEnglish(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">英文を表示</span>
              </label>
            </div>

            {showEnglish && (
              <p className="text-xl text-gray-800 mb-8 font-medium">
                {scenario.sentenceEn}
              </p>
            )}

            <button
              onClick={handlePlay}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🔊 再生
            </button>

            <p className="text-gray-500 text-sm mt-4">
              再生ボタンを押して音声を聞いてください
            </p>
          </div>
        )}

        {/* 再生中 */}
        {phase === 'playing' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-pulse">
              <div className="text-6xl mb-4">🔊</div>
              <p className="text-xl text-gray-800 font-medium">再生中...</p>
            </div>
          </div>
        )}

        {/* 録音待機 */}
        {phase === 'waiting' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-2xl font-bold mb-6">録音開始</h3>
            
            {showEnglish && (
              <p className="text-xl text-gray-800 mb-8 font-medium">
                {scenario.sentenceEn}
              </p>
            )}

            <button
              onClick={handleStartRecording}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              🎤 録音開始
            </button>

            <p className="text-gray-500 text-sm mt-4">
              マイクボタンを押して発音してください
            </p>
          </div>
        )}

        {/* 録音中（改善版） */}
        {phase === 'recording' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <button
              onClick={handleStopRecording}
              className="relative bg-red-600 text-white px-12 py-6 rounded-full text-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
              {/* パルスアニメーション */}
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></span>
              
              {/* ボタンテキスト */}
              <span className="relative flex flex-col items-center">
                <span className="text-2xl mb-1">🎤 録音中...</span>
                <span className="text-sm font-normal">(クリックで停止)</span>
              </span>
            </button>
            <p className="text-gray-600 mt-4">マイクに向かって発音してください</p>
          </div>
        )}

        {/* 評価中 */}
        {phase === 'evaluating' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">評価中...</p>
          </div>
        )}

        {/* 結果表示 */}
        {phase === 'result' && scoreData && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* スコア表示 */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {scoreData.score}点
              </div>
              <p className="text-gray-600">
                {scoreData.matchCount} / {scoreData.totalWords} 単語正解
              </p>
            </div>

            {/* 正解文 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">【正解文】</h3>
              <p className="text-gray-800 text-lg">{scenario.sentenceEn}</p>
            </div>

            {/* 発音文 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">【あなたの発音】</h3>
              <p className="text-gray-800 text-lg">{recognizedText}</p>
            </div>

            {/* 日本語訳 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">【日本語訳】</h3>
              <p className="text-gray-600">{scenario.sentenceJa}</p>
            </div>

            {/* 単語リスト */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">【単語・熟語の訳】</h3>
              <div className="space-y-2">
                {scenario.words.map((word) => (
                  <div 
                    key={word.id} 
                    className="flex justify-between items-center bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-gray-600 ml-4">{word.meaning}</span>
                    </div>
                    <button
                      onClick={() => handleBookmarkWord(word.id)}
                      className={`ml-4 px-3 py-1 rounded transition-colors ${
                        bookmarkedWords.has(word.id)
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-yellow-400 hover:text-white'
                      }`}
                      title="ブックマーク"
                    >
                      ★
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-4">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                もう一度挑戦
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}