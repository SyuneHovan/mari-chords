import fetch from "node-fetch";

// Get environment variables (make sure these are set in Vercel's Environment Variables)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const SONGS_FILE_PATH = process.env.SONGS_FILE_PATH;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// Set headers for GitHub API requests
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

export default async function handler(req, res) {
  // Log the incoming request for better debugging
  console.log("Received request:", req.body);

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

  // Validate incoming request data
  if (!songTitle || !artist || !lyrics) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // GitHub API URL for the songs.json file
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${SONGS_FILE_PATH}`;

  try {
    // Fetch the current songs.json file from GitHub
    console.log("Fetching existing songs.json from GitHub...");
    const response = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    const fileData = await response.json();

    // Log the file data for debugging
    console.log("GitHub file data:", fileData);

    // Check if the file data is valid
    if (!fileData.content || !fileData.sha) {
      throw new Error("Failed to retrieve songs.json or missing file content");
    }

    // Decode the existing songs data
    const existingSongs = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

    // Create new song entry
    const newSong = {
      name: songTitle,
      author: artist,
      category,
      lyrics,
    };

    // Add new song to the list
    const updatedSongs = [...existingSongs, newSong];

    // Encode the updated songs data back to base64
    const updatedContent = Buffer.from(JSON.stringify(updatedSongs, null, 2)).toString("base64");

    // Commit the updated file to GitHub
    console.log("Committing updated songs.json to GitHub...");
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

    // If commit fails, log and return an error
    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      throw new Error(`Failed to update file on GitHub: ${err.message}`);
    }

    // Return success message
    return res.status(200).json({ message: "Song added successfully!" });
  } catch (err) {
    // Catch and log any errors that occur
    console.error("🔥 ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
