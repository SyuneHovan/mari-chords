import React, { useState, useEffect } from "react";
 import { Input } from "../components/Input";
 import { Select } from "../components/Select";
 import { Link } from "react-router-dom";
 import songs from "../data/songs.json";
 
 export const Home = () => {
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
         <div>
             <h1>Song List</h1>
             <Input placeholder="Search by name..." onChange={(e) => setFilter(e.target.value)} />
             <Select options={[{ value: "", label: "All Categories" }, { value: "Pop", label: "Pop" }, { value: "Rock", label: "Rock" }]} onChange={(e) => setSelectedCategory(e.target.value)} />
             <ul>
                 {filteredSongs.map(song => (
                     <li key={song.name}><Link to={`/song/${song.name}`}>{song.name}</Link></li>
                 ))}
             </ul>
         </div>
     );
 };