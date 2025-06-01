<template>
  <div
    class="d-flex mb-6 justify-content-center align-items-center position-relative"
  >
    <div
      class="overflow-x-auto mx-12"
      ref="buttonGroup"
      style="scroll-behavior: smooth"
      @scroll="updateArrows"
    >
      <div class="btn-group" style="width: max-content">
        <button
          @click="$emit('update:currentFolder', folder)"
          class="btn btn-sm me-2"
          :class="{
            'btn-success': currentFolder === folder,
            'btn-secondary': currentFolder !== folder,
          }"
          v-for="folder in folders"
          :key="folder"
        >
          {{ folder }}
        </button>
      </div>
      <div
        class="arrow left-arrow btn btn-icon border border-gray-400 btn-sm"
        :class="{
          faded: fadeLeftArrow,
        }"
        @click="scrollLeft"
        v-if="showArrows"
      >
        <i class="ki-duotone ki-left fs-2hx"> </i>
      </div>
      <div
        class="arrow right-arrow btn btn-icon border border-gray-400 btn-sm"
        :class="{
          faded: fadeRightArrow,
        }"
        @click="scrollRight"
        v-if="showArrows"
      >
        <i class="ki-duotone ki-right fs-2hx"> </i>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from "vue";

defineProps<{
  folders: string[];
  currentFolder: string | null;
}>();

const buttonGroup = ref<HTMLElement | null>(null);
const fadeLeftArrow = ref(false);
const fadeRightArrow = ref(false);
const showArrows = ref(false);
const updateArrows = () => {
  if (buttonGroup.value) {
    fadeLeftArrow.value = buttonGroup.value.scrollLeft < 10;
    fadeRightArrow.value =
      buttonGroup.value.scrollLeft >
      buttonGroup.value.scrollWidth - buttonGroup.value.clientWidth - 10;

    showArrows.value =
      buttonGroup.value.scrollWidth > buttonGroup.value.clientWidth;
  }
};
onMounted(updateArrows);
onMounted(() => {
  window.addEventListener("resize", updateArrows);
});
onUpdated(updateArrows);

const scrollLeft = () => {
  if (buttonGroup.value) {
    buttonGroup.value.scrollLeft -= 100; // Adjust scroll amount as needed
  }
};

const scrollRight = () => {
  if (buttonGroup.value) {
    buttonGroup.value.scrollLeft += 100; // Adjust scroll amount as needed
  }
};
</script>
<style scoped>
.arrow {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  z-index: 1;
}

.arrow.faded {
  opacity: 0.2;
}
.left-arrow {
  left: 0;
}

.right-arrow {
  right: 0;
}
</style>
