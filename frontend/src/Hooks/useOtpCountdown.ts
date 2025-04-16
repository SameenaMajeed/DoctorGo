// hooks/useOtpCountdown.ts
import { useState, useEffect } from 'react';

const useOtpCountdown = (initialCount = 60) => {
  const [countdown2, setCountdown] = useState(initialCount);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  const startCountdown = (seconds = initialCount) => {
    setCountdown(seconds);
    setIsCounting(true);
  };

  return { countdown, isCounting, startCountdown };
};

export default useOtpCountdown;