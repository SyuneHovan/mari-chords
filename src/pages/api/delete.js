import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { songName } = req.body;

  // Validate input
  if (!songName) {
    console.error('Invalid song name:', songName);
    return res.status(400).json({ error: 'Song name is required' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mari-shords');
    const collection = db.collection('songs');

    // Delete the song
    const result = await collection.deleteOne({ name: songName });
    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    return res.status(200).json({ message: 'Song deleted successfully!' });
  } catch (error) {
    console.error('Error deleting song from MongoDB:', error.message);
    return res.status(500).json({ error: 'An error occurred while deleting the song' });
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}