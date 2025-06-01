<template>
  <div class="card mb-5 mb-xl-10">
    <div
      class="card-header border-0 cursor-pointer"
      role="button"
      data-bs-toggle="collapse"
      data-bs-target="#notifications"
    >
      <div class="card-title m-0">
        <h3 class="fw-bolder m-0">
          {{ t("notifications") }}
        </h3>
      </div>
    </div>
    <div id="notifications" class="collapse show">
      <div class="card-body border-top p-9">
        <div class="d-flex flex-column align-items-start gap-8">
          <CheckboxItem
            :enabled="subStatus.chatEnabled"
            :label="t('chatNotifications')"
            @change="
              handleSubStatusChange({
                chatEnabled: !subStatus.chatEnabled,
                calendarEnabled: subStatus.calendarEnabled,
              })
            "
            :checked="subStatus.chatEnabled"
            icon-name="message-text-2"
          />
          <CheckboxItem
            :enabled="subStatus.calendarEnabled"
            :label="t('calendarNotifications')"
            @change="
              handleSubStatusChange({
                chatEnabled: subStatus.chatEnabled,
                calendarEnabled: !subStatus.calendarEnabled,
              })
            "
            :checked="subStatus.calendarEnabled"
            icon-name="calendar"
          />
          <CheckboxItem
            :enabled="receiveEmailsOnNewEvent"
            :label="t('receiveEmailsOnNewEvent')"
            @change="
              updateReceiveEmailsOnNewEvent.mutate(
                {
                  receiveEmailsOnNewEvent: !receiveEmailsOnNewEvent,
                },
                {
                  onSuccess: () => {
                    toastSuccess(t('changeOptionsSuccess'));
                  },
                  onError: () => {
                    toastError(t('changeOptionsError'));
                  },
                }
              )
            "
            :checked="receiveEmailsOnNewEvent"
            icon-name="sms"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import WebPushService from "@/core/services/WebPushService";
import { useI18n } from "vue-i18n";
import { toastError, toastSuccess } from "@/util/toast";
import CheckboxItem from "./CheckboxItem.vue";
import { useMe, useUpdateReceiveEmailsOnNewEvent } from "@/server-state/me";
import { computed } from "vue";

const { t } = useI18n();

const subStatus = reactive<{
  chatEnabled: boolean;
  calendarEnabled: boolean;
}>({
  chatEnabled: false,
  calendarEnabled: false,
});

const requestSubStatus = async () => {
  const resp = await WebPushService.getServerSubscriptionStatus();
  subStatus.chatEnabled = resp.chatEnabled;
  subStatus.calendarEnabled = resp.calendarEnabled;
};

requestSubStatus();

const handleSubStatusChange = async (data: {
  chatEnabled: boolean;
  calendarEnabled: boolean;
}) => {
  let success = await WebPushService.tryUpdateSubscription(data);
  if (!success) {
    return toastError(t("changeOptionsError"));
  }

  toastSuccess(t("changeOptionsSuccess"));
  await requestSubStatus();
};

const me = useMe();

const receiveEmailsOnNewEvent = computed(() => {
  return me.data?.value?.receiveEmailsOnNewEvent ?? false;
});

const updateReceiveEmailsOnNewEvent = useUpdateReceiveEmailsOnNewEvent();
</script>
<i18n>
{
  "en": {
    "notifications": "Notifications",
    "changeOptionsError": "Error changing notification options",
    "changeOptionsSuccess": "Notification options changed successfully",
    "chatNotifications": "Chat notifications",
    "calendarNotifications": "Calendar notifications",
    "receiveEmailsOnNewEvent": "Receive emails on new events in calendar"
  },
  "es": {
    "notifications": "Notificaciones",
    "changeOptionsError": "Error cambiando las opciones de notificación",
    "changeOptionsSuccess": "Opciones de notificación cambiadas con éxito",
    "chatNotifications": "Notificaciones de chat",
    "calendarNotifications": "Notificaciones de calendario",
    "receiveEmailsOnNewEvent": "Recibir correos electrónicos por nuevos eventos en el calendario"
  }
}
</i18n>
