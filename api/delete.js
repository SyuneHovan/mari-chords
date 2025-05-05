export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const GITHUB_REPO = "SyuneHovan/mari-chords";
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const { songName } = req.body;
  
    console.log("API handler invoked with body:", req.body);
    console.log("GITHUB_TOKEN present:", !!GITHUB_TOKEN);
  
    // Validate inputs
    if (!GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN is missing");
      return res.status(500).json({ error: "Server configuration error" });
    }
    if (!songName) {
      console.error("Invalid song name:", songName);
      return res.status(400).json({ error: "Song name is required" });
    }
  
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/src/data/songs.json`;
  
    try {
      // Fetch current file
      const fileRes = await fetch(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
  
      console.log("GitHub API response status:", fileRes.status);
      console.log("GitHub API response headers:", Object.fromEntries(fileRes.headers));
  
      if (!fileRes.ok) {
        const errorData = await fileRes.json();
        console.error("GitHub fetch error details:", errorData);
        throw new Error(`Failed to fetch file from GitHub: ${fileRes.statusText}`);
      }
  
      const fileData = await fileRes.json();
      console.log("File data from GitHub:", fileData);
  
      if (!fileData.sha) {
        throw new Error("No sha found in GitHub response");
      }
      if (!fileData.content) {
        throw new Error("No content found in GitHub response");
      }
  
      // Decode content
      const currentContent = Buffer.from(fileData.content, "base64").toString("utf8");
      console.log("Current songs.json content:", currentContent);
      let songs;
      try {
        songs = JSON.parse(currentContent);
        if (!Array.isArray(songs)) {
          throw new Error("songs.json is not an array");
        }
      } catch (e) {
        console.error("Error parsing songs.json:", e.message);
        throw new Error("Invalid songs.json format");
      }
      const sha = fileData.sha;
  
      // Filter out the song to delete
      const updatedSongs = songs.filter((song) => song.name !== songName);
      console.log("Updated songs array:", updatedSongs);
  
      // Prepare updated content
      const updatedContent = JSON.stringify(updatedSongs, null, 2);
      const commitData = {
        message: `Delete song: ${songName}`,
        content: Buffer.from(updatedContent).toString("base64"),
        sha,
      };
  
      console.log("Commit data:", commitData);
  
      // Commit to GitHub
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commitData),
      });
  
      console.log("GitHub commit response status:", response.status);
      const commitResponse = await response.json();
      console.log("GitHub commit response:", commitResponse);
  
      if (!response.ok) {
        console.error("GitHub commit error details:", commitResponse);
        throw new Error(`GitHub commit failed: ${response.statusText}`);
      }
  
      console.log("Committed SHA:", commitResponse.commit.sha);
      return res.status(200).json({ message: "Song deleted successfully!" });
    } catch (error) {
      console.error("Error during GitHub API request:", error.message);
      return res.status(500).json({ error: "An error occurred while deleting the song" });
    }
  }