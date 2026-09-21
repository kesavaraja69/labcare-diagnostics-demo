import * as React from 'react'
import { cn } from '@/lib/utils'
import { inr } from '@/lib/utils'
import type { SeriesPoint } from '@/types'

/* -------------------------------------------------------------------------- */
/*  Area + line chart                                                         */
/* -------------------------------------------------------------------------- */

export function AreaChart({
  data,
  height = 200,
  formatValue = (v: number) => String(v),
  className,
  color = '#1caaa3',
  showDots = true,
}: {
  data: SeriesPoint[]
  height?: number
  formatValue?: (v: number) => string
  className?: string
  color?: string
  showDots?: boolean
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const width = 720
  const padX = 16
  const padY = 22
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.15
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0
  const y = (v: number) => height - padY - (v / max) * (height - padY * 2)
  const x = (i: number) => padX + i * stepX

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ')
  const area = `${line} L${x(data.length - 1)},${height - padY} L${x(0)},${height - padY} Z`

  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padY + t * (height - padY * 2)}
            y2={padY + t * (height - padY * 2)}
            stroke="#e8eef6"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {showDots &&
          data.map((d, i) => (
            <circle
              key={d.label + i}
              cx={x(i)}
              cy={y(d.value)}
              r={hover === i ? 5 : 3}
              fill="#fff"
              stroke={color}
              strokeWidth="2.2"
            />
          ))}
        {data.map((d, i) => (
          <rect
            key={`hit-${d.label}-${i}`}
            x={x(i) - stepX / 2}
            y={0}
            width={Math.max(stepX, 24)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            aria-label={`${d.label}: ${formatValue(d.value)}`}
          />
        ))}
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg bg-navy-900 px-2.5 py-1.5 text-[11.5px] font-semibold text-white shadow-lift"
          style={{ left: `${(x(hover) / width) * 100}%` }}
        >
          {data[hover].label}: {formatValue(data[hover].value)}
        </div>
      )}

      <div className="mt-2 flex justify-between px-1 text-[10.5px] font-medium text-navy-400">
        {data
          .filter((_, i) => i % Math.ceil(data.length / 7) === 0 || i === data.length - 1)
          .map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Bar chart                                                                 */
/* -------------------------------------------------------------------------- */

export function BarChart({
  data,
  height = 200,
  formatValue = (v: number) => String(v),
  color = '#214f86',
  className,
}: {
  data: SeriesPoint[]
  height?: number
  formatValue?: (v: number) => string
  color?: string
  className?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className={className}>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10.5px] font-semibold text-navy-500 opacity-0 transition-opacity group-hover:opacity-100">
              {formatValue(d.value)}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-90"
              style={{
                height: `${Math.max((d.value / max) * 100, 3)}%`,
                background: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
              }}
              title={`${d.label}: ${formatValue(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[10px] font-medium text-navy-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Donut chart                                                               */
/* -------------------------------------------------------------------------- */

const DONUT_COLORS = ['#0a2540', '#1caaa3', '#377ec3', '#6dded3', '#f59e0b', '#e11d48']

export function DonutChart({
  data,
  size = 168,
  thickness = 20,
  className,
  centerLabel,
}: {
  data: { label: string; value: number }[]
  size?: number
  thickness?: number
  className?: string
  centerLabel?: string
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className={cn('flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Distribution chart">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef3f9" strokeWidth={thickness} />
            {data.map((d, i) => {
              const length = (d.value / total) * circumference
              const dash = `${length} ${circumference - length}`
              const el = (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                  strokeWidth={thickness}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              )
              offset += length
              return el
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-navy-900">{total}</span>
          <span className="text-[10.5px] font-medium uppercase tracking-wider text-navy-400">
            {centerLabel ?? 'Total'}
          </span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-baseline gap-2 text-[13px]">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 font-medium text-navy-700">{d.label}</span>
            <span className="shrink-0 whitespace-nowrap font-semibold text-navy-900">
              {d.value}
              <span className="ml-1 font-normal text-navy-400">({Math.round((d.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Horizontal bars (popular packages etc.)                                   */
/* -------------------------------------------------------------------------- */

export function HorizontalBars({
  data,
  formatValue = (v: number) => String(v),
  className,
}: {
  data: { label: string; value: number; hint?: string }[]
  formatValue?: (v: number) => string
  className?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className={cn('space-y-3.5', className)}>
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] font-medium text-navy-700">{d.label}</span>
            <span className="shrink-0 text-[12.5px] font-semibold text-navy-900">
              {formatValue(d.value)}
              {d.hint && <span className="ml-1.5 font-normal text-navy-400">{d.hint}</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-navy-800 to-teal-500 transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* -------------------------------------------------------------------------- */
/*  Mini sparkline for stat cards                                             */
/* -------------------------------------------------------------------------- */

export function Sparkline({ values, color = '#1caaa3' }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values)
  const width = 96
  const height = 30
  const step = width / Math.max(values.length - 1, 1)
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height - (v / max) * (height - 4) - 2}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-24" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const formatChartCurrency = (v: number) => inr(v)
