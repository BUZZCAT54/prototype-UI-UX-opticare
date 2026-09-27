import { cn } from '../../utils/cn'

export function Skeleton({ className, ...rest }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-skeleton', className)} {...rest} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <Skeleton className="mb-3 h-24 w-full rounded-md" />
      <Skeleton className="mb-2 h-3 w-16" />
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
