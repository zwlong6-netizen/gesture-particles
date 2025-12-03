import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 8000;
const FONT_SIZE = 100;
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 512;

const ParticleSystem = ({ text, interactionFactor }) => {
  const mountRef = useRef(null);
  const particlesRef = useRef(null);
  const targetPositionsRef = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const interactionFactorRef = useRef(0); // Store interaction factor in ref
  const frameIdRef = useRef(null);

  // Update the ref whenever the prop changes
  useEffect(() => {
    interactionFactorRef.current = interactionFactor;
  }, [interactionFactor]);

  // Text generation helper
  const generateTextPositions = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${FONT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;
    const positions = [];

    // Scan for white pixels
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
      for (let x = 0; x < CANVAS_WIDTH; x += 4) {
        const index = (y * CANVAS_WIDTH + x) * 4;
        if (data[index] > 128) { // Red channel > 128
          // Normalize to 3D space range [-10, 10] approx
          const posX = (x - CANVAS_WIDTH / 2) * 0.05;
          const posY = -(y - CANVAS_HEIGHT / 2) * 0.05; // Invert Y
          positions.push(posX, posY, 0);
        }
      }
    }

    return positions;
  };

  // Update target positions when text changes
  useEffect(() => {
    const positions = generateTextPositions(text);
    const targetArr = targetPositionsRef.current;
    
    // Fill target array
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      if (i < positions.length / 3) {
        targetArr[i3] = positions[i3];
        targetArr[i3 + 1] = positions[i3 + 1];
        targetArr[i3 + 2] = positions[i3 + 2];
      } else {
        // Excess particles float randomly
        targetArr[i3] = (Math.random() - 0.5) * 50;
        targetArr[i3 + 1] = (Math.random() - 0.5) * 50;
        targetArr[i3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
  }, [text]);

  useEffect(() => {
    const mount = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable alpha
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Fully transparent clear color
    
    if (mount) {
      mount.appendChild(renderer.domElement);
    }

    // Particles Setup
    const geometry = new THREE.BufferGeometry();
    const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      initialPositions[i * 3] = (Math.random() - 0.5) * 100;
      initialPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      initialPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      // Color gradient
      colors[i * 3] = 0.5 + Math.random() * 0.5;     // R
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
      colors[i * 3 + 2] = 1.0;                       // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3, // Increased size for better visibility
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    const clock = new THREE.Clock();

    // Animation Loop
    const animate = () => {
      const time = clock.getElapsedTime();
      const positions = particles.geometry.attributes.position.array;
      const targets = targetPositionsRef.current;
      
      // Read from REF, not prop
      const currentFactor = interactionFactorRef.current;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // Interaction Logic: Grip Strength
        // 0.0 = Open Hand = Text Shape
        // 1.0 = Closed Fist = Collapse to center
        
        // 1. Calculate "Text Target"
        let tx = targets[i3];
        let ty = targets[i3 + 1];
        let tz = targets[i3 + 2];

        // 2. Calculate "Center Target" (Collapse)
        // Add a little random offset so they don't all merge into a single pixel
        // making a small ball instead of a singularity.
        const cx = (Math.random() - 0.5) * 5; 
        const cy = (Math.random() - 0.5) * 5;
        const cz = (Math.random() - 0.5) * 5;

        // 3. Blend based on Grip Strength (Binary control)
        const factor = currentFactor; // Use the ref value
        
        // If grip strength is high, set target to collapse center
        if (factor > 0.9) { 
            tx = cx;
            ty = cy;
            tz = cz;
        } else {
            // Otherwise, target is the text position (with breathing effect)
            if (factor < 0.2) { // Still add breathing for text
                tz += Math.sin(time * 2 + tx * 0.1) * 0.5;
            }
            // tx, ty, tz are already set to text target initially
        }

        // Current particle position
        const px = positions[i3];
        const py = positions[i3 + 1];
        const pz = positions[i3 + 2];

        // Smoothly interpolate current position to the new blended target
        positions[i3] += (tx - px) * 0.1;
        positions[i3 + 1] += (ty - py) * 0.1;
        positions[i3 + 2] += (tz - pz) * 0.1;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      
      // Add a very subtle sway to the whole system for "underwater" feel
      particles.rotation.z = Math.sin(time * 0.5) * 0.02; 

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // Empty dependency array means this effect runs once after the initial render

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ParticleSystem;