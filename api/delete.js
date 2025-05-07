import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.body;

  // Validate inputs
  if (!id) {
    console.error('Invalid input: id required');
    return res.status(400).json({ error: 'Song ID is required' });
  }

  try {
    const sql = neon(process.env.POSTGRES_URL);

    // Delete song by id or name
    const query = id
      ? 'DELETE FROM songs WHERE id = $1 RETURNING *'
      : 'DELETE FROM songs WHERE name = $1 RETURNING *';
    const params = [id];

    const result = await sql(query, params);

    if (result.length === 0) {
      console.error('Song not found:', { id });
      return res.status(404).json({ error: 'Song not found' });
    }

    console.log('Deleted song:', result[0]);
    return res.status(200).json({ message: 'Song deleted successfully!' });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ error: 'An error occurred while deleting the song' });
  }
}