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
        <p style={{color: '#00ff00'}}>Debug Status: {debugInfo}</p>
        <p>Detected Fingers: {gestureState.fingers}</p>
        <p>Grip Strength: {gestureState.spread.toFixed(2)}</p>
        <p>Current Text: {text}</p>
      </div>
    </div>
  );
}

export default App;