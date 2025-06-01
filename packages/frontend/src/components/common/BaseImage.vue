<template>
  <img
    :class="{ unknown: isErrorImage }"
    :src="pictureUrl"
    :alt="alt"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { ref, watch } from "vue";

const props = defineProps<{
  src: string | null | undefined;
  alt?: string;
}>();

const pictureUrl = ref(
  props.src ?? getAssetPath("media/default-profile-picture.png")
);
const isErrorImage = ref(false);

const onError = () => {
  isErrorImage.value = true;
  pictureUrl.value = getAssetPath("media/unknown.png");
};

watch(
  () => props.src,
  (src) => {
    if (src) pictureUrl.value = src;
  }
);
</script>

<style scoped lang="scss">
.unknown {
  object-position: center;
  object-fit: cover;
}
</style>
