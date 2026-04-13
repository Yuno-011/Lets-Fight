// components/GameCanvas.jsx
import { useEffect, useRef, useState } from "react";
import GameContainer from "./GameContainer";

export default function GameCanvas({ setScore }) {
  const wrapperRef = useRef(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      {size && <GameContainer game_width={size.width} game_height={size.height} setScore={setScore} />}
    </div>
  );
}