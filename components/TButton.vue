<template>
  <button
    v-if="!allowGuests && !uid"
    type="button"
    :title="$t('TButton.title', { action: title })"
    :class="classes"
    @click="openAuthPopup()"
  >
    <slot>
      <TIcon v-if="icon" :size="iconSize" :name="icon" />
    </slot>
    <span v-if="label !== false">{{ label }}</span>
  </button>
  <a
    v-else-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
    :title="title"
    v-on="$listeners"
    @click="capture()"
  >
    <slot>
      <TIcon v-if="icon" :size="iconSize" :name="icon" />
    </slot>
    <span v-if="label !== false">{{ label }}</span>
  </a>
  <NuxtLink
    v-else-if="to"
    :title="title"
    :class="classes"
    :to="to"
    v-on="$listeners"
    @click.native="capture()"
  >
    <slot>
      <TIcon v-if="icon" :size="iconSize" :name="icon" />
    </slot>
    <span v-if="label !== false">{{ label }}</span>
  </NuxtLink>
  <button
    v-else
    :type="xtype"
    :title="title"
    :class="classes"
    v-on="$listeners"
    @click="capture()"
  >
    <slot>
      <TIcon v-if="icon" :size="iconSize" :name="icon" />
    </slot>
    <span v-if="label !== false">{{ label }}</span>
  </button>
</template>

<script>
import TIcon from '~/components/TIcon'
import { useAuth } from '~/use/auth'

export default {
  components: {
    TIcon,
  },
  props: {
    track: {
      type: Object,
      default: null,
    },
    allowGuests: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'continue',
    },
    icon: {
      type: String,
      default: '',
    },
    iconSize: {
      type: String,
      default: '4',
    },
    to: {
      type: [String, Object],
      default: '',
    },
    type: {
      type: String,
      default: 'simple',
    },
    xtype: {
      type: String,
      default: 'button',
    },
    variant: {
      type: String,
      default: '',
    },
    padding: {
      type: String,
      default: 'px-4 py-2',
    },
    label: {
      type: [String, Number, Boolean],
      default: false,
    },
    color: {
      type: String,
      default: '',
    },
    targetAction: {
      type: Object,
      default: null,
    },
  },
  computed: {
    href() {
      if (!this.to) {
        return ''
      }
      if (this.to.includes('://')) {
        return this.to
      }
      if (this.to.includes('mailto:')) {
        return this.to
      }
      if (this.to.includes('tel:')) {
        return this.to
      }
      return ''
    },
    tracking() {
      return {
        ...this.track,
        title: this.title,
        label: this.label,
        href: this.href,
        to: this.to,
      }
    },
    classes() {
      const xbase =
        'flex justify-start items-center font-medium gap-1 cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
        this.padding

      const xrounded =
        xbase + ' text-sm leading-4 justify-center shadow rounded-full'

      const primaryColor =
        ' bg-dark text-white border-gray-900 hover:bg-gray-800'
      const successColor =
        ' bg-green-500 text-white border-green-500 hover:bg-green-800'
      const dangerColor =
        ' bg-red-500 text-white border-red-500 hover:bg-red-800'
      const baseColor =
        ' bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
      const toggledColor =
        ' text-primary border-primary bg-red-100 hover:bg-red-200'

      const map = {
        round: xrounded + baseColor,
        simple: xrounded + baseColor,
        base: xrounded + baseColor,
        secondary: xrounded + baseColor,
        xs: xrounded + baseColor,
        icon: 'rounded-full hover:text-primary',
        toggled: xrounded + toggledColor,
        primary: xrounded + primaryColor,
        tertiery:
          xbase +
          'text-sm leading-4 justify-center underline hover:no-underline',
        success: xrounded + successColor,
        danger: xrounded + dangerColor,
        link: 'underline hover:no-underline font-semibold',
        context: xbase + ' w-full hover:bg-indigo-500 hover:text-white',
        'context-active': xbase + 'w-full bg-indigo-500 text-white',
        nav: xbase + ' rounded-full hover:bg-red-100 hover:text-primary',
        void: xbase,
      }

      return map[this.variant || this.type]
    },
  },
  methods: {
    openAuthPopup() {
      if (this.track) {
        this.$track('intent', this.tracking)
      }

      this.authTargetQuery = this.targetAction
      this.showAuthPopup = this.title
    },
    capture() {
      if (this.track && this.tracking.event) {
        const event = this.tracking.event
        const data = this.tracking
        delete data.event
        this.$track(event, data)
      }
    },
  },
  setup() {
    const { uid, showAuthPopup, authTargetQuery } = useAuth()

    return { uid, showAuthPopup, authTargetQuery }
  },
}
</script>
