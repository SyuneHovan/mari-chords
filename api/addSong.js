import fetch from "node-fetch";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const SONGS_FILE_PATH = process.env.SONGS_FILE_PATH;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

  if (!songTitle || !artist || !lyrics) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${SONGS_FILE_PATH}`;

  try {
    // Get the current file
    const response = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    const fileData = await response.json();

    if (!fileData.content || !fileData.sha) {
      throw new Error("Failed to retrieve songs.json from GitHub");
    }

    const existingSongs = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

    const newSong = {
      name: songTitle,
      author: artist,
      category,
      lyrics,
    };

    const updatedSongs = [...existingSongs, newSong];
    const updatedContent = Buffer.from(JSON.stringify(updatedSongs, null, 2)).toString("base64");

    // Commit new version
    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Add new song: ${songTitle}`,
        content: updatedContent,
        sha: fileData.sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      throw new Error(`Failed to update file: ${err.message}`);
    }

    return res.status(200).json({ message: "Song added successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
