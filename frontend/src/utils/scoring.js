/**
 * 文字列を単語に分割（小文字化・記号除去）
 */
function normalizeAndSplit(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, '') // 記号を除去
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * 2つのテキストを比較してスコアを計算
 * @param {string} correctText - 正解文
 * @param {string} userText - ユーザーの発音文
 * @returns {object} { score, correctWords, userWords, matches }
 */
export function calculateScore(correctText, userText) {
  const correctWords = normalizeAndSplit(correctText);
  const userWords = normalizeAndSplit(userText);

  // 単語マッチングカウント
  let matchCount = 0;
  const matches = new Array(userWords.length).fill(false);

  // 簡易マッチング：正解文の各単語がユーザー発音に含まれているかチェック
  for (let i = 0; i < correctWords.length; i++) {
    const correctWord = correctWords[i];
    const userIndex = userWords.indexOf(correctWord);
    
    if (userIndex !== -1 && !matches[userIndex]) {
      matchCount++;
      matches[userIndex] = true;
    }
  }

  // スコア計算（正解単語数 / 総単語数 × 100）
  const score = Math.round((matchCount / correctWords.length) * 100);

  return {
    score,
    correctWords,
    userWords,
    matchCount,
    totalWords: correctWords.length
  };
}

/**
 * Diff情報を生成（どの単語が正しいか、間違っているか）
 * @param {string} correctText - 正解文
 * @param {string} userText - ユーザーの発音文
 * @returns {Array} Diff情報の配列
 */
export function generateDiff(correctText, userText) {
  const correctWords = normalizeAndSplit(correctText);
  const userWords = normalizeAndSplit(userText);

  const diff = [];

  for (let i = 0; i < userWords.length; i++) {
    const userWord = userWords[i];
    const isCorrect = correctWords.includes(userWord);

    diff.push({
      word: userWord,
      isCorrect,
      isExtra: !isCorrect // 余分な単語
    });
  }

  // 足りない単語を検出
  const missingWords = correctWords.filter(word => !userWords.includes(word));

  return {
    userDiff: diff,
    missingWords
  };
}