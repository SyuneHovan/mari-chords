import React, { useState } from "react";
import { Header } from "./Header";
import WaveIcon from "../../public/svgs/wave";
import BackIcon from "../../public/svgs/back";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import NextDownIcon from "../../public/svgs/nextDown";
import DoneIcon from "../../public/svgs/done";
import { Col, Row } from "antd";

export const AddSong = () => {
    const [lyrics, setLyrics] = useState("");
    const [parsedLines, setParsedLines] = useState([]);
    const [name, setName] = useState("");
    const [author, setAuthor] = useState("");
    const [activeWord, setActiveWord] = useState(null);
    const navigate = useNavigate();
    
    const handleNavigate = () => {
        navigate(-1);
    };

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
        name,
        author,
        lyrics: parsedLines,
        category: "Pop" // Example category
      };

      const SERVER_URL = window.location.origin;
      
      await fetch(`${SERVER_URL}/api/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ song })
      })
      .then(response => {
          if (!response.ok) {
              console.error("Failed to save the song", response);
              throw new Error("Failed to save the song");
          }
          return response.json();
      })
      .then(data => {
          console.log("Success saving the song:", data.message);
          setName("");
          setAuthor("");
          setParsedLines([]);
          navigate("/")
      })
      .catch(error => {
          console.log("Error saving the song:", error);
      });
    };
  
    return (
      <>
        <Header/>
        <WaveIcon className="addButton" pos="top left" onClick={handleNavigate} icon={<BackIcon/>}/>
        <div className="add-song">
          <h1>paste song lyrics, then assign chords.</h1>
    
          {/* Metadata Inputs */}
          <div >
            <input
              type="text"
              value={name}
              placeholder="song title"
              onChange={e => setName(e.target.value)}
            />
            <br />
            <br />
            <input
              type="text"
              value={author}
              placeholder="author"
              onChange={e => setAuthor(e.target.value)}
            />
          </div>
          <br />
          <br />
    
          {/* Lyrics Input */}
          <div>
            <TextArea
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="paste lyrics here..."
              rows={6}
            />
            <button onClick={handleLyricsSubmit} style={{ display: "block" }}>
              <NextDownIcon/>
            </button>
          </div>
    
          {/* Parsed Lyrics for Chord Assignment */}
          {parsedLines.length > 0 && (
            <>
              <div className="parsed-lyrics">
                
                {parsedLines.map((line, lineIndex) => (
                  <div key={lineIndex} className="add-line">
                    {line.map((wordObj, wordIndex) => (
                      <span
                        key={wordIndex}
                        className="add-word-box"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveWord({ lineIndex, wordIndex });
                        }}
                      >
                        {wordObj.chords.length > 0 && 
                        (activeWord?.lineIndex !== lineIndex || activeWord?.wordIndex !== wordIndex) && (
                          <span className="add-chord">{wordObj.chords.join(", ")}</span>
                        )}
                        <span className="add-word">{wordObj.word}</span>
                        {activeWord?.lineIndex === lineIndex &&
                          activeWord?.wordIndex === wordIndex && (
                            <input
                              className="add-chord-input"
                              type="text"
                              value={wordObj.chords.join(",")}
                              onChange={e =>
                                handleChordChange(lineIndex, wordIndex, e.target.value)
                              }
                            />
                          )}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
      
              {/* Save Button */}
              <button onClick={handleSaveSong}>
                <DoneIcon/>
              </button>
            </>
          )}
        </div>
      </>
    );
  };