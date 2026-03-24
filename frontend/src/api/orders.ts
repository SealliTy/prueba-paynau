import api from './axios'
import type { Product } from './products'

export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: Product
}

export interface Order {
  id: string
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  items: OrderItem[]
  createdAt: string
}

export const getOrders = () => api.get<Order[]>('/orders')
export const createOrder = (items: { productId: string; quantity: number }[]) =>
  api.post<Order>('/orders', { items })
