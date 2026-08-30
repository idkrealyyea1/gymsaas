import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const Pagination = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'nav'> & { className?: string }) => {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {children}
    </nav>
  )
}
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn('flex items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

const PaginationLink = ({
  className,
  isActive,
  ...props
}: React.ComponentPropsWithoutRef<'a'> & { isActive?: boolean }) => {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-9 w-9 items-center justify-center text-sm font-medium',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    />
  )
}
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('gap-1', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </Button>
  )
}
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('gap-1', className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) => {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn('flex h-9 w-9 items-center justify-center text-sm text-muted-foreground', className)}
      {...props}
    >
      ...
    </span>
  )
}
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

;(Pagination as any).Content = PaginationContent
;(Pagination as any).Item = PaginationItem
;(Pagination as any).Link = PaginationLink
;(Pagination as any).Previous = PaginationPrevious
;(Pagination as any).Next = PaginationNext
;(Pagination as any).Ellipsis = PaginationEllipsis