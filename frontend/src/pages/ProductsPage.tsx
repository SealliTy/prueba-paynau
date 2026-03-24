import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Product } from '../api/products'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from '../hooks/useProducts'

type FormState = { name: string; price: string; stock: string }

function ProductDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Product | null
}) {
  const [form, setForm] = useState<FormState>(
    editing
      ? { name: editing.name, price: String(editing.price), stock: String(editing.stock) }
      : { name: '', price: '', stock: '' }
  )

  const create = useCreateProduct()
  const update = useUpdateProduct()
  const isPending = create.isPending || update.isPending
  const error =
    (create.error || update.error) as { response?: { data?: { message?: string | string[] } } } | null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleResetAndCloseForm = () => {
    onClose()
    setForm({ name: '', price: '', stock: '' })
    create.reset()
    update.reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: form.name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    }
    if (editing) {
      update.mutate({ id: editing.id, data }, { onSuccess: () => { handleResetAndCloseForm() } })
    } else {
      create.mutate(data, { onSuccess: () => { handleResetAndCloseForm() } })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleResetAndCloseForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required minLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">
              {Array.isArray(error.response?.data?.message)
                ? error.response?.data?.message[0]
                : error.response?.data?.message ?? 'Ocurrió un error'}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleResetAndCloseForm} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editing ? 'Guardar cambios' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts()
  const deleteProduct = useDeleteProduct()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estas seguro de eliminar el producto?')) deleteProduct.mutate(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No products yet
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} />
    </div>
  )
}
