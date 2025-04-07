import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

    if (!songTitle || !artist || !lyrics) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const owner = 'SyuneHovan'; // Your GitHub username
    const repo = 'mari-chords';  // Your GitHub repository name
    const path = "src/data/songs.json";

    if (!GITHUB_TOKEN) {
      console.error("Missing GitHub token!");
      return res.status(500).json({ error: "Missing GitHub token" });
    }

    // Step 1: Get current file
    console.log("Fetching songs.json from GitHub...");
    const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    const getData = await getResp.json();
    if (!getResp.ok) {
      console.error("GitHub GET error:", getData);
      return res.status(500).json({ error: "Failed to fetch songs.json", details: getData });
    }

    const sha = getData.sha;
    const songs = JSON.parse(Buffer.from(getData.content, "base64").toString("utf-8"));

    // Step 2: Add new song
    const newSong = { name: songTitle, author: artist, category, lyrics };
    songs.push(newSong);

    // Step 3: Update on GitHub
    const contentEncoded = Buffer.from(JSON.stringify(songs, null, 2)).toString("base64");

    console.log("Updating songs.json on GitHub...");
    const updateResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: `Add song: ${songTitle}`,
        content: contentEncoded,
        sha
      })
    });

    const updateData = await updateResp.json();
    if (!updateResp.ok) {
      console.error("GitHub PUT error:", updateData);
      return res.status(500).json({ error: "Failed to update songs.json", details: updateData });
    }

    return res.status(200).json({
      message: "Song added and GitHub updated!",
      commitUrl: updateData.commit?.html_url,
      updatedCount: songs.length
    });

  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Unhandled server error", message: err.message });
  }
}
