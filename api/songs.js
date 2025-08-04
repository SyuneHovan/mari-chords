import { Pool } from 'pg';

export default async function handler(req, res) { 
  // --- Add this block to allow requests from any origin ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- End of CORS block ---


  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, name, author, category FROM songs ORDER BY name');
      return res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ error: 'An error occurred while fetching songs' });
  } finally {
    await pool.end();
  }
}