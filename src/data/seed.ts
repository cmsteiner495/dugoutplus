import { AnnouncementMessage, Channel, Event, Member, Message, Reply, Team } from '../models/types';

export const team: Team = {
  id: 'team-1',
  name: 'Sting Baseball Club',
  season: 'Spring 2025',
};

export const members: Member[] = [
  {
    id: 'm1',
    name: 'Coach Taylor',
    role: 'coach',
    permissions: ['post_updates', 'review_updates'],
    emergencyContactOnFile: true,
  },
  {
    id: 'm2',
    name: 'Jordan Miles',
    role: 'staff',
    authorized: true,
    permissions: ['post_updates', 'volunteer_lead'],
    emergencyContactOnFile: true,
  },
  {
    id: 'm3',
    name: 'Sam Patel',
    role: 'staff',
    authorized: false,
    permissions: ['check_in_support'],
    emergencyContactOnFile: false,
  },
  {
    id: 'm4',
    name: 'Alex Morgan',
    role: 'parent',
    permissions: ['carpool', 'volunteer'],
    emergencyContactOnFile: true,
  },
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
    category: 'Announcement',
    isOfficial: true,
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
    category: 'Announcement',
    isOfficial: true,
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
    category: 'Logistics',
    isOfficial: false,
  },
  {
    id: 'm6',
    channelId: 'c3',
    authorId: 'm2',
    createdAt: new Date().toISOString(),
    content: 'Need two drivers for the Saturday away game.',
    type: 'text',
    category: 'Logistics',
    isOfficial: true,
  },
  {
    id: 'm7',
    channelId: 'c2',
    authorId: 'm3',
    createdAt: new Date().toISOString(),
    content: 'Looking for volunteer help with snack shack this week.',
    type: 'text',
    category: 'Volunteer',
    isOfficial: false,
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
    missingResponses: [
      { name: 'Luis Romero', status: 'Not responded' },
      { name: 'Kai Brooks', status: 'No' },
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
    missingResponses: [
      { name: 'Elliot Shaw', status: 'Not responded' },
      { name: 'Maya Ortiz', status: 'No' },
    ],
  },
  {
    id: 'e3',
    title: 'Skills clinic',
    location: 'South Training Facility',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    notes: 'Optional extra reps. Bring your glove.',
    rsvps: [{ memberId: 'm1', status: 'Going' }],
    missingResponses: [{ name: 'Riley Knox', status: 'Not responded' }],
  },
];
