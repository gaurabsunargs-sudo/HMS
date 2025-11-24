'use client'

import { useState, useEffect } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update state when fullscreen changes from other sources (like F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleFullscreen}
            className='scale-90 rounded-full bg-card'
          >
            {isFullscreen ? (
              <Minimize className='size-[1.15rem]!' />
            ) : (
              <Maximize className='size-[1.15rem]!' />
            )}
            <span className='sr-only'>Toggle fullscreen</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
