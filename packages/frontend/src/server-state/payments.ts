import { useMutation, useQueryClient } from "@tanstack/vue-query";
import ApiService from "@/core/services/ApiService";
import type { CreatePaymentDto } from "./../../../backend/src/payments/dto/create-payment.dto";

export type PaymentMethod = CreatePaymentDto["method"];

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payment: CreatePaymentDto) => ApiService.post("/payments", payment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["payments"]);
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => ApiService.delete(`/payments/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      queryClient.invalidateQueries(["users"]);
    },
  });
};
