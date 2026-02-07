const { Pool } = require('pg');

// PostgreSQL接続プール作成
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 接続確認
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

/**
 * SQLクエリを実行
 * @param {string} text - SQL文
 * @param {Array} params - パラメータ
 * @returns {Promise} クエリ結果
 */
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};