import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Song } from "./pages/Song";
import 'antd/dist/reset.css';
import { List } from "./pages/List";
import { AddSong } from "./pages/AddSong";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<List />} />
                <Route path="/song/:id" element={<Song />} />
                <Route path="/AddSong" element={<AddSong />} />
            </Routes>
        </Router>
    );
}


export default App;