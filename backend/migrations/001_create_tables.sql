-- ユーザーテーブル
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- シナリオテーブル
CREATE TABLE scenarios (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  sentence_en TEXT NOT NULL,
  sentence_ja TEXT NOT NULL,
  difficulty_level INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 単語マスタテーブル
CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  word_type VARCHAR(20) NOT NULL,
  meaning VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- シナリオ・単語紐付けテーブル
CREATE TABLE scenario_words (
  id SERIAL PRIMARY KEY,
  scenario_id INT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(scenario_id, word_id, position)
);

-- 進捗テーブル
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id INT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  best_score INT NOT NULL CHECK (best_score >= 0 AND best_score <= 100),
  attempt_count INT DEFAULT 1,
  last_attempted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, scenario_id)
);

-- ブックマークテーブル
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  scenario_id INT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- インデックス作成
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_scenario_id ON progress(scenario_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_scenario_words_scenario_id ON scenario_words(scenario_id);