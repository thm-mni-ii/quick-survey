import { useEffect, useState } from 'preact/hooks';
import { Typography } from '@mui/material';

export interface CountdownProps {
    deadline: Date;
}

/**
 * Renders a countdown to the given
 * @param {Object} deadline the date object of the deadline
 * @constructor
 */
export default function Countdown({ deadline }: CountdownProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatOutput(getTimeUntilDate(deadline)));
    }, 100);
    return () => clearInterval(interval);
  }, [deadline]);


  return <>
    <Typography variant="body2" component="span">{countdown}</Typography>
  </>;
}

/**
 * Calculates the hours, minutes and seconds until the targetDate
 * @param {object} targetDate the targetDate
 * @return {object}
 */
function getTimeUntilDate(targetDate: Date): {hours: number, minutes: number, seconds: number} {
  const timeRemaining = targetDate.getTime() - Date.now();

  const secondsRemaining = Math.floor(timeRemaining / 1000);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = Math.floor(secondsRemaining % 60);

  return {
    hours,
    minutes,
    seconds,
  };
}

/**
 * Transforms the given numbers to a german string
 * @param {number} hours the hours
 * @param {number} minutes the minutes
 * @param {number} seconds the seconds
 * @return {string}
 */
function formatOutput({ hours, minutes, seconds }: {hours: number, minutes: number, seconds: number}): string {
  let output = '';
  if (hours > 0) {
    output += `${hours} Stunde${hours > 1 ? 'n' : ''} `;
  }
  if (minutes > 0) {
    output += `${minutes} Minute${minutes > 1 ? 'n' : ''} `;
  }
  if (seconds > 0) {
    output += `${seconds} Sekunde${seconds > 1 ? 'n' : ''} `;
  }
  if (output === '') {
    output = '0 Sekunden';
  }

  return output.trim();
}
