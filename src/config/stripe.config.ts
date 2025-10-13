import Stripe from "stripe";
import config from "./env";

export const stripe = new Stripe(config.STRIPE_SECRET_KEY,{
    apiVersion:'2025-05-28.basil'
})


export function getStripeUrls(): { success: string; cancel: string } {
  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'development':
      return {
        success: config.STRIPE_SUCCESS_URL,
        cancel: config.STRIPE_CANCEL_URL,
      };
    case 'tunnel':
      return {
        success: config.STRIPE_TUNNEL_SUCCESS_URL,
        cancel: config.STRIPE_TUNNEL_CANCEL_URL,
      };
    // case 'production':
    //   return {
    //     success: config.STRIPE_HOSTED_SUCCESS_URL,
    //     cancel: config.STRIPE_HOSTED_CANCEL_URL,
    //   };
    default:
      throw new Error(`Unknown env: ${env}. Check .env NODE_ENV.`);
  }
}