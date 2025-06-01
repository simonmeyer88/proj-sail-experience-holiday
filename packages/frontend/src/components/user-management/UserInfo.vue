<template>
  <div class="d-flex gap-3 cursor-pointer">
    <BaseImage
      class="rounded"
      width="45"
      height="45"
      :src="pictureUrl"
      alt="Profile picture"
    />

    <div class="d-flex flex-column">
      <span class="fs-4 text-dark fw-bold">
        {{ firstName }} {{ lastName }}
        <span class="fs-4">{{ hasPaid ? "💰" : "" }}</span></span
      >
      <span>{{ email }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseImage from "@/components/common/BaseImage.vue";

defineProps<{
  hasPaid: boolean;
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl: string;
}>();
</script>
