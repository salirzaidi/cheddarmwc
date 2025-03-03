import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Sphere, Line } from "@react-three/drei";

// Bone connections
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Right arm
  [1, 5], [5, 6], [6, 7], // Left arm
  [1, 8], [8, 9], [9, 10], // Torso
  [2, 8], [5, 8], // Shoulders to spine
  [10, 11], [11, 12], // Right leg
  [13, 14], [14, 15], // Left leg
  [9, 10], [9, 13] // Hips connection
];

// Generate human-like keypoints (same as before)
const generateHumanLikeKeypoints = () => {
  return [
    { position: { x: 0, y: 100 } }, // Head (0)
    { position: { x: 0, y: 80 } }, // Neck (1)
    { position: { x: 40, y: 60 } }, // Right shoulder (2)
    { position: { x: 60, y: 30 } }, // Right elbow (3)
    { position: { x: 80, y: 0 } }, // Right hand (4)
    { position: { x: -40, y: 60 } }, // Left shoulder (5)
    { position: { x: -60, y: 30 } }, // Left elbow (6)
    { position: { x: -80, y: 0 } }, // Left hand (7)
    { position: { x: 0, y: 50 } }, // Spine (8)
    { position: { x: 0, y: 30 } }, // Hip (9)
    { position: { x: 20, y: 10 } }, // Right hip (10)
    { position: { x: 25, y: -20 } }, // Right knee (11)
    { position: { x: 30, y: -40 } }, // Right foot (12)
    { position: { x: -20, y: 10 } }, // Left hip (13)
    { position: { x: -25, y: -20 } }, // Left knee (14)
    { position: { x: -30, y: -40 } } // Left foot (15)
  ];
};

// Calculate direction (angle) between two points
const getDirection = (start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  return angle;
};

const PoseSkeleton = ({ keypoints }) => {
  if (!keypoints || keypoints.length === 0) return null;

  return (
    <group>
      {/* Render spheres for keypoints */}
      {keypoints.map((point, index) => (
        <Sphere key={index} args={[5, 16, 16]} position={[point.position.x, point.position.y, 0]} name={`point-${index}`}>
          <meshStandardMaterial color="blue" />
        </Sphere>
      ))}

      {/* Connect keypoints with lines to create bones */}
      {connections.map(([start, end], index) => {
        const startPoint = keypoints[start]?.position;
        const endPoint = keypoints[end]?.position;
        if (!startPoint || !endPoint) return null;

        return (
          <Line
            key={`line-${index}`}
            points={[[startPoint.x, startPoint.y, 0], [endPoint.x, endPoint.y, 0]]}
            color="red"
            lineWidth={2}
          />
        );
      })}
    </group>
  );
};

const PoseNetCanvas = () => {
  const keypoints = generateHumanLikeKeypoints();
  const [dragging, setDragging] = useState(null);
  const [targetLeftHand, setTargetLeftHand] = useState({ position: { x: -80, y: 0 } });
  const [targetRightHand, setTargetRightHand] = useState({ position: { x: 80, y: 0 } });
  const canvasRef = useRef();
  const scale = 0.5;

  // Handle pointer down event to start dragging
  const handlePointerDown = (e, hand) => {
    setDragging(hand);
  };

  // Handle pointer move event to update hand position during drag
  const handlePointerMove = (e) => {
    if (!dragging) return;
    const { clientX, clientY } = e;
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const offsetX = (clientX - canvasBounds.left) * scale;
    const offsetY = (clientY - canvasBounds.top) * scale;

    const newPos = { x: offsetX, y: offsetY }; // Adjust as necessary for the canvas position
    if (dragging === "right") {
      setTargetRightHand({ position: newPos });
      updateArmPositions(newPos, "right");
    } else if (dragging === "left") {
      setTargetLeftHand({ position: newPos });
      updateArmPositions(newPos, "left");
    }
  };

  // Handle pointer up event to stop dragging
  const handlePointerUp = () => {
    setDragging(null);
  };

  // Update the positions of the arms and shoulders based on the dragged hand
  const updateArmPositions = (newPos, hand) => {
    if (hand === "right") {
      // Update right arm (shoulder and elbow)
      const angle = getDirection({ x: 60, y: 30 }, newPos);
      keypoints[3].position = {
        x: 60 + Math.cos(angle) * 30, // Right elbow position
        y: 30 + Math.sin(angle) * 30,
      };
      keypoints[2].position = { ...newPos }; // Right shoulder follows hand
    } else if (hand === "left") {
      // Update left arm (shoulder and elbow)
      const angle = getDirection({ x: -60, y: 30 }, newPos);
      keypoints[6].position = {
        x: -60 + Math.cos(angle) * 30, // Left elbow position
        y: 30 + Math.sin(angle) * 30,
      };
      keypoints[5].position = { ...newPos }; // Left shoulder follows hand
    }
  };

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 200], fov: 75 }}
      style={{ width: "100vw", height: "100vh" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={(e) => {
        if (e.target.name === "point-4") handlePointerDown(e, "right");
        if (e.target.name === "point-7") handlePointerDown(e, "left");
      }}
    >
      <ambientLight intensity={0.5} />
      <PoseSkeleton keypoints={keypoints} />
    </Canvas>
  );
};

export default PoseNetCanvas;
