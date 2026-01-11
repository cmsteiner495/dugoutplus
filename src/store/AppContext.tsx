import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  channels as seedChannels,
  events as seedEvents,
  members as seedMembers,
  messages as seedMessages,
  replies as seedReplies,
  team as seedTeam,
  volunteerNeeds as seedVolunteerNeeds,
} from '../data/mockTeamData';
import {
  AnnouncementMessage,
  Event,
  Message,
  Reply,
  Role,
  RSVPStatus,
  Team,
  VolunteerNeed,
} from '../models/types';
import { storage } from '../lib/storage';

interface AppState {
  role: Role;
  team: Team;
  members: typeof seedMembers;
  channels: typeof seedChannels;
  messages: Message[];
  replies: Reply[];
  events: Event[];
  volunteerNeeds: VolunteerNeed[];
  eventChecklist: Record<string, Record<string, boolean>>;
  draftMessages: Record<string, string>;
  lastSeenByChannel: Record<string, string>;
}

interface AppActions {
  switchRole: (role: Role) => void;
  toggleStaffAuthorized: (memberId: string) => void;
  postAnnouncement: (data: Omit<AnnouncementMessage, 'id' | 'createdAt' | 'confirmations' | 'type'>) => void;
  postMessage: (channelId: string, content: string) => void;
  addReply: (messageId: string, content: string) => void;
  confirmAnnouncement: (messageId: string) => void;
  acknowledgeAnnouncement: (messageId: string) => void;
  toggleAnnouncementPin: (messageId: string) => void;
  toggleThreadResolved: (messageId: string) => void;
  setRsvp: (eventId: string, status: RSVPStatus) => void;
  toggleChecklistItem: (eventId: string, item: string) => void;
  addVolunteerNeed: (need: Omit<VolunteerNeed, 'id' | 'volunteers' | 'status'>) => void;
  volunteerForNeed: (needId: string) => void;
  declineVolunteerNeed: (needId: string) => void;
  resolveVolunteerNeed: (needId: string) => void;
  setDraftMessage: (channelId: string, content: string) => void;
  clearDraftMessage: (channelId: string) => void;
  markChannelSeen: (channelId: string) => void;
  markAllChannelsSeen: () => void;
  getUnreadCount: (channelId: string) => number;
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

const LAST_SEEN_STORAGE_KEY = 'dugout:lastSeenByChannel';
const VOLUNTEER_STORAGE_KEY = 'dugout:volunteerNeeds';
const CHECKLIST_STORAGE_KEY = 'dugout:eventChecklist';

const initialLastSeen = () => {
  const fallbackTime = new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString();
  return Object.fromEntries(seedChannels.map((channel) => [channel.id, fallbackTime]));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('coach');
  const [members, setMembers] = useState(seedMembers);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [replies, setReplies] = useState<Reply[]>(seedReplies);
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [volunteerNeeds, setVolunteerNeeds] = useState<VolunteerNeed[]>(seedVolunteerNeeds);
  const [eventChecklist, setEventChecklist] = useState<Record<string, Record<string, boolean>>>(
    {}
  );
  const [draftMessages, setDraftMessages] = useState<Record<string, string>>({});
  const [lastSeenByChannel, setLastSeenByChannel] = useState<Record<string, string>>(
    initialLastSeen
  );

  useEffect(() => {
    const loadState = async () => {
      const [lastSeenRaw, volunteerRaw, checklistRaw] = await Promise.all([
        storage.getItem(LAST_SEEN_STORAGE_KEY),
        storage.getItem(VOLUNTEER_STORAGE_KEY),
        storage.getItem(CHECKLIST_STORAGE_KEY),
      ]);
      if (lastSeenRaw) {
        setLastSeenByChannel(JSON.parse(lastSeenRaw));
      }
      if (volunteerRaw) {
        setVolunteerNeeds(JSON.parse(volunteerRaw));
      }
      if (checklistRaw) {
        setEventChecklist(JSON.parse(checklistRaw));
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    storage.setItem(LAST_SEEN_STORAGE_KEY, JSON.stringify(lastSeenByChannel));
  }, [lastSeenByChannel]);

  useEffect(() => {
    storage.setItem(VOLUNTEER_STORAGE_KEY, JSON.stringify(volunteerNeeds));
  }, [volunteerNeeds]);

  useEffect(() => {
    storage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(eventChecklist));
  }, [eventChecklist]);

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
      acknowledgedBy: [],
      resolved: false,
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
      resolved: false,
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

  const acknowledgeAnnouncement: AppActions['acknowledgeAnnouncement'] = (messageId) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || message.type !== 'announcement') {
          return message;
        }
        const announcement = message as AnnouncementMessage;
        const acknowledgements = announcement.acknowledgedBy ?? [];
        if (acknowledgements.includes(currentMemberId)) {
          return announcement;
        }
        return {
          ...announcement,
          acknowledgedBy: [...acknowledgements, currentMemberId],
        };
      })
    );
  };

  const toggleAnnouncementPin: AppActions['toggleAnnouncementPin'] = (messageId) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || message.type !== 'announcement') {
          return message;
        }
        const announcement = message as AnnouncementMessage;
        return { ...announcement, pinned: !announcement.pinned };
      })
    );
  };

  const toggleThreadResolved: AppActions['toggleThreadResolved'] = (messageId) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, resolved: !message.resolved } : message
      )
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

  const toggleChecklistItem: AppActions['toggleChecklistItem'] = (eventId, item) => {
    setEventChecklist((prev) => {
      const eventItems = prev[eventId] ?? {};
      return {
        ...prev,
        [eventId]: {
          ...eventItems,
          [item]: !eventItems[item],
        },
      };
    });
  };

  const addVolunteerNeed: AppActions['addVolunteerNeed'] = (need) => {
    const newNeed: VolunteerNeed = {
      ...need,
      id: `v-${Date.now()}`,
      volunteers: [],
      status: 'Open',
    };
    setVolunteerNeeds((prev) => [newNeed, ...prev]);
  };

  const volunteerForNeed: AppActions['volunteerForNeed'] = (needId) => {
    setVolunteerNeeds((prev) =>
      prev.map((need) => {
        if (need.id !== needId) {
          return need;
        }
        if (need.volunteers.includes(currentMemberId) || need.status === 'Resolved') {
          return need;
        }
        if (need.volunteers.length >= need.slotsNeeded) {
          return need;
        }
        return {
          ...need,
          volunteers: [...need.volunteers, currentMemberId],
        };
      })
    );
  };

  const declineVolunteerNeed: AppActions['declineVolunteerNeed'] = (needId) => {
    setVolunteerNeeds((prev) =>
      prev.map((need) => {
        if (need.id !== needId) {
          return need;
        }
        const declinedBy = need.declinedBy ?? [];
        if (declinedBy.includes(currentMemberId)) {
          return need;
        }
        return {
          ...need,
          declinedBy: [...declinedBy, currentMemberId],
        };
      })
    );
  };

  const resolveVolunteerNeed: AppActions['resolveVolunteerNeed'] = (needId) => {
    setVolunteerNeeds((prev) =>
      prev.map((need) => (need.id === needId ? { ...need, status: 'Resolved' } : need))
    );
  };

  const setDraftMessage: AppActions['setDraftMessage'] = (channelId, content) => {
    setDraftMessages((prev) => ({ ...prev, [channelId]: content }));
  };

  const clearDraftMessage: AppActions['clearDraftMessage'] = (channelId) => {
    setDraftMessages((prev) => {
      const { [channelId]: _, ...rest } = prev;
      return rest;
    });
  };

  const markChannelSeen: AppActions['markChannelSeen'] = (channelId) => {
    setLastSeenByChannel((prev) => ({
      ...prev,
      [channelId]: new Date().toISOString(),
    }));
  };

  const markAllChannelsSeen: AppActions['markAllChannelsSeen'] = () => {
    const now = new Date().toISOString();
    setLastSeenByChannel(
      Object.fromEntries(seedChannels.map((channel) => [channel.id, now]))
    );
  };

  const getUnreadCount: AppActions['getUnreadCount'] = (channelId) => {
    const lastSeen = lastSeenByChannel[channelId] ?? '';
    return messages.filter(
      (message) => message.channelId === channelId && message.createdAt > lastSeen
    ).length;
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
      volunteerNeeds,
      eventChecklist,
      draftMessages,
      lastSeenByChannel,
      currentMemberId,
      switchRole,
      toggleStaffAuthorized,
      postAnnouncement,
      postMessage,
      addReply,
      confirmAnnouncement,
      acknowledgeAnnouncement,
      toggleAnnouncementPin,
      toggleThreadResolved,
      setRsvp,
      toggleChecklistItem,
      addVolunteerNeed,
      volunteerForNeed,
      declineVolunteerNeed,
      resolveVolunteerNeed,
      setDraftMessage,
      clearDraftMessage,
      markChannelSeen,
      markAllChannelsSeen,
      getUnreadCount,
    }),
    [
      role,
      members,
      messages,
      replies,
      events,
      volunteerNeeds,
      eventChecklist,
      draftMessages,
      lastSeenByChannel,
      currentMemberId,
    ]
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
