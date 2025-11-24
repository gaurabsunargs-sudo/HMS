import { useState, useEffect, useMemo, memo } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Stethoscope,
  Heart,
  Microscope,
  Users,
  Award,
  ArrowRight,
  Phone,
  FileText,
  Activity,
} from 'lucide-react'
import { usePublicStats } from '@/api/hooks/usePublicStats'

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const { data: stats } = usePublicStats()

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`
    }
    return `${num}+`
  }

  const slides = useMemo(
    () => [
      {
        title: 'Excellence in',
        highlighted: 'Healthcare',
        description:
          'Delivering comprehensive medical care with cutting-edge technology and compassionate professionals dedicated to your wellbeing.',
        cta: 'Schedule Consultation',
        stats: '98% Patient Satisfaction',
      },
      {
        title: 'Advanced Medical',
        highlighted: 'Technology',
        description:
          'State-of-the-art diagnostic equipment and innovative treatment solutions for precise, effective healthcare outcomes.',
        cta: 'Explore Services',
        stats: stats
          ? `${formatNumber(stats.totalDoctors)} Medical Specialists`
          : '200+ Medical Specialists',
      },
      {
        title: 'Emergency Care',
        highlighted: '24/7 Available',
        description:
          'Round-the-clock emergency services with rapid response teams and specialized critical care facilities.',
        cta: 'Emergency Contact',
        stats: '24/7 Emergency Response',
      },
      {
        title: 'AI-Powered',
        highlighted: 'Diagnosis',
        description:
          'Revolutionary machine learning algorithms that assist doctors in accurate disease prediction and early detection.',
        cta: 'Try AI Diagnosis',
        stats: '95% Accuracy Rate',
      },
      {
        title: 'Digital Health',
        highlighted: 'Records',
        description:
          'Secure, comprehensive digital health records that follow you throughout your healthcare journey.',
        cta: 'View Records',
        stats: '100% Secure & HIPAA Compliant',
      },
      {
        title: 'Integrated',
        highlighted: 'Care System',
        description:
          'Seamless coordination between doctors, patients, and administrative staff for optimal healthcare delivery.',
        cta: 'Learn More',
        stats: '50+ Integrated Services',
      },
    ],
    [stats]
  )

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 7000)

    return () => clearInterval(interval)
  }, [slides.length, isAutoRotating])

  const orbitingFeatures = useMemo(
    () => [
      {
        icon: Stethoscope,
        label: 'Expert Doctors',
        color: 'blue',
        distance: 140,
        duration: 20,
        slideIndex: 0,
        startOffset: 0,
      },
      {
        icon: Heart,
        label: 'Cardiology',
        color: 'red',
        distance: 160,
        duration: 22,
        slideIndex: 1,
        startOffset: 60,
      },
      {
        icon: Activity,
        label: 'Emergency Care',
        color: 'orange',
        distance: 180,
        duration: 24,
        slideIndex: 2,
        startOffset: 120,
      },
      {
        icon: Microscope,
        label: 'AI Diagnosis',
        color: 'purple',
        distance: 200,
        duration: 26,
        slideIndex: 3,
        startOffset: 180,
      },
      {
        icon: FileText,
        label: 'Digital Records',
        color: 'green',
        distance: 220,
        duration: 28,
        slideIndex: 4,
        startOffset: 240,
      },
      {
        icon: Users,
        label: 'Integrated Care',
        color: 'teal',
        distance: 240,
        duration: 30,
        slideIndex: 5,
        startOffset: 300,
      },
    ],
    []
  )

  const handleOrbitClick = (slideIndex: number) => {
    setActiveSlide(slideIndex)
    setIsAutoRotating(false)
    // Resume auto rotation after 10 seconds
    setTimeout(() => setIsAutoRotating(true), 10000)
  }

  const heroStyles = useMemo(
    () => `
         @keyframes orbit {
           0% { transform: rotate(var(--start-rotation, 0deg)) translateX(var(--orbit-distance)) rotate(calc(-1 * var(--start-rotation, 0deg))); }
           100% { transform: rotate(calc(360deg + var(--start-rotation, 0deg))) translateX(var(--orbit-distance)) rotate(calc(-360deg - var(--start-rotation, 0deg))); }
         }
        @keyframes centerPulse { 
          0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.4);} 
          50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(59,130,246,0);} 
        }
        
         /* Elements visible immediately; start offset is baked into keyframes */
         .orbit-circle { opacity: 1; animation: orbit var(--orbit-duration) linear infinite; }
        .center-pulse { animation: centerPulse 2s ease-in-out infinite; }
        .orbit-ring { 
          border: 1px dashed rgba(255,255,255,0.3); 
          animation: orbit calc(var(--orbit-duration,20s) * 1s) linear infinite reverse; 
        }
        .ball-blue { background: linear-gradient(135deg,#3b82f6,#1d4ed8); }
        .ball-red { background: linear-gradient(135deg,#ef4444,#dc2626); }
        .ball-orange { background: linear-gradient(135deg,#f97316,#ea580c); }
        .ball-purple { background: linear-gradient(135deg,#8b5cf6,#7c3aed); }
        .ball-green { background: linear-gradient(135deg,#10b981,#059669); }
        .ball-teal { background: linear-gradient(135deg,#14b8a6,#0d9488); }
        .float-label { pointer-events:none; }
        .orbit-circle:hover .float-label { opacity:1; }
        .active-planet { border:2px solid rgba(59,130,246,1); box-shadow: 0 0 16px rgba(59,130,246,0.6), 0 0 32px rgba(59,130,246,0.35); }
        @font-face { font-family: 'HeroHighlight'; src: local('Poppins'), local('Inter'); font-weight:700; }
        .font-special { font-family: 'HeroHighlight', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'; letter-spacing:0.5px; }
      `,
    []
  )

  return (
    <>
      <style>{heroStyles}</style>

      <div className='relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f172b] to-slate-800'>
        {/* Animated background elements */}
        <div className='absolute inset-0 z-0 opacity-10 md:opacity-20'>
          <div className='absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl md:bg-blue-500/10'></div>
          <div className='absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl md:bg-cyan-500/10'></div>
        </div>
        <div className='pointer-events-none absolute inset-0 -top-[100px] -left-[100px] z-0 h-[350px] w-[350px] overflow-hidden rounded-full bg-white/5'></div>

        {/* Simple animated lines overlay */}
        <div className='pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block'>
          {!prefersReducedMotion && (
            <motion.div
              className='absolute h-px w-[220px] bg-gradient-to-r from-transparent via-white/20 to-transparent'
              animate={{
                top: ['-10%', '110%'],
                left: ['0%', '100%'],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ transform: 'rotate(-45deg)' }}
            />
          )}
          {!prefersReducedMotion && (
            <motion.div
              className='absolute h-px w-[320px] bg-gradient-to-r from-transparent via-white/10 to-transparent'
              animate={{
                top: ['0%', '120%'],
                right: ['-10%', '110%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
                delay: 2,
              }}
              style={{ transform: 'rotate(45deg)' }}
            />
          )}
          {!prefersReducedMotion && (
            <motion.div
              className='absolute h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent'
              animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '30%' }}
            />
          )}
        </div>

        {/* Main Content Container */}
        <div className='relative z-10 container mx-auto flex min-h-screen items-center px-4 py-16 lg:px-6'>
          <div className='grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-12'>
            {/* Left Side - Main Content */}
            <div className='mt-6 mb-6 ml-0 space-y-6 pt-10 text-center text-white lg:col-span-7 lg:mt-[-150px] lg:mb-0 lg:ml-[10%] lg:text-left'>
              <div className='mx-auto mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm md:border-white/20 md:bg-white/10 lg:mx-0'>
                <Award className='mr-2 h-3 w-3 text-yellow-400' />
                Top-Rated Healthcare Provider 2024
              </div>

              <div className='transition-all duration-1000 ease-in-out'>
                <AnimatePresence mode='wait' initial={!prefersReducedMotion}>
                  <motion.div
                    key={activeSlide}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 16 }
                    }
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, y: -16 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.4,
                      ease: 'easeOut',
                    }}
                  >
                    <div>
                      <h1 className='font-display text-3xl leading-tight font-bold lg:text-4xl xl:text-5xl'>
                        {slides[activeSlide].title}{' '}
                        <span
                          className={`bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent ${
                            ['Healthcare', 'Technology', 'Diagnosis'].includes(
                              slides[activeSlide].highlighted
                            )
                              ? 'font-special'
                              : ''
                          }`}
                        >
                          {slides[activeSlide].highlighted}
                        </span>
                      </h1>
                    </div>
                    <div>
                      <p className='mt-4 max-w-xl text-base leading-relaxed text-gray-200 italic lg:text-lg'>
                        {slides[activeSlide].description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-start'>
                <Link
                  to='/ai-prediction'
                  className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl lg:px-8 lg:py-4 lg:text-base'
                >
                  Predict Disease{' '}
                  <ArrowRight className='ml-2 h-6 w-6 -rotate-45' />
                </Link>

                <a
                  href='tel:9810325922'
                  className='inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20 lg:px-8 lg:py-4 lg:text-base'
                >
                  <Phone className='mr-2 h-4 w-4' />
                  Contact Us
                </a>
              </div>
            </div>

            {/* Right Side - Orbiting Healthcare Feature Circles */}
            <div className='mt-8 flex justify-center lg:col-span-5 lg:mt-0'>
              <div className='relative flex h-56 w-56 origin-center scale-90 items-center justify-center [--gap-scale:1.15] [--radius-scale:.65] sm:h-72 sm:w-72 sm:scale-95 sm:[--gap-scale:1.2] sm:[--radius-scale:.85] md:h-96 md:w-96 md:scale-100 md:[--gap-scale:1.1] md:[--radius-scale:1] lg:h-[500px] lg:w-[500px] lg:[--gap-scale:1]'>
                {orbitingFeatures.map((feature, index) => (
                  <div
                    key={`ring-${index}`}
                    className='orbit-ring absolute rounded-full'
                    style={
                      {
                        width: `calc(var(--gap-scale, 1) * var(--radius-scale, 1) * ${
                          feature.distance * 2
                        }px)`,
                        height: `calc(var(--gap-scale, 1) * var(--radius-scale, 1) * ${
                          feature.distance * 2
                        }px)`,
                        '--orbit-duration': `${
                          prefersReducedMotion ? 0 : feature.duration
                        }`,
                      } as React.CSSProperties
                    }
                  />
                ))}

                <div className='center-pulse absolute z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm sm:h-24 sm:w-24 md:h-28 md:w-28 md:border-white/20 md:from-blue-500/20 md:to-cyan-500/20 lg:h-32 lg:w-32'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600/90 sm:h-16 sm:w-16 md:h-20 md:w-20 md:to-cyan-600 lg:h-24 lg:w-24'>
                    <Heart className='h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8' />
                  </div>
                </div>

                {orbitingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className='orbit-circle absolute cursor-pointer'
                    style={
                      {
                        '--orbit-distance': `calc(var(--gap-scale, 1) * var(--radius-scale, 1) * ${feature.distance}px)`,
                        '--orbit-duration': `${
                          prefersReducedMotion ? 0 : feature.duration
                        }s`,
                        '--start-rotation': `${feature.startOffset}deg`,
                      } as React.CSSProperties
                    }
                    onClick={() => handleOrbitClick(feature.slideIndex)}
                  >
                    <div
                      className={`group flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl sm:h-10 sm:w-10 md:h-12 md:w-12 ball-${
                        feature.color
                      } ${
                        activeSlide === feature.slideIndex
                          ? 'active-planet'
                          : ''
                      }`}
                    >
                      <feature.icon className='h-4 w-4 text-white sm:h-5 sm:w-5 md:h-6 md:w-6' />
                    </div>

                    <div className='float-label absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-lg border border-white/20 bg-white/90 px-3 py-1 text-xs font-medium whitespace-nowrap text-gray-800 opacity-0 shadow-lg backdrop-blur-sm lg:opacity-0 lg:transition-opacity lg:duration-300 lg:group-hover:opacity-100'>
                      {feature.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(HeroSection)
