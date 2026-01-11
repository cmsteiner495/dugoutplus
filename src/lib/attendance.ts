import { RSVP } from '../models/types';

const DEFAULT_REQUIRED_PLAYERS = 9;

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const getAttendanceConfidence = (
  rsvps: RSVP[],
  requiredPlayers = DEFAULT_REQUIRED_PLAYERS
) => {
  const going = rsvps.filter((rsvp) => rsvp.status === 'Going').length;
  const maybe = rsvps.filter((rsvp) => rsvp.status === 'Maybe').length;
  const attendingScore = going + maybe * 0.5;
  return clamp(attendingScore / requiredPlayers);
};
