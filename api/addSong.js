import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

    if (!songTitle || !artist || !lyrics) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // GitHub repository details
    const owner = 'SyuneHovan'; // Your GitHub username
    const repo = 'mari-chords';  // Your GitHub repository name
    const path = 'src/data/songs.json';   // Path to your songs.json file in the repository
    const token = process.env.GITHUB_TOKEN; // GitHub token for authentication

    // Fetch the current content of songs.json from GitHub
    const getFileResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!getFileResponse.ok) {
      return res.status(500).json({ error: "Error fetching songs.json from GitHub" });
    }

    const getFileData = await getFileResponse.json();
    const sha = getFileData.sha; // SHA of the current file is required to update it

    // Parse the existing songs data
    let songs = [];
    try {
      songs = JSON.parse(Buffer.from(getFileData.content, 'base64').toString('utf8'));
    } catch (error) {
      return res.status(500).json({ error: "Failed to parse songs.json" });
    }

    // Add the new song to the list
    const newSong = {
      name: songTitle,
      author: artist,
      category,
      lyrics,
    };

    songs.push(newSong);

    // Update the songs.json file in GitHub
    const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: 'Add new song to songs.json',
        content: Buffer.from(JSON.stringify(songs, null, 2)).toString('base64'),
        sha,
      }),
    });

    if (!updateResponse.ok) {
      return res.status(500).json({ error: "Error updating songs.json on GitHub" });
    }

    const updateData = await updateResponse.json();
    return res.status(200).json({ message: "Song added successfully!", updateData });
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
