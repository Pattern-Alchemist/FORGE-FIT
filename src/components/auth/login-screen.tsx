'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Mail, Lock, ArrowRight, Loader2, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'login' | 'signup' | 'forgot' | 'reset'

export function LoginScreen() {
  const searchParams = useSearchParams()
  const [mode, setMode] = React.useState<Mode>('login')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [age, setAge] = React.useState('')
  const [goal, setGoal] = React.useState('Hypertrophy')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [resetToken, setResetToken] = React.useState<string | null>(null)

  // Check for reset token in URL
  React.useEffect(() => {
    const reset = searchParams.get('reset')
    if (reset) {
      setResetToken(reset)
      setMode('reset')
    }
  }, [searchParams])

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
    setSuccess(null)

    try {
      if (mode === 'login') {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (res?.error) {
          setError('Invalid email or password.')
        } else {
          // Force a full page reload so useSession() picks up the new cookie
          window.location.href = '/'
        }
      } else if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName, age: Number(age), goal }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Signup failed')
        } else {
          setSuccess('Account created! You can now sign in.')
          setMode('login')
          setPassword('')
        }
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Request failed')
        } else {
          setSuccess('If that email exists, a reset link has been generated.')
          // Demo: show the reset URL
          if (data._devResetUrl) {
            setResetToken(data._devResetUrl.split('?reset=')[1])
            setSuccess(`Reset link generated. Click below to reset your password.`)
          }
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Reset failed')
        } else {
          setSuccess('Password updated! You can now sign in.')
          setMode('login')
          setResetToken(null)
          setPassword('')
          setConfirmPassword('')
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Flame className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-lg -z-10" />
          </div>
          <h1 className="text-display text-2xl text-foreground">Forge</h1>
          <p className="text-xs text-muted-foreground mt-1">Coaching, refined.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Form */}
            <form onSubmit={handleSubmit} className="card-premium rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                {mode !== 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground tap-smooth"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-base font-semibold text-foreground">
                  {mode === 'login' && 'Welcome back'}
                  {mode === 'signup' && 'Create your account'}
                  {mode === 'forgot' && 'Reset your password'}
                  {mode === 'reset' && 'Set a new password'}
                </h2>
              </div>

              {mode === 'signup' && (
                <>
                  <Field label="Full Name" icon={User}>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Athlete"
                      className="pl-9 h-11"
                      required
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Age</label>
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="28"
                        className="h-11"
                        required
                        min={13}
                        max={120}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Goal</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full h-11 px-3 text-sm rounded-lg bg-muted/40 border border-transparent focus:border-border outline-none"
                      >
                        <option>Hypertrophy</option>
                        <option>Fat Loss</option>
                        <option>Strength</option>
                        <option>General Fitness</option>
                        <option>Athletic Performance</option>
                        <option>Recomposition</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                <Field label="Email" icon={Mail}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9 h-11"
                    required
                    autoComplete="email"
                  />
                </Field>
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                <Field label={mode === 'reset' ? 'New Password' : 'Password'} icon={Lock}>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-11"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={mode === 'login' ? undefined : 8}
                  />
                </Field>
              )}

              {mode === 'reset' && (
                <Field label="Confirm Password" icon={Lock}>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-11"
                    required
                    autoComplete="new-password"
                    minLength={8}
                  />
                </Field>
              )}

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-xs text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 gap-2 font-medium"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && 'Sign in'}
                    {mode === 'signup' && 'Create account'}
                    {mode === 'forgot' && 'Send reset link'}
                    {mode === 'reset' && 'Update password'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {mode === 'forgot' && resetToken && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 text-xs"
                  onClick={() => setMode('reset')}
                >
                  Continue to reset (demo)
                </Button>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
                    className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up as client
                  </button>
                </div>
              )}
            </form>

            {/* Demo accounts — only on login */}
            {mode === 'login' && (
              <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/60">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Demo accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillCoach}
                    className="text-left p-2 rounded-lg bg-card border border-border/60 hover:border-primary/30 transition-colors tap-smooth"
                  >
                    <div className="text-xs font-semibold text-foreground">Coach</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">marcus@forge.coach</div>
                  </button>
                  <button
                    type="button"
                    onClick={fillClient}
                    className="text-left p-2 rounded-lg bg-card border border-border/60 hover:border-primary/30 transition-colors tap-smooth"
                  >
                    <div className="text-xs font-semibold text-foreground">Client</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">elena@client.forge.coach</div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  )
}
