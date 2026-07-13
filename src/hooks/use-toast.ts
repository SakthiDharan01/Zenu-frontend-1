import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<(state: ToastState) => void>();

let toastCount = 0;
let memoryState: ToastState = { toasts: [] };

function generateToastId() {
  toastCount += 1;
  return `toast-${toastCount}`;
}

function dispatch(action: ToastAction) {
  switch (action.type) {
    case "ADD_TOAST": {
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      };
      break;
    }
    case "UPDATE_TOAST": {
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((toast) =>
          toast.id === action.toast.id ? { ...toast, ...action.toast } : toast,
        ),
      };
      break;
    }
    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        toastTimeouts.set(
          toastId,
          setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId }), TOAST_REMOVE_DELAY),
        );
      } else {
        memoryState.toasts.forEach((toast) => {
          toastTimeouts.set(
            toast.id,
            setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: toast.id }), TOAST_REMOVE_DELAY),
          );
        });
      }

      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((toast) =>
          toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast,
        ),
      };
      break;
    }
    case "REMOVE_TOAST": {
      if (action.toastId) {
        toastTimeouts.delete(action.toastId);
      }

      memoryState = {
        ...memoryState,
        toasts:
          action.toastId === undefined
            ? []
            : memoryState.toasts.filter((toast) => toast.id !== action.toastId),
      };
      break;
    }
    default:
      break;
  }

  listeners.forEach((listener) => listener(memoryState));
}

function addToast(toast: ToasterToast) {
  dispatch({ type: "ADD_TOAST", toast });
}

export function toast(props: ToastProps & { id?: string }) {
  const id = props.id ?? generateToastId();

  addToast({
    ...props,
    id,
    open: true,
  });

  return id;
}

export function dismiss(toastId?: string) {
  dispatch({ type: "DISMISS_TOAST", toastId });
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss,
  };
}
