import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Link, useNavigate } from "react-router-dom";
import songs from "../data/songs.json";
import AddIcon from "../../public/svgs/add";
import { Col, Row } from 'antd';
import { Header } from "./Header";
import WaveIcon from "../../public/svgs/wave";
import SongIcon from "../../public/svgs/song";
import Paragraph from "antd/es/typography/Paragraph";
import CategoryScroll from "../components/CategoryScroll";
import HomeWaveIcon from "../../public/svgs/homeWave";


export const List = () => {
    const [filter, setFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [category, setCategory] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState(songs);
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/AddSong');
    };

    useEffect(() => {
        setFilteredSongs(
            songs.filter(song =>
                song.name.toLowerCase().includes(filter.toLowerCase()) &&
                (selectedCategory === "" || song.category === selectedCategory)
            )
        );
        setCategory([
            { value: "", label: "All" },
            ...[...new Set(songs.map(song => song.category))].map(category => ({
              value: category,
              label: category
            }))
          ]);
    }, [filter, selectedCategory]);

    return (
        <>
            <HomeWaveIcon className={"home-bg-wave"}/> 
            <Row className="list-filter" justify={"space-between"}>
                <Col>
                    <Row gutter={[12, 0]}>
                        <Col>
                            <Input placeholder="Search by name..." onChange={(e) => setFilter(e.target.value)} />
                        </Col>
                        <Col>
                            {/* <Select options={[{ value: "", label: "All Categories" }, { value: "Pop", label: "Pop" }, { value: "Rock", label: "Rock" }]} onChange={(e) => setSelectedCategory(e.target.value)} /> */}
                            <CategoryScroll options={category} onChange={(e) => setSelectedCategory(e.target.value)} />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="list" justify={"space-between"}>
                <Col>
                    <ul>
                        {filteredSongs.map(song => (
                            <li key={song.name}>
                                <Link to={`/song/${song.name}`}>
                                    <Row className="song" justify={"space-between"}>
                                        <Col>
                                            <SongIcon className="song-list-icon"/>
                                        </Col>
                                        <Col className="songInfoBox">
                                            <Paragraph className="songInfo songTitle">{song.name}</Paragraph>
                                            <Paragraph className="songInfo">{song.author}</Paragraph>
                                        </Col>
                                    </Row>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Col>
            </Row>

            <WaveIcon className="addButton" pos="bottom left" onClick={handleNavigate} icon={<AddIcon/>}/>
        </>
    );
};