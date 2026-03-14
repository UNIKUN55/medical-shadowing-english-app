import { useState, useEffect } from 'react';
import { scenariosApi } from '../services/api';

const HomePage = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // カテゴリ一覧読み込み
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await scenariosApi.getCategories();
        setCategories(data.categories);
      } catch (err) {
        console.error('Categories load error:', err);
        setError('カテゴリの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleCategorySelect = (categoryId) => {
    onSelectCategory(categoryId);
  };

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
        {/* ヘッダー */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--cyan) 0%, #fff 50%, var(--magenta) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Medical Scenarios
          </h1>
          <p style={{
            color: 'var(--t3)',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
          }}>
            SELECT SCENE CATEGORY
          </p>
        </div>

        {/* カテゴリ選択 */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                style={{
                  padding: '1rem',
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
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.65rem',
                  color: 'var(--t3)',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem',
                }}>
                  SCENE {category.displayOrder}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--t1)',
                  marginBottom: '0.5rem',
                }}>
                  {category.nameJa}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.7rem',
                  color: 'var(--cyan)',
                }}>
                  {category.scenarioCount} scenarios
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;