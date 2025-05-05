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

export const SongPage = () => {
    const { songName } = useParams();
    const song = songs.find(s => s.name === songName);
    const [autoScroll, setAutoScroll] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1);
    const [editingChord, setEditingChord] = useState(null); // Tracks which chord is being edited
    const [chordValue, setChordValue] = useState(""); // Stores the input value for the chord
    const navigate = useNavigate();

    const handleNavigate = () => {
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

    // Save the updated song
    const handleSaveChord = async () => {
        if (!editingChord || !chordValue.trim()) return;

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
            // Update the song in the GitHub repository
            await fetch(`${SERVER_URL}/api/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ song: updatedSong })
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
                // Update local songs data (this assumes songs.json is reloaded or managed elsewhere)
                songs[songs.findIndex(s => s.name === songName)] = updatedSong;
                setEditingChord(null); // Exit editing mode
                setChordValue("");
            })
            .catch(error => {
                console.log("Error saving the song:", error);
            });
        } catch (error) {
            console.error("Error saving the song:", error);
        }
    };

    return song ? (
        <div>
            <Header />
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
                                                    <span key={chordIndex}>
                                                        <Input
                                                            value={chordValue}
                                                            onChange={handleChordChange}
                                                            style={{ width: "80px", marginRight: "5px" }}
                                                        />
                                                        <Button onClick={handleSaveChord}>Submit</Button>
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