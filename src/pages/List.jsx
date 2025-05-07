import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddIcon from "../../public/svgs/add";
import { Col, Row } from "antd";
import { Header } from "./Header";
import WaveIcon from "../../public/svgs/wave";
import SongIcon from "../../public/svgs/song";
import Paragraph from "antd/es/typography/Paragraph";
import CategoryScroll from "../components/CategoryScroll";
import HomeWaveIcon from "../../public/svgs/homeWave";
import DeletePopupIcon from "../../public/svgs/deletePopup";
import LoaderIcon from "../../public/svgs/loader";
import { Loader } from "../components/Loader";

export const List = () => {
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [author, setAuthor] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/AddSong");
  };

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }
      const songsData = await response.json();
      setAllSongs(songsData);
      setFilteredSongs(songsData);
      setAuthor([
        { value: "", label: "All" },
        ...[...new Set(songsData.map((song) => song.author))].map((author) => ({
          value: author,
          label: author,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching songs:", error);
      toast.error("Error fetching songs: " + error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const filtered = allSongs.filter(
      (song) =>
        song.name.toLowerCase().includes(filter.toLowerCase()) &&
        (selectedCategory === "" || song.author === selectedCategory)
    );
    setFilteredSongs(filtered);
  }, [filter, selectedCategory, allSongs]);

  // State for swipe handling
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchMoveX, setTouchMoveX] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState({});
  const [showConfirm, setShowConfirm] = useState(null);

  const handleTouchStart = (e, id) => {
    setTouchStartX(e.touches[0].clientX);
    setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleTouchMove = (e, id) => {
    if (touchStartX !== null) {
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - touchStartX;
      if (deltaX > 0) {
        setTouchMoveX(currentX);
        setSwipeOffset((prev) => ({
          ...prev,
          [id]: Math.min(deltaX, 100),
        }));
      }
    }
  };

  const handleTouchEnd = (e, id) => {
    const offset = swipeOffset[id] || 0;
    if (offset >= 100) {
      setShowConfirm(id);
    } else {
      setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
    }
    setTouchStartX(null);
    setTouchMoveX(null);
  };

  const confirmDelete = async (song) => {
    const { id } = song;

    try {
      const SERVER_URL = window.location.origin;
      const response = await fetch(`${SERVER_URL}/api/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete the song", response.status, errorData);
        throw new Error(errorData.error || "Failed to delete the song");
      }

      const data = await response.json();
      console.log("Success deleting the song:", data.message);
      toast.success(data.message, {
        position: "top-center",
        autoClose: 2000,
      });

      await fetchSongs();
    } catch (error) {
      console.error("Error deleting the song:", error);
      toast.error("Error deleting song: " + error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setShowConfirm(null);
      setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const cancelDelete = () => {
    setShowConfirm(null);
    Object.keys(swipeOffset).forEach((id) =>
      setSwipeOffset((prev) => ({ ...prev, [id]: 0 }))
    );
  };

  return (
    <>
      {loading && <Loader/>}
      <HomeWaveIcon className={"home-bg-wave"} />
      <div className="list-filter">
        <Input
          placeholder="Փնտրել ըստ անունի..."
          onChange={(e) => setFilter(e.target.value)}
        />
        <CategoryScroll
          options={author}
          onChange={(e) => setSelectedCategory(e.target.value)}
        />
      </div>

      <Row className="list" justify={"space-between"}>
        <Col>
          <ul>
            {!loading && 
              filteredSongs.map((song) => (
                <Link to={`/song/${song.id}`} key={song.id}>
                  <li
                    style={{
                      transform: `translateX(${swipeOffset[song.name] || 0}px)`,
                      transition: touchMoveX ? "none" : "transform 0.3s ease-out",
                    }}
                    onTouchStart={(e) => handleTouchStart(e, song.name)}
                    onTouchMove={(e) => handleTouchMove(e, song.name)}
                    onTouchEnd={(e) => handleTouchEnd(e, song.name)}
                    onTouchCancel={(e) => handleTouchEnd(e, song.name)}
                  >
                    <Row className="song" justify={"start"}>
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
                  </li>
                </Link>
              ))
            }
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
        <>
          <div className="popup-back"></div>
          <div className="popup">
            <DeletePopupIcon />
            <p>
              Հաստա՞տ ուզում ես ջնջել <span className="tc-terracotta">{showConfirm}</span> երգը
            </p>
            <div className="button-group">
              <button
                className="small"
                onClick={() => {
                  const song = allSongs.find((s) => s.name === showConfirm);
                  if (song) confirmDelete(song);
                }}
              >
                Այո
              </button>
              <button className="small bg-terracotta" onClick={cancelDelete}>
                Ոչ
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
