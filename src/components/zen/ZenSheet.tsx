"use client";

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ZenSheet = SheetPrimitive.Root;
const ZenSheetTrigger = SheetPrimitive.Trigger;
const ZenSheetClose = SheetPrimitive.Close;
const ZenSheetPortal = SheetPrimitive.Portal;

const ZenSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-zen-fg/30 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
ZenSheetOverlay.displayName = 'ZenSheetOverlay';

const zenSheetVariants = cva(
  [
    'fixed z-50 gap-4 p-6 glass-elevated shadow-zen-floating',
    'transition ease-zen-out',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:duration-300 data-[state=open]:duration-400',
  ],
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b rounded-b-zen-xl data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t rounded-t-zen-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom pb-[max(1.5rem,env(safe-area-inset-bottom))]',
        left: 'inset-y-0 left-0 h-full w-[min(100%,20rem)] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full w-[min(100%,20rem)] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
    },
    defaultVariants: {
      side: 'bottom',
    },
  },
);

interface ZenSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof zenSheetVariants> {}

const ZenSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  ZenSheetContentProps
>(({ side = 'bottom', className, children, ...props }, ref) => (
  <ZenSheetPortal>
    <ZenSheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(zenSheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className={cn(
          'absolute right-4 top-4 rounded-zen-md p-2 min-h-11 min-w-11',
          'inline-flex items-center justify-center',
          'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-muted',
          'active:scale-[0.97] transition-all duration-zen-fast',
          'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
        )}
        aria-label="Close sheet"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </ZenSheetPortal>
));
ZenSheetContent.displayName = 'ZenSheetContent';

function ZenSheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  );
}

function ZenSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2', className)}
      {...props}
    />
  );
}

const ZenSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('zen-h3 text-zen-fg', className)} {...props} />
));
ZenSheetTitle.displayName = 'ZenSheetTitle';

const ZenSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('zen-body-sm text-zen-fg-muted', className)}
    {...props}
  />
));
ZenSheetDescription.displayName = 'ZenSheetDescription';

export {
  ZenSheet,
  ZenSheetClose,
  ZenSheetContent,
  ZenSheetDescription,
  ZenSheetFooter,
  ZenSheetHeader,
  ZenSheetOverlay,
  ZenSheetPortal,
  ZenSheetTitle,
  ZenSheetTrigger,
};
