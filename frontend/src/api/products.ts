import api from './axios'

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  createdAt: string
}

export type ProductPayload = { name: string; price: number; stock: number }

export const getProducts = () => api.get<Product[]>('/products')
export const createProduct = (data: ProductPayload) => api.post<Product>('/products', data)
export const updateProduct = (id: string, data: Partial<ProductPayload>) =>
  api.patch<Product>(`/products/${id}`, data)
export const deleteProduct = (id: string) => api.delete(`/products/${id}`)
