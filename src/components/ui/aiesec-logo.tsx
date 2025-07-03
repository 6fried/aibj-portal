import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AiesecLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
}

export function AiesecLogo({ 
  size = 'md', 
  className,
  priority = false
}: AiesecLogoProps) {
  const { width, height } = sizeMap[size]
  
  return (
    <Image
      src="/images/logos/logo.png"
      alt="AIESEC Logo"
      width={width}
      height={height}
      priority={priority}
      className={cn('object-contain', className)}
    />
  )
}