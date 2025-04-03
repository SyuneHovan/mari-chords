import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SongPage } from "./pages/SongPage";
import 'antd/dist/reset.css';
import { List } from "./pages/List";
import { AddSong } from "./pages/AddSong";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<List />} />
                <Route path="/song/:songName" element={<SongPage />} />
                <Route path="/AddSong" element={<AddSong />} />
            </Routes>
        </Router>
    );
}

export default App;