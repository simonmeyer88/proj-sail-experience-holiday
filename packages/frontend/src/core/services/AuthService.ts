/**
 * This class provides authentication functionality.
 */
import ApiService from "@/core/services/ApiService";
import { MeResponse } from "@/server-state";
import WebPushService from "./WebPushService";
import { ref } from "vue";
import { Ref } from "vue";

type State = "logged-out" | "logged-in";
export default class AuthService {
  public static lastState: Ref<State> = ref("logged-out");
  /**
   * Logs in a user with the provided credentials.
   * @param credentials - The user's email and password.
   * @returns A promise that resolves to the login response.
   */
  public static async login(credentials: { email: string; password: string }) {
    await ApiService.post("auth/login", credentials);
    AuthService.lastState.value = "logged-in";

    const success =
      await WebPushService.tryReapplyLocalStorageSubscriptionStatus();
    if (success) {
      console.log("✅ Subscribed to push notifications on login");
    } else {
      console.log("❌ Could not subscribe to push notifications on login");
    }
  }

  /**
   * Logs out the currently authenticated user.
   * @returns A promise that resolves to the logout response.
   */
  public static async logout() {
    // Unsubscribe from web push notifications, if applicable.
    await WebPushService.tryUnsubscribeFromServer();

    await ApiService.post("auth/logout", {});

    AuthService.lastState.value = "logged-out";
  }

  /**
   * Registers a new user with the provided credentials.
   * @param credentials - The user's email and password.
   * @returns A promise that resolves to the registration response.
   */
  public static async register(credentials: {
    email: string;
    password: string;
  }) {
    await ApiService.post("auth/register", credentials);
    AuthService.lastState.value = "logged-in";
  }

  /**
   * Checks if the user is authenticated.
   * @returns A promise that resolves to the user's information if authenticated, or null if not authenticated.
   */
  public static async checkAuth(): Promise<MeResponse | null> {
    try {
      const user = (await ApiService.get("users/me")) as MeResponse;
      AuthService.lastState.value = "logged-in";
      return user;
    } catch (e) {
      return null;
    }
  }
}
