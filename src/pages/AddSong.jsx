import React, { useState } from "react";
import { Header } from "./Header";
import WaveIcon from "../../public/svgs/wave";
import BackIcon from "../../public/svgs/back";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import NextDownIcon from "../../public/svgs/nextDown";
import DoneIcon from "../../public/svgs/done";
import { Button, Col, Modal, Row } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AddSong = () => {
  const [lyrics, setLyrics] = useState("");
  const [parsedLines, setParsedLines] = useState([]);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [activeWord, setActiveWord] = useState(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState(`[
    { // song 1
      "name": "Home",
      "author": "Passenger",
      "category": "pop",
      "lyrics": [
        [ // line 1
          {"word": "They","chords": ["Am","C"]},
          {"word": "say","chords": ["C"]},
          {"word": "home","chords": []},
          ...  // next word & it's chords
        ],
        ...  // line 2
      ]
    },
    ... // song 2
  ]`);
  
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    navigate(-1);
  };

  const handleLyricsSubmit = () => {
    if (!lyrics.trim()) {
      toast.error("Lyrics cannot be empty!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    const lines = lyrics.split("\n").map(line =>
      line.split(/\s+/).filter(word => word).map(word => ({ word, chords: [] }))
    );
    if (lines.length === 0 || lines.every(line => line.length === 0)) {
      toast.error("No valid words found in lyrics!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    setParsedLines(lines);
    setLyrics(""); // Clear the input field after parsing
  };

  const handleChordChange = (lineIndex, wordIndex, chords) => {
    const updatedLines = [...parsedLines];
    updatedLines[lineIndex][wordIndex].chords = chords.split(",").filter(chord => chord.trim());
    setParsedLines(updatedLines);
  };
  
  const handleSaveSong = async () => {
    // Validate inputs
    if (!name.trim()) {
      toast.error("Song title is required!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (!author.trim()) {
      toast.error("Author is required!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (parsedLines.length === 0) {
      toast.error("Lyrics are required!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
  
    const songData = {
      name,
      author,
      category: category || "uncategorized", // Default category if empty
      lyrics: parsedLines,
    };
  
    console.log("Sending payload to /api/save:", JSON.stringify(songData, null, 2));
  
    const SERVER_URL = window.location.origin;
  
    try {
      const response = await fetch(`${SERVER_URL}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songData), // Send song data directly
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save error response:", errorData);
        throw new Error(errorData.error || "Failed to save the song");
      }
  
      const data = await response.json();
      toast.success(data.message, {
        position: "top-center",
        autoClose: 2000,
      });
      setName("");
      setAuthor("");
      setParsedLines([]);
      navigate("/");
    } catch (error) {
      console.error("Error saving song:", error);
      toast.error("Error saving song: " + error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Opening modal, setting isModalVisible to true");
    setIsModalVisible(true);
  };
  
  return (
    <>
      <Header/>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="mobile-toast"
      />

      <WaveIcon className="waveButton" waveClassName="toTop" pos="top left" onClick={handleNavigate} icon={<BackIcon/>}/>
      <div className="add-song">
        <Button
          className="small bg-terracotta"
          id="addAsCodeBtn"
          onClick={handleOpenModal}
          type="button"
        >
          {"Աւելացնել կոդով {}"}
        </Button>
  
        {/* Metadata Inputs */}
        <div>
          <input
            className="filled"
            type="text"
            value={name}
            placeholder="վերնագիր"
            onChange={e => setName(e.target.value)}
          />
          <br />
          <br />
          <input
            className="filled"
            type="text"
            value={author}
            placeholder="հեղինակ"
            onChange={e => setAuthor(e.target.value)}
          />
        </div>
        <br />
        <br />
  
        {/* Lyrics Input */}
        <div>
          <TextArea
            className="filled"
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            placeholder="լրացրու երգի բառերը..."
            rows={6}
          />
          <br />
          <br />
          <button onClick={handleLyricsSubmit} className="small">
            Կցել ակորդներ
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
            <button  className="small bg-terracotta" onClick={handleSaveSong}>
              Պահպանել
            </button>
          </>
        )}
      </div>

      <Modal
        title="Add Songs via JSON"
        open={isModalVisible}
        className="modal-addascode"
        onCancel={() => {
          console.log("Closing modal, setting isModalVisible to false");
          setIsModalVisible(false);
        }}
        onOk={async () => {
          try {
            let input = jsonInput.trim();
            if (!input) {
              toast.error("JSON input cannot be empty!", {
                position: "top-center",
                autoClose: 3000,
              });
              return;
            }

            let songs;
            try {
              // Attempt to parse the input as JSON
              songs = JSON.parse(input);
            } catch (parseError) {
              // If parsing fails, try wrapping as an array
              if (!input.startsWith("[") && !input.endsWith("]")) {
                input = `[${input}]`;
                try {
                  songs = JSON.parse(input);
                } catch (secondParseError) {
                  throw new Error("Invalid JSON format");
                }
              } else {
                throw new Error("Invalid JSON format");
              }
            }

            // Ensure songs is an array
            if (!Array.isArray(songs)) {
              songs = [songs]; // Wrap single object in an array
            }

            // Validate that songs array is not empty
            if (songs.length === 0) {
              toast.error("No valid songs found in JSON!", {
                position: "top-center",
                autoClose: 3000,
              });
              return;
            }

            // Process each song
            for (const song of songs) {
              // Validate song object structure
              if (!song.name || !song.author || !song.category || !Array.isArray(song.lyrics)) {
                toast.error(`Invalid song structure for "${song.name || 'unknown song'}"`, {
                  position: "top-center",
                  autoClose: 3000,
                });
                return;
              }

              const response = await fetch(`${window.location.origin}/api/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ song })
              });

              if (!response.ok) {
                throw new Error(`Failed to save song: ${song.name}`);
              }
            }

            toast.success("Songs added successfully!", {
              position: "top-center",
              autoClose: 2000,
            });
            setIsModalVisible(false);
            setJsonInput("");
            navigate("/");
          } catch (error) {
            toast.error("Error: " + error.message, {
              position: "top-center",
              autoClose: 3000,
            });
          }
        }}
      >
        <TextArea
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[
  { // song 1
    "name": "Home",
    "author": "Passenger",
    "category": "pop",
    "lyrics": [
      [ // line 1
        {"word": "They","chords": ["Am","C"]},
        {"word": "say","chords": ["C"]},
        {"word": "home","chords": []},
        ...  // next word & it's chords
      ],
      ...  // line 2
    ]
  },
  ... // song 2
]`}
        />
      </Modal>
    </>
  );
};