
import { useState, useEffect } from 'react';
import './flipcounter.css';

const FlipCounter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flipCounter">
      <div className="card">
        <div className="flip">
          <div className="number">{count}</div>
        </div>
      </div>
    </div>
  );
};

export default FlipCounter;
