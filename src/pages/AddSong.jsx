import React, { useState } from "react";
import { Header } from "./Header";

export const AddSong = () => {
    const [lyrics, setLyrics] = useState("");
    const [parsedLines, setParsedLines] = useState([]);
    const [songTitle, setSongTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [activeWord, setActiveWord] = useState(null);
  
    const handleLyricsSubmit = () => {
      const lines = lyrics.split("\n").map(line =>
        line.split(/\s+/).map(word => ({ word, chords: [] }))
      );
      setParsedLines(lines);
      setLyrics(""); // Clear the input field after parsing
    };
  
    const handleChordChange = (lineIndex, wordIndex, chords) => {
      const updatedLines = [...parsedLines];
      updatedLines[lineIndex][wordIndex].chords = chords.split(",");
      setParsedLines(updatedLines);
    };
    
    const handleSaveSong = async () => {
      const song = {
        songTitle,
        artist,
        lyrics: parsedLines,
        category: "Pop" // Example category
      };

      const SERVER_URL = window.location.origin;
      
      await fetch(`${SERVER_URL}/api/save.js`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ song })
      });

      // fetch(`${window.location.origin}/api/addSong`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify(song)
      // })      
      //   .then(response => {
      //     if (!response.ok) {
      //       throw new Error("Failed to save the song");
      //     }
      //     return response.json();
      //   })
      //   .then(data => {
      //     log("WEEEEEEE")
      //     alert(data.message);
      //     // Reset fields
      //     setSongTitle("");
      //     setArtist("");
      //     setParsedLines([]);
      //   })
      //   .catch(error => {
      //     console.error("Error:", error);
      //     alert("Error saving the song");
      //   });
    };
  
    return (
      <>
        <Header/>
        <div>
          <h1>Add New Song</h1>
    
          {/* Metadata Inputs */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              Song Title:
              <input
                type="text"
                value={songTitle}
                onChange={e => setSongTitle(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </label>
            <br />
            <label>
              Artist:
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                style={{ marginLeft: "10px", marginTop: "10px" }}
              />
            </label>
          </div>
    
          {/* Lyrics Input */}
          <div>
            <textarea
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="Paste lyrics here..."
              rows={5}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button onClick={handleLyricsSubmit} style={{ display: "block" }}>
              Parse Lyrics
            </button>
          </div>
    
          {/* Parsed Lyrics for Chord Assignment */}
          {parsedLines.length > 0 && (
            <div>
              <h2>Assign Chords</h2>
              {parsedLines.map((line, lineIndex) => (
                <div key={lineIndex} style={{ marginBottom: "10px" }}>
                  {line.map((wordObj, wordIndex) => (
                    <span
                      key={wordIndex}
                      style={{
                        display: "inline-block",
                        marginRight: "10px",
                        position: "relative",
                        cursor: "pointer"
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setActiveWord({ lineIndex, wordIndex });
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>{wordObj.word}</span>
                      {wordObj.chords.length > 0 && (
                        <span
                          style={{
                            display:
                              activeWord?.lineIndex === lineIndex &&
                              activeWord?.wordIndex === wordIndex
                                ? "none"
                                : "block",
                            color: "blue",
                            position: "absolute",
                            top: "-20px"
                          }}
                        >
                          {wordObj.chords.join(", ")}
                        </span>
                      )}
                      {activeWord?.lineIndex === lineIndex &&
                        activeWord?.wordIndex === wordIndex && (
                          <input
                            type="text"
                            value={wordObj.chords.join(",")}
                            onChange={e =>
                              handleChordChange(lineIndex, wordIndex, e.target.value)
                            }
                            style={{
                              position: "absolute",
                              top: "-30px",
                              left: "0",
                              width: "80px"
                            }}
                          />
                        )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
    
          {/* Save Button */}
          <div style={{ marginTop: "20px" }}>
            <button onClick={handleSaveSong}>Save Song</button>
          </div>
        </div>
      </>
    );
  };