import { useState, useEffect } from 'react';
import { scenariosApi } from '../services/api';

const CategoryPage = ({ categoryId, onSelectScenario, onBack }) => {
  const [category, setCategory] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // カテゴリ情報取得
        const categoriesData = await scenariosApi.getCategories();
        const currentCategory = categoriesData.categories.find(c => c.id === categoryId);
        setCategory(currentCategory);

        // シナリオ一覧取得
        const scenariosData = await scenariosApi.getByCategory(categoryId);
        setScenarios(scenariosData.scenarios);
      } catch (err) {
        console.error('Load error:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryId]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--magenta)' }}>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(0,240,255,0.2)',
          borderTopColor: 'var(--cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 戻るボタン */}
        <button
          onClick={onBack}
          style={{
            marginBottom: '2rem',
            padding: '0.8rem 1.5rem',
            background: 'rgba(0,240,255,0.05)',
            border: '1px solid rgba(0,240,255,0.2)',
            borderRadius: 10,
            color: 'var(--t2)',
            fontSize: '0.9rem',
            fontFamily: 'var(--mono)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--cyan)';
            e.currentTarget.style.color = 'var(--t1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)';
            e.currentTarget.style.color = 'var(--t2)';
          }}
        >
          <span>←</span>
          <span>シーン選択に戻る</span>
        </button>

        {/* ヘッダー */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.7rem',
            color: 'var(--t3)',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
          }}>
            SCENE {category?.displayOrder}
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--cyan) 0%, #fff 50%, var(--magenta) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {category?.nameJa}
          </h1>
          <p style={{
            color: 'var(--t3)',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          }}>
            {scenarios.length} SCENARIOS AVAILABLE
          </p>
        </div>

        {/* シナリオ一覧 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              style={{
                padding: '1.2rem',
                background: 'rgba(0,240,255,0.05)',
                border: '1px solid rgba(0,240,255,0.2)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 20px var(--glow-c)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'var(--t1)',
                marginBottom: '0.8rem',
                lineHeight: 1.4,
              }}>
                {scenario.title}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontFamily: 'var(--mono)',
                fontSize: '0.7rem',
                color: 'var(--t3)',
              }}>
                {scenario.attempted && (
                  <span style={{ color: 'var(--cyan)' }}>
                    ✓ COMPLETED
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;