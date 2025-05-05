import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Link, useNavigate } from "react-router-dom";
import AddIcon from "../../public/svgs/add";
import { Col, Row } from "antd";
import { Header } from "./Header";
import WaveIcon from "../../public/svgs/wave";
import SongIcon from "../../public/svgs/song";
import Paragraph from "antd/es/typography/Paragraph";
import CategoryScroll from "../components/CategoryScroll";
import HomeWaveIcon from "../../public/svgs/homeWave";
import DeletePopupIcon from "../../public/svgs/deletePopup";

export const List = () => {
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [category, setCategory] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/AddSong");
  };

  // Fetch songs from the GitHub-hosted songs.json
  const fetchSongs = async () => {
    try {
      const response = await fetch("/src/data/songs.json");
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }
      const songsData = await response.json();
      setFilteredSongs(songsData);
      setCategory([
        { value: "", label: "All" },
        ...[...new Set(songsData.map((song) => song.category))].map((category) => ({
          value: category,
          label: category,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const filtered = filteredSongs.filter(
      (song) =>
        song.name.toLowerCase().includes(filter.toLowerCase()) &&
        (selectedCategory === "" || song.category === selectedCategory)
    );
    setFilteredSongs(filtered);
  }, [filter, selectedCategory]);

  // State for swipe handling
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchMoveX, setTouchMoveX] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState({});
  const [showConfirm, setShowConfirm] = useState(null);

  const handleTouchStart = (e, songName) => {
    setTouchStartX(e.touches[0].clientX);
    setSwipeOffset((prev) => ({ ...prev, [songName]: 0 }));
  };

  const handleTouchMove = (e, songName) => {
    if (touchStartX !== null) {
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - touchStartX;
      // Only allow rightward movement
      if (deltaX > 0) {
        setTouchMoveX(currentX);
        setSwipeOffset((prev) => ({
          ...prev,
          [songName]: Math.min(deltaX, 100),
        }));
      }
    }
  };

  const handleTouchEnd = (e, songName) => {
    const offset = swipeOffset[songName] || 0;
    if (offset >= 100) {
      setShowConfirm(songName);
    } else {
      setSwipeOffset((prev) => ({ ...prev, [songName]: 0 }));
    }
    setTouchStartX(null);
    setTouchMoveX(null);
  };

  const confirmDelete = async (songName) => {
    try {
      const SERVER_URL = window.location.origin;
      const response = await fetch(`${SERVER_URL}/api/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songName }),
      });

      if (!response.ok) {
        console.error("Failed to delete the song", response);
        throw new Error("Failed to delete the song");
      }

      const data = await response.json();
      console.log("Success deleting the song:", data.message);

      // Refetch songs to update the UI
      await fetchSongs();
    } catch (error) {
      console.error("Error deleting the song:", error);
    } finally {
      setShowConfirm(null);
      setSwipeOffset((prev) => ({ ...prev, [songName]: 0 }));
    }
  };

  const cancelDelete = () => {
    setShowConfirm(null);
    Object.keys(swipeOffset).forEach((songName) =>
      setSwipeOffset((prev) => ({ ...prev, [songName]: 0 }))
    );
  };

  return (
    <>
      <HomeWaveIcon className={"home-bg-wave"} />
      <div className="list-filter">
        <Input
          placeholder="Search by name..."
          onChange={(e) => setFilter(e.target.value)}
        />
        <CategoryScroll
          options={category}
          onChange={(e) => setSelectedCategory(e.target.value)}
        />
      </div>
      <Row className="list" justify={"space-between"}>
        <Col>
          <ul>
            {filteredSongs.map((song) => (
              <li
                key={song.name}
                style={{
                  transform: `translateX(${swipeOffset[song.name] || 0}px)`,
                  transition: touchMoveX ? "none" : "transform 0.3s ease-out",
                }}
                onTouchStart={(e) => handleTouchStart(e, song.name)}
                onTouchMove={(e) => handleTouchMove(e, song.name)}
                onTouchEnd={(e) => handleTouchEnd(e, song.name)}
                onTouchCancel={(e) => handleTouchEnd(e, song.name)}
              >
                <Link to={`/song/${song.name}`}>
                  <Row className="song" justify={"space-between"}>
                    <Col>
                      <SongIcon className="song-list-icon" />
                    </Col>
                    <Col className="songInfoBox">
                      <Paragraph className="songInfo songTitle">
                        {song.name}
                      </Paragraph>
                      <Paragraph className="songInfo">{song.author}</Paragraph>
                    </Col>
                  </Row>
                </Link>
              </li>
            ))}
          </ul>
        </Col>
      </Row>

      <WaveIcon
        className="waveButton"
        pos="bottom left"
        onClick={handleNavigate}
        icon={<AddIcon />}
      />

      {showConfirm && (
        <div className="popup">
          <DeletePopupIcon />
          <p>Are you sure you want to delete {showConfirm}?</p>
          <div className="button-group">
            <button className="bg-charcoal" onClick={() => confirmDelete(showConfirm)}>
              Yes
            </button>
            <button className="bg-terracotta" onClick={cancelDelete}>
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};