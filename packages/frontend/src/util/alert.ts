import Swal from "sweetalert2";

function addTestId(el: HTMLElement, testId: string) {
  el.setAttribute("data-testid", testId);
}

type AlertSuccessOptions = {
  title: string;
  text: string;
  confirmButtonText: string;
};
export function alertSuccess(options: AlertSuccessOptions) {
  Swal.fire({
    icon: "success",
    title: options.title,
    text: options.text,
    confirmButtonText: options.confirmButtonText,
    heightAuto: false,
    buttonsStyling: false,
    didOpen: (el) => {
      addTestId(el, "alert-success");
    },
  });
}

type AlertErrorOptions = {
  title: string;
  text?: string;
  confirmButtonText: string;
  onClose?: () => void;
};

export function alertError(options: AlertErrorOptions) {
  Swal.fire({
    icon: "error",
    title: options.title,
    text: options.text ?? undefined,
    confirmButtonText: options.confirmButtonText,
    heightAuto: false,
    buttonsStyling: false,
    customClass: {
      confirmButton: "btn fw-semibold btn-light-danger",
    },
    didOpen: (el) => {
      addTestId(el, "alert-error");
    },
  }).then((res) => {
    if (res.isConfirmed) {
      options.onClose?.();
    }
  });
}

type AlertConfirmOptions = {
  title: string;
  text?: string;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

export async function alertConfirm(options: AlertConfirmOptions) {
  const res = await Swal.fire({
    icon: "warning",
    title: options.title,
    text: options.text ?? undefined,
    confirmButtonText: options.confirmButtonText,
    showCancelButton: true,
    cancelButtonText: options.cancelButtonText,
    buttonsStyling: false,
    heightAuto: false,
    customClass: {
      confirmButton: "btn fw-semibold btn-danger",
      cancelButton: "btn fw-semibold btn-primary",
    },
    didOpen: (el) => {
      addTestId(el, "alert-confirm");
    },
  });

  if (res.isConfirmed) {
    options.onConfirm?.();
  }

  if (res.isDismissed) {
    options.onCancel?.();
  }

  return res.isConfirmed;
}
