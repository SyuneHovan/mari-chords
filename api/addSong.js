import fs from "fs";
import path from "path";

export default function handler(req, res) {
  console.log("res",req, res)
  if (req.method === "POST") {
    const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

    if (!songTitle || !artist || !lyrics) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const songsFilePath = path.join(process.cwd(), "src", "data", "songs.json");

    // Read the current songs file

    let songs;
    try {
      const data = fs.readFileSync(songsFilePath, "utf8");
      songs = JSON.parse(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to read songs.json" });
    }

    // Add the new song
    const newSong = {
      name: songTitle,
      author: artist,
      category,
      lyrics
    };

    songs.push(newSong);
    
    res.status(200).json(songs);
    
    // Write the updated songs to the file
    try {
      fs.writeFileSync(songsFilePath, JSON.stringify(songs, null, 2), "utf8");
      res.status(200).json({ message: "Song added successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save the song" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}