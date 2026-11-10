import { useEffect, useState } from "react";

// The current time, updated every second while `isRunning` is true
// (e.g. while an order is still on its way).
const useNow = (isRunning: boolean) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  return now;
};

export default useNow;
