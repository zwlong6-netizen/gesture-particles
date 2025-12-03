export const countFingers = (landmarks) => {
  // ... (keep existing logic roughly same, or simplify)
  // We can reuse the logic below for consistency if needed, but let's keep simple Y check for numbers for now.
  let count = 0;
  if (landmarks[8].y < landmarks[6].y) count++;
  if (landmarks[12].y < landmarks[10].y) count++;
  if (landmarks[16].y < landmarks[14].y) count++;
  if (landmarks[20].y < landmarks[18].y) count++;
  return count;
};

export const calculateGripStrength = (landmarks) => {
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  
  // Reference scale: Distance from Wrist to Middle Finger MCP (Palm size)
  // This allows us to be independent of camera distance/hand size.
  const palmSize = Math.sqrt(Math.pow(wrist.x - middleMCP.x, 2) + Math.pow(wrist.y - middleMCP.y, 2));

  // Helper distance function
  const d = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  // Fingers: Index(8), Middle(12), Ring(16), Pinky(20)
  // Corresponding MCPs: 5, 9, 13, 17
  const fingers = [
    { tip: 8, mcp: 5 },
    { tip: 12, mcp: 9 },
    { tip: 16, mcp: 13 },
    { tip: 20, mcp: 17 }
  ];

  let totalCurl = 0;

  fingers.forEach(f => {
    const tipToMCP = d(landmarks[f.tip], landmarks[f.mcp]);
    
    // If finger is fully open, tipToMCP is roughly equal to finger length (approx 0.8-1.0 * palmSize for long fingers)
    // If finger is closed, tipToMCP is small (tip touches palm base).
    
    // Normalize this distance against palmSize.
    // Open finger ratio: ~0.8 to 1.2 (depending on finger)
    // Closed finger ratio: ~0.3 to 0.5
    
    let ratio = tipToMCP / palmSize;
    
    // Map ratio to 0..1 curl value
    // Let's say if ratio > 0.9, it's Open (Curl 0)
    // If ratio < 0.5, it's Closed (Curl 1)
    
    // Clamp and invert
    // ratio 0.5 -> 1.0 (Closed)
    // ratio 1.0 -> 0.0 (Open)
    let fingerCurl = (1.0 - ratio) * 2.0; // Rough mapping
    
    // Clamp to 0..1
    fingerCurl = Math.max(0, Math.min(1, fingerCurl));
    
    totalCurl += fingerCurl;
  });

  // Average of 4 fingers
  return totalCurl / 4.0;
};

export const calculateHandDistance = (results) => {
  // ... (keep existing just in case)
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length < 2) return 0;
  const hand1 = results.multiHandLandmarks[0][0];
  const hand2 = results.multiHandLandmarks[1][0];
  const dx = hand1.x - hand2.x;
  const dy = hand1.y - hand2.y;
  return Math.sqrt(dx * dx + dy * dy);
};