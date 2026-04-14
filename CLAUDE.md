## WeDance v3

Community platform that unites dancers — event discovery, classes, profiles, recommendations. Live at [wedance.vip](https://wedance.vip).

### Stack

- **Frontend**: Nuxt 2 (Vue 2), Tailwind CSS 3, Composition API
- **Backend**: Firebase (Firestore, Auth, Cloud Functions v1)
- **Search**: Algolia
- **Payments**: Stripe
- **Email**: Mailgun
- **Analytics**: PostHog (project 44610, US instance)
- **Monitoring**: Sentry
- **Hosting**: Netlify (auto-deploy on push)
- **Node**: 14.17.6 (see .nvmrc)
- **Package manager**: yarn

### Commands

```bash
yarn dev          # Dev server (SPA mode)
yarn build        # Lint + generate static site
yarn test         # Run Jest tests
yarn lint         # ESLint
```

### Firebase

- Project: `wedance-4abe3`
- Functions: `services/firebase/`
- Deploy functions: `cd services/firebase && npm run deploy`
- Emulators: `firebase emulators:start`

### Structure

```
pages/              # 96 route files
components/         # 187 Vue components
use/                # 28 composables (auth, events, profiles, etc.)
services/firebase/  # Cloud Functions (TypeScript)
ai/                 # Telegram bot (Claude/OpenAI)
content/            # Markdown content (blog, styles, pages)
locales/            # i18n (10 languages)
plugins/            # Firebase, PostHog, Stripe, etc.
```

### Key modules

- Events: discovery, creation, RSVP, series, import (Facebook, iCal, Instagram)
- Profiles: dancer profiles, city pages, onboarding
- Posts: community stories, recommendations
- Admin: dashboard, analytics, user management
- AI bot: `ai/scripts/bot.ts` — Telegram bot for event queries

### Deployment

- Netlify: `dist/` directory, `yarn build` command
- Firebase functions: separate deploy via `services/firebase/`
- Config: `.env` for Firebase client config, `services/firebase/.env` for server secrets

### Org

Governance and ops docs: `~/Orgs/WeDance`
