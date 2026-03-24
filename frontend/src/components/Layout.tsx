import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Package, ShoppingCart } from 'lucide-react'
import { Button } from './ui/button'
import { removeToken } from '../lib/auth'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/products', label: 'Products', Icon: Package },
  { to: '/orders', label: 'Orders', Icon: ShoppingCart },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  const logout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg tracking-tight">Paynau Prueba</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
