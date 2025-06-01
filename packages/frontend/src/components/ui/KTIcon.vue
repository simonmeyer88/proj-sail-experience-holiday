<template>
  <i
    :class="`ki-${iconType} ki-${props.iconName}${
      props.iconClass ? ' ' + props.iconClass : ''
    }`"
  >
    <template
      v-if="icons[props.iconName as keyof typeof icons]
     && iconType === 'duotone'"
    >
      <span
        v-for="i in icons[props.iconName as keyof typeof icons]"
        :key="i"
        :class="`path${i}`"
      ></span>
    </template>
  </i>
</template>

<script setup lang="ts">
import icons from "@/core/helpers/icons.json";

const props = defineProps({
  iconName: { type: String, default: "", required: true },
  iconType: {
    type: String,
    default: "solid",
    required: false,
  },
  iconClass: { type: String, default: "", required: false },
});
</script>
