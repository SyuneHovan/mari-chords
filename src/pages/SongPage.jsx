import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "../components/ScrollArea";
import { Button } from "../components/Button";
import songs from "../data/songs.json";

export const SongPage = () => {
    const { songName } = useParams();
    const song = songs.find(s => s.name === songName);
    const [autoScroll, setAutoScroll] = useState(false);
    
    useEffect(() => {
        let interval;
        if (autoScroll) {
            interval = setInterval(() => {
                window.scrollBy({ top: 1, behavior: "smooth" });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [autoScroll]);
    
    return song ? (
        <div>
            <h1>{song.name} - {song.author}</h1>
            <Button onClick={() => setAutoScroll(!autoScroll)}>{autoScroll ? "Stop" : "Start"} Auto-Scroll</Button>
            <ScrollArea>
                {song.chords.map((chord, index) => (
                    <p key={index}>{chord}</p>
                ))}
            </ScrollArea>
        </div>
    ) : <p>Song not found</p>;
};