// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Song } from "./pages/Song";
// import 'antd/dist/reset.css';
// import { List } from "./pages/List";
// import { AddSong } from "./pages/AddSong";

// function App() {
//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<List />} />
//                 <Route path="/song/:id" element={<Song />} />
//                 <Route path="/AddSong" element={<AddSong />} />
//             </Routes>
//         </Router>
//     );
// }


// export default App;


import React from 'react';
import MobileApp from './MobileApp'; // Import our new mobile app container
import './style.scss'; // Make sure to import your main css file if you have one

function App() {
  // We are now telling our app to only render the MobileApp component
  return <MobileApp />;
}

export default App;