import { Ref, onMounted } from "vue";

export const useClickOutside = (
  elementRef: Ref<HTMLElement | null>,
  onClickOutside: () => void
) => {
  const handleClickOutside = (e: MouseEvent) => {
    if (
      elementRef.value &&
      !elementRef.value.contains(e.target as HTMLElement)
    ) {
      onClickOutside();
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });
};
