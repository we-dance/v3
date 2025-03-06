/**
 * This plugin adds the Stripe Pricing Table script to the head
 */
export default function({ app }) {
  // Add Stripe Pricing Table script to the head
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://js.stripe.com/v3/pricing-table.js'
  document.head.appendChild(script)
}
