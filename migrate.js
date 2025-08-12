require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

// Load your JSON data
const songsData = JSON.parse(fs.readFileSync('./public/data/songs.json'));

// Connect to Neon
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    for (const song of songsData) {
      // Insert song metadata
      const songResult = await client.query(
        'INSERT INTO songs (name, author, category) VALUES ($1, $2, $3) RETURNING id',
        [song.name, song.author, song.category]
      );
      const songId = songResult.rows[0].id;

      // Insert lyrics
      song.lyrics.forEach((line, lineIndex) => {
        line.forEach(async (entry, wordIndex) => {
          await client.query(
            'INSERT INTO lyrics (song_id, line_index, word_index, word, chords) VALUES ($1, $2, $3, $4, $5)',
            [songId, lineIndex, wordIndex, entry.word, entry.chords]
          );
        });
      });
    }

    await client.query('COMMIT'); // Commit transaction
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Փոխադրումը խափանուել է՝', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();