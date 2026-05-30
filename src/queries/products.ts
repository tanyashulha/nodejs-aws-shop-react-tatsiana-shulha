import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";
import {
  assertOkResponse,
  getAuthorizedRequestConfig,
} from "~/setupAxios";

export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axios.get<AvailableProduct[]>(
        `${API_PATHS.product}/products`,
        getAuthorizedRequestConfig()
      );
      return assertOkResponse(res);
    }
  );
}

export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const res = await axios.get<AvailableProduct>(
        `${API_PATHS.product}/products/${id}`,
        getAuthorizedRequestConfig()
      );
      return assertOkResponse(res);
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) =>
    axios
      .post<AvailableProduct>(
        `${API_PATHS.product}/products`,
        values,
        getAuthorizedRequestConfig()
      )
      .then(assertOkResponse)
  );
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios
      .delete(`${API_PATHS.bff}/product/${id}`, getAuthorizedRequestConfig())
      .then(assertOkResponse)
  );
}
