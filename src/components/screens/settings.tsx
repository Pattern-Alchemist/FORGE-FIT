'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  User,
  Bell,
  Palette,
  Moon,
  Sun,
  Monitor,
  Check,
  Flame,
  Camera,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useCoach } from '@/lib/hooks'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const ACCENT_PRESETS = [
  { name: 'Ember', value: '#E8593A' },
  { name: 'Forest', value: '#1F8F5C' },
  { name: 'Cobalt', value: '#2563EB' },
  { name: 'Plum', value: '#9333EA' },
  { name: 'Sunset', value: '#F59E0B' },
  { name: 'Crimson', value: '#DC2626' },
]

export function Settings() {
  const { data: coach, isLoading } = useCoach()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const [accent, setAccent] = React.useState(coach?.accent_color ?? '#E8593A')
  const [notifications, setNotifications] = React.useState({
    new_check_ins: true,
    unread_messages: true,
    low_adherence: true,
    weekly_summary: true,
  })
  const [businessName, setBusinessName] = React.useState(coach?.business_name ?? '')
  const [saved, setSaved] = React.useState(false)

  // Sync local state when coach data arrives
  React.useEffect(() => {
    if (coach) {
      setAccent(coach.accent_color)
      setBusinessName(coach.business_name)
      setNotifications(coach.settings.notifications)
    }
  }, [coach])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    // TODO: wire to updateCoachAction when auth is added
  }

  if (isLoading || !coach) {
    return (
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-display text-2xl lg:text-[28px] text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your coach profile, branding, and preferences.</p>
        </div>
        <Button onClick={handleSave} className="gap-1.5">
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Section icon={User} title="Coach Profile" description="Your personal information and credentials">
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="w-16 h-16 rounded-2xl">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg font-semibold rounded-2xl">
                {coach.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="gap-1.5 mb-1">
                <Camera className="w-3.5 h-3.5" />
                Upload photo
              </Button>
              <p className="text-[11px] text-muted-foreground">JPG or PNG. 1:1 recommended.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" defaultValue={coach.name} />
            <Field label="Email" defaultValue={coach.email} type="email" />
            <Field label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            <Field label="Phone" defaultValue="+1 (555) 0142" />
          </div>
        </Section>

        {/* Branding */}
        <Section icon={Palette} title="Branding" description="Customize how Forge looks for you and your clients">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Accent color</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setAccent(preset.value)}
                    className={cn(
                      'group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all tap-smooth',
                      accent === preset.value ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : 'hover:scale-105',
                    )}
                    style={{ background: preset.value }}
                    aria-label={preset.name}
                  >
                    {accent === preset.value && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Currently: <span className="font-medium text-foreground">{ACCENT_PRESETS.find((p) => p.value === accent)?.name}</span></p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => {
                  const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor
                  const active = mounted && theme === t
                  return (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all tap-smooth',
                        active ? 'border-primary bg-primary/5 text-primary' : 'border-border/60 text-muted-foreground hover:bg-muted/40',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-medium capitalize">{t}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" description="Choose what you want to be alerted about">
          <div className="space-y-1">
            {[
              { key: 'new_check_ins' as const, label: 'New check-ins', desc: 'When a client submits a weekly check-in' },
              { key: 'unread_messages' as const, label: 'Unread messages', desc: 'When a client sends you a new message' },
              { key: 'low_adherence' as const, label: 'Low adherence alerts', desc: 'When a client\'s adherence drops below 75%' },
              { key: 'weekly_summary' as const, label: 'Weekly summary', desc: 'A digest of your roster every Monday at 8am' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Subscription */}
        <Section icon={CreditCard} title="Subscription" description="Your current plan and billing">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{coach.subscription_plan} Plan</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Up to 25 clients · All features included</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold tabular-nums text-foreground">$49</div>
              <div className="text-[10px] text-muted-foreground">per month</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs font-medium text-foreground">Visa ending in 4242</div>
                <div className="text-[11px] text-muted-foreground">Renews Aug 13, 2026</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">Update</Button>
          </div>
        </Section>

        {/* Account */}
        <Section icon={Shield} title="Account" description="Security and account management">
          <div className="space-y-1">
            <Row label="Change password" desc="Last updated 3 months ago" />
            <Row label="Two-factor authentication" desc="Add an extra layer of security" />
            <Row label="Export data" desc="Download all your client data" />
            <Separator className="my-2" />
            <button className="w-full flex items-center justify-between p-2 rounded-lg text-destructive hover:bg-destructive/5 transition-colors tap-smooth">
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign out</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="card-premium rounded-xl p-5 lg:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <Input {...props} className="h-10 bg-muted/40 border-transparent focus:border-border" />
    </div>
  )
}

function Row({ label, desc }: { label: string; desc: string }) {
  return (
    <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors tap-smooth text-left">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  )
}
