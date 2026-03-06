# WeDance

**Uniting dancers worldwide** — discover events, connect with communities, and grow dance culture in your city.

## The Problem

Dancers struggle to find events, classes, and partners nearby. Information is scattered across Facebook groups, Instagram stories, and WhatsApp chats. Organizers have no reliable way to reach their audience, and newcomers don't know where to start.

## What WeDance Does

- **Explore** events and classes by city and dance style (Salsa, Bachata, Kizomba, Zouk, and 170+ more)
- **Connect** with dancers, organizers, and venues near you
- **Share** recommendations, stories, and reviews
- **Organize** events with built-in promotion, RSVPs, and calendar integration
- **Discover** new styles through community-curated content

Available in 10 languages. Works as a PWA on any device.

**[Try it live at wedance.vip](https://wedance.vip)** | [Get Involved](https://wedance.vip/get-involved)

## Tech Stack

- **[Nuxt 2](https://v2.nuxt.com/)** — Vue 2 framework, used as Static Site Generator
- **[Tailwind CSS 3](https://tailwindcss.com/)** — utility-first CSS framework
- **[Firebase](https://firebase.google.com/)** — Firestore database, Authentication, Cloud Functions
- **[Algolia](https://www.algolia.com/)** — search
- **[Mailgun](https://www.mailgun.com/)** — email delivery and tracking
- **[Sentry](https://sentry.io/)** — error monitoring
- **[Netlify](https://netlify.com/)** — CDN, CI and hosting (deploys on each commit)
- **[PostHog](https://posthog.com/)** — product analytics

### Telegram Bot

The `ai/` directory contains **WeDanceBot** — a Telegram bot that helps users find dance events and answers platform questions. Supports Claude, OpenAI, and Ollama as LLM providers.

## Project Structure

```
pages/          # Nuxt pages (routes)
components/     # Vue components (120+)
content/        # Blog posts, dance style info, static content
assets/         # Styles and static assets
ai/             # Telegram bot with LLM integration
docs/           # Documentation site (Docus)
```

## Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) click `Add project`, enter any name, click `Continue`, uncheck `Enable Google Analytics for this project`, click `Continue`.
2. Under `Get started by adding Firebase to your app` click 3d icon (Web), enter name `Web`, uncheck `Firebase Hosting`, click `Register app`, copy generated `firebaseConfig`.
3. Go to `Authentication`, switch to tab `Sign-in method`, click `Email/Password` and enable both triggers (password and email link); enable `Google`.
4. Go to `Cloud Firestore`, click `Create database`, select `Start in test mode`, click `Next`, choose region `eur3`.
5. Transform `firebaseConfig` value (from step 2) to one line JSON. [This tool](https://www.convertjson.com/javascript-object-to-json.htm) might help you.
6. Clone this repository and open the project folder.
7. Copy `.env.example` file to `.env` file and set value of `FIREBASE_CONFIG` to one line JSON you got from step 5.

To activate all services and features see section `Services` below.

## Run locally

1. [Install nvm](https://github.com/nvm-sh/nvm)
2. Run `nvm install 14`
3. Run `nvm use 14`
4. Run `yarn install`
5. Run `yarn dev`

To activate all services and features see section `Services` below.

## Deploy

Watch [video tutorial](https://www.loom.com/share/408d3aca33dd426885beb8ef90289972).

Read [How to deploy on Netlify?](https://nuxtjs.org/faq/netlify-deployment/).

- Push your branch to github.
- Sign in to [Netlify](https://netlify.com/).
- Click `New site from Git`.
- Choose `GitHub` and select your repository.
- Select your branch.
- Build command: `yarn build`.
- Publish directory: `dist`.
- Click `Advanced build settings` and empty value for `Functions directory` as we don't use Netlify functions.
- Click `New variable` and add all keys and values from `.env` file (`URL` and [some other variables](https://docs.netlify.com/configure-builds/environment-variables/) are set automatically).
- Click `Deploy site`.

To activate all services and features see section `Services` below.

## Services

Activate only those services that you need. In most cases you don't need all of them.

### Authentication for custom domains

- Go to `Authentication`, switch to tab `Sign-in method` find section `Authorized domains`, click `Add domain` and add new.

### City auto-complete

- Enable [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com), [Places API](https://console.cloud.google.com/marketplace/product/google/places-backend.googleapis.com) and [Geocoding API](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com) in the Google Cloud Console.
- [Enable Billing](https://console.cloud.google.com/project/_/billing/enable) on the Google Cloud Project.

### Mailgun

- Create [mailgun](https://www.mailgun.com/) account.
- Create domain and setup DNS.
- Create API key.
- Enable Pub/Sub, Scheduler, Build API in [Google Cloud Console](https://console.cloud.google.com/apis/library).
- Install [Firebase-CLI](https://firebase.google.com/docs/cli) locally and init project with `firebase init`.
- Add mailgun confguration to Firebase:

```bash
firebase functions:config:set mailgun.key="" mailgun.domain="" mailgun.host=""
```

- Deploy Firebase with `firebase deploy`.
- Setup hooks in Mailgun.
- Create firestore index (send test mail, see logs, find link to create index).

## Contributing

We encourage you to contribute to WeDance!

We expect contributors to abide by our underlying [code of conduct](https://wedance.vip/coc). All conversations and discussions on GitHub (issues, pull requests) and across [wedance.vip](https://wedance.vip/) must be respectful and harassment-free.

### Reporting Issues

[See issues](https://github.com/we-dance/platform/issues) or [Create an issue](https://github.com/we-dance/platform/issues/new/choose).

### How to contribute

1. Setup project locally (see Setup above).
2. Make changes to code.
3. Checkout new branch and commit your changes.
4. Deploy to Netlify.
5. Create a Pull Request and include a link to your Netlify demo.

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Run `yarn lint` before committing.

### Tools

**Code Editor:** [VSCode](https://code.visualstudio.com/) with [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur), [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).

**Browser:** [Chrome](https://chrome.google.com/) with [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd).

[Join our team on Slack](https://wedance.vip/slack)
