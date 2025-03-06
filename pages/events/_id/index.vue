<template>
  <div>
    <TEventImportStatus
      v-if="doc.type === 'import_error' || doc.type === 'import_event'"
      :doc="doc"
    />

    <TEventSeries
      v-if="doc.type === 'series'"
      :doc="doc"
      :children="doc.children"
    />

    <TPopup
      v-if="subscribePopup"
      title="Get Subscriber Rewards"
      @close="subscribePopup = false"
    >
      <div class="w-64 space-y-4 py-4">
        <div class="space-y-2">
          <div class="flex items-start">
            <TIcon name="ticket" class="h-6 w-6 text-black mr-2 mt-1" />
            <div>
              <h3 class="font-semibold text-base">Discounts</h3>
              <p class="text-sm text-gray-600">
                Get special discounts on future events
              </p>
            </div>
          </div>
          <div class="flex items-start">
            <TIcon name="bell" class="h-6 w-6 text-black mr-2 mt-1" />
            <div>
              <h3 class="font-semibold text-base">Stay Updated</h3>
              <p class="text-sm text-gray-600">
                Receive notifications about upcoming events
              </p>
            </div>
          </div>
          <div class="flex items-start">
            <TIcon name="group" class="h-6 w-6 text-black mr-2 mt-1" />
            <div>
              <h3 class="font-semibold text-base">Connect with Friends</h3>
              <p class="text-sm text-gray-600">
                See which of your friends are attending and make plans together
              </p>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <TButton label="Subscribe" type="primary" class="w-full" />
          <TButton
            allow-guests
            label="Buy ticket as guest"
            class="w-full"
            @click="buyTicketLink()"
          />
        </div>
      </div>
    </TPopup>

    <TPopup
      v-if="stripePricingPopup"
      title="Buy Tickets"
      @close="stripePricingPopup = false"
    >
      <div class="w-full max-w-lg p-4">
        <div
          v-if="doc.stripePricingTable"
          ref="stripePricingTablePopupContainer"
          class="stripe-pricing-table-container"
        ></div>
        <div v-else class="text-center py-4">
          <p>No ticket options available for this event.</p>
        </div>
      </div>
    </TPopup>

    <template v-if="doc.type === 'event'">
      <WProfile
        v-if="doc.org"
        :username="doc.org.username"
        :fallback="doc.org"
        hide-role
        hide-bio
        hide-type
        subscribe-right
        hide-buttons
        hide-views
        class="border-none md:rounded-t-md"
      />
      <w-youtube v-if="doc.video" :url="doc.video" />
      <div
        v-else-if="doc.cover"
        class="relative overflow-hidden md:rounded-t-md"
      >
        <img :src="doc.cover" :alt="doc.name" class="w-full" />
      </div>
      <div class="p-4 flex gap-2 border-b border-t">
        <div class="text-center pt-2">
          <div class="text-xl font-bold leading-none text-primary">
            {{ formatDate(doc.startDate, 'd') }}
          </div>
          <div class="w-12 text-sm">
            {{ formatDate(doc.startDate, 'MMM') }}
          </div>
          <div class="w-12 text-xs">
            {{ formatDate(doc.startDate, 'yyyy') }}
          </div>
        </div>
        <div>
          <div class="flex gap-1 text-xs uppercase">
            <div class="text-primary">
              {{ getEventTypeLabel(doc.eventType) }}
            </div>
            <div>·</div>
            <div>
              {{
                getStyles(doc.styles)
                  .map((s) => s.name)
                  .join(' · ')
              }}
            </div>
          </div>
          <h1 class="text-2xl font-bold leading-none">{{ doc.name }}</h1>
          <div class="mt-1 flex gap-1 text-xs">
            <div>
              {{ formatDate(doc.startDate, 'iii') }}
            </div>
            <div>
              {{ formatDate(doc.startDate, 'HH:mm') }}
              <span v-if="doc.endDate">
                &mdash;
                <span
                  v-if="
                    formatDate(doc.startDate, 'iii') !=
                      formatDate(doc.endDate, 'iii')
                  "
                >
                  {{ formatDate(doc.endDate, 'iii') }}</span
                >
                {{ formatDate(doc.endDate, 'HH:mm') }}</span
              >
              {{ formatDate(doc.startDate, '(z)') }}
            </div>
            <template v-if="!doc.link">
              <div>·</div>
              <div>
                {{ $tc('guests', guestCount, { count: guestCount }) }}
              </div>
            </template>
            <div>·</div>
            <div>
              {{ $tc('views', doc.viewsCount, { count: doc.viewsCount }) }}
            </div>
          </div>
        </div>
      </div>
      <a
        v-if="doc.online != 'Yes' && doc.venue"
        :href="doc.venue.url"
        target="_blank"
        class="block border-b py-2 px-4 hover:bg-gray-200"
        @click="$track('event_open_map')"
      >
        <div class="flex items-center justify-start leading-tight">
          <TIcon name="place" class="mr-4 h-4 w-4" />
          <div>
            <h4 class="font-bold">
              {{ doc.venue.name
              }}<span v-if="doc.venue.room"> • {{ doc.venue.room }}</span>
            </h4>
            <div class="text-gray-700">
              {{ doc.venue.formatted_address }}
            </div>
          </div>
        </div>
      </a>

      <div
        v-if="doc.online === 'Yes'"
        class="flex w-full items-center justify-start border-b py-2 px-4 leading-tight"
      >
        <TIcon name="youtube" class="mr-4 h-4 w-4" />
        <div>{{ $t('eventView.online') }}</div>
      </div>

      <div
        v-if="doc.price || doc.link"
        class="flex w-full items-center justify-start border-b py-2 px-4 leading-tight"
      >
        <TIcon name="ticket" class="mr-4 h-4 w-4" />
        <div class="flex w-full justify-between items-center">
          <div>{{ doc.price }}</div>
          <div></div>
        </div>
      </div>
      <div
        v-if="doc.limit"
        class="flex w-full items-center justify-start border-b py-2 px-4 leading-tight"
      >
        <UserGroupIcon class="mr-4 w-4 text-black" />
        <div class="flex w-full justify-between items-center">
          <div v-if="eventLimit.roleBased">
            {{ $t('event.limitRoles', eventLimit) }}
          </div>
          <div v-else>
            {{ $t('event.limitTotal', eventLimit) }}
          </div>
        </div>
      </div>
      <WTeaser
        v-if="doc.lottery"
        title="Dance Lottery"
        button="Win Ticket"
        :href="doc.lottery"
        class="w-full"
        background="bg-red-100"
      />
      <div
        v-if="doc.specialOffer"
        class="flex w-full items-center justify-start border-b py-2 px-4 leading-tight"
      >
        <TIcon name="fire" class="mr-4 h-4 w-4 text-primary" />
        <div class="flex w-full justify-between text-primary">
          <div>{{ doc.specialOffer }}</div>
        </div>
      </div>

      <div
        class="top-0 z-40 flex flex-wrap justify-center items-center gap-2 bg-white p-4 shadow"
        :class="can('edit', 'events', doc) ? '' : 'sticky'"
      >
        <TButton
          v-if="doc.link"
          allow-guests
          type="primary"
          @click="buyTicket()"
          >{{ $t('event.buyTicket') }}</TButton
        >
        <TButton v-else type="primary" @click="openStripePricingTable()">{{
          $t('event.buyTicket')
        }}</TButton>
        <TEventBookmark
          :event-id="doc.id"
          :event="doc"
          show-label
          type="secondary"
          :label="$t('event.save')"
          :toggled-label="$t('event.saved')"
          size="4"
        />
        <TDropdown>
          <TButton
            type="context"
            :href="calendarLink"
            label="Add to Google Calendar"
            class="text-xs"
            @click="$track('event_add_to_calendar')"
          />

          <TCardActions
            :id="doc.id"
            collection="events"
            :item="doc"
            type="context"
            icon=""
            @click="$track('event_report')"
          />
        </TDropdown>
      </div>
      <div v-if="isGoing" class="border-b border-t bg-white p-4">
        <TPreview v-if="doc.confirmation" :content="doc.confirmation" />

        <div
          class="flex flex-col md:flex-row justify-center items-center gap-2"
        >
          <TButton
            v-if="doc.paypal"
            icon="favorite"
            :href="doc.paypal"
            :label="$t('event.paypal.action')"
          />
        </div>
      </div>

      <div class="grid grid-cols-1">
        <div class="md:border-l">
          <div
            v-if="can('edit', 'events', doc)"
            class="space-y-2 p-4 border-b bg-orange-100"
          >
            <h3 class="text-xs font-bold uppercase">Moderator Tools</h3>
            <div class="flex flex-wrap gap-2">
              <TButton
                type="secondary"
                icon="edit"
                :to="localePath(`/events/${doc.id}/edit`)"
                :label="$t('eventView.dropdown.edit')"
              />

              <TButton
                v-if="doc.seriesId"
                type="secondary"
                icon="edit"
                :to="localePath(`/events/${doc.seriesId}/edit`)"
                label="Edit Series"
              />

              <TButton
                type="secondary"
                icon="copy"
                :to="localePath(`/events/${doc.id}/copy`)"
                :label="$t('eventView.dropdown.copy')"
              />

              <TButton
                v-if="can('edit', 'events', doc)"
                type="secondary"
                icon="delete"
                label="Delete"
                @click="deleteEvent()"
              />
            </div>
            <div v-if="doc.promotion !== 'completed'" class="text-sm">
              Promote event for free on WeDance Instagram.
              <div v-if="doc.promotion === 'failed'">
                <div class="text-red-500">
                  Promotion failed: {{ doc.promotionError }}
                </div>
                <div>
                  Please
                  <a
                    class="underline text-primary"
                    href="mailto:support@wedance.vip"
                    >contact support</a
                  >
                  to resolve the issue.
                </div>
              </div>
            </div>

            <TButton
              v-if="doc.promotion === 'requested'"
              label="Promoting..."
              class="rounded-full"
            />
            <div v-else-if="doc.promotion === 'completed'" class="text-sm">
              Event announcement is published on
              <a class="underline text-primary" :href="doc.instagram.messageUrl"
                >Instagram</a
              >
            </div>
            <TButton
              v-else
              icon="trending"
              label="Promote"
              class="rounded-full"
              @click="
                softUpdate(doc.id, {
                  promotion: 'requested',
                })
                $track('event_promote')
              "
            />
            <TButton
              v-if="isAdmin() && doc.promotion === 'completed'"
              label="Reset"
              class="rounded-full"
              @click="
                softUpdate(doc.id, {
                  promotion: '',
                })
              "
            />
          </div>
        </div>
      </div>

      <section class="p-4 border-t border-primary">
        <div class="space-y-2">
          <div class="flex justify-between">
            <h3 class="uppercase text-xs text-primary font-extrabold">
              Updates
            </h3>
            <TButton
              :label="
                can('edit', 'events', doc) ? 'Post an update' : 'Ask a question'
              "
              title="ask a question"
              @click="
                addComment = true
                can('edit', 'events', doc)
                  ? $track('event_post_update')
                  : $track('event_ask_question')
              "
            />
          </div>

          <TCommentsInline
            :item="doc"
            autoload
            :hide-form="!addComment"
            placeholder="Share an update or ask a question"
          />
        </div>
      </section>

      <section
        v-if="doc.description"
        id="about"
        class="p-4 border-t border-primary"
      >
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            About
          </h3>
          <TPreview :content="doc.description" />
        </div>
      </section>

      <section
        v-if="doc.online != 'Yes' && venueProfile"
        id="venue"
        class="p-4 border-t border-primary"
      >
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            Venue
          </h3>
          <WProfile
            :username="venueProfile.username"
            :fallback="venueProfile"
            hide-role
            class="border-none"
          />

          <div>
            <div v-if="doc.venue && doc.venue.map" class="bg-gray-100 p-4">
              <div class="mb-4 text-sm font-bold leading-none text-gray-700">
                {{ $t('eventView.venueMap') }}
              </div>
              <img :src="doc.venue.map" alt="Venue Map" class="mt-4" />
            </div>
          </div>
        </div>
      </section>

      <section id="artists" class="p-4 border-t border-primary">
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            {{ $t('event.artists') }}
          </h3>
          <TButton
            v-if="can('edit', 'events', doc)"
            type="primary"
            label="Edit Artists"
            @click="editingArtists = true"
          />
          <TPopup
            v-if="editingArtists"
            title="Edit Artists"
            @close="editingArtists = false"
          >
            <div class="max-w-md max-h-[80vh] py-4 overflow-y-scroll">
              <TInputArray
                v-model="artists"
                :children="{ component: 'TInputProfile' }"
              />
              <div class="flex justify-end mt-4">
                <TButton
                  type="primary"
                  label="Save"
                  @click="saveArtists(artists)"
                />
              </div>
            </div>
          </TPopup>
          <div v-else-if="doc.artists && doc.artists.length">
            <div
              v-for="profile in doc.artists"
              :key="`artist-${profile.username}`"
            >
              <WProfile
                v-if="profile"
                :username="profile.username"
                :fallback="profile"
                hide-role
              />
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="(agenda && agenda.items) || can('edit', 'events', doc)"
        id="program"
        class="p-4 border-t border-primary"
      >
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            Program
          </h3>
          <TAgendaEditor
            v-model="agenda"
            :editor="can('edit', 'events', doc)"
            :parent="doc"
            @save="saveAgenda(agenda)"
          />
        </div>
      </section>

      <section id="guests" class="p-4 border-t border-primary">
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            {{ $t('event.guests') }}
          </h3>

          <div v-if="doc.star && doc.star.usernames">
            <div
              v-if="guests.followersCount || guests.leadersCount"
              class="text-xs pt-0"
            >
              <span>{{
                $tc('followersCount', guests.followersCount, {
                  count: guests.followersCount,
                })
              }}</span>
              <span>·</span>
              <span>{{
                $tc('leadersCount', guests.leadersCount, {
                  count: guests.leadersCount,
                })
              }}</span>
              <span>·</span>
              <span v-if="can('edit', 'events', doc) && doc.checkin">
                Present: {{ doc.checkin.count || 0 }}
              </span>
            </div>
            <div v-if="!uid" class="flex justify-center p-4">
              <TButton
                type="link"
                allow-guests
                :to="localePath(`/signin?target=${$route.path}`)"
                >{{ $t('event.guestsHidden') }}</TButton
              >
            </div>
            <div v-else>
              <div
                v-for="username in doc.star.usernames"
                :key="`guest-${username}`"
              >
                <WProfile :username="username">
                  <div v-if="can('edit', 'events', doc)" slot="actions">
                    <TReaction
                      :username="username"
                      type="primary"
                      toggled-class="bg-green-500 hover:bg-green-800"
                      icon="PlusIcon"
                      toggled-icon="CheckIcon"
                      field="checkin"
                      class="rounded-full"
                      hide-count
                      :item="doc"
                    />
                  </div>
                </WProfile>
              </div>
              <div v-if="!doc.star.count">There are no other guests yet.</div>
            </div>
          </div>
          <div v-else class="text-xs text-center">
            There are no guests yet
          </div>
        </div>
      </section>

      <section id="reviews" class="p-4 border-t border-primary">
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            Sponsored
          </h3>
          <AdEventView track="event_click_ad" />
        </div>
      </section>

      <section
        v-if="doc.org && doc.org.username"
        id="reviews"
        class="p-4 border-t border-primary"
      >
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            Reviews
          </h3>
          <TReviewList :profile="doc.org" :reviews="reviews" />
        </div>
      </section>

      <section
        v-if="doc.org && doc.org.username"
        id="reviews"
        class="p-4 border-t border-primary"
      >
        <div class="space-y-2">
          <h3 class="uppercase text-xs text-primary font-extrabold">
            Source
          </h3>
          <div class="flex flex-col gap-4">
            <template v-if="isAdmin()">
              <div
                v-for="item in history"
                :key="item.date + item.username"
                class="text-xs"
              >
                <TAvatar photo name :uid="item.uid">
                  <span>•</span>
                  <div>{{ dateDiff(item.date) }}</div>
                  <template v-if="item.invitedBy">
                    <span>•</span>
                    <TAvatar photo name :uid="item.invitedBy" />
                  </template>
                </TAvatar>
                <div class="mt-1 text-xs text-gray-700">
                  {{ item.action }} the event
                </div>
              </div>
            </template>

            <div v-if="doc.updatedBy" class="text-xs">
              <TAvatar photo name :uid="doc.updatedBy">
                <span>•</span>
                <div>{{ dateDiff(doc.updatedAt) }}</div>
              </TAvatar>
              <div class="mt-1 text-xs text-gray-700">updated the event</div>
            </div>

            <TEventCreator :doc="doc" />
          </div>
        </div>
      </section>

      <TPopup
        v-if="announcementPopupVisible"
        title="Promote for free"
        @close="announcementPopupVisible = false"
      >
        <div class="w-64 space-y-2 py-4">
          <TButton
            v-if="doc.telegram && doc.telegram.messageUrl"
            allow-guests
            :href="doc.telegram.messageUrl"
            label="Telegram"
            type="nav"
          />
          <TButton
            v-if="doc.instagram && doc.instagram.messageUrl"
            allow-guests
            :href="doc.instagram.messageUrl"
            label="Instagram"
            type="nav"
          />

          <template v-if="can('edit', 'events', doc)">
            <TButton
              v-if="!doc.telegram || !doc.telegram.state"
              label="Promote on Telegram"
              type="nav"
              @click="
                softUpdate(doc.id, {
                  telegram: { state: 'requested', requestedAt: +new Date() },
                })
              "
            />
            <TButton
              v-else-if="doc.telegram && doc.telegram.state === 'requested'"
              label="Telegram..."
              type="nav"
            />

            <TButton
              v-if="!doc.instagram || !doc.instagram.state"
              label="Promote on Instagram"
              type="nav"
              @click="
                softUpdate(doc.id, {
                  instagram: { state: 'requested', requestedAt: +new Date() },
                })
              "
            />
            <TButton
              v-else-if="doc.instagram && doc.instagram.state === 'requested'"
              label="Instagram..."
              type="nav"
            />
          </template>

          <template v-if="isAdmin()">
            <TButton
              type="nav"
              class="red-500"
              label="Reset Telegram"
              @click="softUpdate(doc.id, { telegram: {} })"
            />
            <TButton
              type="nav"
              class="red-500"
              label="Reset Instagram"
              @click="softUpdate(doc.id, { instagram: {} })"
            />
          </template>
        </div>
      </TPopup>

      <TPopup v-if="ticketPopup" title="Ticket" @close="ticketPopup = false">
        <div class="mx-auto max-h-screen max-w-md overflow-y-scroll py-4">
          <div>Reserved as {{ getRsvp(item.id).participant.name }}</div>
        </div>
      </TPopup>

      <TPopup
        v-if="reservationPopup"
        title="Get Ticket"
        @close="reservationPopup = false"
      >
        <div class="mx-auto max-h-screen max-w-md overflow-y-scroll py-4">
          <div v-if="reservationPopup === 'reserve'">
            <div>
              <TForm
                v-model="account"
                allow-guests
                :fields="reservationFields"
                :submit-label="
                  $t('eventView.reservationPopup.reserve.submitLabel')
                "
                class="mt-4 space-y-4"
              >
                <template v-if="!uid" slot="buttons">
                  <TButton
                    allow-guests
                    :to="localePath(`/signin?target=${this.$route.fullPath}`)"
                    :label="$t('eventView.reservationPopup.reserve.label')"
                  />
                </template>
              </TForm>
            </div>
          </div>
          <div v-if="reservationPopup === 'finish'" class="p-4">
            <template v-if="item.link">
              <h2 class="mb-4 font-bold">
                {{ $t('eventView.reservationPopup.finish.title') }}
              </h2>
              <TButton class="mt-4 mr-4" type="danger" :to="item.link">{{
                $t('eventView.reservationPopup.finish.btn')
              }}</TButton>
            </template>
            <template v-else>
              <h2 class="mb-4 font-bold">
                {{ $t('eventView.reservationPopup.finish.title') }}
              </h2>
              <p v-if="uid">
                {{ $t('eventView.reservationPopup.finish.description') }}
              </p>
              <p v-else>
                {{ $t('eventView.reservationPopup.finish.reminder') }}
              </p>
              <div v-if="uid">
                <TButton
                  :href="calendarLink"
                  :label="$t('eventView.reservationPopup.finish.calendar')"
                  class="mt-2"
                />
              </div>
            </template>
          </div>
        </div>
      </TPopup>
    </template>
  </div>
