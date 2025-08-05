import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ReactNativeWeb from 'vite-plugin-react-native-web';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add the React Native Web plugin
    ReactNativeWeb()
  ],
})