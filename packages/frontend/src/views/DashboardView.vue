<template>
  <LoadingComponent v-if="me.isLoading.value" />
  <DashboardAdmin v-if="me.data.value?.role === 'ADMIN'" />
  <DashboardTeacher v-if="me.data.value?.role === 'TEACHER'" />
  <DashboardStudent v-if="me.data.value?.role === 'STUDENT'" />
</template>
<script lang="ts" setup>
import { LoadingComponent } from "@/components/ui";
import { useMe } from "@/server-state";
import DashboardTeacher from "@/views/DashboardTeacher.vue";
import DashboardAdmin from "@/views/DashboardAdmin.vue";
import DashboardStudent from "@/views/DashboardStudent.vue";
const me = useMe();
</script>
