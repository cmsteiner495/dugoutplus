export type Role = 'coach' | 'staff' | 'parent';

export interface Team {
  id: string;
  name: string;
  season: string;
}

export interface Member {
  id: string;
  name: string;
  role: Role;
  authorized?: boolean;
  permissions?: string[];
  emergencyContactOnFile?: boolean;
}

export type ChannelType = 'Announcements' | 'Team Chat' | 'Logistics';

export type MessageCategory = 'Logistics' | 'Announcement' | 'General' | 'Volunteer';

export type EventType = 'Practice' | 'Game' | 'Other';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  isOfficial?: boolean;
}

export interface MessageBase {
  id: string;
  channelId: string;
  authorId: string;
  createdAt: string;
  content: string;
  type: 'text' | 'announcement';
  category?: MessageCategory;
  isOfficial?: boolean;
  resolved?: boolean;
}

export interface AnnouncementMessage extends MessageBase {
  type: 'announcement';
  title: string;
  tag?: string;
  pinned: boolean;
  requiresConfirmation: boolean;
  confirmations: string[];
  attachments?: string[];
  acknowledgedBy?: string[];
}

export type Message = MessageBase | AnnouncementMessage;

export interface Reply {
  id: string;
  messageId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type RSVPStatus = 'Going' | 'Maybe' | 'No';

export interface RSVP {
  memberId: string;
  status: RSVPStatus;
}

export type MissingStatus = 'Not responded' | 'No';

export interface MissingResponse {
  name: string;
  status: MissingStatus;
}

export interface Event {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  type: EventType;
  notes?: string;
  coachNotes?: string;
  whatToBring?: string[];
  rsvps: RSVP[];
  missingResponses?: MissingResponse[];
}

export interface VolunteerNeed {
  id: string;
  title: string;
  description: string;
  eventId?: string;
  slotsNeeded: number;
  volunteers: string[];
  declinedBy?: string[];
  status: 'Open' | 'Resolved';
}
