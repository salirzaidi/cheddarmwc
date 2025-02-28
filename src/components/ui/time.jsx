import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CurrentTimeCard() {
  const [currentTime, setCurrentTime] = useState('');

  // Update the current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString()); // Set time in HH:MM:SS format
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Time</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{currentTime}</p>
      </CardContent>
    </Card>
  );
}
