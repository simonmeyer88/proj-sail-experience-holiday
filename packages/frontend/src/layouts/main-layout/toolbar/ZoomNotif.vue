<template>
  <div
    class="rounded cursor-pointer d-flex justify-content-center align-items-center"
    @click="handleClick"
    v-if="!!currentMeeting"
  >
    <div
      class="border border-danger bg-light-danger h-100 w-100 rounded text-danger d-flex align-items-center justify-content-center px-3 py-2"
    >
      <i
        class="ki-duotone ki-profile-user"
        style="margin-right: 5px; animation: pulse 1s infinite; font-size: 20px"
      >
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
        <i class="path4"></i>
      </i>
      <div class="d-flex flex-column">
        <span style="font-weight: bold; display: block"
          >Clase en directo en curso
        </span>
        <span class="fw-bold text-primary"
          >Click aquí <span class="text-danger"> para unirse </span></span
        >
      </div>
    </div>
  </div>
  <BaseModal
    v-model="showModal"
    title="Clase en directo en curso"
    :maxWidth="400"
  >
    <div
      class="d-flex align-items-center rounded gap-2 border border-warning bg-light-warning p-2"
    >
      <i class="ki-duotone ki-information-5 text-warning fs-3x">
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
      </i>
      <span class="fw-bold">
        Hay una clase en directo en curso. ¿Quieres unirte?
      </span>
    </div>
    <div class="d-flex justify-content-end mt-8 gap-2">
      <button class="btn btn-danger btn-sm" @click="showModal = false">
        Descartar
      </button>
      <button class="btn btn-success ml-2 btn-sm" @click="handleClick">
        Click aquí para unirse
      </button>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import ApiService from "@/core/services/ApiService";
import BaseModal from "@/components/common/BaseModal.vue";

const currentMeeting = ref<any>(null);
const showModal = ref(false);
const fetchData = async () => {
  try {
    const data = await ApiService.get("zoom/meeting");
    if (data) {
      if (currentMeeting.value === null) {
        showModal.value = true;
      }
      currentMeeting.value = data;
    } else {
      currentMeeting.value = null;
    }
  } catch (error) {
    console.error(error);
  }
};

let interval: any;

onMounted(() => {
  fetchData();
  interval = setInterval(fetchData, 3000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const handleClick = () => {
  if (currentMeeting.value) {
    window.open(currentMeeting.value.joinUrl, "_blank", "noopener noreferrer");
  }
};
</script>
