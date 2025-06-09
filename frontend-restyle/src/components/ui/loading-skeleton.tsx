import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export function Skeleton({ className, count = 1, ...props }: SkeletonProps) {
  if (count === 1) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-md bg-muted',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-md bg-muted',
            className
          )}
          {...props}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}