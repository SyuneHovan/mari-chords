import axios from 'axios';

// IMPORTANT: Replace this with your actual Vercel deployment URL
const API_BASE_URL = 'https://aghbyur.vercel.app/'; // Replace this URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient;