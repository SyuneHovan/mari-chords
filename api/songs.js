import { Pool } from 'pg';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'], // Add any other methods you use
});

// Helper function to run middleware in a serverless environment
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) { 
  // First, run the CORS middleware
  await runMiddleware(req, res, cors);

  // --- After this, your original code continues ---
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
      // No need to set headers manually, cors package does it!
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