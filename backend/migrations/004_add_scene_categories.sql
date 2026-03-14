-- シーンカテゴリテーブル作成
CREATE TABLE IF NOT EXISTS scene_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ja VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- scenariosテーブルにcategory_id追加
ALTER TABLE scenarios 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES scene_categories(id);

-- 14シーンのデータ投入
INSERT INTO scene_categories (name_en, name_ja, description, display_order) VALUES
('Ward Rounds', '病棟回診時', '病棟での患者回診時の会話', 1),
('ER Interview', 'ERでの問診', '救急外来での初期問診', 2),
('Medical Ward Interview', '内科病棟での問診', '内科病棟での患者問診', 3),
('Surgery', '外科オペ中', '手術室での手術中の会話', 4),
('Respiratory', '呼吸器系疾患', '呼吸器疾患の診療', 5),
('Hematology', '血液疾患', '血液疾患の診療', 6),
('Cardiovascular', '心臓血管系', '循環器疾患の診療', 7),
('Endocrine', '内分泌疾患', '内分泌疾患の診療', 8),
('Neurology', '脳神経内科・外科', '神経疾患の診療', 9),
('Nephrology/Urology', '腎臓泌尿器系疾患', '腎臓・泌尿器疾患の診療', 10),
('Pediatrics', '小児科', '小児科での診療', 11),
('ICU', 'ICU', '集中治療室での管理', 12),
('Orthopedics', '整形外科系疾患', '整形外科疾患の診療', 13),
('Gastroenterology', '消化器系疾患', '消化器疾患の診療', 14);