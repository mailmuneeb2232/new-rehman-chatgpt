export const featureFlags = {
  enable3DViewer: true,
  enableWishlist: true,
  enableReviews: true,
  enableGuestCheckout: false,
  enableNewsletterSignup: true,
  enableLiveChat: false,
  enableAiRecommendations: false,
  enableMultiCurrency: false,
  enableMultiLanguage: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
