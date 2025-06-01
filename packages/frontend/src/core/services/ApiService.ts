import type { App } from "vue";
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import VueAxios from "vue-axios";
import qs from "qs";
import i18n from "../plugins/i18n";
import { watch } from "vue";
import AuthService from "./AuthService";

export class ApiError extends Error {
  public status: number;
  public headers: any;

  constructor(error: AxiosError) {
    const response = error.response as AxiosResponse;
    super(response?.data?.message || response?.statusText || "Unknown Error");
    this.status = response?.status || 0;
  }
}

/**
 * @description service to call HTTP request via Axios
 */

class ApiService {
  public static vueInstance: App;

  public static async init(app: App<Element>) {
    ApiService.vueInstance = app;
    ApiService.vueInstance.use(VueAxios, axios);
    ApiService.vueInstance.axios.defaults.baseURL = import.meta.env
      .VITE_APP_API_URL as string;

    // Enable sending cookies with cross-origin requests
    ApiService.vueInstance.axios.defaults.withCredentials = true;

    ApiService.vueInstance.axios.defaults.headers.common["x-lang"] =
      i18n.global.locale.value;

    watch(i18n.global.locale, (newVal) => {
      ApiService.vueInstance.axios.defaults.headers.common["x-lang"] = newVal;
    });

    ApiService.vueInstance.axios.defaults.headers.common[
      "x-csrf-protection"
    ] = 1;

    await AuthService.checkAuth();
  }

  public static async query<R>(resource: string): Promise<R> {
    try {
      return (await ApiService.vueInstance.axios.get<R>(resource)).data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }

  public static async get<R>(
    resource: string,
    params?: Record<string, any>
  ): Promise<R> {
    try {
      return (
        await ApiService.vueInstance.axios.get<R>(resource, {
          params: params,
          paramsSerializer: {
            serialize: (params: any) => {
              return qs.stringify(params, { arrayFormat: "repeat" });
            },
          },
        })
      ).data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }

  public static async post<R>(resource: string, data: any): Promise<R> {
    try {
      return (await ApiService.vueInstance.axios.post<R>(resource, data)).data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }

  public static async update<R>(resource: string, data: any): Promise<R> {
    try {
      return (await ApiService.vueInstance.axios.put<R>(resource, data)).data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }

  public static async put<R>(resource: string, data: any): Promise<R> {
    try {
      return (await ApiService.vueInstance.axios.put<R>(resource, data)).data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }

  public static async delete<R>(
    resource: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    try {
      return (await ApiService.vueInstance.axios.delete<R>(resource, config))
        .data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }

  public static async patch<R>(resource: string, data: any): Promise<R> {
    try {
      return (await ApiService.vueInstance.axios.patch<R>(resource, data)).data;
    } catch (e: unknown) {
      const error = e as AxiosError;
      throw new ApiError(error);
    }
  }
}

export default ApiService;
