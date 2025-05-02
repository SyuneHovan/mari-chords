import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Link } from "react-router-dom";
import songs from "../data/songs.json";
import AddIcon from "../../public/svgs/add";
import { Col, Row } from 'antd';
import { Header } from "./Header";


export const List = () => {
    const [filter, setFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filteredSongs, setFilteredSongs] = useState(songs);

    console.log("songs", songs)

    useEffect(() => {
        setFilteredSongs(
            songs.filter(song =>
                song.name.toLowerCase().includes(filter.toLowerCase()) &&
                (selectedCategory === "" || song.category === selectedCategory)
            )
        );
    }, [filter, selectedCategory]);

    return (
        <>
            <Header/>
            <Row className="list" justify={"space-between"}>
                <Col>
                    <Row gutter={[12, 0]}>
                        <Col>
                            <Input placeholder="Search by name..." onChange={(e) => setFilter(e.target.value)} />
                        </Col>
                        <Col>
                            <Select options={[{ value: "", label: "All Categories" }, { value: "Pop", label: "Pop" }, { value: "Rock", label: "Rock" }]} onChange={(e) => setSelectedCategory(e.target.value)} />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="list" justify={"space-between"}>
                <Col>
                    <ul>
                        {filteredSongs.map(song => (
                            <li key={song.name}><Link to={`/song/${song.name}`}>{song.name} - {song.author}</Link></li>
                        ))}
                    </ul>
                </Col>
            </Row>
        </>
    );
};