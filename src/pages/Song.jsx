import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import { Col, InputNumber, Row } from "antd";
import ScrollIcon from "../../public/svgs/scroll";
import StopIcon from "../../public/svgs/stop";
import { Input } from "../components/Input";
import SongViewIcon from "../../public/svgs/songView";
import WaveIcon from "../../public/svgs/wave";
import Link from "antd/es/typography/Link";
import BackIcon from "../../public/svgs/back";
import BgWaveIcon from "../../public/svgs/bgWave";
import PlayIcon from "../../public/svgs/play";
import PauseIcon from "../../public/svgs/pause";
import LoaderIcon from "../../public/svgs/loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "./Header";

export const Song = () => {
  const params = useParams();
  const { id } = params;
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [editingChord, setEditingChord] = useState(null);
  const [chordValue, setChordValue] = useState("");
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(-1);
  };

  const fetchSong = async (songId) => {
    if (!songId) {
      toast.error("Song ID is missing!", {
        position: "top-center",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/songs/${songId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch song");
      }
      const data = await response.json();
      setSong(data);
    } catch (error) {
      console.error("Error fetching song:", error);
      toast.error("Error fetching song: " + error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSong(id);
    } else {
      toast.error("Invalid song ID!", {
        position: "top-center",
        autoClose: 3000,
      });
      setLoading(false);
    }
  }, [id, params]);

  useEffect(() => {
    let interval;
    if (autoScroll && song) {
      interval = setInterval(() => {
        document.getElementById("scrollRoll").scrollBy({
          top: Math.max(1, scrollSpeed / 2),
          behavior: "smooth",
        });
      }, Math.max(10, 100 / (scrollSpeed / 5) / scrollSpeed));
    }
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed, song]);

  const handleChordClick = (lineIndex, wordIndex, chordIndex, currentChord) => {
    setEditingChord({ lineIndex, wordIndex, chordIndex });
    setChordValue(currentChord);
  };

  const handleChordChange = (e) => {
    setChordValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setEditingChord(null);
      setChordValue("");
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".flying input") &&
        !event.target.closest(".flying .small") &&
        !event.target.closest(".chord span")
      ) {
        setEditingChord(null);
        setChordValue("");
      }
    };

    if (editingChord) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [editingChord]);

  const handleSaveChord = async () => {
    if (!editingChord) {
      toast.error("No chord selected for editing!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (!chordValue.trim()) {
      toast.error("Chord value cannot be empty!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const updatedLyrics = song.lyrics.map((line, lIndex) =>
      lIndex === editingChord.lineIndex
        ? line.map((wordObj, wIndex) =>
            wIndex === editingChord.wordIndex
              ? {
                  ...wordObj,
                  chords: wordObj.chords.map((chord, cIndex) =>
                    cIndex === editingChord.chordIndex ? chordValue.trim() : chord
                  ),
                }
              : wordObj
          )
        : line
    );

    const updatedSong = {
      id: song.id,
      name: song.name,
      author: song.author,
      category: song.category,
      lyrics: updatedLyrics,
    };

    const SERVER_URL = window.location.origin;

    try {

      const response = await fetch(`${SERVER_URL}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSong),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error(errorData.error || `Failed to save chord (HTTP ${response.status})`);
      }

      const data = await response.json();
      toast.success("Chord saved successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setSong(updatedSong);
      setEditingChord(null);
      setChordValue("");
    } catch (error) {
      console.error("Error saving chord:", error.message);
      toast.error(`Error saving chord: ${error.message}`, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      {loading && <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <LoaderIcon style={{ width: "50px", height: "50px" }} />
      </div>}
      <Header />
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
      <WaveIcon className="waveButton" pos="top left" onClick={handleNavigate} icon={<BackIcon />} />
        {song && 
          <div className="song-page-container">
            <div className="song-page-header">
              <SongViewIcon />
              <h3>{song.name}</h3>
              <h4>{song.author}</h4>
              <Button onClick={() => setAutoScroll(!autoScroll)} className={"playButton"}>
                {autoScroll ? <PauseIcon /> : <PlayIcon />}
              </Button>
              <InputNumber
                type="number"
                style={{ width: "100px" }}
                defaultValue={1}
                min={1}
                max={99}
                onChange={(num) => setScrollSpeed(num)}
              />
            </div>
            <div className="lyricsCont">
              <BgWaveIcon className={"bg-wave"} />
              <div className="lyrics" id="scrollRoll">
                {song.lyrics.map((line, lineIndex) => (
                  <div key={lineIndex} className="line">
                    {line.map((wordObj, wordIndex) => (
                      <span key={wordIndex} className="word-container">
                        <span className="chord">
                          {wordObj.chords.map((chord, chordIndex) => {
                            const isEditing =
                              editingChord &&
                              editingChord.lineIndex === lineIndex &&
                              editingChord.wordIndex === wordIndex &&
                              editingChord.chordIndex === chordIndex;

                            return isEditing ? (
                              <span key={chordIndex} className="flying">
                                <Input
                                  value={chordValue}
                                  onChange={handleChordChange}
                                  onKeyDown={handleKeyDown}
                                />
                                <Button className="small" onClick={handleSaveChord}>
                                  ✓
                                </Button>
                              </span>
                            ) : (
                              <span
                                key={chordIndex}
                                onClick={() =>
                                  handleChordClick(lineIndex, wordIndex, chordIndex, chord)
                                }
                                style={{ cursor: "pointer", marginRight: "5px" }}
                              >
                                {chord}
                              </span>
                            );
                          })}
                        </span>
                        <span className="word">{wordObj.word}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
    </div>
  );
};