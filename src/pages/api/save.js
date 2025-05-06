import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { song } = req.body;

  // Validate input
  if (!song || !song.name || !song.author) {
    console.error('Invalid song data:', song);
    return res.status(400).json({ error: 'Song data is incomplete' });
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

    // Upsert the song
    const result = await collection.updateOne(
      { name: song.name, author: song.author },
      { $set: song },
      { upsert: true }
    );
    console.log('Update result:', result);

    return res.status(200).json({ message: 'Song updated successfully!' });
  } catch (error) {
    console.error('Error updating song in MongoDB:', error.message);
    return res.status(500).json({ error: 'An error occurred while updating the song' });
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}