<template>
  <div>
    <div class="text-xs flex flex-col gap-2">
      <NuxtLink
        class="hover:underline"
        :to="localePath('/about')"
        @click.native="$track('footer', { action: 'about' })"
        >{{ $t('footer.about') }}</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/organize')"
        @click.native="$track('footer', { action: 'organize' })"
        >For Organizers</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/promoter')"
        @click.native="$track('footer', { action: 'promoter' })"
        >For Promoters</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/partners')"
        @click.native="$track('footer', { action: 'partners' })"
        >Partners</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/dance')"
        @click.native="$track('footer', { action: 'dance' })"
      >
        {{ $t('nav.dance') }}
      </NuxtLink>
      <NuxtLink
        class="hover:underline"
        :to="localePath('/blog')"
        @click.native="$track('footer', { action: 'blog' })"
        >Blog</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/get-involved')"
        @click.native="$track('footer', { action: 'get-involved' })"
      >
        {{ $t('footer.getInvolved') }}
      </NuxtLink>

      <NuxtLink
        class="hover:underline"
        :to="localePath('/nfc')"
        @click.native="$track('footer', { action: 'wedance-card' })"
        >WeDance Card</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/reviews')"
        @click.native="$track('footer', { action: 'local-tips' })"
        >Local Tips</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/where-can-i-dance')"
        @click.native="$track('footer', { action: 'where-can-i-dance' })"
        >Where can I dance?</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/coc')"
        @click.native="$track('footer', { action: 'coc' })"
        >{{ $t('footer.coc') }}</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/impressum')"
        @click.native="$track('footer', { action: 'impressum' })"
        >{{ $t('footer.impressum') }}</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/terms')"
        @click.native="$track('footer', { action: 'terms' })"
        >{{ $t('footer.terms') }}</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/privacy')"
        @click.native="$track('footer', { action: 'privacy' })"
        >{{ $t('footer.privacy') }}</NuxtLink
      >
      <NuxtLink
        class="hover:underline"
        :to="localePath('/support')"
        @click.native="$track('footer', { action: 'support' })"
        >{{ $t('footer.support') }}</NuxtLink
      >
      <NuxtLink
        to="/news"
        class="hover:underline"
        @click.native="$track('footer', { action: 'news' })"
        >v{{ version }} – What's new?</NuxtLink
      >
    </div>
    <div class="mt-4 text-xs">
      © WeDance 2025 – {{ $t('footer.copyright') }}
    </div>
  </div>
</template>

<script>
import { version } from '~/package.json'

export default {
  setup() {
    return {
      version,
    }
  },
}
</script>
