import { AuthService } from './authService';

export const BillingService = {
  /**
   * TODO for ANDROID/iOS DEVELOPER:
   * Currently, this is a dummy system for the web version (it only checks the registration date in Firebase).
   * When the app is packaged with Capacitor/React Native, replace this logic 
   * with the official Google Play Billing (e.g., via RevenueCat or Capacitor-Purchase-Plugin).
   * 
   * The logic should check if the user has an active subscription via the native store.
   */
  checkSubscriptionStatus: async (userId: string): Promise<boolean> => {
    try {
      // DUMMY LOGIC: Check if the user is older than 14 days
      // 1. Try to get from localStorage first (for offline support)
      const localKey = `trial_start_${userId}`;
      let createdAt = localStorage.getItem(localKey) ? parseInt(localStorage.getItem(localKey)!, 10) : null;

      // 2. If not in localStorage, fetch from Firebase and cache it
      if (!createdAt) {
        const profile = await AuthService.getUserProfile(userId);
        if (profile && profile.createdAt) {
          createdAt = profile.createdAt;
          localStorage.setItem(localKey, createdAt.toString());
        } else {
          // If no profile exists, we assume they are new
          return true; 
        }
      }

      const now = Date.now();
      const trialDurationMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
      const timeElapsed = now - createdAt;

      // Returns true if the user is still within the 14-day trial
      return timeElapsed <= trialDurationMs;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // Fallback to true so we don't lock out users on network errors
      return true;
    }
  },

  /**
   * TODO for ANDROID/iOS DEVELOPER:
   * This function is called when the user clicks "Subscribe Now" on the Paywall.
   * Here, the native Google Play / Apple App Store In-App Purchase dialog must be invoked.
   * 
   * NOTE ON OFFLINE USAGE: 
   * Users will often open this app in remote areas without internet. 
   * Native billing plugins (like RevenueCat) automatically cache the user's receipt/entitlement 
   * securely on the device. Ensure that your implementation checks this local cache first 
   * so users are not locked out when offline.
   * 
   * Example: await CapacitorPurchases.purchasePackage(packageId);
   */
  purchaseSubscription: async (): Promise<boolean> => {
    console.log("Dummy: Payment process started...");
    alert("In the final native app, the Google Play Store or Apple App Store purchase dialog will open here.");
    return true;
  }
};
