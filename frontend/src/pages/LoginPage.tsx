import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { setToken } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: () => authApi.login(email, password).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.access_token)
      navigate('/products')
    },
  })

  const register = useMutation({
    mutationFn: () => authApi.register(email, password),
    onSuccess: () => {
      setTab('login')
      register.reset()
    },
  })

  const mutation = tab === 'login' ? login : register
  const errorMsg =
    (mutation.error as { response?: { data?: { message?: string | string[] } } })?.response?.data
      ?.message

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Paynau Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'register'); mutation.reset() }}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Registro</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} forceMount>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {errorMsg && (
                  <p className="text-sm text-destructive">
                    {Array.isArray(errorMsg) ? errorMsg[0] : errorMsg}
                  </p>
                )}
                {tab === 'register' && register.isSuccess && (
                  <p className="text-sm text-green-600">Cuenta creada — Ahora puedes ingresar.</p>
                )}
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {tab === 'login' ? 'Sign in' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
