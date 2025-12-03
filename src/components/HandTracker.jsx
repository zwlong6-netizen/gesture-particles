import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { countFingers, calculateGripStrength } from '../utils/handUtils';

const HandTracker = ({ onUpdate }) => {
  const webcamRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    let intervalId;
    let camera = null;
    let hands = null;

    const init = () => {
      const Hands = window.Hands;
      const Camera = window.Camera;

      if (Hands && Camera) {
        clearInterval(intervalId);
        setIsLoaded(true);

        hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          let fingerCount = 0;
          let gripStrength = 0;
          let debugMsg = "No hands detected";

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // 1. Text Switching (Still count open fingers)
            fingerCount = countFingers(landmarks);
            
            // 2. Collapse Control (Grip Strength)
            // 0.0 (Open) -> 1.0 (Fist)
            gripStrength = calculateGripStrength(landmarks);

            debugMsg = `Hand! Fingers: ${fingerCount}, Grip: ${gripStrength.toFixed(2)}`;
          }

          // We pass 'gripStrength' as 'spreadDistance' to reuse the prop in App/ParticleSystem
          onUpdate({ fingerCount, spreadDistance: gripStrength, debug: debugMsg });
        });

        if (webcamRef.current && webcamRef.current.video) {
          camera = new Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (webcamRef.current && webcamRef.current.video) {
                await hands.send({ image: webcamRef.current.video });
              }
            },
            width: webcamRef.current.video.videoWidth || 640,
            height: webcamRef.current.video.videoHeight || 480,
          });
          camera.start();
        }
      }
    };

    intervalId = setInterval(init, 500);
    init();

    return () => {
      clearInterval(intervalId);
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, [onUpdate]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  return (
    <div className="camera-container">
      {!isLoaded && <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20}}>Loading AI Model...</div>}
      <Webcam
        ref={webcamRef}
        className="camera-feed"
        mirrored={true}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
    </div>
  );
};

export default HandTracker;