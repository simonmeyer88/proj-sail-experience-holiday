<template>
  <Transition name="fade">
    <span class="scroll-top" v-if="show" @click="scrollToTop">
      <i class="bi bi-arrow-up fs-2 text-white"></i>
    </span>
  </Transition>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const show = ref(false);
onMounted(() => {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      show.value = true;
    } else {
      show.value = false;
    }
  });
});
</script>

<style lang="scss" scoped>
@import "@/assets/sass/components/_variables.custom.scss";
.scroll-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary;
  border-radius: 10px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.scroll-top:hover {
  background: $primary-active;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
