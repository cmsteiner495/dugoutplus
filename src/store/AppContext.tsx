import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  channels as seedChannels,
  events as seedEvents,
  members as seedMembers,
  messages as seedMessages,
  replies as seedReplies,
  team as seedTeam,
} from '../data/seed';
import { AnnouncementMessage, Event, Message, Reply, Role, RSVPStatus, Team } from '../models/types';

interface AppState {
  role: Role;
  team: Team;
  members: typeof seedMembers;
  channels: typeof seedChannels;
  messages: Message[];
  replies: Reply[];
  events: Event[];
}

interface AppActions {
  switchRole: (role: Role) => void;
  toggleStaffAuthorized: (memberId: string) => void;
  postAnnouncement: (data: Omit<AnnouncementMessage, 'id' | 'createdAt' | 'confirmations' | 'type'>) => void;
  postMessage: (channelId: string, content: string) => void;
  addReply: (messageId: string, content: string) => void;
  confirmAnnouncement: (messageId: string) => void;
  setRsvp: (eventId: string, status: RSVPStatus) => void;
}

interface AppContextValue extends AppState, AppActions {
  currentMemberId: string;
}

const roleMemberMap: Record<Role, string> = {
  coach: 'm1',
  staff: 'm2',
  parent: 'm4',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('coach');
  const [members, setMembers] = useState(seedMembers);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [replies, setReplies] = useState<Reply[]>(seedReplies);
  const [events, setEvents] = useState<Event[]>(seedEvents);

  const currentMemberId = roleMemberMap[role];

  const switchRole = (nextRole: Role) => setRole(nextRole);

  const toggleStaffAuthorized = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...member, authorized: !member.authorized }
          : member
      )
    );
  };

  const postAnnouncement: AppActions['postAnnouncement'] = (data) => {
    const newAnnouncement: AnnouncementMessage = {
      ...data,
      id: `a-${Date.now()}`,
      createdAt: new Date().toISOString(),
      confirmations: [],
      type: 'announcement',
      category: 'Announcement',
      isOfficial: true,
    };
    setMessages((prev) => [newAnnouncement, ...prev]);
  };

  const postMessage: AppActions['postMessage'] = (channelId, content) => {
    const currentMember = members.find((member) => member.id === currentMemberId);
    const isOfficial = role === 'coach' || (role === 'staff' && currentMember?.authorized);
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      channelId,
      authorId: currentMemberId,
      createdAt: new Date().toISOString(),
      content,
      type: 'text',
      category: 'General',
      isOfficial,
    };
    setMessages((prev) => [newMessage, ...prev]);
  };

  const addReply: AppActions['addReply'] = (messageId, content) => {
    const newReply: Reply = {
      id: `r-${Date.now()}`,
      messageId,
      authorId: currentMemberId,
      createdAt: new Date().toISOString(),
      content,
    };
    setReplies((prev) => [...prev, newReply]);
  };

  const confirmAnnouncement: AppActions['confirmAnnouncement'] = (messageId) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || message.type !== 'announcement') {
          return message;
        }
        const announcement = message as AnnouncementMessage;
        if (announcement.confirmations.includes(currentMemberId)) {
          return announcement;
        }
        return {
          ...announcement,
          confirmations: [...announcement.confirmations, currentMemberId],
        };
      })
    );
  };

  const setRsvp: AppActions['setRsvp'] = (eventId, status) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) {
          return event;
        }
        const existing = event.rsvps.find((rsvp) => rsvp.memberId === currentMemberId);
        const nextRsvps = existing
          ? event.rsvps.map((rsvp) =>
              rsvp.memberId === currentMemberId ? { ...rsvp, status } : rsvp
            )
          : [...event.rsvps, { memberId: currentMemberId, status }];
        return { ...event, rsvps: nextRsvps };
      })
    );
  };

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      team: seedTeam,
      members,
      channels: seedChannels,
      messages,
      replies,
      events,
      currentMemberId,
      switchRole,
      toggleStaffAuthorized,
      postAnnouncement,
      postMessage,
      addReply,
      confirmAnnouncement,
      setRsvp,
    }),
    [role, members, messages, replies, events, currentMemberId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
