import { orderBy } from 'lodash'
import firebase from 'firebase/app'
import 'firebase/firestore'

export const app = {
  name: 'WeDance',
  description: 'Discover dance events near you',
  social: {
    twitter: 'WeDancePlatform',
  },
  url: 'https://wedance.vip',
  author: 'WeDance',
  cover: '/cover/cover.png',
}

if (!process.env.FIREBASE_CONFIG) {
  throw new Error('Missing Firebase Configuration')
}

const firebaseEnv = {
  config: JSON.parse(process.env.FIREBASE_CONFIG),
}

let sitemapApp
if (!firebase.apps.some((app) => app.name === 'sitemap')) {
  sitemapApp = firebase.initializeApp(firebaseEnv.config, 'sitemap')
} else {
  sitemapApp = firebase.app('sitemap')
}

const locales = [
  { code: 'en', iso: 'en-US', name: 'English', file: 'en.yml' },
  { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.yml' },
  { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.yml' },
  { code: 'fr', iso: 'fr-FR', name: 'Français', file: 'fr.yml' },
  { code: 'it', iso: 'it-IT', name: 'Italiano', file: 'it.yml' },
  { code: 'pl', iso: 'pl-PL', name: 'Polski', file: 'pl.yml' },
  { code: 'pt', iso: 'pt-PT', name: 'Português', file: 'pt.yml' }, // Portugal
  { code: 'ro', iso: 'ro-RO', name: 'Română', file: 'ro.yml' },
  { code: 'tr', iso: 'tr-TR', name: 'Türkçe', file: 'tr.yml' },
  { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.yml' },
  { code: 'sr', iso: 'sr-RS', name: 'Српски', file: 'sr.yml' }, // Serbia
]

if (process.env.DEBUG_I18N) {
  locales.push({ code: 'debug', name: 'DEBUG', file: 'debug.yml' })
}

let routesCache = []

const exclude = [
  '/chat',
  '/search',
  '/community',
  '/lists',
  '/lists',
  '/bookmarks',
  '/nopassword',
  '/onboarding',
  '/register',
  '/settings',
  '/signin',
  '/signin-email',
  '/signout',
  '/demo',
  '/admin',
]

function mapExcludePaths(paths) {
  return paths.map((path) => {
    return new RegExp(`${path}`)
  })
}

async function getRoutes() {
  if (routesCache.length) {
    return routesCache
  }

  const db = sitemapApp.firestore()

  const routes = [
    {
      url: `/`,
      changefreq: 'daily',
      priority: 1,
    },
    {
      url: '/about',
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: '/get-involved',
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: '/foundation',
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: '/platform',
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: '/wedance-community',
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: '/partners',
      changefreq: 'monthly',
      priority: 0.5,
    },
  ]

  const questionsRef = await db
    .collection('stories')
    .where('type', '==', 'ask-for-recommendations')
    .get()

  const questions = questionsRef.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))

  for (const question of questions) {
    routes.push({
      url: `/stories/${question.id}`,
      changefreq: 'weekly',
      priority: 0.9,
    })
  }

  const eventsRef = await db
    .collection('posts')
    .where('startDate', '>=', +new Date())
    .get()

  const events = eventsRef.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))

  for (const event of events) {
    routes.push({
      url: `/events/${event.id}`,
      changefreq: 'weekly',
      priority: 0.8,
    })
  }

  const citiesRef = await db
    .collection('profiles')
    .where('type', '==', 'City')
    .get()

  const cities = orderBy(
    citiesRef.docs
      .map((doc) => doc.data())
      .filter((c) => c.username && c.viewsCount),
    'viewsCount',
    'desc'
  )

  for (const profile of cities) {
    let city = profile.username

    if (city === 'Travel') {
      city = 'global'
    }

    routes.push({
      url: `/explore/${city}`,
      changefreq: 'daily',
      priority: 1,
    })

    routes.push({
      url: `/explore/${city}/classes`,
      changefreq: 'daily',
      priority: 0.7,
    })

    routes.push({
      url: `/explore/${city}/groups`,
      changefreq: 'daily',
      priority: 0.7,
    })

    routes.push({
      url: `/explore/${city}/tips`,
      changefreq: 'daily',
      priority: 0.7,
    })

    for (const style of ['Salsa', 'Bachata', 'Kizomba', 'Zouk', 'Afrobeats']) {
      routes.push({
        url: `/explore/${city}?style=${style}`,
        changefreq: 'daily',
        priority: 0.7,
      })
    }
  }

  routesCache = routes

  return routes
}

