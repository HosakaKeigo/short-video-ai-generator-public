import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  text?: string
}

export function Loading({ className, text = 'Loading...' }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      <p className="mt-4 text-sm text-gray-600">{text}</p>
    </div>
  )
}