<template>
  <ElDialog
    class="rounded-3 border border-gray-400 border"
    :model-value="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :destroy-on-close="true"
    :style="{
      maxWidth: props.maxWidth + 'px',
      width: props.percentalWidth + '%',
    }"
    :title="props.title"
  >
    <slot></slot>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ElDialog } from "element-plus";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  maxWidth: {
    type: Number,
    default: 770,
  },
  percentalWidth: {
    type: Number,
    default: 92,
  },
});
</script>

<style>
.el-dialog__title {
  font-size: 1.65rem;
  font-weight: 500;
}
</style>
