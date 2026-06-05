
import AnimatedSplashOverlay from '@/components/animated-icon'
import { router } from 'expo-router'
import { useEffect } from 'react'

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return <AnimatedSplashOverlay />
}
