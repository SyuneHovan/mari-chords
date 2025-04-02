import React, { useState } from "react";

export const SongCreator = () => {
  const [title, setTitle] = useState("");
  const [lyricsAndChords, setLyricsAndChords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [currentChords, setCurrentChords] = useState("");

  const addWord = () => {
    if (!currentWord.trim()) return;
    const chordsArray = currentChords.split(",").map((chord) => chord.trim());
    setLyricsAndChords([
      ...lyricsAndChords,
      { word: currentWord, chords: chordsArray }
    ]);
    setCurrentWord("");
    setCurrentChords("");
  };

  const generateJSON = () => {
    const songData = {
      title: title,
      lyrics_and_chords: lyricsAndChords
    };
    alert(JSON.stringify(songData, null, 2));
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h2>Create a Song</h2>
      <div>
        <label>
          Song Title:{" "}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ margin: "10px 0", padding: "5px" }}
          />
        </label>
      </div>
      <div>
        <label>
          Word:{" "}
          <input
            type="text"
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value)}
            style={{ margin: "10px 0", padding: "5px" }}
          />
        </label>
      </div>
      <div>
        <label>
          Chords (comma-separated):{" "}
          <input
            type="text"
            value={currentChords}
            onChange={(e) => setCurrentChords(e.target.value)}
            style={{ margin: "10px 0", padding: "5px" }}
          />
        </label>
      </div>
      <button onClick={addWord} style={{ margin: "10px 5px", padding: "5px" }}>
        Add Word
      </button>
      <button
        onClick={generateJSON}
        style={{ margin: "10px 5px", padding: "5px" }}
      >
        Generate JSON
      </button>
      <div>
        <h3>Preview:</h3>
        <pre>{JSON.stringify({ title, lyrics_and_chords: lyricsAndChords }, null, 2)}</pre>
      </div>
    </div>
  );
}