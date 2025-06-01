import * as yup from "yup";

export const addPaymentSchema = yup.object().shape({
  amount: yup.number().required(),
  method: yup.string().required(),
  type: yup.string().required(),
  paidAt: yup.date().required(),
  userId: yup.string().required(),
});
