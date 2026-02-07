-- テストユーザー
INSERT INTO users (email) VALUES 
  ('test@example.com'),
  ('demo@example.com');

-- シナリオ
INSERT INTO scenarios (title, sentence_en, sentence_ja) VALUES 
  ('外来受付', 'I spoke to him about his medication side effects.', '彼に薬の副作用について話しました。'),
  ('病棟巡回', 'Please take your blood pressure medication twice daily.', '血圧の薬を1日2回服用してください。'),
  ('手術説明', 'We need to discuss the surgical procedure with you.', '手術の手順についてお話しする必要があります。'),
  ('薬の説明', 'Are you allergic to any medications?', '何か薬にアレルギーはありますか？');

-- 単語（シナリオ1: 外来受付）
INSERT INTO words (word, word_type, meaning) VALUES 
  ('I', 'word', '私'),
  ('spoke to', 'phrase', '～に話しかける'),
  ('him', 'word', '彼に'),
  ('about', 'word', 'について'),
  ('his', 'word', '彼の'),
  ('medication', 'word', '薬'),
  ('side effects', 'phrase', '副作用');

-- シナリオ・単語紐付け（シナリオ1）
INSERT INTO scenario_words (scenario_id, word_id, position) VALUES 
  (1, 1, 0),  -- I
  (1, 2, 1),  -- spoke to
  (1, 3, 3),  -- him
  (1, 4, 4),  -- about
  (1, 5, 5),  -- his
  (1, 6, 6),  -- medication
  (1, 7, 7);  -- side effects

-- 単語（シナリオ2: 病棟巡回）
INSERT INTO words (word, word_type, meaning) VALUES 
  ('please', 'word', 'どうか'),
  ('take', 'word', '服用する'),
  ('your', 'word', 'あなたの'),
  ('blood pressure', 'phrase', '血圧'),
  ('twice', 'word', '2回'),
  ('daily', 'word', '毎日');

-- シナリオ・単語紐付け（シナリオ2）
INSERT INTO scenario_words (scenario_id, word_id, position) VALUES 
  (2, 8, 0),   -- please
  (2, 9, 1),   -- take
  (2, 10, 2),  -- your
  (2, 11, 3),  -- blood pressure
  (2, 6, 5),   -- medication (既存の単語を再利用)
  (2, 12, 6),  -- twice
  (2, 13, 7);  -- daily