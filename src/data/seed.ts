import { AnnouncementMessage, Channel, Event, Member, Message, Reply, Team } from '../models/types';

export const team: Team = {
  id: 'team-1',
  name: 'Springfield Tigers',
  season: 'Spring 2025',
};

export const members: Member[] = [
  { id: 'm1', name: 'Coach Taylor', role: 'Coach' },
  { id: 'm2', name: 'Jordan Miles', role: 'Staff', authorized: true },
  { id: 'm3', name: 'Sam Patel', role: 'Staff', authorized: false },
  { id: 'm4', name: 'Alex Morgan', role: 'Parent' },
];

export const channels: Channel[] = [
  { id: 'c1', name: 'Announcements', type: 'Announcements', isOfficial: true },
  { id: 'c2', name: 'Team Chat', type: 'Team Chat' },
  { id: 'c3', name: 'Logistics', type: 'Logistics' },
];

export const messages: Message[] = [
  {
    id: 'a1',
    channelId: 'c1',
    authorId: 'm1',
    createdAt: new Date().toISOString(),
    content: 'Uniform pickup is Friday at 4pm in the clubhouse.',
    type: 'announcement',
    title: 'Uniform Pickup',
    tag: 'Info',
    pinned: true,
    requiresConfirmation: true,
    confirmations: ['m2'],
    attachments: ['Uniform checklist.pdf'],
  } as AnnouncementMessage,
  {
    id: 'a2',
    channelId: 'c1',
    authorId: 'm2',
    createdAt: new Date().toISOString(),
    content: 'Please confirm attendance for Saturday game day.',
    type: 'announcement',
    title: 'Saturday Game Day',
    tag: 'Action',
    pinned: false,
    requiresConfirmation: true,
    confirmations: [],
    attachments: [],
  } as AnnouncementMessage,
  {
    id: 'm5',
    channelId: 'c2',
    authorId: 'm4',
    createdAt: new Date().toISOString(),
    content: 'Carpool spots still available for Sunday.',
    type: 'text',
  },
];

export const replies: Reply[] = [
  {
    id: 'r1',
    messageId: 'a1',
    authorId: 'm4',
    createdAt: new Date().toISOString(),
    content: 'Got it, we will be there at 4pm.',
  },
];

export const events: Event[] = [
  {
    id: 'e1',
    title: 'Practice - North Field',
    location: 'North Field 2',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    notes: 'Bring batting gloves and water.',
    rsvps: [
      { memberId: 'm1', status: 'Going' },
      { memberId: 'm2', status: 'Going' },
      { memberId: 'm4', status: 'Maybe' },
    ],
  },
  {
    id: 'e2',
    title: 'Game vs. Rockets',
    location: 'Dugout Park',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    notes: 'Arrive 45 minutes early for warmups.',
    rsvps: [
      { memberId: 'm1', status: 'Going' },
      { memberId: 'm2', status: 'Maybe' },
      { memberId: 'm4', status: 'No' },
    ],
  },
];
