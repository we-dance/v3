import firebase from 'firebase/app'
import 'firebase/firestore'
import { useCities } from '~/use/cities'
import { useI18n } from '~/use/i18n'
import { getYmd } from '~/utils'
import { useCommon } from '~/use/common'
import { useAuth } from '~/use/auth'

const updateEndDate = (newItem, oldItem) => {
  if (!newItem.startDate) {
    return
  }

  const endDate = new Date(newItem.startDate + newItem.duration * 60 * 1000)

  newItem.endDate = +endDate
}

const updateDuration = (newItem, oldItem) => {
  if (!newItem.startDate || !newItem.endDate) {
    return
  }

  newItem.duration = (newItem.endDate - newItem.startDate) / 60000
}

export async function getEventsWithVenue(placeId) {
  const result = await firebase
    .firestore()
    .collection('posts')
    .where('venue.place_id', '==', placeId)
    .get()

  return result.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    role: 'Venue',
  }))
}

export async function getEventsSavedBy(profile) {
  const result = []

  if (!profile?.bookmarks) {
    return result
  }

  for (const eventId of profile.bookmarks) {
    const doc = await firebase
      .firestore()
      .collection('posts')
      .doc(eventId)
      .get()

    result.push({
      ...doc.data(),
      id: doc.id,
      role: 'Interested',
    })
  }

  return result
}

export async function getEventsOrganisedBy(username) {
  const result = await firebase
    .firestore()
    .collection('posts')
    .where('org.username', '==', username)
    .get()

  return result.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    role: 'Organiser',
  }))
}

export async function getEventsWithArtist(username) {
  const result = await firebase
    .firestore()
    .collection('posts')
    .where('artistsList', 'array-contains', username)
    .get()

  return result.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    role: 'Special Guest',
  }))
}

export async function getEventsWithGuest(username) {
  const result = await firebase
    .firestore()
    .collection('posts')
    .where(`star.usernames`, 'array-contains', username)
    .get()

  return result.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    role: 'Guest',
  }))
}

export async function getEventsInPlace(placeId) {
  const result = await firebase
    .firestore()
    .collection('posts')
    .where('place', '==', placeId)
    .where('startDate', '>=', +new Date())
    .get()

  return result.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))
}

export async function getFestivals() {
  const festivals = (
    await firebase
      .firestore()
      .collection('posts')
      .where('eventType', '==', 'Festival')
      .get()
  ).docs

  const congresses = (
    await firebase
      .firestore()
      .collection('posts')
      .where('eventType', '==', 'Congress')
      .get()
  ).docs

  const events = [...festivals, ...congresses]

  return events.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))
}

