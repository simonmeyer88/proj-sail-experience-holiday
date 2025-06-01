<template>
  <div id="kt_app_content" class="app-content flex-column-fluid h-100">
    <div id="kt_app_content_container" class="app-container h-100">
      <Suspense>
        <template #fallback>
          <div class="d-flex justify-content-center py-10">
            <div class="spinner spinner-primary spinner-lg"></div>
          </div>
        </template>
        <RouterView></RouterView>
      </Suspense>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { contentWidthFluid } from "@/core/helpers/config";
import { RouterView } from "vue-router";

export default defineComponent({
  name: "default-layout-content",
  components: {
    RouterView,
  },
  setup() {
    return {
      contentWidthFluid,
    };
  },
});
</script>
