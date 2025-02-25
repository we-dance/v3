<template>
  <div>
    <tw-tabs
      v-if="!showForm"
      :tabs="[
        {
          name: 'Profile',
          value: 'profile',
          to: '?type=',
          current: !$route.query.type,
        },
        {
          name: 'Place',
          value: 'place',
          to: '?type=place',
          current: $route.query.type === 'place',
        },
        {
          name: 'Link',
          value: 'link',
          to: '?type=link',
          current: $route.query.type === 'link',
        },
      ]"
    />
    <form class="flex flex-col gap-4 p-4" @submit.prevent="saveItem">

      <div class="flex gap-2" >
        <TField
          v-if="!$route.query.type"
          v-model="item.receiver"
          :component=" TInputProfile"
          placeholder="Search on WeDance"
          :description="showForm ? `If you can't find a profile, use Place or Link tab` : ''"
  
          hide-label
        />
        <TField
          v-if="$route.query.type === 'place'"
          v-model="item.venue"
          component="TInputVenue"
          hide-areas
          placeholder="Search on Google Maps"
          description="Better use a name of the place, rather than an address"
          hide-label
        />
        <TField
          v-if="$route.query.type === 'link'"
          v-model="item.link"
          component="TInput"
          type="url"
          required
          placeholder="https://"
          description="Link to a website, Instagram, Facebook page, Whatsapp group, etc"
          hide-label
        />
        <TField
          v-if="!hidePlace"
          v-model="item.place"
          label="Which city?"
          component="TInputPlace"
          label-position="top"
          global
        />
        <TField
          v-if="!hideDance"
          v-model="item.style"
          label="Dance style"
          label-position="top"
          component="TInputStyle"
          popular-only
        />

        <TButton
        class="w-[70%] p-0 h-10 border-none outline-none "
        type="primary"
        v-if="!showForm"
        @click="showForm=true">Ask for recommendation
      </TButton>
      </div>


      <TField
      v-if="showForm"
        v-model="item.stars"
        placeholder="stars"
        hide-label
        component="TRatingInput"
      />
      <TField
      v-if="showForm"
        v-model="item.description"
        label-position="top"
        component="TInputTextarea"
        placeholder="Share your experience"
      />


      <div class="flex justify-end gap-2">
        <TButton v-if="!hideCancel" variant="secondary" @click="cancel"
          >Cancel</TButton
        >
        <TButton v-if="id" variant="secondary" @click="remove">Delete</TButton>
        <TButton v-if="showForm" xtype="submit" variant="primary">Submit</TButton>
      </div>
    </form>
  </div>
</template>

<script>
import Vue from 'vue'
import { onMounted, ref } from '@nuxtjs/composition-api'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { until } from '@vueuse/core'
import { useAuth } from '~/use/auth'

export default {
  name: 'TReviewForm',
  props: {
    place: {
      type: String,
      default: '',
    },
    dance: {
      type: String,
      default: '',
    },
    hidePlace: {
      type: Boolean,
      default: false,
    },
    hideDance: {
      type: Boolean,
      default: false,
    },
    hideCancel: {
      type: Boolean,
      default: false,
    },
    question: {
      type: String,
      default: '',
    },
    storyId: {
      type: String,
      default: '',
    },
  },
  methods: {
    cancel() {
      this.$router.go(-1)
    },
    async remove() {
      const firestore = firebase.firestore()
      await firestore
        .collection('stories')
        .doc(this.id)
        .delete()

      this.$router.push(`/${this.profile.username}`)
    },
    async saveItem() {
      let data = this.item

      if (!data.receiver?.username && !data.link && !data.venue?.place_id) {
        this.$toast.error('Please choose a profile, place or link.')
        return
      }

      let receiver = ''
      const username = data.receiver?.username || data.venue?.username || ''
      if (username) {
        receiver = {
          username,
        }
      }

      data = {
        ...data,
        dances: [data.style || ''],
        receiver,
        link: data.link || '',
        venue: data.venue || '',
        question: this.question || data.question || '',
        createdBy: this.uid,
        username: this.profile.username,
        type: 'review',
      }

      const firestore = firebase.firestore()
      if (this.id) {
        this.$track('review_updated')
        data.updatedAt = +new Date()

        await firestore
          .collection('stories')
          .doc(this.id)
          .update(data)
      } else {
        this.$track('review_created')
        data.createdAt = +new Date()

        const newStory = await firestore.collection('stories').add(data)
        if (this.question) {
          await firestore
            .collection('stories')
            .doc(this.question)
            .update({
              replies: firebase.firestore.FieldValue.arrayUnion(newStory.id),
            })
        }

        // set a place for recommended receiver
        if (data.place && data.receiver?.username) {
          const receiverSnaps = await firestore
            .collection('profiles')
            .where('username', '==', data.receiver.username)
            .get()

          const receiverSnap = receiverSnaps.docs[0]

          await receiverSnap.ref.update({
            place: data.place,
            type: 'Organiser',
          })
        }
      }

      this.$router.push(`/${this.profile.username}?view=stories#tabs`)
    },
  },
  setup(props, { root }) {
    const item = ref({})
    const id = ref(null)
    const showForm = ref(false)
    const { profile, uid, can } = useAuth()

    onMounted(async () => {
      item.value = {}

      const receiver = root.$route.query.receiver

      await until(profile).not.toBeNull()

      if (root.$route.query.city) {
        Vue.set(item.value, 'place', root.$route.query.city)
      }

      if (props.place) {
        Vue.set(item.value, 'place', props.place)
      }

      if (root.$route.query.style) {
        Vue.set(item.value, 'style', root.$route.query.style)
      }

      if (props.dance) {
        Vue.set(item.value, 'style', props.dance)
      }

      if (props.storyId) {
        const firestore = firebase.firestore()

        const doc = await firestore
          .collection('stories')
          .doc(props.storyId)
          .get()

        if (!doc.exists || !can('edit', 'stories', doc.data())) {
          root.$toast.error('You are not allowed to edit this review.')
          return
        }

        item.value = doc.data()
        id.value = props.storyId
      }

      if (receiver) {
        Vue.set(item.value, 'receiver', { username: receiver })

        const firestore = firebase.firestore()
        const myReviewsRef = await firestore
          .collection('stories')
          .where('createdBy', '==', uid.value)
          .get()

        const myReviews = myReviewsRef.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))

        const thisReview = myReviews.find(
          (review) => review.receiver?.username === receiver
        )

        if (thisReview) {
          item.value = thisReview
          id.value = thisReview.id
        }
      }
    })

    return {
      item,
      profile,
      id,
      uid,
      showForm
    }
  },
}
</script>
