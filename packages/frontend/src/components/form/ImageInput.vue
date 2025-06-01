<template>
  <div class="row mb-6">
    <label class="col-lg-4 col-form-label fw-semibold fs-6">{{ label }}</label>
    <div class="col-lg-8">
      <div class="image-input image-input-outline">
        <div
          class="image-input-wrapper overflow-hidden w-125px h-125px"
          data-testid="image-input-wrapper"
        >
          <BaseImage
            style="object-position: center"
            class="w-100 h-100 object-fit-cover object-position"
            :src="currentImageUrl"
            :alt="label"
          />
        </div>
        <label
          class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow position-absolute"
          style="top: 0; right: 0; transform: translate(50%, -50%)"
          data-testid="image-input-edit"
        >
          <i class="bi bi-pencil-fill fs-7"></i>
          <input
            class="d-none"
            type="file"
            name="avatar"
            accept=".png, .jpg, .jpeg"
            @change="onFileChange"
          />
        </label>
      </div>
      <div class="form-text">{{ t("allowedFormats") }}</div>
      <div class="form-text">
        {{ t("maxSize") }}
      </div>
    </div>
  </div>
</template>

<i18n>
  {
    "es": {
      "tooLarge": "La imagen debe pesar menos de 10MB",
      "maxSize": "Tamaño máximo: 10MB",
      "allowedFormats": "Formatos permitidos: png, jpg, jpeg.",
      "invalidFormat": "Formato inválido"
    }, 
    "en": {
      "tooLarge": "Image must be less than 10MB",
      "maxSize": "Max size: 10MB",
      "allowedFormats": "Allowed formats: png, jpg, jpeg.",
      "invalidFormat": "Invalid format"
    }
  }
</i18n>
<script lang="ts" setup>
import { ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{
  label: string;
  initialImageUrl: string;
}>();
import { toastError } from "@/util/toast";
import {
  MAX_PROFILEPIC_FILE_SIZE,
  VALID_PROFILEPIC_MIMETYPES,
} from "@aula-anclademia/common/validation-constants";
import BaseImage from "@/components/common/BaseImage.vue";

const emit = defineEmits<{
  (e: "change", value: File): void;
}>();

const currentImageUrl = ref(toRefs(props).initialImageUrl.value);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files![0];
  if (!VALID_PROFILEPIC_MIMETYPES.includes(file.type)) {
    toastError(t("invalidFormat"));
    return;
  }
  if (file.size > MAX_PROFILEPIC_FILE_SIZE) {
    toastError(t("tooLarge"));
    return;
  }
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  emit("change", file);
};
</script>
