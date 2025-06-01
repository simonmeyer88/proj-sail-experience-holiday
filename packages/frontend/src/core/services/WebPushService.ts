/**
 * This class provides functionality for managing web push subscriptions.
 */
import ApiService from "@/core/services/ApiService";
import { urlBase64ToUint8Array } from "@/util/parsing";
import AuthService from "./AuthService";

enum LocalStorageKeys {
  SUB_CHAT_ENABLED = "subChatEnabled",
  SUB_CALENDAR_ENABLED = "subCalendarEnabled",
}
export default class WebPushService {
  /**
   * Retrieves the VAPID public key from the server.
   * @returns The VAPID public key.
   */
  private static async getVapidPublicKey() {
    try {
      return await ApiService.post<string>("web-push/vapid-public-key", {});
    } catch (e) {
      console.warn("Failed to get VAPID public key", e);
      return null;
    }
  }

  /**
   * Retrieves the service worker registration.
   * @returns The service worker registration.
   */
  private static async getServiceWorkerRegistration() {
    try {
      return navigator.serviceWorker.getRegistration();
    } catch (e) {
      return null;
    }
  }

  /**
   * Retrieves the subscription status from local storage.
   * @returns The subscription status.
   * If the subscription status was not set previously, it will be set to true.
   * This is to ensure that the user will receive notifications by default.
   */
  public static retrieveLocalStorageSubscriptionStatus() {
    const chatEnabled = localStorage.getItem(LocalStorageKeys.SUB_CHAT_ENABLED);
    const calendarEnabled = localStorage.getItem(
      LocalStorageKeys.SUB_CALENDAR_ENABLED
    );

    // If config was not set previously, set it to true
    const unset = chatEnabled === null || calendarEnabled === null;
    return unset
      ? {
          chatEnabled: true,
          calendarEnabled: true,
        }
      : {
          chatEnabled: chatEnabled === "true",
          calendarEnabled: calendarEnabled === "true",
        };
  }

  /**
   * Stores the subscription status in local storage.
   * @param chatEnabled Whether chat notifications are enabled.
   * @param calendarEnabled Whether calendar notifications are enabled.
   */
  public static storeLocalStorageSubscriptionStatus({
    chatEnabled,
    calendarEnabled,
  }: {
    chatEnabled: boolean;
    calendarEnabled: boolean;
  }) {
    localStorage.setItem(
      LocalStorageKeys.SUB_CHAT_ENABLED,
      chatEnabled.toString()
    );
    localStorage.setItem(
      LocalStorageKeys.SUB_CALENDAR_ENABLED,
      calendarEnabled.toString()
    );
  }

  /**
   * Gets(or creates) a web subscription in the browser.
   * @returns The web push subscription, or null if no subscription could be found or created.
   */
  public static async getBrowserSubscription(): Promise<PushSubscription | null> {
    if (AuthService.lastState.value !== "logged-in") {
      return null;
    }
    const sw = await navigator.serviceWorker.ready;
    const registration = await WebPushService.getServiceWorkerRegistration();
    if (!registration) {
      console.warn("No service worker registration found -- aborting");
      return null;
    }

    let subscription: PushSubscription | null = null;
    try {
      subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const publicVapidKey = await WebPushService.getVapidPublicKey();
        if (!publicVapidKey) {
          throw new Error("No VAPID public key found");
        }
        const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
        subscription = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      return subscription;
    } catch (e) {
      console.error('&&&&&&&& Get subscription error:', e);
      console.warn("Failed to get subscription", e);
      return null;
    }
  }

  /**
   * Tries to subscribe or renew the subscription.
   * @param chatEnabled Whether chat notifications are enabled.
   * @param calendarEnabled Whether calendar notifications are enabled.
   * @returns Whether the subscription was successful.
   */
  public static async getServerSubscriptionStatus() {
    const subscription = await WebPushService.getBrowserSubscription();

    try {
      if (subscription) {
        const response = await ApiService.post<{
          chatEnabled: boolean;
          calendarEnabled: boolean;
        }>("web-push/subscription-status", {
          subscription,
        });
        return {
          chatEnabled: response.chatEnabled,
          calendarEnabled: response.calendarEnabled,
        };
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return {
      chatEnabled: false,
      calendarEnabled: false,
    };
  }
  /**
   * Tries to update subscription status. If both chatEnabled and calendarEnabled are false, the subscription will be deleted.
   * @param chatEnabled Whether chat notifications are enabled.
   * @param calendarEnabled Whether calendar notifications are enabled.
   * @returns Whether the subscription was successful.
   */
  public static async tryUpdateSubscription({
    chatEnabled,
    calendarEnabled,
    saveToLocalStorage = true,
  }: {
    chatEnabled: boolean;
    calendarEnabled: boolean;
    saveToLocalStorage?: boolean;
  }): Promise<boolean> {
    const subscription = await WebPushService.getBrowserSubscription();
    try {
      if (subscription) {
        await ApiService.post("web-push/subscription", {
          subscription,
          chatEnabled,
          calendarEnabled,
        });
        if (saveToLocalStorage) {
          WebPushService.storeLocalStorageSubscriptionStatus({
            chatEnabled,
            calendarEnabled,
          });
        }
        return true;
      }
    } catch (e) {
      console.warn("Failed to subscribe", e);
      return false;
    }
    return false;
  }

  public static async tryReapplyLocalStorageSubscriptionStatus() {
    const subscriptionStatus =
      WebPushService.retrieveLocalStorageSubscriptionStatus();
        
    const success = await WebPushService.tryUpdateSubscription(
      subscriptionStatus
    );
    return success;
  }

  /**
   * Tries to unsubscribe from web push notifications, but keeps the subscription in the browser.
   * Intended for use when logging out, so next login resuscribes automatically.
   * @returns Whether the unsubscription was successful.
   */
  public static async tryUnsubscribeFromServer() {
    return await WebPushService.tryUpdateSubscription({
      chatEnabled: false,
      calendarEnabled: false,
      saveToLocalStorage: false,
    });
  }
}
