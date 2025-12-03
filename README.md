# Gesture Particles

A 3D interactive particle system controlled by hand gestures.

## Features
- **Hand Tracking**: Powered by Google MediaPipe Hands.
- **3D Particles**: Rendering using Three.js.
- **Interactions**:
    - Show **1 finger**: Form text "HELLO".
    - Show **2 fingers**: Form text "FUTURE".
    - Show **3 fingers**: Form text "WORLD".
    - **Two Hands**: Move hands apart to explode/spread the particles. Move them close to assemble the text.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Allow camera access when prompted.

## Technologies
- React + Vite
- Three.js
- MediaPipe Hands
- React Webcam