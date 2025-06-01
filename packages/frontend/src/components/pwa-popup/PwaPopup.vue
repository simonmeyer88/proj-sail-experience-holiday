<template>
  <BaseModal
    data-testid="pwa-popup"
    top="8vh"
    :title="t('installApp')"
    :model-value="!dismissed && !!ytVideoId && !isStandalone"
    :max-width="370"
    :percent="90"
  >
    <div v-if="isIOS" data-testid="ios-instructions">
      <p>{{ t("bodyIos") }}</p>
    </div>
    <div v-else-if="isAndroid" data-testid="android-instructions">
      <p>{{ t("bodyAndroid") }}</p>
    </div>
    <div class="d-flex mb-4">
      <div class="flex-grow-1">
        <LiteYouTubeEmbed
          :id="(ytVideoId as string)"
          title="PWA"
          class="rounded"
        />
      </div>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-danger btn-sm" @click="handleDoNotAskAgain">
        {{ t("doNotAskAgain") }}
      </button>
      <button class="btn btn-primary btn-sm" @click="handleDismiss">
        {{ t("dismiss") }}
      </button>
    </div>
  </BaseModal>
</template>
<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
.yt-lite {
  width: 100%;
  height: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 0.75rem;
}
</style>

<script lang="ts" setup>
import { BaseModal } from "@/components/common";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import LiteYouTubeEmbed from "vue-lite-youtube-embed";

const LOCAL_STORAGE_KEY = "pwa-popup-do-not-ask-again";
const TRUE_STRING = "true";

const dismissed = ref(localStorage.getItem(LOCAL_STORAGE_KEY) === TRUE_STRING);

// isStandalone === heuristic for "is installed"
const isStandalone = ref(
  window.matchMedia("(display-mode: standalone)").matches
);

const handleDoNotAskAgain = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, TRUE_STRING);
  dismissed.value = true;
};

const handleDismiss = () => {
  dismissed.value = true;
};

const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isAndroid = /android/.test(window.navigator.userAgent.toLowerCase());

const ytVideoId = computed(() =>
  isAndroid
    ? (import.meta.env.VITE_APP_ANDROID_PWA_INSTALL_TUTORIAL_YT_ID as string)
    : isIOS
    ? (import.meta.env.VITE_APP_IOS_PWA_INSTALL_TUTORIAL_YT_ID as string)
    : null
);

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "installApp": "Install this app in your phone!",
    "doNotAskAgain": "Do not ask again",
    "dismiss": "Dismiss",
    "bodyIos": "We noticed you are using iOS. In order to install this app,
     click on the share button and then on 'Add to Home Screen'.
      You can also enable push notifications if you are using recent iOS versions. You can check the tutorial below.",
      "bodyAndroid": "We noticed you are using Android. In order to install this app on your device, click on the menu button and then on 'Install App'.
      You can also enable push notifications if you want. Chrome is recommended to install the app. You can check the tutorial below.",

  },
  "es": {
    "installApp": "¡Instala esta app en tu teléfono!",
    "doNotAskAgain": "No volver a preguntar",
    "dismiss": "Descartar",
    "bodyIos": "Hemos detectado que estás usando iOS. Para instalar esta app,
     haz click en el botón de compartir y luego en 'Añadir a la pantalla de inicio'.
      También puedes activar las notificaciones push si estás usando versiones recientes de iOS. Puedes ver el tutorial a continuación.",
      "bodyAndroid": "Hemos detectado que estás usando Android. Para instalar esta app en tu dispositivo, haz click en el botón de menú y luego en 'Instalar App'.
      También puedes activar las notificaciones push si quieres. Se recomienda usar Chrome para instalar la app. Puedes ver el tutorial a continuación.",
  },
}
</i18n>
