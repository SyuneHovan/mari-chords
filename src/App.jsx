import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { SongPage } from "./pages/SongPage";
import { SongCreator } from "./pages/SongCreator";
import 'antd/dist/reset.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/song/:songName" element={<SongPage />} />
                <Route path="/songCreator" element={<SongCreator />} />
            </Routes>
        </Router>
    );
}

export default App;