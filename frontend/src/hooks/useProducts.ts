import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/products'
import type { ProductPayload } from '../api/products'

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts().then((r) => r.data),
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductPayload) => api.createProduct(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductPayload> }) =>
      api.updateProduct(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
