import { createApp } from "vue";
import { createPinia } from "pinia";
import { Tooltip } from "bootstrap";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import i18n from "@/core/plugins/i18n";

import es from "element-plus/es/locale/lang/es";

import ApiService from "@/core/services/ApiService";
import { initApexCharts } from "@/core/plugins/apexcharts";
import { initInlineSvg } from "@/core/plugins/inline-svg";
import { initVeeValidate } from "@/core/plugins/vee-validate";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { initYupLocale } from "@/core/yup";
import WebPushService from "./core/services/WebPushService";
import { initMoment } from "@/core/plugins/moment";

async function init() {
  const app = createApp(App);

  app.use(i18n);
  // get default browser language
  const browserLang = navigator.language.split("-")[0];

  i18n.global.locale.value = localStorage.getItem("lang")
    ? (localStorage.getItem("lang") as "en" | "es")
    : browserLang === "es"
    ? "es"
    : "en";

  initMoment();

  initYupLocale();

  await ApiService.init(app);

  app.use(createPinia());
  app.use(router);

  const locale = i18n.global.locale.value === "es" ? es : undefined;

  // Use Spanish locale if browser language is Spanish, else english(default)
  app.use(ElementPlus, {
    locale,
  });

  app.use(VueQueryPlugin);

  initApexCharts(app);
  initInlineSvg(app);
  initVeeValidate();

  app.directive("tooltip", (el) => {
    new Tooltip(el);
  });

  app.mount("#app");

  // This will return true if user has never configured push notifications
  const success =
    await WebPushService.tryReapplyLocalStorageSubscriptionStatus();
  if (success) {
    console.log("✅ Subscribed to push notifications on initial load");
  } else {
    console.log("❌ Could not subscribe to push notifications on initial load");
  }

  console.log("✅ WELCOME TO ANCLADEMIA!!!");
}

init().catch((err) => {
  console.error(err);
});
