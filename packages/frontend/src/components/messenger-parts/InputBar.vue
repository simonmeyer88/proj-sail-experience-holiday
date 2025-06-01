<template>
  <div class="card-footer py-8 d-flex align-items-center gap-4">
    <input
      v-model="currentMessage"
      @keydown.enter="handleSendMessage"
      class="form-control"
      placeholder="Type a message"
    />

    <button
      @click="handleSendMessage"
      class="btn btn-primary"
      type="button"
      data-kt-element="send"
    >
      {{ t("send") }}
    </button>
  </div>
</template>
<i18n>
  {
    "es": {
      "send": "Enviar"
    },
    "en": {
      "send": "Send"
    }
  }
</i18n>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const currentMessage = ref("");
const emit = defineEmits<{
  (e: "sendMessage", value: string): void;
}>();

const handleSendMessage = () => {
  if (currentMessage.value) {
    emit("sendMessage", currentMessage.value);
    currentMessage.value = "";
  }
};
</script>
