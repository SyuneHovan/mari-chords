import React, { useState } from "react";
import { Header } from "./Header";
import WaveIcon from "../../public/svgs/wave";
import BackIcon from "../../public/svgs/back";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import NextDownIcon from "../../public/svgs/nextDown";
import DoneIcon from "../../public/svgs/done";
import { Button, Col, Modal, Row } from "antd";

export const AddSong = () => {
    const [lyrics, setLyrics] = useState("");
    const [parsedLines, setParsedLines] = useState([]);
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [author, setAuthor] = useState("");
    const [activeWord, setActiveWord] = useState(null);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    
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
        category,
        lyrics: parsedLines
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

        <WaveIcon className="waveButton" waveClassName="toTop" pos="top left" onClick={handleNavigate} icon={<BackIcon/>}/>
        <div className="add-song">
          <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ margin: "1rem" }}>
            Add as Code
          </Button>
          <h1>լրացրու երգի բառերը, յետոյ նշանակիր ակորդներ</h1>
    
          {/* Metadata Inputs */}
          <div >
            <input
              type="text"
              value={name}
              placeholder="վերնագիր"
              onChange={e => setName(e.target.value)}
            />
            <br />
            <br />
            <input
              type="text"
              value={author}
              placeholder="հեղինակ"
              onChange={e => setAuthor(e.target.value)}
            />
            {/* <br />
            <br />
            <input
              type="text"
              value={category}
              placeholder="group"
              onChange={e => setCategory(e.target.value)}
            /> */}
          </div>
          <br />
          <br />
    
          {/* Lyrics Input */}
          <div>
            <TextArea
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="լրացրու երգի բառերը..."
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

        <Modal
          title="Add Songs via JSON"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={async () => {
            try {
              let input = jsonInput.trim();
              if (!input) throw new Error("Empty input");

              let songs;
              try {
                // Attempt to parse the input as JSON
                songs = JSON.parse(input);
              } catch (parseError) {
                // If parsing fails, try wrapping as an array (for single object or comma-separated objects)
                if (!input.startsWith("[") && !input.endsWith("]")) {
                  input = `[${input}]`;
                  songs = JSON.parse(input);
                } else {
                  throw parseError; // Re-throw if input was supposed to be an array but still failed
                }
              }

              // Ensure songs is an array
              if (!Array.isArray(songs)) {
                songs = [songs]; // Wrap single object in an array
              }

              // Validate that songs array is not empty
              if (songs.length === 0) throw new Error("No valid songs found");

              // Process each song
              for (const song of songs) {
                // Optional: Validate song object structure
                if (!song.name || !song.author || !song.category || !Array.isArray(song.lyrics)) {
                  throw new Error("Invalid song object structure");
                }

                const response = await fetch(`${window.location.origin}/api/save`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ song }) // Send each song individually
                });

                if (!response.ok) {
                  throw new Error(`Failed to save song: ${song.name}`);
                }
              }

              console.log("Songs added successfully");
              setIsModalVisible(false);
              setJsonInput("");
              navigate("/");
            } catch (error) {
              console.error("Invalid JSON or error saving song:", error);
            }
          }}
        >
          <TextArea
            rows={10}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Paste your song JSON here...\nCan be:\n{...}\n{...}, {...}\n[{...}, {...}]`}
          />
        </Modal>
      </>
    );
  };
