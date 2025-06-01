<i18n>
  {
    "en": {
      "quizzes": "Quizzes",
      "youDidATotalOf": "You did a total of",
      "lastMonth": "last month",
      "goToQuizzes": "Go to quizzes",

    },
    "es": {
      "quizzes": "Cuestionarios",
      "youDidATotalOf": "Has hecho un total de",
      "lastMonth": "el mes pasado",
      "goToQuizzes": "Ir a cuestionarios",
    }
  }
</i18n>
<template>
  <div class="card" v-if="!stats.isLoading.value">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold fs-3 mb-1">
          {{ t("quizzes") }}
        </span>

        <span class="text-muted fw-semobold fs-7">
          {{ t("youDidATotalOf") }}
          {{
            stats.data.value?.quizAttemptsSummary.lastMonth?.reduce(
              (acc, curr) => acc + curr.numberTaken,
              0
            )
          }}
          {{ t("quizzes").toLowerCase() }}
          {{ t("lastMonth") }}
        </span>
      </h3>
    </div>
    <div class="card-body">
      <apexchart
        ref="chartRef"
        type="area"
        :options="chart"
        :series="series"
      ></apexchart>
      <div class="d-flex justify-content-end">
        <RouterLink class="btn btn-light-primary mt-5" to="/student/quizzes">
          {{ t("goToQuizzes") }}
          <KTIcon icon-name="arrow-right" class="fs-2" />
        </RouterLink>
      </div>
    </div>
  </div>
  <LoadingComponent v-else :height="290" />
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue";
import { useThemeStore } from "@/stores/theme";
import type { ApexOptions } from "apexcharts";
import { getCSSVariableValue } from "@/assets/ts/_utils";
import type VueApexCharts from "vue3-apexcharts";
import { useStudentStats } from "@/server-state";
import { useI18n } from "vue-i18n";
import KTIcon from "../ui/KTIcon.vue";
import { LoadingComponent } from "../ui";

const { t } = useI18n();
const stats = useStudentStats();

const chartRef = ref<typeof VueApexCharts | null>(null);
let chart: ApexOptions = {};
const store = useThemeStore();

const series = computed(() => [
  {
    name: "Quizzes",
    data:
      stats.data.value?.quizAttemptsSummary.lastMonth.map((item) => [
        item.day,
        item.numberTaken,
      ]) || [],
  },
]);

const themeMode = computed(() => {
  return store.mode;
});

onBeforeMount(() => {
  Object.assign(chart, chartOptions());
});

const refreshChart = () => {
  if (!chartRef.value) {
    return;
  }

  Object.assign(chart, chartOptions());

  chartRef.value.refresh();
};

watch(themeMode, () => {
  refreshChart();
});

const chartOptions = (): ApexOptions => {
  const labelColor = getCSSVariableValue("--bs-gray-500");
  const borderColor = getCSSVariableValue("--bs-gray-200");
  const baseColor = getCSSVariableValue("--bs-info");
  const lightColor = getCSSVariableValue("--bs-info-light");

  return {
    chart: {
      defaultLocale: "en",
      fontFamily: "inherit",
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {},
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "solid",
      opacity: 1,
    },
    stroke: {
      curve: "smooth",
      show: true,
      width: 3,
      colors: [baseColor],
    },
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: labelColor,
          fontSize: "12px",
        },
      },
      crosshairs: {
        position: "front",
        stroke: {
          color: baseColor,
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColor,
          fontSize: "12px",
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: "none",
          value: 0,
        },
      },
      hover: {
        filter: {
          type: "none",
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "none",
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
    },
    colors: [lightColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      strokeColors: baseColor,
      strokeWidth: 3,
    },
  };
};
</script>
