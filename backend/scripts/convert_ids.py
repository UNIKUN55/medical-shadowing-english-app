with open('scripts/update_titles.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 6-424 → 425-843 に変換（+419）
import re
def replace_id(match):
    old_id = int(match.group(1))
    new_id = old_id + 419
    return f'WHERE id = {new_id};'

new_content = re.sub(r'WHERE id = (\d+);', replace_id, content)

with open('scripts/update_titles_production.sql', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ 変換完了")