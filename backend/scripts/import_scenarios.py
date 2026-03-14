import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# Excelファイル読み込み
excel_path = r"C:\Users\tatsu\Downloads\medical_english_words_phrases.xlsx"
df = pd.read_excel(excel_path)

# データベース接続
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="medical_english",
    user="user",
    password="password"
)
cur = conn.cursor()

# シーン名とcategory_idのマッピング
scene_mapping = {
    "Scene 1: 病棟回診時": 1,
    "Scene 2: ERでの問診": 2,
    "Scene 3: 内科病棟での問診": 3,
    "Scene 4: 外科オペ中": 4,
    "Scene 5: 呼吸器系疾患": 5,
    "Scene 6: 血液疾患": 6,
    "Scene 7: 心臓血管系": 7,
    "Scene 8: 内分泌疾患": 8,
    "Scene 9: 脳神経内科・外科": 9,
    "Scene 10: 腎臓泌尿器系疾患": 10,
    "Scene 11: 小児科": 11,
    "Scene 12: ICU": 12,
    "Scene 13: 整形外科系疾患": 13,
    "Scene 14: 消化器系疾患": 14,
}

# 既存のダミーデータを削除
cur.execute("DELETE FROM scenarios WHERE id IN (1, 2, 3, 4)")
conn.commit()

# シナリオデータ投入
scenarios_data = []
for _, row in df.iterrows():
    scene = row['シチュエーション']
    category_id = scene_mapping.get(scene)
    
    if category_id and pd.notna(row['元の英文']) and pd.notna(row['元の日本語訳']):
        # titleは英文の最初の50文字（または全文）
        title = row['元の英文'][:50] if len(row['元の英文']) > 50 else row['元の英文']
        
        scenarios_data.append((
            title,
            row['元の英文'],
            row['元の日本語訳'],
            category_id
        ))

# 重複削除（同じ英文は1回のみ投入）
scenarios_data = list(set(scenarios_data))

print(f"投入するシナリオ数: {len(scenarios_data)}")

# バッチ投入
execute_values(
    cur,
    "INSERT INTO scenarios (title, sentence_en, sentence_ja, category_id) VALUES %s",
    scenarios_data
)

conn.commit()
print("✅ データ投入完了")

cur.close()
conn.close()