import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/Button";
import songs from "../data/songs.json";
import { Header } from "./Header";
import { Col, Row } from "antd";

export const SongPage = () => {
    const { songName } = useParams();
    const song = songs.find(s => s.name === songName);
    const [autoScroll, setAutoScroll] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1);

    useEffect(() => {
        console.log("scrollSpeed", scrollSpeed);
        
        let interval;
        if (autoScroll) {
            interval = setInterval(() => {
                window.scrollBy({ top: 1, behavior: "smooth" });
            }, 100/scrollSpeed);
        }
        return () => clearInterval(interval);
    }, [autoScroll, scrollSpeed]);

    return song ? (
    <div>
        <Header />
        <div className="song-page-container">
            <h1>{song.name} - {song.author}</h1>
            <Row>
                <Col span={6}>
                    <Button onClick={() => setAutoScroll(!autoScroll)}>
                        {autoScroll ? "Stop" : "Start"} Auto-Scroll
                    </Button>
                </Col>
                <Col span={1}>
                    <input type="number" style={{width: "100px"}} onChange={(e) => setScrollSpeed(e.target.value)}/>
                </Col>
            </Row>
            <div className="lyrics">

                {song.lyrics.map((line, lineIndex) => (

                    <div key={lineIndex} className="line">

                        {line.map((wordObj, wordIndex) => (

                            <span key={wordIndex} className="word-container">
                                <span className="word">{wordObj.word}</span>

                                {wordObj.chord && (
                                    <span className="chord">
                                        {wordObj.chord}
                                    </span>
                                )}
                            </span>
                        ))}

                    </div>

                ))}
                
            </div>
        </div>
    </div>
    ) : <p>Song not found</p>;
};