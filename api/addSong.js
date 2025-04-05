import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { songTitle, artist, lyrics, category = "Unknown" } = req.body;

    if (!songTitle || !artist || !lyrics) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase.from("songs").insert([
      {
        name: songTitle,
        author: artist,
        lyrics,
        category
      }
    ]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to save the song" });
    }

    return res.status(200).json({ message: "Song added successfully!" });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
