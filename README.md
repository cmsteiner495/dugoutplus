# Dugout (Expo MVP)

Mobile-first MVP for youth baseball team management and structured communications.

## Run

```bash
npm install
npx expo start
```

## Project structure

```
/src
  /assets        Team logo + assets wrapper
  /components    Reusable UI pieces (Card, Chip, TeamHeader, etc.)
  /data          Mock seed data
  /models        TypeScript types
  /screens       Home, Schedule, Chat, Roster, More
  /store         Context state + actions
  /utils         Theme + helpers
```

## Notes

- Role switcher in the header enables demo access for Coach, Staff, Parent.
- Announcements are scoped to the official channel and support confirmations and thread replies.
- Staff authorization toggles are available to the Coach role on the roster screen.
