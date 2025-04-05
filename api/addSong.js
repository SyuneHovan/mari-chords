import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

    if (!songTitle || !artist || !lyrics) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const songsFilePath = path.join(process.cwd(), "src", "data", "songs.json");

    let songs;
    try {
      const data = fs.readFileSync(songsFilePath, "utf8");
      songs = JSON.parse(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to read songs.json" });
    }

    const newSong = {
      name: songTitle,
      author: artist,
      category,
      lyrics
    };

    songs.push(newSong);

    try {
      fs.writeFileSync(songsFilePath, JSON.stringify(songs, null, 2), "utf8");
      return res.status(200).json({ message: "Song added successfully!" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to save the song" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
