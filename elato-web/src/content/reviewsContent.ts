/**
 * Home → Reviews ("Guest Experiences") section content. `reviewsFallback`
 * here is the fallback shown only when the backend has no featured reviews
 * yet (GOOGLE_PLACES_API_KEY/GOOGLE_PLACE_ID not configured, or a sync
 * failure) — see ReviewsSection.tsx, which fetches real reviews from
 * GET /api/v1/reviews/featured via reviewsRepository and only falls back
 * to this array on an empty/error result.
 *
 * These five are real, verbatim Google reviews for ELATŌ CELEBRÉ (supplied
 * directly, not invented) — all five confirmed 5-star reviews on the live
 * listing. `reviewDate` is the approximate date each review was posted;
 * TestimonialCard computes "X months ago"/"NEW" from it at render time
 * instead of a hardcoded string, so it stays accurate instead of drifting
 * like a fixed snapshot would. The Places sync replaces this fallback with
 * live data once credentials are configured.
 */

export interface ReviewFallbackItem {
  id: string
  author: string
  rating: number | null
  text: string
  /** ISO date (YYYY-MM-DD), approximate — see note above. */
  reviewDate?: string
  /** Google doesn't expose reviewer photos via the Places API, and these
   * are real named guests, so we never attach a stock/stranger's photo to
   * their name. This just picks which illustrated avatar silhouette
   * (masc./fem.) the card renders — inferred from the reviewer's given name. */
  gender: 'male' | 'female'
}

export const reviewsHeading = {
  overline: 'Guest Experiences',
  title: 'What Our Guests Say',
  description: 'Real experiences shared by guests who celebrated, dined, and stayed with ELATŌ.',
}

export const reviewsFallback: ReviewFallbackItem[] = [
  {
    id: 'google-azar-asieq',
    author: 'azar asieq',
    rating: 5,
    reviewDate: '2026-02-15',
    gender: 'male',
    text: "Exceptional Experience at Elato Célèbre in Panemangalore! Visited this newly opened ice cream boutique in Panemangalore yesterday and was blown away by the Tadukola Iceland flavor—it's so tasty and deliciously crave-worthy! Much needed in the BC Road area. The ambience delivers a happening vibe perfect for ice cream lovers, and the staff provides outstanding hospitality. Undoubtedly deserves 5⭐—a must-visit!",
  },
  {
    id: 'google-janet-d-cruz',
    author: 'Janet D cruz',
    rating: 5,
    reviewDate: '2026-05-15',
    gender: 'female',
    text: 'If you want to taste the most delicious ice creams, you should choose this place. The Mango Panna Cotta was a real standout. Chef Roshan suggested an amazing recipe. We also tried the Gadbad Ice Cream and two different pizzas, all of which were delicious. The ambience was attractive, seating was comfortable, and the service was prompt. Overall, a fantastic experience. We love ELATO CELEBRE ❤️',
  },
  {
    id: 'google-aster-ahmed',
    author: 'Aster Ahmed',
    rating: 5,
    reviewDate: '2026-02-10',
    gender: 'female',
    text: "Ambience-wise, it's great. The Spanish Delight scoop and Nutella Cheesecake were good. The Dubai Pistachio Melt tasted excellent, though the temperature was inconsistent. Cheesy fries were enjoyable, and the smiley pops were decent. Pricing was more affordable than expected considering the premium ambience. Overall, a nice experience.",
  },
  {
    id: 'google-fahad-ummi',
    author: 'Fahad Ummi',
    rating: 5,
    reviewDate: '2026-07-08',
    gender: 'male',
    text: 'I had a wonderful experience at Elato Celebre! The food was absolutely delicious and full of flavor. Every dish was fresh, tasty, and beautifully prepared. I highly recommend everyone to visit Elato Celebre. It\'s definitely a place worth trying!',
  },
  {
    id: 'google-pushparaj-kulal',
    author: 'Pushparaj kulal',
    rating: 5,
    reviewDate: '2026-07-09',
    gender: 'male',
    text: 'I visited this Elato café and was absolutely blown away by the quality. The ice cream was incredibly smooth and creamy. I tried the Elato Special Gudbud, and the flavor was rich and authentic. The café was impeccably clean, the staff was welcoming, and the service was surprisingly fast despite the crowd. Great value for money. Highly recommended!',
  },
]
