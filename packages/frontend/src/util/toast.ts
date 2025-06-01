import { toast } from "vue-sonner";

export const toastSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const toastError = (message: string) => {
  toast.error(message, {
    duration: 3000,
  });
};
