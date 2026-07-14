'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Apple, Plus, X, Flame, Beef, Wheat, Droplet } from 'lucide-react'
import { useClientNutrition, useClientNutritionHistory, useLogMeal, useDeleteMeal } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { Tab } from './app'

export function ClientNutrition({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data: nutrition, isLoading } = useClientNutrition()
  const { data: history = [] } = useClientNutritionHistory(7)
  const logMeal = useLogMeal()
  const deleteMeal = useDeleteMeal()
  const [showAddMeal, setShowAddMeal] = React.useState(false)
  const [mealName, setMealName] = React.useState('')
  const [calories, setCalories] = React.useState('')
  const [protein, setProtein] = React.useState('')
  const [carbs, setCarbs] = React.useState('')
  const [fat, setFat] = React.useState('')

  if (isLoading || !nutrition) {
    return (
      <div className="px-4 py-5">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded-2xl mb-4" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  const caloriePct = nutrition.calorie_target > 0 ? Math.min(100, (nutrition.calories / nutrition.calorie_target) * 100) : 0
  const proteinPct = nutrition.protein_target > 0 ? Math.min(100, (nutrition.protein / nutrition.protein_target) * 100) : 0
  const carbPct = nutrition.carb_target > 0 ? Math.min(100, (nutrition.carbs / nutrition.carb_target) * 100) : 0
  const fatPct = nutrition.fat_target > 0 ? Math.min(100, (nutrition.fat / nutrition.fat_target) * 100) : 0

  const handleLogMeal = () => {
    if (!mealName || !calories) return
    logMeal.mutate(
      {
        name: mealName,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      },
      {
        onSuccess: () => {
          setMealName('')
          setCalories('')
          setProtein('')
          setCarbs('')
          setFat('')
          setShowAddMeal(false)
        },
      },
    )
  }

  return (
    <div className="px-4 py-5 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-display text-xl text-foreground">Nutrition</h1>
          <p className="text-[11px] text-muted-foreground">{format(new Date(nutrition.date), 'EEEE, MMM d')}</p>
        </div>
        <Button size="sm" onClick={() => setShowAddMeal(true)} className="gap-1.5 h-8">
          <Plus className="w-3.5 h-3.5" />
          Log Meal
        </Button>
      </div>

      {/* Calorie ring + macros */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 mb-4 relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">Today's Calories</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold tabular-nums">{nutrition.calories}</span>
            <span className="text-sm opacity-80 mb-1">/ {nutrition.calorie_target}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden mb-3">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${caloriePct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroPill label="Protein" value={nutrition.protein} target={nutrition.protein_target} pct={proteinPct} icon={Beef} />
            <MacroPill label="Carbs" value={nutrition.carbs} target={nutrition.carb_target} pct={carbPct} icon={Wheat} />
            <MacroPill label="Fat" value={nutrition.fat} target={nutrition.fat_target} pct={fatPct} icon={Droplet} />
          </div>
        </div>
      </motion.div>

      {/* Meals today */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-4"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">Meals Today</h2>
        {nutrition.meals && nutrition.meals.length > 0 ? (
          <div className="space-y-2">
            {nutrition.meals.map((meal) => (
              <div key={meal.id} className="rounded-xl bg-card border border-border/60 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Apple className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{meal.name}</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {meal.calories} cal · {meal.protein}p / {meal.carbs}c / {meal.fat}f
                  </div>
                </div>
                <button
                  onClick={() => deleteMeal.mutate({ mealId: meal.id })}
                  className="w-7 h-7 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors tap-smooth shrink-0"
                  aria-label="Delete meal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border/60 p-6 text-center">
            <Apple className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No meals logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">Tap "Log Meal" to start tracking.</p>
          </div>
        )}
      </motion.div>

      {/* 7-day history */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">Last 7 Days</h2>
          <div className="rounded-xl bg-card border border-border/60 p-3">
            <div className="flex items-end justify-between h-24 gap-1.5">
              {history.map((log) => {
                const pct = log.calorie_target > 0 ? Math.min(100, (log.calories / log.calorie_target) * 100) : 0
                return (
                  <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${Math.max(4, pct)}%`,
                          background: pct > 80 ? 'var(--success)' : pct > 50 ? 'var(--primary)' : 'var(--muted)',
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {format(new Date(log.date), 'EEE').slice(0, 2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Add meal modal */}
      {showAddMeal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setShowAddMeal(false)}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Log Meal</h3>
              <button onClick={() => setShowAddMeal(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Meal Name</label>
                <Input
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Breakfast, Post-workout shake"
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Calories</label>
                  <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="500" className="h-10 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Protein (g)</label>
                  <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="40" className="h-10 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Carbs (g)</label>
                  <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="60" className="h-10 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Fat (g)</label>
                  <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="15" className="h-10 tabular-nums" />
                </div>
              </div>
              <Button
                onClick={handleLogMeal}
                disabled={!mealName || !calories || logMeal.isPending}
                className="w-full h-11 gap-2"
              >
                {logMeal.isPending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Meal
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function MacroPill({
  label,
  value,
  target,
  pct,
  icon: Icon,
}: {
  label: string
  value: number
  target: number
  pct: number
  icon: React.ElementType
}) {
  return (
    <div className="bg-white/15 rounded-lg p-2">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-medium opacity-90">{label}</span>
      </div>
      <div className="text-sm font-bold tabular-nums">
        {value}<span className="text-[10px] opacity-70">/{target}g</span>
      </div>
      <div className="h-1 rounded-full bg-white/20 overflow-hidden mt-1">
        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
