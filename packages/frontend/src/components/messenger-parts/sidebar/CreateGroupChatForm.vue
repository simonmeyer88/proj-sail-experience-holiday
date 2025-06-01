<template>
  <VForm
    @submit="($event: any) => handleSubmit($event)"
    class="pt-5"
    :validation-schema="createChatSchema"
  >
    <ImageInput
      :label="t('image')"
      initial-image-url=""
      @change="($event: File) => (createChatImageInput = $event)"
    />
    <InputGroup
      :label="t('name')"
      name="name"
      type="text"
      :placeholder="t('enterChatName')"
    />
    <LoadableButton
      class="btn btn-primary"
      submit
      :loading="props.loading"
      :default-text="t('createChat')"
      color="primary"
    />
  </VForm>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  VForm,
  InputGroup,
  ImageInput,
  LoadableButton,
} from "@/components/form";
import { toastError } from "@/util/toast";
import { createChatSchema } from "@/validation-schemas/chat";

type SubmitData = {
  name: string;
  image: File;
};
const emit = defineEmits<{
  (ev: "submit", args: SubmitData): void;
}>();

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
const { t } = useI18n();

const createChatImageInput = ref<File | null>(null);

const handleSubmit = (data: { name: string }) => {
  if (!createChatImageInput.value) {
    return toastError(t("pleaseSelectAnImage"));
  }
  emit("submit", {
    name: data.name,
    image: createChatImageInput.value,
  });
};
</script>
<i18n>
  {
    "en": {
      "image": "Image",
      "name": "Name",
      "enterChatName": "Enter chat name",
      "createChat": "Create chat",
      "pleaseSelectAnImage": "Please select an image"
    },
    "es":{
      "image": "Imagen",
      "name": "Nombre",
      "enterChatName": "Ingrese el nombre del chat",
      "createChat": "Crear chat",
      "pleaseSelectAnImage": "Por favor seleccione una imagen"
    }
  }
</i18n>
