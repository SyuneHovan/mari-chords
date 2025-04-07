import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/Button";
import songs from "../data/songs.json";
import { Header } from "./Header";
import { Col, InputNumber, Row } from "antd";
import ScrollIcon from "../../public/svgs/scroll";
import StopIcon from "../../public/svgs/stop";
import { Input } from "../components/Input";

export const SongPage = () => {
    const { songName } = useParams();
    const song = songs.find(s => s.name === songName);
    const [autoScroll, setAutoScroll] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1);
    
    useEffect(() => {
        let interval;
        if (autoScroll) {
            interval = setInterval(() => {
                document.getElementById("scrollRoll").scrollBy({ top: scrollSpeed * 2, behavior: "smooth" });
            }, Math.max(10, 100 / scrollSpeed));    
        }
        
        return () => clearInterval(interval);
    }, [autoScroll, scrollSpeed]);
    
    
    return song ? (
    <div>
        <Header />
        <div className="song-page-container">
            <h3>{song.name} - {song.author}</h3>
            <Row gutter={[10, 10]} className="scroll-button">
                <Col style={{gap:"20px"}}>
                    <InputNumber type="number" style={{width: "100px"}} defaultValue={1} min={1} max={100} onChange={(num) => setScrollSpeed(num)}/>
                    <Button onClick={() => setAutoScroll(!autoScroll)}>
                        {autoScroll ? <StopIcon/> : <ScrollIcon/>} 
                    </Button>
                </Col>
            </Row>
            <div className="lyrics" id="scrollRoll">

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