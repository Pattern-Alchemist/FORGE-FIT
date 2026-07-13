'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Camera, Send, ChevronRight, CheckCircle2, X, Loader2 } from 'lucide-react'
import { useSubmitCheckIn, useClientCheckIns } from '@/lib/hooks'
import { uploadFile } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type Tab = 'home' | 'workout' | 'check-in' | 'messages'

export function ClientCheckIn({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const submitCheckIn = useSubmitCheckIn()
  const { data: existingCheckIns = [], isLoading } = useClientCheckIns()

  const [weight, setWeight] = React.useState('')
  const [waist, setWaist] = React.useState('')
  const [energy, setEnergy] = React.useState(7)
  const [sleep, setSleep] = React.useState(7)
  const [mood, setMood] = React.useState(7)
  const [notes, setNotes] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [photos, setPhotos] = React.useState<string[]>([])
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const result = await uploadFile(file)
        setPhotos((prev) => [...prev, result.url])
      }
    } catch (err) {
      console.error('upload failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Pre-fill weight from latest check-in
  React.useEffect(() => {
    if (existingCheckIns[0]) {
      setWeight(String(existingCheckIns[0].body_weight))
      if (existingCheckIns[0].waist) setWaist(String(existingCheckIns[0].waist))
    }
  }, [existingCheckIns])

  const handleSubmit = () => {
    if (!weight) return
    submitCheckIn.mutate(
      {
        clientId: '', // server action resolves from session
        date: new Date(),
        bodyWeight: Number(weight),
        waist: waist ? Number(waist) : null,
        chest: null,
        arms: null,
        thighs: null,
        energyScore: energy,
        sleepScore: sleep,
        moodScore: mood,
        adherencePercent: 80, // client self-reports; coach reviews
        hasProgressPhoto: photos.length > 0,
        clientNotes: notes,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          setTimeout(() => onNavigate('home'), 2000)
        },
      },
    )
  }

  if (submitted) {
    return (
      <div className="px-4 py-5 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-success" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-display text-xl text-foreground mb-1">Check-in submitted!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your coach will review and respond within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 pb-32">
      <h1 className="text-display text-xl text-foreground mb-1">Weekly Check-in</h1>
      <p className="text-xs text-muted-foreground mb-5">Takes under 5 minutes. Be honest — it helps your coach help you.</p>

      {/* Body metrics */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3 mb-5"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Body Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricInput label="Body Weight" value={weight} onChange={setWeight} unit="kg" placeholder="80.5" />
          <MetricInput label="Waist" value={waist} onChange={setWaist} unit="cm" placeholder="82" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotoSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-border hover:text-foreground transition-colors tap-smooth disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          </div>
          <div className="text-left flex-1">
            <div className="text-sm font-medium">
              {uploading ? 'Uploading…' : photos.length > 0 ? `${photos.length} photo(s) added` : 'Add progress photos'}
            </div>
            <div className="text-[11px]">Front, side, back (optional)</div>
          </div>
          {photos.length === 0 && <ChevronRight className="w-4 h-4" />}
        </button>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={url} alt={`Progress photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center tap-smooth"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Subjective scores */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-3 mb-5"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">How&apos;s this week?</h3>
        <SliderInput label="Energy" value={energy} onChange={setEnergy} color="var(--chart-2)" />
        <SliderInput label="Sleep Quality" value={sleep} onChange={setSleep} color="var(--chart-4)" />
        <SliderInput label="Mood" value={mood} onChange={setMood} color="var(--chart-5)" />
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mb-5"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">Notes for your coach</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did the week go? Any wins, struggles, or questions?"
          rows={4}
          className="bg-muted/40 border-transparent focus:border-border resize-none"
        />
      </motion.div>

      {/* Recent check-ins summary */}
      {existingCheckIns.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">Last check-in</h3>
          <div className="rounded-xl bg-muted/30 p-3">
            <div className="text-[11px] text-muted-foreground mb-1">
              {format(new Date(existingCheckIns[0].date), 'EEEE, MMM d')}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <MiniStat label="Weight" value={`${existingCheckIns[0].body_weight}kg`} />
              <MiniStat label="Energy" value={`${existingCheckIns[0].energy_score}/10`} />
              <MiniStat label="Sleep" value={`${existingCheckIns[0].sleep_score}/10`} />
              <MiniStat label="Mood" value={`${existingCheckIns[0].mood_score}/10`} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[480px] w-full px-4 z-40">
        <Button
          onClick={handleSubmit}
          disabled={!weight || submitCheckIn.isPending}
          className="w-full h-12 gap-2 text-base font-semibold rounded-xl shadow-lg"
        >
          {submitCheckIn.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Check-in
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function MetricInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  unit: string
  placeholder: string
}) {
  return (
    <div className="rounded-xl bg-card border border-border/60 p-3">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 text-lg font-semibold tabular-nums bg-muted/40 border-transparent pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function SliderInput({
  label,
  value,
  onChange,
  color,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
}) {
  return (
    <div className="rounded-xl bg-card border border-border/60 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          {value}<span className="text-xs text-muted-foreground">/10</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">😴</span>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - 1) / 9) * 100}%, var(--muted) ${((value - 1) / 9) * 100}%, var(--muted) 100%)`,
          }}
        />
        <span className="text-[10px] text-muted-foreground">🔥</span>
      </div>
      <div className="flex justify-between mt-1.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={cn(
              'w-6 h-6 rounded-md text-[10px] font-medium transition-colors tap-smooth',
              value === i + 1 ? 'text-white' : 'text-muted-foreground hover:text-foreground',
            )}
            style={value === i + 1 ? { background: color } : {}}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  )
}
