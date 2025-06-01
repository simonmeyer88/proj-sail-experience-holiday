<template>
  <div class="table-responsive">
    <table
      :class="[loading && 'overlay overlay-block']"
      class="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer"
    >
      <TableHeadRow
        @onSort="onSort"
        @onSelect="selectAll"
        :checkboxEnabledValue="check"
        :checkboxEnabled="checkboxEnabled"
        :sort-label="sortLabel"
        :sort-order="sortOrder"
        :header="header"
      />
      <TableBodyRow
        v-if="data.length !== 0"
        @onSelect="itemsSelect"
        :currentlySelectedItems="selectedItems"
        :data="data"
        :header="header"
        :checkbox-enabled="checkboxEnabled"
        :checkbox-label="checkboxLabel"
      >
        <template v-for="(_, name) in $slots" v-slot:[name]="{ row: item }">
          <slot :name="name" :row="item" />
        </template>
      </TableBodyRow>
      <template v-else>
        <tr class="odd">
          <td colspan="7" class="dataTables_empty">
            {{ t("noData") }}
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<i18n>
  {
    "en": {
      "noData": "No data available"
    },
    "es": {
      "noData": "No hay datos disponibles"
    }
  } 
</i18n>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import TableHeadRow from "@/components/kt-datatable/table-partials/table-content/table-head/TableHeadRow.vue";
import TableBodyRow from "@/components/kt-datatable/table-partials/table-content/table-body/TableBodyRow.vue";
import type { Sort } from "@/components/kt-datatable/table-partials/models";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits<{
  (e: "on-sort", sort: Sort): void;
  (e: "on-items-select", items: Array<unknown>): void;
}>();
const props = defineProps({
  header: { type: Array, required: true },
  data: { type: Array, required: true },
  sortLabel: { type: String, required: false, default: null },
  sortOrder: {
    type: String as () => "asc" | "desc",
    required: false,
    default: "asc",
  },
  checkboxEnabled: { type: Boolean, required: false, default: false },
  checkboxLabel: { type: String, required: false, default: "id" },
  loading: { type: Boolean, required: false, default: false },
});

const selectedItems = ref<Array<unknown>>([]);
const allSelectedItems = ref<Array<unknown>>([]);
const check = ref<boolean>(false);

watch(
  () => props.data,
  () => {
    selectedItems.value = [];
    allSelectedItems.value = [];
    check.value = false;
    props.data.forEach((item: any) => {
      if (item[props.checkboxLabel]) {
        allSelectedItems.value.push(item[props.checkboxLabel]);
      }
    });
  }
);

const selectAll = (checked: any) => {
  check.value = checked;
  if (checked) {
    selectedItems.value = [
      ...new Set([...selectedItems.value, ...allSelectedItems.value]),
    ];
  } else {
    selectedItems.value = [];
  }
};

const itemsSelect = (value: any) => {
  selectedItems.value = [];
  value.forEach((item: any) => {
    if (!selectedItems.value.includes(item)) selectedItems.value.push(item);
  });
};

const onSort = (sort: Sort) => {
  emit("on-sort", sort);
};

watch(
  () => [...selectedItems.value],
  (currentValue) => {
    if (currentValue) {
      emit("on-items-select", currentValue);
    }
  }
);

onMounted(() => {
  selectedItems.value = [];
  allSelectedItems.value = [];
  allSelectedItems.value = [];
  check.value = false;
  props.data.forEach((item: any) => {
    if (item[props.checkboxLabel]) {
      allSelectedItems.value.push(item[props.checkboxLabel]);
    }
  });
});
</script>
