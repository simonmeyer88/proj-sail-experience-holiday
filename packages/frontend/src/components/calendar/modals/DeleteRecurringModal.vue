<template>
  <el-dialog
    class="delete-recurring-event"
    v-model="isOpen"
    :title="t('delete')"
  >
    <el-radio-group class="options" v-model="deleteOption">
      <el-radio label="event">
        {{ t("thisEvent") }}
      </el-radio>

      <el-radio label="all">
        {{ t("allEvents") }}
      </el-radio>
    </el-radio-group>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isOpen = false">
          {{ t("cancel") }}
        </el-button>
        <el-button type="primary" @click="confirm">
          {{ t("confirm") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<i18n>
{
    "en": {
        "thisEvent": "This event",
        "allEvents": "This and following events",
        "cancel": "Cancel",
        "confirm": "Confirm",
        "delete": "Delete recurring event"
    },

    "es": {
        "thisEvent": "Este evento",
        "allEvents": "Este y los siguientes eventos",
        "cancel": "Cancelar",
        "confirm": "Confirmar",
        "delete": "Eliminar evento recurrente"
    }
}
</i18n>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: Props["modelValue"]): void;
  (e: "submit", value: "all" | "event"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const deleteOption = ref<"all" | "event">("event");

const { t } = useI18n();

const isOpen = computed({
  get() {
    return props.modelValue;
  },

  set(value) {
    emits("update:modelValue", value);
  },
});

const confirm = () => {
  emits("submit", deleteOption.value);
  isOpen.value = false;
  deleteOption.value = "event";
};
</script>

<style scoped lang="scss">
.options {
  flex-direction: column;
  align-items: flex-start;
}

.delete-recurring-event {
  --el-dialog-width: 500px;
}
</style>

<style lang="scss">
.delete-recurring-event {
  --el-dialog-width: 500px;

  @media screen and (max-width: 551px) {
    --el-dialog-width: 85%;
  }
}
</style>
