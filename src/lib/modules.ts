export interface ScanModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  buildPrompt: (competitorUrl: string) => string;
  resultSchema: Record<string, unknown>;
}

export const MODULES: ScanModule[] = [
  {
    id: "promotions",
    name: "Active Promotions",
    icon: "🏷️",
    description: "Current deals, discounts, flash sales, and free shipping offers",
    buildPrompt: (url: string) =>
      `Visit ${url} and analyze all currently active promotions, discounts, and offers visible on the site. Look for: homepage banners and hero offers, discount codes (popups, header bars, footer), sale/clearance sections with specific discount percentages, free shipping thresholds, countdown timers or urgency messaging, BOGO deals, loyalty program promotions. Be thorough - check the homepage, any sale/deals page, and look for popups or bars that appear.`,
    resultSchema: {
      type: "object",
      properties: {
        competitor: { type: "string" },
        promotions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              description: { type: "string" },
              discountAmount: { type: "string" },
              hasUrgency: { type: "boolean" },
              expiresIn: { type: "string" },
            },
            required: ["type", "description", "discountAmount", "hasUrgency", "expiresIn"],
          },
        },
        freeShippingThreshold: { type: "string" },
        overallAggressiveness: { type: "string" },
        summary: { type: "string" },
      },
      required: ["competitor", "promotions", "freeShippingThreshold", "overallAggressiveness", "summary"],
    },
  },
  {
    id: "ads",
    name: "Ad Campaigns",
    icon: "📢",
    description: "Active Meta/Facebook ads from the Ad Library transparency dashboard",
    buildPrompt: (url: string) =>
      `Go to the Meta Ad Library (https://www.facebook.com/ads/library/) and search for ads from the company that owns ${url}. Find their active advertisements. Report: how many ads are currently active, what products or collections they are pushing, what type of creatives they use (image vs video), the key messaging themes, how long the longest-running ads have been active, and any notable patterns. If you cannot find them on Meta Ad Library, try searching by their brand name derived from the URL.`,
    resultSchema: {
      type: "object",
      properties: {
        competitor: { type: "string" },
        totalActiveAds: { type: "number" },
        ads: {
          type: "array",
          items: {
            type: "object",
            properties: {
              creativetype: { type: "string" },
              messaging: { type: "string" },
              productFocus: { type: "string" },
              daysActive: { type: "number" },
            },
            required: ["creativetype", "messaging", "productFocus", "daysActive"],
          },
        },
        dominantTheme: { type: "string" },
        summary: { type: "string" },
      },
      required: ["competitor", "totalActiveAds", "ads", "dominantTheme", "summary"],
    },
  },
  {
    id: "social",
    name: "Social Media",
    icon: "📱",
    description: "Recent posts, content strategy, and engagement patterns",
    buildPrompt: (url: string) =>
      `Find the social media accounts (Instagram, Facebook, TikTok) for the company at ${url}. Analyze their recent social media activity from the last 2 weeks. Report: what products they are featuring, their posting frequency, content themes and formats (reels, carousels, static posts), any influencer collaborations or UGC, what seems to get the most engagement, and their overall content strategy. Check their Instagram and Facebook pages.`,
    resultSchema: {
      type: "object",
      properties: {
        competitor: { type: "string" },
        platforms: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { type: "string" },
              handle: { type: "string" },
              postsLast2Weeks: { type: "number" },
              topContentType: { type: "string" },
              featuredProducts: { type: "array", items: { type: "string" } },
            },
            required: ["platform", "handle", "postsLast2Weeks", "topContentType", "featuredProducts"],
          },
        },
        influencerCollabs: { type: "boolean" },
        contentStrategy: { type: "string" },
        summary: { type: "string" },
      },
      required: ["competitor", "platforms", "influencerCollabs", "contentStrategy", "summary"],
    },
  },
  {
    id: "pricing",
    name: "Pricing & Catalog",
    icon: "💰",
    description: "Price positioning, new products, and catalog changes",
    buildPrompt: (url: string) =>
      `Visit ${url} and analyze their pricing strategy and catalog. Report on: their price range (cheapest and most expensive products), any new arrivals or recently added products, best-seller or featured product sections, how they display pricing (do they show original vs sale price, bundles, etc.), their shipping costs and thresholds, and any notable catalog organization. Look at their navigation, collections/categories, and sort by newest if possible.`,
    resultSchema: {
      type: "object",
      properties: {
        competitor: { type: "string" },
        priceRange: {
          type: "object",
          properties: {
            lowest: { type: "string" },
            highest: { type: "string" },
            currency: { type: "string" },
          },
          required: ["lowest", "highest", "currency"],
        },
        newProducts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price: { type: "string" },
            },
            required: ["name", "price"],
          },
        },
        bestSellers: { type: "array", items: { type: "string" } },
        pricingTactics: { type: "array", items: { type: "string" } },
        shippingInfo: { type: "string" },
        summary: { type: "string" },
      },
      required: ["competitor", "priceRange", "newProducts", "bestSellers", "pricingTactics", "shippingInfo", "summary"],
    },
  },
  {
    id: "reviews",
    name: "Reputation & Reviews",
    icon: "⭐",
    description: "Customer ratings, top products, and common complaints from Trustpilot/Google",
    buildPrompt: (url: string) =>
      `Search for customer reviews of the company at ${url} on Trustpilot, Google Reviews, or any major review platform. Report: their overall rating, total number of reviews, recent review sentiment (are things improving or declining), what customers praise most, what customers complain about most, their best-rated products or services, and their worst-rated aspects. Also note their response rate to negative reviews if visible.`,
    resultSchema: {
      type: "object",
      properties: {
        competitor: { type: "string" },
        overallRating: { type: "number" },
        totalReviews: { type: "number" },
        platform: { type: "string" },
        recentTrend: { type: "string" },
        customerLoves: { type: "array", items: { type: "string" } },
        customerComplaints: { type: "array", items: { type: "string" } },
        bestRatedProducts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              rating: { type: "string" },
            },
            required: ["name", "rating"],
          },
        },
        respondsToNegative: { type: "boolean" },
        summary: { type: "string" },
      },
      required: ["competitor", "overallRating", "totalReviews", "platform", "recentTrend", "customerLoves", "customerComplaints", "bestRatedProducts", "respondsToNegative", "summary"],
    },
  },
];
