<template>
  <div class="border-t-2 border-primary">
    <TBanner
      v-model="releaseV4"
      name="releaseV4"
      desktop="See what's coming soon"
      mobile="See what's coming soon"
      action="Learn More"
      to="/wedance-v4"
    />

    <div
      class="font-sans leading-normal tracking-normal antialiased min-h-screen mx-auto max-w-2xl border-r"
    >
      <TAuthPopup />

      <div
        v-if="isMenuOpen"
        class="fixed w-full h-full top-0 left-0 bg-black opacity-50 z-50"
        @click="isMenuOpen = false"
      />
      <transition name="slide">
        <div
          v-if="isMenuOpen"
          class="bg-white fixed left-0 w-56 bottom-0 top-0 z-50 shadow-lg md:hidden"
        >
          <MainNavigation :uid="uid" :username="username" />
        </div>
      </transition>

      <header
        class="md:hidden flex p-2 gap-2 justify-start items-center border-b"
      >
        <THamburger v-model="isMenuOpen" class="mt-2 " />
        <router-link to="/">
          <TIcon name="logo-horizontal-dark" />
        </router-link>
        <div class="flex-grow"></div>
        <TQrCodeButton label="Share" />
      </header>

      <div class="flex">
        <MainNavigation
          :uid="uid"
          :username="username"
          class="hidden md:block w-52 shrink-0"
        />
        <nuxt class="min-w-0 w-full" />
      </div>
    </div>
  </div>
</template>

<script>
import features from 'platform-detect'
import ls from 'local-storage'
import { ref, watch } from '@nuxtjs/composition-api'
import { version } from '../package.json'
import { useAuth } from '~/use/auth'
import { useApp } from '~/use/app'
import { analytics } from '~/plugins/firebase'

export default {
  name: 'DefaultLayout',
  props: {
    noContainer: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isMenuOpen: false,
    isSearchShown: false,
    query: '',
  }),
  computed: {
    isHome() {
      return this.$route.name === 'index'
    },
  },
  watch: {
    '$route.path': 'onPageView',
    'profile.username': 'onProfileLoad',
    loading: 'checkOnboarding',
  },
  mounted() {
    this.onPageView()

    this.checkOnboarding()
  },
  methods: {
    checkOnboarding() {
      if (!this.profileLoaded) {
        return
      }

      if (this.uid && !this.profile?.username) {
        this.$router.push('/onboarding')
      }
    },
    showSearch() {
      this.isSearchShown = true
    },
    onProfileLoad() {
      if (process.server) return

      const name = this.account?.name || this.profile?.name || ''
      const names = name.split(' ')

      const contact = {
        email: this.account?.email,
        phone: this.account?.phone,
        uid: this.uid,
        username: this.profile?.username,
        firstname: names[0] || '',
        lastname: names[1] || '',
        community: this.getCity(this.profile?.place),
        facebook: this.profile?.facebook || '',
        instagram: this.profile?.instagram || '',
        telegram: this.profile?.telegram || '',
        type: this.profile?.type || '',
        partner: this.profile?.partner || '',
        teacher: this.profile?.teacher || '',
      }

      const _hsq = (window._hsq = window._hsq || [])
      _hsq.push(['identify', contact])

      this.$posthog.identify(this.uid, {
        email: contact.email,
        username: contact.username,
        type: contact.type,
        community: contact.community,
        gender: this.profile?.gender,
      })

      this.$sentry.setUser({
        email: contact.email,
        username: contact.username,
        id: contact.uid,
      })

      if (analytics) {
        analytics.setUserId(contact.uid)
        analytics.setUserProperties({
          community: contact.community,
          type: this.profile?.type,
          gender: this.profile?.gender,
          visibility: this.profile?.visibility,
          partner: this.profile?.partner,
          teacher: this.profile?.teacher,
        })
      }
    },
    onPageView() {
      this.isMenuOpen = false

      setTimeout(() => {
        const _hsq = (window._hsq = window._hsq || [])
        _hsq.push(['setPath', this.$route.path])
        _hsq.push(['trackPageView'])
        if (window.HubSpotConversations) {
          window.HubSpotConversations.widget.refresh()
        }

        const screen = {
          app_name: features.pwa ? 'pwa' : 'web',
          screen_name: document.title,
          screen_view: this.$route.name,
          app_version: version,
        }

        this.$track('page_view')
        this.$track('screen_view', screen)
      }, 500)
    },
  },
  head() {
    return this.$nuxtI18nSeo()
  },
  setup() {
    const {
      uid,
      account,
      profile,
      username,
      isAdmin,
      profileLoaded,
      updateProfile,
      loading,
    } = useAuth()
    const { getCity } = useApp()

    const bannerNps = ref(ls('bannerNps'))
    watch(bannerNps, (val) => {
      updateProfile({ bannerNps: val })
      ls('bannerNps', val)
    })

    const bannerNews = ref(ls('bannerNews'))
    watch(bannerNews, (val) => {
      updateProfile({ bannerNews: val })
      ls('bannerNews', val)
    })

    const releaseV4 = ref(ls('releaseV4'))
    watch(releaseV4, (val) => {
      updateProfile({ releaseV4: val })
      ls('releaseV4', val)
    })

    return {
      bannerNps,
      bannerNews,
      releaseV4,
      username,
      account,
      profile,
      uid,
      isAdmin,
      getCity,
      loading,
      profileLoaded,
    }
  },
}
</script>
