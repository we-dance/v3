<template>
  <div class="text-center p-4" :class="background">
    <div>
      <h4 class="font-bold text-xl my-0">{{ title }}</h4>
      <p class="text-sm">{{ description }}</p>
    </div>
    <div class="flex justify-center">
      <TButton
        v-if="button"
        :allow-guests="allowGuests"
        :title="button"
        class="my-2 no-underline"
        type="primary"
        :to="href"
        v-on="$listeners"
        >{{ button }}</TButton
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    allowGuests: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    button: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    href: {
      type: String,
      default: '',
    },
    background: {
      type: String,
      default: 'bg-gray-100',
    },
  },
}
</script>
