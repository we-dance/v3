<template>
  <div>
    <div class="p-4">
      <h1 class="text-4xl font-extrabold text-center">
        Give the Gift of Dance
      </h1>
      <div class="flex justify-center pt-4">
        <img
          src="/img/gift-card.png"
          alt="WeDance Gift Card Screenshot"
          class="h-[50vh]"
        />
      </div>
      <div class="text-center text-xl text-gray-700 mb-4">
        Surprise your dance-loving friend with a gift card they can use for
        classes, events, or dance gear—so they can follow their passion!
      </div>

      <div class="flex justify-center gap-4 py-4">
        <TButton
          type="primary"
          allow-guests
          to="https://buy.stripe.com/aFaaEW2U94wB2kD15V5sA00"
          target="_blank"
          >Order Gift Card</TButton
        >
        <TButton
          type="secondary"
          allow-guests
          to="https://forms.gle/EeKJXy3wuDSyH25v7"
          target="_blank"
          >Redeem</TButton
        >
      </div>

      <h2 class="text-3xl font-extrabold text-center mt-4 mb-2">
        How it works
      </h2>
      <div class="flex gap-4 items-start mb-4">
        <div>
          <DeviceMobileIcon class="mt-1 text-primary w-6" />
        </div>
        <div>
          <div class="text-lg font-bold">Choose Amount & Recipient</div>
          <div class="text-sm text-gray-700">
            Select the gift amount and enter your friend's phone number.
          </div>
        </div>
      </div>
      <div class="flex gap-4 items-start mb-4">
        <div>
          <LinkIcon class="mt-1 text-primary w-6" />
        </div>
        <div>
          <div class="text-lg font-bold">Order & Receive the Card</div>
          <div class="text-sm text-gray-700">
            Place your order and get the gift card shipped to you—ready to
            present in person.
          </div>
        </div>
      </div>
      <div class="flex gap-4 items-start mb-4">
        <div>
          <ThumbUpIcon class="mt-1 text-primary w-6" />
        </div>
        <div>
          <div class="text-lg font-bold">Recipient Redeems the Gift</div>
          <div class="text-sm text-gray-700">
            The birthday person redeems their gift by filling out a form with
            their phone number and event link.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  DeviceMobileIcon,
  LinkIcon,
  ThumbUpIcon,
} from '@vue-hero-icons/outline'

export default {
  components: {
    DeviceMobileIcon,
    LinkIcon,
    ThumbUpIcon,
  },
}
</script>
