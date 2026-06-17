/**
 * Tiny pub/sub store powering the imperative `toast()` API.
 *
 * It holds no DOM references and never touches `window`/`document`, so it is
 * safe to import during SSR. `<ark-toaster>` subscribes to it and renders a
 * transient `<ark-toast>` per record whose `position` matches its own.
 */

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastVariantValue =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface ToastOptions {
  /** Optional emphasized heading rendered above the message. */
  heading?: string;
  /** Auto-dismiss delay in ms. `0` keeps the toast until dismissed. */
  duration?: number;
  /** Which `<ark-toaster>` region the toast lands in. */
  position?: ToastPosition;
  /** Visual/semantic variant. */
  variant?: ToastVariantValue;
  /** Provide to update an existing toast in place instead of spawning a new one. */
  id?: string;
}

export interface ToastRecord {
  id: string;
  variant: ToastVariantValue;
  heading?: string;
  message: string;
  duration: number;
  position: ToastPosition;
}

const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION: ToastPosition = "bottom-center";

type ToastListener = (toasts: readonly ToastRecord[]) => void;

const listeners = new Set<ToastListener>();
let toasts: ToastRecord[] = [];
let counter = 0;

const notify = () => {
  for (const listener of listeners) {
    listener(toasts);
  }
};

/** Subscribe to store changes. Returns an unsubscribe function. */
export const subscribeToToasts = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Current snapshot of all active toasts. */
export const getToasts = (): readonly ToastRecord[] => toasts;

const createId = () => `ark-toast-${++counter}`;

const addToast = (message: string, options: ToastOptions = {}): string => {
  const id = options.id ?? createId();
  const record: ToastRecord = {
    id,
    variant: options.variant ?? "default",
    heading: options.heading,
    message,
    duration: options.duration ?? DEFAULT_DURATION,
    position: options.position ?? DEFAULT_POSITION,
  };

  // Replace any existing record with the same id, otherwise append.
  toasts = [...toasts.filter((existing) => existing.id !== id), record];
  notify();
  return id;
};

/** Remove a single toast by id, or all toasts when called with no argument. */
const dismissToast = (id?: string): void => {
  toasts = id === undefined ? [] : toasts.filter((existing) => existing.id !== id);
  notify();
};

const withVariant =
  (variant: ToastVariantValue) =>
    (message: string, options: ToastOptions = {}): string =>
      addToast(message, { ...options, variant });

export interface ToastFn {
  (message: string, options?: ToastOptions): string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  dismiss: (id?: string) => void;
}

/**
 * Imperative toast API. Mount `<ark-toaster>` once, then call from anywhere:
 *
 * ```ts
 * toast.success("Saved", { heading: "Done" });
 * toast.error("Upload failed", { position: "top-right" });
 * const id = toast("Working…", { duration: 0 });
 * toast.dismiss(id);
 * ```
 */
export const toast: ToastFn = Object.assign(
  (message: string, options?: ToastOptions) => addToast(message, options),
  {
    success: withVariant("success"),
    error: withVariant("error"),
    warning: withVariant("warning"),
    info: withVariant("info"),
    loading: withVariant("loading"),
    dismiss: dismissToast,
  },
);
