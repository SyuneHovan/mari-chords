import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Link } from "react-router-dom";
import songs from "../data/songs.json";
import AddIcon from "../../public/svgs/add";
import { Col } from 'antd';
import { List } from "./List";
import Paragraph from "antd/es/skeleton/Paragraph";


export const Header = () => { 
    const [filter, setFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filteredSongs, setFilteredSongs] = useState(songs);

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
            <Col className="header">
                {/* <Link to={`/`}><span>Ձայնեղ Մարիկ</span></Link> */}
            </Col>
        </>
    );
};