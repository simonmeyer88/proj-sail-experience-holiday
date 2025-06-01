<template>
  <div class="countdown">
    <Countdown
      countdownSize="2rem"
      mainFlipBackgroundColor="#f1416c"
      secondFlipBackgroundColor="#d53258"
      mainColor="#fff"
      labelSize="1rem"
      secondFlipColor="#fff"
      :deadline="date"
      :labels="labels"
      @timeElapsed="emits('timeElapsed')"
    />
  </div>
</template>

<script setup lang="ts">
import { Countdown } from "vue3-flip-countdown";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { format } from "date-fns";

const { t } = useI18n();

const props = defineProps<{ deadline: Date | string }>();
const emits = defineEmits<{ (e: "timeElapsed"): void }>();

const date = computed(() => {
  return format(props.deadline, "yyyy-MM-dd HH:mm:ss");
});

const labels = {
  days: t("days"),
  hours: t("hours"),
  minutes: t("minutes"),
  seconds: t("seconds"),
};
</script>

<style lang="scss">
.countdown {
  width: fit-content;
  color: #d53258;

  .flip-card__bottom,
  .flip-card__back-bottom {
    border: none !important;
  }
}
</style>

<i18n>
{
    "en": {
        "days": "Days",
        "hours": "Hours",
        "minutes": "Minutes",
        "seconds": "Seconds"
    },

    "es": {
        "days": "Días",
        "hours": "Horas",
        "minutes": "Minutos",
        "seconds": "Segundos"
    }
}
</i18n>
