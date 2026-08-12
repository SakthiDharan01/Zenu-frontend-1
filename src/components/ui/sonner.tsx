import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// ZenU 2.0 is light mode only — no theme switching needed
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zen-fg group-[.toaster]:border-zen-border group-[.toaster]:shadow-zen-elevated",
          description: "group-[.toast]:text-zen-fg-muted",
          actionButton: "group-[.toast]:bg-zen-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-zen-bg-subtle group-[.toast]:text-zen-fg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
