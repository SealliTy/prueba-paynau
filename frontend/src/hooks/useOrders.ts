import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/orders'

export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders().then((r) => r.data),
  })

export const useCreateOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { productId: string; quantity: number }[]) =>
      api.createOrder(items).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
