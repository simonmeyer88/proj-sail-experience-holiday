<template>
  <div class="row mb-6">
    <label class="col-lg-4 col-form-label fw-semobold fs-6">{{ label }}</label>

    <div class="col-lg-8">
      <div class="image-input image-input-outline">
        <div class="image-input-wrapper overflow-hidden w-125px h-125px">
          <BaseImage class="w-100 h-100" :src="imageUrl" :alt="label" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseImage from "@/components/common/BaseImage.vue";

defineProps<{
  label: string;
  imageUrl?: string | null;
}>();
</script>
