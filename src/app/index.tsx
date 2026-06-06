
import AnimatedSplashOverlay from '@/components/animated-icon'
import { router } from 'expo-router'
import { useEffect } from 'react'

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tab)')
    }, 1200) // Balanced delay for professional entry

    return () => clearTimeout(timer)
  }, [])

  return <AnimatedSplashOverlay />
}
