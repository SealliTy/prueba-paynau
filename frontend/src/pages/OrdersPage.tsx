import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useCreateOrder, useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'

const statusVariant = {
  pending: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
} as const

function OrderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: products = [] } = useProducts()
  const createOrder = useCreateOrder()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const availableProducts = products.filter((p) => p.stock > 0)

  const items = Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .map(([productId, quantity]) => ({ productId, quantity }))

  const total = items.reduce((acc, { productId, quantity }) => {
    const product = products.find((p) => p.id === productId)
    return acc + (product ? Number(product.price) * quantity : 0)
  }, 0)

  const setQty = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const product = products.find((p) => p.id === productId)
      const max = product?.stock ?? 0
      const next = Math.min(Math.max(0, (prev[productId] ?? 0) + delta), max)
      return { ...prev, [productId]: next }
    })
  }

  const handleClose = () => {
    setQuantities({})
    onClose()
  }

  const handleSubmit = () => {
    createOrder.mutate(items, { onSuccess: handleClose })
  }

  const errorMsg = (
    createOrder.error as { response?: { data?: { message?: string | string[] } } } | null
  )?.response?.data?.message

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva orden</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {availableProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay productos disponibles para ordenar.
            </p>
          ) : (
            availableProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${Number(product.price).toFixed(2)} &middot; {product.stock} en stock
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => setQty(product.id, -1)}
                    disabled={(quantities[product.id] ?? 0) === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm tabular-nums">
                    {quantities[product.id] ?? 0}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => setQty(product.id, 1)}
                    disabled={(quantities[product.id] ?? 0) >= product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {errorMsg && (
          <p className="text-sm text-destructive">
            {Array.isArray(errorMsg) ? errorMsg[0] : errorMsg}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <span className="font-semibold">Total: ${total.toFixed(2)}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={items.length === 0 || createOrder.isPending}>
              Crear orden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Ordenes</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha de creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aún no cuentas con ordenes
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8)}&hellip;
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status] ?? 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {order?.items?.map((item) => (
                          <p key={item.id} className="text-xs text-muted-foreground">
                            {item.product.name} &times; {item.quantity}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <OrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
