<template>
  <div class="fv-row form-check form-switch d-flex align-items-center ps-3">
    <input
      :disabled="updateUserIsActive.isLoading.value"
      class="form-check-input mx-3"
      type="checkbox"
      :checked="data.isActive"
      :true-value="true"
      :false-value="false"
      @change="
        updateUserIsActive.mutate({
          id: data.id,
          isActive: !data.isActive,
        })
      "
    />
  </div>
</template>
<script lang="ts" setup>
import { useUpdateUserIsActive } from "@/server-state";

const updateUserIsActive = useUpdateUserIsActive();

const data = defineProps<{
  id: string;
  isActive: boolean;
}>();
</script>
