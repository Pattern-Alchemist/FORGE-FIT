'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Quick-fill buttons for demo accounts
  const fillCoach = () => {
    setEmail('marcus@forge.coach')
    setPassword('forge123')
    setError(null)
  }
  const fillClient = () => {
    setEmail('elena@client.forge.coach')
    setPassword('client123')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password.')
      return
    }
    // Reload to let the server re-render with the session
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Flame className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-lg -z-10" />
          </div>
          <h1 className="text-display text-2xl text-foreground">Forge</h1>
          <p className="text-xs text-muted-foreground mt-1">Coaching, refined.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-premium rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9 h-11"
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 h-11"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-11 gap-2 font-medium"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border/60">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            Demo accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillCoach}
              className="text-left p-2.5 rounded-lg bg-card border border-border/60 hover:border-primary/30 transition-colors tap-smooth"
            >
              <div className="text-xs font-semibold text-foreground">Coach</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">marcus@forge.coach</div>
            </button>
            <button
              type="button"
              onClick={fillClient}
              className="text-left p-2.5 rounded-lg bg-card border border-border/60 hover:border-primary/30 transition-colors tap-smooth"
            >
              <div className="text-xs font-semibold text-foreground">Client</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">elena@client.forge.coach</div>
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2.5">
            Click an account to auto-fill, then press Sign in.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
