"use client";

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ZenDialog = DialogPrimitive.Root;
const ZenDialogTrigger = DialogPrimitive.Trigger;
const ZenDialogPortal = DialogPrimitive.Portal;
const ZenDialogClose = DialogPrimitive.Close;

const ZenDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-zen-fg/30 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
ZenDialogOverlay.displayName = 'ZenDialogOverlay';

const ZenDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ZenDialogPortal>
    <ZenDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
        'gap-4 p-6 rounded-zen-xl glass-elevated shadow-zen-modal',
        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'absolute right-4 top-4 rounded-zen-md p-2 min-h-11 min-w-11',
          'inline-flex items-center justify-center',
          'text-zen-fg-muted hover:text-zen-fg hover:bg-zen-bg-muted',
          'active:scale-[0.97] transition-all duration-zen-fast',
          'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
        )}
        aria-label="Close dialog"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ZenDialogPortal>
));
ZenDialogContent.displayName = 'ZenDialogContent';

function ZenDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
  );
}

function ZenDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2', className)}
      {...props}
    />
  );
}

const ZenDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('zen-h3 text-zen-fg', className)}
    {...props}
  />
));
ZenDialogTitle.displayName = 'ZenDialogTitle';

const ZenDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('zen-body-sm text-zen-fg-muted', className)}
    {...props}
  />
));
ZenDialogDescription.displayName = 'ZenDialogDescription';

export {
  ZenDialog,
  ZenDialogPortal,
  ZenDialogOverlay,
  ZenDialogClose,
  ZenDialogTrigger,
  ZenDialogContent,
  ZenDialogHeader,
  ZenDialogFooter,
  ZenDialogTitle,
  ZenDialogDescription,
};
