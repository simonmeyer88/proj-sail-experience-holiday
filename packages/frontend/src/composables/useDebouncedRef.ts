import { ref, Ref, MaybeRefOrGetter, toValue, watch } from "vue";

type DebounceFn = <T extends any[]>(
  fn: (...args: T) => void,
  delay: number,
  immediate: boolean
) => (...args: T) => void;

const debounce: DebounceFn = (fn, delay = 0) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, delay);
  };
};

/**
 * Debounce updates of a ref.
 *
 * @return A new debounced ref.
 */
export function refDebounced<T>(
  value: Ref<T>,
  ms: MaybeRefOrGetter<number> = 200
): Readonly<Ref<T>> {
  const debounced = ref(value.value as T) as Ref<T>;

  const updater = debounce(
    () => {
      debounced.value = value.value;
    },
    toValue(ms),
    true
  );

  watch(value, () => updater());

  return debounced;
}

// alias
export { refDebounced as useDebounce, refDebounced as debouncedRef };
