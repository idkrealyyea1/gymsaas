'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const sidebarVariants = cva(
  'flex flex-col gap-2 overflow-y-auto p-2',
  {
    variants: {
      variant: {
        default: '',
        inset: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sidebarVariants>
>(({ className, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    data-variant={variant}
    className={cn(sidebarVariants({ variant }), className)}
    {...props}
  />
))
Sidebar.displayName = 'Sidebar'

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col h-full', className)} {...props} />
))
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex flex-col', className)} {...props} />
))
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col', className)} {...props} />
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-3 py-1.5 text-xs font-semibold text-muted-foreground/60',
      className
    )}
    {...props}
  />
))
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />
  )
)
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string
  }
>(({ className, asChild = false, isActive, tooltip, children, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const [showTooltip, setShowTooltip] = React.useState(false)

  return (
    <Comp
      ref={ref}
      data-state={isActive ? 'active' : 'inactive'}
      data-tooltip={tooltip}
      className={cn(
        'relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-accent text-accent-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {children}
      {tooltip && showTooltip && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg whitespace-nowrap z-50"
          style={{ backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
        >
          {tooltip}
        </div>
      )}
    </Comp>
  )
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-col gap-1 pl-2', className)} {...props} />
  )
)
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    tooltip?: string
  }
>(({ className, asChild = false, tooltip, children, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const [showTooltip, setShowTooltip] = React.useState(false)

  return (
    <Comp
      ref={ref}
      data-tooltip={tooltip}
      className={cn(
        'relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {children}
      {tooltip && showTooltip && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg whitespace-nowrap z-50"
        >
          {tooltip}
        </div>
      )}
    </Comp>
  )
})
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center', className)}
    {...props}
  />
))
SidebarFooter.displayName = 'SidebarFooter'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
}