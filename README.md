# Dugout (Expo MVP)

Mobile-first MVP for youth baseball team management and structured communications.

## Run

```bash
npm install
npm run start
```

To clear the Expo cache:

```bash
npm run start:clear
```

> Tip: Use `npx expo install` for Expo-managed packages to keep versions aligned.

## Project structure

```
/src
  /assets        Team logo + assets wrapper
  /components    Feature components + UI primitives
  /data          Mock seed data
  /models        TypeScript types
  /screens       Home, Schedule, Chat, Roster, More
  /store         Context state + actions
  /theme         Design tokens
```

## Notes

- Role switcher in the header enables demo access for Coach, Staff, Parent.
- Announcements are scoped to the official channel and support confirmations and thread replies.
- Staff authorization toggles are available to the Coach role on the roster screen.
