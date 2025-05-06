import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import songs from "../../public/data/songs.json";
import { Header } from "./Header";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const SongPage = () => {
    const { songName } = useParams();
    const song = songs.find(s => s.name === songName);
    const [autoScroll, setAutoScroll] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1);
    const [editingChord, setEditingChord] = useState(null); // Tracks which chord is being edited
    const [chordValue, setChordValue] = useState(""); // Stores the input value for the chord
    const navigate = useNavigate();

    const handleNavigate = () => {
        console.log("Navigating back");
        navigate(-1);
    };

    useEffect(() => {
        let interval;
        if (autoScroll) {
            interval = setInterval(() => {
                document.getElementById("scrollRoll").scrollBy({ top: Math.max(1, scrollSpeed/2), behavior: "smooth" });
            }, Math.max(10, (100/(scrollSpeed/5)) / scrollSpeed));    
        }
        
        return () => clearInterval(interval);
    }, [autoScroll, scrollSpeed]);

    // Start editing a chord
    const handleChordClick = (lineIndex, wordIndex, chordIndex, currentChord) => {
        setEditingChord({ lineIndex, wordIndex, chordIndex });
        setChordValue(currentChord);
    };

    // Handle chord input change
    const handleChordChange = (e) => {
        setChordValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setEditingChord(null);
            setChordValue("");
        }
    };

    // Handle outside clicks to close the chord input
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

    // Save the updated song
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

        // Create a deep copy of the song's lyrics
        const updatedLyrics = song.lyrics.map((line, lIndex) => 
            lIndex === editingChord.lineIndex
                ? line.map((wordObj, wIndex) =>
                      wIndex === editingChord.wordIndex
                          ? {
                                ...wordObj,
                                chords: wordObj.chords.map((chord, cIndex) =>
                                    cIndex === editingChord.chordIndex ? chordValue.trim() : chord
                                )
                            }
                          : wordObj
                  )
                : line
        );

        const updatedSong = {
            ...song,
            lyrics: updatedLyrics
        };

        const SERVER_URL = window.location.origin;

        try {
            console.log("Saving chord, sending request to:", `${SERVER_URL}/api/save`);
            console.log("Request payload:", JSON.stringify({ song: updatedSong }));

            const response = await fetch(`${SERVER_URL}/api/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ song: updatedSong })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Server error response:", errorData);
                throw new Error(errorData.error || `Failed to save chord (HTTP ${response.status})`);
            }

            const data = await response.json();
            console.log("Success saving chord:", data.message);
            toast.success("Chord saved successfully!", {
                position: "top-center",
                autoClose: 2000,
            });

            // Update local songs data
            songs[songs.findIndex(s => s.name === songName)] = updatedSong;
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

    return song ? (
        <div>
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
            <WaveIcon className="waveButton" pos="top left" onClick={handleNavigate} icon={<BackIcon/>}/>
            <div className="song-page-container">
                <div className="song-page-header">
                    <SongViewIcon/>
                    <h3>{song.name}</h3>
                    <h4>{song.author}</h4>
                    
                    <Button onClick={() => setAutoScroll(!autoScroll)} className={"playButton"}>
                        {autoScroll ? <PauseIcon/> : <PlayIcon/>} 
                    </Button>

                    <InputNumber type="number" style={{width: "100px"}} defaultValue={1} min={1} max={99} onChange={(num) => setScrollSpeed(num)}/>
                </div>
                
                <div className="lyricsCont">
                    <BgWaveIcon className={"bg-wave"}/>
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
                                                        <Button className="small" onClick={handleSaveChord}>✓</Button>
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
        </div>
    ) : <p>Song not found</p>;
};