export const useEvents = () => {
  const { t } = useI18n()
  const { currentCity } = useCities()
  const { yesNoOptions } = useCommon()
  const { isAdmin } = useAuth()

  const eventRoleOptions = [
    {
      label: t('event.role.instructor'),
      value: 'instructor',
    },
    {
      label: t('event.role.dj'),
      value: 'dj',
    },
    {
      label: t('event.role.musician'),
      value: 'musician',
    },
    {
      label: t('event.role.taxi'),
      value: 'taxi',
    },
    {
      label: t('event.role.photographer'),
      value: 'photographer',
    },
    {
      label: t('event.role.organiser'),
      value: 'organiser',
    },
  ]

  const eventTypeList = [
    {
      label: t('events.typelist.party'),
      value: 'Party',
      icon: '🎵',
      festival: true,
    },
    {
      label: t('events.typelist.workshop'),
      value: 'Workshop',
      icon: '🎓',
      festival: true,
    },
    {
      label: t('events.typelist.course'),
      value: 'Course',
      icon: '🎓',
    },
    {
      label: t('events.typelist.weekender'),
      value: 'Weekender',
      icon: '✈️',
    },
    {
      label: t('events.typelist.festival'),
      value: 'Festival',
      icon: '✈️',
    },
    {
      label: t('events.typelist.congress'),
      value: 'Congress',
      icon: '✈️',
    },
    {
      label: t('events.typelist.concert'),
      value: 'Concert',
      icon: '🎵',
      festival: true,
    },
    {
      label: t('events.typelist.show'),
      value: 'Show',
      icon: '🎵',
      festival: true,
    },
    {
      label: t('events.typelist.other'),
      value: 'Other',
      icon: '🎵',
    },
  ]

  const now = new Date()
  const startOfTodayString = getYmd(now)

  const isPublic = (item) => item.visibility !== 'Unlisted'

  const isUpcoming = (item) =>
    getYmd(item.startDate) >= startOfTodayString && isPublic(item)

  const isInSelectedCity = (item) => item.place === currentCity.value

  const eventCategoryOptions = [
    {
      label: t('event.category.meetup'),
      value: 'meetup',
      icon: '🎵',
      filter: (item) => isUpcoming(item) && isInSelectedCity(item),
    },
    {
      label: t('event.category.lesson'),
      value: 'lesson',
      icon: '🎓',
      filter: (item) =>
        ['Workshop', 'Course'].includes(item.eventType) &&
        isUpcoming(item) &&
        (isInSelectedCity(item) || item.online === 'Yes'),
    },
    {
      label: t('event.category.travel'),
      value: 'travel',
      icon: '✈️',
      types: ['Festival', 'Congress'],
      filter: (item) =>
        ['Festival', 'Congress'].includes(item.eventType) && isUpcoming(item),
    },
  ]

  function addLabelIcons(options) {
    return options.map((type) => ({
      ...type,
      label: `${type.icon}  ${type.label}`,
    }))
  }

  const eventTypeListIcons = eventTypeList.map((type) => ({
    ...type,
    label: `${type.icon}  ${type.label}`,
  }))

  function getEventIcon(eventType) {
    const typeOption =
      eventTypeListIcons.find((type) => type.value === eventType) || 'Other'

    return typeOption.icon
  }

  function getEventTypeLabel(eventType) {
    return (
      eventTypeList.find((type) => type.value === eventType)?.label || eventType
    )
  }

  const eventFields = [
    {
      name: 'eventType',
      label: t('event.type'),
      labelPosition: 'top',
      component: 'TInputSelect',
      options: eventTypeList,
    },
    {
      when: () => isAdmin(),
      name: 'hotDeal',
      label: 'Hot Deal?',
      labelPosition: 'top',
      component: 'TInputButtons',
      options: yesNoOptions,
    },
    {
      when: () => isAdmin(),
      name: 'hasLottery',
      label: 'Has Lottery?',
      labelPosition: 'top',
      component: 'TInputButtons',
      options: yesNoOptions,
    },
    {
      when: () => isAdmin(),
      name: 'lottery',
      label: 'Lottery',
      labelPosition: 'top',
    },
    {
      name: 'styles',
      labelPosition: 'top',
      label: t('event.styles.label'),
      description: t('event.styles.description'),
      component: 'TInputStylesSelect2',
    },
    {
      name: 'name',
      labelPosition: 'top',
      placeholder: t('event.name.placeholder'),
      label: t('event.name.label'),
      required: true,
    },
    {
      name: 'venue',
      label: t('event.venue'),
      labelPosition: 'top',
      component: 'TInputVenue',
      simple: true,
      required: true,
    },
    {
      name: 'startDate',
      component: 'TInputDate',
      labelPosition: 'top',
      simple: true,
      required: true,
      onChange: updateEndDate,
    },
    {
      name: 'endDate',
      component: 'TInputDate',
      labelPosition: 'top',
      label: 'End date',
      simple: true,
      onChange: updateDuration,
    },
    {
      name: 'recurrence',
      component: 'TRecurrenceEditor',
      label: 'Repeat',
      labelPosition: 'top',
    },
    {
      name: 'online',
      label: 'Is it available online?',
      component: 'TInputButtons',
      options: ['Yes', 'No'],
      before: 'Streaming via Zoom, Google Meet, Instagram Live, etc.?',
      labelPosition: 'top',
    },
    {
      name: 'link',
      labelPosition: 'top',
      placeholder: t('event.link.placeholder'),
      description: t('event.link.description'),
      label: t('event.link.label'),
      validate(value, item) {
        if (!value) {
          return true
        }

        try {
          // eslint-disable-next-line no-new
          new URL(value)
          return true
        } catch (err) {
          return false
        }
      },
      validationError: 'Please enter a valid URL',
    },
    {
      name: 'price',
      labelPosition: 'top',
      label: t('event.price.label'),
      description: t('event.price.description'),
      validate(value) {
        if (!value) {
          return true
        }

        if (isNaN(value)) {
          return true
        }
      },
      validationError: 'Please add currency',
    },
    {
      name: 'limit',
      label: t('event.limit.label'),
      description: t('event.limit.description'),
      labelPosition: 'top',
    },
    {
      name: 'specialOffer',
      labelPosition: 'top',
      label: 'Special Offer',
      description: 'For example: Get 10% off with WeDance discount',
    },
    {
      name: 'description',
      label: t('event.description.label'),
      description: t('event.description.description'),
      labelPosition: 'top',
      component: 'TInputTextarea',
      placeholder: t('event.description.placeholder'),
      max: 280,
    },
    {
      name: 'video',
      labelPosition: 'top',
      placeholder: 'Youtube Link',
      description: '',
      label: 'Video Cover',
      validate(value, item) {
        if (!value) {
          return true
        }

        try {
          // eslint-disable-next-line no-new
          new URL(value)
          return true
        } catch (err) {
          return false
        }
      },
      validationError: 'Please enter a valid URL',
    },
    {
      name: 'cover',
      label: t('event.cover.label'),
      description: '1024x1024',
      tips: t('event.cover.description'),
      component: 'TInputPhoto',
      labelPosition: 'top',
      width: 500,
      height: 500,
      circle: false,
      when: (i) => i.coverSize !== 'horizontal',
    },
    {
      name: 'cover',
      label: t('event.cover.label'),
      description: '1024x512',
      tips: t('event.cover.description'),
      component: 'TInputPhoto',
      labelPosition: 'top',
      width: 500,
      height: 250,
      circle: false,
      when: (i) => i.coverSize === 'horizontal',
    },
    {
      name: 'coverSize',
      component: 'TInputButtons',
      options: ['square', 'horizontal'],
      hideLabel: true,
    },
    {
      name: 'org',
      component: 'TInputProfile',
      label: t('event.org.label'),
      before: t('event.org.description'),
      labelPosition: 'top',
    },
    {
      name: 'stripePricingTable',
      labelPosition: 'top',
      label: 'Stripe Pricing Table',
      description: 'Paste Stripe pricing table embed code here',
      component: 'TInputTextarea',
      placeholder:
        '<script async src="https://js.stripe.com/v3/pricing-table.js"></script><stripe-pricing-table pricing-table-id="xxxx" publishable-key="xxxx"></stripe-pricing-table>',
    },
    {
      name: 'confirmation',
      labelPosition: 'top',
      label: t('event.confirmation.label'),
      description: t('event.confirmation.description'),
      component: 'TInputTextarea',
      placeholder: t('event.confirmation.placeholder'),
    },
  ]

  return {
    eventCategoryOptions,
    eventTypeList,
    eventTypeListIcons,
    getEventIcon,
    eventFields,
    addLabelIcons,
    eventRoleOptions,
    getEventTypeLabel,
  }
}
