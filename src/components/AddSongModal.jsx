import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const AddSongsModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const navigate = useNavigate();

  // Function to show error toast
  const showErrorToast = (errorMsg) => {
    message.error({
      content: errorMsg,
      duration: 3, // Duration in seconds
      style: {
        marginTop: '10vh', // Adjust for mobile visibility
      },
    });
  };

  const handleOk = async () => {
    try {
      let input = jsonInput.trim();
      if (!input) {
        showErrorToast('Please enter valid JSON data.');
        throw new Error('Empty input');
      }

      let songs;
      try {
        // Attempt to parse the input as JSON
        songs = JSON.parse(input);
      } catch (parseError) {
        // If parsing fails, try wrapping as an array
        if (!input.startsWith('[') && !input.endsWith(']')) {
          input = `[${input}]`;
          try {
            songs = JSON.parse(input);
          } catch (wrapError) {
            showErrorToast('Invalid JSON format. Please check your input.');
            throw wrapError;
          }
        } else {
          showErrorToast('Invalid JSON format. Please check your input.');
          throw parseError;
        }
      }

      // Ensure songs is an array
      if (!Array.isArray(songs)) {
        songs = [songs]; // Wrap single object in an array
      }

      // Validate that songs array is not empty
      if (songs.length === 0) {
        showErrorToast('No valid songs found in the input.');
        throw new Error('No valid songs found');
      }

      // Process each song
      for (const song of songs) {
        // Validate song object structure
        if (!song.name || !song.author || !song.category || !Array.isArray(song.lyrics)) {
          showErrorToast(`Invalid song data for "${song.name || 'unknown song'}". Ensure name, author, category, and lyrics are provided.`);
          throw new Error('Invalid song object structure');
        }

        const response = await fetch(`${API_URL}/api/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song }), // Send each song individually
        });

        if (!response.ok) {
          showErrorToast(`Failed to save song: ${song.name}`);
          throw new Error(`Failed to save song: ${song.name}`);
        }
      }

      message.success('Songs added successfully!');
      setIsModalVisible(false);
      setJsonInput('');
      navigate('/');
    } catch (error) {
      console.error('Error saving song:', error);
      // Generic fallback error message (in case no specific toast was shown)
      if (!error.message.includes('Empty input') && !error.message.includes('Invalid JSON') && !error.message.includes('No valid songs') && !error.message.includes('Invalid song object') && !error.message.includes('Failed to save song')) {
        showErrorToast('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Modal
      title="Add Songs via JSON"
      open={isModalVisible}
      className="modal-addascode"
      onCancel={() => setIsModalVisible(false)}
      onOk={handleOk}
    >
      <TextArea
        rows={10}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder={`[\n  { // song 1\n    "name": "Home",\n    "author": "Passenger",\n    "category": "pop",\n    "lyrics": [\n      [ // line 1\n        {"word": "They","chords": ["Am","C"]},\n        {"word": "say","chords": ["C"]},\n        {"word": "home","chords": []},\n        ...  // next word & it's chords\n      ],\n      ...  // line 2\n    ]\n  },\n  ... // song 2\n]`}
      />
    </Modal>
  );
};

export default AddSongsModal;