import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement>
  fromRef: React.RefObject<HTMLDivElement>
  toRef: React.RefObject<HTMLDivElement>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  color?: string
  pathWidth?: number
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  color = '#00e5a0',
  pathWidth = 2,
}: AnimatedBeamProps) {
  const measureRef = useRef<SVGPathElement>(null)
  const [pathD, setPathD] = useState('')
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })
  const [totalLength, setTotalLength] = useState(0)

  useEffect(() => {
    function update() {
      const container = containerRef.current
      const from = fromRef.current
      const to = toRef.current
      if (!container || !from || !to) return

      const cRect = container.getBoundingClientRect()
      const fRect = from.getBoundingClientRect()
      const tRect = to.getBoundingClientRect()

      const fx = fRect.left - cRect.left + fRect.width / 2
      const fy = fRect.top - cRect.top + fRect.height / 2
      const tx = tRect.left - cRect.left + tRect.width / 2
      const ty = tRect.top - cRect.top + tRect.height / 2

      // Control point for quadratic bezier
      const cx = (fx + tx) / 2
      const cy = (fy + ty) / 2 + curvature

      setPathD(`M${fx},${fy} Q${cx},${cy} ${tx},${ty}`)
      setSvgSize({ w: cRect.width, h: cRect.height })
    }

    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef, fromRef, toRef, curvature])

  // Measure the path length after the path is rendered
  useEffect(() => {
    if (measureRef.current && pathD) {
      setTotalLength(measureRef.current.getTotalLength())
    }
  }, [pathD])

  const beamSize = 70

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: svgSize.w, height: svgSize.h,
        overflow: 'visible', pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Hidden path just for length measurement */}
      <path ref={measureRef} d={pathD} fill="none" stroke="none" />

      {/* Static track */}
      <path
        d={pathD}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={pathWidth}
        fill="none"
        strokeLinecap="round"
      />

      {/* Animated beam */}
      {totalLength > 0 && (
        <motion.path
          d={pathD}
          stroke={color}
          strokeWidth={pathWidth + 1.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${beamSize} ${totalLength}`}
          animate={{
            strokeDashoffset: reverse
              ? [-totalLength, totalLength]
              : [totalLength, -totalLength],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}60)`,
          }}
        />
      )}
    </svg>
  )
}
