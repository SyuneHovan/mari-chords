import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import songs from "../data/songs.json";
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
    
    
    return song ? (
    <div>
        <Header />
        <WaveIcon className="addButton" pos="top left" onClick={handleNavigate} icon={<BackIcon/>}/>
        <div className="song-page-container">
            <div className="song-page-header">
                <SongViewIcon/>
                <h3>{song.name}</h3>
                <h4>{song.author}</h4>
                
                <Button onClick={() => setAutoScroll(!autoScroll)}>
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
                                    <span className="word">{wordObj.word}</span>

                                    <span className="chord">
                                        {wordObj.chords.map((chord) => chord).join(" ")}
                                    </span>
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