</template>

<script>
import ls from 'local-storage'
import { UserGroupIcon } from '@vue-hero-icons/outline'
import googleCalendarEventUrl from 'generate-google-calendar-url'
import { computed, ref, watch } from '@nuxtjs/composition-api'
import { useAuth } from '~/use/auth'
import { useDoc } from '~/use/doc'
import { useRouter } from '~/use/router'
import { useProfiles } from '~/use/profiles'
import { useReactions } from '~/use/reactions'
import { useAccounts } from '~/use/accounts'
import { useEvents } from '~/use/events'
import {
  getDay,
  getYmdHms,
  getDateTime,
  getDate,
  getTime,
  dateDiff,
  getEventDescription,
  getDateObect,
  loadDoc,
  getEventMeta,
  formatDate,
  sortBy,
  openURL,
} from '~/utils'
import { addressPart } from '~/use/google'
import { trackView } from '~/use/tracking'
import { useStyles } from '~/use/styles'
import { db } from '~/plugins/firebase'

export default {
  name: 'EventView',
  layout: 'full',
  components: {
    UserGroupIcon,
  },
  async asyncData(ctx) {
    return await loadDoc(ctx, 'posts')
  },
  data: () => ({
    comment: '',
    announcementPopupVisible: false,
    artists: [],
    agenda: {},
    venueProfile: null,
    addComment: false,
    subscribePopup: false,
    stripePricingPopup: false,
  }),
  computed: {
    eventLimit() {
      if (!this.doc.limit) {
        return ''
      }

      let total = 0
      let followers = 0
      let leaders = 0
      let roleBased = false

      if (this.doc.limit.includes('/')) {
        ;[followers, leaders] = this.doc.limit.split('/')
        total = Number(followers) + Number(leaders)
        roleBased = true
      } else {
        total = Number(this.doc.limit)
      }

      return {
        total,
        followers,
        leaders,
        roleBased,
      }
    },
    history() {
      const result = this.doc?.star?.history
      if (!result) {
        return []
      }

      return result.sort(sortBy('-date'))
    },
    reviewsAvg() {
      if (!this.reviewsCount) {
        return 0
      }

      return (
        this.reviews.map((r) => Number(r.stars)).reduce((p, c) => p + c, 0) /
        this.reviewsCount
      )
    },
    reviewsCount() {
      return this.reviews.length || 0
    },
    guestCount() {
      const guestsCount = this.doc.star?.count || 0

      return guestsCount
    },
    publishedAt() {
      return getDateTime(this.item?.createdAt)
    },
    eventUrl() {
      const app = process.env.app
      const url = app.url + this.$route.fullPath
      return url
    },
    tweetUrl() {
      const text = encodeURI(`"${this.item.name}"`)
      return `https://twitter.com/intent/tweet?text=${text} #WeDance ${this.eventUrl}`
    },
  },
  watch: {
    item() {
      if (this.item) {
        this.doc = this.item
        this.agenda = this.doc.agenda
        this.artists = this.doc.artists
        this.loadVenue()

        trackView('posts', this.item.id, this.item.viewsCount || 0)
      }
    },
  },
  methods: {
    buyTicket() {
      const enablePopup = this.$route.query.popup

      if (enablePopup) {
        this.$track('buy_ticket_popup')
        this.subscribePopup = true
      } else {
        this.buyTicketLink()
      }
    },
    openStripePricingTable() {
      this.$track('buy_ticket_stripe')
      this.stripePricingPopup = true

      // Use nextTick to ensure the DOM element is rendered
      this.$nextTick(() => {
        this.renderStripePricingTable()
      })
    },
    buyTicketLink() {
      if (!this.doc.link) {
        return
      }

      this.$track('buy_ticket_link')

      let url = this.doc.link
      const session = ls('session')
      url = url.replace(
        '{{ref}}',
        session.ref || this.$route.query.ref || 'direct'
      )

      openURL(url)
    },
    attend() {
      this.$track('attend')

      // Now using openStripePricingTable instead of buyTicket
      if (this.doc.stripePricingTable) {
        this.openStripePricingTable()
      } else {
        this.buyTicket()
      }
    },
    async loadVenue() {
      if (!this.doc?.venue?.place_id) {
        this.venueProfile = null
        return
      }

      const docs = (
        await db
          .collection('profiles')
          .where('address.place_id', '==', this.doc.venue.place_id)
          .get()
      ).docs

      this.venueProfile = docs.length ? docs[0].data() : null
    },
    renderStripePricingTable() {
      if (!this.$refs.stripePricingTablePopupContainer) return

      // Clear the container before adding new content
      this.$refs.stripePricingTablePopupContainer.innerHTML = ''

      // Create a safe Stripe pricing table element
      const stripePricingTableElement = document.createElement('div')
      stripePricingTableElement.innerHTML = this.doc.stripePricingTable

      // Add only stripe-pricing-table elements
      const pricingTableElements = stripePricingTableElement.querySelectorAll(
        'stripe-pricing-table'
      )
      if (pricingTableElements.length > 0) {
        pricingTableElements.forEach((element) => {
          this.$refs.stripePricingTablePopupContainer.appendChild(element)
        })
      }
    },
  },
  head() {
    return getEventMeta(this.doc)
  },
  setup() {
    const { uid, can, account, username, isAdmin, toggleGuest } = useAuth()
    const { getEventIcon, getEventTypeLabel } = useEvents()
    const { accountFields } = useAccounts()
    const { params, router } = useRouter()
    const { getProfile, getFullProfile } = useProfiles()
    const {
      doc,
      sync,
      exists,
      loading,
      softUpdate,
      update,
      remove,
      create,
    } = useDoc('posts')
    const { find: findProfile } = useDoc('profiles')
    const { map } = useReactions()
    if (params.id) {
      sync(params.id)
    }
    const { getStyles } = useStyles()
    const item = computed(() => {
      const result = map(doc.value)
      result.locality = addressPart(result.venue, 'locality')
      return result
    })

    const profileCache = {}
    const guests = ref({})
    const creator = ref({})
    const org = ref({})
    const reviews = ref([])
    const editingArtists = ref(false)
    const stripePricingPopup = ref(false)

    async function saveAgenda(agenda) {
      for (const itemIndex in agenda.items) {
        const item = agenda.items[itemIndex]

        if (!item.id) {
          const subEvent = await create(item)
          agenda.items[itemIndex].id = subEvent.id
        } else {
          await update(item.id, item)
        }
      }

      await update(doc.value.id, { agenda })
    }

    async function saveArtists(artists) {
      artists = (artists || []).filter((item) => item)

      const artistsList = artists.map((a) => a.username).filter((item) => item)

      await update(doc.value.id, { artists, artistsList })

      editingArtists.value = false
    }

    async function getCachedProfile(username) {
      if (!profileCache[username]) {
        profileCache[username] = await findProfile('username', username)
      }

      return profileCache[username]
    }

    watch(doc, async () => {
      const list = doc.value.star?.usernames

      const result = {
        list: [],
        followersCount: 0,
        leadersCount: 0,
      }

      creator.value = await getFullProfile(doc.value.createdBy)
      org.value = await getFullProfile(doc.value.org?.id)

      if (org.value.username) {
        const reviewsRef = await db
          .collection('stories')
          .where('receiver.username', '==', org.value.username)
          .orderBy('createdAt', 'desc')
          .get()

        reviews.value = reviewsRef.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      }

      if (!list) {
        guests.value = result

        return
      }

      if (guests.value?.list?.length) {
        return
      }

      for (const guestUsername of list) {
        const guestProfile = await getCachedProfile(guestUsername)

        result.list.push(guestProfile)
        if (guestProfile.gender === 'Female') {
          result.followersCount++
        } else if (guestProfile.gender === 'Male') {
          result.leadersCount++
        }
      }

      guests.value = result
    })

    const isGoing = computed(() => {
      return (
        doc.value.star?.usernames &&
        username.value &&
        doc.value.star.usernames.includes(username.value)
      )
    })

    const calendarLink = computed(() =>
      googleCalendarEventUrl({
        start: getDateObect(item.value?.startDate),
        end: getDateObect(item.value?.endDate),
        title: item.value?.name,
        details: `https://wedance.vip/events/${item.value?.id}`,
        location: item.value?.address,
      })
    )
    const reservationFields = accountFields.filter((f) => f.event)
    const ticketPopup = ref(false)
    const reservationPopup = ref(false)
    const ticketTailorPopup = ref(false)
    const isCreatingProfile = ref(false)
    const finishReservation = () => {
      reservationPopup.value = false
    }

    async function deleteEvent() {
      if (!doc.value) {
        return
      }

      if (!confirm(`Are you sure you want to delete this event?`)) {
        return
      }

      this.$track('delete_event')

      await remove(doc.value.id)
      router.push(`/${username.value}`)
    }

    return {
      editingArtists,
      reviews,
      toggleGuest,
      saveAgenda,
      saveArtists,
      formatDate,
      deleteEvent,
      creator,
      org,
      isGoing,
      isAdmin,
      softUpdate,
      isCreatingProfile,
      finishReservation,
      ticketPopup,
      account,
      reservationPopup,
      reservationFields,
      exists,
      guests,
      uid,
      loading,
      item,
      map,
      can,
      getProfile,
      getFullProfile,
      getDateTime,
      getYmdHms,
      dateDiff,
      getDate,
      getTime,
      getDay,
      getEventDescription,
      calendarLink,
      getEventIcon,
      ticketTailorPopup,
      getEventTypeLabel,
      getStyles,
      stripePricingPopup,
    }
  },
  mounted() {
    // No need to render the table on page load as it will only be shown in popup
  },
  updated() {
    if (
      this.stripePricingPopup &&
      this.doc &&
      this.doc.stripePricingTable &&
      this.$refs.stripePricingTablePopupContainer
    ) {
      this.renderStripePricingTable()
    }
  },
}
</script>
