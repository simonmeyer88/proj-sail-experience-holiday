<template>
  <tbody class="fw-semibold text-gray-600">
    <template v-for="(row, _i) in data" :key="_i">
      <tr>
        <td v-if="checkboxEnabled">
          <div
            class="form-check form-check-sm form-check-custom form-check-solid"
          >
            <input
              class="form-check-input"
              type="checkbox"
              :value="row[checkboxLabel]"
              v-model="selectedItems"
              @change="onChange"
            />
          </div>
        </td>
        <template v-for="(properties, j) in header" :key="j">
          <td :class="{ 'text-end': j === header.length - 1 }">
            <div
              :class="{ 'mx-auto': properties.center }"
              class="w-max-content"
            >
              <slot :name="`${properties.columnLabel}`" :row="row">
                {{ row }}
              </slot>
            </div>
          </td>
        </template>
      </tr>
    </template>
  </tbody>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "table-body-row",
  components: {},
  props: {
    header: { type: Array as () => Array<any>, required: true },
    data: { type: Array as () => Array<any>, required: true },
    currentlySelectedItems: { type: Array, required: false, default: () => [] },
    checkboxEnabled: { type: Boolean, required: false, default: false },
    checkboxLabel: {
      type: String as () => string,
      required: false,
      default: "id",
    },
  },
  emits: ["on-select"],
  setup(props, { emit }) {
    const selectedItems = ref<Array<any>>([]);

    watch(
      () => [...props.currentlySelectedItems],
      (currentValue) => {
        if (props.currentlySelectedItems.length !== 0) {
          selectedItems.value = [
            ...new Set([...selectedItems.value, ...currentValue]),
          ];
        } else {
          selectedItems.value = [];
        }
      }
    );

    const onChange = () => {
      emit("on-select", selectedItems.value);
    };

    return {
      selectedItems,
      onChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.text-end {
  text-align: end;
}
.w-max-content {
  width: max-content !important;
}

.text-end > .w-max-content {
  margin-left: auto;
}
</style>
