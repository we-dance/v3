<template>
  <div>
    <div class="p-4">
      <h1 class="text-4xl font-extrabold text-center">
        Share your social media instantly
      </h1>
      <div class="flex justify-center pt-4">
        <img
          src="/img/nfc-screenshot.png"
          alt="WeDance Card Screenshot"
          class="h-[50vh]"
        />
      </div>
      <div class="text-center text-xl text-gray-700 mb-4">
        Turn a simple handshake into a lasting connection
      </div>

      <div class="flex justify-center py-4">
        <TButton
          type="primary"
          :to="`/nfc/${$route.params.cardId}?connect=true`"
          target="_blank"
          >Link your Profile</TButton
        >
      </div>

      <h2 class="text-3xl font-extrabold text-center mt-4 mb-2">
        Next steps
      </h2>
      <div class="flex gap-4 items-start mb-4">
        <div>
          <LinkIcon class="mt-1 text-primary w-6" />
        </div>
        <div>
          <div class="text-lg font-bold">Link your profile</div>
          <div class="text-sm text-gray-700">
            Login or register
          </div>
        </div>
      </div>
      <div class="flex gap-4 items-start mb-4">
        <div>
          <UserCircleIcon class="mt-1 text-primary w-6" />
        </div>
        <div>
          <div class="text-lg font-bold">Edit your profile</div>
          <div class="text-sm text-gray-700">
            Add your social media links
          </div>
        </div>
      </div>
      <div class="flex gap-4 items-start mb-4">
        <div>
          <ThumbUpIcon class="mt-1 text-primary w-6" />
        </div>
        <div>
          <div class="text-lg font-bold">Start networking</div>
          <div class="text-sm text-gray-700">
            Share your profile by tapping your card on other person’s mobile and
            start networking faster.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from '@nuxtjs/composition-api'
import { UserCircleIcon, LinkIcon, ThumbUpIcon } from '@vue-hero-icons/outline'
import { until } from '@vueuse/core'
import { db } from '~/plugins/firebase'
import { useAuth } from '~/use/auth'

export default {
  components: {
    UserCircleIcon,
    LinkIcon,
    ThumbUpIcon,
  },
  async asyncData({ params, error, redirect }) {
    const cardId = params.cardId
    const cardRef = await db
      .collection('cards')
      .doc(cardId)
      .get()

    if (!cardRef.exists) {
      error({ statusCode: 404, message: 'Card not found' })
    }

    const card = cardRef.data()

    if (card.username) {
      redirect(`/${card.username}?ref=nfc`)
    }
  },
  setup(props, { root }) {
    const { profile, username, uid } = useAuth()

    onMounted(async () => {
      await until(profile).not.toBeNull()

      if (username.value && root.$route.query.connect === 'true') {
        await db
          .collection('cards')
          .doc(root.$route.params.cardId)
          .update({
            username: username.value,
            uid: uid.value,
            connectedAt: +new Date(),
            state: 'connected',
          })

        root.$router.push(`/${username.value}?nfc=connected`)
      }
    })
  },
}
</script>
