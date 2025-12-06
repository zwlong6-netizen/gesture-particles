import React, { useState, useCallback } from 'react';
import ParticleSystem from './components/ParticleSystem';
import HandTracker from './components/HandTracker';
import './App.css';

const TEXT_MAP = {
  1: "HELLO",
  2: "FUTURE",
  3: "WORLD"
};

function App() {
  const [text, setText] = useState("HELLO");
  const [interactionFactor, setInteractionFactor] = useState(0);
  const [gestureState, setGestureState] = useState({ fingers: 0, spread: 0 });
  const [debugInfo, setDebugInfo] = useState("Initializing...");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const toggleMusic = () => {
    const bgm = document.getElementById('bgm');
    if (bgm.paused) {
      bgm.volume = 0.5;
      bgm.play().catch(e => console.error("Audio play failed", e));
      setIsMusicPlaying(true);
    } else {
      bgm.pause();
      setIsMusicPlaying(false);
    }
  };

  const handleHandUpdate = useCallback((data) => {
    const { fingerCount, spreadDistance, debug } = data;

    // Update Text based on gesture
    if (TEXT_MAP[fingerCount]) {
      setText(TEXT_MAP[fingerCount]);
    }

    setInteractionFactor(spreadDistance);
    setGestureState({ fingers: fingerCount, spread: spreadDistance });
    if (debug) setDebugInfo(debug);
  }, []);

  return (
    <div className="app-container">
      <ParticleSystem text={text} interactionFactor={interactionFactor} />

      <HandTracker onUpdate={handleHandUpdate} />

      <div className="ui-overlay">
        <h1>Gesture Particles</h1>
        <p>🖐️ Open Hand: Show Text (1, 2, 3 fingers change text)</p>
        <p>✊ Close Fist: Collapse particles to center</p>
        <br />
        <p style={{ color: '#00ff00' }}>Debug Status: {debugInfo}</p>
        <p>Detected Fingers: {gestureState.fingers}</p>
        <p>Grip Strength: {gestureState.spread.toFixed(2)}</p>
        <p>Current Text: {text}</p>

        <div style={{ marginTop: '20px', pointerEvents: 'auto' }}>
          <button
            onClick={toggleMusic}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              background: isMusicPlaying ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid white',
              borderRadius: '20px',
              fontSize: '14px',
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s'
            }}
          >
            {isMusicPlaying ? '🎵 Playing BGM' : '🔇 Play Music'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;