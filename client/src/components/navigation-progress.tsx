import { useEffect, useState, useRef } from 'react'
import { useLocation, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function NavigationProgress() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const location = useLocation()
  const router = useRouter()
  const previousPathRef = useRef<string>(location.pathname)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Check if path actually changed
    if (previousPathRef.current !== location.pathname) {
      // Start loading IMMEDIATELY when URL changes
      setIsLoading(true)
      setProgress(10) // Start at 10% immediately
      previousPathRef.current = location.pathname

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Start progress animation immediately
      const startTime = Date.now()
      const duration = 400 // Very fast animation

      const animateProgress = () => {
        const elapsed = Date.now() - startTime
        const progressPercent = Math.min(10 + (elapsed / duration) * 70, 80) // 10% to 80%

        setProgress(progressPercent)

        if (progressPercent < 80) {
          animationRef.current = requestAnimationFrame(animateProgress)
        } else {
          // Keep at 80% until we detect page is fully loaded
          setTimeout(() => {
            setProgress(100)
            setTimeout(() => {
              setIsLoading(false)
              setProgress(0)
            }, 100)
          }, 50)
        }
      }

      // Start animation immediately on next frame
      animationRef.current = requestAnimationFrame(animateProgress)
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [location.pathname])

  // Listen for router state changes to better detect when navigation is complete
  useEffect(() => {
    const unsubscribe = router.subscribe('onResolved', () => {
      // When router resolves, complete the progress
      if (isLoading && progress >= 80) {
        setProgress(100)
        setTimeout(() => {
          setIsLoading(false)
          setProgress(0)
        }, 100)
      }
    })

    return unsubscribe
  }, [router, isLoading, progress])

  if (!isLoading) return null

  return (
    <div className='fixed top-0 right-0 left-0 z-[9999] h-[3px] bg-transparent'>
      {/* Main progress bar */}
      <div
        className={cn(
          'h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700',
          'shadow-lg'
        )}
        style={{
          width: `${progress}%`,
          transition: 'none', // No CSS transition for instant response
        }}
      />

      {/* Glow effect */}
      <div
        className={cn('absolute top-0 h-full w-2 bg-white/30 blur-sm')}
        style={{
          left: `${progress - 2}%`,
          transition: 'none', // No CSS transition for instant response
        }}
      />

      {/* Shimmer effect */}
      <div
        className={cn(
          'absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent'
        )}
        style={{
          left: `${progress - 8}%`,
          transition: 'none', // No CSS transition for instant response
        }}
      />
    </div>
  )
}
