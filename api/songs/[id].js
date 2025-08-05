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

  const { id } = req.query;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid song ID is required' });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    try {
      // Fetch song details
      const songResult = await client.query('SELECT id, name, author, category FROM songs WHERE id = $1', [id]);
      if (songResult.rowCount === 0) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Fetch lyrics
      const lyricsResult = await client.query(
        'SELECT line_index, word_index, word, chords FROM lyrics WHERE song_id = $1 ORDER BY line_index, word_index',
        [id]
      );

      // Format lyrics into array of arrays
      const lyrics = [];
      let currentLine = [];
      let lastLineIndex = -1;

      for (const row of lyricsResult.rows) {
        if (row.line_index !== lastLineIndex) {
          if (currentLine.length > 0) {
            lyrics.push(currentLine);
          }
          currentLine = [];
          lastLineIndex = row.line_index;
        }
        currentLine.push({ word: row.word || '', chords: row.chords || [] });
      }
      if (currentLine.length > 0) {
        lyrics.push(currentLine);
      }

      const song = {
        id: songResult.rows[0].id,
        name: songResult.rows[0].name,
        author: songResult.rows[0].author,
        category: songResult.rows[0].category,
        lyrics,
      };

      return res.status(200).json(song);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ error: 'An error occurred while fetching the song' });
  } finally {
    await pool.end();
  }
}