export default {
  target: 'static',
  ssr: false,
  generate: {
    fallback: true,
    exclude: mapExcludePaths(exclude),
    // routes() {
    //   return getRoutes().then((routes) => routes.map((route) => route.url))
    // },
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#210309' },
  loadingIndicator: {
    name: 'chasing-dots',
    color: '#210309',
  },
  components: [
    '~/components',
    '~/components/global',
    '~/components/Actions',
    '~/components/Card',
    '~/components/Formatters',
    '~/components/TInput',
  ],
  /*
   ** Global CSS
   */
  css: [
    '@/assets/css/tailwind.css',
    '@/assets/css/typography.css',
    '@/assets/css/vendors.scss',
    '@/assets/css/animation.css',
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/firebase',
    '~/plugins/router',
    '~/plugins/directives',
    '~/plugins/vue-tailwind',
    '~/plugins/vue-datepicker',
    { src: '~/plugins/posthog', mode: 'client' },
    { src: '~/plugins/stripe', mode: 'client' },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    // Doc: https://composition-api.nuxtjs.org/
    '@nuxtjs/composition-api',
    '@nuxtjs/google-fonts',
    '@nuxt/postcss8',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    '@nuxtjs/sentry',
    '@nuxtjs/robots',
    '@nuxtjs/device',
    'nuxt-i18n',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxtjs/toast',
  ],
  googleFonts: {
    display: 'swap',
    families: {
      Lato: true,
      Montserrat: true,
      'Noto Sans': true,
    },
  },
  toast: {
    position: 'top-center',
    duration: 2000,
  },
  purgeCSS: {
    enabled: false,
  },
  pwa: {
    workbox: {
      offline: true,
      dev: false,
      pagesURLPattern: '/.*',
    },
    meta: {
      name: app.name,
      description: app.description,
      ogHost: app.url,
      ogImage: app.cover,
      nativeUI: true,
      twitterSite: '@' + app.social.twitter,
    },
    manifest: {
      name: app.name,
      short_name: app.name,
      start_url: '/?standalone=true',
      background_color: '#3C3348',
      lang: 'en',
    },
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: ['date-fns'],
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
    loaders: {
      vue: {
        prettify: false,
      },
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.resolve.alias.vue = 'vue/dist/vue.common'

      const svgRule = config.module.rules.find((rule) => rule.test.test('.svg'))

      svgRule.test = /\.(png|jpe?g|gif|webp)$/

      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        ],
      })

      config.module.rules.push({
        test: /\.yml$/,
        use: 'js-yaml-loader',
      })
    },
  },
  env: {
    app,
    firebase: firebaseEnv,
    analyticsEnabled: Number(process.env.ANALYTICS_ENABLED),
    analyticsDebug: Number(process.env.ANALYTICS_DEBUG),
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  robots: [
    {
      UserAgent: '*',
      Allow: '/',
    },
    {
      UserAgent: '*',
      Disallow: '/settings',
    },
    {
      UserAgent: '*',
      Disallow: '/admin',
    },
    {
      UserAgent: '*',
      Disallow: '/signin',
    },
  ],
  sitemap: {
    hostname: app.url,
    exclude,
    routes: async () => {
      return await getRoutes()
    },
    i18n: true,
  },
  i18n: {
    seo: true,
    locales,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales/',
    vueI18n: {
      fallbackLocale: process.env.DEBUG_I18N ? 'debug' : 'en',
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'en',
      alwaysRedirect: true,
    },
  },
  image: {
    provider: 'static',
  },
  watchers: {
    webpack: {
      ignored: /(node_modules)|(.git)/,
    },
  },
}
