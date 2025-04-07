import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { songTitle, artist, lyrics, category = "Unknown" } = req.body;
  if (!songTitle || !artist || !lyrics) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const owner = 'SyuneHovan'; // Your GitHub username
  const repo = 'mari-chords';  // Your GitHub repository name
  const path = 'src/data/songs.json';   // Path to your songs.json file in the repository
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // GitHub token for authentication

  // Step 1: Get the current file content and SHA
  const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  const getData = await getResp.json();
  const sha = getData.sha;
  const songs = JSON.parse(Buffer.from(getData.content, "base64").toString("utf-8"));

  // Step 2: Add the new song
  const newSong = { name: songTitle, author: artist, category, lyrics };
  songs.push(newSong);

  // Step 3: Update the file on GitHub
  const contentEncoded = Buffer.from(JSON.stringify(songs, null, 2)).toString("base64");

  const updateResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    },
    body: JSON.stringify({
      message: "Add song via API",
      content: contentEncoded,
      sha
    })
  });

  const updateData = await updateResp.json();

  return res.status(200).json({
    message: "Song added and GitHub file updated successfully!",
    commitUrl: updateData.commit?.html_url || "No commit URL",
    updatedSongsCount: songs.length
  });
}
