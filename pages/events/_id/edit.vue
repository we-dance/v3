<template>
  <div class="bg-dark md:py-4 min-h-screen">
    <div
      class="mx-auto w-full max-w-lg md:rounded md:border md:shadow bg-white"
    >
      <TForm
        v-model="item"
        :edit-creator="isAdmin()"
        :fields="eventFields"
        show-cancel
        vertical
        class="bg-white p-4 space-y-4"
        @save="saveItem"
        @cancel="cancel"
      />
      <div v-if="duplicates.length">
        <div class="text-red-500 text-sm p-4">
          The following event already exists
        </div>
        <div v-for="item in duplicates" :key="item.id">
          <TEventText2 :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { pickBy } from 'lodash'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { ref } from '@nuxtjs/composition-api'
import { useAuth } from '~/use/auth'
import { useDoc } from '~/use/doc'
import { useRouter } from '~/use/router'
import { useEvents } from '~/use/events'
import { getYmd } from '~/utils'

export default {
  name: 'EventEdit',
  layout: 'empty',
  middleware: ['auth'],
  watch: {
    'item.place'() {
      this.updateHash()
    },
    'item.startDate'() {
      this.updateHash()
    },
    'item.facebook'(facebook) {
      const parts = facebook.replace(/\?.*/, '').split('/')
      this.item.facebookId = parts.pop() || parts.pop()
    },
    loading(loading) {
      if (!loading && this.item) {
        if (!this.can('edit', 'posts', this.item)) {
          this.$nuxt.error({ statusCode: 405 })
        }

        if (typeof this.item.startDate === 'string') {
          this.item.startDate = +new Date(this.item.startDate)
        }

        if (typeof this.item.endDate === 'string') {
          this.item.endDate = +new Date(this.item.endDate)
        }

        if (!this.item.type) {
          this.item.type = 'event'
        }
      }
    },
  },
  mounted() {
    if (this.$route.params.id === '-') {
      this.item = {
        type: 'event',
        place: this.profile?.place || '',
        visibility: 'Public',
        form: 'No',
        online: 'No',
        international: 'No',
        claimed: 'No',
        eventType: 'Party',
        duration: 60,
        price: '',
        styles: {},
        cover: '',
        artists: [],
        org: {
          username: this.profile?.username || '',
        },
        username: this.profile?.username || '',
        watch: {
          count: 1,
          list: {
            [this.profile?.username]: true,
          },
        },
        program: [],
      }
    }
    if (this.$route.query.venue) {
      this.setVenue(this.$route.query.venue)
    }
  },
  methods: {
    async setVenue(venue) {
      const doc = await this.findVenue('username', venue)
      if (!doc) {
        return
      }

      doc.place_id = doc.address.place_id
      Vue.set(this.item, 'venue', doc)
    },
    updateHash() {
      if (!this.item.startDate || !this.item.venue?.place_id) {
        return
      }

      this.item.hash = this.item.startDate + '+' + this.item.venue.place_id

      const firestore = firebase.firestore()

      firestore
        .collection('posts')
        .where('hash', '==', this.item.hash)
        .get()
        .then((querySnapshot) => {
          const duplicates = []
          querySnapshot.forEach((doc) => {
            duplicates.push({ ...doc.data(), id: doc.id })
          })
          this.duplicates = duplicates.filter(
            (item) => item.id !== this.item.id
          )
        })
    },
    cancel() {
      this.$router.go(-1)
    },
    async copyItem(data) {
      if (!data.name) {
        return
      }

      this.$track('copy_event')
      const doc = await this.create(data)

      this.$router.push(this.localePath(`/events/${doc.id}`))
    },
    async saveItem(data) {
      data = pickBy(data, (v) => v !== undefined)

      data.artists = (data.artists || []).filter((item) => item)
      data.duration = (data.endDate - data.startDate) / 60 / 1000

      data.type = data?.recurrence?.freq === 'weekly' ? 'series' : 'event'

      if (data.type === 'series') {
        if (data.seriesId) {
          delete data.seriesId
        }

        data.socialCover = ''
        data.commentsCount = 0
        data.downVotes = 0
        data.upVotes = 0
        data.viewsCount = 0
        data.votes = 0
        data.watch = {
          count: 0,
          list: {},
        }
        data.star = {
          count: 0,
          list: {},
        }
        data.checkin = {
          count: 0,
          list: {},
        }
        data.telegram = {}
        data.instagram = {}
        data.promotion = ''
      }

      data.artistsList = data.artists
        .map((a) => a.username)
        .filter((item) => item)

      let result

      if (data.id) {
        this.$track('update_event')
        result = await this.update(data.id, data)
      } else {
        this.$track('create_event')
        result = await this.create(data)
      }

      const children = []
      const series = this.getChildren(result.id)

      for (const episode of series.filter((i) => i.action === 'create')) {
        delete episode.action

        const child = await this.create(episode)
        children.push({
          id: child.id,
          startDate: child.startDate,
          endDate: child.endDate,
        })
      }

      for (const episode of series.filter((i) => i.action === 'delete')) {
        await this.remove(episode.id)
      }

      for (const episode of series.filter((i) => i.action === 'update')) {
        delete episode.action
        const child = await this.update(episode.id, episode)
        children.push({
          id: child.id,
          startDate: child.startDate,
          endDate: child.endDate,
        })
      }

      if (children.length) {
        await this.update(result.id, { children })
      }

      this.view(result.id)
    },
    getChildren(seriesId) {
      const children = []
      const unassigned = this.item?.children || []

      if (!this.item.recurrence?.dates) {
        return []
      }

      for (const date of this.item.recurrence?.dates) {
        const startDate = date
        const endDate = new Date(+startDate + this.item.duration * 60 * 1000)

        const existing = unassigned.find(
          (item) => getYmd(item.startDate) === getYmd(startDate)
        )

        if (existing) {
          unassigned.splice(unassigned.indexOf(existing), 1)
        }

        const action = existing ? 'update' : 'create'

        const childData = {
          ...this.item,
          id: existing?.id || '',
          startDate: +startDate,
          hash: +startDate + '+' + this.item.venue.place_id,
          endDate: +endDate,
          type: 'event',
          seriesId,
          action,
          recurrence: {
            freq: 'never',
            days: {},
            untilDate: '',
          },
        }
        const cleanedData = pickBy(childData, (v) => v !== undefined)

        children.push(cleanedData)
      }

      // remove deleted children
      for (const child of unassigned) {
        children.push({
          ...child,
          action: 'delete',
        })
      }

      return children
    },
    view(id) {
      if (!id) {
        this.$router.push(this.localePath(`/${this.profile?.username}`))
      }

      this.$router.push(this.localePath(`/events/${id}`))
    },
  },
  setup() {
    const { eventFields } = useEvents()
    const { can, profile, isAdmin, uid } = useAuth()
    const { params } = useRouter()

    const collection = 'posts'

    const duplicates = ref([])

    const { doc: docVenue, find: findVenue } = useDoc('profiles')

    const { doc: item, load, update, create, remove, loading } = useDoc(
      collection
    )

    if (params.id !== '-') {
      load(params.id)
    }

    return {
      docVenue,
      findVenue,
      duplicates,
      loading,
      item,
      can,
      collection,
      update,
      create,
      remove,
      profile,
      isAdmin,
      uid,
      eventFields,
    }
  },
}
</script>
