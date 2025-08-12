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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body.song || req.body;
  const { name, author, category, lyrics } = body;

  if (!name || !lyrics || !Array.isArray(lyrics)) {
    console.error('Invalid input:', { name, lyrics });
    return res.status(400).json({ error: 'Song name and valid lyrics are required' });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingSong = await client.query('SELECT id FROM songs WHERE name = $1', [name]);
      let songId;

      if (existingSong.rows.length > 0) {
        songId = existingSong.rows[0].id;
        await client.query(
          'UPDATE songs SET author = $1, category = $2 WHERE id = $3',
          [author || null, category || null, songId]
        );
        await client.query('DELETE FROM lyrics WHERE song_id = $1', [songId]);
      } else {
        const songResult = await client.query(
          'INSERT INTO songs (name, author, category) VALUES ($1, $2, $3) RETURNING id',
          [name, author || null, category || null]
        );
        songId = songResult.rows[0].id;
      }

      for (let lineIndex = 0; lineIndex < lyrics.length; lineIndex++) {
        const line = lyrics[lineIndex];
        if (!Array.isArray(line)) continue;
        for (let wordIndex = 0; wordIndex < line.length; wordIndex++) {
          const { word, chords } = line[wordIndex];
          await client.query(
            'INSERT INTO lyrics (song_id, line_index, word_index, word, chords) VALUES ($1, $2, $3, $4, $5)',
            [songId, lineIndex, wordIndex, word || '', chords || []]
          );
        }
      }

      await client.query('COMMIT');
      const result = { id: songId, name, author, category, lyrics };
      return res.status(201).json({ message: 'Song saved successfully!', song: result });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ error: 'An error occurred while saving the song' });
  } finally {
    await pool.end();
  }
}